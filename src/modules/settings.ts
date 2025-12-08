// 使用 OOP 风格管理 "设置"
import { Store } from "@tauri-apps/plugin-store";
import { els } from "./dom"; // 引入 dom 里的 els

export const settingsManager = {
    store: null as Store | null,

    async init() {
        try {
            this.store = await Store.load("settings.json");
            await this.loadToUI();
        } catch (e) {
            console.error("Store 加载失败", e);
        }
    },

    async loadToUI() {
        if (!this.store)
            return;
        const start = await this.store.get<number>("startDelay");
        const type = await this.store.get<number>("typeDelay");

        els.startDelay.value = (start ?? 1).toString(); // 空值合并操作符: 当左侧表达式是 null 或 undefined 时，返回右侧的默认值。
        els.typeDelay.value = (type ?? 1).toString();
    },

    async saveFromUI() {
        if (!this.store)
            return;
        const start = parseInt(els.startDelay.value);
        const type = parseInt(els.typeDelay.value);

        if (!isNaN(start))
            await this.store.set("startDelay", start);
        if (!isNaN(type))
            await this.store.set("typeDelay", type);
        await this.store.save();
    }
};