# Webflow + Next.js Integration Plan
## Learning Adventures Platform Website Design

**Last Updated**: November 2025
**Status**: Pre-Implementation Planning
**Purpose**: Document strategy for connecting Webflow marketing site to Next.js Learning Adventures platform

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Platform Architecture](#current-platform-architecture)
3. [Integration Options Analysis](#integration-options-analysis)
4. [Recommended Solution: Subdomain Approach](#recommended-solution-subdomain-approach)
5. [Authentication Strategy](#authentication-strategy)
6. [Technical Implementation](#technical-implementation)
7. [DNS Configuration](#dns-configuration)
8. [Development Workflow](#development-workflow)
9. [Cost Analysis](#cost-analysis)
10. [Timeline & Phases](#timeline--phases)
11. [Future Optimization Path](#future-optimization-path)
12. [Risk Mitigation](#risk-mitigation)

---

## Executive Summary

### The Challenge
Build a professional marketing website using Webflow while maintaining the existing Next.js Learning Adventures platform for the actual application and dashboard functionality.

### Recommended Solution
**Subdomain Approach** - Host marketing site at `learningadventures.org` (Webflow) and the application at `app.learningadventures.org` (Vercel/Next.js)

### Key Benefits
- ✅ **Fastest time to market** (1-2 weeks implementation)
- ✅ **Lowest technical complexity** (minimal code changes)
- ✅ **Clear separation of concerns** (marketing vs. application)
- ✅ **Independent deployment** (update marketing without touching app)
- ✅ **Cost-effective** ($23-29/month for Webflow Basic)
- ✅ **SEO-friendly** (proper canonical URLs, clear site structure)

### Requirements
- Webflow account (Basic plan minimum: $23/month)
- Domain registrar access (for DNS configuration)
- Current Next.js platform (already deployed on Vercel)
- Cross-domain authentication configuration

---

## Current Platform Architecture

### Technology Stack
```
Next.js 14 (App Router)
├── Authentication: NextAuth.js v4
├── Database: PostgreSQL 14 (Prisma ORM)
├── Hosting: Vercel
├── Session Strategy: JWT
└── Environment: Node.js 18+
```

### Key Platform Features
- **Authentication System**: NextAuth with 4 user roles (Admin, Teacher, Parent, Student)
- **User Dashboard**: Progress tracking, achievements, recent activity
- **Adventure Catalog**: 85+ games/lessons across 5 subjects
- **Preview System**: Horizontal scrolling cards with authentication gating
- **Progress Tracking**: Linear/circular indicators, stats dashboard
- **Continue Learning**: In-progress adventures section
- **Role-Based Access**: ProtectedRoute HOC, RoleGuard, PermissionProvider

### Current URLs
```
Production (if deployed): https://learning-adventures.vercel.app
Local Development: http://localhost:3000

Key Routes:
├── / (Homepage with preview sections)
├── /catalog (Full adventure catalog)
├── /dashboard (User dashboard - authenticated)
├── /profile (User profile and settings)
├── /games/[gameId] (Dynamic game routes)
└── /api/auth/* (NextAuth endpoints)
```

---

## Integration Options Analysis

### Option 1: Subdomain Approach ⭐ RECOMMENDED

**Architecture:**
```
learningadventures.org           → Webflow (marketing site)
app.learningadventures.org       → Vercel (Next.js platform)
```

**How It Works:**
1. User visits `learningadventures.org` (Webflow marketing site)
2. Clicks "Start Learning" or "Login" button
3. Redirected to `app.learningadventures.org` (Next.js platform)
4. After authentication, user stays on app subdomain

**Pros:**
- ✅ Simplest implementation (1-2 weeks)
- ✅ No Webflow reverse proxy needed
- ✅ Clear URL separation (users understand app vs. marketing)
- ✅ Independent caching strategies
- ✅ Easy to manage and debug
- ✅ Works with any Webflow plan (Basic or higher)

**Cons:**
- ⚠️ Requires cross-domain cookie configuration for auth
- ⚠️ Two separate domains to manage
- ⚠️ URL changes when entering app (minor UX consideration)

**Best For:** MVP launch, small-to-medium teams, budget-conscious projects

---

### Option 2: Subdirectory with Subfold

**Architecture:**
```
learningadventures.org/          → Webflow
learningadventures.org/app/*     → Next.js (via Subfold reverse proxy)
```

**How It Works:**
1. Webflow hosts main domain
2. Subfold service proxies `/app/*` requests to Vercel
3. All content appears under single domain

**Pros:**
- ✅ Single domain (cleaner URLs)
- ✅ Shared authentication cookies (same domain)
- ✅ Seamless user experience

**Cons:**
- ⚠️ Requires Subfold subscription ($19-49/month additional cost)
- ⚠️ More complex debugging (proxy layer)
- ⚠️ Potential latency from proxy
- ⚠️ Limited control over proxy behavior

**Best For:** Projects with budget for additional tooling, teams wanting single-domain experience

---

### Option 3: Cloudflare Workers Reverse Proxy

**Architecture:**
```
learningadventures.org/          → Webflow
learningadventures.org/app/*     → Cloudflare Worker → Vercel
```

**How It Works:**
1. DNS points to Cloudflare
2. Worker script routes `/app/*` to Vercel
3. All other paths serve Webflow content

**Pros:**
- ✅ Single domain
- ✅ Full control over routing logic
- ✅ Cloudflare's edge network (fast)
- ✅ Free tier available

**Cons:**
- ⚠️ Requires Cloudflare Workers knowledge
- ⚠️ Custom code to maintain
- ⚠️ More complex debugging

**Best For:** Teams with DevOps expertise, projects needing custom routing logic

---

### Option 4: Vercel Rewrites (Least Recommended)

**Architecture:**
```
learningadventures.org/          → Vercel rewrites to Webflow
learningadventures.org/app/*     → Next.js
```

**How It Works:**
1. Next.js hosts everything on Vercel
2. Vercel rewrites root to Webflow
3. App routes handled by Next.js

**Pros:**
- ✅ Single deployment platform
- ✅ Single domain

**Cons:**
- ❌ Loses Webflow's visual editor benefits
- ❌ Complex rewrite configuration
- ❌ Potential performance issues
- ❌ Defeats purpose of using Webflow

**Best For:** Not recommended for this use case

---

## Recommended Solution: Subdomain Approach

### Why This Is Best for Learning Adventures

1. **Speed to Market**: Implement in 1-2 weeks vs. 3-4 weeks for other options
2. **Lower Risk**: Clear separation means changes to marketing site won't break app
3. **Cost-Effective**: Only need Webflow Basic ($23/month), no additional proxy tools
4. **Scalability**: Easy to add more subdomains later (e.g., `blog.learningadventures.org`)
5. **Developer-Friendly**: Simpler debugging, clear boundaries
6. **Future-Proof**: Can migrate to subdirectory approach later if needed

### Domain Structure
```
Primary Domain: learningadventures.org
├── learningadventures.org              → Webflow (marketing)
│   ├── / (homepage)
│   ├── /about
│   ├── /pricing
│   ├── /contact
│   └── /blog
│
└── app.learningadventures.org          → Vercel (Next.js platform)
    ├── / (dashboard/homepage)
    ├── /catalog
    ├── /games/[gameId]
    ├── /profile
    └── /api/auth/*
```

### User Journey Example

**First-Time Visitor:**
1. Arrives at `learningadventures.org` (Webflow site)
2. Reads about platform features, pricing, testimonials
3. Clicks "Get Started" button
4. Redirected to `app.learningadventures.org/auth/signup`
5. Creates account on Next.js platform
6. Lands on `app.learningadventures.org/dashboard`

**Returning User:**
1. Visits `learningadventures.org`
2. Clicks "Login" button
3. If already authenticated (cookie exists), redirect to `app.learningadventures.org/dashboard`
4. If not authenticated, redirect to `app.learningadventures.org/auth/login`

---

## Authentication Strategy

### Challenge: Cross-Domain Cookie Sharing

By default, cookies set on `app.learningadventures.org` won't be accessible on `learningadventures.org` and vice versa.

### Solution: Domain-Level Cookies

Configure NextAuth to set cookies at the parent domain level so they're shared across subdomains.

### Implementation

**Step 1: Update NextAuth Configuration**

File: `/learning-adventures-app/app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error('Invalid credentials');
        }

        return user;
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },

  // 🔥 CRITICAL: Cross-domain cookie configuration
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // 🔑 KEY CHANGE: Set domain to parent domain
        domain: process.env.NODE_ENV === 'production'
          ? '.learningadventures.org'  // Leading dot allows all subdomains
          : 'localhost',
      },
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**Step 2: Update Environment Variables**

File: `/learning-adventures-app/.env.local`

```bash
# NextAuth Configuration
NEXTAUTH_URL=https://app.learningadventures.org
NEXTAUTH_SECRET=your-super-secret-key-here

# Database
DATABASE_URL=postgresql://...

# Production domain (for cookie sharing)
COOKIE_DOMAIN=.learningadventures.org
```

**Step 3: Add CORS Headers**

File: `/learning-adventures-app/middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Allow credentials from Webflow marketing site
  const allowedOrigins = [
    'https://learningadventures.org',
    'https://www.learningadventures.org',
  ];

  const origin = request.headers.get('origin');

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

---

## Technical Implementation

### Phase 1: Webflow Marketing Site Setup

**1. Create Webflow Project**
- Sign up for Webflow account (Basic plan minimum)
- Choose blank template or Learning Adventures-themed template
- Design key pages:
  - Homepage (hero, features, testimonials, CTA)
  - About page
  - Pricing page (if applicable)
  - Contact page
  - Blog (optional)

**2. Add Call-to-Action Buttons**

In Webflow, add custom code to buttons:

```html
<!-- Get Started Button -->
<a href="https://app.learningadventures.org/auth/signup" class="cta-button">
  Get Started
</a>

<!-- Login Button -->
<a href="https://app.learningadventures.org/auth/login" class="cta-button-outline">
  Login
</a>
```

**3. Check Authentication Status (Optional)**

If you want the marketing site to show different content for logged-in users:

File: Webflow Custom Code (in page settings or global footer)

```html
<script>
async function checkAuthStatus() {
  try {
    const response = await fetch('https://app.learningadventures.org/api/auth/session', {
      credentials: 'include' // Important for cookie sharing
    });

    const session = await response.json();

    if (session?.user) {
      // User is logged in
      console.log('Logged in as:', session.user.email);

      // Show "Go to Dashboard" instead of "Login"
      document.querySelectorAll('.login-button').forEach(btn => {
        btn.href = 'https://app.learningadventures.org/dashboard';
        btn.textContent = 'Go to Dashboard';
      });
    }
  } catch (error) {
    console.error('Auth check failed:', error);
  }
}

// Run on page load
checkAuthStatus();
</script>
```

**4. Publish Webflow Site**
- Connect custom domain `learningadventures.org`
- Enable SSL (automatic via Webflow)
- Test all links to app subdomain

---

### Phase 2: Next.js Platform Updates

**1. Update NextAuth Configuration** (see Authentication Strategy section above)

**2. Update Environment Variables**

```bash
# Production
NEXTAUTH_URL=https://app.learningadventures.org
COOKIE_DOMAIN=.learningadventures.org

# Staging (optional)
NEXTAUTH_URL=https://staging-app.learningadventures.org
COOKIE_DOMAIN=.learningadventures.org
```

**3. Add Redirect Logic for Unauthenticated Users**

File: `/learning-adventures-app/app/page.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Dashboard from '@/components/Dashboard';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If not authenticated, redirect to marketing site
    if (status === 'unauthenticated') {
      window.location.href = 'https://learningadventures.org';
    }
  }, [status]);

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show dashboard if authenticated
  if (session?.user) {
    return <Dashboard />;
  }

  return null; // Will redirect via useEffect
}
```

**4. Update Navigation Links**

File: `/learning-adventures-app/components/Header.tsx`

```typescript
// Add "Back to Home" link to header
<a
  href="https://learningadventures.org"
  className="text-gray-600 hover:text-gray-900"
>
  About Learning Adventures
</a>
```

**5. Deploy to Vercel**

```bash
cd learning-adventures-app
vercel --prod
```

Set environment variables in Vercel dashboard:
- `NEXTAUTH_URL=https://app.learningadventures.org`
- `COOKIE_DOMAIN=.learningadventures.org`
- `NEXTAUTH_SECRET=<your-secret>`
- `DATABASE_URL=<postgres-url>`

---

## DNS Configuration

### Step-by-Step Setup

**1. Root Domain (learningadventures.org) → Webflow**

In your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.):

```
Type: A Record
Name: @ (or leave blank)
Value: 75.2.70.75 (Webflow's IP - check current IP in Webflow dashboard)
TTL: 3600
```

```
Type: CNAME Record
Name: www
Value: proxy-ssl.webflow.com
TTL: 3600
```

**2. App Subdomain (app.learningadventures.org) → Vercel**

```
Type: CNAME Record
Name: app
Value: cname.vercel-dns.com
TTL: 3600
```

**3. Verify DNS Propagation**

Use online tools or command line:

```bash
# Check root domain
dig learningadventures.org

# Check www subdomain
dig www.learningadventures.org

# Check app subdomain
dig app.learningadventures.org
```

DNS propagation can take 24-48 hours, but usually completes in 1-2 hours.

---

## Development Workflow

### Local Development

**Webflow:**
- Edit in Webflow Designer (webflow.com)
- Preview changes at `preview.webflow.io/site/[project-id]`
- Publish to staging domain (optional): `staging.learningadventures.org`

**Next.js Platform:**
```bash
cd learning-adventures-app
npm run dev
# Runs at http://localhost:3000
```

**Testing Cross-Domain Auth Locally:**

You can't test exact cross-domain behavior locally, but you can simulate:

1. Use ngrok to create temporary HTTPS URLs:
```bash
ngrok http 3000
# Creates: https://abc123.ngrok.io
```

2. Set NEXTAUTH_URL to ngrok URL
3. Set COOKIE_DOMAIN to `.ngrok.io`
4. Test auth flow

**Better Option**: Use Vercel preview deployments:
```bash
vercel
# Creates: https://learning-adventures-abc123.vercel.app
```

### Staging Environment

**Recommended Setup:**
```
staging.learningadventures.org        → Webflow (staging site)
staging-app.learningadventures.org    → Vercel (preview branch)
```

Create a `staging` branch in your Next.js repo and configure Vercel to auto-deploy it to the staging subdomain.

### Production Deployment

**Webflow:**
1. Make changes in Designer
2. Click "Publish" button
3. Changes go live immediately on `learningadventures.org`

**Next.js Platform:**
```bash
git add .
git commit -m "Update: [description]"
git push origin main
```

Vercel auto-deploys `main` branch to `app.learningadventures.org`

---

## Cost Analysis

### Webflow Costs

| Plan | Cost | Features |
|------|------|----------|
| **Basic** | $23/month | Custom domain, 100 pages, 50 CMS items, SSL |
| **CMS** | $29/month | 2,000 CMS items, 3 editors, search functionality |
| **Business** | $42/month | 10,000 CMS items, advanced SEO, code export |

**Recommendation**: Start with **Basic plan** ($23/month)

### Vercel Costs

| Plan | Cost | Features |
|------|------|----------|
| **Hobby** | Free | Unlimited projects, 100GB bandwidth, HTTPS |
| **Pro** | $20/month | Team collaboration, analytics, 1TB bandwidth |

**Current Status**: Learning Adventures likely on Hobby plan (free)

**Recommendation**: Stay on **Hobby plan** until traffic exceeds 100GB/month

### Domain Costs

- Domain registration: ~$12-15/year (via Namecheap, GoDaddy, etc.)

### Total Monthly Cost

```
Webflow Basic:        $23/month
Vercel Hobby:         $0/month
Domain:               ~$1.25/month
─────────────────────────────────
TOTAL:                ~$24.25/month
```

**Alternative with Subfold Proxy**: Add $19-49/month for subdirectory approach

---

## Timeline & Phases

### Phase 1: Planning & Design (1 week)

**Tasks:**
- [ ] Purchase/transfer domain to registrar with DNS control
- [ ] Create Webflow account and project
- [ ] Design marketing site pages in Webflow
- [ ] Define user journeys (visitor → signup → login → dashboard)
- [ ] Review/approve designs with stakeholders

**Deliverables:**
- Webflow design mockups for all pages
- Domain registered and accessible
- User journey map

---

### Phase 2: Implementation (1-2 weeks)

**Week 1: Webflow Development**
- [ ] Build homepage in Webflow
- [ ] Build About, Pricing, Contact pages
- [ ] Add CTA buttons linking to app subdomain
- [ ] Configure custom domain in Webflow
- [ ] Add analytics (Google Analytics, Plausible, etc.)

**Week 2: Next.js Integration**
- [ ] Update NextAuth configuration for cross-domain cookies
- [ ] Add CORS headers middleware
- [ ] Update environment variables
- [ ] Test authentication flow locally
- [ ] Deploy to Vercel with custom domain
- [ ] Configure DNS records (root + app subdomain)

**Deliverables:**
- Fully functional marketing site at `learningadventures.org`
- App accessible at `app.learningadventures.org`
- Authentication working across both domains

---

### Phase 3: Testing & QA (3-5 days)

**Authentication Testing:**
- [ ] Verify cookies set correctly (`.learningadventures.org`)
- [ ] Test signup flow (marketing → app)
- [ ] Test login flow (marketing → app)
- [ ] Test logout (app → marketing)
- [ ] Test "already logged in" redirect (marketing → dashboard)

**Cross-Browser Testing:**
- [ ] Chrome (desktop + mobile)
- [ ] Firefox (desktop + mobile)
- [ ] Safari (desktop + mobile)
- [ ] Edge

**Performance Testing:**
- [ ] Lighthouse scores (aim for 90+ on all metrics)
- [ ] Page load times (aim for <2 seconds)
- [ ] Mobile responsiveness

**User Acceptance Testing:**
- [ ] Test with 5-10 beta users
- [ ] Collect feedback on signup flow
- [ ] Identify any confusing navigation

**Deliverables:**
- QA test report
- List of bugs/issues (if any)
- Performance benchmarks

---

### Phase 4: Launch (1-2 days)

**Pre-Launch Checklist:**
- [ ] All QA issues resolved
- [ ] Analytics tracking verified
- [ ] SSL certificates active on both domains
- [ ] DNS fully propagated (24-48 hours)
- [ ] Backup plan documented (rollback procedure)
- [ ] Team trained on Webflow editor

**Launch Day:**
- [ ] Publish Webflow site to production
- [ ] Deploy Next.js platform to production (Vercel)
- [ ] Monitor error logs (Vercel, Sentry, etc.)
- [ ] Monitor analytics for traffic spikes
- [ ] Test critical user paths (signup, login)

**Post-Launch (First Week):**
- [ ] Daily monitoring of error rates
- [ ] Daily monitoring of auth success rates
- [ ] Collect user feedback
- [ ] Hotfix any critical issues

**Deliverables:**
- Live production site
- Launch report
- Week 1 analytics summary

---

### Total Timeline: 3-4 Weeks

```
Week 1:    Planning & Design
Week 2:    Webflow Development
Week 3:    Next.js Integration
Week 4:    Testing, QA, Launch
```

---

## Future Optimization Path

### When to Consider Migration to Single Domain

If you later decide the subdomain approach isn't ideal, here's how to migrate:

**Option A: Add Subfold Reverse Proxy**

1. Sign up for Subfold ($19/month)
2. Configure Subfold to proxy `learningadventures.org/app/*` → `app.learningadventures.org`
3. Update all internal links from `app.learningadventures.org` → `learningadventures.org/app`
4. Maintain old subdomain as redirect for backward compatibility

**Timeline**: 1 week
**Cost**: +$19/month
**Benefit**: Single domain experience

---

**Option B: Cloudflare Workers Proxy**

1. Move DNS to Cloudflare
2. Write Cloudflare Worker to route `/app/*` requests
3. Deploy worker
4. Update links

**Timeline**: 2-3 weeks (requires custom code)
**Cost**: Free tier available
**Benefit**: Full control, no third-party dependency

---

**Option C: Migrate Marketing to Next.js**

1. Recreate Webflow pages as Next.js pages
2. Host everything on Vercel under single domain
3. Lose Webflow visual editor (but gain full code control)

**Timeline**: 4-6 weeks
**Cost**: Save $23/month (no Webflow)
**Benefit**: Single codebase, unified deployment

---

### Recommended Migration Path

**Year 1**: Stay with subdomain approach
- Focus on content creation and user acquisition
- Let marketing team iterate on Webflow site independently
- Monitor if subdomain causes user confusion (analytics)

**Year 2+**: Evaluate migration if:
- User feedback indicates subdomain is confusing
- SEO requires single domain for better rankings
- Team has bandwidth for more complex infrastructure

---

## Risk Mitigation

### Risk 1: Cookie Sharing Doesn't Work

**Symptom**: Users logged in on `app.learningadventures.org` appear logged out on `learningadventures.org`

**Mitigation:**
- Test thoroughly in staging before launch
- Ensure `domain: '.learningadventures.org'` is correctly set
- Verify `sameSite: 'lax'` (not 'strict')
- Check browser dev tools → Application → Cookies to see domain attribute

**Fallback**: Redirect users to app for all auth checks (acceptable for MVP)

---

### Risk 2: DNS Propagation Delays

**Symptom**: Domain doesn't resolve after DNS changes

**Mitigation:**
- Change DNS 24-48 hours before launch
- Use low TTL (300-600 seconds) initially
- Monitor with `dig` or online DNS checkers
- Test from multiple networks/devices

**Fallback**: Use temporary URLs (Webflow preview, Vercel preview) during propagation

---

### Risk 3: Webflow Rate Limits or Downtime

**Symptom**: Marketing site goes down, app still works

**Mitigation:**
- Monitor Webflow status page
- Cache Webflow pages via Cloudflare (optional)
- Have backup static HTML version hosted on Vercel

**Fallback**: Redirect root domain to `app.learningadventures.org/about` temporarily

---

### Risk 4: User Confusion About URL Change

**Symptom**: Users don't understand why URL changes from `.com` to `app.` subdomain

**Mitigation:**
- Add visual indicator on marketing site: "You'll be redirected to our secure app"
- Use loading screen during transition
- Consistent branding across both domains

**Fallback**: Add FAQ explaining the difference

---

### Risk 5: SEO Impact of Subdomain

**Symptom**: Concerned that app content won't be indexed under main domain

**Mitigation:**
- The app is meant for authenticated users anyway (shouldn't be indexed)
- Marketing content (what you want indexed) is on root domain
- Use `robots.txt` on app subdomain to prevent indexing:
  ```
  User-agent: *
  Disallow: /
  ```

**Fallback**: If you need app content indexed, migrate to subdirectory later

---

## Appendix: Code Snippets

### A. Full NextAuth Config with Cookie Sharing

```typescript
// /learning-adventures-app/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error('Invalid credentials');
        }

        return user;
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production'
          ? '.learningadventures.org'
          : 'localhost',
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

---

### B. CORS Middleware

```typescript
// /learning-adventures-app/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const allowedOrigins = [
    'https://learningadventures.org',
    'https://www.learningadventures.org',
  ];

  const origin = request.headers.get('origin');

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

---

### C. Webflow Custom Code for Auth Check

```html
<!-- Add to Webflow Page Settings → Custom Code → Footer Code -->
<script>
(async function() {
  try {
    const response = await fetch('https://app.learningadventures.org/api/auth/session', {
      credentials: 'include'
    });

    const session = await response.json();

    if (session?.user) {
      // User is logged in
      console.log('User authenticated:', session.user.email);

      // Update login button to "Go to Dashboard"
      const loginButtons = document.querySelectorAll('.js-login-btn');
      loginButtons.forEach(btn => {
        btn.href = 'https://app.learningadventures.org/dashboard';
        btn.textContent = 'Go to Dashboard';
      });

      // Hide signup CTA, show personalized message
      const ctaSection = document.querySelector('.js-cta-section');
      if (ctaSection) {
        ctaSection.innerHTML = `
          <div class="welcome-back">
            <h2>Welcome back, ${session.user.name || 'Learner'}!</h2>
            <a href="https://app.learningadventures.org/dashboard" class="btn-primary">
              Continue Learning →
            </a>
          </div>
        `;
      }
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    // Fail silently - user sees default logged-out state
  }
})();
</script>
```

---

### D. Environment Variables Reference

```bash
# /learning-adventures-app/.env.local (Production)

# NextAuth
NEXTAUTH_URL=https://app.learningadventures.org
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars
COOKIE_DOMAIN=.learningadventures.org

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Email (for future password reset, etc.)
EMAIL_SERVER=smtp://username:password@smtp.sendgrid.net:587
EMAIL_FROM=noreply@learningadventures.org

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

### E. Vercel Configuration

```json
// /learning-adventures-app/vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXTAUTH_URL": "https://app.learningadventures.org",
    "COOKIE_DOMAIN": ".learningadventures.org"
  }
}
```

---

## Quick Start Checklist

Use this checklist to implement the subdomain approach:

### Pre-Launch Setup
- [ ] Purchase domain `learningadventures.org`
- [ ] Create Webflow account (Basic plan)
- [ ] Verify Vercel account is active
- [ ] Backup current Next.js platform code
- [ ] Create staging branch in Git

### Webflow Setup
- [ ] Create new Webflow project
- [ ] Design homepage
- [ ] Design About page
- [ ] Design Pricing page (optional)
- [ ] Add CTA buttons → `app.learningadventures.org`
- [ ] Add auth check script (optional)
- [ ] Test in Webflow preview
- [ ] Connect custom domain in Webflow settings

### Next.js Updates
- [ ] Update NextAuth config (cookie domain)
- [ ] Add CORS middleware
- [ ] Update environment variables
- [ ] Test locally with ngrok
- [ ] Deploy to Vercel staging
- [ ] Test staging auth flow
- [ ] Deploy to Vercel production

### DNS Configuration
- [ ] Add A record: `@` → Webflow IP
- [ ] Add CNAME: `www` → `proxy-ssl.webflow.com`
- [ ] Add CNAME: `app` → `cname.vercel-dns.com`
- [ ] Wait 24-48 hours for propagation
- [ ] Verify with `dig` command

### Testing
- [ ] Test signup flow (marketing → app)
- [ ] Test login flow (marketing → app)
- [ ] Test cookie sharing across domains
- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on mobile devices
- [ ] Run Lighthouse audits
- [ ] Get beta user feedback

### Launch
- [ ] Publish Webflow site
- [ ] Deploy Next.js to production
- [ ] Monitor error logs
- [ ] Monitor analytics
- [ ] Announce launch

---

## Support & Resources

### Webflow Documentation
- [Custom Domain Setup](https://university.webflow.com/lesson/custom-domain)
- [SSL Certificates](https://university.webflow.com/lesson/ssl-certificates)
- [Custom Code](https://university.webflow.com/lesson/custom-code-in-the-head-and-body-tags)

### Next.js Documentation
- [Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

### NextAuth.js Documentation
- [Cookie Configuration](https://next-auth.js.org/configuration/options#cookies)
- [Callbacks](https://next-auth.js.org/configuration/callbacks)
- [JWT Session](https://next-auth.js.org/configuration/options#jwt)

### Vercel Documentation
- [Custom Domains](https://vercel.com/docs/concepts/projects/domains)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Deployment](https://vercel.com/docs/concepts/deployments/overview)

### DNS Tools
- [DNS Checker](https://dnschecker.org/) - Check propagation globally
- [MX Toolbox](https://mxtoolbox.com/SuperTool.aspx) - DNS diagnostics
- [What's My DNS](https://www.whatsmydns.net/) - Visual propagation map

---

## Conclusion

The **subdomain approach** (learningadventures.org + app.learningadventures.org) provides the fastest, most cost-effective path to launching a professional marketing website while maintaining your powerful Next.js Learning Adventures platform.

**Key Takeaways:**
1. **Low Risk**: Clear separation between marketing and application
2. **Fast Implementation**: 3-4 weeks from start to launch
3. **Cost-Effective**: ~$24/month total
4. **Scalable**: Easy to add more subdomains or migrate later
5. **Developer-Friendly**: Simple debugging, independent deployments

**Next Steps:**
1. Purchase/transfer your domain
2. Create Webflow account and start designing
3. Update Next.js auth configuration
4. Configure DNS records
5. Test thoroughly in staging
6. Launch!

**Questions or Issues?**
Refer to the Support & Resources section or consult:
- Webflow Support (live chat available)
- Vercel Support (via dashboard)
- Next.js Discord community
- NextAuth.js GitHub discussions

---

**Document Version**: 1.0
**Last Updated**: November 2025
**Author**: Learning Adventures Platform Team
**Status**: Ready for Implementation
