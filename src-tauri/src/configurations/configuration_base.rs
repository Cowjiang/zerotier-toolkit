use std::collections::HashMap;
use std::error::Error;
use std::io::Write;
use std::path::MAIN_SEPARATOR;

use log::debug;
use serde::Serialize;
use tauri::{AppHandle, Manager};

use crate::r::success_json;
use crate::util::resources_file_util::{open_config_file_default, open_config_file_truncate};

pub const EVENT_CONFIG_CHANGE: &str = "event_config_change";
const CONFIG_DIR: &str = "config";

#[derive(Clone)]
pub struct ConfigurationContext {
    name: String,
    configuration_def_map: HashMap<String, ConfigurationDef>,
    configurations: HashMap<String, String>,
    app_handle: AppHandle,
    file_name: String,
    file_bak_name: String,
}

#[derive(Clone, Debug)]
pub struct ConfigurationDef {
    key: String,
    default_value: String,
    on_change_callback: Option<fn(&ConfigurationDef, AppHandle, String)>,
    callback_anyway: bool,
}

#[derive(Serialize)]
pub struct ConfigurationChangeEvent {
    key: String,
    before: String,
    after: String,
}

impl ConfigurationContext {
    pub fn new(app_handle: AppHandle, name: String) -> Self {
        Self {
            name: name.clone(),
            configuration_def_map: HashMap::new(),
            configurations: HashMap::new(),
            app_handle,
            file_name: format!("{}{}{}_config.json", CONFIG_DIR, MAIN_SEPARATOR, name.clone()),
            file_bak_name: format!("{}{}{}_config.bak.json", CONFIG_DIR, MAIN_SEPARATOR, name),
        }
    }

    pub fn put_config_def(&mut self, key: String, def: ConfigurationDef) {
        self.configuration_def_map.insert(key, def);
    }
    fn read_config_from_file(
        &mut self,
        file_name: &str,
    ) -> Result<HashMap<String, String>, Box<dyn Error>> {
        let opt_file = open_config_file_default(&self.app_handle, file_name);
        if opt_file.is_err() {
            let opt_err = opt_file.err().unwrap();
            debug!("{file_name} open fail {opt_err}. ");
            return Err(opt_err.into());
        }
        debug!("{file_name} is exist. start to resolve");
        let config: HashMap<String, String> = serde_json::from_reader(opt_file.unwrap())?;
        Ok(config)
    }
    pub fn try_read_config_from_file(&mut self) -> HashMap<String, String> {
        let file_name = self.file_name.clone();
        let file_bak_name = self.file_bak_name.clone();
        let mut config_file = self.read_config_from_file(&file_name);
        if config_file.is_err() {
            config_file = self.read_config_from_file(&file_bak_name);
        }
        if config_file.is_ok() {
            return config_file.unwrap();
        }
        debug!("can not read config from file.init by default!");
        HashMap::new()
    }
    pub fn store_config_to_file(&mut self, file: &str) {
        let opt_file = open_config_file_truncate(&self.app_handle, file);
        if opt_file.is_err() {
            let opt_err = opt_file.err().unwrap();
            debug!("{file} open fail {opt_err}. fail to store config");
            return;
        }
        let mut file = opt_file.unwrap();
        let config_json = serde_json::to_string(self.get_configs()).unwrap();
        file.write_all(config_json.as_bytes())
            .expect("fail to write config to config file");
    }
    pub fn store_config(&mut self) {
        self.store_config_to_file(&self.file_name.clone())
    }
    pub fn store_config_bak(&mut self) {
        self.store_config_to_file(&self.file_bak_name.clone())
    }
    pub fn sync_from_file(&mut self) {
        debug!("sync configuration from file");
        self.configurations = self.try_read_config_from_file();
        let config_defs = self.configuration_def_map.values();
        let config_to_update = config_defs
            .into_iter()
            .map(|config_def| {
                let value = self.get_config_by_def(config_def);
                (config_def.key.clone(), value)
            })
            .collect::<Vec<_>>();
        for item in config_to_update {
            let (key, value) = item;
            self.put_config(key, value);
        }
        self.store_config();
    }

    pub fn put_config(&mut self, key: String, value: String) {
        self.on_change(key.clone(), value.clone());
        self.configurations.insert(key, value);
    }
    fn on_change(&self, key: String, value: String) {
        let config_def = &self.get_config_def(key);
        if config_def.is_none() {
            return;
        }
        let config_def = config_def.as_ref().unwrap();
        let before = self
            .get_config(config_def.key())
            .unwrap_or(&config_def.default_value);
        let has_changed = before.eq(&value);
        if has_changed && !config_def.callback_anyway {
            return;
        }
        let app_handle = self.app_handle.clone();
        app_handle
            .emit_all(
                EVENT_CONFIG_CHANGE,
                success_json(ConfigurationChangeEvent {
                    key: config_def.key.clone(),
                    before: before.clone(),
                    after: value.clone(),
                }),
            )
            .expect("event publish fail");
        debug!(
            "on_change:{}->has callback:{:?} change to {:?}",
            config_def.key,
            config_def.on_change_callback.is_some(),
            value
        );
        let _ = config_def.on_change_callback.is_some_and(|callback| {
            callback(*config_def, app_handle, value.clone());
            true
        });
    }

    fn get_config_def(&self, key: String) -> Option<&ConfigurationDef> {
        let config_def = self.configuration_def_map.get(&key);
        config_def
    }

    pub fn get_config(&self, key: &str) -> Option<&String> {
        return self.configurations.get(key).or_else(|| {
            let config_def = self.get_config_def(key.to_string());
            config_def.map(|config_def| &config_def.default_value)
        });
    }

    pub fn get_config_by_def(&self, configuration_def: &ConfigurationDef) -> String {
        let key = &configuration_def.key;
        let value = self.configurations.get(&key.clone());
        match value {
            Some(value) => { value.clone() }
            None => configuration_def.default_value.clone(),
        }
    }
    pub fn get_configs(&self) -> &HashMap<String, String> {
        &self.configurations
    }

    pub fn name(&self) -> &str {
        &self.name
    }
}

impl ConfigurationDef {
    pub fn key(&self) -> &str {
        &self.key
    }
    pub fn new(key: String, default_value: String) -> Self {
        Self {
            key,
            default_value,
            on_change_callback: None,
            callback_anyway: false,
        }
    }
    pub fn register_on_change(&mut self, on_change: fn(&ConfigurationDef, AppHandle, String)) {
        self.on_change_callback = Some(on_change);
    }

    pub(crate) fn callback_anyway(&mut self, value: bool) {
        self.callback_anyway = value;
    }

    pub fn register_to_context(&self, context: &mut ConfigurationContext) {
        context.put_config_def(self.key.to_string(), self.clone());
    }
}
