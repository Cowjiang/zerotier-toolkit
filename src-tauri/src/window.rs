use tauri::Window;
use window_shadows::set_shadow;

pub fn set_window_shadow(window: Window) {
    #[cfg(any(windows, target_os = "macos"))]
    set_shadow(&window, true).unwrap();
}
