use log::debug;
use tauri::tray::{TrayIcon, TrayIconBuilder, TrayIconEvent};
use tauri::AppHandle;

use crate::show_main_window;

const TRAY_ID: &str = "TRAY";

pub fn init_system_tray(app_handle: &AppHandle) {
    let current_tray = app_handle.tray_by_id(TRAY_ID);
    if current_tray.is_some() {
        return;
    }

    debug!("init tray");

    let _ = TrayIconBuilder::with_id(TRAY_ID)
        .show_menu_on_left_click(false)
        .on_tray_icon_event(|icon, event| {
            handle_tray_event(icon, event);
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
