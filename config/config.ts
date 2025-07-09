import { defineConfig } from "umi";
import routes from "../src/routes";

export default defineConfig({
  routes,
  npmClient: 'pnpm',
  favicons: ['https://cdn.prod.website-files.com/671b8da8cb402b2908cb39f0/671bb55d6ea8b4dc808e5cfa_fav-256.png'],
  define: {
    'BASE_URL': "https://api.ses.ai",
  },
});
