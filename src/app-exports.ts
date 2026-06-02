// src/app.ts - updated export for CommonJS compatibility
// ... (rest of file remains the same)
// At the end of file, change from:
// export default app;
// To:

export default app;
module.exports = app;
module.exports.prisma = prisma;
module.exports.testDatabaseConnection = testDatabaseConnection;
