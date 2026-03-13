class ChatOutline {
    constructor() {
        this.panel = null;
        this.toggleButton = null;
        this.isVisible = false;
        this.outlineItems = [];
        // 调试模式开关
        this.debug = false; // 设置为 true 开启调试日志

        // 拖动相关状态
        this.dragEnabled = false;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.longPressTimer = null;
        this.longPressDuration = 3000; // 3秒长按

        // 平台配置
        this.platforms = {
            chatgpt: {
                name: 'ChatGPT',
                messageSelector: '[data-testid^="conversation-turn-"]',
                userMessageSelector: '[data-message-author-role="user"]',
                contentSelector: '.whitespace-pre-wrap',
                timestampSelector: 'time'
            },
            claude: {
                name: 'Claude',
                messageSelector: '[data-testid="user-message"]',
                userMessageSelector: null, // Claude直接用messageSelector即可
                contentSelector: '.whitespace-pre-wrap',
                timestampSelector: null
            }
        };

        this.currentPlatform = this.detectPlatform();
        this.init();
    }

    // 获取存储键名（基于网站域名）
    get storageKey() {
        const hostname = window.location.hostname;
        return `chat_outline_button_position_${hostname}`;
    }

    // 检测当前平台
    detectPlatform() {
        const hostname = window.location.hostname;

        if (hostname.includes('claude.ai')) {
            return 'claude';
        } else if (hostname.includes('chat.openai.com') || hostname.includes('chatgpt.com')) {
            return 'chatgpt';
        }
        return 'chatgpt'; // 默认使用ChatGPT选择器
    }

    // 获取当前平台配置
    get config() {
        return this.platforms[this.currentPlatform];
    }

    // 调试日志方法
    log(...args) {
        if (this.debug) {
            console.log(`[${this.config.name}Outline]`, ...args);
        }
    }

    // 保存按钮位置
    saveButtonPosition() {
        const position = {
            x: parseInt(this.toggleButton.style.left) || 20,
            y: parseInt(this.toggleButton.style.top) || 20
        };
        chrome.storage.local.set({ [this.storageKey]: position }, () => {
            this.log('按钮位置已保存:', position);
        });
    }

    // 加载按钮位置
    loadButtonPosition() {
        chrome.storage.local.get([this.storageKey], (result) => {
            const position = result[this.storageKey];
            if (position) {
                // 检查位置是否在可视区域内
                const maxX = window.innerWidth - 60;
                const maxY = window.innerHeight - 60;
                const x = Math.max(0, Math.min(position.x, maxX));
                const y = Math.max(0, Math.min(position.y, maxY));

                this.toggleButton.style.left = x + 'px';
                this.toggleButton.style.top = y + 'px';
                this.toggleButton.style.right = 'auto';
                this.toggleButton.style.bottom = 'auto';
                this.log('按钮位置已恢复:', { x, y });
            }
        });
    }

    init() {
        this.log(`初始化，当前平台: ${this.config.name}`);

        // 创建面板
        this.createPanel();
        // 创建切换按钮
        this.createToggleButton();
        // 加载按钮位置
        this.loadButtonPosition();
        // 设置拖动功能
        this.setupDrag();
        // 监听消息
        this.setupMessageListener();
        // 监听页面变化
        this.setupMutationObserver();
        // 启动元素自愈机制
        this.startElementWatcher();
        // 监听页面导航
        this.setupNavigationListener();
    }

    createPanel() {
        this.log('尝试创建面板...');
        this.panel = document.createElement('div');
        this.panel.className = 'chatgpt-outline-panel hidden';
        this.panel.innerHTML = `
            <div class="chatgpt-outline-header">
                <h2 class="chatgpt-outline-title">对话大纲</h2>
            </div>
            <div class="chatgpt-outline-content"></div>
        `;
        document.body.appendChild(this.panel);
        this.log('面板已添加到 DOM。当前面板元素:', this.panel);

        // 添加鼠标事件监听器
        this.panel.addEventListener('mouseleave', () => {
            if (this.isVisible) {
                this.hidePanel();
            }
        });
    }

    createToggleButton() {
        this.log('尝试创建导航按钮...');
        this.toggleButton = document.createElement('div');
        this.toggleButton.className = 'chatgpt-outline-toggle';
        this.toggleButton.textContent = '📋';
        this.toggleButton.addEventListener('click', (e) => {
            // 如果是拖动状态，不触发点击
            if (this.isDragging) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            this.togglePanel();
        });
        document.body.appendChild(this.toggleButton);
        this.log('导航按钮已添加到 DOM。当前按钮元素:', this.toggleButton);
    }

    setupDrag() {
        const btn = this.toggleButton;

        // 鼠标按下
        btn.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // 只响应左键

            // 清除之前的定时器
            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
            }

            // 记录按下位置
            const startX = e.clientX;
            const startY = e.clientY;

            // 设置长按定时器
            this.longPressTimer = setTimeout(() => {
                this.dragEnabled = true;
                this.isDragging = true;
                this.toggleButton.classList.add('dragging');

                // 计算偏移量（当前按钮位置 - 鼠标位置）
                const rect = btn.getBoundingClientRect();
                this.dragOffset.x = startX - rect.left;
                this.dragOffset.y = startY - rect.top;

                this.log('长按3秒，拖动已启用');

                // 显示提示
                this.showDragHint();

            }, this.longPressDuration);

            // 监听鼠标移动和松开
            const onMouseMove = (moveEvent) => {
                // 如果还没启用拖动，检查是否移动了（取消长按）
                if (!this.dragEnabled) {
                    const moveDist = Math.sqrt(
                        Math.pow(moveEvent.clientX - startX, 2) +
                        Math.pow(moveEvent.clientY - startY, 2)
                    );
                    if (moveDist > 10) {
                        // 移动超过10px，取消长按
                        clearTimeout(this.longPressTimer);
                        this.longPressTimer = null;
                    }
                    return;
                }

                // 执行拖动
                e.preventDefault();
                const newX = moveEvent.clientX - this.dragOffset.x;
                const newY = moveEvent.clientY - this.dragOffset.y;

                // 限制在窗口范围内
                const maxX = window.innerWidth - btn.offsetWidth;
                const maxY = window.innerHeight - btn.offsetHeight;
                const boundedX = Math.max(0, Math.min(newX, maxX));
                const boundedY = Math.max(0, Math.min(newY, maxY));

                btn.style.left = boundedX + 'px';
                btn.style.top = boundedY + 'px';
                btn.style.right = 'auto';
                btn.style.bottom = 'auto';
            };

            const onMouseUp = (upEvent) => {
                // 清除定时器
                if (this.longPressTimer) {
                    clearTimeout(this.longPressTimer);
                    this.longPressTimer = null;
                }

                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);

                if (this.dragEnabled) {
                    // 保存位置
                    this.saveButtonPosition();

                    // 延迟重置状态，避免触发点击事件
                    setTimeout(() => {
                        this.dragEnabled = false;
                        this.isDragging = false;
                        this.toggleButton.classList.remove('dragging');
                        this.hideDragHint();
                    }, 100);
                }
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        // 鼠标移出按钮，取消长按
        btn.addEventListener('mouseleave', () => {
            if (this.longPressTimer && !this.dragEnabled) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
        });
    }

    // 显示拖动提示
    showDragHint() {
        if (!this.dragHint) {
            this.dragHint = document.createElement('div');
            this.dragHint.className = 'drag-hint';
            this.dragHint.textContent = '🔓 可拖动';
            this.dragHint.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 14px;
                z-index: 100000;
                pointer-events: none;
                animation: fadeIn 0.3s ease;
            `;
            document.body.appendChild(this.dragHint);

            // 1秒后自动隐藏
            setTimeout(() => this.hideDragHint(), 1000);
        }
    }

    hideDragHint() {
        if (this.dragHint) {
            this.dragHint.remove();
            this.dragHint = null;
        }
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
                    (node.matches(this.config.messageSelector) ||
                     node.querySelector(this.config.messageSelector))
                )
            );

            if (hasNewMessages) {
                debouncedRefresh();
            }
        });

        // 监听对话容器
        let targetNode = null;

        if (this.currentPlatform === 'chatgpt') {
            targetNode = document.querySelector('[data-testid="conversation-turn-2"]')?.parentElement;
        } else {
            // Claude.ai - 监听包含消息的容器
            targetNode = document.querySelector('main') || document.body;
        }

        if (targetNode) {
            observer.observe(targetNode, {
                childList: true,
                subtree: true,
                characterData: true
            });
            this.log('MutationObserver 已启动，监听容器:', targetNode);
        } else {
            this.log('未找到合适的监听容器');
        }
    }

    setupNavigationListener() {
        // 监听 URL 变化
        let lastUrl = location.href;
        new MutationObserver(() => {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                this.currentPlatform = this.detectPlatform();
                this.log('页面已切换，当前平台:', this.config.name);
                this.hidePanel();
                // 等待页面加载完成后重新设置监听
                setTimeout(() => this.setupMutationObserver(), 1000);
            }
        }).observe(document, { subtree: true, childList: true });
    }

    hidePanel() {
        if (this.isVisible) {
            this.isVisible = false;
            this.panel.classList.add('hidden');
            this.toggleButton.textContent = '📋';
            this.toggleButton.removeAttribute('data-close');
        }
    }

    togglePanel() {
        this.isVisible = !this.isVisible;
        this.panel.classList.toggle('hidden', !this.isVisible);

        if (this.isVisible) {
            this.toggleButton.textContent = '❌';
            this.toggleButton.setAttribute('data-close', 'true');
            this.log('面板已显示，开始刷新大纲...');
            this.refreshOutline();
        } else {
            this.toggleButton.textContent = '📋';
            this.toggleButton.removeAttribute('data-close');
        }
    }

    refreshOutline() {
        this.log('开始刷新大纲...');

        // 根据平台获取用户消息
        let userMessages = [];

        if (this.currentPlatform === 'chatgpt') {
            // ChatGPT: 从conversation-turn中筛选用户消息
            const messages = document.querySelectorAll(this.config.messageSelector);
            messages.forEach(message => {
                const userMessage = message.querySelector(this.config.userMessageSelector);
                if (userMessage) {
                    userMessages.push({
                        element: userMessage,
                        container: message
                    });
                }
            });
        } else {
            // Claude.ai: 直接获取用户消息
            const messages = document.querySelectorAll(this.config.messageSelector);
            messages.forEach(message => {
                userMessages.push({
                    element: message,
                    container: message
                });
            });
        }

        this.log('找到用户消息数量:', userMessages.length);

        this.outlineItems = [];

        userMessages.forEach((msgObj, index) => {
            const message = msgObj.element;
            const container = msgObj.container;

            this.log(`处理第 ${index + 1} 条消息:`);
            this.log('消息元素:', message);

            // 获取消息内容
            const content = message.querySelector(this.config.contentSelector);
            this.log('消息内容元素:', content);
            if (!content) {
                this.log('未找到消息内容，跳过');
                return;
            }

            // 获取消息文本
            const text = this.extractMessageText(content);
            this.log('提取的文本:', text);
            if (!text) {
                this.log('文本为空，跳过');
                return;
            }

            // 获取消息时间戳（如果有）
            const timestamp = this.extractTimestamp(container);
            this.log('时间戳:', timestamp);

            this.outlineItems.push({
                index,
                text: this.truncateText(text, 50),
                timestamp,
                element: container
            });
            this.log('已添加到大纲项');
        });

        this.log('最终大纲项数量:', this.outlineItems.length);
        this.log('大纲项内容:', this.outlineItems);

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
        if (!this.config.timestampSelector) return null;

        // 尝试获取时间戳元素
        const timestampElement = messageElement.querySelector(this.config.timestampSelector);
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
                this.log('面板丢失，重新创建...');
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
                this.log('导航按钮丢失，重新创建...');
                this.createToggleButton();
                this.loadButtonPosition();
                this.setupDrag();
                // 保持按钮状态
                if (this.isVisible) {
                    this.toggleButton.textContent = '❌';
                    this.toggleButton.setAttribute('data-close', 'true');
                }
            }
        }, 1000); // 每秒检查一次
    }
}

// 初始化插件
const outline = new ChatOutline();
