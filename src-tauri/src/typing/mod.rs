mod android;
mod desktop;

#[cfg(not(target_os = "android"))]
pub use desktop::start_typing;
#[cfg(target_os = "android")]
pub use android::start_typing;