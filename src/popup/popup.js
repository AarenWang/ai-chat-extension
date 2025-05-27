document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggleOutline');
    const refreshButton = document.getElementById('refreshOutline');
    const statusMessage = document.getElementById('statusMessage');

    // 获取当前标签页
    async function getCurrentTab() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab;
    }

    // 发送消息到content script
    async function sendMessageToContentScript(message) {
        const tab = await getCurrentTab();
        if (tab.url.includes('chat.openai.com')) {
            chrome.tabs.sendMessage(tab.id, message);
        } else {
            statusMessage.textContent = '请在ChatGPT页面使用此插件';
        }
    }

    // 切换大纲显示状态
    toggleButton.addEventListener('click', () => {
        sendMessageToContentScript({ action: 'toggleOutline' });
    });

    // 刷新大纲
    refreshButton.addEventListener('click', () => {
        sendMessageToContentScript({ action: 'refreshOutline' });
        statusMessage.textContent = '正在刷新大纲...';
    });

    // 监听来自content script的消息
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'status') {
            statusMessage.textContent = message.text;
        }
    });
}); 