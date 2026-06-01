// SETUP-AND-RUN-GUIDE.md
# Department360 Academic Dashboard - Setup & Run Guide

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL 12+ running locally
- Git

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Database
```bash
# Create PostgreSQL database (if not exists)
createdb -U postgres department360_dev

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed with demo data
npx prisma db seed
```

### Step 3: Start Development Server
```bash
npm run dev
```

Server will start on: **http://localhost:5000**

### Step 4: Login with Demo Credentials
- **Super Admin**: gnanasekar.maths@rathinam.in / Admin@123
- **Admin**: nss@rathinam.in / Admin@123
- **HOD**: hod.maths@rathinam.in / Hod@123
- **Faculty**: faculty1@rathinam.in / Faculty@123
- **Student**: student1@rathinam.in / Student@123
- **IQAC**: iqac@rathinam.in / Iqac@123
- **Management**: management1@rathinam.in / Manage@123

---

## 📋 Detailed Setup Instructions

### 1. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your settings
```

**Required values for local development**:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Random string for JWT signing
- `JWT_REFRESH_SECRET` - Random string for refresh tokens
- `NEXTAUTH_SECRET` - Random string for NextAuth

**Generate random secrets**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Database Setup

#### Option A: Using PostgreSQL CLI
```bash
# Create database
createdb -U postgres department360_dev

# Verify connection in .env.local
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/department360_dev"
```

#### Option B: Using Docker (Recommended)
```bash
# Run PostgreSQL in Docker
docker run -d \
  --name department360-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=department360_dev \
  -p 5432:5432 \
  postgres:15-alpine

# Verify connection
docker exec department360-postgres psql -U postgres -d department360_dev -c "SELECT 1"
```

#### Option C: Using Docker Compose
Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: department360_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Then run:
```bash
docker-compose up -d
```

### 3. Prisma Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev

# View database
npx prisma studio  # Opens http://localhost:5555

# Seed database with demo data
npx prisma db seed
```

### 4. Start Application

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start

# Watch TypeScript compilation
npx tsc --watch
```

---

## 🧪 Verification Checklist

After starting the server, verify these endpoints:

### Health & Status
```bash
# Health check
curl http://localhost:5000/api/health

# Should return:
# {"status":"ok","timestamp":"2024-06-01T...","environment":"development"}
```

### Authentication
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gnanasekar.maths@rathinam.in","password":"Admin@123"}'

# Should return JWT token
```

### Dashboard
```bash
# Get dashboard data (requires auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/dashboard/super-admin
```

### Faculty
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/faculty
```

### Students
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/students
```

---

## 🔧 Common Setup Issues

### Issue: "Port 5000 already in use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>

# Or use different port
set PORT=5001 && npm run dev
```

### Issue: "Cannot connect to database"
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Verify DATABASE_URL in .env.local
# Should be: postgresql://user:password@localhost:5432/database_name

# Test connection
npx prisma db execute --stdin
SELECT 1;  # Type this, then Ctrl+D
```

### Issue: "Prisma migration failed"
```bash
# Reset database (WARNING: deletes data)
npx prisma migrate reset

# Or manually:
# 1. Drop database
dropdb -U postgres department360_dev

# 2. Recreate database
createdb -U postgres department360_dev

# 3. Run migrations
npx prisma migrate dev
```

### Issue: "Module not found" errors
```bash
# Regenerate Prisma client
npx prisma generate

# Reinstall dependencies
rm -rf node_modules
npm install

# Clear cache
npm cache clean --force
```

### Issue: "JWT token expired"
This is expected in development. Generate new token:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gnanasekar.maths@rathinam.in","password":"Admin@123"}'
```

---

## 📚 Available Commands

```bash
# Development
npm run dev                # Start development server with hot reload
npm run type-check         # Check TypeScript errors
npm run lint               # Run ESLint
npm run lint:fix           # Fix ESLint errors
npm run format             # Format code with Prettier

# Build & Production
npm run build              # Compile TypeScript to JavaScript
npm start                  # Run production build

# Database
npm run db:migrate         # Run migrations interactively
npm run db:migrate:deploy  # Deploy migrations (CI/CD)
npm run db:seed            # Seed database with test data
npm run db:studio          # Open Prisma Studio UI
npm run db:reset           # Reset database (WARNING: deletes data)
npx prisma generate        # Generate Prisma client

