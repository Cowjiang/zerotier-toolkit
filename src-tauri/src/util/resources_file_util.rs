use std::fs::OpenOptions;

use log::debug;
use tauri::AppHandle;

pub fn open_config_file(
    app_handle: &AppHandle,
    file: &str,
    truncate: bool,
) -> Result<std::fs::File, std::io::Error> {
    let opt_configuration_json_file = app_handle.path_resolver().resolve_resource(file);
    if opt_configuration_json_file.is_none() {
        debug!("{file} is not exist.");
        return Err(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "file not found",
        ));
    }
    let json_file_path = opt_configuration_json_file.unwrap();
    let dir = json_file_path.parent().unwrap();
    if !dir.exists() {
        std::fs::create_dir_all(dir)?;
    }
    let mut open_options = OpenOptions::new();
    open_options.read(true).write(true).create(true);
    if truncate {
        open_options.truncate(true);
    }
    open_options.open(json_file_path)
}

pub fn open_config_file_truncate(
    app_handle: &AppHandle,
    file: &str,
) -> Result<std::fs::File, std::io::Error> {
    open_config_file(app_handle, file, true)
}

pub fn open_config_file_default(
    app_handle: &AppHandle,
    file: &str,
) -> Result<std::fs::File, std::io::Error> {
    open_config_file(app_handle, file, false)
}