use auto_launch::AutoLaunch;
use log::debug;
use std::env::current_exe;
use tauri::AppHandle;

fn init_auto(app_handle: AppHandle) -> AutoLaunch {
    let config = app_handle.config();
    let package = &config.package;
    let default = ("".to_string());
    let product_name = package.product_name.as_ref().unwrap_or(&default);
    let version = package.version.as_ref().unwrap_or(&default);
    let app_name = format!("{}@{}", product_name, version);
    let mut current_exe = current_exe().unwrap();
    let app_path = current_exe.as_mut_os_string();
    #[cfg(not(macos))]
    let auto = AutoLaunch::new(
        app_name.as_str(),
        app_path.to_str().unwrap(),
        &[] as &[&str],
    );
    #[cfg(macos)]
    let auto = AutoLaunch::new(app_name, app_path.to_str().unwrap(), false, &[] as &[&str]);
    auto
}

#[tauri::command]
pub fn set_auto_launch(app_handle: AppHandle) {
    let auto = init_auto(app_handle.clone());
    let _ = auto.enable().is_ok();
    debug!(
        "set auto launch:{} exe:{}",
        auto.is_enabled().unwrap(),
        auto.get_app_path().to_string()
    )
}

#[tauri::command]
pub fn unset_auto_launch(app_handle: AppHandle) {
    let auto = init_auto(app_handle.clone());
    let _ = auto.disable().is_ok();
    debug!(
        "set auto launch:{} exe:{}",
        auto.is_enabled().unwrap(),
        auto.get_app_path().to_string()
    )
}
