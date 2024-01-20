use std::ffi::CString;
use std::io::Error;
use std::io::ErrorKind::Other;
use std::process::{ExitStatus, Output};
use std::ptr;

use log::debug;
use serde::Serialize;
use winapi::shared::minwindef::{BOOL, DWORD};
use winapi::um::winnt::GENERIC_READ;
use winapi::um::winsvc::{
    CloseServiceHandle, ControlService, NotifyServiceStatusChangeA, OpenSCManagerA, OpenServiceA,
    StartServiceA, SC_HANDLE__, SC_MANAGER_ALL_ACCESS, SERVICE_CONTROL_STOP, SERVICE_NOTIFYA,
    SERVICE_NOTIFY_STATUS_CHANGE, SERVICE_START, SERVICE_STATUS, SERVICE_STATUS_HANDLE__,
    SERVICE_STOP,
};

use crate::command::{execute_cmd, execute_cmd_as_root, parse_output};

pub(crate) struct WindowsServiceManage {
    service_name: String,
    state: StartType,
}

#[derive(Debug, PartialEq, Serialize)]
pub enum StartType {
    AutoStart,
    DemandStart,
    Disabled,
    Unknown,
}

#[derive(Debug, Serialize)]
pub enum State {
    Stopped,
    Running,
    Unknown,
}

impl WindowsServiceManage {
    pub(crate) fn new(service_name: String) -> WindowsServiceManage {
        let instance = WindowsServiceManage {
            service_name,
            state: StartType::Unknown,
        };
        instance
    }
    pub(crate) fn get_service_info(&self) -> Result<String, Error> {
        let output = execute_cmd(vec![
            String::from("sc"),
            String::from("query"),
            self.service_name.clone(),
        ]);
        return Self::deal_with_cmd_result(output);
    }
    pub(crate) fn get_start_type(&self) -> Result<StartType, Error> {
        let output = execute_cmd(vec![
            String::from("sc"),
            String::from("qc"),
            self.service_name.clone(),
            String::from("|"),
            String::from("findstr"),
            String::from("START_TYPE"),
        ]);
        return match Self::deal_with_cmd_result(output) {
            Ok(start_type) => {
                return Ok(Self::transform_start_type(self, start_type));
            }
            Err(error) => Err(Error::new(
                Other,
                "执行命令异常".to_string() + &*error.to_string(),
            )),
        };
    }
    pub(crate) fn set_start_type(&self, start_type: String) -> Result<(), Error> {
        let mut start_type_cmd: String = String::from("");
        match start_type.as_str() {
            "AutoStart" => {
                start_type_cmd = String::from("auto");
            }
            "DemandStart" => {
                start_type_cmd = String::from("demand");
            }
            "Disabled" => {
                start_type_cmd = String::from("disabled");
            }
            _ => {}
        }
        let output = execute_cmd_as_root(vec![
            String::from("sc"),
            String::from("config"),
            self.service_name.clone(),
            String::from("start="),
            start_type_cmd,
        ]);
        return Self::deal_cmd_root_result(output);
    }

    pub(crate) fn start(&self) -> Result<(), Error> {
        let service_result = self.get_service_winapi(SERVICE_START);
        if service_result.is_err() {
            return Err(service_result.err().unwrap());
        }
        let (sc_manager, service) = service_result.ok().unwrap();
        let result = unsafe { StartServiceA(service, 0, ptr::null_mut()) };
        unsafe {
            CloseServiceHandle(service);
            CloseServiceHandle(sc_manager)
        };
        debug!("执行启动完成,结果:{}", result);
        if result < 1 {
            return Err(Error::new(Other, "启动失败"));
        }
        Ok(())
    }

