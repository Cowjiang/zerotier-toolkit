// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use log::debug;
use tauri::{AppHandle, Manager, WindowBuilder, WindowEvent};

use auto_launch::{set_auto_launch, unset_auto_launch};
use command::*;
use configuration::try_store_bak;
use system::*;
use system_tray::init_system_tray;
use window::set_window_shadow;

use crate::configuration::{
    get_config, get_config_dy_def, init_config, put_config_command, GENERAL_MINIMIZE_TO_TRAY,
};
use crate::logger::init_logger_main;
use crate::window::{close_main_window, hide_main_window, show_main_window};
use crate::zerotier_manage::*;

mod command;
#[cfg(test)]
mod experiment;

mod auto_launch;
mod configuration;
mod logger;
mod r;
mod system;
mod system_tray;
mod window;
#[cfg(windows)]
mod windows_service_manage;
mod zerotier_manage;

fn main() {
    start_tauri();
}

fn start_tauri() {
    std::env::set_var("NO_PROXY", "127.0.0.1,localhost");
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // zerotier handlers
            get_zerotier_services,
            get_zerotier_start_type,
            set_zerotier_start_type,
            start_zerotier,
            stop_zerotier,
            get_zerotier_state,
            get_zerotier_server_info,
            // window handlers
            hide_main_window,
            show_main_window,
            close_main_window,
            // other handlers
            is_admin,
            restart_as_admin,
            put_config_command,
            get_config,
            set_auto_launch,
            unset_auto_launch
        ])
        .setup(|app| {
            let app_handle = app.handle();
            init_logger_main(app_handle.clone());
            init_system_tray(app_handle.clone());
            init_config(app_handle.clone());
            init_window(app_handle.clone());

            #[cfg(debug_assertions)]
            open_dev_tools(app_handle.clone());

            Ok(())
        })
        .on_window_event(|global_window_event| {
            debug!("listen window event:{:?}", global_window_event.event());
            let app_handle = global_window_event.window().app_handle();
            match global_window_event.event() {
                WindowEvent::CloseRequested { api, .. } => {
                    api.prevent_close();
                    close_main_window(app_handle);
                }
                WindowEvent::Destroyed { .. } => {
                    try_store_bak(app_handle.clone());
                }
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application")
}

#[cfg(debug_assertions)]
fn open_dev_tools(app_handle: AppHandle) {
    let window = app_handle.get_window("main").unwrap();
    window.open_devtools();
}

fn init_window(app_handle: AppHandle) {
    let window = WindowBuilder::new(
        &app_handle,
        "main",
        tauri::WindowUrl::App("index.html".into()),
    )
    .title("ZeroTier Toolkit - Build By Tauri")
    .resizable(false)
    .maximized(false)
    .fullscreen(false)
    .transparent(true)
    .decorations(false)
    .center()
    .min_inner_size(800.0, 500.0)
    .inner_size(800.0, 500.0)
    .build()
    .unwrap();
    window.show().unwrap();
    if get_config_dy_def(GENERAL_MINIMIZE_TO_TRAY.read()).eq("true") {
        hide_main_window(app_handle.clone());
    }
    set_window_shadow(app_handle.clone());
}
