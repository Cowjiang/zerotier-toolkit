use crate::r::{fail_message_json, success_json};
use chrono::{DateTime, Local};
use lazy_static::lazy_static;
use log::error;
use tauri_plugin_http::reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::from_str;
use serde_with::{serde_as, NoneAsEmptyString};
use std::sync::Arc;
use tauri::AppHandle;
use thiserror::Error;
use tokio::sync::Mutex;

const UPDATE_CHECK_INTERVAL: i64 = 60;

#[derive(Error, Debug)]
enum Error {
    #[error("Check from local error:{0}")]
    CheckFromRemoteError(String),
}

#[serde_as]
#[derive(Deserialize, Serialize)]
struct LatestVersionResult {
    current_version: Option<String>,
    latest_version: Option<String>,
    #[serde_as(as = "NoneAsEmptyString")]
    latest_time: Option<DateTime<Local>>,
}

impl LatestVersionResult {}

impl Clone for LatestVersionResult {
    fn clone(&self) -> Self {
        LatestVersionResult {
            current_version: self.current_version.clone(),
            latest_version: self.latest_version.clone(),
            latest_time: self.latest_time.clone(),
        }
    }
}

const LATEST_VERSION_URL: &str =
    "https://api.github.com/repos/Cowjiang/zerotier-toolkit/releases/latest";
#[derive(Deserialize)]
struct LatestVersionResponseFromGit {
    tag_name: String,
}

lazy_static! {
    static ref LATEST_VERSION_HOLDER: Arc<Mutex<LatestVersionResult>> =
        Arc::new(Mutex::new(LatestVersionResult {
            current_version: None,
            latest_version: None,
            latest_time: None
        }));
}

async fn get_latest_version_from_github() -> Result<String, Error> {
    let client = Client::new();
    let response = client
        .get(LATEST_VERSION_URL)
        .header("User-Agent", "github/zerotier-toolkit")
        .send()
        .await;
    if response.is_err() {
        return Err(Error::CheckFromRemoteError(
            response.err().unwrap().to_string(),
        ));
    }
    let response = response.unwrap();
    let status_code = response.status();

    if !status_code.is_success() {
        let text_result = response.text().await;
        error!(
            "check update failed:{:?}",
            text_result.unwrap_or_else(|_| "empty body".to_string())
        );
        return Err(Error::CheckFromRemoteError(
            "request failed,see details in log".to_string(),
        ));
    }
    let text_result = response.text().await;
    if text_result.is_err() {
        return Err(Error::CheckFromRemoteError(
            text_result.err().unwrap().to_string(),
        ));
    }

    let json_result = from_str::<LatestVersionResponseFromGit>(&text_result.unwrap());
    if json_result.is_err() {
        return Err(Error::CheckFromRemoteError(
            json_result.err().unwrap().to_string(),
        ));
    }
    Ok(json_result.unwrap().tag_name)
}

#[tauri::command]
pub async fn get_latest_version_command(app_handle: AppHandle) -> String {
    let mut latest_version_holder = LATEST_VERSION_HOLDER.lock().await;
    if latest_version_holder.current_version.is_none() {
        latest_version_holder.current_version = Some(format!(
            "v{}",
            app_handle.package_info().version.to_string()
        ));
    }
    let latest_time = latest_version_holder.latest_time;
    if latest_time.is_none()
        || Local::now()
            .signed_duration_since(latest_time.unwrap())
            .num_seconds()
            >= UPDATE_CHECK_INTERVAL
    {
        let latest_version = get_latest_version_from_github().await;
        match latest_version {
            Ok(value) => {
                latest_version_holder.latest_version = Some(value);
                latest_version_holder.latest_time = Some(Local::now());
            }
            Err(err) => {
                return fail_message_json(
                    format!("update check fail with:{}", err.to_string()).as_str(),
                )
            }
        }
    }
    success_json(latest_version_holder.clone())
}
