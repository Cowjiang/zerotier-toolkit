#[cfg(test)]
mod tests {
    use tauri::utils::platform::current_exe;

    #[test]
    fn auto_launch() {
        print!("{:?}", current_exe().unwrap().as_os_str())
    }
}
