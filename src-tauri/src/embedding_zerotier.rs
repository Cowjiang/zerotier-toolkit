use crate::r::success_json;
use tauri::AppHandle;
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;

#[tauri::command]
pub(crate) async fn get_embedding_zerotier_version(app: AppHandle) -> String {
    let sidecar_command = app.shell().sidecar("zerotier-core").unwrap();
    let (mut rx, _child) = sidecar_command
        .args(["-v"])
        .spawn()
        .expect("Failed to spawn zerotier-core");
    // 收集输出结果
    let mut output = String::new();
    // read events such as stdout
    while let Some(event) = rx.recv().await {
        if let CommandEvent::Stdout(line_bytes) = event {
            let line = String::from_utf8_lossy(&line_bytes);
            output.push_str(&line);
            output.push('\n'); // 保持换行符
        }
    }
    success_json(output)
}
