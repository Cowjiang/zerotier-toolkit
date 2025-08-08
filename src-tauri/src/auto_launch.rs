use tauri::AppHandle;
use tauri_plugin_autostart::{Error, ManagerExt};

use crate::r::success_json;
type Result<T> = std::result::Result<T, Error>;
pub fn init_and_set_auto_launch(app_handle: &AppHandle, enable: bool) -> Result<()> {
    let auto = app_handle.autolaunch();

    if enable {
        auto.enable()
    } else {
        auto.disable()
    }
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
