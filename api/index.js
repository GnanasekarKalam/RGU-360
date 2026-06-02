// api/index.js
// Vercel Serverless API Handler (JavaScript wrapper)

module.exports = require('../dist/vercel-handler').default || require('../dist/vercel-handler');

