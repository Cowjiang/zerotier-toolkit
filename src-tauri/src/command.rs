use std::io;
use std::process::{Command, Output};
use std::str::from_utf8;

use log::error;

pub(crate) fn execute_cmd(cmds: Vec<String>) -> io::Result<Output> {
    let cmd_str: Vec<&str> = cmds.iter().map(|s| s.as_str()).collect();
    let final_cmd = std::iter::once("/C").chain(cmd_str);
    let output = Command::new("cmd").args(final_cmd).output();
    output
}

pub(crate) fn parse_output(output: Vec<u8>) -> String {
    let result = from_utf8(&*output);
    return match result {
        Ok(value) => value.to_string(),
        Err(error) => {
            error!("解析结果错误:{}", error);
            "".to_string()
        }
    };
}
pub(crate) fn is_admin() -> String {
    let output = execute_cmd(vec![String::from("net"),String::from("sessoin")]);
    parse_output(output.unwrap().stdout)
}

#[cfg(test)]
mod tests {

    use crate::command::{execute_cmd, is_admin, parse_output};

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
        println!("{}", is_admin());
    }
}
