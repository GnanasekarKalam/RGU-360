/**
 * Vercel Build Configuration
 * Handles TypeScript compilation and deployment
 */

module.exports = {
  // Build settings
  buildCommand: 'npm run build',
  outputDirectory: 'dist',
  
  // Environment variables that must be set in Vercel
  requiredEnvVars: [
    'DATABASE_URL',
    'JWT_SECRET',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'NODE_ENV'
  ],
  
  // Vercel serverless function configuration
  functions: {
    'src/**/*.ts': {
      memory: 512,
      maxDuration: 30,
      environment: ['DATABASE_URL', 'JWT_SECRET', 'NEXTAUTH_SECRET']
    }
  },
  
  // Routes configuration
  routes: [
    {
      src: '/api/(.*)',
      dest: 'src/index.ts',
      headers: {
        'Cache-Control': 'no-store, must-revalidate'
      }
    },
    {
      src: '/health',
      dest: 'src/index.ts'
    }
  ],
  
  // Caching strategy
  caching: {
    maxAge: 86400,  // 24 hours
    excludePatterns: ['/api/.*', '/health']
  }
};
