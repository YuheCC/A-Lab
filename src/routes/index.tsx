export default  [
    { path: "/", redirect: "/map", layout: false },
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
        path: "/predict",
        component: "PredictionTool"
    },
    {
        path: "/predict/create",
        component: "PredictionTool/create"
    },
    {
        path: "/predict/detail",
        component: "PredictionTool/detail"
    },
    {
        path: '/design',
        component: "Predict/performance"
    },
    {
        path: "/formulate",
        redirect: "/formulate/new"
    },
    {
        path: "/formulate/new",
        component: "FormulationNew"
    },
    {
        path: "/formulate/result-tip",
        component: "FormulationNew/result-tip"
    },
    {
        path: "/formulate/create",
        component: "FormulationNew/create"
    },
    {
        path: "/formulate/detail",
        component: "FormulationNew/detail"
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