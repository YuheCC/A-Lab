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

### 基础用法

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
      />
    </div>
  );
};
```

### 带重定向路径

```tsx
<LoginModal
  isOpen={showLoginModal}
  onClose={() => setShowLoginModal(false)}
  redirectPath="/dashboard"
/>
```

### 在Header组件中使用

```tsx
// 替换原有的登录按钮跳转
const handleLoginClick = () => {
  setShowLoginModal(true); // 改为显示浮层
  // navigate('/login'); // 删除页面跳转
};
```

## Props 接口

```tsx
interface LoginModalProps {
  isOpen: boolean;        // 控制模态框显示/隐藏
  onClose: () => void;    // 关闭模态框的回调函数
  redirectPath?: string;  // 可选：登录成功后的重定向路径
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

## 集成建议

1. **替换现有登录跳转**：在需要登录的地方使用此组件替代页面跳转
2. **权限拦截**：在路由守卫中弹出登录浮层而非跳转登录页
3. **状态管理**：可以考虑在全局状态中管理登录浮层的显示状态

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
