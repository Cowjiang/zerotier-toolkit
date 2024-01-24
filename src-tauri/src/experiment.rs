#[cfg(test)]
mod tests {
    use std::{
        ffi::CString,
        mem,
        process::{Command, Stdio},
        ptr,
    };

    use winapi::{
        shared::{
            minwindef::{FALSE, TRUE},
            ntdef::LPSTR,
        },
        um::processthreadsapi::{CreateProcessA, PROCESS_INFORMATION, STARTUPINFOA},
    };

    #[test]
    fn sub_process_test() {
        let _ignore = Command::new("cmd")
            .args(&[
                "/C",
                "D:\\project\\tauri-react-demo\\src-tauri\\target\\release\\start-as-admin.bat",
            ])
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .stdin(Stdio::null())
            .spawn();
    }

    #[test]
    fn borhter_process_test() {
        let command_line = CString::new("D:\\project\\tauri-react-demo\\src-tauri\\target\\release\\tauri-react-zerotier-toolkit.exe").unwrap();
        let mut startup_info: STARTUPINFOA = unsafe { mem::zeroed() };
        startup_info.cb = mem::size_of::<STARTUPINFOA>() as u32;

        let mut process_info: PROCESS_INFORMATION = unsafe { mem::zeroed() };
        let success = unsafe {
            CreateProcessA(
                ptr::null_mut(),
                command_line.as_ptr() as LPSTR,
                ptr::null_mut(),
                ptr::null_mut(),
                FALSE,
                0,
                ptr::null_mut(),
                ptr::null_mut(),
                &mut startup_info,
                &mut process_info,
            )
        };
        if success != TRUE {
            println!("失败了铁汁");

            return;
        }
        loop {}
    }
}
