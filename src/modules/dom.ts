// 导出 DOM 集合
// 使用 getter (get 属性) 确保在访问时才去获取元素
export const els = {
    startDelay: requireEl<HTMLInputElement>("#start-delay"),
    typeDelay: requireEl<HTMLInputElement>("#type-delay"),
    typeBtn: requireEl<HTMLButtonElement>("#type-btn"),
    statusMsg: requireEl<HTMLParagraphElement>("#statusMsg"),
};


// 定义一个辅助函数用于检查元素是否存在，不存在则抛错
function requireEl<T extends HTMLElement>(selector: string): T {
    const el = document.querySelector(selector);
    if (!el)
        throw Error(`找不到元素: ${selector}`);
    return el as T;
}