use log::debug;
use std::env::home_dir;
use std::fs::{File, OpenOptions};
use std::io::{Error, ErrorKind};
use std::path::PathBuf;

pub fn open_file_from_home_dir(file: &str, truncate: bool) -> Result<File, Error> {
    let file_from_home_dir = resolve_file_path(file)?;
    let mut open_options = OpenOptions::new();
    open_options.read(true).write(true).create(true);
    if truncate {
        open_options.truncate(true);
    }
    open_options.open(file_from_home_dir)
}

pub fn open_file_from_home_dir_default(file: &str) -> Result<File, Error> {
    open_file_from_home_dir(file, false)
}

pub fn write_file_from_home_dir(file: &str, content: &[u8]) -> Result<(), Error> {
    let file_from_home_dir = resolve_file_path(file)?;
    let tmp_path = PathBuf::from(format!("{}.tmp", file_from_home_dir.display()));
    std::fs::write(&tmp_path, content)?;
    std::fs::rename(&tmp_path, &file_from_home_dir)
}

pub fn get_path_buf_from_home_dir(file: &str) -> Option<PathBuf> {
    let mut home_dir = home_dir()?;
    home_dir.push(file);
    Some(home_dir)
}

fn resolve_file_path(file: &str) -> Result<PathBuf, Error> {
    let file_from_home_dir = get_path_buf_from_home_dir(file)
        .ok_or_else(|| Error::new(ErrorKind::NotFound, "resolve home dir fail"))?;
    let dir = file_from_home_dir
        .parent()
        .ok_or_else(|| Error::new(ErrorKind::InvalidInput, format!("invalid path:{file}")))?;
    if !dir.exists() {
        debug!("dir is not exist,create them:{}", dir.display());
        std::fs::create_dir_all(dir)?;
    }
    Ok(file_from_home_dir)
}
