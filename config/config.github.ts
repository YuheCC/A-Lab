import { defineConfig } from "umi";
import path from "path";

export default defineConfig({
  alias: {
    "@": path.resolve(__dirname, "../src"),
  },
  base: "/A-Lab/",
  publicPath: "/A-Lab/",
  history: {
    type: "hash",
  },
  routes: [
    {
      path: "/",
      component: "ALab",
      layout: false,
    },
    {
      path: "*",
      redirect: "/",
    },
  ],
  define: {
    ENVIRONMENT: "github",
    BASE_URL: "/",
    WS_BASE_URL: "/",
    ShowFindFriendsAdvancedOptions: true,
    explorer_url: "https://buy.stripe.com/test_9B66oGgL2dPh0C12Mzebu01",
    team_url: "https://buy.stripe.com/test_9B600iamEeTl1G572Pebu02",
  },
});
