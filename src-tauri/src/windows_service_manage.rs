use std::ffi::CString;
use std::io::Error;
use std::io::ErrorKind::Other;
use std::process::Output;
use std::ptr::{self};
use std::sync::{Arc, Mutex};
use std::thread;

use log::{debug, error};
use serde::Serialize;
use winapi::shared::minwindef::{BOOL, DWORD, FALSE, TRUE};
use winapi::shared::winerror::ERROR_SUCCESS;
use winapi::um::errhandlingapi::GetLastError;
use winapi::um::oaidl::MEMBERID;
use winapi::um::synchapi::{CreateEventA, WaitForSingleObjectEx};
use winapi::um::winbase::{FormatMessageW, WAIT_FAILED};
use winapi::um::winnt::{PVOID, SERVICE_AUTO_START, SERVICE_DEMAND_START, SERVICE_DISABLED};
use winapi::um::winsvc::{
    ChangeServiceConfigA, CloseServiceHandle, ControlService, NotifyServiceStatusChangeA,
    OpenSCManagerA, OpenServiceA, StartServiceA, SC_HANDLE__, SC_MANAGER_ALL_ACCESS,
    SERVICE_ALL_ACCESS, SERVICE_CHANGE_CONFIG, SERVICE_CONTROL_STOP, SERVICE_NOTIFY_2A,
    SERVICE_NOTIFY_RUNNING, SERVICE_NOTIFY_START_PENDING, SERVICE_NOTIFY_STATUS_CHANGE,
    SERVICE_NOTIFY_STOPPED, SERVICE_NOTIFY_STOP_PENDING, SERVICE_NO_CHANGE, SERVICE_RUNNING,
    SERVICE_START, SERVICE_START_PENDING, SERVICE_STATUS, SERVICE_STOP, SERVICE_STOPPED,
    SERVICE_STOP_PENDING,
};

use crate::command::{execute_cmd, parse_output};

pub(crate) struct WindowsServiceManage {
    service_name: String,
    state: State,
    stop_listent_state: bool,
    write_lock: Mutex<i8>,
}

#[derive(Debug, PartialEq, Serialize)]
pub enum StartType {
    AutoStart,
    DemandStart,
    Disabled,
    Unknown,
}

#[derive(Debug, PartialEq, Serialize)]
pub enum State {
    StartPending,
    StopPending,
    Stopped,
    Running,
    Unknown,
}

impl WindowsServiceManage {
    pub(crate) fn new(service_name: String) -> WindowsServiceManage {
        let instance = Self {
            service_name,
            state: State::Unknown,
            stop_listent_state: false,
            write_lock: Mutex::new(0),
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
        debug!("执行修改完成,结果:{}", result);
        unsafe {
            CloseServiceHandle(sc_manager);
            CloseServiceHandle(service);
        }
        if result == 0 {
            return Err(Error::new(
                Other,
                format!("修改失败:{:?}", self.get_last_error()),
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

        debug!("执行启动完成,结果:{}", result);
        unsafe {
            CloseServiceHandle(sc_manager);
            CloseServiceHandle(service);
        }
        if result == 0 {
            return Err(Error::new(
                Other,
                format!("启动失败{:?}", self.get_last_error()),
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

        debug!("执行关闭完成,结果:{}", result);
        unsafe {
            CloseServiceHandle(sc_manager);
            CloseServiceHandle(service);
        }
        if result == 0 {
            return Err(Error::new(
                Other,
                format!("关闭失败{:?}", self.get_last_error()),
            ));
        }
        Ok(())
    }

    pub(crate) fn get_state(&self) -> Result<*const State, Error> {
        if self.state != State::Unknown {
            return Ok(&self.state);
        }
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
    fn transform_state(string: String) -> *const State {
        if string.contains("STOP") {
            return &State::Stopped;
        } else if string.contains("RUN") {
            return &State::Running;
        }
        return &State::Unknown;
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
                format!("无法启动服务管理器{:?}", self.get_last_error()),
            ));
        }
        return Ok((sc_manager, service));
    }
    fn get_last_error(&self) -> String {
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
    fn update_state(&mut self, state: State) {
        self.state = state
    }
    /**
     * 已经可以工作了，但是不懂如何让他异步更新self.state
     */
    pub(crate) async fn register_state_listener(&mut self) {
        let service_result = self.get_service_winapi(SERVICE_ALL_ACCESS);
        if service_result.is_err() {
            error!("启动异步监听失败{}", self.get_last_error());
        }
        let (sc_manager, service) = service_result.ok().unwrap();
        let event_handler = unsafe { CreateEventA(ptr::null_mut(), TRUE, FALSE, ptr::null()) };
        let mut service_notify: SERVICE_NOTIFY_2A = unsafe { std::mem::zeroed() };
        service_notify.pfnNotifyCallback = Some(callback);
        service_notify.dwVersion = SERVICE_NOTIFY_STATUS_CHANGE;
        service_notify.pContext = event_handler;
        // 将字符串转换为字节数组
        let mut my_bytes = self.service_name.clone().into_bytes();
        let raw_ptr: *mut i8 = my_bytes.as_mut_ptr() as *mut i8;
        service_notify.pszServiceNames = raw_ptr;
        loop {
            let result = unsafe {
                NotifyServiceStatusChangeA(
                    service,
                    SERVICE_NOTIFY_RUNNING
                        | SERVICE_NOTIFY_START_PENDING
                        | SERVICE_NOTIFY_STOP_PENDING
                        | SERVICE_NOTIFY_STOPPED,
                    &mut service_notify,
                )
            };

            debug!("启动服务状态监听,结果:{}", result);
            if result != ERROR_SUCCESS {
                error!("启动监听失败{:?}", self.get_last_error());
                return;
            }
            let wait_result = unsafe { WaitForSingleObjectEx(event_handler, 99999999, TRUE) };

            if wait_result == WAIT_FAILED {
                return error!("等待通知失败{:?}", self.get_last_error());
            }
            debug!(
                "收到通知,状态为:{:?}",
                service_notify.ServiceStatus.dwCurrentState
            );
            self.update_state(match service_notify.ServiceStatus.dwCurrentState {
                SERVICE_RUNNING => State::Running,
                SERVICE_START_PENDING => State::StartPending,
                SERVICE_STOP_PENDING => State::StopPending,
                SERVICE_STOPPED => State::Stopped,
                _ => State::Unknown,
            });
            if self.stop_listent_state {
                break;
            }
        }
        unsafe {
            CloseServiceHandle(sc_manager);
            CloseServiceHandle(service);
        }
    }
}

extern "system" fn callback(_p_parameter: PVOID) {}
#[cfg(test)]
mod tests {
    use std::sync::Arc;

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
