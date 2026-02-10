# Environment Guide

## Overview

This guide provides comprehensive information about the different environments available in the **mu_frontend** project, including setup, configuration, deployment, and troubleshooting.

### Available Environments

| Environment | Purpose | API Base URL | Deployment Method |
|------------|---------|--------------|-------------------|
| **Development** | Local development | `https://api-sh.ses.ai` | Local dev server |
| **Staging** | Testing and QA | `https://api-sh.ses.ai` | AWS Amplify |
| **Production** | Production release | `https://prod-api.ses.ai` | AWS Amplify |
| **Box** | Local/LAN testing | `http://10.10.106.51` | Docker + Linux Server |
| **US** | US region testing | `https://llm-staging.ses.ai` | AWS Amplify |

---

## Environment Details

### 1. Development Environment

**Configuration:** Uses `config.staging.ts`

**Start Command:**
```bash
pnpm install
pnpm dev
```

**API Endpoints:**
- REST API: `https://api-sh.ses.ai`
- WebSocket: `https://api-sh.ses.ai`

**Use Cases:**
- Daily development and debugging
- Feature development
- Local testing

**Notes:**
- Hot module replacement (HMR) enabled
- Source maps available for debugging
- Development mode optimizations

---

### 2. Staging Environment

**Configuration File:** `config/config.staging.ts`

**Build Command:**
```bash
pnpm build:staging
```

**API Endpoints:**
- REST API: `https://api-sh.ses.ai`
- WebSocket: `https://api-sh.ses.ai`

**Deployment Method:** AWS Amplify

**Use Cases:**
- Feature testing
- Integration testing
- Pre-production validation
- QA testing

**External URLs:**
- Explorer: `https://buy.stripe.com/test_9B66oGgL2dPh0C12Mzebu01`
- Team: `https://buy.stripe.com/test_9B600iamEeTl1G572Pebu02`

---

### 3. Production Environment

**Configuration File:** `config/config.ts`

**Build Command:**
```bash
pnpm build
# or
pnpm build:prod
```

**API Endpoints:**
- REST API: `https://prod-api.ses.ai`
- WebSocket: `https://prod-api.ses.ai`

**Deployment Method:** AWS Amplify

**Use Cases:**
- Production releases
- Live user traffic
- Customer-facing environment

**External URLs:**
- Explorer: `https://buy.stripe.com/6oE165fCb3Tf0qA5kl`
- Team: `https://buy.stripe.com/dR67utfCb3TffludQS`

**Build Optimizations:**
- Asset hash enabled for cache busting
- JavaScript minification using Terser
- Production-level optimizations
- Source maps disabled

---

### 4. Box Environment

**Configuration File:** `config/config.box.ts`

**Build Command:**
```bash
pnpm build:box
```

**API Endpoints:**
- REST API: `http://10.10.106.51`
- WebSocket: `http://10.10.106.51`

**Deployment Method:** Docker + Linux Server

**Use Cases:**
- Local network testing
- Internal testing environment
- LAN-based development
- Offline testing

**Notes:**
- Uses hardcoded internal IP address
- Suitable for isolated network environments
- No external dependencies

---

### 5. US Environment

**Configuration File:** `config/config.us.ts`

**Build Command:**
```bash
pnpm build:us
```

**API Endpoints:**
- REST API: `https://llm-staging.ses.ai`
- WebSocket: `https://llm-staging.ses.ai`

**Deployment Method:** AWS Amplify

**Use Cases:**
- US region testing
- LLM-specific features testing
- Geographic-specific testing

**External URLs:**
- Explorer: `https://buy.stripe.com/test_9B66oGgL2dPh0C12Mzebu01`
- Team: `https://buy.stripe.com/test_9B600iamEeTl1G572Pebu02`

---

## Environment Variables

### Global Constants (Compile-time Injection)

These variables are injected at build time via UmiJS `define` configuration:

| Variable | Type | Description |
|----------|------|-------------|
| `ENVIRONMENT` | `'production' \| 'staging' \| 'development' \| 'box' \| 'us'` | Current environment identifier |
| `BASE_URL` | `string` | REST API base URL |
| `WS_BASE_URL` | `string` | WebSocket base URL |
| `explorer_url` | `string` | Stripe payment URL for Explorer plan |
| `team_url` | `string` | Stripe payment URL for Team plan |
| `ShowFindFriendsAdvancedOptions` | `boolean` | Feature flag for advanced options |

### Accessing Environment Variables

```typescript
// Direct access (available globally after compilation)
const env = ENVIRONMENT;
const apiUrl = BASE_URL;

// Via URL Config Center (recommended)
import { urlConfig } from '@/services/config/urlConfig';

const currentEnv = urlConfig.getEnvironment();
const baseUrl = urlConfig.getBaseURL();
const fullUrl = urlConfig.buildFullURL('/api/endpoint');
```

---

## Development Workflow

### Initial Setup

```bash
# Install dependencies
pnpm install

# Start development server (uses staging config)
pnpm dev
```

### Environment-Specific Development

```bash
# Development with staging config (default)
pnpm dev

# Development with production config
pnpm start:prod

# Development with box config
pnpm start:box

# Development with US config
pnpm start:us
```

### Building for Production

```bash
# Production build
pnpm build

# Staging build
pnpm build:staging

# Box build
pnpm build:box

# US build
pnpm build:us
```

### Output

All builds output to the `build/` directory.

---

## Docker Deployment (Box Environment)

### Prerequisites

- Docker installed and running
- `build-docker.sh` script (located in project root)

### Build Docker Image

#### Basic Usage

```bash
# Default: ARM64 platform, production environment
./build-docker.sh
```

#### Platform Options

```bash
# Build for AMD64 (x86_64)
./build-docker.sh -p amd64

# Build for ARM64 (Apple Silicon, ARM servers)
./build-docker.sh -p arm64
```

#### Environment Options

```bash
# Build with production config
./build-docker.sh -e production

# Build with staging config
./build-docker.sh -e staging
```

**Note:** Currently, the build script only supports `production` and `staging` environments. To build `box` or `us` environments, you'll need to extend the script (see Configuration Issues section).

#### Registry and Push

```bash
# Build and push to registry
./build-docker.sh -r registry.example.com --push

# Build with custom tag
./build-docker.sh -t v1.0.0

# Combined example
./build-docker.sh -p amd64 -e production -r myregistry.com -t latest --push
```

### Image Tags

**Default tag format:**
```
mu-frontend:YYYYMMDD-HHMMSS-{platform}-{environment}
```

**Example:**
```
mu-frontend:20250131-143022-amd64-production
```

**Custom tag:**
```bash
./build-docker.sh -t v1.0.0
# Result: mu-frontend:v1.0.0
```

### Run Docker Container

```bash
# Run container
docker run -d -p 80:80 mu-frontend:TAG

# Example
docker run -d -p 80:80 mu-frontend:20250131-143022-amd64-production

# With custom name
docker run -d -p 80:80 --name mu-frontend-app mu-frontend:latest
```

### Health Check

```bash
# Check container health
curl http://localhost/health

# Expected response: OK
```

### Container Management

```bash
# View running containers
docker ps

# View logs
docker logs mu-frontend-app

# Stop container
docker stop mu-frontend-app

# Remove container
docker rm mu-frontend-app

# Remove image
docker rmi mu-frontend:TAG
```

---

## AWS Amplify Deployment

Used for **Staging**, **Production**, and **US** environments.

### Build Settings Configuration

Create an `amplify.yml` file in the project root:

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
        # Change based on environment
        - pnpm build:staging  # For staging
        # - pnpm build        # For production
        # - pnpm build:us     # For US
  artifacts:
    baseDirectory: build
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Environment Variables in Amplify

While this project uses compile-time configuration, you can still set environment variables in Amplify console if needed for other purposes.

**Console Path:** App Settings > Environment variables

### Branch Configuration

| Branch | Environment | Build Command |
|--------|-------------|---------------|
| `main` | Production | `pnpm build` |
| `staging` | Staging | `pnpm build:staging` |
| `us-region` | US | `pnpm build:us` |

