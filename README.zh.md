# UMAP 分子可视化应用

一个基于 React 和 UmiJS 的分子可视化和分析平台，提供交互式分子地图、智能聊天和数据探索功能。

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- pnpm >= 8.0.0

### 安装依赖
```bash
pnpm install
```

### 开发环境启动
```bash
# 启动开发服务器 (使用 staging 环境配置)
pnpm dev

# 或者使用生产环境配置
pnpm start:prod
```

### 构建项目
```bash
# 生产环境构建
pnpm build

# 测试环境构建
pnpm build:staging
```

## ⚙️ 配置说明

### 环境配置

项目支持两种环境配置：

#### 1. 生产环境配置 (`config/config.ts`)
```typescript
define: {
  'BASE_URL': "https://prod-api.ses.ai",
  'explorer_url': "https://buy.stripe.com/6oE165fCb3Tf0qA5kl",
  'team_url': "https://buy.stripe.com/dR67utfCb3TffludQS",
}
```

#### 2. 测试环境配置 (`config/config.staging.ts`)
```typescript
define: {
  'BASE_URL': "https://api-sh.ses.ai",
  'explorer_url': "https://buy.stripe.com/test_9B66oGgL2dPh0C12Mzebu01",
  'team_url': "https://buy.stripe.com/test_9B600iamEeTl1G572Pebu02",
}
```

### BaseURL 配置

BaseURL 是后端API的地址，可以通过以下方式配置：

1. **修改生产环境BaseURL**：
   编辑 `config/config.ts` 文件中的 `BASE_URL` 值

2. **修改测试环境BaseURL**：
   编辑 `config/config.staging.ts` 文件中的 `BASE_URL` 值

3. **运行时环境切换**：
   - 开发模式默认使用 staging 配置
   - 生产构建使用生产配置
   - 可通过 `UMI_ENV` 环境变量切换

### 其他配置项

- `explorer_url`: 探索者版本购买链接
- `team_url`: 团队版本购买链接
- `outputPath`: 构建输出目录 (默认: `build`)
- `favicons`: 网站图标配置

## 🌟 主要功能

- **分子可视化**: 使用 UMAP 算法的交互式分子地图
- **智能聊天**: 基于 AI 的分子相关问答
- **数据探索**: 分子数据搜索和过滤
- **多语言支持**: 中文、英语、韩语
- **用户管理**: 登录、注册、用户设置
- **定价方案**: 灵活的订阅计划

## 📁 项目结构

```
src/
├── components/     # 公共组件
├── pages/         # 页面组件
├── models/        # 数据模型和状态管理
├── services/      # API 服务
├── locales/       # 多语言配置
├── hooks/         # 自定义 Hooks
└── utils.js       # 工具函数
```

## 🔧 开发说明

### 主要依赖
- **框架**: UmiJS 4.x + React 19
- **UI 组件**: Material-UI
- **可视化**: Plotly.js, Deck.gl
- **状态管理**: Zustand
- **国际化**: i18next

### 开发环境变量
```bash
# 使用 staging 环境
UMI_ENV=staging pnpm dev

# 使用 production 环境
pnpm start:prod
```

## 📝 部署说明

1. **构建项目**：
   ```bash
   pnpm build
   ```

2. **部署文件**：
   构建完成后，`build` 目录包含所有静态文件

3. **环境配置**：
   确保目标环境的 BaseURL 配置正确

## 📚 文档资源

### 环境开发指南

有关环境配置、部署和故障排查的详细信息，请参阅：

- **[Environment Guide (English)](./ENVIRONMENT_GUIDE.md)** - 包含 Development、Staging、Production、Box 和 US 所有环境的完整指南
- **[环境指南 (中文)](./ENVIRONMENT_GUIDE.zh-CN.md)** - 完整的环境配置、部署和故障排查指南

环境指南涵盖：
- 详细的环境设置和配置
- 开发工作流程
- Docker 部署（Box 环境）
- AWS Amplify 部署（Staging/Production/US 环境）
- 配置最佳实践和改进建议
- 常见问题排查

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

## 📄 许可证

本项目为私有项目，版权归 SES.AI 所有。

---

如有问题，请联系开发团队：feiran.wang@ses.ai

## 📖 语言版本

- [中文版本 (Chinese)](./README.zh.md) (当前)
- [English Version](./README.md)
