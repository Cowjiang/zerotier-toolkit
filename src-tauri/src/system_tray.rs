use std::process;

use tauri::{AppHandle, CustomMenuItem, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem};

use crate::show_main_window;

const STATUS_ITEM_ID: &str = "status";
const STATUS_ITEM_TITLE: &str = "Status";

const NETWORKS_ITEM_ID: &str = "networks";
const NETWORKS_ITEM_TITLE: &str = "Networks";

const SETTINGS_ITEM_ID: &str = "settings";
const SETTINGS_ITEM_TITLE: &str = "Settings";

const QUIT_ITEM_ID: &str = "quit";
const QUIT_ITEM_TITLE: &str = "Quit ZeroTier Toolkit";

pub fn init_system_tray() -> SystemTray {
    let status_item = CustomMenuItem::new(String::from(STATUS_ITEM_ID), STATUS_ITEM_TITLE);
    let networks_item = CustomMenuItem::new(String::from(NETWORKS_ITEM_ID), NETWORKS_ITEM_TITLE);
    let settings_item = CustomMenuItem::new(String::from(SETTINGS_ITEM_ID), SETTINGS_ITEM_TITLE);
    let quit_item = CustomMenuItem::new(String::from(QUIT_ITEM_ID), QUIT_ITEM_TITLE);
    let tray_menu = SystemTrayMenu::new()
        .add_item(status_item)
        .add_item(networks_item)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(settings_item)
        .add_item(quit_item);
    let system_tray = SystemTray::new().with_menu(tray_menu);
    return system_tray;
}

pub fn handle_system_tray_event(app: &AppHandle, e: SystemTrayEvent) {
    match e {
        SystemTrayEvent::DoubleClick { .. } => {
            show_main_window(app.clone());
        }
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            QUIT_ITEM_ID => {
                process::exit(0);
            }
            _ => {}
        },
        _ => {}
    }
}
