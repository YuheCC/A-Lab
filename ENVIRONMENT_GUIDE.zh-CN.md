# 环境开发指南

## 概述

本指南提供 **mu_frontend** 项目中不同环境的完整信息，包括设置、配置、部署和故障排查。

### 可用环境列表

| 环境 | 用途 | API 基础地址 | 部署方式 |
|------|------|--------------|----------|
| **Development** | 本地开发 | `https://api-sh.ses.ai` | 本地开发服务器 |
| **Staging** | 测试和QA | `https://api-sh.ses.ai` | AWS Amplify |
| **Production** | 生产发布 | `https://prod-api.ses.ai` | AWS Amplify |
| **Box** | 本地/局域网测试 | `http://10.10.106.51` | Docker + Linux 服务器 |
| **US** | 美国区域测试 | `https://llm-staging.ses.ai` | AWS Amplify |

---

## 环境详细说明

### 1. 开发环境 (Development)

**配置文件：** 使用 `config.staging.ts`

**启动命令：**
```bash
pnpm install
pnpm dev
```

**API 端点：**
- REST API: `https://api-sh.ses.ai`
- WebSocket: `https://api-sh.ses.ai`

**适用场景：**
- 日常开发和调试
- 功能开发
- 本地测试

**注意事项：**
- 启用热模块替换 (HMR)
- 可用源码映射进行调试
- 开发模式优化

---

### 2. 测试环境 (Staging)

**配置文件：** `config/config.staging.ts`

**构建命令：**
```bash
pnpm build:staging
```

**API 端点：**
- REST API: `https://api-sh.ses.ai`
- WebSocket: `https://api-sh.ses.ai`

**部署方式：** AWS Amplify

**适用场景：**
- 功能测试
- 集成测试
- 生产前验证
- QA 测试

**外部链接：**
- Explorer: `https://buy.stripe.com/test_9B66oGgL2dPh0C12Mzebu01`
- Team: `https://buy.stripe.com/test_9B600iamEeTl1G572Pebu02`

---

### 3. 生产环境 (Production)

**配置文件：** `config/config.ts`

**构建命令：**
```bash
pnpm build
# 或
pnpm build:prod
```

**API 端点：**
- REST API: `https://prod-api.ses.ai`
- WebSocket: `https://prod-api.ses.ai`

**部署方式：** AWS Amplify

**适用场景：**
- 生产发布
- 实际用户流量
- 面向客户的环境

**外部链接：**
- Explorer: `https://buy.stripe.com/6oE165fCb3Tf0qA5kl`
- Team: `https://buy.stripe.com/dR67utfCb3TffludQS`

**构建优化：**
- 启用资源哈希以刷新缓存
- 使用 Terser 进行 JavaScript 压缩
- 生产级别优化
- 禁用源码映射

---

### 4. Box 环境

**配置文件：** `config/config.box.ts`

**构建命令：**
```bash
pnpm build:box
```

**API 端点：**
- REST API: `http://10.10.106.51`
- WebSocket: `http://10.10.106.51`

**部署方式：** Docker + Linux 服务器

**适用场景：**
- 本地网络测试
- 内部测试环境
- 局域网开发
- 离线测试

**注意事项：**
- 使用硬编码的内网 IP 地址
- 适用于隔离网络环境
- 无外部依赖

---

### 5. US 环境

**配置文件：** `config/config.us.ts`

**构建命令：**
```bash
pnpm build:us
```

**API 端点：**
- REST API: `https://llm-staging.ses.ai`
- WebSocket: `https://llm-staging.ses.ai`

**部署方式：** AWS Amplify

**适用场景：**
- 美国区域测试
- LLM 特定功能测试
- 地域特定测试

**外部链接：**
- Explorer: `https://buy.stripe.com/test_9B66oGgL2dPh0C12Mzebu01`
- Team: `https://buy.stripe.com/test_9B600iamEeTl1G572Pebu02`

---

## 环境变量

### 全局常量（编译时注入）

这些变量在构建时通过 UmiJS `define` 配置注入：

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `ENVIRONMENT` | `'production' \| 'staging' \| 'development' \| 'box' \| 'us'` | 当前环境标识符 |
| `BASE_URL` | `string` | REST API 基础 URL |
| `WS_BASE_URL` | `string` | WebSocket 基础 URL |
| `explorer_url` | `string` | Explorer 计划的 Stripe 支付链接 |
| `team_url` | `string` | Team 计划的 Stripe 支付链接 |
| `ShowFindFriendsAdvancedOptions` | `boolean` | 高级选项功能开关 |

