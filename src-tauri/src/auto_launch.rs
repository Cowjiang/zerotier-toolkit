use std::env::current_exe;

use auto_launch::AutoLaunch;
use log::debug;
use tauri::AppHandle;

use crate::r::success_json;

fn init_auto(app_handle: &AppHandle) -> AutoLaunch {
    let config = app_handle.config();
    let package = &config.package;
    let default = "".to_string();
    let product_name = package.product_name.as_ref().unwrap_or(&default);
    let version = package.version.as_ref().unwrap_or(&default);
    let app_name = format!("{}@{}", product_name, version);
    let mut current_exe = current_exe().unwrap();
    let app_path = current_exe.to_str().unwrap();
    #[cfg(not(target_os = "macos"))]
        let auto = AutoLaunch::new(
        app_name.as_str(),
        app_path,
        &[] as &[&str],
    );
    #[cfg(target_os = "macos")]
        let auto = AutoLaunch::new(&*app_name, app_path, false, &[] as &[&str]);
    auto
}

pub fn init_and_set_auto_launch(app_handle: &AppHandle, enable: bool) -> auto_launch::Result<()> {
    let auto = init_auto(&app_handle);
    if enable {
        auto.enable()?;
    } else {
        auto.disable()?;
    }
    debug!(
        "set auto launch:{} exe:{}",
        auto.is_enabled().unwrap(),
        auto.get_app_path().to_string()
    );
    Ok(())
}

#[tauri::command]
pub fn set_auto_launch(app_handle: AppHandle) -> String {
    let _ = init_and_set_auto_launch(&app_handle, true);
    success_json("success")
}

#[tauri::command]
pub fn unset_auto_launch(app_handle: AppHandle) -> String {
    let _ = init_and_set_auto_launch(&app_handle, false);
    success_json("success")
}
