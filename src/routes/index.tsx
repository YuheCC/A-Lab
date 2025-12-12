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
        path: "/predict/model-detail",
        component: "PredictionTool/model-detail"
    },
    {
        path: "/predict/train",
        component: "PredictionTool/train"
    },
    {
        path: "/manufacture",
        component: "Manufacturing"
    },
    {
        path: '/design',
        component: "Design"
    },
    {
        path: '/design/create',
        component: "Design/create"
    },
    {
        path: '/design/record',
        component: "Design/record"
    },
    {
        path: '/design/model-detail',
        component: "Design/model-detail"
    },
    {
        path: '/design/train',
        component: "Design/train"
    },
    {
        path: "/formulate",
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