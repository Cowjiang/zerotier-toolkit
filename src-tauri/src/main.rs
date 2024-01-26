// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use command::*;
use log::{debug, warn, LevelFilter};
use std::error::Error;
use system::{__cmd__restart_as_admin, get_config, restart_as_admin, Configuration, CONFIGURATION};
use tauri::{App, AppHandle, Manager};

use crate::i18n::init_translation;
use crate::logger::{init_logger, init_logger_with_level};
use crate::zerotier_manage::*;

mod command;
#[cfg(test)]
mod experiment;
mod i18n;
mod logger;
mod r;
mod system;
mod windows_service_manage;
mod zerotier_manage;

fn main() {
    #[cfg(debug_assertions)]
    {
        init_logger_with_level(LevelFilter::Debug);
    }
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
            restart_as_admin,
            get_config
        ])
        .setup(|app| {
            let app_handle = app.app_handle();
            init_configuration(app_handle.clone());
            init_i18n(app_handle);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn init_i18n(app_handle: AppHandle) {
    let configuration = CONFIGURATION.read();
    let lang = configuration.get_lang();
    let lang_file = format!("resources/{lang}.json");
    debug!("load i18n file:{lang_file}");
    let opt_lang_json_file = app_handle
        .path_resolver()
        .resolve_resource(lang_file.clone());
    match opt_lang_json_file {
        Some(file) => {
            let file = std::fs::File::open(&file);
            match file {
                Ok(file) => {
                    debug!("{lang_file} is exist. start to resolve");
                    init_translation(file);
                }
                Err(error) => {
                    warn!("{lang_file} open fail with :{:?}", error.to_string());
                    return;
                }
            }
        }
        None => {
            debug!("i18n file {} is not found", lang_file)
        }
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
                    config_write.load(config)
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
