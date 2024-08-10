use lazy_static::lazy_static;
use parking_lot::RwLock;
use tauri::AppHandle;
use crate::configurations::configuration_base::ConfigurationContext;
lazy_static! {
    static ref CONFIGURATION_GROUPS:RwLock<Vec<ConfigurationContext>> = RwLock::new(Vec::new());
}


pub fn init_configuration_context(app_handle: AppHandle) {
    let mut configuration_groups = CONFIGURATION_GROUPS.write();
    let system_config_context = crate::configurations::system_configurations::init_context(app_handle.clone());
    configuration_groups.push(system_config_context);
    let auth_config_context = crate::configurations::auth_configurations::init_context(app_handle.clone());
    configuration_groups.push(auth_config_context);
}


pub fn get_configuration_context(name: String) -> Option<ConfigurationContext> {
    let configuration_groups = CONFIGURATION_GROUPS.read();
    for context in configuration_groups.iter() {
        if context.name() == name {
            return Some(context.clone());
        }
    }
    None
}

pub fn backup_all() {
    let mut configuration_groups = CONFIGURATION_GROUPS.write();
    configuration_groups.iter_mut().for_each(|v| v.store_config_bak());
}
