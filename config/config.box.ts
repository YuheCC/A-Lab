import { defineConfig } from "umi";
import path from "path";

// 根据环境判断 URL
const isDev = process.env.NODE_ENV === 'development';
const baseUrl = isDev ? 'http://10.10.106.51' : '/';

console.log('[config.box.ts] Loading BOX environment config');
console.log('[config.box.ts] NODE_ENV:', process.env.NODE_ENV);
console.log('[config.box.ts] UMI_ENV:', process.env.UMI_ENV);
console.log('[config.box.ts] baseUrl:', baseUrl);

export default defineConfig({
  alias: {
    '@': path.resolve(__dirname, '../src'),
  },
  define: {
    // Environment configuration
    'ENVIRONMENT': 'box',
    'BASE_URL': baseUrl,
    'WS_BASE_URL': baseUrl,

    // Feature flags
    'ShowFindFriendsAdvancedOptions': true,

    // External service URLs (align with staging defaults)
    'explorer_url': "https://buy.stripe.com/test_9B66oGgL2dPh0C12Mzebu01",
    'team_url': "https://buy.stripe.com/test_9B600iamEeTl1G572Pebu02",
  },
});
