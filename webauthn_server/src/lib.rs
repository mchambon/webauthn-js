// src/lib.rs
pub mod crypto;
pub mod handlers;
pub mod manage;
pub mod models;
pub mod utils;

use std::sync::Mutex;

pub use models::{AppState, Ctap2CreateRequest, Ctap2GetRequest, Ctap2CreateResponse, Ctap2GetResponse};
// Réexporte les structures nécessaires

use wasm_bindgen::prelude::*;
use log::info;


pub struct Authenticator {
    state: AppState,
}

impl Authenticator {
    pub fn new() -> Self {
        Authenticator {
            state: AppState {
                credentials: Mutex::new(std::collections::HashMap::new()),
            },
        }
    }

    pub fn make_credential(&self, request: Ctap2CreateRequest) -> Result<Ctap2CreateResponse, String> {
        let payload = serde_json::to_vec(&request).map_err(|e| format!("Serialization error: {}", e))?;
        handlers::make_credential(&payload, &self.state).map_err(|e| format!("Make credential error: {}", e))
    }

    pub fn get_assertion(&self, request: Ctap2GetRequest) -> Result<Ctap2GetResponse, String> {
        handlers::get_assertion(&request, &self.state).map_err(|e| format!("Get assertion error: {}", e))
    }

    pub fn list_credentials(&self, rp_id: &str) -> serde_json::Value {
        handlers::list_credentials(rp_id, &self.state)
    }
}

#[wasm_bindgen]
pub struct WasmAuthenticator {
    inner: Authenticator,
}

#[wasm_bindgen]
impl WasmAuthenticator {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        console_log::init_with_level(log::Level::Debug).unwrap();
        info!("WasmAuthenticator initialisé");
        WasmAuthenticator {
            inner: Authenticator::new(),
        }
    }

    #[wasm_bindgen]
    pub fn make_credential(&self, request: JsValue) -> Result<JsValue, JsValue> {
        let req: Ctap2CreateRequest = serde_wasm_bindgen::from_value(request).map_err(|e| JsValue::from_str(&e.to_string()))?;
        let result: Ctap2CreateResponse = self.inner.make_credential(req).map_err(|e| JsValue::from_str(&e))?;
        Ok(serde_wasm_bindgen::to_value(&result).unwrap())
    }

    #[wasm_bindgen]
    pub fn get_assertion(&self, request: JsValue) -> Result<JsValue, JsValue> {
        let req: Ctap2GetRequest = serde_wasm_bindgen::from_value(request).map_err(|e| JsValue::from_str(&e.to_string()))?;
        let result = self.inner.get_assertion(req).map_err(|e| JsValue::from_str(&e))?;
        Ok(serde_wasm_bindgen::to_value(&result).unwrap())
    }

    #[wasm_bindgen]
    pub fn list_credentials(&self, rp_id: String) -> JsValue {
        let result = self.inner.list_credentials(&rp_id);
        serde_wasm_bindgen::to_value(&result).unwrap()
    }
}