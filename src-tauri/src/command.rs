use std::io;
use std::process::{Command, Output};

use crate::r::{self, R};

pub(crate) fn execute_cmd(cmds: Vec<String>) -> io::Result<Output> {
    let cmd_str: Vec<&str> = cmds.iter().map(|s| s.as_str()).collect();
    let final_cmd = std::iter::once("/C").chain(cmd_str);
    let output = Command::new("cmd").args(final_cmd).output();
    output
}

pub(crate) fn parse_output(output: Vec<u8>) -> String {
    let result = String::from_utf8_lossy(&*output);
    return result.to_string();
}

#[tauri::command]
pub(crate) fn is_admin() -> String {
    let output = execute_cmd(vec![String::from("net session")]);
    match output {
        Ok(_value) => {
            if _value.status.success() {
                r::success_json(String::from("管理呀铁铁"))
            } else {
                r::success_json(String::from("你不是管理捏"))
            }
        }
        Err(_error) => r::success_json(String::from("你不是管理捏")),
    }
}

#[cfg(test)]
mod tests {

    use log::info;

    use crate::{
        command::{execute_cmd, is_admin, parse_output},
        logger::init_logger_with_level,
    };

    fn setup() {
        init_logger_with_level(log::LevelFilter::Debug)
    }
    #[test]
    fn test_execute_cmd() {
        let output = execute_cmd(vec![String::from("echo"), String::from("hello")]);
        match output {
            Ok(value) => {
                let output = parse_output(value.stdout);
                println!("{}", output);
                assert_eq!(output, "hello\r\n");
            }
            _ => {}
        }
    }

    #[test]
    fn test_is_admin() {
        setup();
        info!("{}", is_admin());
    }
}
