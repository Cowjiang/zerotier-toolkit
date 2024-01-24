// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use command::*;
use system::{__cmd__restart_as_admin, restart_as_admin};
use tauri::Manager;

use crate::logger::init_logger;
use crate::zerotier_manage::*;

mod command;
#[cfg(test)]
mod experiment;
mod logger;
mod r;
mod system;
mod windows_service_manage;
mod zerotier_manage;
const SHUTDOWN_EVENT: &str = "SHUTDOWN_EVENT";
fn main() {
    init_logger();
    start_tauri();
}

fn start_tauri() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // zerotier handler
            get_zerotier_services,
            get_zerotier_start_type,
            set_zerotier_start_type,
            start_zerotier,
            stop_zerotier,
            get_zerotier_state,
            // other handlers
            is_admin,
            restart_as_admin
        ])
        .setup(|app| {
            // TODO CLOSE APP NICLY
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
