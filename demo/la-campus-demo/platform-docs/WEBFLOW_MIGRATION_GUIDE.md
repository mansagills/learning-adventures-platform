# Webflow Migration Guide
**Switching from Next.js Marketing Preview to Webflow Landing Page**

Last Updated: November 2024

---

## Overview

This guide explains how to transition from the current setup (Next.js marketing preview) to using Webflow as your primary landing page at `learningadventures.org`.

### Current Architecture
- **learningadventures.org**: Next.js app (shows marketing preview for unauthenticated users)
- **Authenticated users**: Redirected to `/dashboard`

### Target Architecture
- **learningadventures.org**: Webflow (marketing site)
- **app.learningadventures.org**: Next.js app (authenticated platform only)
- **Login flow**: Webflow → Next.js authentication → Dashboard

---

## Prerequisites

Before starting this migration, ensure you have:

- [ ] Webflow site designed and ready to publish
- [ ] Webflow account with appropriate plan (Basic plan minimum: $23/month)
- [ ] Access to your domain registrar (where learningadventures.org is registered)
- [ ] Access to Vercel dashboard
- [ ] Access to your GitHub repository

---

## Migration Steps

### Phase 1: Prepare Webflow Site

#### 1.1 Configure Webflow Domain
1. Log into your Webflow account
2. Open your project
3. Go to **Project Settings** → **Hosting**
4. Click **Add Custom Domain**
5. Enter: `learningadventures.org`
6. Click **Add Domain**

#### 1.2 Add www Redirect (Optional)
1. In the same Webflow Hosting settings
2. Click **Add Custom Domain** again
3. Enter: `www.learningadventures.org`
4. Set it to redirect to `learningadventures.org`

#### 1.3 Update Login/Signup Buttons in Webflow
1. Edit your Webflow design
2. Find all "Login" and "Sign Up" buttons
3. Update button links to point to:
   - **Login**: `https://app.learningadventures.org`
   - **Sign Up**: `https://app.learningadventures.org`
4. Publish your Webflow site

---

### Phase 2: Configure DNS Records

You'll need to update DNS records at your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare).

#### 2.1 Remove Old DNS Records
1. Log into your domain registrar
2. Navigate to DNS settings for `learningadventures.org`
3. **Delete or disable** these existing records:
   - A record: `@` pointing to Vercel (`76.76.21.21`)
   - CNAME record: `www` pointing to Vercel

#### 2.2 Add Webflow DNS Records
Webflow will provide you with specific DNS records. Typically:

**For Root Domain (learningadventures.org):**
```
Type: A
Name: @
Value: [Webflow's IP - they'll provide this]
TTL: 3600
```

**For www Subdomain:**
```
Type: CNAME
Name: www
Value: proxy-ssl.webflow.com
TTL: 3600
```

**For App Subdomain (app.learningadventures.org):**
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: 3600
```

> **Note**: Webflow will show you the exact IP address and records in their dashboard after you add the custom domain.

#### 2.3 Verify DNS Changes
DNS propagation can take 24-48 hours, but usually completes within 1 hour.

Check DNS status:
```bash
# Check root domain
dig learningadventures.org

# Check app subdomain
dig app.learningadventures.org

# Check www subdomain
dig www.learningadventures.org
```

---

### Phase 3: Update Vercel Configuration

#### 3.1 Update Vercel Domains
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Click **Settings** → **Domains**
4. **Remove**: `learningadventures.org` (if present)
5. **Add**: `app.learningadventures.org`
6. Follow Vercel's verification instructions
7. Wait for SSL certificate to be issued (~5 minutes)

#### 3.2 Update Vercel Environment Variables
1. In Vercel dashboard → **Settings** → **Environment Variables**
2. Update or add these variables for **Production**:

```bash
NEXTAUTH_URL=https://app.learningadventures.org
NEXT_PUBLIC_MARKETING_URL=https://learningadventures.org
COOKIE_DOMAIN=.learningadventures.org
```

3. Click **Save**
4. Redeploy your app to apply changes

---

### Phase 4: Update Next.js Code

#### 4.1 Enable Homepage Redirect
1. Open file: `learning-adventures-app/app/page.tsx`
2. Find line 33 (the commented redirect)
3. **Uncomment** this line:
   ```typescript
   window.location.href = MARKETING_SITE_URL;
   ```
4. **Comment out** or remove the marketing preview redirect (line 36):
   ```typescript
   // router.push('/marketing-preview');
   ```

**Before:**
```typescript
} else {
  // Unauthenticated users see marketing content
  // TODO: Once Webflow is live at learningadventures.org, uncomment the line below
  // window.location.href = MARKETING_SITE_URL;

  // For now, show marketing preview on this domain
  router.push('/marketing-preview');
}
```

**After:**
```typescript
} else {
  // Unauthenticated users go to Webflow marketing site
  window.location.href = MARKETING_SITE_URL;
}
```

#### 4.2 Update NextAuth Configuration
1. Open file: `learning-adventures-app/app/api/auth/[...nextauth]/route.ts`
2. Verify the `callbacks` section includes:

```typescript
callbacks: {
  async redirect({ url, baseUrl }) {
    // After authentication, redirect to dashboard
    if (url.startsWith(baseUrl)) return url;
    return `${baseUrl}/dashboard`;
  },
}
```

This ensures users return to the app after OAuth authentication.

---

### Phase 5: Deploy and Test

#### 5.1 Commit and Deploy Changes
```bash
cd /Users/mansagills/Documents/GitHub/learning-adventures-platform

