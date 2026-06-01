// api/index.ts
// Vercel Serverless API Handler
// Exports the Express app for Vercel's serverless deployment

import app, { testDatabaseConnection, prisma } from '../src/app';

// Test database connection on cold start
let dbReady = false;
testDatabaseConnection().then((connected) => {
  dbReady = connected;
  if (!connected) {
    console.error('❌ Failed to connect to database');
  }
}).catch((error) => {
  console.error('❌ Database connection error:', error);
});

// Export the Express app as the default handler for Vercel
export default app;

// Cleanup on function termination
process.on('exit', async () => {
  await prisma.$disconnect();
});
