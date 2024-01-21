use std::string::ToString;
use std::thread;

use lazy_static::lazy_static;

use crate::r::{fail_message_json, success_json};
use crate::windows_service_manage::{StartType, WindowsServiceManage};

lazy_static! {
    static ref ZEROTIER_SERVICE_NAME: String = String::from("ZeroTierOneService");
    static ref ZEROTIER_SERVICE_MANAGE: WindowsServiceManage =
        WindowsServiceManage::new(ZEROTIER_SERVICE_NAME.to_string());
}

#[tauri::command]
pub(crate) fn get_zerotier_services() -> String {
    return match ZEROTIER_SERVICE_MANAGE.get_service_info() {
        Ok(value) => success_json(value),
        Err(err) => fail_message_json(err.to_string()),
    };
}

#[tauri::command]
pub(crate) fn get_zerotier_start_type() -> String {
    return match ZEROTIER_SERVICE_MANAGE.get_start_type() {
        Ok(value) => success_json(value),
        Err(err) => fail_message_json(err.to_string()),
    };
}

#[tauri::command]
pub(crate) fn set_zerotier_start_type(start_type: String) -> String {
    let resl_start_type = match start_type.as_str() {
        "AutoStart" => StartType::AutoStart,
        "DemandStart" => StartType::DemandStart,
        "Disabled" => StartType::Disabled,
        _ => StartType::DemandStart,
    };
    return match ZEROTIER_SERVICE_MANAGE.set_start_type(resl_start_type) {
        Ok(value) => success_json(value),
        Err(err) => fail_message_json(err.to_string()),
    };
}

#[tauri::command]
pub(crate) fn start_zerotier() -> String {
    return match ZEROTIER_SERVICE_MANAGE.start() {
        Ok(value) => success_json(value),
        Err(err) => fail_message_json(err.to_string()),
    };
}

#[tauri::command]
pub(crate) fn stop_zerotier() -> String {
    return match ZEROTIER_SERVICE_MANAGE.stop() {
        Ok(value) => success_json(value),
        Err(err) => fail_message_json(err.to_string()),
    };
}

#[tauri::command]
pub(crate) fn get_zerotier_state() -> String {
    return match ZEROTIER_SERVICE_MANAGE.get_state() {
        Ok(value) => success_json(format!("{:?}", value)),
        Err(err) => fail_message_json(err.to_string()),
    };
}

#[cfg(test)]
mod tests {
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

    #[test]
    fn test_start_zerotier() {
        setup();
        info!("test_start_zerotier:{:?}", start_zerotier());
        let state = get_zerotier_state();
        info!("test_start_zerotier:{:?}", state);
    }

    #[test]
    fn test_stop_zerotier() {
        setup();
        info!("test_stop_zerotier:{:?}", stop_zerotier());
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
        loop {}
    }
}
