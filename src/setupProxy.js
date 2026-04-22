// Dev-only proxy: forwards /bwapi/* to api.bandwidth.com so the browser
// bypasses CORS when the SDK creates an endpoint during local testing.
// Set REACT_APP_HTTP_BASE_URL=/bwapi in .env to route SDK traffic here.
// Production apps should use a proper customer backend.

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/bwapi',
    createProxyMiddleware({
      target: 'https://api.bandwidth.com',
      changeOrigin: true,
      pathRewrite: { '^/bwapi': '/v2' },
    })
  );
};
