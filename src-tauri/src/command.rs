use std::process::{Command, Output};
use std::str::from_utf8;

pub(crate) fn execute_cmd(cmds: Vec<String>) -> Output {
    let cmd_str:Vec<&str> = cmds.iter().map(|s| s.as_str()).collect();
    let final_cmd = std::iter::once("/C").chain(cmd_str);
    let output = Command::new("cmd")
        .args(final_cmd)
        .output()
        .expect("");
    output
}

pub(crate) fn parse_output(output: Vec<u8>) -> String {
    from_utf8(&*output).unwrap().to_string()
}


#[cfg(test)]
mod tests {
    use crate::command::{execute_cmd, parse_output};

    #[test]
    fn test_execute_cmd() {
        let output = execute_cmd(vec![String::from("echo"), String::from("hello")]);
        assert_eq!(parse_output(output.stdout), "hello\r\n");
    }
}