// src/app.ts
// Main Express Application Setup
// Initialize and configure all middleware, routes, and error handlers

import express, { Express, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Import routes
import authRoutes from './routes/auth-complete.routes';
import dashboardRoutes from './routes/dashboard.routes';
import facultyRoutes from './routes/faculty-master-complete.routes';
import studentRoutes from './routes/student-master-complete.routes';
import taskRoutes from './routes/task-management.routes';
import accreditationRoutes from './routes/accreditation.routes';
import reportingRoutes from './routes/reporting.routes';
import reportRoutes from './routes/reports.routes';
import graphRoutes from './routes/graph-integration.routes';

// Import middleware
import { authenticate } from './middleware/auth-complete.middleware';

// ============================================================================
// APPLICATION SETUP
// ============================================================================

const app: Express = express();
export const prisma = new PrismaClient();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// HTTP request logging
app.use(morgan('combined'));

// CORS headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  return next();
});

// Security headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  return next();
});

// Static files
app.use(express.static('public'));

// ============================================================================
// ROUTES
// ============================================================================

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Authentication routes (no auth required)
app.use('/api/auth', authRoutes);

// Protected routes (require authentication)
app.use('/api/dashboard', authenticate, dashboardRoutes);
app.use('/api/faculty', authenticate, facultyRoutes);
app.use('/api/students', authenticate, studentRoutes);
app.use('/api/tasks', authenticate, taskRoutes);
app.use('/api/accreditation', authenticate, accreditationRoutes);
app.use('/api/reports', authenticate, reportingRoutes);
app.use('/api/reports-new', authenticate, reportRoutes);
app.use('/api/graph', authenticate, graphRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 Not Found handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Unique constraint violation',
      field: err.meta?.target?.[0],
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    });
  }

  // Validation errors
  if (err.isJoi || err.details) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: err.details || err.message,
    });
  }

  // Default error response
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

// Test database connection on startup
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
