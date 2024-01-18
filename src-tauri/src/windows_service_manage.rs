use log::{debug, error};

use crate::command::{execute_cmd, parse_output};

pub(crate) struct WindowsServiceManage {
    service_name: String,
}

#[derive(Debug, PartialEq)]
pub enum StartType {
    AutoStart,
    DemandStart,
    Disabled,
    Unknown,
}

#[derive(Debug)]
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
    pub(crate) fn get_service_info(&self) -> String {
        let output = execute_cmd(vec![
            String::from("sc"),
            String::from("query"),
            self.service_name.clone(),
        ]);
        let status = output.status;
        if !status.success() {
            return "".to_string();
        }
        return parse_output(output.stdout);
    }

    pub(crate) fn get_start_type(&self) -> StartType {
        let output = execute_cmd(vec![
            String::from("sc"),
            String::from("qc"),
            self.service_name.clone(),
            String::from("|"),
            String::from("findstr"),
            String::from("START_TYPE"),
        ]);
        let status = output.status;
        if !status.success() {
            return StartType::Unknown;
        }
        let result = parse_output(output.stdout);

        return self.transform_start_type(result);
    }
    pub(crate) fn set_start_type(&self, start_type: String) {
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
        let output = execute_cmd(vec![
            String::from("sc"),
            String::from("config"),
            self.service_name.clone(),
            String::from("start="),
            start_type_cmd,
        ]);
        let status = output.status;
        if !status.success() {
            error!("修改失败:{:?}",parse_output(output.stderr));
        }
    }

    pub(crate) fn start(&self) {
        let output = execute_cmd(vec![
            String::from("net"),
            String::from("start"),
            self.service_name.clone(),
        ]);
        let status = output.status;
        if !status.success() {
            error!("启动失败:{:?}",parse_output(output.stderr));
        }
    }

    pub(crate) fn stop(&self) {
        let output = execute_cmd(vec![
            String::from("net"),
            String::from("stop"),
            self.service_name.clone()]);
        let status = output.status;
        if !status.success() {
            error!("停止失败:{:?}",parse_output(output.stderr));
        }
    }

    pub(crate) fn get_state(&self) -> State {
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

        let status = output.status;
        if !status.success() {
            return State::Unknown;
        }
        let result = parse_output(output.stdout);
        return self.transform_state(result);
    }
    fn transform_state(&self, string: String) -> State {
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