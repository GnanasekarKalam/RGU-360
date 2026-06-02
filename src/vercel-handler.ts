// src/vercel-handler.ts
// Wrapper for Vercel serverless handler

import app, { prisma, testDatabaseConnection } from './app';

// Export for CommonJS (Vercel Node.js runtime)
export default app;

// Also export for require() calls
module.exports = app;
module.exports.default = app;
module.exports.prisma = prisma;
module.exports.testDatabaseConnection = testDatabaseConnection;
