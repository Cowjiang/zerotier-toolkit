
use crate::{
    execute_cmd,
    r::{fail_message_json, success_json},
};
use log::debug;
use std::env;

#[tauri::command]
pub(crate) fn restart_as_admin() -> String {
    #[cfg(windows)]
    {
        let current = env::current_exe().unwrap();
        let exec_path = current.to_str();
        if exec_path.is_none() {
            return fail_message_json("failed to get current exe path");
        }
        let exec_path = exec_path.unwrap();
        let output = execute_cmd(vec![
            String::from("powershell"),
            String::from("-Command"),
            format!(
                "Start-Process -FilePath '{}' -Verb RunAs -WindowStyle Hidden",
                exec_path
            ),
        ]);
        match output {
            Ok(value) => {
                let status = value.status;
                debug!("restart as admin status: {:?}", status);
                if !status.success() {
                    return fail_message_json("restart failed, please restart manually");
                }
                return success_json("success");
            }
            Err(err) => fail_message_json(&err.to_string()),
        }
    }
    #[cfg(not(windows))]
    {
        use crate::r::unsupported_platform;
        unsupported_platform()
    }
}

#[tauri::command]
pub(crate) fn open_in_operation_system(something: String) -> String {
    return match open::that(something) {
        Ok(_) => success_json("success"),
        Err(err) => fail_message_json(&err.to_string()),
    };
}

#[cfg(test)]
mod tests {
    use super::restart_as_admin;

    #[cfg(windows)]
    #[test]
    fn test_restart_as_admin() {
        restart_as_admin();
    }
}
