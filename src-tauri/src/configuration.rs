use std::collections::HashMap;
use std::string::ToString;
use log::debug;
use serde_json::{Value, Map};
use tauri::api::http::FormPart::File;
use tauri::AppHandle;
use crate::system::Configuration;

pub struct ConfigurationDef {
    key: String,
    default_value: String,
    on_change: Option<fn(ConfigurationDef, String)>,
}

impl ConfigurationDef {
    pub fn key(&self) -> &str {
        &self.key
    }
    pub fn default_value(&self) -> &str {
        &self.default_value
    }
    pub fn new(key: String, default_value: String) -> Self {
        Self { key, default_value, on_change: None }
    }

    pub fn on_change(&mut self, on_change: fn(ConfigurationDef, String)) {
        self.on_change = Option::Some(on_change);
    }
}

const FILE: &str = "resources/configuration.json";
pub const EVENT_CONFIG_CHANGE: &str = "event_config_change";
const SYSTEM_THEME: ConfigurationDef = ConfigurationDef::new("System.Theme".to_string(), "dark".to_string());

const CONFIGURATION: HashMap<String, String> = HashMap::new();

pub fn init_config(app_handle: AppHandle) {
    debug!("start to init configuration");
    init_item(SYSTEM_THEME);
    SYSTEM_THEME.on_change(|this, changed| {

    });
    const CONFIG_FROM_FILE: HashMap<String, String> = read_config_from_file(app_handle);
    for (key, value) in CONFIG_FROM_FILE {
        CONFIGURATION.insert(key, value)
    }
}

fn read_config_from_file(app_handle: AppHandle) -> HashMap<String, String> {
    let opt_configuration_json_file = app_handle
        .path_resolver()
        .resolve_resource(FILE);
    if (opt_configuration_json_file.is_none()) {
        debug!("{configuration_file_path} is not exist. init by default");
        return HashMap::new();
    }
    let json_file_path = opt_configuration_json_file.unwrap();
    let opt_file = std::fs::File::open(json_file_path);
    if (opt_file.is_err()) {
        let opt_err = opt_file.err().unwrap();
        debug!("{configuration_file_path} open fail {opt_err}. init by default");
        return HashMap::new();
    }
    let file = opt_file.unwrap();
    debug!("{configuration_file_path} is exist. start to resolve");
    return match serde_json::from_reader::<dyn std::io::Read, HashMap<String, String>>(file)
    {
        Ok(result) => {
            result
        }
        Err(err) => {
            debug!("{configuration_file_path} serde fail {err}. init by default");
            HashMap::new()
        }
    };
}

fn init_item(config: ConfigurationDef) {
    CONFIGURATION.insert(config.key, config.default_value);
}


