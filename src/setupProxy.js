const { createProxyMiddleware } = require("http-proxy-middleware");

const proxyOrchestrator = {
    target: process.env.BACKEND_URL ?? "http://localhost:8080",
    changeOrigin: true,
};

const proxyCim = {
    target: process.env.CIM_BACKEND_URL ?? "http://localhost:8081",
    changeOrigin: true,
    pathRewrite: {
        "^/api/surf": "", // remove /api/surf prefix
    },
};

module.exports = function (app) {
    app.use("/api/surf/cim", createProxyMiddleware(proxyCim));
    app.use("/api", createProxyMiddleware(proxyOrchestrator));
};
