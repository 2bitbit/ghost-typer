// renderers 负责纯渲染的工具函数
import { els } from "../dom";

// 1. 状态消息渲染器
export const renderStatus = (text: string, color: string) => {
    els.statusMsg.textContent = text;
    els.statusMsg.style.color = color;
};

// 2. 按钮状态渲染器
export const setButtonBusy = (loadingText: string) => {
    if (els.typeBtn.disabled) { // 这是一个防御性编程
        console.error("按钮早就被调用，变Busy而disabled掉了");
        return;
    }
    els.typeBtn.disabled = true;
    els.typeBtn.textContent = loadingText;
};

export const setButtonIdle = () => {
    if (els.typeBtn.disabled === false) {
        console.error("按钮已本就是空闲（Idle）状态了");
        return;
    }
    els.typeBtn.disabled = false;
    els.typeBtn.textContent = "开始模拟 (剪贴板)";
};