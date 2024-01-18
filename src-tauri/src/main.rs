// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use crate::logger::init_logger;
use crate::zerotier_manage::*;

mod zerotier_manage;
mod logger;
mod windows_service_manage;
mod command;


fn main() {
    init_logger();
    start_tauri();
}


fn start_tauri() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_zerotier_services,
            get_zerotier_start_type,
            set_zerotier_start_type,
            start_zerotier,
            stop_zerotier,
            get_zerotier_state
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

