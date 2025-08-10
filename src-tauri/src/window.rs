use std::fmt;
use std::fmt::Formatter;
use std::ops::Deref;

use log::error;
use tauri::{AppHandle, Manager};

use crate::configurations::configurations_service::{backup_all, get_configuration_context};
use crate::configurations::system_configurations::{
    GENERAL_ENABLE_TRAY, SYSTEM_CONFIGURATION_NAME,
};
use crate::r::{fail_message_json, success_json};

#[derive(Debug, PartialEq)]
pub enum Error {
    WindowNotFound(String),
    HideWindowError(String),
}

pub type Result<T> = std::result::Result<T, Error>;

impl fmt::Display for Error {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        match self {
            Error::WindowNotFound(msg) => write!(f, "Window not found: {}", msg),
            Error::HideWindowError(msg) => write!(f, "Hide window error: {}", msg),
        }
    }
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
    let main_window = app_handle.get_webview_window("main");
    match main_window {
        Some(window) => {
            let _ = window.hide();
            let _ = get_configuration_context(&SYSTEM_CONFIGURATION_NAME.to_string()).is_some_and(
                |context| {
                    let general_minimize_to_tray_def = GENERAL_ENABLE_TRAY.read().unwrap();
                    if !context
                        .get_config_by_def(general_minimize_to_tray_def.deref())
                        .as_bool()
                        .unwrap()
                    {
                        exit_app(&app_handle);
                    } else {
                        hide_main_window(app_handle);
                    }
                    true
                },
            );
            success_json("success")
        }
        None => fail_message_json("failed to close window"),
    }
}

#[tauri::command]
pub fn hide_main_window(app_handle: AppHandle) -> String {
    match do_hide_main_window(&app_handle) {
        Ok(_) => success_json("success"),
        Err(err) => {
            error!("{}", err);
            fail_message_json("failed to hide window")
        }
    }
}

pub fn do_hide_main_window(app_handle: &AppHandle) -> Result<()> {
    let main_window = app_handle.get_webview_window("main");
    match main_window {
        Some(window) => {
            #[cfg(windows)]
            let result = window.hide();
            #[cfg(not(windows))]
            let result = window.minimize();
            result.map_err(|err| Error::HideWindowError(err.to_string()))
        }
        None => Err(Error::WindowNotFound("main window not found".to_string())),
    }
}

#[tauri::command]
pub fn show_main_window(app_handle: AppHandle) -> String {
    let main_window = app_handle.get_webview_window("main");
    match main_window {
        Some(window) => {
            let _ = window.unminimize();
            let _ = window.show();
            let _ = window.set_focus();
            success_json("success")
        }
        None => fail_message_json("failed to show window"),
    }
}
