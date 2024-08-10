use std::collections::HashMap;
use log::debug;
use crate::configurations::configurations_service::get_configuration_context;
use crate::r::{fail_message_json, success_json};

#[tauri::command]
pub fn get_configurations(name: String) -> String {
    let context = get_configuration_context(name);
    return success_json(context.unwrap().get_configs());
}


#[tauri::command]
pub fn put_configurations(name: String, payload: String) -> String {
    debug!("accept command:payload[{payload}]");
    let config: HashMap<String, String> =
        serde_json::from_str(&*payload).expect("value type of configuration is String only");
    let context = get_configuration_context(name.clone());
    if context.is_none() {
        return fail_message_json(format!("configurations {} is not found", name).as_str());
    }
    let mut context = context.unwrap();
    for (key, value) in &config {
        context.put_config(key.clone(), value.clone());
    }
    context.store_config();
    success_json("")
}
