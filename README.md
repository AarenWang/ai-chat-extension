# AI Chat Outline Extension

一个为 AI 对话网站（ChatGPT、Claude.ai）提供对话大纲导航功能的浏览器扩展。这个扩展可以帮助你快速浏览和跳转到历史对话内容。

## 功能特点

- 📋 在 AI 对话页面右上角显示一个可切换的导航按钮
- 📝 自动提取对话中的用户问题作为大纲项
- ⏱️ 显示消息时间戳（如果可用）
- 🔍 点击大纲项可快速跳转到对应对话位置
- 🔄 支持手动刷新大纲内容
- 🎨 美观的界面设计，与各平台风格保持一致
- 🔒 支持页面切换时自动收起导航面板
- 🖱️ **长按按钮 3 秒可拖动，位置自动保存**

## 支持的网站

- [ChatGPT](https://chat.openai.com/)
- [ChatGPT.com](https://chatgpt.com/)
- [Claude.ai](https://claude.ai/)

## 支持的浏览器

- Google Chrome
- Microsoft Edge

## 安装方法

### 开发模式安装

1. 克隆仓库
```bash
git clone https://github.com/AarenWang/ai-chat-extension.git
cd ai-chat-extension
```

2. 安装依赖
```bash
npm install
```

3. 构建项目
```bash
npm run build
```

4. 在浏览器中加载扩展
   - Chrome: 打开 `chrome://extensions/`，开启"开发者模式"，点击"加载已解压的扩展程序"，选择项目的 `dist` 目录
   - Edge: 打开 `edge://extensions/`，开启"开发者模式"，点击"加载解压缩的扩展"，选择项目的 `dist` 目录

## 使用方法

### 基础使用

1. 访问 [ChatGPT](https://chat.openai.com/)、[ChatGPT.com](https://chatgpt.com/) 或 [Claude.ai](https://claude.ai/)
2. 在页面右上角找到导航按钮（📋）
3. 点击按钮展开对话大纲面板
4. 点击大纲项可快速跳转到对应对话位置
5. 再次点击按钮可收起面板

### 拖动按钮位置

1. **长按** 📋 按钮 **3 秒** 以上，按钮变绿表示可拖动
2. **拖动** 到想要的位置
3. **松开** 后位置自动保存
4. 下次访问该网站时，按钮会自动恢复到上次的位置

## 开发说明

### 项目结构

```
ai-chat-extension/
├── src/
│   ├── background/     # 后台脚本
│   ├── content/        # 内容脚本
│   ├── popup/          # 弹出窗口
│   └── icons/          # 图标资源
├── dist/               # 构建输出目录
├── package.json        # 项目配置
└── webpack.config.js   # Webpack 配置
```

### 开发命令

- `npm run build`: 构建项目
- `npm run watch`: 开发模式，监听文件变化自动构建
- `npm run lint`: 代码检查
- `npm run format`: 代码格式化

### 调试模式

在 `src/content/content.js` 中设置 `this.debug = true` 可开启调试日志。

## 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

如有问题或建议，请提交 Issue 或 Pull Request。

## 致谢

- 感谢 ChatGPT 提供的优秀服务
- 感谢 Claude.ai 提供的优秀服务
- 感谢所有贡献者的支持
