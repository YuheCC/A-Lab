# HistoryItem 组件

历史对话项组件，从原始History组件中提取并封装，实现了点击按钮出现浮层以及浮层上的各种功能。

## 功能特性

- ✅ 显示对话标题和菜单按钮
- ✅ 点击菜单按钮显示/隐藏浮层
- ✅ 点击组件外部自动关闭浮层
- ✅ 支持在线重命名功能
- ✅ 支持置顶/取消置顶功能
- ✅ 支持删除对话功能
- ✅ 支持置顶状态显示
- ✅ 完整的键盘交互（Enter确认，Escape取消）
- ✅ 置顶按钮带有固钉图标，根据置顶状态显示不同样式（实心/空心）

## Props 接口

```typescript
interface HistoryItemProps {
  /** 对话ID */
  chatId: string;
  /** 对话标题 */
  title: string;
  /** 是否置顶 */
  isPinned?: boolean;
  /** 点击对话标题的回调 */
  onChatClick?: (chatId: string) => void;
  /** 重命名对话的回调 */
  onRename?: (chatId: string, newTitle: string) => void;
  /** 切换置顶状态的回调 */
  onTogglePin?: (chatId: string) => void;
  /** 删除对话的回调 */
  onDelete?: (chatId: string) => void;
}
```

## 使用示例

```tsx
import HistoryItem from '../HistoryItem';

const MyComponent = () => {
  const handleChatClick = (chatId: string) => {
    console.log('点击对话:', chatId);
    // 实现跳转到对应对话的逻辑
  };

  const handleRename = (chatId: string, newTitle: string) => {
    console.log('重命名对话:', chatId, newTitle);
    // 实现重命名对话的逻辑
  };

  const handleTogglePin = (chatId: string) => {
    console.log('切换置顶状态:', chatId);
    // 实现切换置顶状态的逻辑
  };

  const handleDelete = (chatId: string) => {
    console.log('删除对话:', chatId);
    // 实现删除对话的逻辑
  };

  return (
    <ul>
      <HistoryItem
        chatId="1"
        title="电解质溶剂稳定性预测分析"
        isPinned={false}
        onChatClick={handleChatClick}
        onRename={handleRename}
        onTogglePin={handleTogglePin}
        onDelete={handleDelete}
      />
      <HistoryItem
        chatId="2"
        title="LiFePO4石墨电池电解质推荐"
        isPinned={true}
        onChatClick={handleChatClick}
        onRename={handleRename}
        onTogglePin={handleTogglePin}
        onDelete={handleDelete}
      />
    </ul>
  );
};
```

## 组件结构

```
HistoryItem
├── 对话标题链接 (可点击)
├── 菜单按钮 (⋯)
└── 浮层菜单 (条件渲染)
    ├── 修改名称按钮
    ├── 置顶/取消置顶按钮
    └── 删除对话按钮
```

## 交互行为

1. **点击对话标题**: 触发 `onChatClick` 回调
2. **点击菜单按钮**: 显示/隐藏浮层菜单
3. **点击修改名称**: 进入重命名模式，显示输入框
4. **重命名模式**:
   - Enter 键确认修改
   - Escape 键取消修改
   - 失去焦点时自动确认修改
5. **点击置顶按钮**: 触发 `onTogglePin` 回调，按钮文本和图标根据 `isPinned` 状态变化
   - 未置顶时：显示空心固钉图标 + "置顶"文本
   - 已置顶时：显示实心固钉图标 + "取消置顶"文本
6. **点击删除按钮**: 触发 `onDelete` 回调
7. **点击组件外部**: 自动关闭浮层菜单

## 样式依赖

组件使用以下现有CSS类：
- `.history-nav li` - 历史项容器
- `.recent-chat` - 对话标题链接
- `.chat-menu-btn` - 菜单按钮
- `.chat-delete-menu` - 浮层容器
- `.delete-menu-content` - 浮层内容
- `.rename-chat-btn` - 重命名按钮
- `.pin-chat-btn` - 置顶按钮
- `.delete-chat-btn` - 删除按钮
- `.chat-rename-input` - 重命名输入框
- `.pinned` - 置顶状态类

## 注意事项

1. 确保父容器 `.history-nav li` 有 `position: relative` 样式
2. 浮层使用绝对定位，会自动出现在菜单按钮的右下方
3. 所有回调函数都是可选的，如果不提供相应功能将不会执行
4. 组件内部管理浮层的显示/隐藏状态和重命名状态
5. 重命名时会自动选中输入框中的文本
6. 固钉图标会根据 `isPinned` 状态自动切换样式（实心/空心）
7. 图标使用 `currentColor` 继承按钮的文字颜色，支持主题切换