use std::ffi::CString;
use std::io::Error;
use std::io::ErrorKind::Other;
use std::process::Output;
use std::ptr;

use log::{debug, error, warn};
use serde::Serialize;
use winapi::shared::minwindef::{BOOL, DWORD};
use winapi::um::errhandlingapi::GetLastError;
use winapi::um::winbase::FormatMessageW;
use winapi::um::winnt::{PVOID, SERVICE_AUTO_START, SERVICE_DEMAND_START, SERVICE_DISABLED};
use winapi::um::winsvc::{
    ChangeServiceConfigA, CloseServiceHandle, ControlService, NotifyServiceStatusChangeA,
    OpenSCManagerA, OpenServiceA, StartServiceA, PSERVICE_NOTIFYA, SC_HANDLE__,
    SC_MANAGER_ALL_ACCESS, SERVICE_ALL_ACCESS, SERVICE_CHANGE_CONFIG, SERVICE_CONTROL_STOP,
    SERVICE_NO_CHANGE, SERVICE_START, SERVICE_STATUS, SERVICE_STOP,
};

use crate::command::{execute_cmd, parse_output};

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
        let register_result = instance.register_state_listener();
        match register_result {
            Ok(_ignored) => {}
            Err(error) => {
                error!("启动监听失败:{}", error)
            }
        }
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
    pub(crate) fn set_start_type(&self, start_type: StartType) -> Result<(), Error> {
        let service_result = self.get_service_winapi(SERVICE_CHANGE_CONFIG);
        if service_result.is_err() {
            return Err(service_result.err().unwrap());
        }
        let (sc_manager, service) = service_result.ok().unwrap();
        let win_start_type = match start_type {
            StartType::AutoStart => SERVICE_AUTO_START,
            StartType::DemandStart => SERVICE_DEMAND_START,
            StartType::Disabled => SERVICE_DISABLED,
            StartType::Unknown => SERVICE_DEMAND_START,
        };

        // 更改服务配置
        let result = unsafe {
            ChangeServiceConfigA(
                service,
                SERVICE_NO_CHANGE,
                win_start_type,
                SERVICE_NO_CHANGE,
                ptr::null(),
                ptr::null(),
                ptr::null_mut(),
                ptr::null(),
                ptr::null(),
                ptr::null(),
                ptr::null(),
            )
        };
        unsafe {
            CloseServiceHandle(service);
            CloseServiceHandle(sc_manager)
        };
        debug!("执行修改完成,结果:{}", result);
        if result < 1 {
            return Err(Error::new(
                Other,
                format!("修改失败:{:?}", Self::get_last_error()),
            ));
        }
        Ok(())
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
            return Err(Error::new(
                Other,
                format!("启动失败{:?}", Self::get_last_error()),
            ));
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
            return Err(Error::new(
                Other,
                format!("关闭失败{:?}", Self::get_last_error()),
            ));
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
            return Err(Error::new(
                Other,
                format!("无法启动服务管理器{:?}", Self::get_last_error()),
            ));
        }
        return Ok((sc_manager, service));
    }
    fn get_last_error() -> String {
        // 获取错误码
        let error_code = unsafe { GetLastError() };

        // 将错误码转换为错误信息
        let mut wide_buffer: Vec<u16> = Vec::with_capacity(256);
        let formatted_message_size = unsafe {
            FormatMessageW(
                winapi::um::winbase::FORMAT_MESSAGE_FROM_SYSTEM,
                ptr::null_mut(),
                error_code,
                0,
                wide_buffer.as_mut_ptr(),
                wide_buffer.capacity() as u32,
                ptr::null_mut(),
            )
        };
        let mut error_message = String::from("");
        if formatted_message_size > 0 {
            unsafe { wide_buffer.set_len(formatted_message_size as usize) };
            error_message = String::from_utf16_lossy(&wide_buffer);
        }
        error_message
    }
    fn register_state_listener(&self) -> Result<(), Error> {
        let service_result = self.get_service_winapi(SERVICE_ALL_ACCESS);
        if service_result.is_err() {
            return Err(service_result.err().unwrap());
        }
        let (sc_manager, service) = service_result.ok().unwrap();
        let service_notify: PSERVICE_NOTIFYA = unsafe { std::mem::zeroed() };
        (unsafe { *service_notify }).pfnNotifyCallback = Some(callback);
        extern "system" fn callback(p_parameter: PVOID) {
            debug!("接受到状态变化:{:?}", p_parameter)
        }
        let result = unsafe { NotifyServiceStatusChangeA(service, 0, service_notify) };
        unsafe {
            CloseServiceHandle(service);
            CloseServiceHandle(sc_manager)
        };
        debug!("启动服务状态监听,结果:{}", result);
        if result < 1 {
            return Err(Error::new(
                Other,
                format!("启动失败{:?}", Self::get_last_error()),
            ));
        }
        Ok(())
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
