use std::sync::RwLock;
use lazy_static::lazy_static;
use serde_json::Value;
use tauri::AppHandle;

use crate::configurations::configuration_base::{
    ConfigurationContext, ConfigurationDef, ExpectType,
};

pub const ZEROTIER_CONFIGURATION_NAME: &str = "zerotier";
lazy_static! {
    static ref ZEROTIER_TOKEN: RwLock<ConfigurationDef> = RwLock::new(ConfigurationDef::new(
        "Zerotier.Token".to_string(),
        Value::from(""),
        ExpectType::String
    ));
    static ref ZEROTIER_PORT: RwLock<ConfigurationDef> = RwLock::new(ConfigurationDef::new(
        "Zerotier.Port".to_string(),
        Value::from(""),
        ExpectType::String
    ));
    static ref ZEROTIER_NETWORKS: RwLock<ConfigurationDef> = RwLock::new(ConfigurationDef::new(
        "Zerotier.Networks".to_string(),
        Value::from(""),
        ExpectType::Array
    ));
}
pub fn init_context(app_handle: &AppHandle) -> ConfigurationContext {
    let mut context =
        ConfigurationContext::new(app_handle.clone(), ZEROTIER_CONFIGURATION_NAME.to_string());
    let zerotier_token = ZEROTIER_TOKEN.write().unwrap();
    zerotier_token.register_to_context(&mut context);
    let zerotier_port = ZEROTIER_PORT.write().unwrap();
    zerotier_port.register_to_context(&mut context);
    let zerotier_networks = ZEROTIER_NETWORKS.write().unwrap();
    zerotier_networks.register_to_context(&mut context);
    context.sync_from_file();
    context.store_config();
    context
}