    pub(crate) fn stop(&self) -> Result<(), Error> {
        let service_result = self.get_service_winapi(SERVICE_STOP);
        if service_result.is_err() {
            return Err(service_result.err().unwrap());
        }
        let (sc_manager, service) = service_result.ok().unwrap();

        let mut service_status: SERVICE_STATUS = unsafe { std::mem::zeroed() };
        let result: BOOL =
            unsafe { ControlService(service, SERVICE_CONTROL_STOP, &mut service_status) };
        unsafe {
            CloseServiceHandle(service);
            CloseServiceHandle(sc_manager)
        };
        debug!("执行关闭完成,结果:{}", result);
        if result < 1 {
            return Err(Error::new(Other, "关闭失败"));
        }
        Ok(())
    }

    pub(crate) fn get_state(&self) -> Result<State, Error> {
        let commands = vec![
            String::from("sc"),
            String::from("query"),
            self.service_name.clone(),
            String::from("|"),
            String::from("findstr"),
            String::from("STATE"),
        ];
        debug!("执行命令{:?}", commands.join(" "));
        let output = execute_cmd(commands);
        return match Self::deal_with_cmd_result(output) {
            Ok(start_type) => {
                return Ok(Self::transform_state(start_type));
            }
            Err(error) => Err(Error::new(
                Other,
                "执行命令异常".to_string() + &*error.to_string(),
            )),
        };
    }
    fn transform_state(string: String) -> State {
        if string.contains("STOP") {
            return State::Stopped;
        } else if string.contains("RUN") {
            return State::Running;
        }
        return State::Unknown;
    }
    fn transform_start_type(&self, string: String) -> StartType {
        if string.contains("AUTO") {
            return StartType::AutoStart;
        } else if string.contains("DEMAND") {
            return StartType::DemandStart;
        } else if string.contains("DISABLED") {
            return StartType::Disabled;
        }
        return StartType::Unknown;
    }
    fn deal_with_cmd_result(output: Result<Output, Error>) -> Result<String, Error> {
        return match output {
            Ok(value) => {
                let status = value.status;
                if !status.success() {
                    return Err(Error::new(Other, "执行命令异常"));
                }
                Ok(parse_output(value.stdout))
            }
            Err(error) => Err(Error::new(
                Other,
                "执行命令异常".to_string() + &*error.to_string(),
            )),
        };
    }
    fn deal_cmd_root_result(output: Result<ExitStatus, Error>) -> Result<(), Error> {
        return match output {
            Ok(value) => {
                if !value.success() {
                    return Err(Error::new(Other, "执行命令异常"));
                }
                Ok(())
            }
            Err(error) => Err(Error::new(
                Other,
                "执行命令异常".to_string() + &*error.to_string(),
            )),
        };
    }
    fn get_service_winapi(
        &self,
        dw_desired_access: DWORD,
    ) -> Result<(*mut SC_HANDLE__, *mut SC_HANDLE__), Error> {
        let sc_manager = unsafe { OpenSCManagerA(ptr::null(), ptr::null(), SC_MANAGER_ALL_ACCESS) };
        if sc_manager.is_null() {
            unsafe { CloseServiceHandle(sc_manager) };
            return Err(Error::new(Other, "请使用管理员权限开启"));
        }
        let service_name = CString::new(self.service_name.clone()).unwrap();
        let service = unsafe { OpenServiceA(sc_manager, service_name.as_ptr(), dw_desired_access) };
        if service.is_null() {
            unsafe { CloseServiceHandle(sc_manager) };
            return Err(Error::new(Other, "无法启动服务管理器"));
        }
        return Ok((sc_manager, service));
    }
}

#[cfg(test)]
mod tests {
    use lazy_static::lazy_static;

    use crate::windows_service_manage::StartType::AutoStart;
    use crate::windows_service_manage::WindowsServiceManage;

    lazy_static! {
        static ref INSTANCE: WindowsServiceManage =
            WindowsServiceManage::new(String::from("ToDesk_Service"));
    }
    #[test]
    fn test_get_start_type() {
        print!("{:?}", INSTANCE.get_start_type())
    }

    #[test]
    fn test_transform_start_type() {
        let start_type = INSTANCE.transform_start_type(String::from("AUTO_START"));
        assert_eq!(start_type, AutoStart)
    }
}
