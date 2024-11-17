use std::fs::{File, OpenOptions};
use std::io::Error;
use std::path::PathBuf;
use log::debug;
use tauri::api::path::home_dir;


pub fn open_file_from_home_dir(file: &str, truncate: bool) -> Result<File, Error> {
    let file_from_home_dir = get_path_buf_from_home_dir(file).unwrap();
    let dir = file_from_home_dir.parent().unwrap();
    if !dir.exists() {
        debug!("dir is not exist,create them:{}",dir.to_str().unwrap());
        std::fs::create_dir_all(dir)?;
    }
    let mut open_options = OpenOptions::new();
    open_options.read(true).write(true).create(true);
    if truncate {
        open_options.truncate(true);
    }
    open_options.open(file_from_home_dir)
}

pub fn open_file_from_home_dir_truncate(file: &str) -> Result<File, Error> {
    open_file_from_home_dir(file, true)
}

pub fn open_file_from_home_dir_default(file: &str) -> Result<File, Error> {
    open_file_from_home_dir(file, false)
}


pub fn get_path_buf_from_home_dir(file: &str) -> Option<PathBuf> {
    let mut home_dir = home_dir()?;
    home_dir.push(file);
    Some(home_dir)
}





