use lazy_static::lazy_static;
use serde_json::Value;
use std::collections::HashMap;
use std::sync::RwLock;
use tauri::AppHandle;

use crate::configurations::configuration_base::ConfigurationContext;

lazy_static! {
    static ref CONFIGURATION_GROUPS: RwLock<Vec<ConfigurationContext>> = RwLock::new(Vec::new());
}

pub fn init_configuration_context(app_handle: &AppHandle) {
    let mut configuration_groups = CONFIGURATION_GROUPS.write().unwrap();
    let system_config_context =
        crate::configurations::system_configurations::init_context(&app_handle);
    configuration_groups.push(system_config_context);
    let auth_config_context =
        crate::configurations::zerotier_configurations::init_context(&app_handle);
    configuration_groups.push(auth_config_context);
}

pub fn get_configuration_context(name: &str) -> Option<ConfigurationContext> {
    let configuration_groups = CONFIGURATION_GROUPS.read().unwrap();
    for context in configuration_groups.iter() {
        if context.name() == name {
            return Some(context.clone());
        }
    }
    None
}

pub fn put_configuration_context(
    name: &String,
    configs: HashMap<String, Value>,
) -> Result<(), String> {
    let mut configuration_groups = CONFIGURATION_GROUPS.write().unwrap();
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

pub fn reset_configurations_context_to_default(name: &String) {
    let mut configuration_groups = CONFIGURATION_GROUPS.write().unwrap();
    if name.eq("all") {
        configuration_groups
            .iter_mut()
            .for_each(|v| v.reset_to_default());
        return;
    }
    configuration_groups
        .iter_mut()
        .find(|context| context.name() == name)
        .map(|context| context.reset_to_default());
}

pub fn backup_all() {
    let mut configuration_groups = CONFIGURATION_GROUPS.write().unwrap();
    configuration_groups
        .iter_mut()
        .for_each(|v| v.store_config_bak());
}
