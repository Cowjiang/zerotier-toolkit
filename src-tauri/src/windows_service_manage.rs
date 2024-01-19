use std::io::Error;
use std::io::ErrorKind::Other;
use std::process::{ExitStatus, Output};

use log::debug;
use serde::Serialize;

use crate::command::{execute_cmd, execute_cmd_as_root, parse_output};

pub(crate) struct WindowsServiceManage {
    service_name: String,
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
        WindowsServiceManage {
            service_name
        }
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
            Err(error) => {
                Err(Error::new(Other, "执行命令异常".to_string() + &*error.to_string()))
            }
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
        let output = execute_cmd_as_root(vec![
            String::from("net"),
            String::from("start"),
            self.service_name.clone(),
        ]);
        return Self::deal_cmd_root_result(output);
    }

    pub(crate) fn stop(&self) -> Result<(), Error> {
        let output = execute_cmd_as_root(vec![
            String::from("net"),
            String::from("stop"),
            self.service_name.clone()]);
        return Self::deal_cmd_root_result(output);
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
        debug!("执行命令{:?}",commands.join(" "));
        let output = execute_cmd(commands);
        return match Self::deal_with_cmd_result(output) {
            Ok(start_type) => {
                return Ok(Self::transform_state(start_type));
            }
            Err(error) => {
                Err(Error::new(Other, "执行命令异常".to_string() + &*error.to_string()))
            }
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
            Err(error) => {
                Err(Error::new(Other, "执行命令异常".to_string() + &*error.to_string()))
            }
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
            Err(error) => {
                Err(Error::new(Other, "执行命令异常".to_string() + &*error.to_string()))
            }
        };
    }
}


#[cfg(test)]
mod tests {
    use lazy_static::lazy_static;

    use crate::windows_service_manage::StartType::AutoStart;
    use crate::windows_service_manage::WindowsServiceManage;

    lazy_static! {
    static ref INSTANCE: WindowsServiceManage ={
            WindowsServiceManage::new(String::from("ToDesk_Service"))
        };
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