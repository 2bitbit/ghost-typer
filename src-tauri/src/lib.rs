mod typing;
use tauri::Emitter;
use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut, ShortcutState};
use tauri_plugin_store::StoreExt;
use typing::start_typing;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();

    // --- 仅在桌面端注册全局快捷键 ---
    #[cfg(not(target_os = "android"))]
    {
        builder = builder.plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(move |app, shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        if shortcut.matches(Modifiers::CONTROL | Modifiers::ALT, Code::KeyV) {
                            // 读取 Store 中的 delay 配置，默认 10ms
                            let store = app.store("settings.json");
                            let delay: u64 = if let Ok(store) = store {
                                // 尝试获取 "typeDelay"
                                store
                                    .get("typeDelay")
                                    .and_then(|v| v.as_u64())
                                    .unwrap_or(10)
                            } else {
                                10
                            };

                            println!("快捷键触发！0秒启动, {}ms间隔", delay);

                            // 【立即通知前端】：任务开始了
                            // "typing-status" 是事件名，Payload 是个字符串，也可以是 JSON 对象
                            let response = start_typing(app.clone(), 0, delay as u32);
                            if let Err(e) = app.emit("shortcut-trigger", response) {
                                eprintln!("事件发射失败: {:?}", e);
                            }
                        }
                    }
                })
                .build(),
        );
    }

    builder
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        // 注册命令
        .invoke_handler(tauri::generate_handler![start_typing])
        // 注册全局快捷键
        .setup(|app| {
            #[cfg(not(target_os = "android"))]
            {
                use tauri_plugin_global_shortcut::GlobalShortcutExt;
                app.global_shortcut().register(Shortcut::new(
                    Some(Modifiers::CONTROL | Modifiers::ALT),
                    Code::KeyV,
                ))?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
