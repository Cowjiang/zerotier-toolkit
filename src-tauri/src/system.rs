use std::env;

use serde::de::value;
use tauri::AppHandle;

use crate::{
    execute_cmd,
    r::{self, fail_message_json, success, success_json},
};

#[tauri::command]
pub(crate) fn restart_as_admin() -> String {
    let current = env::current_exe().unwrap();
    let exec_path = current.to_str();
    if exec_path.is_none() {
        return fail_message_json(String::from("重启失败"));
    }
    let exec_path = exec_path.unwrap();
    let output = execute_cmd(vec![
        String::from("powershell"),
        String::from("-Command"),
        String::from("Start-Process"),
        String::from("-FilePath"),
        String::from(exec_path),
        String::from("-Verb"),
        String::from("\"RunAs\""),
        String::from("-WindowStyle"),
        String::from("Hidden"),
    ]);
    return match output {
        Ok(value) => {
            let status = value.status;
            if !status.success() {
                return fail_message_json(String::from("重启失败"));
            }
            return success_json("成功");
        }
        Err(err) => fail_message_json(err.to_string()),
    };
}

#[cfg(test)]
mod tests {
    use super::restart_as_admin;

    #[test]
    fn test_restart_as_admin() {
        restart_as_admin();
    }
}
