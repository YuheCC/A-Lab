# SSE 请求工具使用说明

## 概述

`sseRequest` 是一个专门用于处理 SSE (Server-Sent Events) 流式响应的通用工具方法。

## 特性

- ✅ 自动处理 token 认证
- ✅ 自动处理 401 错误跳转
- ✅ 支持 GET/POST 等多种请求方法
- ✅ 支持 query 参数和 request body
- ✅ 返回原生 Response 对象，兼容 `streamSSE` 工具

## 基本用法

```typescript
import sseRequest from '@/services/sseRequest';
import streamSSE from '@/components/StreamSSE';

// 发送 SSE 请求
const response = await sseRequest('/api/your-endpoint', {
  method: 'POST',
  data: {
    id: 123,
    lang: 'zh'
  }
});

// 使用 streamSSE 解析流式响应
for await (const event of streamSSE(response)) {
  console.log('收到事件:', event);

  // 处理数据
  if (event.data) {
    // 更新 UI
  }

  // 检查是否完成
  if (event.finished || event.done) {
    break;
  }
}
```

## API 文档

### sseRequest(url, options)

**参数:**

- `url` (string): 请求的 URL 路径，如 `'/api/cellPerformance/llm_analysis'`
- `options` (SSERequestOptions): 可选配置对象
  - `method` (string): HTTP 方法，默认 `'GET'`
  - `data` (any): 请求体数据（POST/PUT/PATCH 时使用）
  - `params` (Record<string, any>): URL query 参数
  - `headers` (Record<string, string>): 自定义请求头

**返回值:**

- `Promise<Response>`: 原生 Response 对象

## 完整示例

### 示例 1: POST 请求

```typescript
import sseRequest from '@/services/sseRequest';
import streamSSE from '@/components/StreamSSE';

async function analyzeLLM(id: number) {
  const response = await sseRequest('/api/cellPerformance/llm_analysis', {
    method: 'POST',
    data: {
      id,
      battery_system_id: 1,
      lang: 'zh'
    }
  });

  for await (const event of streamSSE(response)) {
    if (event.data) {
      console.log('分析内容:', event.data);
    }
  }
}
```

### 示例 2: GET 请求带参数

```typescript
const response = await sseRequest('/api/stream/data', {
  method: 'GET',
  params: {
    userId: 123,
    type: 'analysis'
  }
});
```

### 示例 3: 自定义请求头

```typescript
const response = await sseRequest('/api/stream/data', {
  method: 'POST',
  data: { query: 'test' },
  headers: {
    'X-Custom-Header': 'value'
  }
});
```

## 错误处理

工具会自动处理以下错误：

- **401 未授权**: 自动清除 token 并跳转到登录页
- **其他 HTTP 错误**: 抛出异常，需要调用方捕获处理

```typescript
try {
  const response = await sseRequest('/api/endpoint', {
    method: 'POST',
    data: params
  });

  for await (const event of streamSSE(response)) {
    // 处理事件
  }
} catch (error) {
  console.error('SSE 请求失败:', error);
  // 显示错误提示
}
```

## 与普通 request 的区别

| 特性 | sseRequest | request (axios) |
|------|-----------|-----------------|
| 用途 | SSE 流式响应 | 普通 HTTP 请求 |
| 返回值 | 原生 Response | AxiosResponse |
| 流式支持 | ✅ | ❌ |
| 拦截器 | ❌ | ✅ |
| 适用场景 | LLM 流式输出、实时数据流 | 普通 API 调用 |

## 注意事项

1. **必须使用 streamSSE**: `sseRequest` 返回的是原生 Response，必须配合 `streamSSE` 使用
2. **长连接**: SSE 是长连接，注意在组件卸载时清理
3. **错误处理**: 务必使用 try-catch 捕获异常
4. **浏览器兼容**: 现代浏览器都支持，IE 不支持

## 当前使用场景

- ✅ Performance 页面 LLM 分析 (`src/services/prediction/performance.ts`)
- 后续可扩展到其他需要流式响应的场景
