extern crate env_logger;

use std::collections::LinkedList;
use std::fs::File;
use std::io::Write;
use std::sync::Once;
use std::{env, io};

use chrono::Local;
use env_logger::Builder;
use log::LevelFilter::Info;
use log::{info, LevelFilter};

static INIT: Once = Once::new();

struct LogWriter {
    writers: LinkedList<Box<dyn std::io::Write + Send + 'static>>,
}
impl Write for LogWriter {
    fn write(&mut self, buf: &[u8]) -> std::io::Result<usize> {
        for ele in self.writers.iter_mut() {
            let _ = ele.write(buf);
        }
        io::stdout().write(buf)
    }

    fn flush(&mut self) -> std::io::Result<()> {
        for ele in self.writers.iter_mut() {
            let _ = ele.flush();
        }
        io::stdout().flush()
    }
}
impl LogWriter {
    fn append(&mut self, writer: Box<dyn std::io::Write + Send + 'static>) {
        self.writers.push_back(writer);
    }
}

pub(crate) fn init_logger_with_level_and_file(level: LevelFilter, file: Option<File>) {
    INIT.call_once(|| {
        env::set_var("TZ", "Asia/Shanghai");
        let mut builder = Builder::new();

        builder
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
            .format_timestamp_millis();
        let mut log_writer = LogWriter {
            writers: LinkedList::new(),
        };
        if file.is_some() {
            log_writer.append(Box::new(file.unwrap()));
        }

        builder.target(env_logger::Target::Pipe(Box::new(log_writer)));
        builder.init();
        info!("日志初始化成功 {:?}", level);
    });
}
#[allow(unused)]
pub fn init_logger_with_level(level: LevelFilter) {
    init_logger_with_level_and_file(level, None)
}
#[allow(unused)]
pub fn init_logger() {
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
