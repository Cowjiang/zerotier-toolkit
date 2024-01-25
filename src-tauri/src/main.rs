// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use command::*;
use log::debug;
use system::{__cmd__restart_as_admin, restart_as_admin, Configuration, CONFIGURATION};
use tauri::api::path::config_dir;
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
            let app_handle = app.app_handle();
            debug!("开始加载配置文件");
            let opt_configuration_json_file = app_handle
                .path_resolver()
                .resolve_resource("configuration.json");
            match opt_configuration_json_file {
                Some(value) => {
                    let file = std::fs::File::open(&value);
                    if file.is_err() {
                        debug!("找不到配置文件使用默认配置");
                        return Ok(());
                    }
                    debug!("找到配置文件,开始解析");
                    let config: Configuration = serde_json::from_reader(file.unwrap()).unwrap();
                    let mut config_write = CONFIGURATION.write();
                    debug!("解析完成进行覆盖");
                    config_write.load(config)
                }
                None => {debug!("找不到配置文件使用默认配置");}
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
