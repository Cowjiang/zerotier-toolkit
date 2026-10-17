#[cfg(any(windows, target_os = "macos"))]
use std::env::home_dir;
use std::fs;
use std::io::Error;
use std::path::Path;
use std::string::ToString;

#[cfg(not(windows))]
use crate::r::unsupported_platform;
use crate::r::{fail_message_json, success_json};
#[cfg(target_os = "windows")]
use crate::windows_service_manage::api::{StartType, WindowsServiceManage};
use lazy_static::lazy_static;
use log::{debug, error};
use serde::Serialize;
use tauri::AppHandle;
use tauri_plugin_opener::OpenerExt;

const DEFAULT_PORT: &str = "9993";
lazy_static! {
    static ref GLOBAL_TRY_HOME: Vec<String> = {
        #[cfg(target_os = "windows")]
        {
            vec![
                String::from("C:\\ProgramData\\ZeroTier\\One"),
                String::from("C:\\ProgramData\\ZeroTier"),
            ]
        }
        #[cfg(target_os = "macos")]
        {
            vec![
                from_home_dir("Library/Application Support/ZeroTier/One"),
                from_home_dir("Library/Application Support/ZeroTier"),
                String::from("/Library/Application Support/ZeroTier/One"),
                String::from("/Library/Application Support/ZeroTier"),
            ]
        }
        #[cfg(target_os = "linux")]
        {
            vec![
                String::from("/var/lib/zerotier-one"),
                String::from("/var/lib/zerotier"),
            ]
        }
    };
    static ref GLOBAL_TRY_PROT_FILES: Vec<String> = vec![
        String::from("zerotier-one.port"),
        String::from("zerotier.port"),
    ];
    static ref GLOBAL_TRY_EXECUTE_FILE: Vec<String> = {
        #[cfg(windows)]
        {
            vec![
                String::from("zerotier-one_x64.exe"),
                String::from("zerotier-one_x86.exe"),
                String::from("zerotier-one.exe"),
            ]
        }
        #[cfg(target_os = "macos")]
        {
            vec![String::from("zerotier-one")]
        }
        #[cfg(target_os = "linux")]
        {
            vec![String::from("zerotier-one")]
        }
    };
    static ref GLOBAL_TRY_SECRET_FILES: Vec<String> = {
        #[cfg(windows)]
        {
            vec![
                from_home_dir("AppData\\Local\\ZeroTier\\authtoken.secret"),
                from_home_dir("AppData\\Local\\ZeroTier\\One\\authtoken.secret"),
                String::from("C:\\ProgramData\\ZeroTier\\One\\authtoken.secret"),
                String::from("C:\\ProgramData\\ZeroTier\\One\\authtoken.secret"),
                String::from("C:\\ProgramData\\ZeroTier\\authtoken.secret"),
                String::from("C:\\ProgramData\\ZeroTier\\authtoken.secret"),
            ]
        }
        #[cfg(target_os = "macos")]
        {
            vec![
                from_home_dir("Library/Application Support/ZeroTier/authtoken.secret"),
                String::from("/Library/Application Support/ZeroTier/authtoken.secret"),
                from_home_dir("Library/Application Support/ZeroTier/One/authtoken.secret"),
                String::from("/Library/Application Support/ZeroTier/One/authtoken.secret"),
            ]
        }
        #[cfg(target_os = "linux")]
        {
            vec![
                String::from("/.zeroTierOneAuthToken"),
                String::from("/.zerotier-local-auth"),
                String::from("/var/lib/zerotier/authtoken.secret"),
                String::from("/var/lib/zerotier/authtoken.secret"),
                String::from("/var/lib/zerotier-one/authtoken.secret"),
                String::from("/var/lib/zerotier-one/authtoken.secret"),
            ]
        }
    };
}

#[derive(Serialize)]
pub struct ZerotierServerInfo {
    port: String,
    secret: String,
}

#[derive(Serialize)]
pub struct ZerotierPathInfo {
    file_dir: String,
    file_name: String,
}

#[cfg(target_os = "windows")]
lazy_static! {
    static ref ZEROTIER_SERVICE_NAME: String = String::from("ZeroTierOneService");
    static ref ZEROTIER_SERVICE_MANAGE: WindowsServiceManage =
        WindowsServiceManage::new(ZEROTIER_SERVICE_NAME.to_string());
}

#[tauri::command]
pub(crate) fn get_zerotier_services() -> String {
    #[cfg(windows)]
    match ZEROTIER_SERVICE_MANAGE.get_service_info() {
        Ok(value) => success_json(value),
        Err(err) => fail_message_json(&err.to_string()),
    }
    #[cfg(not(windows))]
    unsupported_platform()
}

#[tauri::command]
pub(crate) fn get_zerotier_start_type() -> String {
    #[cfg(windows)]
    match ZEROTIER_SERVICE_MANAGE.get_start_type() {
        Ok(value) => success_json(value),
        Err(err) => fail_message_json(&err.to_string()),
    }
    #[cfg(not(windows))]
    unsupported_platform()
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
            Err(err) => fail_message_json(&err.to_string()),
        }
    }

    #[cfg(not(windows))]
    {
        let _ = start_type;
        unsupported_platform()
    }
}

