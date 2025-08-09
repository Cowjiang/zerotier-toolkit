use log::debug;
use tauri::menu::{Menu, MenuEvent, MenuItem, PredefinedMenuItem};
use tauri::tray::{TrayIcon, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Emitter};

use crate::show_main_window;
use crate::window::exit_app;

const TRAY_ID: &str = "TRAY";

const NETWORKS_ITEM_ID: &str = "/zerotier/networks";
const NETWORKS_ITEM_TITLE: &str = "Networks";

const STATUS_ITEM_ID: &str = "/zerotier/status";
const STATUS_ITEM_TITLE: &str = "Status";

const SETTINGS_ITEM_ID: &str = "/settings";
const SETTINGS_ITEM_TITLE: &str = "Settings";

const QUIT_ITEM_ID: &str = "quit";
const QUIT_ITEM_TITLE: &str = "Quit ZeroTier Toolkit";


pub fn init_system_tray(app_handle: &AppHandle) {
    let current_tray = app_handle.tray_by_id(TRAY_ID);
    if current_tray.is_some() {
        return;
    }

    debug!("init tray");
    let networks_item = MenuItem::with_id(
        app_handle,
        String::from(NETWORKS_ITEM_ID),
        NETWORKS_ITEM_TITLE,
        true,
        None::<&str>,
    )
        .unwrap();
    let status_item = MenuItem::with_id(
        app_handle,
        String::from(STATUS_ITEM_ID),
        STATUS_ITEM_TITLE,
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
    let separator_item = PredefinedMenuItem::separator(app_handle).unwrap();

    let menu = Menu::with_items(
        app_handle,
        &[
            &networks_item,
            &status_item,
            &settings_item,
            &separator_item,
            &quit_item,
        ],
    )
        .unwrap();

    let _ = TrayIconBuilder::with_id(TRAY_ID)
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_tray_icon_event(|icon, event| {
            handle_tray_event(icon, event);
        })
        .on_menu_event(|app, event| {
            handle_tray_menu_event(app.clone(), event);
        })
        .icon(app_handle.default_window_icon().unwrap().clone())
        .build(app_handle)
        .unwrap();
}

pub fn hide_system_tray(app_handle: &AppHandle) {
    let _ = app_handle.tray_by_id(TRAY_ID).is_some_and(|icon| {
        let result = icon.set_visible(false).is_ok();
        debug!(
            "hide tray is {:?} and tray is {:?}",
            result,
            app_handle.tray_by_id(TRAY_ID).is_some()
        );
        result
    });
}

pub fn show_system_tray(app_handle: &AppHandle) {
    let _ = app_handle.tray_by_id(TRAY_ID).is_some_and(|icon| {
        let result = icon.set_visible(true).is_ok();
        debug!(
            "hide tray is {:?} and tray is {:?}",
            result,
            app_handle.tray_by_id(TRAY_ID).is_some()
        );
        result
    });
}


fn handle_tray_event(tray: &TrayIcon, event: TrayIconEvent) {
    match event {
        TrayIconEvent::DoubleClick { .. } => {
            debug!("double click tray");
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
