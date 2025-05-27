class ChatGPTOutline {
    constructor() {
        this.panel = null;
        this.toggleButton = null;
        this.isVisible = false;
        this.outlineItems = [];
        this.init();
    }

    init() {
        // 创建面板
        this.createPanel();
        // 创建切换按钮
        this.createToggleButton();
        // 监听消息
        this.setupMessageListener();
        // 监听页面变化
        this.setupMutationObserver();
        // 启动元素自愈机制
        this.startElementWatcher();
    }

    createPanel() {
        console.log('[ChatGPTOutline] 尝试创建面板...');
        this.panel = document.createElement('div');
        this.panel.className = 'chatgpt-outline-panel hidden';
        this.panel.innerHTML = `
            <div class="chatgpt-outline-header">
                <h2 class="chatgpt-outline-title">对话大纲</h2>
            </div>
            <div class="chatgpt-outline-content"></div>
        `;
        document.body.appendChild(this.panel);
        console.log('[ChatGPTOutline] 面板已添加到 DOM。当前面板元素:', this.panel);
    }

    createToggleButton() {
        console.log('[ChatGPTOutline] 尝试创建导航按钮...');
        this.toggleButton = document.createElement('div');
        this.toggleButton.className = 'chatgpt-outline-toggle';
        this.toggleButton.textContent = '📋';
        this.toggleButton.addEventListener('click', () => this.togglePanel());
        document.body.appendChild(this.toggleButton);
        console.log('[ChatGPTOutline] 导航按钮已添加到 DOM。当前按钮元素:', this.toggleButton);
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((message) => {
            if (message.action === 'toggleOutline') {
                this.togglePanel();
            } else if (message.action === 'refreshOutline') {
                this.refreshOutline();
            }
        });
    }

    setupMutationObserver() {
        // 使用防抖来避免频繁更新
        const debouncedRefresh = this.debounce(() => this.refreshOutline(), 500);
        
        const observer = new MutationObserver((mutations) => {
            // 检查是否有新的消息添加
            const hasNewMessages = mutations.some(mutation => 
                mutation.type === 'childList' && 
                mutation.addedNodes.length > 0 &&
                Array.from(mutation.addedNodes).some(node => 
                    node.nodeType === 1 && 
                    (node.matches('[data-testid^="conversation-turn-"]') || 
                     node.querySelector('[data-testid^="conversation-turn-"]'))
                )
            );

            if (hasNewMessages) {
                debouncedRefresh();
            }
        });

        // 监听对话容器
        const targetNode = document.querySelector('[data-testid="conversation-turn-2"]')?.parentElement;
        if (targetNode) {
            observer.observe(targetNode, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }
    }

    togglePanel() {
        this.isVisible = !this.isVisible;
        this.panel.classList.toggle('hidden', !this.isVisible);
        this.toggleButton.textContent = this.isVisible ? '❌' : '📋';
        console.log('[ChatGPTOutline] 面板切换状态:', this.isVisible);
        if (this.isVisible) {
            console.log('[ChatGPTOutline] 面板已显示，开始刷新大纲...');
            this.refreshOutline();
        }
    }

    refreshOutline() {
        console.log('[ChatGPTOutline] 开始刷新大纲...');
        
        // 获取所有对话消息
        const messages = document.querySelectorAll('[data-testid^="conversation-turn-"]');
        console.log('[ChatGPTOutline] 找到对话消息数量:', messages.length);
        console.log('[ChatGPTOutline] 对话消息元素:', messages);

        this.outlineItems = [];

        messages.forEach((message, index) => {
            console.log(`[ChatGPTOutline] 处理第 ${index + 1} 条消息:`);
            console.log('[ChatGPTOutline] 消息元素:', message);
            
            // 检查是否是用户消息
            const userMessage = message.querySelector('[data-message-author-role="user"]');
            console.log('[ChatGPTOutline] 用户消息元素:', userMessage);
            if (!userMessage) {
                console.log('[ChatGPTOutline] 不是用户消息，跳过');
                return;
            }

            // 获取消息内容 - 更新选择器以匹配当前DOM结构
            const content = userMessage.querySelector('.whitespace-pre-wrap');
            console.log('[ChatGPTOutline] 消息内容元素:', content);
            if (!content) {
                console.log('[ChatGPTOutline] 未找到消息内容，跳过');
                return;
            }

            // 获取消息文本
            const text = this.extractMessageText(content);
            console.log('[ChatGPTOutline] 提取的文本:', text);
            if (!text) {
                console.log('[ChatGPTOutline] 文本为空，跳过');
                return;
            }

            // 获取消息时间戳（如果有）
            const timestamp = this.extractTimestamp(message);
            console.log('[ChatGPTOutline] 时间戳:', timestamp);

            this.outlineItems.push({
                index,
                text: this.truncateText(text, 50),
                timestamp,
                element: message
            });
            console.log('[ChatGPTOutline] 已添加到大纲项');
        });

        console.log('[ChatGPTOutline] 最终大纲项数量:', this.outlineItems.length);
        console.log('[ChatGPTOutline] 大纲项内容:', this.outlineItems);

        this.renderOutline();
    }

    extractMessageText(contentElement) {
        // 移除代码块
        const codeBlocks = contentElement.querySelectorAll('pre');
        codeBlocks.forEach(block => block.remove());

        // 获取纯文本
        let text = contentElement.textContent.trim();
        
        // 移除多余的空行
        text = text.replace(/\n\s*\n/g, '\n');
        
        return text;
    }

    extractTimestamp(messageElement) {
        // 尝试获取时间戳元素
        const timestampElement = messageElement.querySelector('time');
        return timestampElement ? timestampElement.textContent : null;
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    renderOutline() {
        const content = this.panel.querySelector('.chatgpt-outline-content');
        content.innerHTML = '';

        if (this.outlineItems.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = '暂无对话内容';
            content.appendChild(emptyMessage);
            return;
        }

        this.outlineItems.forEach((item) => {
            const div = document.createElement('div');
            div.className = 'chatgpt-outline-item';
            
            // 创建消息内容
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            messageContent.textContent = item.text;
            
            // 如果有时间戳，添加时间戳
            if (item.timestamp) {
                const timestamp = document.createElement('div');
                timestamp.className = 'message-timestamp';
                timestamp.textContent = item.timestamp;
                div.appendChild(timestamp);
            }
            
            div.appendChild(messageContent);
            div.addEventListener('click', () => this.scrollToMessage(item));
            content.appendChild(div);
        });
    }

    scrollToMessage(item) {
        if (item.element) {
            // 使用平滑滚动
            item.element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });

            // 高亮当前项
            const items = this.panel.querySelectorAll('.chatgpt-outline-item');
            items.forEach((element, i) => {
                element.classList.toggle('active', 
                    this.outlineItems[i].element === item.element
                );
            });
        }
    }

    // 防抖函数
    debounce(func, wait) {
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

    startElementWatcher() {
        setInterval(() => {
            // 检查面板是否还在 DOM 中
            if (!document.body.contains(this.panel)) {
                console.log('[ChatGPTOutline] 面板丢失，重新创建...');
                this.createPanel();
                // 重新渲染大纲内容
                this.renderOutline();
                // 保持面板显示状态
                if (this.isVisible) {
                    this.panel.classList.remove('hidden');
                }
            }
            // 检查按钮是否还在 DOM 中
            if (!document.body.contains(this.toggleButton)) {
                console.log('[ChatGPTOutline] 导航按钮丢失，重新创建...');
                this.createToggleButton();
                // 保持按钮状态
                if (this.isVisible) {
                    this.toggleButton.textContent = '❌';
                }
            }
        }, 1000); // 每秒检查一次
    }
}

// 初始化插件
const outline = new ChatGPTOutline(); 