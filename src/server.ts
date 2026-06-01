// src/server.ts
// Express Server Entry Point
// Starts the application on the configured port

import app, { testDatabaseConnection, prisma } from './app';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const PORT = process.env.PORT || process.env.API_PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================================================
// START SERVER
// ============================================================================

async function startServer() {
  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    const dbConnected = await testDatabaseConnection();

    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Please check DATABASE_URL in .env.local');
      process.exit(1);
    }

    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║         Department360 Academic Dashboard                   ║
║                   STARTED SUCCESSFULLY                      ║
╚════════════════════════════════════════════════════════════╝

📍 Environment: ${NODE_ENV}
🌐 Server URL: http://localhost:${PORT}
📊 API URL: http://localhost:${PORT}/api
🔌 Database: PostgreSQL
✅ Status: Ready to accept requests

Available Endpoints:
  • /api/auth              - Authentication
  • /api/dashboard         - Dashboards
  • /api/faculty           - Faculty Management
  • /api/students          - Student Management
  • /api/tasks             - Task Management
  • /api/accreditation     - Accreditation
  • /api/reports           - Reporting Engine
  • /api/graph             - Graph Integration

Demo Credentials:
  Super Admin: gnanasekar.maths@rathinam.in / Admin@123
  Admin: nss@rathinam.in / Admin@123
  HOD: hod.maths@rathinam.in / Hod@123
  Faculty: faculty1@rathinam.in / Faculty@123
  Student: student1@rathinam.in / Student@123

Health Check: http://localhost:${PORT}/api/health
      `);
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.error('Try killing the process or using a different port:');
        console.error(`   set PORT=5001 && npm run dev`);
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Start the server
startServer();
