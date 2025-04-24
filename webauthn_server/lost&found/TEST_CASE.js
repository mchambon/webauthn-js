// Create Credentials
navigator.credentials.create({
    "publicKey": {
        "rp": {
            "name": "FIDO 2 Unipi",
            "id": "gramthanos.github.io"
        },
        "user": {
            "name": "john.smith@email.com",
            "displayName": "J. Smith",
            "id": fb64("am9obi5zbWl0aEBlbWFpbC5jb20") // Uint8Array
        },
        "challenge": fb64("Dw4NDAsKCQgHBgUEAwIBAA"), // Uint8Array
        "pubKeyCredParams": [
            {"type": "public-key", "alg": -7}, // ECDSA w/ SHA-256
            {"type": "public-key", "alg": -37}, // RSASSA-PSS w/ SHA-256
            {"type": "public-key", "alg": -257} // RSASSA-PKCS1-v1_5 using SHA-256
        ],
        "timeout": 120000
    }
}).then((credentials) => {
    console.log(credentials);
});

function fb64(x) { // Base64 to Uint8Array
    return Uint8Array.from(atob(x.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
};
========================================
GramThanos9wW53O0Axa7SlnqzUmOvuXGdy4DXzach91ELfHG58uiuWZJ-C9pVUs874FeTCv38R9DZ6AMdpaEl2JemiBNVC1cUJyop6T83zLNAeU14BH1hF0GMJUGoucybl5EMXtazG1TLx_G9oj0X2K_gLU2nh3bK_XcNWnDTVFOiFJzUeNGnm-6f35oCrwkv3_ucRstBEJtdfSrN74H7eMMq6UwnEIRu8llmGcwJDFQMMGgNzfKx0D2-JtmQX1VG1yB5V0uHDLuv35kvY0i0e6-a5BzG4azu6oHFK2HUrYCvzKlGRtSrqe-tLqLJ8MxBclhoC0Mi4cu1rCFiWJ4LXuygaj2icQFaYeGWDGsqrdVQ"

========================================

{
    "v": 1,
    "r": "gramthanos.github.io",
    "u": "am9obi5zbWl0aEBlbWFpbC5jb20",
    "c": "m8keufwo",
    "a": -7,
    "k": {
        "x": "S5g3PTXyK0BfRm0CvpzDLOmIX1sPunhFbHmYNXtbDE0",
        "y": "A6wYjd3KkEtcrxWzJKPmYWJfqlxLF6hVjfKZeDG7cG8",
        "crv": "P-256",
        "ext": true,
        "kty": "EC",
        "key_ops": [
            "verify"
        ]
    }
}
==========================================
{
    "type": "public-key",
    "id": "GramThanos9wW53O0Axa7SlnqzUmOvuXGdy4DXzach91ELfHG58uiuWZJ-C9pVUs874FeTCv38R9DZ6AMdpaEl2JemiBNVC1cUJyop6T83zLNAeU14BH1hF0GMJUGoucybl5EMXtazG1TLx_G9oj0X2K_gLU2nh3bK_XcNWnDTVFOiFJzUeNGnm-6f35oCrwkv3_ucRstBEJtdfSrN74H7eMMq6UwnEIRu8llmGcwJDFQMMGgNzfKx0D2-JtmQX1VG1yB5V0uHDLuv35kvY0i0e6-a5BzG4azu6oHFK2HUrYCvzKlGRtSrqe-tLqLJ8MxBclhoC0Mi4cu1rCFiWJ4LXuygaj2icQFaYeGWDGsqrdVQ",
    "rawId": GramThanos9wW53O0Axa7SlnqzUmOvuXGdy4DXzach91ELfHG58uiuWZJ-C9pVUs874FeTCv38R9DZ6AMdpaEl2JemiBNVC1cUJyop6T83zLNAeU14BH1hF0GMJUGoucybl5EMXtazG1TLx_G9oj0X2K_gLU2nh3bK_XcNWnDTVFOiFJzUeNGnm-6f35oCrwkv3_ucRstBEJtdfSrN74H7eMMq6UwnEIRu8llmGcwJDFQMMGgNzfKx0D2-JtmQX1VG1yB5V0uHDLuv35kvY0i0e6-a5BzG4azu6oHFK2HUrYCvzKlGRtSrqe-tLqLJ8MxBclhoC0Mi4cu1rCFiWJ4LXuygaj2icQFaYeGWDGsqrdVQ, // ArrayBuffer(274)
    "response": {
        "clientDataJSON": eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiRHc0TkRBc0tDUWdIQmdVRUF3SUJBQSIsIm9yaWdpbiI6Imh0dHBzOi8vZ3JhbXRoYW5vcy5naXRodWIuaW8iLCJjcm9zc09yaWdpbiI6ZmFsc2UsInZpcnR1YWxfYXV0aGVudGljYXRvciI6IkdyYW1UaGFub3MgJiBVbml2ZXJzaXR5IG9mIFBpcmFldXMifQ, // ArrayBuffer(184)
        "attestationObject": o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YVkBlqLvhUwoa0ewDvgtCl7bGsTdUCF-Azqv2gpmHinlF55WRQAAAAF2aXJ0dWFsLWF1dGhuLXYxARIatqZOFqeiz3Bbnc7QDFrtKWerNSY6-5cZ3LgNfNpyH3UQt8cbny6K5Zkn4L2lVSzzvgV5MK_fxH0NnoAx2loSXYl6aIE1ULVxQnKinpPzfMs0B5TXgEfWEXQYwlQai5zJuXkQxe1rMbVMvH8b2iPRfYr-AtTaeHdsr9dw1acNNUU6IUnNR40aeb7p_fmgKvCS_f-5xGy0EQm119Ks3vgft4wyrpTCcQhG7yWWYZzAkMVAwwaA3N8rHQPb4m2ZBfVUbXIHlXS4cMu6_fmS9jSLR7r5rkHMbhrO7qgcUrYdStgK_MqUZG1Kup760uosnwzEFyWGgLQyLhy7WsIWJYngte7KBqPaJxAVph4ZYMayqt1VpQECAyYgASFYIEuYNz018itAX0ZtAr6cwyzpiF9bD7p4RWx5mDV7WwxNIlggA6wYjd3KkEtcrxWzJKPmYWJfqlxLF6hVjfKZeDG7cG8 // ArrayBuffer(437)
    }
}