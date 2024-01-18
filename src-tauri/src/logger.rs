extern crate env_logger;

use std::env;
use std::io::Write;
use std::sync::Once;

use chrono::Local;
use env_logger::Builder;
use log::{info, LevelFilter};
use log::LevelFilter::Info;

static INIT: Once = Once::new();

pub(crate) fn init_logger_with_level(level: LevelFilter) {
    INIT.call_once(|| {
        env::set_var("TZ", "Asia/Shanghai");
        Builder::new()
            .format(|buf, record| {
                writeln!(
                    buf,
                    "[{}][{}] [{}:{}]: {}",
                    Local::now().format("%Y-%m-%d %H:%M:%S"),
                    record.level(),
                    record.module_path().unwrap_or("<unknown>"),
                    record.line().unwrap_or(0),
                    record.args()
                )
            })
            .filter_level(level)
            .format_timestamp_millis()
            .init();
        info!("日志初始化成功");
    });
}

pub(crate) fn init_logger() {
    init_logger_with_level(Info)
}


#[cfg(test)]
mod tests {
    use crate::logger::init_logger;

    #[test]
    fn internal() {
        init_logger();
    }
}
