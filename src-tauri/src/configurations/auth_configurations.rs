use lazy_static::lazy_static;
use parking_lot::RwLock;
use tauri::AppHandle;
use crate::configurations::configuration_base::{ConfigurationContext, ConfigurationDef};

pub const AUTH_CONFIGURATION_NAME: &str = "auth";
lazy_static! {
    static ref ZEROTIER_TOKEN: RwLock<ConfigurationDef> = RwLock::new(ConfigurationDef::new(
        "ZerotierAuth.Token".to_string(),
        "".to_string()
    ));
    static ref ZEROTIER_PORT: RwLock<ConfigurationDef> = RwLock::new(ConfigurationDef::new(
        "ZerotierAuth.Port".to_string(),
        "".to_string()
    ));
}
pub fn init_context(app_handle: AppHandle) -> ConfigurationContext {
    let mut context = ConfigurationContext::new(app_handle.clone(), AUTH_CONFIGURATION_NAME.to_string());
    let zerotier_token = ZEROTIER_TOKEN.write();
    zerotier_token.register_to_context(&mut context);
    let zerotier_port = ZEROTIER_PORT.write();
    zerotier_port.register_to_context(&mut context);
    context.sync_from_file();
    context
}
