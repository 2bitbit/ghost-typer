// 用 FP 风格组织 UI
// index 负责逻辑， renderers 负责纯渲染的工具函数
import * as render from "./renderers"; // 引入所有的渲染指令

// --- 模块级状态 (Module Scope State) ---
let timerId: number | null = null;

// --- 纯逻辑辅助函数 ---
const clearTimer = () => {
    if (timerId) {
        window.clearInterval(timerId);
        timerId = null;
    }
};

// --- 导出的业务行为 (Actions) ---
export const showError = (msg: string) => {
    render.renderStatus(msg, "#ef4444");
    render.setButtonIdle();
};

export const reset = () => {
    clearTimer();
    render.setButtonIdle();
    render.renderStatus("任务完成✔️", "#888");
};

export const startCountdown = (startDelaySeconds: number, typeDurationMs: number) => {
    clearTimer(); // 先清理副作用

    // 1. 设置初始 UI 状态
    try {
        render.setButtonBusy("运行中...");
    } catch (e) {
        console.error("无法设置按钮为忙碌状态:", e);
        return; // 如果按钮状态不对，停止执行
    }
    render.renderStatus(`请在 ${startDelaySeconds} 秒内切换窗口...`, "#fbbf24"); // 黄色

    // 2. 纯逻辑：倒计时计算
    let remaining = startDelaySeconds;

    timerId = window.setInterval(() => {
        remaining--;

        if (remaining > 0) {
            render.renderStatus(`请在 ${remaining} 秒内切换窗口...`, "#fbbf24");
        } else {
            clearTimer();
            render.renderStatus(`👻 输入任务已发送 😙\n预估总耗时 ${typeDurationMs} 毫秒`, "#4ade80");
            // 注意：这里不需要重置按钮，保持结束状态。之后由rust后端通知来重置。
        }
    }, 1000);
};