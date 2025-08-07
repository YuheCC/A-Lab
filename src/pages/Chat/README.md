# Chat 页面功能说明

## 已完成的功能

### 1. 核心组件
- ✅ **MessageList**: 消息列表组件，支持显示用户和机器人消息
- ✅ **ChatInput**: 聊天输入组件，支持自动调整高度和键盘快捷键
- ✅ **ChatWelcome**: 欢迎页面组件，支持模式切换和推荐问题
- ✅ **ChatSider**: 侧边栏组件，支持折叠和聊天历史
- ✅ **ChatHistory**: 聊天历史组件，支持选择、重命名、置顶、删除
- ✅ **MessageEdit**: 消息编辑组件，支持内联编辑
- ✅ **ModeTooltip**: 模式提示组件，显示模式说明和剩余次数
- ✅ **ChatSearchModal**: 搜索模态框组件，支持搜索聊天记录

### 2. 状态管理
- ✅ **useChat Hook**: 统一管理聊天状态，包括消息、历史记录、加载状态等
- ✅ **ChatService**: 处理与后端的通信，包括发送消息、重新生成、获取历史等

### 3. 功能特性
- ✅ **消息发送**: 支持发送消息并获取AI回复
- ✅ **消息编辑**: 支持编辑用户消息
- ✅ **消息复制**: 支持复制消息内容
- ✅ **重新生成**: 支持重新生成机器人回复
- ✅ **聊天历史**: 支持查看和管理聊天历史
- ✅ **新聊天**: 支持创建新的聊天会话
- ✅ **模式切换**: 支持 Regular Ask 和 Deep Space 模式
- ✅ **分子点击**: 支持点击化学分子名称
- ✅ **搜索功能**: 支持搜索聊天记录
- ✅ **响应式设计**: 支持侧边栏折叠和移动端适配

### 4. 用户体验
- ✅ **加载状态**: 显示加载指示器
- ✅ **错误处理**: 处理网络错误和异常情况
- ✅ **键盘快捷键**: 支持 Enter 发送、Esc 取消等
- ✅ **动画效果**: 平滑的过渡动画
- ✅ **可访问性**: 支持键盘导航和屏幕阅读器

## 技术栈

- **React 19**: 使用最新的 React 版本
- **TypeScript**: 完整的类型安全
- **CSS Modules**: 样式隔离和可维护性
- **React Hooks**: 函数式组件和状态管理
- **Fetch API**: 网络请求处理

## 文件结构

```
src/pages/Chat/
├── index.tsx                 # 主页面组件
├── chat-styles.css          # 主样式文件
├── hooks/
│   └── useChat.tsx         # 聊天状态管理 Hook
├── services/
│   └── chatService.ts      # 聊天服务类
├── components/
│   ├── MessageList/        # 消息列表组件
│   ├── ChatInput/          # 聊天输入组件
│   ├── ChatWelcome/        # 欢迎页面组件
│   ├── ChatSider/          # 侧边栏组件
│   ├── ChatHistory/        # 聊天历史组件
│   ├── MessageEdit/        # 消息编辑组件
│   ├── ModeTooltip/        # 模式提示组件
│   ├── ChatSearchModal/    # 搜索模态框组件
│   └── HistoryItem/        # 历史记录项组件
└── README.md               # 本文档
```

## 使用示例

```typescript
import { useChat } from './hooks/useChat';
import { chatService } from './services/chatService';

const ChatPage = () => {
  const {
    messages,
    chatHistory,
    currentChatId,
    isLoading,
    addUserMessage,
    addBotMessage,
    editMessage
  } = useChat();

  const handleSendMessage = async (message: string) => {
    addUserMessage(message);
    
    try {
      const response = await chatService.sendMessage(message);
      addBotMessage(response.content, response.showRegenerate);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div>
      <MessageList 
        messages={messages}
        onEditMessage={editMessage}
        onCopyMessage={(content) => navigator.clipboard.writeText(content)}
      />
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};
```

## 下一步计划

1. **后端集成**: 连接真实的AI API
2. **用户认证**: 添加用户登录和权限管理
3. **数据持久化**: 实现聊天记录的本地存储
4. **实时通信**: 添加 WebSocket 支持
5. **文件上传**: 支持上传图片和文档
6. **语音输入**: 添加语音转文字功能
7. **多语言支持**: 完善国际化功能
8. **主题切换**: 支持深色模式
9. **性能优化**: 添加虚拟滚动和懒加载
10. **单元测试**: 添加完整的测试覆盖

## 注意事项

1. 所有组件都使用 TypeScript，确保类型安全
2. 组件都是纯函数组件，使用 React Hooks 管理状态
3. 支持键盘快捷键和可访问性
4. 包含错误处理和加载状态
5. 支持国际化（i18n）
6. 使用 CSS 模块确保样式隔离