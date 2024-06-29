use lazy_static::lazy_static;
use std::collections::HashMap;
use std::error::Error;
use std::fs::OpenOptions;
use std::io::Write;
use std::string::ToString;
use std::sync::{LockResult, RwLock, RwLockReadGuard, RwLockWriteGuard};

use log::debug;
use parking_lot::lock_api::MutexGuard;
use parking_lot::{Mutex, RawMutex};
use serde::Serialize;

use tauri::{AppHandle, Manager};

use crate::auto_launch::{set_auto_launch, unset_auto_launch};
use crate::r::success_json;

pub const EVENT_CONFIG_CHANGE: &str = "event_config_change";

#[derive(Clone)]
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

    pub fn put_config_def(&mut self, key: String, def: ConfigurationDef) {
        self.configuration_def_map.insert(key, def);
    }

    pub fn get_config_def_mut(&mut self, key: String) -> Option<&mut ConfigurationDef> {
        self.configuration_def_map.get_mut(&key)
    }

    pub fn put_config(&mut self, key: String, value: String) {
        self.configuration.insert(key, value);
    }

    pub fn get_config(&self, key: &str) -> Option<&String> {
        self.configuration.get(key)
    }
    pub fn get_configs(&self) -> &HashMap<String, String> {
        &self.configuration
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
        Self {
            key,
            default_value,
            on_change_callback: None,
        }
    }
    pub fn on_change(
        &mut self,
        mut configuration: MutexGuard<RawMutex, ConfigurationContext>,
        app_handle: AppHandle,
        changed: String,
    ) {
        app_handle
            .emit_all(
                EVENT_CONFIG_CHANGE,
                success_json(ConfigurationChangeEvent {
                    key: self.key.clone(),
                    before: {
                        match configuration.get_config(self.key()) {
                            None => "".to_string(),
                            Some(value) => (*value).clone(),
                        }
                    },
                    after: changed.clone(),
                }),
            )
            .expect("event publish fail");
        debug!(
            "on_change:{}->{:?}",
            self.key,
            self.on_change_callback.is_some()
        );
        if self.on_change_callback.is_some() {
            self.on_change_callback.unwrap()(self, app_handle, changed.clone())
        }
        configuration.put_config(self.key.clone(), changed);
    }

    pub fn register_on_change(&mut self, on_change: fn(&mut ConfigurationDef, AppHandle, String)) {
        self.on_change_callback = Some(on_change);
    }

    fn put_config(
        &mut self,
        configuration: MutexGuard<RawMutex, ConfigurationContext>,
        app_handle: AppHandle,
        value: String,
    ) {
        self.on_change(configuration, app_handle, value);
    }
}

const FILE: &str = "resources/configuration.json";
const FILE_BAK: &str = "resources/configuration.bak.json";

lazy_static! {
    static ref CONFIGURATION_CONTEXT: Mutex<ConfigurationContext> =
        Mutex::new(ConfigurationContext::new());
    static ref SYSTEM_THEME: RwLock<ConfigurationDef> = RwLock::new(ConfigurationDef::new(
        "Theme.Current".to_string(),
        "dark".to_string()
    ));
    static ref THEME_SYNC_WITCH_SYSTEM: RwLock<ConfigurationDef> = RwLock::new(
        ConfigurationDef::new("Theme.IsSyncWithSystem".to_string(), "true".to_string())
    );
    static ref GENERAL_AUTO_START: RwLock<ConfigurationDef> = RwLock::new(ConfigurationDef::new(
        "General.AutoStart".to_string(),
        "false".to_string()
    ));
    pub static ref GENERAL_MINIMIZE_TO_TRAY: RwLock<ConfigurationDef> = RwLock::new(ConfigurationDef::new(
        "General.MinimizeToTray".to_string(),
        "false".to_string()
    ));
}
pub fn init_config(app_handle: AppHandle) {
    debug!("start to init configuration");
    // == area for put configuration ande register the on-change-callback
    // ==== demo for set an configuration item
    let mut system_theme = SYSTEM_THEME.write().unwrap();
    system_theme.register_on_change(|_this, _app_handle, _changed| {
        //  this is demo for config change handle
    });
    // init must be called after register the on-change-callback
    init_item(&mut system_theme);
    // ==== end demo
    // == init THEME_SYNC_WITCH_SYSTEM

    // == init GENERAL_AUTO_START
    let mut general_auto_start = GENERAL_AUTO_START.write().unwrap();
    general_auto_start.register_on_change(|_this, app_handle, changed| {
        debug!("auto start change to {}", changed);
        if changed == "true" {
            set_auto_launch(app_handle.clone())
        } else {
            unset_auto_launch(app_handle.clone())
        }
    });
    init_item(&mut general_auto_start);
    // == INIT GENERAL_MINIMIZE_TO_TRAY
    init_item(&mut GENERAL_MINIMIZE_TO_TRAY.write().unwrap());

    // ==
    debug!("read configuration from file");
    let config_from_file: HashMap<String, String> = try_read_config_from_file(app_handle.clone());
    for (key, value) in config_from_file {
        put_config(app_handle.clone(), key, value)
    }
    store_config(app_handle.clone(), FILE);
}

