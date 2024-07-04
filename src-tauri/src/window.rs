use std::process;

use tauri::{AppHandle, Manager};
use window_shadows::set_shadow;

use crate::configuration::{get_config_dy_def, GENERAL_ENABLE_TRAY};
use crate::r::{fail_message_json, success_json};

pub fn set_window_shadow(app_handle: AppHandle) {
    let window = app_handle.get_window("main").unwrap();
    #[cfg(any(windows, target_os = "macos"))]
    set_shadow(&window, true).unwrap();
}

#[tauri::command]
pub fn close_main_window(app_handle: AppHandle) -> String {
    let main_window = app_handle.get_window("main");
    return match main_window {
        Some(window) => {
            let _ = window.hide();
            if get_config_dy_def(GENERAL_ENABLE_TRAY.read()).eq("false") {
                process::exit(0);
            } else {
                hide_main_window(app_handle);
            }
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
            let _ = window.hide();
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
