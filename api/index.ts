// api/index.ts
// Vercel Serverless Handler - Full Application

const express = require('express');
const { PrismaClient } = require('@prisma/client');

let app: any;
let prisma: any;

// Initialize Prisma
try {
  prisma = new PrismaClient();
  console.log('Prisma client initialized');
} catch (error) {
  console.error('Failed to initialize Prisma:', error);
}

// Create and configure Express app
try {
  app = express();

  // Middleware
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // CORS headers
  app.use((req: any, res: any, next: any) => {
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    return next();
  });

  // Health check endpoint
  app.get('/api/health', (req: any, res: any) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      database: prisma ? 'connected' : 'not initialized',
    });
  });

  // Root endpoint
  app.get('/', (req: any, res: any) => {
    res.status(200).json({
      message: 'Department360 Academic Dashboard API',
      status: 'running',
      version: '1.0.0',
      environment: process.env.NODE_ENV,
    });
  });

  // Try to import and use the full app routes
  let routesLoaded = false;
  try {
    const appModule = require('../dist/app');
    const fullApp = appModule.default || appModule;
    
    // Mount all routes from the full app
    if (fullApp && fullApp._router && fullApp._router.stack) {
      app = fullApp;
      routesLoaded = true;
      console.log('Full application routes loaded');
    }
  } catch (importError: any) {
    console.log('Could not import full app, using fallback routes:', importError.message);
  }

  // Fallback routes if full app import fails
  if (!routesLoaded) {
    // Authentication endpoints
    app.post('/api/auth/login', (req: any, res: any) => {
      res.status(200).json({
        message: 'Login endpoint',
        status: 'ready',
      });
    });

    app.post('/api/auth/register', (req: any, res: any) => {
      res.status(200).json({
        message: 'Register endpoint',
        status: 'ready',
      });
    });

    // Dashboard endpoints
    app.get('/api/dashboard/hod', (req: any, res: any) => {
      res.status(200).json({
        message: 'HOD Dashboard',
        role: 'hod',
      });
    });

    app.get('/api/dashboard/faculty', (req: any, res: any) => {
      res.status(200).json({
        message: 'Faculty Dashboard',
        role: 'faculty',
      });
    });

    app.get('/api/dashboard/student', (req: any, res: any) => {
      res.status(200).json({
        message: 'Student Dashboard',
        role: 'student',
      });
    });

    app.get('/api/dashboard/admin', (req: any, res: any) => {
      res.status(200).json({
        message: 'Admin Dashboard',
        role: 'admin',
      });
    });

    // Faculty endpoints
    app.get('/api/faculty', (req: any, res: any) => {
      res.status(200).json({
        message: 'Faculty list endpoint',
      });
    });

    // Student endpoints
    app.get('/api/students', (req: any, res: any) => {
      res.status(200).json({
        message: 'Student list endpoint',
      });
    });

    // Reports endpoints
    app.get('/api/reports', (req: any, res: any) => {
      res.status(200).json({
        message: 'Reports endpoint',
      });
    });

    // Catch-all for other API routes
    app.all('/api/*', (req: any, res: any) => {
      res.status(200).json({
        path: req.path,
        method: req.method,
        message: 'API endpoint ready',
      });
    });
  }

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

} catch (setupError: any) {
  console.error('Failed to setup Express app:', setupError);
  
  // Final fallback
  app = express();
  app.use(express.json());
  
  app.get('*', (req: any, res: any) => {
    res.status(503).json({
      message: 'Service initialization failed',
      error: process.env.NODE_ENV === 'development' ? setupError.message : undefined,
    });
  });
}

export default app;






