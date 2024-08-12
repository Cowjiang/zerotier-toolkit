use lazy_static::lazy_static;
use log::debug;
use parking_lot::RwLock;
use std::process;
use tauri::{
    AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu,
    SystemTrayMenuItem,
};

use crate::show_main_window;

const TRAY_ID: &str = "TRAY";

const STATUS_ITEM_ID: &str = "/zerotier/status";
const STATUS_ITEM_TITLE: &str = "Status";

const NETWORKS_ITEM_ID: &str = "/zerotier/networks";
const NETWORKS_ITEM_TITLE: &str = "Networks";

const SETTINGS_ITEM_ID: &str = "/settings";
const SETTINGS_ITEM_TITLE: &str = "Settings";

const QUIT_ITEM_ID: &str = "quit";
const QUIT_ITEM_TITLE: &str = "Quit ZeroTier Toolkit";

lazy_static! {
    static ref SYSTEM_TRAY_STATUS: RwLock<bool> = RwLock::new(false);
}

pub fn init_system_tray(app_handle: &AppHandle) {let status_item = CustomMenuItem::new(String::from(STATUS_ITEM_ID), STATUS_ITEM_TITLE);
    let networks_item = CustomMenuItem::new(String::from(NETWORKS_ITEM_ID), NETWORKS_ITEM_TITLE);
    let settings_item = CustomMenuItem::new(String::from(SETTINGS_ITEM_ID), SETTINGS_ITEM_TITLE);
    let quit_item = CustomMenuItem::new(String::from(QUIT_ITEM_ID), QUIT_ITEM_TITLE);
    let tray_menu = SystemTrayMenu::new()
        .add_item(status_item)
        .add_item(networks_item)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(settings_item)
        .add_item(quit_item);
    let mut system_tray = SystemTray::new().with_menu(tray_menu);
    system_tray = handle_system_tray_event(&app_handle, system_tray);
    system_tray.with_id(TRAY_ID).build(&app_handle).unwrap();
}

pub fn destroy_system_tray(app_handle: &AppHandle) {
    let _ = app_handle
        .tray_handle_by_id(TRAY_ID)
        .is_some_and(|tray_handle| {
            let result =tray_handle.destroy().is_ok();
            debug!(
                "destory tray is {:?} and tray is {:?}",
                result,
                app_handle.tray_handle_by_id(TRAY_ID).is_some()
            );
            result
        });
}

pub fn handle_system_tray_event(app_handle: &AppHandle, system_tray: SystemTray) -> SystemTray {
    system_tray.on_event(move |e| match e {
        SystemTrayEvent::DoubleClick { .. } => {
            show_main_window(app_handle.clone());
        }
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            QUIT_ITEM_ID => {
                process::exit(0);
            }
            _ => {
                show_main_window(app_handle.clone());
                app_handle.emit_all("NAVIGATE", id).unwrap();
            }
        },
        _ => {}
    })
}