# Testing
npm test                   # Run tests
npm run test:watch         # Run tests in watch mode

# Cleanup
npm run clean              # Remove dist, node_modules
```

---

## 🏗️ Project Structure

```
department360-academic-dashboard/
├── src/
│   ├── app.ts              # Express app setup
│   ├── server.ts           # Entry point (starts HTTP server)
│   ├── index.ts            # Module exports
│   ├── routes/             # API endpoints
│   ├── services/           # Business logic
│   ├── middleware/         # Auth, validation, logging
│   ├── config/             # Configuration files
│   ├── types/              # TypeScript types
│   ├── utils/              # Utility functions
│   └── components/         # React components
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.ts             # Seed data generator
│   └── migrations/         # Database migrations
├── docs/                   # Documentation
├── .env.local              # Environment variables (git ignored)
├── .env.example            # Environment template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
└── .gitignore              # Git ignore rules
```

---

## 📊 Database Schema Overview

Key tables:
- **users** - All system users
- **userRoles** - User-role assignments
- **roles** - System roles (Admin, HOD, Faculty, etc.)
- **faculty** - Faculty information
- **students** - Student information
- **classes** - Course sections
- **tasks** - Task management
- **taskAssignments** - Task assignments
- **approvals** - Workflow approvals
- **reports** - Generated reports
- **auditLogs** - Activity audit trail

---

## 🔐 Security Notes

For **local development**:
- ✅ Use simple passwords
- ✅ Use default JWT secrets (change for production)
- ✅ Disable MFA (set MFA_ENABLED=false)
- ✅ Mock external services

For **production**:
- ❌ Never commit .env.local
- ❌ Use strong JWT secrets (32+ characters)
- ❌ Enable MFA and other security features
- ❌ Use HTTPS (set NEXTAUTH_URL to https://)
- ❌ Use managed database service
- ❌ Enable audit logging
- ❌ Rotate secrets regularly

---

## 📞 Troubleshooting

### Check Logs
```bash
# Backend logs (in console)
npm run dev

# Database logs
# Check PostgreSQL activity
```

### Debug Mode
```bash
# Enable detailed logging
DEBUG=* npm run dev

# TypeScript source maps
npm run dev  # Source maps enabled by default in dev
```

### Database Tools
```bash
# Open Prisma Studio UI
npx prisma studio
# Opens http://localhost:5555

# Run direct SQL query
npx prisma db execute --stdin
```

---

## 🚀 Next Steps After Setup

1. **Verify all endpoints** - Test each API endpoint with demo credentials
2. **Review documentation** - Read docs/ folder for architecture details
3. **Explore database** - Use Prisma Studio to view data structure
4. **Run tests** - Execute test suite
5. **Start development** - Begin building features

---

## 📖 Documentation Files

- [README.md](README.md) - Project overview
- [docs/architecture/](docs/architecture/) - System architecture
- [docs/database/](docs/database/) - Database schema
- [AUTHENTICATION-SYSTEM.md](AUTHENTICATION-SYSTEM.md) - Auth details
- [DASHBOARD-COMPLETE-SUMMARY.md](DASHBOARD-COMPLETE-SUMMARY.md) - Dashboard features
- [TASK-MANAGEMENT-COMPLETE-SUMMARY.md](TASK-MANAGEMENT-COMPLETE-SUMMARY.md) - Task management
- [REPORTING-ENGINE-DELIVERY-SUMMARY.md](REPORTING-ENGINE-DELIVERY-SUMMARY.md) - Reporting
- [GRAPH-INTEGRATION-COMPLETION-SUMMARY.md](GRAPH-INTEGRATION-COMPLETION-SUMMARY.md) - Graph API

---

## ✅ Success Criteria

You'll know setup is complete when:
- ✅ `npm run dev` starts without errors
- ✅ `curl http://localhost:5000/api/health` returns 200 OK
- ✅ Database migrations complete successfully
- ✅ Can login with demo credentials
- ✅ Dashboard displays data
- ✅ All endpoints return data (with valid auth token)

---

## 🆘 Need Help?

1. Check the logs first
2. Review this guide's troubleshooting section
3. Check the docs/ folder for module-specific documentation
4. Verify .env.local configuration
5. Verify database connection

---

**Status**: Production-Ready Infrastructure
**Last Updated**: June 2024
**Version**: 1.0.0
