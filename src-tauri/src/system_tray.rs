use lazy_static::lazy_static;
use log::debug;
use parking_lot::RwLock;
use tauri::menu::{Menu, MenuEvent, MenuItem};
use tauri::tray::{TrayIcon, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Emitter};

use crate::show_main_window;
use crate::window::exit_app;

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

pub fn show_system_tray(app_handle: &AppHandle) {
    let current_tray = app_handle.tray_by_id(TRAY_ID);
    if current_tray.is_some() {
        debug!("show tray");
        let _ = current_tray.unwrap().set_visible(true);
        return;
    }

    debug!("init tray");
    let status_item = MenuItem::with_id(
        app_handle,
        String::from(STATUS_ITEM_ID),
        STATUS_ITEM_TITLE,
        true,
        None::<&str>,
    )
        .unwrap();
    let networks_item = MenuItem::with_id(
        app_handle,
        String::from(NETWORKS_ITEM_ID),
        NETWORKS_ITEM_TITLE,
        true,
        None::<&str>,
    )
        .unwrap();
    let settings_item = MenuItem::with_id(
        app_handle,
        String::from(SETTINGS_ITEM_ID),
        SETTINGS_ITEM_TITLE,
        true,
        None::<&str>,
    )
        .unwrap();
    let quit_item = MenuItem::with_id(
        app_handle,
        String::from(QUIT_ITEM_ID),
        QUIT_ITEM_TITLE,
        true,
        None::<&str>,
    )
        .unwrap();
    let menu = Menu::with_items(
        app_handle,
        &[&status_item, &networks_item, &settings_item, &quit_item],
    )
        .unwrap();

    let _ = TrayIconBuilder::with_id(TRAY_ID)
        .menu(&menu)
        .show_menu_on_left_click(true)
        .on_tray_icon_event(|icon, event| {
            handle_tray_event(icon, event);
        })
        .on_menu_event(|app, event| {
            handle_tray_menu_event(app.clone(), event);
        })
        .icon(app_handle.default_window_icon().unwrap().clone())
        .build(app_handle).unwrap().set_visible(true);
}

pub fn destroy_system_tray(app_handle: &AppHandle) {
    let _ = app_handle.tray_by_id(TRAY_ID).is_some_and(|icon| {
        let result = icon.set_visible(false).is_ok();
        debug!(
            "destroy tray is {:?} and tray is {:?}",
            result,
            app_handle.tray_by_id(TRAY_ID).is_some()
        );
        result
    });
}

fn handle_tray_event(tray: &TrayIcon, event: TrayIconEvent) {
    match event {
        TrayIconEvent::DoubleClick { .. } => {
            show_main_window(tray.app_handle().clone());
        }
        _ => {}
    }
}

pub fn handle_tray_menu_event(app_handle: AppHandle, event: MenuEvent) {
    match event.id.as_ref().to_string().as_str() {
        QUIT_ITEM_ID => {
            exit_app(&app_handle);
        }
        event => {
            show_main_window(app_handle.clone());
            let _ = app_handle.emit("NAVIGATE", event).unwrap();
        }
    }
}
