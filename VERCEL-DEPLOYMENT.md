# Vercel Deployment Guide - Department360 Academic Dashboard

## Prerequisites

Before deploying to Vercel, ensure you have:
- A Vercel account (free tier available)
- GitHub repository with this project
- PostgreSQL database (use Vercel Postgres, Supabase, or other managed service)

## Step 1: Prepare Database

### Option A: Use Vercel Postgres (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create new project
3. In project settings, connect Postgres
4. Copy the connection string to `DATABASE_URL`

### Option B: Use Supabase
1. Create project at [supabase.com](https://supabase.com)
2. Go to Settings → Database → Connection String
3. Copy the PostgreSQL URL

## Step 2: Set Environment Variables

In Vercel Dashboard, go to your project Settings → Environment Variables and add:

```
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=<generate-secure-32-char-string>
JWT_REFRESH_SECRET=<generate-secure-32-char-string>
NEXTAUTH_SECRET=<generate-secure-32-char-string>
NEXTAUTH_URL=https://your-project.vercel.app
NODE_ENV=production
```

To generate secure secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 3: Run Database Migrations

After deployment, run migrations:

```bash
# Remote via Vercel CLI
vercel env pull
npx prisma migrate deploy
npx prisma db seed
```

Or use the migration script in your project.

## Step 4: Configure Build Settings

Vercel should auto-detect based on `vercel.json`, but verify:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## Step 5: Deploy

### Option A: GitHub Integration (Recommended)
1. Connect GitHub repository to Vercel
2. Each push to main branch auto-deploys

### Option B: CLI Deployment
```bash
npm install -g vercel
vercel  # Interactive deployment
```

## Step 6: Verify Deployment

Test your API endpoints:
```bash
curl https://your-project.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-06-01T...",
  "environment": "production"
}
```

## Step 7: Test Authentication

1. Go to: `https://your-project.vercel.app/api/auth/login`
2. Use demo credentials:
   - Email: `gnanasekar.maths@rathinam.in`
   - Password: `Admin@123`

## Troubleshooting

### Issue: "Cannot find module 'prisma'"
```bash
vercel env pull
npm install
```

### Issue: "Database connection failed"
- Verify DATABASE_URL is correct
- Check if database allows remote connections
- Ensure firewall rules permit Vercel IPs

### Issue: "Build command failed"
```bash
# Debug locally with exact Vercel build
vercel build
```

### Issue: "Migrations pending"
Run migrations after deployment:
```bash
vercel env pull
npx prisma migrate deploy
```

## Production Checklist

- [ ] DATABASE_URL is set and correct
- [ ] JWT_SECRET is changed from default
- [ ] NEXTAUTH_SECRET is changed from default
- [ ] NEXTAUTH_URL matches your domain
- [ ] Database backups are configured
- [ ] SSL/HTTPS is enabled
- [ ] Rate limiting is configured
- [ ] Monitoring is set up

## Monitoring

View logs in Vercel Dashboard:
1. Go to your project
2. Deployments → Select deployment → Functions
3. View real-time logs

## Rolling Back

To rollback to previous deployment:
1. Vercel Dashboard → Deployments
2. Right-click deployment
3. Select "Redeploy"

## Performance Optimization

- [ ] Enable Edge Caching in Vercel settings
- [ ] Compress database queries with indexes
- [ ] Implement pagination for large data sets
- [ ] Cache static assets (6 months)

## Security

- [ ] Enable CORS restrictions
- [ ] Set secure HTTP headers
- [ ] Implement rate limiting (already in code)
- [ ] Rotate JWT secrets regularly
- [ ] Use environment variables for sensitive data

## API Endpoints

After deployment, test these endpoints:

```bash
# Health check
GET /api/health

# Authentication
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh

# Dashboards (requires auth token)
GET /api/dashboard/hod
GET /api/dashboard/faculty
GET /api/dashboard/student

# Reports
GET /api/reports
POST /api/reports/generate

# Faculty Management
GET /api/faculty
POST /api/faculty
PUT /api/faculty/:id
```

## Support

For issues:
1. Check Vercel logs
2. Review .env variables
3. Verify database connectivity
4. Check Prisma schema compatibility
5. Review application logs

---

**Deployment Last Updated:** June 1, 2026
**API Version:** 1.0.0
**Node Version:** 18.x
