// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::ops::Deref;
use tauri::{AppHandle, Builder, Manager, WindowBuilder, WindowEvent, Wry};

use auto_launch::{set_auto_launch, unset_auto_launch};
use command::*;
use system::*;
use window::set_window_shadow;

use crate::configurations::configurations_command::{get_configurations, put_configurations};
use crate::configurations::configurations_service::{backup_all, get_configuration_context, init_configuration_context};
use crate::configurations::system_configurations::{GENERAL_MINIMIZE_TO_TRAY, SYSTEM_CONFIGURATION_NAME};
use crate::logger::init_logger_main;
use crate::window::{close_main_window, hide_main_window, show_main_window};
use crate::zerotier_manage::*;

mod command;

mod auto_launch;
mod logger;
mod r;
mod system;
mod system_tray;
mod window;
#[cfg(windows)]
mod windows_service_manage;
mod zerotier_manage;
mod configurations;
mod util;

fn main() {
    start_tauri();
}

fn start_tauri() {
    std::env::set_var("NO_PROXY", "127.0.0.1,localhost");
    let mut builder = tauri::Builder::default();
    builder = register_invoke_handlers(builder);
    builder = setup(builder);
    builder = register_window_event_handler(builder);
    builder.run(tauri::generate_context!()).expect("error while running tauri application");
}

fn register_window_event_handler(builder: Builder<Wry>) -> Builder<Wry> {
    let builder = builder.on_window_event(|global_window_event| {
        let app_handle = global_window_event.window().app_handle();
        match global_window_event.event() {
            WindowEvent::CloseRequested { api, .. } => {
                api.prevent_close();
                close_main_window(app_handle);
            }
            WindowEvent::Destroyed { .. } => {
                backup_all()
            }
            _ => {}
        }
    });
    builder
}

fn setup(builder: Builder<Wry>) -> Builder<Wry> {
    let builder = builder.setup(|app| {
        let app_handle = app.handle();
        init_logger_main(&app_handle);
        init_configuration_context(&app_handle);
        init_window(&app_handle);

        #[cfg(debug_assertions)]
        open_dev_tools(&app_handle);

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
            // other handlers
            is_admin,
            restart_as_admin
        ]);
    builder
}

#[cfg(debug_assertions)]
fn open_dev_tools(app_handle: &AppHandle) {
    let window = app_handle.get_window("main").unwrap();
    window.open_devtools();
}

fn init_window(app_handle: &AppHandle) {
    let window = WindowBuilder::new(
        app_handle,
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
    let _ = get_configuration_context(&SYSTEM_CONFIGURATION_NAME.to_string()).is_some_and(|context| {
        let minimize_to_tray_def = GENERAL_MINIMIZE_TO_TRAY.read();
        if context.get_config_by_def(minimize_to_tray_def.deref()).eq("true") {
            hide_main_window(app_handle.clone());
        }
        true
    });
    set_window_shadow(&app_handle);
}
