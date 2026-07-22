# Deployment Guide - Learning Adventures Platform

## Overview
This guide covers deploying the Learning Adventures Platform to production, including database setup, environment configuration, and post-deployment verification.

---

## Prerequisites

### Required Accounts
- [ ] **Vercel Account** (recommended for Next.js deployment)
- [ ] **PostgreSQL Database** (Vercel Postgres, Neon, Supabase, or Railway)
- [ ] **GitHub Repository** (for CI/CD)
- [ ] **Domain Name** (optional, Vercel provides free subdomain)

### Local Requirements
- Node.js 18+ installed
- Git installed
- Database client (for verification)

---

## Part 1: Database Setup

### Option A: Vercel Postgres (Recommended)

1. **Create Vercel Postgres Database**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login to Vercel
   vercel login

   # Create database from Vercel dashboard
   # Dashboard → Storage → Create → Postgres
   ```

2. **Get Connection String**
   - Copy `POSTGRES_PRISMA_URL` from Vercel dashboard
   - This will be your `DATABASE_URL`

### Option B: Neon (Serverless Postgres)

1. Visit https://neon.tech
2. Create new project
3. Copy connection string
4. Format: `postgresql://[user]:[password]@[host]/[dbname]?sslmode=require`

### Option C: Supabase

1. Visit https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy connection string (Transaction mode)

### Option D: Railway

1. Visit https://railway.app
2. Create new PostgreSQL database
3. Copy `DATABASE_URL` from Variables tab

---

## Part 2: Environment Variables

###  Required Environment Variables

Create `.env.production` or add to Vercel Environment Variables:

```bash
# Database
DATABASE_URL="postgresql://[user]:[password]@[host]/[dbname]?sslmode=require"

# NextAuth.js
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-generated-secret-here"

# Generate secret with:
# openssl rand -base64 32
```

### Optional Environment Variables

```bash
# Email Provider (if implementing email features)
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@example.com"
EMAIL_SERVER_PASSWORD="your-password"
EMAIL_FROM="noreply@your-domain.com"

# Analytics (if implementing)
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# Error Tracking (Sentry, etc.)
SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
```

---

## Part 3: Pre-Deployment Checklist

### Code Preparation

1. **Update Package.json**
   ```json
   {
     "scripts": {
       "build": "next build",
       "start": "next start",
       "postinstall": "prisma generate"
     },
     "engines": {
       "node": ">=18.0.0"
     }
   }
   ```

2. **Verify Build Locally**
   ```bash
   cd learning-adventures-app
   npm run build
   npm start
   # Test at http://localhost:3000
   ```

3. **Check for Errors**
   ```bash
   # TypeScript errors
   npm run type-check

   # ESLint errors
   npm run lint

   # Fix any issues before deploying
   ```

### Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Push schema to production database
# Make sure DATABASE_URL points to production
npx prisma db push

# Optional: Seed initial data
npm run db:seed
```

---

## Part 4: Vercel Deployment

### Method 1: Vercel Dashboard (Easiest)

1. **Connect Repository**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select `learning-adventures-app` as root directory

2. **Configure Project**
   - Framework Preset: Next.js
   - Root Directory: `learning-adventures-app`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

3. **Add Environment Variables**
   - Go to Settings → Environment Variables
   - Add all variables from Part 2
   - Make sure to add for Production, Preview, and Development

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-5 minutes)

### Method 2: Vercel CLI

```bash
# Navigate to project
cd learning-adventures-platform/learning-adventures-app

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No (first time)
# - Project name? learning-adventures
# - Directory? ./
# - Override settings? No
```

### Method 3: GitHub Actions (CI/CD)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd learning-adventures-app
          npm ci

      - name: Run tests
        run: |
          cd learning-adventures-app
          npm run lint
          npm run type-check

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID}}
          working-directory: ./learning-adventures-app
```

---

## Part 5: Post-Deployment Setup

### 1. Database Initialization

```bash
# SSH into production or use database client

# Run migrations
npx prisma db push

# Seed initial data (optional)
npm run db:seed

# Verify tables created
npx prisma studio
```

### 2. Create Admin Account

**Option A: Via Seed Script**
```bash
# Check prisma/seed.ts includes admin user
npm run db:seed
# Default: admin@test.com / password123
```

**Option B: Manually via Database**
```sql
-- Use database client or Prisma Studio
INSERT INTO "User" (id, email, password, name, role)
VALUES (
  gen_random_uuid(),
  'admin@yoursite.com',
  -- Hash password with bcrypt first
  '$2a$10$...',
  'Admin User',
  'ADMIN'
);
```

**Option C: Via Signup Flow**
1. Visit /signup
2. Create account
3. Manually update role in database to 'ADMIN'

### 3. Verify Deployment

Visit your deployed site and check:

- [ ] Homepage loads
- [ ] /courses page displays courses
- [ ] /login and /signup work
- [ ] Database connection works
- [ ] Images load correctly
- [ ] No console errors
- [ ] SSL/HTTPS working

### 4. Test Key Flows

