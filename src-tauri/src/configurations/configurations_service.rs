use std::collections::HashMap;

use lazy_static::lazy_static;
use parking_lot::RwLock;
use tauri::AppHandle;

use crate::configurations::configuration_base::ConfigurationContext;

lazy_static! {
    static ref CONFIGURATION_GROUPS: RwLock<Vec<ConfigurationContext>> = RwLock::new(Vec::new());
}

pub fn init_configuration_context(app_handle: &AppHandle) {
    let mut configuration_groups = CONFIGURATION_GROUPS.write();
    let system_config_context =
        crate::configurations::system_configurations::init_context(&app_handle);
    configuration_groups.push(system_config_context);
    let auth_config_context =
        crate::configurations::zerotier_configurations::init_context(&app_handle);
    configuration_groups.push(auth_config_context);
}

pub fn get_configuration_context(name: &String) -> Option<ConfigurationContext> {
    let configuration_groups = CONFIGURATION_GROUPS.read();
    for context in configuration_groups.iter() {
        if context.name() == name {
            return Some(context.clone());
        }
    }
    None
}

pub fn put_configuration_context(
    name: &String,
    configs: HashMap<String, String>,
) -> Result<(), String> {
    let mut configuration_groups = CONFIGURATION_GROUPS.write();
    for context in configuration_groups.iter_mut() {
        if context.name() == name {
            for (key, value) in &configs {
                context.put_config(key.clone(), value.clone());
            }
            context.store_config();
            return Ok(());
        }
    }
    Err(format!("configuration [{name}] not found"))
}

pub fn backup_all() {
    let mut configuration_groups = CONFIGURATION_GROUPS.write();
    configuration_groups
        .iter_mut()
        .for_each(|v| v.store_config_bak());
}
