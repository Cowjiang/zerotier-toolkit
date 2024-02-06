use crate::{
    execute_cmd,
    r::{fail_message_json, success_json},
};
use lazy_static::lazy_static;
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use std::env;
use tauri::{AppHandle, Manager};

lazy_static! {
    pub static ref CONFIGURATION: RwLock<Configuration> = RwLock::new(Configuration::default());
}

#[derive(Clone, Deserialize, Debug, Serialize, Default)]
pub struct Configuration {
    theme: Option<String>,
}
impl Configuration {
    pub fn load(&mut self, config: Configuration) {
        *self = config
    }
}
#[tauri::command]
pub fn get_config() -> String {
    let config = CONFIGURATION.read();
    success_json(config.clone())
}

#[tauri::command]
pub(crate) fn restart_as_admin() -> String {
    let current = env::current_exe().unwrap();
    let exec_path = current.to_str();
    if exec_path.is_none() {
        return fail_message_json(String::from("can't not get current exe path"));
    }
    let exec_path = exec_path.unwrap();
    let output = execute_cmd(vec![
        String::from("powershell"),
        String::from("-Command"),
        String::from("Start-Process"),
        String::from("-FilePath"),
        String::from(exec_path),
        String::from("-Verb"),
        String::from("\"RunAs\""),
        String::from("-WindowStyle"),
        String::from("Hidden"),
    ]);
    return match output {
        Ok(value) => {
            let status = value.status;
            if !status.success() {
                return fail_message_json(String::from("resater fail.please restart manually"));
            }
            return success_json("success");
        }
        Err(err) => fail_message_json(err.to_string()),
    };
}

#[tauri::command]
pub(crate) fn hide_main_window(app_handler: AppHandle) -> String {
    let main_window = app_handler.get_window("main");
    match main_window {
        Some(window) => {
            let _ = window.hide();
        }
        None => {
            return fail_message_json(String::from("no window found"));
        }
    }
    return success_json("success");
}

#[tauri::command]
pub(crate) fn show_main_window(app_handler: AppHandle) -> String {
    let main_window = app_handler.get_window("main");
    match main_window {
        Some(window) => {
            let _ = window.show();
        }
        None => {
            return fail_message_json(String::from("no window found"));
        }
    }
    return success_json("success");
}

#[cfg(test)]
mod tests {
    use super::restart_as_admin;

    #[test]
    fn test_restart_as_admin() {
        restart_as_admin();
    }
}
