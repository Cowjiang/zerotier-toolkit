use log::error;

use crate::command::{execute_cmd, parse_output};

pub(crate) struct WindowsServiceManage {
    service_name: String,
}

#[derive(Debug)]
enum StartType {
    AutoStart,
    DemandStart,
    Disabled,
    Unknown,
}

enum State {
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
            self.service_name,
        ]);
        let status = output.status;
        if (!status.success()) {
            return "".to_string();
        }
        return parse_output(output.stdout);
    }

    pub(crate) fn get_start_type(&self) -> StartType {
        let output = execute_cmd(vec![
            String::from("sc"),
            String::from("qc"),
            self.service_name,
            String::from("|"),
            String::from("findstr"),
            String::from("\"START_TYPE\""),
        ]);
        let status = output.status;
        if (!status.success()) {
            return StartType::Unknown;
        }
        let result = parse_output(output.stdout);

        return self.transform_start_type(result);
    }
    pub(crate) fn set_start_type(&self, start_type: String) {
        let mut start_type_cmd: String;
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
            _ => {
                Err("Invalid start type")
            }
        }
        let output = execute_cmd(vec![
            String::from("sc"),
            String::from("config"),
            self.service_name,
            String::from("start="),
            start_type_cmd,
        ]);
        let status = output.status;
        if !status.success() {
            error!("修改失败:{:?}",parse_output(output.stderr));
            Err("修改失败")
        }
    }

    pub(crate) fn start(&self) {
        let output = execute_cmd(vec![
            String::from("net"),
            String::from("start"),
            self.service_name,
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
            self.service_name]);
        let status = output.status;
        if !status.success() {
            error!("停止失败:{:?}",parse_output(output.stderr));
        }
    }

    pub(crate) fn get_state(&self) -> State {
        let output = execute_cmd(vec![
            String::from("sc"),
            String::from("query"),
            self.service_name,
            String::from("|"),
            String::from("findstr"),
            String::from("\"START_TYPE\""),
        ]);
        let status = output.status;
        if (!status.success()) {
            return State::Unknown;
        }
        let result = parse_output(output.stdout);
        return self.transform_state(result);
    }
    pub(crate) fn transform_state(string: String) -> State {
        if (string.contains("STOP")) {
            return State::Stopped;
        } else if (string.contains("RUN")) {
            return State::Running;
        }
        return State::Unknown;
    }
    pub(crate)  fn transform_start_type(string: String) -> StartType {
        if (string.contains("AUTO")) {
            return StartType::AutoStart;
        } else if (string.contains("DEMAND")) {
            return StartType::DemandStart;
        } else if string.contains("DISABLED") {
            return StartType::Disabled;
        }
        return StartType::Unknown;
    }
}


#[cfg(test)]
mod tests {
    use crate::windows_service_manage::WindowsServiceManage;

    static instance: WindowsServiceManage = WindowsServiceManage::new(String::from("ToDesk_Service"));

    #[test]
    fn test_transform_start_type() {
        print!("{:?}", instance.get_start_type())
    }
}