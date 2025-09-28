# LoginModal 组件

基于现有登录页面样式改良的登录浮层组件，用于替代页面跳转式登录。

## 功能特性

- 🎨 **统一设计**: 基于原登录页面样式，保持设计一致性
- 🔒 **完整认证**: 支持用户名/密码登录、条款同意、错误处理
- 📱 **响应式**: 适配移动端和桌面端
- 🌐 **国际化**: 完全支持i18next多语言
- ♿ **无障碍**: 支持键盘导航、屏幕阅读器、焦点陷阱
- 🎯 **重定向**: 支持登录后自定义跳转路径
- ⌨️ **键盘友好**: ESC键关闭、Tab键循环聚焦、自动聚焦
- 🔒 **焦点管理**: 打开时自动聚焦用户名输入框

## 使用示例

### 🌟 推荐用法 - 使用Context（已全局集成）

```tsx
import { useLoginModal } from '@/hooks/useLoginModal';

const MyComponent = () => {
  const { openLoginModal } = useLoginModal();

  return (
    <div>
      <button onClick={() => openLoginModal('/dashboard')}>
        登录
      </button>
      {/* 不需要再包含 LoginModal 组件，已在 layout 中全局集成 */}
    </div>
  );
};
```

### 权限检查

```tsx
import { useLoginModal } from '@/hooks/useLoginModal';

const ProtectedComponent = () => {
  const { requireAuth, withAuth } = useLoginModal();

  // 方式1: 手动检查
  const handleProtectedAction = () => {
    if (requireAuth('/protected-page')) {
      // 执行需要权限的操作
      console.log('执行保护操作');
    }
  };

  // 方式2: 装饰器模式
  const protectedAction = withAuth(() => {
    console.log('执行保护操作');
  }, '/protected-page');

  return (
    <div>
      <button onClick={handleProtectedAction}>需要登录的操作</button>
      <button onClick={protectedAction}>装饰器模式</button>
    </div>
  );
};
```

### 传统用法（不推荐，但仍可用）

```tsx
import { useState } from 'react';
import LoginModal from '@/components/LoginModal';

const MyComponent = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div>
      <button onClick={() => setShowLoginModal(true)}>
        登录
      </button>
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectPath="/dashboard"
      />
    </div>
  );
};
```

## API 接口

### LoginModal Props

```tsx
interface LoginModalProps {
  isOpen: boolean;        // 控制模态框显示/隐藏
  onClose: () => void;    // 关闭模态框的回调函数
  redirectPath?: string;  // 可选：登录成功后的重定向路径
}
```

### useLoginModal Hook

```tsx
interface LoginModalHook {
  // Context 原始方法
  isOpen: boolean;                           // 模态框是否打开
  redirectPath?: string;                     // 重定向路径
  openLoginModal: (redirectPath?: string) => void;  // 打开登录浮层
  closeLoginModal: () => void;               // 关闭登录浮层
  
  // 增强方法
  requireAuth: (redirectPath?: string) => boolean;   // 检查认证状态
  withAuth: <T>(action: T, redirectPath?: string) => T; // 权限装饰器
  isAuthenticated: boolean;                  // 当前认证状态
}
```

## 样式定制

组件使用独立的CSS文件 `LoginModal.css`，主要包含：

- 模态框遮罩层和容器
- 表单样式（输入框、按钮、复选框）
- 响应式布局
- 动画效果
- 无障碍支持

如需定制样式，可以：

1. 直接修改 `LoginModal.css`
2. 通过CSS变量覆盖主题色
3. 添加自定义类名

## 国际化支持

组件使用现有的认证相关翻译键：

- `auth.header.welcomeBack`
- `auth.form.username`
- `auth.form.password`
- `auth.switch.loginTermsText`
- 等等...

确保相关翻译文件已配置完整。

## 🚀 快速开始

1. **组件已全局集成**：LoginModal已在`layouts/index.tsx`中集成，无需重复添加
2. **使用Context**：推荐使用`useLoginModal` Hook，简化使用
3. **替换登录跳转**：将现有的`navigate('/login')`替换为`openLoginModal()`

### 迁移指南

```tsx
// ❌ 旧方式 - 页面跳转
const handleLogin = () => {
  navigate('/login?redirect=' + pathname);
};

// ✅ 新方式 - 使用浮层
const { openLoginModal } = useLoginModal();
const handleLogin = () => {
  openLoginModal(pathname);
};
```

## 集成建议

1. **全局使用**：已在layout中集成，任何页面都可以直接使用Hook
2. **权限拦截**：使用`requireAuth`和`withAuth`简化权限检查
3. **业务集成**：在现有的添加收藏、高级搜索等功能中集成权限检查

## 注意事项

- 组件会自动处理表单重置和错误清理
- 登录成功后会自动关闭浮层并进行重定向
- 支持ESC键关闭模态框（加载状态下不可关闭）
- 加载状态下会禁用所有交互元素
- 打开时自动聚焦到用户名输入框，提升用户体验
- 具备完整的焦点陷阱，Tab键导航不会跳出模态框
- 模态框打开时会阻止页面滚动，关闭时恢复

## 键盘交互

- **ESC键**: 关闭模态框（非加载状态）
- **Tab键**: 在可聚焦元素间循环导航
- **Shift+Tab**: 反向循环导航
- **Enter键**: 提交表单（在输入框内）
- **空格键**: 切换复选框状态

## 无障碍支持

- 正确的ARIA标签和角色属性
- 键盘导航完全支持
- 屏幕阅读器友好
- 高对比度焦点指示器
- 语义化HTML结构
