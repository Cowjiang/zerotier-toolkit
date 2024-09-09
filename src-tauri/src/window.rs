use std::ops::Deref;

use tauri::{AppHandle, Manager};
use window_shadows::set_shadow;

use crate::configurations::configurations_service::{backup_all, get_configuration_context};
use crate::configurations::system_configurations::{GENERAL_ENABLE_TRAY, SYSTEM_CONFIGURATION_NAME};
use crate::r::{fail_message_json, success_json};

pub fn set_window_shadow(app_handle: &AppHandle) {
    let window = app_handle.get_window("main").unwrap();
    #[cfg(any(windows, target_os = "macos"))]
    set_shadow(&window, true).unwrap();
}

pub fn exit_app(app_handle: &AppHandle) {
    before_exit();
    app_handle.exit(0)
}

fn before_exit() {
    backup_all();
}


#[tauri::command]
pub fn close_main_window(app_handle: AppHandle) -> String {
    let main_window = app_handle.get_window("main");
    return match main_window {
        Some(window) => {
            let _ = window.hide();
            let _ = get_configuration_context(&SYSTEM_CONFIGURATION_NAME.to_string()).is_some_and(|context| {
                let general_minimize_to_tray_def = GENERAL_ENABLE_TRAY.read();
                if !context.get_config_by_def(general_minimize_to_tray_def.deref()).as_bool().unwrap() {
                    exit_app(&app_handle);
                } else {
                    hide_main_window(app_handle);
                }
                true
            });
            success_json("success")
        }
        None => fail_message_json("failed to close window"),
    };
}


#[tauri::command]
pub fn hide_main_window(app_handle: AppHandle) -> String {
    let main_window = app_handle.get_window("main");
    return match main_window {
        Some(window) => {
            #[cfg(windows)]
            let _ = window.hide();
            #[cfg(not(windows))]
            let _ = window.minimize();
            success_json("success")
        }
        None => fail_message_json("failed to hide window"),
    };
}

#[tauri::command]
pub fn show_main_window(app_handle: AppHandle) -> String {
    let main_window = app_handle.get_window("main");
    return match main_window {
        Some(window) => {
            let _ = window.show();
            let _ = window.set_focus();
            success_json("success")
        }
        None => fail_message_json("failed to show window"),
    };
}