### 访问环境变量

```typescript
// 直接访问（编译后全局可用）
const env = ENVIRONMENT;
const apiUrl = BASE_URL;

// 通过 URL 配置中心（推荐）
import { urlConfig } from '@/services/config/urlConfig';

const currentEnv = urlConfig.getEnvironment();
const baseUrl = urlConfig.getBaseURL();
const fullUrl = urlConfig.buildFullURL('/api/endpoint');
```

---

## 开发工作流程

### 初始设置

```bash
# 安装依赖
pnpm install

# 启动开发服务器（使用 staging 配置）
pnpm dev
```

### 特定环境开发

```bash
# 使用 staging 配置开发（默认）
pnpm dev

# 使用 production 配置开发
pnpm start:prod

# 使用 box 配置开发
pnpm start:box

# 使用 US 配置开发
pnpm start:us
```

### 生产构建

```bash
# 生产环境构建
pnpm build

# Staging 环境构建
pnpm build:staging

# Box 环境构建
pnpm build:box

# US 环境构建
pnpm build:us
```

### 输出目录

所有构建产物输出到 `build/` 目录。

---

## Docker 部署（Box 环境）

### 前置要求

- 已安装并运行 Docker
- `build-docker.sh` 脚本（位于项目根目录）

### 构建 Docker 镜像

#### 基本用法

```bash
# 默认：ARM64 平台，生产环境
./build-docker.sh
```

#### 平台选项

```bash
# 构建 AMD64 (x86_64) 平台
./build-docker.sh -p amd64

# 构建 ARM64 平台（Apple Silicon、ARM 服务器）
./build-docker.sh -p arm64
```

#### 环境选项

```bash
# 使用生产配置构建
./build-docker.sh -e production

# 使用 staging 配置构建
./build-docker.sh -e staging
```

**注意：** 目前构建脚本只支持 `production` 和 `staging` 环境。要构建 `box` 或 `us` 环境，需要扩展脚本（参见配置问题部分）。

#### 仓库和推送

```bash
# 构建并推送到仓库
./build-docker.sh -r registry.example.com --push

# 使用自定义标签构建
./build-docker.sh -t v1.0.0

# 组合示例
./build-docker.sh -p amd64 -e production -r myregistry.com -t latest --push
```

### 镜像标签

**默认标签格式：**
```
mu-frontend:YYYYMMDD-HHMMSS-{platform}-{environment}
```

**示例：**
```
mu-frontend:20250131-143022-amd64-production
```

**自定义标签：**
```bash
./build-docker.sh -t v1.0.0
# 结果: mu-frontend:v1.0.0
```

### 运行 Docker 容器

```bash
# 运行容器
docker run -d -p 80:80 mu-frontend:TAG

# 示例
docker run -d -p 80:80 mu-frontend:20250131-143022-amd64-production

# 使用自定义名称
docker run -d -p 80:80 --name mu-frontend-app mu-frontend:latest
```

### 健康检查

```bash
# 检查容器健康状态
curl http://localhost/health

# 预期响应: OK
```

### 容器管理

```bash
# 查看运行中的容器
docker ps

# 查看日志
docker logs mu-frontend-app

# 停止容器
docker stop mu-frontend-app

# 删除容器
docker rm mu-frontend-app

# 删除镜像
docker rmi mu-frontend:TAG
```

---

## AWS Amplify 部署

用于 **Staging**、**Production** 和 **US** 环境。

### 构建设置配置

在项目根目录创建 `amplify.yml` 文件：

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install -g pnpm
        - pnpm install
    build:
      commands:
        # 根据环境修改
        - pnpm build:staging  # Staging 环境
        # - pnpm build        # Production 环境
        # - pnpm build:us     # US 环境
  artifacts:
    baseDirectory: build
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Amplify 中的环境变量

虽然本项目使用编译时配置，但如果需要，您仍然可以在 Amplify 控制台中设置环境变量。

**控制台路径：** App Settings > Environment variables

### 分支配置

| 分支 | 环境 | 构建命令 |
|------|------|---------|
| `main` | Production | `pnpm build` |
| `staging` | Staging | `pnpm build:staging` |
| `us-region` | US | `pnpm build:us` |

### 手动部署

```bash
# 通过 git push 触发部署
git push origin main           # 触发 production 构建
git push origin staging        # 触发 staging 构建
git push origin us-region      # 触发 US 构建
```

---

## 架构概览

### 构建流程

