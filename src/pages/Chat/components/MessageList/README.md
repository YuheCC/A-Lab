# MessageList 组件

基于 `example.js` 静态实现的消息列表组件，支持静态渲染和 mock 数据。

## 功能特性

- ✅ 用户和机器人消息渲染
- ✅ 化学分子高亮和点击交互
- ✅ 消息复制功能
- ✅ 重新生成功能（仅最新回复）
- ✅ 带按钮的系统消息
- ✅ 响应式设计
- ✅ 动画效果

## 使用方法

### 基础用法

```tsx
import MessageList from './components/MessageList';

function ChatPage() {
  return (
    <div className="chat-container">
      <MessageList />
    </div>
  );
}
```

### 自定义数据

```tsx
import MessageList from './components/MessageList';
import type { Message } from './components/MessageList';

const customMessages: Message[] = [
  {
    id: '1',
    type: 'bot',
    content: '你好！我是分子宇宙助手。',
    timestamp: new Date(),
    showRegenerate: false
  },
  {
    id: '2',
    type: 'user',
    content: '请介绍 LiPF6 的特性',
    timestamp: new Date()
  }
];

function ChatPage() {
  return (
    <MessageList messages={customMessages} />
  );
}
```

### 事件处理

```tsx
import MessageList from './components/MessageList';

function ChatPage() {
  const handleCopyMessage = (content: string) => {
    console.log('复制消息:', content);
  };

  const handleRegenerateMessage = (messageId: string) => {
    console.log('重新生成消息:', messageId);
  };

  const handleMoleculeClick = (moleculeName: string) => {
    console.log('点击分子:', moleculeName);
    // 显示分子详情面板
  };

  return (
    <MessageList
      onCopyMessage={handleCopyMessage}
      onRegenerateMessage={handleRegenerateMessage}
      onMoleculeClick={handleMoleculeClick}
    />
  );
}
```

## Props 接口

```tsx
interface MessageListProps {
  messages?: Message[];                    // 消息数组，默认使用 mock 数据
  onCopyMessage?: (content: string) => void;           // 复制消息回调
  onRegenerateMessage?: (messageId: string) => void;   // 重新生成消息回调
  onMoleculeClick?: (moleculeName: string) => void;   // 分子点击回调
  className?: string;                     // 自定义 CSS 类名
}
```

## Message 接口

```tsx
interface Message {
  id: string;                    // 消息唯一标识
  type: 'user' | 'bot';         // 消息类型
  content: string;               // 消息内容
  timestamp: Date;               // 时间戳
  showRegenerate?: boolean;      // 是否显示重新生成按钮
}
```

## 支持的化学分子

组件会自动识别并高亮以下化学分子：

- LiPF6, LiFSI (锂盐)
- EC, DEC, DMC, EMC (碳酸酯溶剂)
- VC, FEC (添加剂)
- LiF, Li2CO3, Li2O (SEI 成分)
- Al2O3, ZrO2 (包覆材料)
- HF (副产物)

## CSS 类名

- `.message-list` - 消息列表容器
- `.message-wrapper` - 消息包装器
- `.message-wrapper.user` - 用户消息
- `.message-wrapper.bot` - 机器人消息
- `.message` - 消息内容
- `.chemical-molecule` - 化学分子
- `.message-actions` - 消息操作按钮
- `.action-btn` - 操作按钮
- `.copy-btn` - 复制按钮
- `.regenerate-btn` - 重新生成按钮
- `.molecule-btn` - 分子按钮

## 样式定制

可以通过 CSS 变量或直接修改 `MessageList.css` 文件来自定义样式：

```css
:root {
  --primary-color: #56B26A;
  --user-message-bg: #56B26A;
  --bot-message-bg: #f3f4f6;
  --text-color: #374151;
}
``` 