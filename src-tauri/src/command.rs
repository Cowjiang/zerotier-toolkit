use std::process::{Command, Output};
use std::str::from_utf8;

pub(crate) fn execute_cmd(cmds: Vec<String>) -> Output {
    let final_cmd = std::iter::once("/C").chain(cmds.into_iter());
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
        let output = execute_cmd(vec!["echo", "hello"]);
        assert_eq!(parse_output(output.stdout), "hello\r\n");
    }
}