```
┌─────────────────────────────────────────────┐
│  1. 源代码 + 配置                            │
│     UMI_ENV 变量决定使用哪个配置文件           │
└────────────┬────────────────────────────────┘
             │
┌────────────▼────────────────────────────────┐
│  2. UmiJS 构建流程                           │
│     - Webpack 打包                          │
│     - Define 插件注入环境变量                 │
│     - Terser 压缩                           │
│     - 资源哈希                               │
└────────────┬────────────────────────────────┘
             │
┌────────────▼────────────────────────────────┐
│  3. 构建输出 (build/ 目录)                   │
│     - index.html                            │
│     - JavaScript 打包文件                    │
│     - CSS 文件                              │
│     - 静态资源                               │
└────────────┬────────────────────────────────┘
             │
       ┌─────┴──────┐
       │            │
┌──────▼─────┐ ┌───▼──────┐
│  AWS       │ │  Docker  │
│  Amplify   │ │  +       │
│            │ │  Nginx   │
└────────────┘ └──────────┘
```

### 运行时架构

```
┌──────────────────────────────────────────┐
│  浏览器                                   │
│  ┌────────────────────────────────────┐ │
│  │  React 应用                        │ │
│  │  ┌──────────────────────────────┐  │ │
│  │  │  URL 配置中心                 │  │ │
│  │  │  (单例模式)                   │  │ │
│  │  └──────────┬───────────────────┘  │ │
│  │             │                       │ │
│  │  ┌──────────▼──────┐               │ │
│  │  │  HTTP 请求      │               │ │
│  │  │  (Axios)        │               │ │
│  │  └──────────┬──────┘               │ │
│  │             │                       │ │
│  │  ┌──────────▼──────┐               │ │
│  │  │  SSE 请求       │               │ │
│  │  └──────────┬──────┘               │ │
│  └─────────────┼──────────────────────┘ │
└────────────────┼────────────────────────┘
                 │
         ┌───────▼────────┐
         │  后端 API      │
         │  BASE_URL      │
         └────────────────┘
```

---

## 故障排查

### 常见问题

#### 1. API 连接失败

**症状：**
- 控制台出现网络错误
- 获取数据失败
- CORS 错误

**解决方案：**
```bash
# 检查当前环境
import { urlConfig } from '@/services/config/urlConfig';
console.log('Environment:', urlConfig.getEnvironment());
console.log('Base URL:', urlConfig.getBaseURL());

# 验证构建中的 BASE_URL
# 应该匹配预期环境
console.log(BASE_URL);
```

#### 2. 环境变量未生效

**症状：**
- API 端点错误
- 功能不可用

**诊断：**
```bash
# 检查使用的构建命令
pnpm build         # 应使用 production 配置
pnpm build:staging # 应使用 staging 配置

# 验证 UMI_ENV
echo $UMI_ENV
```

**解决方案：**
- 确保使用了正确的构建命令
- 清空构建目录: `rm -rf build`
- 使用正确环境重新构建

#### 3. Docker 构建失败

**症状：**
- 构建脚本退出并报错
- 镜像未创建

**解决方案：**
```bash
# 验证 Docker 是否运行
docker info

# 检查脚本权限
chmod +x build-docker.sh

# 尝试手动构建
docker build --platform linux/amd64 --build-arg BUILD_ENV=production -t mu-frontend .
```

#### 4. Docker 容器无法访问

**症状：**
- 80 端口无响应
- 健康检查失败

**解决方案：**
```bash
# 检查容器状态
docker ps -a

# 检查容器日志
docker logs mu-frontend-app

# 验证端口映射
docker port mu-frontend-app

# 测试健康端点
curl http://localhost/health
```

### 调试技巧

#### 运行时检查当前环境

```typescript
import { urlConfig } from '@/services/config/urlConfig';

// 在浏览器控制台或组件中
console.log('Environment:', urlConfig.getEnvironment());
console.log('Base URL:', urlConfig.getBaseURL());
console.log('Build Config:', {
  ENVIRONMENT,
  BASE_URL,
  WS_BASE_URL
});
```

#### 检查网络请求

1. 打开浏览器开发者工具 (F12)
2. 进入 Network 标签页
3. 检查请求 URL
4. 验证是否使用正确的 BASE_URL

#### 查看构建日志

```bash
# 构建时
pnpm build 2>&1 | tee build.log

# Docker 构建
./build-docker.sh 2>&1 | tee docker-build.log
```

---

## 配置问题和改进建议

### 问题 1：Docker 脚本环境支持有限

