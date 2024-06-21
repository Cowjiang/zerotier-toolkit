use std::env::VarError;
use std::fs;
use std::io::Error;
use std::path::Path;
use std::string::ToString;

use lazy_static::lazy_static;
use log::error;
use serde::Serialize;

use crate::r::{fail_message_json, success_json};
#[cfg(target_os = "windows")]
use crate::windows_service_manage::api::{StartType, WindowsServiceManage};

lazy_static! {
    static ref GLOBAL_TRY_PROT_FILES: [String; 2] = {
        #[cfg(target_os = "windows")]
        {
            [
                String::from("C:\\ProgramData\\ZeroTier\\One\\zerotier-one.port"),
                String::from("C:\\ProgramData\\ZeroTier\\One\\zerotier.port"),
            ]
        }
        // TODO: this is an demo for conditional compile => fill real path
        #[cfg(target_os = "macos")]
        {
            []
        }
    };
    static ref GLOBAL_TRY_SECRET_FILES: [String; 2] = {
        #[cfg(windows)]
        {
            [
                String::from("C:\\ProgramData\\ZeroTier\\One\\authtoken.secret"),
                from_home_dir("AppData\\Local\\ZeroTier\\authtoken.secret"),
            ]
        }
        // TODO: this is an demo for conditional compile => fill real path
        #[cfg(target_os = "macos")]
        {
            []
        }

    };
}

#[derive(Serialize)]
pub struct ZerotierServerInfo {
    port: String,
    secret: String,
}
lazy_static! {
    static ref ZEROTIER_SERVICE_NAME: String = String::from("ZeroTierOneService");
    #[cfg(target_os = "windows")]
    static ref ZEROTIER_SERVICE_MANAGE: WindowsServiceManage =
        WindowsServiceManage::new(ZEROTIER_SERVICE_NAME.to_string());
}

#[tauri::command]
pub(crate) fn get_zerotier_services() -> String {
    #[cfg(windows)]
    match ZEROTIER_SERVICE_MANAGE.get_service_info() {
        Ok(value) => success_json(value),
        Err(err) => fail_message_json(err.to_string()),
    }
    #[cfg(not(windows))]
    fail_message_json("this is an windows only command")
}

#[tauri::command]
pub(crate) fn get_zerotier_start_type() -> String {
    #[cfg(windows)]
    match ZEROTIER_SERVICE_MANAGE.get_start_type() {
        Ok(value) => success_json(value),
        Err(err) => fail_message_json(err.to_string()),
    }
    #[cfg(not(windows))]
    fail_message_json("this is an windows only command")
}

#[tauri::command]
pub(crate) fn set_zerotier_start_type(start_type: String) -> String {
    #[cfg(windows)]
    {
        let resl_start_type = match start_type.as_str() {
            "AutoStart" => StartType::AutoStart,
            "DemandStart" => StartType::DemandStart,
            "Disabled" => StartType::Disabled,
            _ => StartType::DemandStart,
        };
        match ZEROTIER_SERVICE_MANAGE.set_start_type(resl_start_type) {
            Ok(value) => success_json(value),
            Err(err) => fail_message_json(err.to_string()),
        }
    }

    #[cfg(not(windows))]
    fail_message_json("this is an windows only command")
}

#[tauri::command]
pub(crate) async fn start_zerotier() -> String {
    #[cfg(windows)]
    match ZEROTIER_SERVICE_MANAGE.start() {
        Ok(value) => success_json(value),
        Err(err) => fail_message_json(err.to_string()),
    }
    #[cfg(not(windows))]
    fail_message_json("this is an windows only command")
}

#[tauri::command]
pub(crate) async fn stop_zerotier() -> String {
    #[cfg(windows)]
    match ZEROTIER_SERVICE_MANAGE.stop() {
        Ok(value) => success_json(value),
        Err(err) => fail_message_json(err.to_string()),
    }
    #[cfg(not(windows))]
    fail_message_json("this is an windows only command")
}

