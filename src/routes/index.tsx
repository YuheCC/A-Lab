declare const ENVIRONMENT: string;

const githubRoutes = [
  { path: '/', component: 'ALab', layout: false },
  { path: '*', redirect: '/', layout: false },
];

const appRoutes = [
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
        redirect: '/design/electrolyte'
    },
    {
        path: '/design/electrolyte',
        component: "Design/Electrolyte"
    },
    {
        path: '/design/electrolyte/create',
        component: "Design/Electrolyte/create"
    },
    {
        path: '/design/electrolyte/record',
        component: "Design/Electrolyte/record"
    },
    {
        path: '/design/electrolyte/model-detail',
        component: "Design/Electrolyte/model-detail"
    },
    {
        path: '/design/electrolyte/train',
        component: "Design/Electrolyte/train"
    },
    {
        path: '/design/electrode',
        component: "Design/Electrode"
    },
    {
        path: '/design/electrode/predict',
        component: "Design/Electrode/Predict"
    },
    {
        path: '/design/electrode/optimize',
        component: "Design/Electrode/Optimize"
    },
    {
        path: '/design/electrode/detail/:id',
        component: "Design/Electrode/Detail"
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
        path: "/a-lab",
        component: "ALab",
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
    {
        path: "*",
        component: "404",
    },
];

export default ENVIRONMENT === 'github' ? githubRoutes : appRoutes;