### Manual Deployment

```bash
# Trigger deployment via git push
git push origin main           # Triggers production build
git push origin staging        # Triggers staging build
git push origin us-region      # Triggers US build
```

---

## Architecture Overview

### Build Process Flow

```
┌─────────────────────────────────────────────┐
│  1. Source Code + Config                    │
│     UMI_ENV variable determines config file │
└────────────┬────────────────────────────────┘
             │
┌────────────▼────────────────────────────────┐
│  2. UmiJS Build Process                     │
│     - Webpack bundling                      │
│     - Define plugin injects env variables   │
│     - Terser minification                   │
│     - Asset hashing                         │
└────────────┬────────────────────────────────┘
             │
┌────────────▼────────────────────────────────┐
│  3. Build Output (build/ directory)         │
│     - index.html                            │
│     - JavaScript bundles                    │
│     - CSS files                             │
│     - Static assets                         │
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

### Runtime Architecture

```
┌──────────────────────────────────────────┐
│  Browser                                 │
│  ┌────────────────────────────────────┐ │
│  │  React Application                 │ │
│  │  ┌──────────────────────────────┐  │ │
│  │  │  URL Config Center           │  │ │
│  │  │  (Singleton)                 │  │ │
│  │  └──────────┬───────────────────┘  │ │
│  │             │                       │ │
│  │  ┌──────────▼──────┐               │ │
│  │  │  HTTP Requests  │               │ │
│  │  │  (Axios)        │               │ │
│  │  └──────────┬──────┘               │ │
│  │             │                       │ │
│  │  ┌──────────▼──────┐               │ │
│  │  │  SSE Requests   │               │ │
│  │  └──────────┬──────┘               │ │
│  └─────────────┼──────────────────────┘ │
└────────────────┼────────────────────────┘
                 │
         ┌───────▼────────┐
         │  Backend API   │
         │  BASE_URL      │
         └────────────────┘
```

---

## Troubleshooting

### Common Issues

#### 1. API Connection Failed

**Symptoms:**
- Network errors in console
- Failed to fetch data
- CORS errors

**Solutions:**
```bash
# Check current environment
import { urlConfig } from '@/services/config/urlConfig';
console.log('Environment:', urlConfig.getEnvironment());
console.log('Base URL:', urlConfig.getBaseURL());

# Verify BASE_URL in build
# Should match expected environment
console.log(BASE_URL);
```

#### 2. Environment Variables Not Working

**Symptoms:**
- Wrong API endpoint
- Features not available

**Diagnosis:**
```bash
# Check build command used
pnpm build         # Should use production config
pnpm build:staging # Should use staging config

# Verify UMI_ENV
echo $UMI_ENV
```

**Solution:**
- Ensure correct build command was used
- Clear build directory: `rm -rf build`
- Rebuild with correct environment

#### 3. Docker Build Failed

**Symptoms:**
- Build script exits with error
- Image not created

**Solutions:**
```bash
# Verify Docker is running
docker info

# Check script permissions
chmod +x build-docker.sh

# Try manual build
docker build --platform linux/amd64 --build-arg BUILD_ENV=production -t mu-frontend .
```

#### 4. Docker Container Not Accessible

**Symptoms:**
- Port 80 not responding
- Health check fails

**Solutions:**
```bash
# Check container status
docker ps -a

# Check container logs
docker logs mu-frontend-app

# Verify port mapping
docker port mu-frontend-app

# Test health endpoint
curl http://localhost/health
```

### Debugging Tips

#### Check Current Environment at Runtime

```typescript
import { urlConfig } from '@/services/config/urlConfig';

// In browser console or component
console.log('Environment:', urlConfig.getEnvironment());
console.log('Base URL:', urlConfig.getBaseURL());
console.log('Build Config:', {
  ENVIRONMENT,
  BASE_URL,
  WS_BASE_URL
});
```

#### Inspect Network Requests

1. Open Browser DevTools (F12)
2. Go to Network tab
3. Check request URLs
4. Verify they use correct BASE_URL

#### View Build Logs

```bash
# During build
pnpm build 2>&1 | tee build.log