**当前状态：**
- `build-docker.sh` 只支持 `production` 和 `staging`
- 无法为 `box` 或 `us` 环境构建 Docker 镜像

**影响：**
- Box 环境无法使用脚本进行容器化
- US 环境无法使用脚本进行容器化

**改进建议：**

扩展脚本以支持所有环境：

```bash
# 在 build-docker.sh 中，修改验证部分
case $BUILD_ENV in
    production|staging|box|us)
        # 有效环境
        ;;
    *)
        print_error "不支持的环境: $BUILD_ENV"
        print_error "支持的环境: production, staging, box, us"
        exit 1
        ;;
esac

# 更新构建命令以使用正确的 npm 脚本
case $BUILD_ENV in
    production)
        RUN_CMD="pnpm run build"
        ;;
    staging)
        RUN_CMD="pnpm run build:staging"
        ;;
    box)
        RUN_CMD="pnpm run build:box"
        ;;
    us)
        RUN_CMD="pnpm run build:us"
        ;;
esac
```

### 问题 2：Box 配置中的硬编码 IP

**当前状态：**
- `config.box.ts` 硬编码 IP: `http://10.10.106.51`

**影响：**
- 对于不同网络环境缺乏灵活性
- 如果 IP 变化需要修改代码

**改进建议：**

方案 1：在文档中说明 IP 修改流程
```markdown
要修改 Box 环境 IP：
1. 编辑 config/config.box.ts
2. 更新 BASE_URL 和 WS_BASE_URL
3. 重新构建: pnpm build:box
```

方案 2：支持环境变量覆盖
```typescript
// 在 config.box.ts 中
const BOX_IP = process.env.BOX_IP || '10.10.106.51';
define: {
  'BASE_URL': `http://${BOX_IP}`,
  // ...
}
```

### 问题 3：类型定义不一致

**当前状态：**
- `typings.d.ts` 的 ENVIRONMENT 类型包含 `'development'`
- 不存在 `config.development.ts` 文件

**影响：**
- 类型定义与实际配置不匹配
- 可能给开发者造成困惑

**改进建议：**

方案 1：从类型中移除 development
```typescript
// 在 typings.d.ts 中
declare const ENVIRONMENT: 'production' | 'staging' | 'box' | 'us';
```

方案 2：添加 development 配置
```bash
# 创建 config/config.development.ts 并使用本地设置
```

### 问题 4：包管理器使用不一致

**当前状态：**
- package.json scripts 中使用 `npm run dev`
- 项目标准是 `pnpm`

**影响：**
- 可能导致依赖解析问题
- 与项目规范不一致

**改进建议：**

更新 package.json：
```json
{
  "scripts": {
    "start": "pnpm dev"
  }
}
```

---

## 最佳实践

### 开发

1. 始终使用 `pnpm` 进行包管理
2. 日常开发运行 `pnpm dev`（使用 staging）
3. 部署前在多个环境中测试
4. 切换环境时清空构建目录

### 构建

1. 使用特定环境的构建命令
2. 部署前验证构建产物
3. 推送前本地测试构建的应用
4. 保留构建日志以便排查问题

### 部署

1. 为每个环境使用正确的构建命令
2. 验证健康检查通过
3. 部署后监控应用日志
4. 准备好回滚方案

### 版本控制

1. 分别提交环境配置
2. 记录特定环境的更改
3. 适当标记发布版本
4. 维护更新日志

---

## 附加资源

### 项目文档

- 主 README: `README.md`
- 中文 README: `README.zh.md`
- Box 连接指南: `BoxConnectX7.md`
- 颜色映射: `docs/color-mapping.md`

### 关键文件

- 配置文件: `config/config*.ts`
- URL 配置中心: `src/services/config/urlConfig.ts`
- 请求处理: `src/services/request.ts`
- SSE 处理: `src/services/sseRequest.ts`
- 类型定义: `typings.d.ts`, `src/services/config/types.ts`
- Docker: `Dockerfile`, `build-docker.sh`
- Nginx: `nginx/nginx.conf`, `nginx/default.conf`

### 外部链接

- [UmiJS 文档](https://umijs.org/)
- [React 文档](https://react.dev/)
- [AWS Amplify 文档](https://docs.amplify.aws/)
- [Docker 文档](https://docs.docker.com/)

---

## 技术支持

遇到问题或有疑问时：
1. 首先查看本指南
2. 查阅故障排查部分
3. 检查项目问题/文档
4. 联系开发团队

---

**最后更新：** 2025-01-31
**版本：** 1.0.0