- [ ] **Sign Up**: Create new account
- [ ] **Log In**: Login with test account
- [ ] **Course Enrollment**: Enroll in free course
- [ ] **Lesson Progress**: Complete a lesson
- [ ] **XP Tracking**: Verify XP awarded
- [ ] **Premium Paywall**: Test premium course restriction
- [ ] **Certificate Generation**: Complete course, get certificate
- [ ] **Dashboard**: Verify widgets load

---

## Part 6: Performance Optimization

### Enable Caching

Add to `next.config.js`:

```javascript
module.exports = {
  // ... existing config

  async headers() {
    return [
      {
        source: '/images/:all*(svg|jpg|png)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

### Image Optimization

Ensure using Next.js Image component:

```typescript
import Image from 'next/image';

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={500}
  height={300}
  loading="lazy"
/>
```

### Database Connection Pooling

Update `lib/prisma.ts`:

```typescript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Add connection pooling
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
```

---

## Part 7: Monitoring & Maintenance

### Setup Error Tracking

**Sentry Integration** (Recommended):

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

Update `sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### Analytics

**Vercel Analytics** (Built-in):

```bash
npm install @vercel/analytics
```

Update `app/layout.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Database Backups

**Automated Backups**:
- **Vercel Postgres**: Automatic daily backups
- **Neon**: Point-in-time recovery (PITR)
- **Supabase**: Automatic backups on paid plans
- **Railway**: Manual backups via dashboard

**Manual Backup**:

```bash
# Export database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore database
psql $DATABASE_URL < backup_20250116.sql
```

### Health Checks

Create `app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
```

---

## Part 8: Custom Domain Setup

### 1. Add Domain to Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., `learningadventures.com`)
3. Follow DNS configuration instructions

### 2. Configure DNS

Add these records to your DNS provider:

**For root domain (learningadventures.com)**:
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3. Update Environment Variables

```bash
NEXTAUTH_URL="https://your-custom-domain.com"
```

### 4. Force HTTPS

Vercel automatically enforces HTTPS. Verify:
- Visit http://your-domain.com → should redirect to https://

---

## Part 9: Troubleshooting

### Build Failures

**Error: TypeScript errors**
```bash
# Fix locally first
npm run type-check
# Fix all errors before deploying
```

**Error: Module not found**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: Prisma Client not generated**
```bash
# Add to package.json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Runtime Errors

**Error: Database connection failed**
- Check DATABASE_URL is correct
- Verify database is accessible from Vercel (allow Vercel IPs)
- Check SSL mode is enabled

**Error: NEXTAUTH_SECRET not set**
- Add NEXTAUTH_SECRET to environment variables
- Generate with: `openssl rand -base64 32`

**Error: 404 on routes**
- Check app router file structure
- Verify dynamic routes use correct bracket syntax
- Check middleware isn't blocking routes

### Performance Issues

**Slow database queries**
```bash
# Add indexes
# Edit prisma/schema.prisma
model Course {
  // ...
  @@index([subject, isPremium, isPublished])
}

# Apply changes
npx prisma db push
```

**Large bundle size**
```bash
# Analyze bundle
npm install @next/bundle-analyzer
# Update next.config.js to enable analyzer
# Run build and review
```

---

## Part 10: Security Checklist

### Pre-Launch Security

- [ ] **Environment Variables**: All secrets in environment variables (not in code)
- [ ] **HTTPS Only**: Force HTTPS redirect enabled
- [ ] **CORS**: Configure allowed origins
- [ ] **Rate Limiting**: Implement on API routes (consider Vercel Edge Config)
- [ ] **Input Validation**: All user inputs validated
- [ ] **SQL Injection**: Using Prisma (parameterized queries)
- [ ] **XSS Protection**: React auto-escapes (no dangerouslySetInnerHTML)
- [ ] **CSRF**: NextAuth.js handles CSRF tokens
- [ ] **Password Hashing**: Using bcrypt (check auth implementation)
- [ ] **Session Security**: Secure cookies, httpOnly enabled
- [ ] **File Uploads**: Validate file types and sizes (if implemented)
- [ ] **Error Messages**: Don't expose sensitive info in production errors

### Security Headers

Add to `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

---

## Part 11: Rollback Plan

### If Deployment Fails

**Vercel**:
1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." → "Promote to Production"

**Manual Rollback**:
```bash
# Git revert
git revert HEAD
git push origin main

# Or reset to previous commit
git reset --hard <previous-commit-hash>
git push --force origin main
```

### Database Rollback

```bash
# Restore from backup
psql $DATABASE_URL < backup_file.sql

# Or use Prisma migrations (if using migrate instead of db push)
npx prisma migrate resolve --rolled-back "migration_name"
```

---

## Quick Reference

### Deployment Commands

```bash
# Local build test
npm run build && npm start

# Vercel deployment
vercel --prod

# Database update
npx prisma db push

# View logs
vercel logs
```

### Important URLs

- Vercel Dashboard: https://vercel.com/dashboard
- Prisma Studio: `npx prisma studio`
- Health Check: `https://your-domain.com/api/health`
- Admin Login: `https://your-domain.com/login`

### Support Resources

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
- NextAuth Docs: https://next-auth.js.org

---

**Last Updated**: 2025-11-16
**Version**: 1.0
**Status**: Production Ready
