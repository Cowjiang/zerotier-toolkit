
use log::debug;
use tauri::AppHandle;
use tauri_plugin_autostart::ManagerExt;

use crate::r::success_json;



pub fn init_and_set_auto_launch(app_handle: &AppHandle, enable: bool) -> auto_launch::Result<()> {
    let auto =  app_handle.autolaunch();
    if enable {
        auto.enable();
    } else {
        auto.disable();
    }
    debug!(
        "set auto launch:{} ",
        auto.is_enabled().unwrap()
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
