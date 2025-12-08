#[cfg(target_os = "android")] // TODO: 开发安卓版本
pub fn start_typing(_start_delay: u64, _type_delay: u64) -> (String, i64) {
    return ("安卓平台不支持这个功能".to_string(), -1);
}