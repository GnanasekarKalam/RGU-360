# Department360 Academic Dashboard - Vercel Deployment

> **Enterprise Academic Management System for Departments**

## 📦 Deployment Package Contents

```
✅ vercel.json                    - Vercel configuration
✅ vercel.config.js               - Build & function settings  
✅ VERCEL-QUICK-START.md          - 5-minute deployment guide
✅ VERCEL-DEPLOYMENT.md           - Comprehensive deployment docs
✅ PRISMA-SCHEMA-FIXES.md         - Schema validation & fixes
✅ scripts/deploy.sh              - Automated deployment script
✅ scripts/fix-schema.js          - Automatic schema fixer
✅ .env.example                   - Environment template
```

## 🚀 Quick Deploy (3 Steps)

### 1️⃣ Create Database
```bash
# Option A: Vercel Postgres
vercel project add department360

# Option B: Supabase
# Visit supabase.com → New Project → Copy PostgreSQL URL
```

### 2️⃣ Deploy to Vercel
```bash
# Ensure .env is configured with DATABASE_URL
git push origin main
# Or: vercel --prod
```

### 3️⃣ Initialize Database
```bash
vercel env pull
npx prisma migrate deploy
npx prisma db seed
```

✅ **Done!** Visit: `https://your-project.vercel.app`

---

## 📋 Pre-Deployment Checklist

### Database
- [ ] PostgreSQL database created
- [ ] Connection string obtained: `postgresql://...`
- [ ] Remote access enabled

