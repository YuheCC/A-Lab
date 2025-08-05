# UMAP Molecular Visualization Application

A molecular visualization and analysis platform based on React and UmiJS, providing interactive molecular maps, intelligent chatbots, and data exploration features.

## 🚀 Quick Start

### Requirements
- Node.js >= 16.0.0
- pnpm >= 8.0.0

### Install Dependencies
```bash
pnpm install
```

### Development Server
```bash
# Start development server (using staging environment config)
pnpm dev

# Or use production environment config
pnpm start:prod
```

### Build Project
```bash
# Production build
pnpm build

# Staging build
pnpm build:staging
```

## ⚙️ Configuration

### Environment Configuration

The project supports two environment configurations:

#### 1. Production Environment (`config/config.ts`)
```typescript
define: {
  'BASE_URL': "https://prod-api.ses.ai",
  'explorer_url': "https://buy.stripe.com/6oE165fCb3Tf0qA5kl",
  'team_url': "https://buy.stripe.com/dR67utfCb3TffludQS",
}
```

#### 2. Staging Environment (`config/config.staging.ts`)
```typescript
define: {
  'BASE_URL': "https://api-sh.ses.ai",
  'explorer_url': "https://buy.stripe.com/test_9B66oGgL2dPh0C12Mzebu01",
  'team_url': "https://buy.stripe.com/test_9B600iamEeTl1G572Pebu02",
}
```

### BaseURL Configuration

BaseURL is the backend API address, which can be configured in the following ways:

1. **Modify Production BaseURL**:
   Edit the `BASE_URL` value in `config/config.ts`

2. **Modify Staging BaseURL**:
   Edit the `BASE_URL` value in `config/config.staging.ts`

3. **Runtime Environment Switching**:
   - Development mode uses staging config by default
   - Production build uses production config
   - Switch via `UMI_ENV` environment variable

### Other Configuration Items

- `explorer_url`: Explorer version purchase link
- `team_url`: Team version purchase link
- `outputPath`: Build output directory (default: `build`)
- `favicons`: Website favicon configuration

## 🌟 Key Features

- **Molecular Visualization**: Interactive molecular maps using UMAP algorithm
- **Intelligent Chat**: AI-powered molecular Q&A
- **Data Exploration**: Molecular data search and filtering
- **Multi-language Support**: Chinese, English, Korean
- **User Management**: Login, registration, user settings
- **Pricing Plans**: Flexible subscription plans

## 📁 Project Structure

```
src/
├── components/     # Common components
├── pages/         # Page components
├── models/        # Data models and state management
├── services/      # API services
├── locales/       # Multi-language configuration
├── hooks/         # Custom hooks
└── utils.js       # Utility functions
```

## 🔧 Development

### Main Dependencies
- **Framework**: UmiJS 4.x + React 19
- **UI Components**: Material-UI
- **Visualization**: Plotly.js, Deck.gl
- **State Management**: Zustand
- **Internationalization**: i18next

### Development Environment Variables
```bash
# Use staging environment
UMI_ENV=staging pnpm dev

# Use production environment
pnpm start:prod
```

## 📝 Deployment

1. **Build Project**:
   ```bash
   pnpm build
   ```

2. **Deploy Files**:
   After building, the `build` directory contains all static files

3. **Environment Configuration**:
   Ensure the target environment's BaseURL configuration is correct

## 🤝 Contributing

1. Fork the project
2. Create a feature branch
3. Submit changes
4. Create a Pull Request

## 📄 License

This project is private and owned by SES.AI.

---

For any questions, please contact the development team: feiran.wang@ses.ai

## 📖 Language Versions

- [中文版本 (Chinese)](./README.zh.md)
- [English Version](./README.md) (Current) 