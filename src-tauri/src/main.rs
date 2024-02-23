// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs::{File, OpenOptions};

use auto_launch_manager::init_auto_launch_manager;
use command::*;
use log::{debug, warn, LevelFilter};
use serde_json::{Map, Value};
use system::*;
use system_tray::{handle_system_tray_event, init_system_tray};
use tauri::{AppHandle, Manager};

use crate::zerotier_manage::*;

mod command;
#[cfg(test)]
mod experiment;

mod auto_launch_manager;
mod logger;
mod r;
mod system;
mod system_tray;
mod windows_service_manage;
mod zerotier_manage;
fn main() {
    start_tauri();
}

fn start_tauri() {
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
            restart_as_admin
        ])
        .setup(|app| {
            let app_handle = app.app_handle();
            init_logger(app_handle.clone());
            init_configuration(app_handle.clone());
            let _ = init_auto_launch_manager(
                app,
                auto_launch_manager::MacosLauncher::LaunchAgent,
                None,
            );
            app.listen_global(EVENT_CONFIG_CHANGE, |event| {
                let payload = event.payload();
                let payload: Map<String, Value> = serde_json::from_str(payload.unwrap()).unwrap();
                handle_config_change_event(payload);
            });

            Ok(())
        })
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
fn init_logger(app_handle: AppHandle) {
    let opt_log_file = app_handle.path_resolver().resolve_resource("system.log");
    let mut opt_open_log_file: Option<File> = None;
    match opt_log_file {
        Some(value) => {
            let file = OpenOptions::new()
                .create(true)
                .append(true)
                .write(true)
                .open(value);
            match file {
                Ok(file) => {
                    let _ = opt_open_log_file.insert(file);
                }
                Err(error) => {
                    println!("loading log file fail:{}", error.to_string())
                }
            }
        }
        None => {
            println!("loading log file fail:{:?}", opt_log_file)
        }
    }
    #[cfg(debug_assertions)]
    {
        logger::init_logger_with_level_and_file(LevelFilter::Debug, opt_open_log_file);
    }
    #[cfg(not(debug_assertions))]
    {
        logger::init_logger_with_level_and_file(LevelFilter::Info, opt_open_log_file);
    }
}
fn init_configuration(app_handle: AppHandle) {
    debug!("start to init configuration");
    let configuration_file_path = "resources/configuration.json";
    let opt_configuration_json_file = app_handle
        .path_resolver()
        .resolve_resource(configuration_file_path);
    match opt_configuration_json_file {
        Some(value) => {
            let file = std::fs::File::open(&value);
            match file {
                Ok(file) => {
                    debug!("{configuration_file_path} is exist. start to resolve");
                    let config: Configuration = serde_json::from_reader(file).unwrap();
                    let mut config_write = CONFIGURATION.write();
                    debug!("{configuration_file_path} resolve complete");
                    *config_write = config
                }
                Err(error) => {
                    warn!(
                        "{configuration_file_path} open fail with execption {}.init configuration with [default]",
                        error.to_string()
                    );
                    return;
                }
            }
        }
        None => {
            debug!("{configuration_file_path} is not found.init configuration with [default]");
        }
    }
}
