import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

import { els } from "./modules/dom";
import { settingsManager } from "./modules/settings";
import * as uiManager from "./modules/ui";

// 点击按钮
const handleBtnClick = async () => {
    const startDelay = parseInt(els.startDelay.value);
    const typeDelay = parseInt(els.typeDelay.value);
    if (isNaN(startDelay) || isNaN(typeDelay)) {
        uiManager.showError("请输入有效数字");
        return;
    } else if (startDelay < 0 || typeDelay < 0) {
        uiManager.showError("延迟时间不能为负数");
        return;
    }

    try {
        const duration = await invoke<number>("start_typing", { startDelay, typeDelay });
        uiManager.startCountdown(startDelay, duration);
    } catch (error) {
        uiManager.showError(`出错: ${error}`);
    }
}

// 整个程序的入口
window.addEventListener("DOMContentLoaded", async () => {
    // 1. 初始化数据
    await settingsManager.init();

    // 2. 绑定 UI 事件
    // 这里使用箭头函数包裹，确保 saveFromUI 里的 this 指向正确（笑死😀，这都什么诡异特性。）
    els.startDelay.addEventListener("change", () => settingsManager.saveFromUI());
    els.typeDelay.addEventListener("change", () => settingsManager.saveFromUI());
    els.typeBtn.addEventListener("click", handleBtnClick);

    // 3. 监听后端事件
    // 🟢 专门处理快捷键成功的逻辑
    listen<number>("shortcut-trigger", (event) => {
        console.log("🚀 快捷键启动成功，耗时:", event.payload);
        uiManager.startCountdown(0, event.payload);// 快捷键触发: 启动延迟为0
    });

    // 🔴 专门处理快捷键失败的逻辑
    listen<string>("shortcut-error", (event) => {
        console.error("💥 快捷键启动失败:", event.payload);
        uiManager.showError(event.payload);
    });
    // 处理 typing结束 事件
    listen("typing-finished", () => {
        uiManager.reset();
    });
});