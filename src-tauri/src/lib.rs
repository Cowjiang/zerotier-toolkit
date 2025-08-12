// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::ops::Deref;

use auto_launch::{set_auto_launch, unset_auto_launch};
use command::*;
use configurations::configurations_command::reset_configurations;
use system::*;
use tauri::{AppHandle, Builder, Manager, WebviewWindowBuilder, WindowEvent, Wry};
use tauri_plugin_autostart::MacosLauncher;

use crate::configurations::configurations_command::{get_configurations, put_configurations};
use crate::configurations::configurations_service::{
    backup_all, get_configuration_context, init_configuration_context,
};
use crate::configurations::system_configurations::{
    GENERAL_MINIMIZE_TO_TRAY, SYSTEM_CONFIGURATION_NAME,
};
use crate::embedding_zerotier::get_embedding_zerotier_version;
// use crate::logger::init_logger_main;
use crate::update_check::get_latest_version_command;
use crate::window::{close_main_window, do_hide_main_window, hide_main_window, show_main_window};
use crate::zerotier_manage::*;

mod command;

mod auto_launch;
mod configurations;
mod embedding_zerotier;
mod r;
mod system;
mod system_tray;
mod update_check;
mod util;
mod window;
#[cfg(windows)]
mod windows_service_manage;
mod zerotier_manage;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    start_tauri();
}

fn start_tauri() {
    unsafe {
        std::env::set_var("NO_PROXY", "127.0.0.1,localhost");
    }
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            show_main_window(app.app_handle().clone());
        }))
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            // what's args?
            Some(vec!["--flag1", "--flag2"]),
        ))
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_process::init());
    builder = register_invoke_handlers(builder);
    builder = setup(builder);
    builder = register_window_event_handler(builder);
    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn register_window_event_handler(builder: Builder<Wry>) -> Builder<Wry> {
    let builder = builder.on_window_event(|window, global_window_event| {
        let app_handle = window.app_handle();
        match global_window_event {
            WindowEvent::CloseRequested { api, .. } => {
                api.prevent_close();
                close_main_window(app_handle.app_handle().clone());
            }
            WindowEvent::Destroyed { .. } => backup_all(),
            _ => {}
        }
    });
    builder
}

fn setup(builder: Builder<Wry>) -> Builder<Wry> {
    let builder = builder.setup(|app| {
        let app_handle = app.handle();
        // init_logger_main(&app_handle);
        init_configuration_context(&app_handle);
        init_window(&app_handle);

        #[cfg(debug_assertions)]
        open_dev_tools(&app_handle);

        #[cfg(desktop)]
        app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;

        Ok(())
    });
    builder
}

fn register_invoke_handlers(builder: Builder<Wry>) -> Builder<Wry> {
    let builder = builder.invoke_handler(tauri::generate_handler![
        // zerotier handlers
        get_zerotier_services,
        get_zerotier_start_type,
        set_zerotier_start_type,
        start_zerotier,
        stop_zerotier,
        get_zerotier_state,
        get_zerotier_server_info,
        get_zerotier_one_dir,
        open_zerotier_one_dir,
        // window handlers
        hide_main_window,
        show_main_window,
        close_main_window,
        // auto launch
        set_auto_launch,
        unset_auto_launch,
        // configurations
        get_configurations,
        put_configurations,
        reset_configurations,
        // embedding zerotier
        get_embedding_zerotier_version,
        // other handlers
        is_admin,
        restart_as_admin,
        get_latest_version_command
    ]);
    builder
}

#[cfg(debug_assertions)]
fn open_dev_tools(app_handle: &AppHandle) {
    use tauri::Manager;

    let window = app_handle.get_webview_window("main").unwrap();
    window.open_devtools();
}

fn init_window(app_handle: &AppHandle) {
    let _ = WebviewWindowBuilder::new(
        app_handle,
        "main",
        tauri::WebviewUrl::App("index.html".into()),
    )
        .title("ZeroTier Toolkit - Build By Tauri")
        .resizable(false)
        .maximized(false)
        .fullscreen(false)
        .transparent(true)
        .decorations(false)
        .shadow(false)
        .center()
        .min_inner_size(800.0, 500.0)
        .inner_size(800.0, 500.0)
        .build()
        .unwrap();
    let _ = get_configuration_context(SYSTEM_CONFIGURATION_NAME).is_some_and(|context| {
        let minimize_to_tray_def = GENERAL_MINIMIZE_TO_TRAY.read().unwrap();
        if context
            .get_config_by_def(minimize_to_tray_def.deref())
            .as_bool()
            .unwrap()
        {
            do_hide_main_window(&app_handle).expect("hide main window fail");
        }
        true
    });
}
