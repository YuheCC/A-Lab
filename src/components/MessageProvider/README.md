# MessageProvider 消息提示组件

基于 MUI Snackbar 和 Alert 组件实现的轻量级消息提示组件，类似于 antd 的 message 组件。

## 特性

- ✅ 支持成功、失败、警告、信息四种类型的提示
- ✅ 自动关闭，可自定义时长
- ✅ 支持多条消息垂直堆叠
- ✅ 可手动关闭
- ✅ TypeScript 支持
- ✅ 国际化友好

## 使用方法

### 1. 基本使用

```tsx
import { useMessage } from '@/components/MessageProvider';

const MyComponent = () => {
  const message = useMessage();
  
  const handleSuccess = () => {
    message.success('操作成功！');
  };
  
  const handleError = () => {
    message.error('操作失败！');
  };
  
  return (
    <div>
      <button onClick={handleSuccess}>成功提示</button>
      <button onClick={handleError}>失败提示</button>
    </div>
  );
};
```

### 2. 自定义时长

```tsx
// 默认 3 秒，可自定义
message.success('操作成功！', 5000); // 5 秒后自动关闭
message.error('操作失败！', 10000); // 10 秒后自动关闭
```

### 3. 所有类型的提示

```tsx
message.success('成功提示');
message.error('失败提示');
message.warning('警告提示');
message.info('信息提示');
```

## 替换现有的手动提示逻辑

如果你的代码中有类似这样的手动提示逻辑：

```tsx
// 老方式 - 手动管理状态
const [successMessage, setSuccessMessage] = useState('');
const [errorMessage, setErrorMessage] = useState('');

// 显示成功消息
setSuccessMessage('操作成功！');
setTimeout(() => setSuccessMessage(''), 3000);

// 显示错误消息
setErrorMessage('操作失败！');
setTimeout(() => setErrorMessage(''), 3000);
```

可以替换为：

```tsx
// 新方式 - 使用消息提示组件
const message = useMessage();

message.success('操作成功！');
message.error('操作失败！');
```

## 样式自定义

组件使用 MUI 的主题系统，你可以通过 MUI 主题来自定义样式：

```tsx
// 在你的主题配置中
const theme = createTheme({
  components: {
    MuiSnackbar: {
      styleOverrides: {
        root: {
          // 自定义 Snackbar 样式
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          // 自定义 Alert 样式
        },
      },
    },
  },
});
```

## 注意事项

1. 确保在应用的根组件中包装了 `MessageProvider`
2. 只能在 `MessageProvider` 内部使用 `useMessage` hook
3. 组件会自动处理消息的显示和隐藏，无需手动管理状态
4. 多条消息会自动垂直堆叠显示 