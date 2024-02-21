use crate::{
    auto_launch_manager::{AutoLaunchManager, Result, AUTO_LAUNCH_MANAGER},
    execute_cmd,
    r::{fail_message_json, success_json},
};
use lazy_static::lazy_static;
use parking_lot::RwLock;
use serde_json::{Map, Value};
use std::env;
use tauri::{AppHandle, Manager, State};

pub const EVENT_CONFIG_CHANGE: &str = "event_config_change";

pub const CONFIG_SYSTEM_AUTO_LAUNCH: &str = "System.AutoLaunch";

lazy_static! {
    pub static ref CONFIGURATION: RwLock<Configuration> = RwLock::new(Configuration::default());
}

pub type Configuration = Map<String, Value>;

pub fn handle_config_change_event(config_changed: Map<String, Value>) {
    let keys = config_changed.keys();
    let mut configuration = CONFIGURATION.write();
    for key in keys {
        match key.as_str() {
            CONFIG_SYSTEM_AUTO_LAUNCH => {
                let value = config_changed.get(key);
                match value {
                    Some(value) => {
                        let is_config_auto_launch = value.as_bool();
                        if is_config_auto_launch.is_some() {
                            let is_config_auto_launch_bool = is_config_auto_launch.unwrap();
                            let manager = AUTO_LAUNCH_MANAGER.read().unwrap();
                            if manager.is_none() {
                                return;
                            }
                            let manager = manager.as_ref().unwrap();
                            if is_config_auto_launch_bool && !manager.is_enabled().unwrap() {
                                let _ = manager.enable();
                            } else if !is_config_auto_launch_bool && manager.is_enabled().unwrap() {
                                let _ = manager.disable();
                            }
                            configuration[key] = value.clone()
                        }
                    }
                    None => {
                        return;
                    }
                }
            }
            _ => {}
        }
    }
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
            let _ = window.set_focus();
        }
        None => {
            return fail_message_json(String::from("no window found"));
        }
    }
    return success_json("success");
}

pub(crate) async fn is_auto_launch_enabled(
    manager: State<'_, AutoLaunchManager>,
) -> Result<String> {
    match manager.is_enabled() {
        Ok(is_enabled) => Ok(success_json(is_enabled)),
        Err(err) => Err(err),
    }
}

pub async fn enable_auto_launch(manager: State<'_, AutoLaunchManager>) -> Result<String> {
    match manager.enable() {
        Ok(_) => Ok(success_json(())),
        Err(err) => Err(err),
    }
}

pub async fn disable_auto_launch(manager: State<'_, AutoLaunchManager>) -> Result<String> {
    match manager.enable() {
        Ok(_) => Ok(success_json(())),
        Err(err) => Err(err),
    }
}

#[cfg(test)]
mod tests {
    use super::restart_as_admin;

    #[test]
    fn test_restart_as_admin() {
        restart_as_admin();
    }
}
