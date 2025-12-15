import { defineConfig } from "umi";
import path from "path";

export default defineConfig({
  alias: {
    '@': path.resolve(__dirname, '../src'),
  },
  define: {
    // Environment configuration
    'ENVIRONMENT': 'box',
    'BASE_URL': 'http://10.10.106.51',
    'WS_BASE_URL': 'http://10.10.106.51',

    // Feature flags
    'ShowFindFriendsAdvancedOptions': true,

    // External service URLs (align with staging defaults)
    'explorer_url': "https://buy.stripe.com/test_9B66oGgL2dPh0C12Mzebu01",
    'team_url': "https://buy.stripe.com/test_9B600iamEeTl1G572Pebu02",
  },
});
