# ChatGPT对话大纲浏览器插件开发指南

## 项目结构
```
ai-chat-extension/
├── src/                    # 源代码目录
│   ├── manifest.json      # 插件配置文件
│   ├── popup/             # 弹出窗口相关文件
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   ├── content/           # 内容脚本
│   │   ├── content.js     # 处理页面内容的主要脚本
│   │   └── content.css    # 内容样式
│   ├── background/        # 后台脚本
│   │   └── background.js  # 处理后台任务
│   └── utils/             # 工具函数
│       └── helpers.js     # 通用辅助函数
├── dist/                  # 构建输出目录
├── docs/                  # 文档目录
├── tests/                 # 测试文件目录
├── package.json          # 项目依赖配置
└── README.md             # 项目说明文档
```

## 开发环境设置

1. 安装Node.js和npm
   - 访问 https://nodejs.org/ 下载并安装最新的LTS版本

2. 克隆项目并安装依赖
   ```bash
   git clone [项目地址]
   cd ai-chat-extension
   npm install
   ```

## 本地开发

1. 开发模式
   ```bash
   npm run dev
   ```
   这将启动开发服务器并监视文件变化。

2. 构建项目
   ```bash
   npm run build
   ```
   这将在dist目录下生成可部署的插件文件。

## 本地安装插件

### Edge浏览器
1. 打开Edge浏览器
2. 访问 `edge://extensions/`
3. 打开"开发人员模式"
4. 点击"加载解压缩的扩展"
5. 选择项目的`dist`目录

### Chrome浏览器
1. 打开Chrome浏览器
2. 访问 `chrome://extensions/`
3. 打开"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目的`dist`目录

## 插件打包

### Edge浏览器
1. 确保已经完成构建（`npm run build`）
2. 访问 [Microsoft Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/overview)
3. 创建新的扩展提交
4. 上传打包后的zip文件
5. 填写必要的商店信息
6. 提交审核

### Chrome浏览器
1. 确保已经完成构建（`npm run build`）
2. 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. 点击"新建项目"
4. 上传打包后的zip文件
5. 填写必要的商店信息
6. 提交审核

## 开发注意事项

1. 代码规范
   - 使用ESLint进行代码检查
   - 遵循Airbnb JavaScript风格指南
   - 使用Prettier进行代码格式化

2. 安全性考虑
   - 避免使用eval()等不安全函数
   - 注意跨域请求的处理
   - 保护用户数据隐私

3. 性能优化
   - 最小化DOM操作
   - 使用事件委托
   - 优化资源加载

4. 兼容性
   - 优先支持Edge浏览器
   - 确保代码在Chrome浏览器中也能正常运行
   - 使用特性检测而不是浏览器检测

## 调试技巧

1. 使用浏览器开发者工具
   - 在扩展管理页面点击"检查视图"来调试popup
   - 使用content script调试器来调试注入的脚本
   - 查看background page的控制台输出

2. 日志记录
   - 使用console.log()进行调试
   - 在发布版本中移除所有调试代码

## 发布流程

1. 版本号管理
   - 遵循语义化版本控制
   - 在manifest.json中更新版本号

2. 更新日志
   - 记录所有重要更改
   - 说明新功能和bug修复

3. 测试
   - 在不同环境下测试
   - 确保所有功能正常工作
   - 检查性能问题

4. 提交审核
   - 准备详细的描述和截图
   - 确保符合商店政策
   - 响应审核反馈 