#[tauri::command]
pub(crate) async fn start_zerotier() -> String {
    #[cfg(windows)]
    match ZEROTIER_SERVICE_MANAGE.start() {
        Ok(value) => success_json(value),
        Err(err) => fail_message_json(&err.to_string()),
    }
    #[cfg(not(windows))]
    unsupported_platform()
}

#[tauri::command]
pub(crate) async fn stop_zerotier() -> String {
    #[cfg(windows)]
    match ZEROTIER_SERVICE_MANAGE.stop() {
        Ok(value) => success_json(value),
        Err(err) => fail_message_json(&err.to_string()),
    }
    #[cfg(not(windows))]
    unsupported_platform()
}

#[tauri::command]
pub(crate) fn get_zerotier_state() -> String {
    #[cfg(windows)]
    match ZEROTIER_SERVICE_MANAGE.get_state() {
        Ok(value) => success_json(format!("{:?}", value)),
        Err(err) => fail_message_json(&err.to_string()),
    }
    #[cfg(not(windows))]
    unsupported_platform()
}

#[tauri::command]
pub(crate) fn get_zerotier_server_info() -> String {
    let res_port = try_read_port();
    match try_read_files(&GLOBAL_TRY_SECRET_FILES.clone()) {
        Ok(secret) => success_json(ZerotierServerInfo {
            port: res_port,
            secret,
        }),
        Err(..) => fail_message_json("resolve secret fail"),
    }
}

pub fn try_read_port() -> String {
    for app_home_dir in &GLOBAL_TRY_HOME.clone() {
        let home_dir_path = Path::new(&app_home_dir);
        for port_file_name in &GLOBAL_TRY_PROT_FILES.clone() {
            let port_file_path = home_dir_path.join(port_file_name);
            if port_file_path.exists() {
                let res_port =
                    try_read_file(port_file_path.as_path().to_str().unwrap().to_string());
                if let Ok(port) = res_port {
                    return port;
                }
            }
        }
    }
    DEFAULT_PORT.to_string()
}

pub fn get_zerotier_one_path() -> Result<ZerotierPathInfo, String> {
    for home_dir in &GLOBAL_TRY_HOME.clone() {
        let home_dir_path = Path::new(&home_dir);
        for execute_file_name in &GLOBAL_TRY_EXECUTE_FILE.clone() {
            let execute_file_path = home_dir_path.join(execute_file_name);
            if execute_file_path.exists() {
                let file_name = execute_file_path
                    .file_name()
                    .unwrap()
                    .to_str()
                    .unwrap()
                    .to_string();
                return Ok(ZerotierPathInfo {
                    file_dir: home_dir_path.to_str().unwrap().to_string(),
                    file_name,
                });
            }
        }
    }
    Err("Failed to get ZeroTier One program path".to_string())
}

#[tauri::command]
pub(crate) fn get_zerotier_one_dir() -> String {
    match get_zerotier_one_path() {
        Ok(path) => success_json(path),
        Err(..) => fail_message_json("Failed to get ZeroTier One program path"),
    }
}

#[tauri::command]
pub(crate) fn open_zerotier_one_dir(app: AppHandle) -> String {
    match get_zerotier_one_path() {
        Ok(zerotier_one_path) => match app
            .opener()
            .open_path(zerotier_one_path.file_dir, None::<&str>)
        {
            Ok(..) => success_json(""),
            Err(err) => fail_message_json(&format!("open dir fail:{err}")),
        },
        Err(..) => fail_message_json("Failed to get ZeroTier One program path"),
    }
}

fn try_read_files(file_paths: &[String]) -> Result<String, Error> {
    for file_path in file_paths {
        let read_file_result = try_read_file(file_path.to_string());
        match read_file_result {
            Ok(file_content) => {
                return Ok(file_content);
            }
            Err(error) => {
                error!("read file {} fail with:{}", file_path, error);
            }
        }
    }
    Err(Error::other(
        format!("can't not read content from any file of {:?}", file_paths),
    ))
}

fn try_read_file(file_url: String) -> Result<String, Error> {
    debug!("try read file :{file_url}");
    let file_path = Path::new(file_url.as_str());
    let res_secret = fs::read(file_path);
    match res_secret {
        Ok(secret) => Ok(String::from_utf8_lossy(&secret).to_string()),
        Err(error) => Err(error),
    }
}

#[cfg(any(windows, target_os = "macos"))]
fn from_home_dir(path: &str) -> String {
    let home_dir = get_user_home_dir();
    let home_dir = Path::new(&home_dir);

    let result = home_dir.join(path);
    result.into_os_string().into_string().unwrap()
}

#[cfg(any(windows, target_os = "macos"))]
pub fn get_user_home_dir() -> String {
    let homedir = home_dir().unwrap();
    homedir.to_str().unwrap().to_string()
}

#[cfg(test)]
mod tests {
    use log::info;

    use crate::zerotier_manage::*;

    #[test]
    fn test_get_zerotier_services() {
        info!("test_get_zerotier_services:{:?}", get_zerotier_services())
    }

    #[test]
    fn test_get_zerotier_state() {
        info!("test_get_zerotier_state:{:?}", get_zerotier_state())
    }

    #[test]
    fn test_get_zerotier_start_type() {
        info!(
            "test_get_zerotier_start_type:{:?}",
            get_zerotier_start_type()
        )
    }
}
