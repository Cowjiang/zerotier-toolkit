use std::process;

use tauri::{AppHandle, CustomMenuItem, SystemTray, SystemTrayEvent, SystemTrayMenu};

use crate::show_main_window;
const QUIT_ITEM_ID: &str = "quit";
const QUIT_ITEM_TITLE: &str = "quit";
pub fn init_system_tray() -> SystemTray {
    let quit_item = CustomMenuItem::new(String::from(QUIT_ITEM_ID), QUIT_ITEM_TITLE);
    let tray_menu = SystemTrayMenu::new().add_item(quit_item);
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
