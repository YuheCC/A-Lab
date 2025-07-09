export default  [
    { path: "/", component: "index" },
    { path: "/docs", component: "docs" },
    {
        path: "/about",
        component: "About"
    },
    {
        path: "/pricing",
        component: "Pricing"
    },
    {
        path: "/login",
        component: "Login/login",
        layout: false,
    },
    {
        path: "/redeem",
        component: "Login/redeem",
        layout: false,
    },
    {
        path: "/forgot-password",
        component: "Login/forgot",
        layout: false,
    },
]