# Docker build
./build-docker.sh 2>&1 | tee docker-build.log
```

---

## Configuration Issues and Recommendations

### Issue 1: Limited Docker Script Environment Support

**Current State:**
- `build-docker.sh` only supports `production` and `staging`
- Cannot build Docker images for `box` or `us` environments

**Impact:**
- Box environment cannot be containerized using the script
- US environment cannot be containerized using the script

**Recommendation:**

Extend the script to support all environments:

```bash
# In build-docker.sh, modify the validation section
case $BUILD_ENV in
    production|staging|box|us)
        # Valid environment
        ;;
    *)
        print_error "Unsupported environment: $BUILD_ENV"
        print_error "Supported environments: production, staging, box, us"
        exit 1
        ;;
esac

# Update the build command to use the correct npm script
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

### Issue 2: Hardcoded IP in Box Configuration

**Current State:**
- `config.box.ts` has hardcoded IP: `http://10.10.106.51`

**Impact:**
- Inflexible for different network environments
- Requires code change if IP changes

**Recommendation:**

Option 1: Document IP modification process
```markdown
To change Box environment IP:
1. Edit config/config.box.ts
2. Update BASE_URL and WS_BASE_URL
3. Rebuild: pnpm build:box
```

Option 2: Support environment variable override
```typescript
// In config.box.ts
const BOX_IP = process.env.BOX_IP || '10.10.106.51';
define: {
  'BASE_URL': `http://${BOX_IP}`,
  // ...
}
```

### Issue 3: Type Definition Inconsistency

**Current State:**
- `typings.d.ts` includes `'development'` in ENVIRONMENT type
- No `config.development.ts` file exists

**Impact:**
- Type definition doesn't match actual configurations
- Potential confusion for developers

**Recommendation:**

Option 1: Remove development from types
```typescript
// In typings.d.ts
declare const ENVIRONMENT: 'production' | 'staging' | 'box' | 'us';
```

Option 2: Add development config
```bash
# Create config/config.development.ts with local settings
```

### Issue 4: Package Manager Inconsistency

**Current State:**
- package.json scripts use `npm run dev`
- Project standard is `pnpm`

**Impact:**
- May cause dependency resolution issues
- Inconsistent with project conventions

**Recommendation:**

Update package.json:
```json
{
  "scripts": {
    "start": "pnpm dev"
  }
}
```

---

## Best Practices

### Development

1. Always use `pnpm` for package management
2. Run `pnpm dev` for daily development (uses staging)
3. Test in multiple environments before deployment
4. Clear build directory when switching environments

### Building

1. Use environment-specific build commands
2. Verify build output before deployment
3. Test built application locally before pushing
4. Keep build logs for troubleshooting

### Deployment

1. Use correct build command for each environment
2. Verify health checks pass
3. Monitor application logs after deployment
4. Have rollback plan ready

### Version Control

1. Commit environment configs separately
2. Document environment-specific changes
3. Tag releases appropriately
4. Maintain changelog

---

## Additional Resources

### Project Documentation

- Main README: `README.md`
- Chinese README: `README.zh.md`
- Box Connection Guide: `BoxConnectX7.md`
- Color Mapping: `docs/color-mapping.md`

### Key Files

- Config Files: `config/config*.ts`
- URL Config Center: `src/services/config/urlConfig.ts`
- Request Handler: `src/services/request.ts`
- SSE Handler: `src/services/sseRequest.ts`
- Type Definitions: `typings.d.ts`, `src/services/config/types.ts`
- Docker: `Dockerfile`, `build-docker.sh`
- Nginx: `nginx/nginx.conf`, `nginx/default.conf`

### External Links

- [UmiJS Documentation](https://umijs.org/)
- [React Documentation](https://react.dev/)
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Docker Documentation](https://docs.docker.com/)

---

## Support

For issues or questions:
1. Check this guide first
2. Review troubleshooting section
3. Check project issues/documentation
4. Contact development team

---

**Last Updated:** 2025-01-31
**Version:** 1.0.0
