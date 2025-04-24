// Interception de navigator.credentials.create
const originalCreate = navigator.credentials.create;
navigator.credentials.create = async (options) => {
    const userIdArray = Array.from(new Uint8Array(options.publicKey.user.id));

    const ctap2Data = {
        type: "webauthn.create",
        clientDataJSON: {
            type: "webauthn.create",
            challenge: btoa(String.fromCharCode(...new Uint8Array(options.publicKey.challenge))),
            origin: window.location.origin,
            crossOrigin: false,
        },
        attestationData: {
            rp: options.publicKey.rp,
            user: {
                id: userIdArray,
                name: options.publicKey.user.name,
                displayName: options.publicKey.user.displayName,
            },
            pubKeyCredParams: options.publicKey.pubKeyCredParams,
        },
    };
    console.log("CTAP2: Données envoyées:", JSON.stringify(ctap2Data, null, 2));

    const response = await fetch("http://localhost:8080/ctap2/makeCredential", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ctap2Data),
    });
    const result = await response.json();
    console.log("CTAP2: Réponse du serveur reçue:", result);

    const rawId = base64ToArrayBuffer(result.credentialId);
    const id = arrayBufferToBase64(rawId); // Base64 standard avec + et /

    const credential = {
        id: id,
        rawId: rawId,
        response: {
            attestationObject: base64ToArrayBuffer(result.attestationObject),
            clientDataJSON: base64ToArrayBuffer(result.clientDataJSON),
        },
        type: "public-key",
        authenticatorAttachment: "platform",
        getClientExtensionResults: function () {
            return {};
        },
    };

    Object.setPrototypeOf(credential, PublicKeyCredential.prototype);
    console.log("id:", credential.id);
    console.log("rawId as base64:", arrayBufferToBase64(credential.rawId));
    console.log("Credential créé:", credential);

    return credential;
};

// Interception de navigator.credentials.get
const originalGet = navigator.credentials.get;
navigator.credentials.get = async (options) => {
    const ctap2Data = {
        type: "webauthn.get",
        clientDataJSON: {
            type: "webauthn.get",
            challenge: btoa(String.fromCharCode(...new Uint8Array(options.publicKey.challenge))),
            origin: window.location.origin,
            crossOrigin: false,
        },
        authenticatorData: {
            rpId: options.publicKey.rpId,
            allowCredentials: options.publicKey.allowCredentials?.map(cred => ({
                id: btoa(String.fromCharCode(...new Uint8Array(cred.id))),
                type: cred.type,
            })) || [],
            userVerification: options.publicKey.userVerification || "preferred",
        },
    };
    console.log("CTAP2: Envoi de données au serveur Rust:", ctap2Data);
    const response = await fetch("http://localhost:8080/ctap2/getAssertion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ctap2Data),
    });
    const result = await response.json();
    console.log("CTAP2: Réponse du serveur reçue:", result);

    const rawId = base64ToArrayBuffer(result.credentialId);
    const id = arrayBufferToBase64(rawId);

    const credential = {
        type: "public-key",
        id: id,
        rawId: rawId,
        response: {
            clientDataJSON: base64ToArrayBuffer(result.clientDataJSON),
            authenticatorData: base64ToArrayBuffer(result.authenticatorData),
            signature: base64ToArrayBuffer(result.signature),
            userHandle: result.userHandle ? base64ToArrayBuffer(result.userHandle) : null,
        },
        getClientExtensionResults: function() {
            return {};
        },
        authenticatorAttachment: "platform",
    };

    Object.setPrototypeOf(credential, PublicKeyCredential.prototype);
    console.log("Credential créé pour get:", credential);
    return credential;
};

// Conversion base64 en ArrayBuffer
function base64ToArrayBuffer(base64) {
    try {
        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    } catch (e) {
        console.error("Erreur lors du décodage base64:", e, "Chaîne fautive:", base64);
        throw e;
    }
}

// Conversion ArrayBuffer en base64 (standard avec + et /)
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    let base64 = btoa(binary);
    // Convertir en base64 URL-safe
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}