fn open_config_file(
    app_handle: AppHandle,
    file: &str,
    truncate: bool,
) -> Result<std::fs::File, std::io::Error> {
    let opt_configuration_json_file = app_handle.path_resolver().resolve_resource(file);
    if opt_configuration_json_file.is_none() {
        debug!("{file} is not exist.");
        return Err(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "file not found",
        ));
    }
    let json_file_path = opt_configuration_json_file.unwrap();
    let mut open_options = OpenOptions::new();
    open_options.read(true).write(true).create(true);
    if truncate {
        open_options.truncate(true);
    }
    open_options.open(json_file_path)
}

fn open_config_file_truncate(
    app_handle: AppHandle,
    file: &str,
) -> Result<std::fs::File, std::io::Error> {
    open_config_file(app_handle, file, true)
}

fn open_config_file_default(
    app_handle: AppHandle,
    file: &str,
) -> Result<std::fs::File, std::io::Error> {
    open_config_file(app_handle, file, false)
}

fn read_config_from_file(
    app_handle: AppHandle,
    file: &str,
) -> Result<HashMap<String, String>, Box<dyn Error>> {
    let opt_file = open_config_file_default(app_handle, file);
    if opt_file.is_err() {
        let opt_err = opt_file.err().unwrap();
        debug!("{file} open fail {opt_err}. ");
        return Err(opt_err.into());
    }
    debug!("{file} is exist. start to resolve");
    let confg: HashMap<String, String> = serde_json::from_reader(opt_file.unwrap())?;
    Ok(confg)
}

fn try_read_config_from_file(app_handle: AppHandle) -> HashMap<String, String> {
    let mut config_file = read_config_from_file(app_handle.clone(), FILE);
    if config_file.is_err() {
        config_file = read_config_from_file(app_handle.clone(), FILE_BAK);
    }
    if config_file.is_ok() {
        return config_file.unwrap();
    }
    debug!("can not read config from file.init by default!");
    HashMap::new()
}

fn store_config(app_handle: AppHandle, file: &str) {
    let opt_file = open_config_file_truncate(app_handle, file);
    if opt_file.is_err() {
        let opt_err = opt_file.err().unwrap();
        debug!("{FILE} open fail {opt_err}. fail to store config");
        return;
    }
    let mut file = opt_file.unwrap();
    let config_json = serde_json::to_string(&get_config_map()).unwrap();
    file.write_all(config_json.as_bytes())
        .expect("fail to write config to config file");
}

fn init_item(config: &mut RwLockWriteGuard<ConfigurationDef>) {
    let key = config.key.clone();
    debug!("init item:{key}");
    let default_value = config.default_value().to_string();
    let mut configuration_context = CONFIGURATION_CONTEXT.lock();
    configuration_context.put_config_def(key.clone(), config.to_owned());
    configuration_context.put_config(key, default_value);
}

pub fn put_config(app_handle: AppHandle, key: String, value: String) {
    let mut configuration_context = CONFIGURATION_CONTEXT.lock();
    let def_opt = configuration_context
        .get_config_def_mut(key.clone())
        .cloned();
    match def_opt {
        Some(mut def) => {
            def.put_config(configuration_context, app_handle.clone(), value);
        }
        None => {
            configuration_context.put_config(key, value);
        }
    }
}

fn get_config_map() -> HashMap<String, String> {
    let configuration_context = CONFIGURATION_CONTEXT.lock();
    let data = configuration_context.get_configs();
    data.clone()
}

pub fn get_config_dy_def(config_def: LockResult<RwLockReadGuard<ConfigurationDef>>) -> String {
    let config_def = config_def.unwrap();
    let config_map = get_config_map();
    let option = config_map.get(config_def.key());
    option.unwrap_or(&config_def.default_value().to_string()).into()
}

pub fn try_store_bak(app_handle: AppHandle) {
    store_config(app_handle.clone(), FILE_BAK);
}

#[tauri::command]
pub fn put_config_command(app_handle: AppHandle, payload: String) -> String {
    debug!("accept command:payload[{payload}]");
    let config: HashMap<String, String> =
        serde_json::from_str(&*payload).expect("value type of configuration is String only");
    for (key, value) in &config {
        put_config(app_handle.clone(), key.clone(), value.clone());
    }
    store_config(app_handle.clone(), FILE);
    success_json("")
}

#[tauri::command]
pub fn get_config() -> String {
    let data = get_config_map();
    return success_json(data);
}