#[tauri::command]
pub(crate) fn get_zerotier_state() -> String {
    #[cfg(windows)]
    match ZEROTIER_SERVICE_MANAGE.get_state() {
        Ok(value) => success_json(format!("{:?}", value)),
        Err(err) => fail_message_json(err.to_string()),
    }
    #[cfg(not(windows))]
    fail_message_json("this is an windows only command")
}

#[tauri::command]
pub(crate) fn get_zerotier_server_info() -> String {
    let res_port = try_read_files(&GLOBAL_TRY_PROT_FILES.clone());
    let res_secret = try_read_files(&GLOBAL_TRY_SECRET_FILES.clone());
    if res_port.is_err() || res_secret.is_err() {
        return fail_message_json(String::from("resolve port and secret fail"));
    }
    success_json(ZerotierServerInfo {
        port: res_port.unwrap(),
        secret: res_secret.unwrap(),
    })
}

fn try_read_files(file_paths: &[String]) -> Result<String, Error> {
    for file_path in file_paths {
        let read_file_result = try_read_file(file_path.to_string());
        match read_file_result {
            Ok(file_content) => {
                return Ok(file_content);
            }
            Err(error) => {
                error!("read file {} fail with:{}", file_path, error.to_string());
            }
        }
    }
    Err(Error::new(
        std::io::ErrorKind::Other,
        format!("can't not read content from any file of {:?}", file_paths),
    ))
}

fn try_read_file(file_url: String) -> Result<String, Error> {
    let file_path = Path::new(file_url.as_str());
    let res_secret = fs::read(file_path);
    match res_secret {
        Ok(secret) => Ok(String::from_utf8_lossy(&secret).to_string()),
        Err(error) => Err(error),
    }
}
fn from_home_dir<'a>(path: &str) -> String {
    let home_dir = get_user_home_dir().unwrap();
    let home_dir = Path::new(&home_dir);

    let result = home_dir.join(path);
    return result.into_os_string().into_string().unwrap();
}

pub fn get_user_home_dir() -> Result<String, VarError> {
    #[cfg(windows)]
    let home = std::env::var("USERPROFILE");

    #[cfg(not(windows))]
    let home = std::env::var("HOME");

    home
}

#[cfg(test)]
mod tests {
    use std::thread;
    use std::time::Duration;

    use log::info;
    use log::LevelFilter::Debug;

    use crate::logger::init_logger_with_level;
    use crate::zerotier_manage::*;

    fn setup() {
        init_logger_with_level(Debug)
    }

    #[test]
    fn test_get_zerotier_services() {
        setup();
        info!("test_get_zerotier_services:{:?}", get_zerotier_services())
    }

    #[test]
    fn test_get_zerotier_state() {
        setup();
        info!("test_get_zerotier_state:{:?}", get_zerotier_state())
    }

    #[test]
    fn test_get_zerotier_start_type() {
        setup();
        info!(
            "test_get_zerotier_start_type:{:?}",
            get_zerotier_start_type()
        )
    }
    #[test]
    fn test_set_zerotier_start_type() {
        setup();
        info!(
            "test_set_zerotier_start_type:{:?}",
            set_zerotier_start_type(String::from("DemandStart"))
        );
        info!(
            "test_set_zerotier_start_type:{:?}",
            get_zerotier_start_type()
        )
    }

    #[tokio::test]
    async fn test_start_zerotier() {
        setup();
        info!("test_start_zerotier:{:?}", start_zerotier().await);
        let state = get_zerotier_state();
        info!("test_start_zerotier:{:?}", state);
    }

    #[tokio::test]
    async fn test_stop_zerotier() {
        setup();
        info!("test_stop_zerotier:{:?}", stop_zerotier().await);
        let state = get_zerotier_state();
        info!("test_stop_zerotier:{:?}", state);
    }

    #[test]
    fn test_state_listener() {
        setup();
        info!(
            "test_get_zerotier_start_type:{:?}",
            get_zerotier_start_type()
        );
        loop {
            info!("current state{:?}", get_zerotier_state());
            thread::sleep(Duration::new(2, 0))
        }
    }

    #[test]
    fn test_get_zerotier_server_info() {
        setup();
        info!(
            "test_get_zerotier_server_info:{:?}",
            get_zerotier_server_info()
        )
    }
}
