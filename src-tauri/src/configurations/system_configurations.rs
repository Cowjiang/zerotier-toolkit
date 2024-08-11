use lazy_static::lazy_static;
use log::debug;
use parking_lot::RwLock;
use tauri::AppHandle;

use crate::auto_launch::{set_auto_launch, unset_auto_launch};
use crate::configurations::configuration_base::{ConfigurationContext, ConfigurationDef};
use crate::system_tray::{destroy_system_tray, init_system_tray};

pub const SYSTEM_CONFIGURATION_NAME: &str = "system";
lazy_static! {
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
    pub static ref GENERAL_ENABLE_TRAY: RwLock<ConfigurationDef> = RwLock::new(
        ConfigurationDef::new("General.EnableTray".to_string(), "false".to_string())
    );
    pub static ref GENERAL_MINIMIZE_TO_TRAY: RwLock<ConfigurationDef> = RwLock::new(
        ConfigurationDef::new("General.MinimizeToTray".to_string(), "false".to_string())
    );
}

pub fn init_context(app_handle: AppHandle) -> ConfigurationContext {
    let mut context = ConfigurationContext::new(app_handle.clone(), SYSTEM_CONFIGURATION_NAME.to_string());
    debug!("start to init configuration");
    // == area for put configuration ande register the on-change-callback
    // ==== demo for set a configuration item
    let mut system_theme = SYSTEM_THEME.write();
    system_theme.register_on_change(|_this, _app_handle, _changed| {
        //  this is demo for config change handle
    });
    // callback func will always trigger if true
    system_theme.callback_anyway(false);
    // init must be called after register the on-change-callback
    system_theme.register_to_context(&mut context);
    // ==== end demo
    // == init THEME_SYNC_WITCH_SYSTEM

    // == init GENERAL_AUTO_START
    let mut general_auto_start = GENERAL_AUTO_START.write();
    general_auto_start.register_on_change(|_this, app_handle, changed| {
        debug!("auto start change to {}", changed);
        if changed == "true" {
            set_auto_launch(app_handle.clone())
        } else {
            unset_auto_launch(app_handle.clone())
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
            init_system_tray(app_handle);
        } else {
            destroy_system_tray(app_handle);
        }
    });
    enable_tray.register_to_context(&mut context);
    // ==
    context.sync_from_file();
    context.store_config();
    context
}