use std::fs::{File, OpenOptions};
use std::io::Error;
use std::path::PathBuf;

use log::debug;
use tauri::AppHandle;


pub fn open_config_file(
    app_handle: &AppHandle,
    file: &str,
    truncate: bool,
) -> Result<File, Error> {
    let opt_configuration_json_file = get_path_buf_from_resource(app_handle, file);
    let json_file_path = opt_configuration_json_file.unwrap();
    let dir = json_file_path.parent().unwrap();
    if !dir.exists() {
        debug!("config dir is not exist,create dir:{}",dir.to_str().unwrap());
        std::fs::create_dir_all(dir)?;
    }
    let mut open_options = OpenOptions::new();
    open_options.read(true).write(true).create(true);
    if truncate {
        open_options.truncate(true);
    }
    open_options.open(json_file_path)
}

pub fn get_path_buf_from_resource(app_handle: &AppHandle, file: &str) -> Option<PathBuf> {
    app_handle.path_resolver().resolve_resource(file)
}

pub fn open_file_from_path_buf(path_buf: &PathBuf) -> std::io::Result<File> {
    let dir = path_buf.parent().unwrap();
    if !dir.exists() {
        std::fs::create_dir_all(dir)?;
    }
    let mut open_options = OpenOptions::new();
    open_options.read(true).write(true).create(true);
    open_options.open(path_buf)
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