use serde_json::json;
use crate::models::{AppState, Ctap2CreateRequest, Ctap2GetRequest, Ctap2CreateResponse, Ctap2GetResponse};
use crate::utils::{hash_rp_id, encode_to_base64, generate_auth_data, generate_client_data_json};
use crate::crypto::{sign_with_key, KeyGenerationError};
use crate::manage::{select_or_create_credential, create_credential};
use sha2::{Digest, Sha256};
use base64::{engine::general_purpose, Engine as _};
use log::{debug, info};

pub fn make_credential(payload: &[u8], state: &AppState) -> Result<Ctap2CreateResponse, String> {
    let payload_str = String::from_utf8(payload.to_vec()).map_err(|e| format!("Payload non-UTF8: {}", e))?;
    info!("Payload brut reçu pour makeCredential: {}", payload_str);

    let req: Ctap2CreateRequest = serde_json::from_str(&payload_str).map_err(|e| format!("Désérialisation: {}", e))?;
    info!("Traitement de makeCredential: {:?}", req);

    let _challenge = general_purpose::STANDARD.decode(&req.client_data_json.challenge)
        .map_err(|e| format!("Décodage du challenge: {}", e))?;
    let rp_id = &req.attestation_data.rp.name;

    let credential = create_credential(
        rp_id,
        req.attestation_data.user.id.clone(),
        req.attestation_data.user.name.clone(),
        &req.attestation_data.pub_key_cred_params,
    ).map_err(|e| match e {
        KeyGenerationError::UnsupportedAlgorithm => "Unsupported algorithm".to_string(),
    })?;

    let rp_id_hash = hash_rp_id(rp_id);
    let auth_data = generate_auth_data(&rp_id_hash, &credential.credential_id, &credential.public_key, true);
    let client_data_json = generate_client_data_json(&req.client_data_json);
    let client_data_json_bytes = client_data_json.as_bytes();

    let attestation_object = serde_cbor::to_vec(&serde_json::json!({
        "fmt": "none",
        "attStmt": {},
        "authData": auth_data,
    })).map_err(|e| format!("Erreur CBOR: {}", e))?;

    let mut credentials = state.credentials.lock().map_err(|e| format!("Mutex lock failed: {}", e))?;
    credentials.insert(credential.credential_id.clone(), credential.clone());

    let response = Ctap2CreateResponse {
        credential_id: encode_to_base64(&credential.credential_id),
        attestation_object: encode_to_base64(&attestation_object),
        client_data_json: encode_to_base64(client_data_json_bytes),
    };

    Ok(response)
}

pub fn get_assertion(req: &Ctap2GetRequest, state: &AppState) -> Result<Ctap2GetResponse, String> {
    info!("Traitement de getAssertion: {:?}", req);

    let _challenge = general_purpose::STANDARD.decode(&req.client_data_json.challenge)
        .map_err(|e| format!("Décodage du challenge: {}", e))?;
    let rp_id = req.authenticator_data.as_ref().and_then(|d| d.rp_id.clone()).unwrap_or("unknown".to_string());
    let allow_credentials = req.authenticator_data.as_ref()
        .and_then(|d| d.allow_credentials.as_ref().map(|v| v.to_vec()))
        .unwrap_or_default();

    let mut credentials = state.credentials.lock().map_err(|e| format!("Mutex lock failed: {}", e))?;
    let credential = select_or_create_credential(&mut credentials, &rp_id, allow_credentials)
        .ok_or("No credentials found".to_string())?;

    let rp_id_hash = hash_rp_id(&rp_id);
    let auth_data = generate_auth_data(&rp_id_hash, &credential.credential_id, &credential.public_key, false);
    let client_data_json = generate_client_data_json(&req.client_data_json);
    let client_data_json_bytes = client_data_json.as_bytes();
    let client_data_hash = Sha256::digest(client_data_json_bytes).to_vec();

    let mut data_to_sign = Vec::new();
    data_to_sign.extend_from_slice(&auth_data);
    data_to_sign.extend_from_slice(&client_data_hash);

    let signature_bytes = sign_with_key(&credential.credential_id, &data_to_sign)
        .ok_or("Failed to sign data with key".to_string())?;

    let response = Ctap2GetResponse {
        credential_id: encode_to_base64(&credential.credential_id),
        authenticator_data: encode_to_base64(&auth_data),
        signature: encode_to_base64(&signature_bytes),
        client_data_json: encode_to_base64(client_data_json_bytes),
        user_handle: if credential.user_id.is_empty() {
            None
        } else {
            Some(encode_to_base64(&credential.user_id))
        },
    };

    Ok(response)
}

pub fn list_credentials(rp_id: &str, state: &AppState) -> serde_json::Value {
    info!("Liste des credentials demandée pour rp_id: {}", rp_id);

    let credentials = state.credentials.lock().expect("Mutex lock failed");
    let credential_list = crate::manage::list_credentials(&credentials, rp_id);
    debug!("Credentials trouvés pour rp_id '{}': {:?}", rp_id, credential_list);

    let response_data = if credential_list.is_empty() {
        debug!("Aucune donnée réelle trouvée pour rp_id '{}', renvoi de données d’exemple", rp_id);
        vec![
            ("example_id_1".to_string(), "Utilisateur Exemple 1".to_string()),
            ("example_id_2".to_string(), "Utilisateur Exemple 2".to_string()),
        ]
    } else {
        credential_list
    };

    json!({
        "credentials": response_data.iter().map(|(id, name)| json!({"id": id, "name": name})).collect::<Vec<_>>()
    })
}