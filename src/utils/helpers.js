// 防抖函数
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 截断文本
export function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// 获取消息元素
export function getMessageElements() {
    return document.querySelectorAll('div[data-message-author-role]');
}

// 检查是否在ChatGPT页面
export function isChatGPTPage() {
    return window.location.hostname === 'chat.openai.com';
}

// 发送状态消息到popup
export function sendStatusMessage(text) {
    chrome.runtime.sendMessage({
        type: 'status',
        text
    });
} 