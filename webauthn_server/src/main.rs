#[cfg(feature = "server")]
use actix_web::{web, App, HttpResponse, HttpServer};
#[cfg(feature = "server")]
use actix_cors::Cors;
#[cfg(feature = "server")]
use webauthn_lib::{Authenticator, Ctap2CreateRequest, Ctap2GetRequest};
#[cfg(feature = "server")]
use serde_json::json;

#[cfg(feature = "server")]
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();
    println!("Démarrage du serveur WebAuthn sur http://127.0.0.1:8080");

    let authenticator = web::Data::new(Authenticator::new());

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .supports_credentials();

        App::new()
            .app_data(authenticator.clone())
            .wrap(cors)
            .route("/ctap2/makeCredential", web::post().to(make_credential_handler))
            .route("/ctap2/getAssertion", web::post().to(get_assertion_handler))
            .route("/list-credentials", web::get().to(list_credentials_handler))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}

#[cfg(not(feature = "server"))]
fn main() {
    println!("La feature 'server' n'est pas activée. Utilisez `cargo run --features server` pour lancer le serveur.");
}

#[cfg(feature = "server")]
async fn make_credential_handler(
    payload: web::Bytes,
    auth: web::Data<Authenticator>,
) -> HttpResponse {
    let req: Ctap2CreateRequest = match serde_json::from_slice(&payload) {
        Ok(req) => req,
        Err(e) => {
            eprintln!("Erreur de désérialisation de la requête makeCredential: {}", e);
            return HttpResponse::BadRequest().json(json!({"error": format!("Invalid request: {}", e)}));
        }
    };

    match auth.make_credential(req) {
        Ok(response) => HttpResponse::Ok().json(response),
        Err(e) => {
            eprintln!("Erreur lors de make_credential: {}", e);
            HttpResponse::BadRequest().json(json!({"error": e}))
        }
    }
}

#[cfg(feature = "server")]
async fn get_assertion_handler(
    req: web::Json<Ctap2GetRequest>,
    auth: web::Data<Authenticator>,
) -> HttpResponse {
    match auth.get_assertion(req.0) { // Utilise .0 pour extraire la valeur de Json
        Ok(response) => HttpResponse::Ok().json(response),
        Err(e) => {
            eprintln!("Erreur lors de get_assertion: {}", e);
            HttpResponse::BadRequest().json(json!({"error": e}))
        }
    }
}

#[cfg(feature = "server")]
async fn list_credentials_handler(
    query: web::Query<std::collections::HashMap<String, String>>,
    auth: web::Data<Authenticator>,
) -> HttpResponse {
    let default_rp_id = "unknown".to_string();
    let rp_id = query.get("rp_id").unwrap_or(&default_rp_id);
    let response = auth.list_credentials(rp_id);
    HttpResponse::Ok().json(response)
}