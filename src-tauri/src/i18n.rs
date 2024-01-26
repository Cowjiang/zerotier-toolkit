use std::{
    collections::HashMap,
    fs::File,
    io::{Error, ErrorKind},
    sync::RwLock,
};

use lazy_static::lazy_static;
use log::error;
use serde_json::Value;
lazy_static! {
    pub static ref TRANSLATION: RwLock<HashMap<String, String>> = RwLock::new(HashMap::new());
}
pub fn init_translation(file: File) {
    let mut translation = TRANSLATION.write().unwrap();
    let translation_from_file = serde_json::from_reader(file);
    if translation_from_file.is_err() {
        error!(
            "parse json file fail with:{:?}",
            translation_from_file.unwrap_err()
        );
        return;
    }
    let json_obj: Value = translation_from_file.unwrap();

    match json_obj.as_object() {
        Some(obj) => {
            for (key, value) in obj.iter() {
                translation.insert(key.clone(), value.to_string());
            }
        }
        None => error!("i18n file is not an object json"),
    }
}
