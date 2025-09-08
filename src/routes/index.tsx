export default  [
    { path: "/", redirect: "/map" },
    {
        path: "/about",
        component: "About",
        layout: false,
    },
    {
        path: "/terms",
        component: "About/terms",
        layout: false,
    },
    {
        path: "/pricing",
        component: "Pricing"
    },
    {
        path: "/map",
        component: "Map",
    },
    {
        path: "/search",
        component: "Search"
    },
    {
        path: "/filter",
        component: "Filter"
    },
    {
        path: "/favorites",
        component: "Favorites"
    },
    {
        path: "/predict/performance",
        component: "Predict/performance",
    },
    {
        path: "/predict/prediction-tool",
        component: "Predict/predictionTool"
    },
    {
        path: "/ask",
        redirect: "/ask/new"
    },
    {
        path: "/ask/:id",
        component: "Chat",
    },
    {
        path: "/login",
        component: "Login/login",
        layout: false,
    },
    {
        path: "/register",
        component: "Login/register",
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
    {
        path: "/verify-code",
        component: "Login/verifyCode",
        layout: false,
    },
    {
        path: "/verify-education",
        component: "Login/verifyEducation",
        layout: false,
    },
    {
        path: "/verify-forgot-password",
        component: "Login/verifyForgotPassword",
        layout: false,
    },
    {
        path: "/reset-password",
        component: "Login/resetPassword",
        layout: false,
    },
]