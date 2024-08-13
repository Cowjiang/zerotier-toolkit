use lazy_static::lazy_static;
use log::debug;
use parking_lot::RwLock;
use serde_json::Value;
use tauri::AppHandle;

use crate::auto_launch::init_and_set_auto_launch;
use crate::configurations::configuration_base::{ConfigurationContext, ConfigurationDef, ExpectType};
use crate::system_tray::{destroy_system_tray, init_system_tray};

pub const SYSTEM_CONFIGURATION_NAME: &str = "system";
lazy_static! {
    static ref SYSTEM_THEME: RwLock<ConfigurationDef> = RwLock::new(ConfigurationDef::new(
        "Theme.Current".to_string(),
        Value::from("dark"),
        ExpectType::String
    ));
    static ref THEME_SYNC_WITH_SYSTEM: RwLock<ConfigurationDef> = RwLock::new(
        ConfigurationDef::new("Theme.IsSyncWithSystem".to_string(), Value::from(true),ExpectType::Boolean)
    );
    static ref GENERAL_AUTO_START: RwLock<ConfigurationDef> = RwLock::new(ConfigurationDef::new(
        "General.AutoStart".to_string(),
        Value::from(false),
        ExpectType::Boolean
    ));
    pub static ref GENERAL_ENABLE_TRAY: RwLock<ConfigurationDef> = RwLock::new(
        ConfigurationDef::new("General.EnableTray".to_string(), Value::from(false),ExpectType::Boolean)
    );
    pub static ref GENERAL_MINIMIZE_TO_TRAY: RwLock<ConfigurationDef> = RwLock::new(
        ConfigurationDef::new("General.MinimizeToTray".to_string(), Value::from(false),ExpectType::Boolean)
    );
}

pub fn init_context(app_handle: &AppHandle) -> ConfigurationContext {
    let mut context = ConfigurationContext::new(app_handle.clone(), SYSTEM_CONFIGURATION_NAME.to_string());
    debug!("start to init configuration");
    // == area for put configuration ande register the on-change-callback
    // ==== demo for set a configuration item
    let mut system_theme = SYSTEM_THEME.write();
    system_theme.register_on_change(|_this, _app_handle, _changed| {
        //  this is demo for config change handle
    });
    // callback func will always trigger if false
    system_theme.callback_anyway(false);
    // init must be called after register the on-change-callback
    system_theme.register_to_context(&mut context);
    // ==== end demo
    // == init THEME_SYNC_WITH_SYSTEM
    let theme_sync_with_system = THEME_SYNC_WITH_SYSTEM.write();
    theme_sync_with_system.register_to_context(&mut context);
    // == init GENERAL_AUTO_START
    let mut general_auto_start = GENERAL_AUTO_START.write();
    general_auto_start.register_on_change(|_this, app_handle, changed| {
        debug!("auto start change to {}", changed);
        if changed == "true" {
            init_and_set_auto_launch(&app_handle, true).expect("init auto launch error");
        } else {
            init_and_set_auto_launch(&app_handle, true).expect("init auto launch error");
        }
    });
    general_auto_start.register_to_context(&mut context);
    // == INIT GENERAL_MINIMIZE_TO_TRAY
    let general_minimize_to_tray = GENERAL_MINIMIZE_TO_TRAY.write();
    general_minimize_to_tray.register_to_context(&mut context);
    // == INIT GENERAL_ENABLE_TRAY
    let mut enable_tray = GENERAL_ENABLE_TRAY.write();
    enable_tray.register_on_change(|_this, app_handle, changed| {
        debug!("enable tray change to {}", changed);
        if changed == "true" {
            init_system_tray(&app_handle);
        } else {
            destroy_system_tray(&app_handle);
        }
    });
    enable_tray.callback_anyway(true);
    enable_tray.register_to_context(&mut context);
    // ==
    context.sync_from_file();
    context.store_config();
    context
}