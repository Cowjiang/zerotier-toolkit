extern crate env_logger;

use env_logger::Builder;
use log::info;
use log::LevelFilter::Info;

pub(crate) fn init_logger() {
    let mut builder = Builder::new();
    builder.filter_level(Info);
    builder.init();
    info!("日志初始化成功");
}


#[cfg(test)]
mod tests {
    use crate::logger::init_logger;

    #[test]
    fn internal() {
        init_logger();
    }
}
