use arboard::Clipboard;
use enigo::{Enigo, Keyboard, Settings};
use std::{thread, time};
use tauri::{AppHandle, Emitter};

// 这个函数可以被“前端按钮”和“全局快捷键”同时调用
/// # Parameters
/// * `app`: Tauri 应用句柄，用于事件发射等操作。Tauri 会自动注入
/// * `start_delay`: 给你时间用来切换窗口
/// * `type_delay`: 每个字符之间的间隔，用来应对速度过快可能导致的丢包
///
/// # Return
/// * 返回预计的总输入时间，单位毫秒
#[tauri::command]
pub fn start_typing(app: AppHandle, start_delay: u32, type_delay: u32) -> Result<i64, String> {
    let text_to_type = get_clipboard_text()?;
    let estimated_time = type_delay * text_to_type.chars().count() as u32;

    // 为了在线程里使用 app，需要 clone 一份
    let app_handle = app.clone();
    // 开启新线程，防止卡死 UI
    std::thread::spawn(move || {
        println!("任务开始：等待 {} 秒...", start_delay);
        thread::sleep(time::Duration::from_secs(start_delay as u64));
        println!("即将输入内容: {}", text_to_type);

        // 初始化 Enigo
        let mut enigo = match Enigo::new(&Settings::default()) {
            Ok(e) => e,
            Err(e) => {
                eprintln!("Enigo 无法获取输入权限或连接: {:?}", e);
                return;
            }
        };

        // 模拟打字: 为了模拟真实的“打字机”效果并防止丢包，我们遍历字符一个个输入
        for c in text_to_type.chars() {
            if let Err(e) = enigo.text(&c.to_string()) {
                eprintln!("输入字符 '{}' 失败: {:?}", c, e);
            }
            // 字符间的微小延迟
            thread::sleep(time::Duration::from_millis(type_delay.into()));
        }

        println!("输入完成！");
        // 【线程结束通知前端】：任务结束了
        // 注意：这里用的是被 move 进来的 app_handle
        let _ = app_handle.emit("typing-finished", ());
    });

    Ok(estimated_time.into())
}

/// 读取剪贴板文本
fn get_clipboard_text() -> Result<String, String> {
    let mut clipboard = Clipboard::new().map_err(|e| {
        // 1. 在后端控制台打印“原始结构”，保留所有细节: 这里用 {:?} (Debug trait)，它能打印出结构体的内部字段和错误信息
        eprintln!("剪贴板底层错误详情: {:?}", e);
        // 2. 转换成人类可读的字符串，传给前端
        format!("剪贴板初始化失败")
    })?;
    clipboard.get_text().map_err(|e| {
        eprintln!("剪贴板没有文本: {:?}", e);
        format!("剪贴板没有文本")
    })
}
