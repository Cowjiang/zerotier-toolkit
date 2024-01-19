use std::ffi::OsString;
use std::io;
use std::process::{Command, ExitStatus, Output};
use std::str::from_utf8;

use log::error;

pub(crate) fn execute_cmd(cmds: Vec<String>) -> io::Result<Output> {
    let cmd_str: Vec<&str> = cmds.iter().map(|s| s.as_str()).collect();
    let final_cmd = std::iter::once("/C").chain(cmd_str);
    let output = Command::new("cmd")
        .args(final_cmd)
        .output();
    output
}

pub(crate) fn execute_cmd_as_root(cmds: Vec<String>) -> io::Result<ExitStatus> {
    let cmd_str: Vec<&str> = cmds.iter().map(|s| s.as_str()).collect();
    let final_cmd = std::iter::once("/C").chain(cmd_str);
    let os_cmd: Vec<OsString> = final_cmd.into_iter()
        .map(|s| OsString::from(s))
        .collect();
    let output = runas::Command::new("cmd")
        .args(&*os_cmd)
        .status();
    output
}

pub(crate) fn parse_output(output: Vec<u8>) -> String {
    let result = from_utf8(&*output);
    return match result {
        Ok(value) => {
            value.to_string()
        }
        Err(error) => {
            error!("解析结果错误:{}",error);
            "".to_string()
        }
    };
}


#[cfg(test)]
mod tests {
    use crate::command::{execute_cmd, execute_cmd_as_root, parse_output};

    #[test]
    fn test_execute_cmd() {
        let output = execute_cmd(vec![String::from("echo"), String::from("hello")]);
        match output {
            Ok(value) => {
                assert_eq!(parse_output(value.stdout), "hello\r\n");
            }
            _ => {}
        }
    }

    #[test]
    fn test_runas() {
        let status = execute_cmd_as_root(vec![String::from("echo"), String::from("hello")]);
        assert_eq!(status.expect("异常").success(), true)
    }
}