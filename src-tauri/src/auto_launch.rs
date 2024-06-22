use auto_launch::AutoLaunch;
use log::debug;
use std::env::current_exe;
#[tauri::command]
pub fn set_auto_launch() {
    let app_name = "zerotier-toolkit";
    let mut current_exe = current_exe().unwrap();
    let app_path = current_exe.as_mut_os_string();
    let auto = AutoLaunch::new(app_name, app_path.to_str().unwrap(), &[] as &[&str]);

    // enable the auto launch
    let _ = auto.enable().is_ok();
    debug!(
        "set auto launch:{} exe:{}",
        auto.is_enabled().unwrap(),
        app_path.to_str().unwrap()
    )
}
