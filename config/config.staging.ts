import { defineConfig } from "umi";
import path from "path";

export default defineConfig({
  alias: {
    '@': path.resolve(__dirname, '../src'),
  },
  define: {
    // Environment configuration
    'ENVIRONMENT': 'staging',
    'BASE_URL': 'https://dev-sh.ses.ai',
    'WS_BASE_URL': 'https://dev-sh.ses.ai',

    // Feature flags
    'ShowFindFriendsAdvancedOptions': true,

    // External service URLs
    'explorer_url': "https://buy.stripe.com/test_9B66oGgL2dPh0C12Mzebu01",
    'team_url': "https://buy.stripe.com/test_9B600iamEeTl1G572Pebu02",
  },
});

