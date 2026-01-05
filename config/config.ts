import { defineConfig } from "umi";
import path from "path";
import routes from "../src/routes";

export default defineConfig({
  routes,
  npmClient: 'npm',
  favicons: ['https://cdn.prod.website-files.com/671b8da8cb402b2908cb39f0/671bb55d6ea8b4dc808e5cfa_fav-256.png'],
  outputPath: 'build',
  // 启用 hash，为静态资源添加 hash 后缀
  hash: true,
  alias: {
    '@': path.resolve(__dirname, '../src'),
  },
  // 纯 UmiJS 需要显式启用 antd 插件
  plugins: ['@umijs/plugins/dist/antd'],
  // Ant Design 5.x 主题配置
  antd: {
    theme: {
      token: {
        colorPrimary: '#56B26A',      // 主题色（绿色）
        colorLink: '#56B26A',         // 链接色
        colorSuccess: '#56B26A',      // 成功色
        borderRadius: 6,              // 基础圆角
        fontSize: 14,                 // 基础字号
      },
    },
  },
  define: {
    // Environment configuration
    'ENVIRONMENT': 'production',
    'BASE_URL': "https://prod-api.ses.ai",
    'WS_BASE_URL': "https://prod-api.ses.ai",

    // Feature flags
    'ShowFindFriendsAdvancedOptions': true,

    // External service URLs
    'explorer_url': "https://buy.stripe.com/6oE165fCb3Tf0qA5kl",
    'team_url': "https://buy.stripe.com/dR67utfCb3TffludQS",
  },
  // 禁用 esbuild 来规避冲突问题
  esbuildMinifyIIFE: false,
  // 禁用 MFSU 来避免 esbuild 相关问题
  mfsu: false,
  // 禁用 esbuild 压缩，使用 terser 替代
  jsMinifier: 'terser',
  // 禁用 esbuild 转译，使用 babel 替代
  jsMinifierOptions: {},
});
