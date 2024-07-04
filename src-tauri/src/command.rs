use std::io;
#[cfg(windows)]
use std::os::windows::process::CommandExt;
use std::process::{Command, Output};

#[cfg(windows)]
use winapi::um::winbase::CREATE_NO_WINDOW;

use crate::r::{self};

pub(crate) fn execute_cmd(cmds: Vec<String>) -> io::Result<Output> {
    let cmd_str: Vec<&str> = cmds.iter().map(|s| s.as_str()).collect();
    let final_cmd = std::iter::once("/C").chain(cmd_str);
    let mut command = Command::new("cmd");

    #[cfg(windows)]
    command.creation_flags(CREATE_NO_WINDOW);

    command.args(final_cmd).output()
}

pub(crate) fn parse_output(output: Vec<u8>) -> String {
    let result = String::from_utf8_lossy(&*output);
    return result.to_string();
}
#[cfg(windows)]
#[tauri::command]
pub(crate) fn is_admin() -> String {
    let output = execute_cmd(vec![String::from("net session")]);
    match output {
        Ok(_value) => {
            if _value.status.success() {
                r::success_json(true)
            } else {
                r::success_json(false)
            }
        }
        Err(_error) => r::success_json(false),
    }
}

#[cfg(not(windows))]
#[tauri::command]
pub(crate) fn is_admin() -> String {
    r::fail_message_json("api not support")
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
                // do not use equals, the output \n or \r\n is different on windows and linux
                assert!(output.starts_with("hello"));
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
