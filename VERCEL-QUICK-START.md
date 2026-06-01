# Quick Vercel Deployment Guide

> **Status**: Ready for deployment with necessary configurations

## 🚀 5-Minute Deployment

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Grant necessary permissions

### Step 2: Create PostgreSQL Database

**Option A: Vercel Postgres (Recommended)**
```bash
# Login to Vercel CLI
vercel login

# Create project with database
vercel project add department360
```

**Option B: Supabase (Alternative)**
1. Sign up at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy PostgreSQL connection string

### Step 3: Get Connection String

Store this securely - you'll need it for environment variables:
```
postgresql://user:password@host:port/database
```

### Step 4: Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit for Vercel deployment"

# Create repo on GitHub
# Then push
git remote add origin https://github.com/yourusername/department360.git
git push -u origin main
```

### Step 5: Connect to Vercel

**Method A: Web Dashboard**
1. Visit [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel auto-detects configuration from `vercel.json`

**Method B: CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Step 6: Set Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:

```
DATABASE_URL = postgresql://...
JWT_SECRET = [generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
JWT_REFRESH_SECRET = [generate same way]
NEXTAUTH_SECRET = [generate same way]
NEXTAUTH_URL = https://your-project.vercel.app
NODE_ENV = production
```

### Step 7: Deploy

```bash
# Option A: Auto-deploy via GitHub push
git push origin main

# Option B: Manual deploy
vercel --prod

# Option C: Via Vercel Dashboard - "Deploy" button
```

### Step 8: Run Migrations

After first deployment:

```bash
# Pull environment variables
vercel env pull

# Run migrations
npx prisma migrate deploy

# Seed database (creates demo users)
npx prisma db seed
```

### Step 9: Test Deployment

```bash
# Health check
curl https://your-project.vercel.app/api/health

# Response should be:
# {"status":"ok","timestamp":"2026-06-01T...","environment":"production"}
```

### Step 10: Login with Demo Credentials

Navigate to: `https://your-project.vercel.app/api/auth/login`

**Demo Credentials:**
| Role | Email | Password |
|------|-------|----------|
| Super Admin | gnanasekar.maths@rathinam.in | Admin@123 |
| Admin | nss@rathinam.in | Admin@123 |
| HOD | hod.maths@rathinam.in | Hod@123 |
| Faculty | faculty1@rathinam.in | Faculty@123 |
| Student | student1@rathinam.in | Student@123 |

---

## 📋 Checklist

- [ ] Vercel account created
- [ ] GitHub repository pushed
- [ ] PostgreSQL database created
- [ ] CONNECTION string obtained
- [ ] Environment variables set in Vercel
- [ ] First deployment successful
- [ ] Database migrations applied
- [ ] Health endpoint responds
- [ ] Login with demo credentials works
- [ ] Dashboard loads correctly

---

## 🔧 Troubleshooting

### Build Fails: "Cannot find module 'prisma'"
```bash
vercel env pull
npm install
vercel deploy --prod
```

### Database Connection Error
1. Verify DATABASE_URL is correct
2. Check database allows remote connections
3. Ensure firewall rules permit Vercel IPs
4. Test locally: `npx prisma studio`

### "Migration pending" Error
```bash
# Manually run migrations
vercel env pull
npx prisma migrate deploy
npx prisma db seed
```

### TypeScript Compilation Error
```bash
# Clear build cache and redeploy
vercel deploy --prod --force
```

### 502 Bad Gateway
- Check Application logs in Vercel Dashboard
- Verify environment variables
- Check database connectivity
- Review Prisma migrations status

---

## 📊 Vercel Dashboard Features to Know

### Deployments Tab
- View deployment history
- Promote to production
- Rollback to previous versions
- View deployment logs

### Settings Tab
- **Domains**: Add custom domain
- **Environment Variables**: Add/edit env vars
- **Build & Development**: Configure build command
- **Git**: Auto-deployment rules

### Monitoring Tab
- View API response times
- Monitor function execution
- Check error rates
- View usage analytics

### Analytics Tab
- Track page views
- Monitor performance
- View real-time metrics

---

## 🔒 Security Best Practices

1. **Never** commit `.env.local` to Git
2. **Generate** new JWT_SECRET for production
3. **Use** strong database passwords
4. **Enable** GitHub branch protection
5. **Rotate** secrets every 90 days
6. **Monitor** Vercel logs for errors
7. **Backup** database regularly
8. **Test** recovery procedures

---

## 💡 Performance Tips

- Use Vercel's Edge Caching
- Implement pagination for large datasets
- Add database indexes for common queries
- Monitor function execution time
- Use analytics to identify bottlenecks

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **GitHub Issues**: Check project repository
- **Stack Overflow**: Tag with `vercel` and `prisma`

---

## ✅ Next Steps After Deployment

1. **Configure Custom Domain**
   - Vercel Dashboard → Settings → Domains
   - Add your domain (department360.youruni.edu)

2. **Set Up HTTPS**
   - Automatic with Vercel (included)
   - Already configured in vercel.json

3. **Monitor Performance**
   - Enable Vercel Analytics
   - Set up error tracking
   - Configure alerts

4. **Scale Database**
   - As users grow, upgrade Postgres plan
   - Consider read replicas for large deployments
   - Implement connection pooling

5. **Enable Advanced Features**
   - API rate limiting (already configured)
   - CORS restrictions
   - Request validation
   - Response compression

---

**Deployment Guide v1.0** | Last Updated: June 1, 2026 | Department360 Academic Dashboard
