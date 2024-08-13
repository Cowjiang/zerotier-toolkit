use std::collections::HashMap;

use log::debug;

use crate::configurations::configurations_service::{
    get_configuration_context, put_configuration_context,
};
use crate::r::{fail_message_json, success_json};

use super::configurations_service::reset_configurations_context_to_default;

#[tauri::command]
pub fn get_configurations(name: String) -> String {
    let context = get_configuration_context(&name);
    return success_json(context.unwrap().get_configs());
}

#[tauri::command]
pub fn put_configurations(name: String, payload: String) -> String {
    debug!("accept command:payload[{payload}]");
    let configs: HashMap<String, String> =
        serde_json::from_str(&*payload).expect("value type of configuration is String only");
    match put_configuration_context(&name, configs) {
        Ok(..) => success_json(""),
        Err(e) => fail_message_json(&e),
    }
}

#[tauri::command]
pub fn reset_configurations(name: String) -> String {
    reset_configurations_context_to_default(&name);
    success_json("")
}
