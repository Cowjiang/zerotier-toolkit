// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{App, Manager};

use command::*;
use system::*;
use system_tray::{handle_system_tray_event, init_system_tray};
use window::set_window_shadow;

use crate::configuration::{get_config, init_config, put_config_command};
use crate::logger::init_logger_main;
use crate::zerotier_manage::*;

mod command;
#[cfg(test)]
mod experiment;


mod logger;
mod r;
mod system;
mod system_tray;
mod windows_service_manage;
mod zerotier_manage;
mod configuration;
mod window;

fn main() {
    start_tauri();
}

fn start_tauri() {
    std::env::set_var("NO_PROXY", "127.0.0.1,localhost");
    tauri::Builder::default()
        .system_tray(init_system_tray())
        .on_system_tray_event(handle_system_tray_event)
        .invoke_handler(tauri::generate_handler![
            // zerotier handler
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
            // other handlers
            is_admin,
            restart_as_admin,
            put_config_command,
            get_config
        ]).setup(|app| {
        let app_handle = app.app_handle();
        init_logger_main(app_handle.clone());
        init_config(app_handle.clone());
        init_window_shadow(app);
        #[cfg(debug_assertions)]
        {
            open_dev_tools(app);
        }
        Ok(())
    })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn open_dev_tools(app: &mut App) {
    let window = app.get_window("main").unwrap();
    window.open_devtools();
}

fn init_window_shadow(app: &mut App) {
    let window = app.get_window("main").unwrap();
    set_window_shadow(window);
}