### Environment Variables
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `JWT_SECRET` - Generated (32+ characters)
- [ ] `JWT_REFRESH_SECRET` - Generated (32+ characters)
- [ ] `NEXTAUTH_SECRET` - Generated (32+ characters)
- [ ] `NEXTAUTH_URL` - Production URL (e.g., https://yourdomain.vercel.app)
- [ ] `NODE_ENV` - Set to "production"

### Code Quality
- [ ] ✅ TypeScript compiles without errors
- [ ] ✅ All dependencies installed
- [ ] ✅ Prisma schema validated
- [ ] ✅ No uncommitted changes in Git

### Testing
- [ ] ✅ `npm run dev` runs locally
- [ ] ✅ Health endpoint responds: `/api/health`
- [ ] ✅ Database migrations work: `npx prisma migrate dev`
- [ ] ✅ Demo login credentials tested

---

## 🔧 Schema Fixes (Must Do First)

⚠️ **Important**: Prisma schema has relation errors that need fixing.

### Quick Fix (Automated):
```bash
node scripts/fix-schema.js
npx prisma generate
```

### Or Manual Fix:
See `PRISMA-SCHEMA-FIXES.md` for detailed instructions.

**Time Required**: ~15 minutes

---

## 📚 Full Documentation

| Document | Purpose |
|----------|---------|
| `VERCEL-QUICK-START.md` | 5-step deployment guide |
| `VERCEL-DEPLOYMENT.md` | Complete reference documentation |
| `PRISMA-SCHEMA-FIXES.md` | Schema validation and fixes |
| `README-AUTHENTICATION.md` | Authentication system docs |
| `AUTHENTICATION-SYSTEM.md` | Auth architecture |

---

## 🎯 Deployment Path

```
1. Fix Prisma Schema
   └─ node scripts/fix-schema.js
   └─ npm run build (verify no errors)

2. Push to GitHub
   └─ git add .
   └─ git commit -m "Prepare for Vercel deployment"
   └─ git push origin main

3. Connect to Vercel
   └─ vercel.com/dashboard → Import Project
   └─ Select GitHub repository
   └─ Set environment variables

4. Deploy
   └─ Automatic (on git push) OR
   └─ Manual (vercel --prod)

5. Post-Deployment
   └─ npx prisma migrate deploy
   └─ npx prisma db seed
   └─ Test API endpoints
   └─ Verify dashboards load
```

---

## 🧪 Testing After Deployment

```bash
# Health check
curl https://your-project.vercel.app/api/health

# Login test  
curl -X POST https://your-project.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "gnanasekar.maths@rathinam.in",
    "password": "Admin@123"
  }'

# Get dashboards
curl https://your-project.vercel.app/api/dashboard/hod \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 👤 Demo Credentials

Use these to test after deployment:

```
Super Admin:  gnanasekar.maths@rathinam.in / Admin@123
Admin:        nss@rathinam.in / Admin@123
HOD:          hod.maths@rathinam.in / Hod@123
Faculty:      faculty1@rathinam.in / Faculty@123
Student:      student1@rathinam.in / Student@123
IQAC:         iqac@rathinam.in / Iqac@123
Management:   management1@rathinam.in / Manage@123
```

---

## 🔗 Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check |
| `/api/auth/login` | POST | User login |
| `/api/auth/logout` | POST | User logout |
| `/api/dashboard/hod` | GET | HOD dashboard |
| `/api/dashboard/faculty` | GET | Faculty dashboard |
| `/api/dashboard/student` | GET | Student dashboard |
| `/api/faculty` | GET/POST | Faculty management |
| `/api/students` | GET/POST | Student management |
| `/api/reports` | GET/POST | Report generation |

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
vercel build --force
vercel deploy --prod --force
```

### Database Not Found
1. Verify DATABASE_URL in Vercel environment
2. Check database accepts remote connections
3. Add Vercel IPs to firewall whitelist

### Migrations Fail
```bash
vercel env pull
npx prisma migrate deploy
# If still fails: npx prisma migrate reset
```

### 502 Errors
1. Check function logs in Vercel dashboard
2. Verify environment variables set
3. Test database connectivity locally
4. Check Prisma schema is valid

---

## 📊 Monitoring

### View Logs
```bash
# Via CLI
vercel logs <project-name>

# Via Dashboard
# → Deployments → Select → Functions → Logs
```

### Performance Metrics
- Vercel Dashboard → Analytics
- Monitor response times
- Check error rates
- Review function execution

---

## 🔐 Security Checklist

- [ ] Never commit .env files
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Set NEXTAUTH_URL to production domain
- [ ] Restrict CORS origins
- [ ] Enable rate limiting
- [ ] Rotate secrets every 90 days
- [ ] Use environment variable encryption

---

## 📞 Getting Help

### Documentation
- **Vercel**: https://vercel.com/docs
- **Prisma**: https://www.prisma.io/docs
- **Node.js**: https://nodejs.org/docs

### Debugging
```bash
# Local test before deployment
npm run dev

# TypeScript check
npm run type-check

# Build locally
npm run build

# Database check
npx prisma studio

# Logs
vercel logs project-name
```

---

## ✅ Next Steps

1. **Read**: VERCEL-QUICK-START.md (5 minutes)
2. **Fix**: Prisma schema (15 minutes)
3. **Deploy**: Follow deployment path above
4. **Test**: Use demo credentials to verify
5. **Configure**: Add custom domain, set up analytics
6. **Monitor**: Track performance and errors

---

## 📈 Scaling Considerations

- **Users < 1000**: Current setup sufficient
- **Users 1000-10000**: Upgrade database plan
- **Users > 10000**: Consider read replicas, caching layer
- **High Traffic**: Implement CDN, optimize queries

---

## 🎓 Project Information

| Property | Value |
|----------|-------|
| **Name** | Department360 Academic Dashboard |
| **Version** | 1.0.0 |
| **Node Version** | 18.x |
| **Database** | PostgreSQL 14+ |
| **Framework** | Express.js + TypeScript |
| **ORM** | Prisma |
| **Deployment** | Vercel Serverless Functions |
| **Status** | Ready for Production |

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | June 1, 2026 | Initial Vercel deployment package |

---

**Ready to Deploy?** Start with `VERCEL-QUICK-START.md` → [Read Now](./VERCEL-QUICK-START.md)

🚀 **Let's Deploy!**
