// 监听标签页更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url.includes('chat.openai.com')) {
        // 当页面加载完成时，注入content script
        chrome.tabs.sendMessage(tabId, { action: 'pageLoaded' });
    }
});

// 监听插件安装或更新
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // 首次安装时的处理
        chrome.storage.sync.set({
            isEnabled: true,
            showToggleButton: true
        });
    }
}); 