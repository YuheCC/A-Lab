# 文件上传服务

## 概述
这个模块提供了文件上传功能，包括文件验证和上传到 `/api/file/upload` 端点的功能。

## API 接口

### POST /api/file/upload

**参数：**
- `file`: 要上传的文件（FormData 格式）

**响应格式：**
```json
{
  "success": true,
  "data": {
    "filename": "example.jpg",
    "size": 1024,
    "path": "/uploads/example.jpg",
    "url": "https://example.com/uploads/example.jpg"
  },
  "message": "文件上传成功"
}
```

## 使用方法

### 1. 基本文件上传
```typescript
import { uploadFile, validateFile } from '@/services/file';

const handleFileUpload = async (file: File) => {
  // 先验证文件
  const validation = validateFile(file, 5, ['image/jpeg', 'image/png']);
  if (!validation.valid) {
    console.error(validation.error);
    return;
  }

  // 上传文件
  const result = await uploadFile(file);
  if (result.success) {
    console.log('上传成功:', result.data);
  } else {
    console.error('上传失败:', result.message);
  }
};
```

### 2. 文件验证
```typescript
import { validateFile } from '@/services/file';

// 验证图片文件，最大 5MB
const validation = validateFile(file, 5, ['image/jpeg', 'image/png']);
if (validation.valid) {
  // 文件验证通过
} else {
  // 文件验证失败
  console.error(validation.error);
}
```

## 集成到反馈组件

在 `UserFeedBackModal` 组件中，文件上传功能已经集成，采用两步提交流程：

### 提交流程（第一版方式）

1. **文件选择和预览**
   - 用户选择文件时，立即显示图片预览
   - 文件保存在组件状态中，等待一起提交

2. **一体化提交**  
   - 用户点击提交按钮时，直接调用 `/api/user/feedback/new` 接口
   - 使用 FormData 格式一次性提交所有数据（包括文件）
   - 实时显示上传进度条

### 操作流程

1. 打开反馈弹窗
2. 填写反馈类型、功能和描述
3. （可选）选择一个图片文件（JPEG 或 PNG，< 5MB）
4. 文件选择后立即显示图片预览和文件名
5. 点击提交按钮，开始上传：
   - 提交按钮显示loading状态（旋转图标 + "提交中..."）
   - 提交期间禁用所有操作
   - 一次性提交所有反馈数据和文件
6. 显示结果：
   - ✅ 成功：显示成功消息
   - ❌ 失败：显示错误消息

### 新增功能特性

#### 🖼️ 图片预览
- 选择文件后立即显示预览
- 响应式图片大小适配
- 文件名显示在预览底部
- 右上角删除按钮可移除文件

#### 🔄 提交状态
- 提交按钮显示loading状态
- 提交期间禁用所有操作
- 旋转图标 + "提交中..." 文案

#### 🌐 多语言支持
- 所有文案支持中文/英文/日文/韩文
- 包括错误提示、状态文案、按钮文本等
- 支持动态语言切换

#### 🎨 视觉效果
- 上传完成：绿色边框表示成功
- 提交中：按钮禁用状态和透明度变化
- 悬停效果和平滑过渡动画

### 数据格式（回到第一版 FormData 方式）

**提交到 `/api/user/feedback/new` 的 FormData：**
```javascript
formData.append('type', 'feature');
formData.append('feature', 'map'); 
formData.append('text', '用户反馈内容');
formData.append('file', fileObject); // 文件对象
formData.append('file_path', fileName); // 文件名
```

**特点：**
- 一次请求完成所有数据提交
- 支持文件上传进度监控
- FormData 格式，适合包含文件的表单提交

## 支持的文件类型
- JPEG (image/jpeg)
- PNG (image/png)

## 文件大小限制
- 最大 5MB

## 错误处理
- 文件类型不支持
- 文件过大
- 网络错误
- 服务器错误
