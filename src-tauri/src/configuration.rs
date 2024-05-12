use std::collections::HashMap;
use std::io::Write;
use std::string::ToString;
use std::sync::{RwLock, RwLockWriteGuard};
use lazy_static::lazy_static;

use log::debug;
use parking_lot::Mutex;
use serde::Serialize;

use tauri::{AppHandle, Manager};

use crate::r::{success_json};

pub const EVENT_CONFIG_CHANGE: &str = "event_config_change";

pub struct ConfigurationContext {
    configuration_def_map: HashMap<String, ConfigurationDef>,
    configuration: HashMap<String, String>,
}

#[derive(Clone)]
pub struct ConfigurationDef {
    key: String,
    default_value: String,
    on_change_callback: Option<fn(&mut ConfigurationDef, AppHandle, String)>,
}

#[derive(Serialize)]
pub struct ConfigurationChangeEvent {
    key: String,
    before: String,
    after: String,
}

impl ConfigurationContext {
    pub fn new() -> Self {
        Self {
            configuration_def_map: HashMap::new(),
            configuration: HashMap::new(),
        }
    }

    pub fn configuration_def_map(&mut self) -> &mut HashMap<String, ConfigurationDef> {
        &mut self.configuration_def_map
    }
    pub fn configuration(&mut self) -> &mut HashMap<String, String> {
        &mut self.configuration
    }
}

impl ConfigurationDef {
    pub fn key(&self) -> &str {
        &self.key
    }
    pub fn default_value(&self) -> &str {
        &self.default_value
    }
    pub fn new(key: String, default_value: String) -> Self {
        Self { key, default_value, on_change_callback: None }
    }
    pub fn on_change(&mut self, app_handle: AppHandle, changed: String) {
        app_handle.emit_all(EVENT_CONFIG_CHANGE, success_json(ConfigurationChangeEvent {
            key: self.key.clone(),
            before: {
                let mut configuration_context = CONFIGURATION_CONTEXT.lock();
                let configuration = configuration_context.configuration();
                match configuration.get(self.key()) {
                    None => { "".to_string() }
                    Some(value) => { (*value).clone() }
                }
            },
            after: changed.clone(),
        })).expect("event publish fail");
        if self.on_change_callback.is_some() {
            self.on_change_callback.unwrap()(self, app_handle, changed.clone())
        }
        self.after_change(changed)
    }

    pub fn after_change(&mut self, changed: String) {
        let mut configuration_context = CONFIGURATION_CONTEXT.lock();
        let configuration = configuration_context.configuration();
        configuration.insert(self.key.clone(), changed);
    }
    pub fn register_on_change(&mut self, on_change: fn(&mut ConfigurationDef, AppHandle, String)) {
        self.on_change_callback = Some(on_change);
    }

    fn put_config(&mut self, app_handle: AppHandle, value: String) {
        self.on_change(app_handle, value);
    }
}

const FILE: &str = "resources/configuration.json";

lazy_static! {
    static ref CONFIGURATION_CONTEXT: Mutex<ConfigurationContext> = Mutex::new(ConfigurationContext::new());
    static ref SYSTEM_THEME: RwLock<ConfigurationDef> = RwLock::new(ConfigurationDef::new("System.Theme".to_string(), "dark".to_string()));

}
pub fn init_config(app_handle: AppHandle) {
    debug!("start to init configuration");
    // == area for put configuration ande register the on-change-callback
    let mut system_theme = SYSTEM_THEME.write().unwrap();
    init_item(&mut system_theme, app_handle.clone());
    system_theme.register_on_change(|_this, _app_handle, _changed| {
        //  this is demo for config change handle
    });
    // ==
    debug!("read configuration from file");
    let config_from_file: HashMap<String, String> = read_config_from_file(app_handle.clone());
    for (key, value) in config_from_file {
        put_config(app_handle.clone(), key, value)
    }
}

fn open_config_file(app_handle: AppHandle) -> Result<std::fs::File, std::io::Error> {
    let opt_configuration_json_file = app_handle
        .path_resolver()
        .resolve_resource(FILE);
    if opt_configuration_json_file.is_none() {
        debug!("{FILE} is not exist. init by default");
        return Err(std::io::Error::new(std::io::ErrorKind::NotFound, "file not found"));
    }
    let json_file_path = opt_configuration_json_file.unwrap();
    std::fs::File::open(json_file_path)
}

fn read_config_from_file(app_handle: AppHandle) -> HashMap<String, String> {
    let opt_file = open_config_file(app_handle);
    if opt_file.is_err() {
        let opt_err = opt_file.err().unwrap();
        debug!("{FILE} open fail {opt_err}. init by default");
        return HashMap::new();
    }
    let file = opt_file.unwrap();
    debug!("{FILE} is exist. start to resolve");
    return match serde_json::from_reader(file)
    {
        Ok(result) => {
            result
        }
        Err(err) => {
            debug!("{FILE} serde fail {err}. init by default");
            HashMap::new()
        }
    };
}

fn store_config(app_handle: AppHandle) {
    let opt_file = open_config_file(app_handle);
    if opt_file.is_err() {
        let opt_err = opt_file.err().unwrap();
        debug!("{FILE} open fail {opt_err}. fail to store config");
        return;
    }
    let mut file = opt_file.unwrap();
    let config_json = serde_json::to_string(&get_config_map()).unwrap();
    file.write_all(config_json.as_bytes()).expect("fail to write config to config file");
}

fn init_item(config: &mut RwLockWriteGuard<ConfigurationDef>, app_handle: AppHandle) {
    let key = config.key.clone();
    debug!("init item:{key}");
    let default_value = config.default_value().to_string();
    let mut configuration_context = CONFIGURATION_CONTEXT.lock();
    config.put_config(app_handle.clone(), default_value);
    let configuration_def_map = configuration_context.configuration_def_map();
    configuration_def_map.insert(key, config.clone());
}

pub fn put_config(app_handle: AppHandle, key: String, value: String) {
    let mut configuration_context = CONFIGURATION_CONTEXT.lock();
    let configuration_def_map: &mut HashMap<String, ConfigurationDef> = configuration_context.configuration_def_map();
    if configuration_def_map.contains_key(&key.clone()) {
        let configuration_def = configuration_def_map.get_mut(&key).unwrap();
        configuration_def.put_config(app_handle.clone(), value);
    } else {
        let configuration = configuration_context.configuration();
        configuration.insert(key, value);
    }
}

#[tauri::command]
pub fn put_config_command(app_handle: AppHandle, payload: String) -> String {
    debug!("accept command:payload[{payload}]");
    let config: HashMap<String, String> = serde_json::from_str(&*payload)
        .expect("value type of configuration is String only");
    for (key, value) in &config {
        put_config(app_handle.clone(), key.clone(), value.clone());
    }
    store_config(app_handle.clone());
    success_json("")
}

fn get_config_map() -> HashMap<String, String> {
    let mut configuration_context = CONFIGURATION_CONTEXT.lock();
    let data = configuration_context.configuration();
    data.clone()
}


#[tauri::command]
pub fn get_config() -> String {
    let data = get_config_map();
    return success_json(data);
}

