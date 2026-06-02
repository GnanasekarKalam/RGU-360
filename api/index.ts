// api/index.ts
// Vercel Serverless Handler - Standalone Express Server

const express = require('express');

const app = express();

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req: any, res: any) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
  });
});

// Root endpoint
app.get('/', (req: any, res: any) => {
  res.status(200).json({
    message: 'Department360 Academic Dashboard API',
    status: 'running',
    version: '1.0.0',
  });
});

// Generic API endpoint
app.all('/api/*', (req: any, res: any) => {
  res.status(200).json({
    path: req.path,
    method: req.method,
    message: 'API endpoint ready',
  });
});

// 404 handler
app.use((req: any, res: any) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.path,
  });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;




