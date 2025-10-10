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
    // {
    //     path: "/predict/performance",
    //     component: "Predict/performance",
    // },
    // {
    //     path: "/predict/prediction-tool",
    //     component: "Predict/predictionTool"
    // },
    {
        path: "/predict",
        component: "Predict/predictionTool"
    },
    {
        path: '/design',
        component: "Predict/performance"
    },
    {
        path: "/formulation",
        redirect: "/formulation/new"
    },
    {
        path: "/formulation/new",
        component: "FormulationNew"
    },
    {
        path: "/formulation/result-tip",
        component: "FormulationNew/result-tip"
    },
    {
        path: "/formulation/create",
        component: "FormulationNew/create"
    },
    {
        path: "/formulation/detail",
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