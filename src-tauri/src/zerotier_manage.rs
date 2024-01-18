
use std::string::ToString;

use lazy_static::lazy_static;

use crate::windows_service_manage::WindowsServiceManage;

lazy_static! {
    static ref ZEROTIER_SERVICE_NAME: String = {
        String::from("ZeroTierOneService")
    };
    static ref ZEROTIER_SERVICE_MANAGE: WindowsServiceManage = {
      WindowsServiceManage::new(ZEROTIER_SERVICE_NAME.to_string())
    };
}

#[tauri::command]
pub(crate) fn get_zerotier_services() -> String {
    return ZEROTIER_SERVICE_MANAGE.get_service_info();
}

#[tauri::command]
pub(crate) fn get_zerotier_start_type() -> String {
    return format!("{:?}", ZEROTIER_SERVICE_MANAGE.get_start_type());
}

#[tauri::command]
pub(crate) fn set_zerotier_start_type(start_type: String) {
    ZEROTIER_SERVICE_MANAGE.set_start_type(start_type);
}

#[tauri::command]
pub(crate) fn start_zerotier()  {
    ZEROTIER_SERVICE_MANAGE.start();
}

#[tauri::command]
pub(crate) fn stop_zerotier()  {
    ZEROTIER_SERVICE_MANAGE.stop();
}

#[tauri::command]
pub(crate) fn get_zerotier_state() -> String {
  return  format!("{:?}", ZEROTIER_SERVICE_MANAGE.get_state());
}


#[cfg(test)]
mod tests {
    use log::info;

    use crate::logger::init_logger;
    use crate::zerotier_manage::get_zerotier_services;

    fn setup() {
        init_logger()
    }

    #[test]
    fn test_get_zerotier_services() {
        setup();
        info!("result:{:?}", get_zerotier_services())
    }
}
