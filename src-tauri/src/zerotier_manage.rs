use std::any::Any;
use std::string::ToString;

use crate::windows_service_manage::WindowsServiceManage;

static ZERO_TIER_SERVICE_NAME: String = String::from("ZeroTierOneService");
static ZERO_TIER_SERVICE_MANAGE: WindowsServiceManage = WindowsServiceManage::new(ZERO_TIER_SERVICE_NAME.to_string());


#[tauri::command]
pub(crate) fn get_zerotier_services() -> String {
    return ZERO_TIER_SERVICE_MANAGE.get_service_info();
}

/**
 * Returns AUTO_START DEMAND_START DISABLED UNKNOWN
 */
#[tauri::command]
pub(crate) fn get_zerotier_start_type() -> String {
    return format!("{:?}", ZERO_TIER_SERVICE_MANAGE.get_start_type());
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