# Add changed files
git add learning-adventures-app/app/page.tsx

# Commit with descriptive message
git commit -m "Enable Webflow redirect - migrate to production marketing site

- Uncomment homepage redirect to learningadventures.org
- Remove temporary marketing preview redirect
- Users now directed to Webflow landing page when unauthenticated"

# Push to GitHub (triggers Vercel deployment)
git push origin main
```

#### 5.2 Verify Deployment
1. Wait for Vercel deployment to complete (~2-3 minutes)
2. Check deployment status: https://vercel.com/dashboard

#### 5.3 Test the Flow

**Test Unauthenticated User Flow:**
1. Open incognito/private browsing window
2. Visit: `https://learningadventures.org`
3. ✅ Should see: Webflow landing page
4. Click "Login" button on Webflow site
5. ✅ Should redirect to: `https://app.learningadventures.org`
6. ✅ Should see: Next.js login page

**Test Authenticated User Flow:**
1. Login with test credentials
2. ✅ Should redirect to: `https://app.learningadventures.org/dashboard`
3. Visit: `https://learningadventures.org` (while logged in)
4. ✅ Should redirect to: `https://app.learningadventures.org/dashboard`

**Test www Redirect:**
1. Visit: `https://www.learningadventures.org`
2. ✅ Should redirect to: `https://learningadventures.org`

---

## Troubleshooting

### Issue: Redirect Loop After Migration

**Symptoms**: Page keeps redirecting infinitely

**Causes**:
1. DNS not updated correctly
2. NEXTAUTH_URL still points to old domain
3. Both sites serving at same domain

**Solution**:
1. Verify DNS records with `dig learningadventures.org`
2. Check Vercel environment variables
3. Clear browser cache and cookies
4. Wait for DNS propagation (up to 24 hours)

### Issue: Authentication Not Working

**Symptoms**: Can't login, session lost immediately

**Causes**:
1. COOKIE_DOMAIN not set correctly
2. NEXTAUTH_URL mismatch
3. OAuth redirect URLs not updated

**Solution**:
1. Verify `COOKIE_DOMAIN=.learningadventures.org` (note the leading dot)
2. Verify `NEXTAUTH_URL=https://app.learningadventures.org`
3. Update OAuth provider settings (Google, etc.) to allow `app.learningadventures.org`

### Issue: Webflow Site Not Loading

**Symptoms**: DNS errors, site not found

**Causes**:
1. DNS records not configured correctly
2. DNS propagation not complete
3. Webflow domain verification pending

**Solution**:
1. Check Webflow dashboard for domain verification status
2. Verify DNS records match Webflow's requirements exactly
3. Wait 1-24 hours for DNS propagation
4. Use https://dnschecker.org to check global propagation

### Issue: SSL Certificate Errors

**Symptoms**: "Not Secure" warning in browser

**Causes**:
1. SSL certificate not issued yet
2. DNS propagation incomplete

**Solution**:
1. Wait for Vercel/Webflow to issue certificates (~5-30 minutes)
2. Verify domain ownership in respective dashboards
3. Check DNS propagation is complete

---

## Rollback Procedure

If you need to revert to the previous setup:

### Step 1: Restore DNS Records
1. Update DNS to point back to Vercel:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

### Step 2: Update Vercel Domains
1. Add `learningadventures.org` back to Vercel project
2. Update environment variables to use `learningadventures.org`

### Step 3: Revert Code Changes
```bash
cd /Users/mansagills/Documents/GitHub/learning-adventures-platform

# Checkout previous version of homepage
git checkout HEAD~1 learning-adventures-app/app/page.tsx

# Commit rollback
git commit -m "Rollback: Restore marketing preview redirect"

# Deploy
git push origin main
```

---

## Post-Migration Checklist

After successful migration, verify:

- [ ] Webflow site loads at `learningadventures.org`
- [ ] www redirect works (`www.learningadventures.org` → `learningadventures.org`)
- [ ] App loads at `app.learningadventures.org`
- [ ] Login flow works from Webflow → Next.js
- [ ] Authenticated users can access dashboard
- [ ] SSL certificates are valid for all domains
- [ ] Analytics tracking works (if configured)
- [ ] All login/signup buttons on Webflow point to correct URLs
- [ ] OAuth providers (Google, etc.) allow new domain
- [ ] Email links use correct domain (`app.learningadventures.org`)

---

## Additional Resources

- [Webflow Custom Domain Documentation](https://university.webflow.com/lesson/custom-domains)
- [Vercel Custom Domains Guide](https://vercel.com/docs/concepts/projects/custom-domains)
- [NextAuth.js Documentation](https://next-auth.js.org/configuration/options)
- [DNS Propagation Checker](https://dnschecker.org)

---

## Support Contacts

- **Webflow Support**: https://webflow.com/support
- **Vercel Support**: https://vercel.com/support
- **Domain Registrar**: [Your registrar's support page]

---

## Notes

- DNS changes can take up to 48 hours to propagate globally
- SSL certificates are issued automatically by both Webflow and Vercel
- Always test in incognito mode to avoid cached redirects
- Keep this guide updated as your architecture evolves
- Document any customizations specific to your setup

---

**Last Migration Date**: _Not yet migrated_
**Migration Completed By**: _Pending_
**Issues Encountered**: _None yet_
