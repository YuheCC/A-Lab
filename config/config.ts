import { defineConfig } from "umi";
import routes from "../src/routes";

export default defineConfig({
  routes,
  npmClient: 'npm',
  favicons: ['https://cdn.prod.website-files.com/671b8da8cb402b2908cb39f0/671bb55d6ea8b4dc808e5cfa_fav-256.png'],
  define: {
    'BASE_URL': "https://api-sh.ses.ai",
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
