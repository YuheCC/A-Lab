import { defineConfig } from "umi";
import path from "path";

export default defineConfig({
  alias: {
    '@': path.resolve(__dirname, '../src'),
  },
  define: {
    'BASE_URL': "http://ec2-52-55-11-145.compute-1.amazonaws.com",
    'explorer_url': "https://buy.stripe.com/test_9B66oGgL2dPh0C12Mzebu01",
    'team_url': "https://buy.stripe.com/test_9B600iamEeTl1G572Pebu02",
  },
});
