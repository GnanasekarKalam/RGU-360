// api/index.ts
// Vercel Serverless Handler - Full App Handler

const express = require('express');

// Import the full Express app
let app: any;

try {
  // Try importing the compiled app
  const compiledApp = require('../dist/app');
  app = compiledApp.default || compiledApp;
} catch (importError: any) {
  console.log('Could not import compiled app, falling back to minimal handler', importError.message);
  
  // Fallback to minimal handler if import fails
  app = express();
  app.use(express.json());

  app.get('/api/health', (req: any, res: any) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      handler: 'fallback-minimal',
    });
  });

  app.get('/', (req: any, res: any) => {
    res.status(200).json({
      message: 'Department360 Academic Dashboard API',
      status: 'running',
      version: '1.0.0',
      handler: 'fallback-minimal',
    });
  });

  app.use((req: any, res: any) => {
    res.status(404).json({
      message: 'Route not found',
      path: req.path,
    });
  });
}

export default app;





