# Deployment Configuration Guide

## Overview

This guide covers the manual configuration steps required to deploy the Learning Adventures Platform with subdomain-based routing. All code changes have been completed - these are external configuration tasks.

**Architecture**:

- Marketing Site: `learningadventures.org` (separate codebase)
- App Platform: `app.learningadventures.org` (this Next.js app)

**Status**: ✅ All code changes complete | ⏳ Manual configuration pending

---

## Prerequisites

Before starting, ensure you have:

- [ ] Access to Google Cloud Console (for OAuth)
- [ ] Access to Apple Developer Portal (for OAuth)
- [ ] Access to Vercel dashboard
- [ ] Domain ownership verified for `learningadventures.org`

---

## Step 1: Configure Google OAuth

### Location

[Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)

### Steps

1. **Navigate to your OAuth 2.0 Client**
   - Find your existing OAuth client ID (or create new one)
   - Click "Edit" or "Configure"

2. **Update Authorized JavaScript Origins**

   Add these origins:

   ```
   https://app.learningadventures.org
   http://localhost:3000
   ```

   ⚠️ Keep `localhost:3000` for local development

3. **Update Authorized Redirect URIs**

   Add these redirect URIs:

   ```
   https://app.learningadventures.org/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google
   ```

   ⚠️ Keep `localhost:3000` for local development

4. **Save Changes**

### Verification

Test OAuth by:

- Visiting `https://app.learningadventures.org`
- Clicking "Sign In" → "Continue with Google"
- Confirming successful redirect to dashboard

---

## Step 2: Configure Apple OAuth

### Location

[Apple Developer Portal → Certificates, Identifiers & Profiles → Sign in with Apple](https://developer.apple.com/account/resources/identifiers/list/serviceId)

### Steps

1. **Navigate to your Service ID**
   - Find your existing Sign in with Apple service
   - Click to edit

2. **Configure Return URLs**

   Add these return URLs:

   ```
   https://app.learningadventures.org/api/auth/callback/apple
   http://localhost:3000/api/auth/callback/apple
   ```

   ⚠️ Keep `localhost:3000` for local development

3. **Save Changes**

### Verification

Test OAuth by:

- Visiting `https://app.learningadventures.org`
- Clicking "Sign In" → "Continue with Apple"
- Confirming successful redirect to dashboard

---

## Step 3: Configure Vercel Domain

### Location

[Vercel Dashboard → Your Project → Settings → Domains](https://vercel.com/dashboard)

### Steps

1. **Add Custom Domain**
   - Go to Project Settings → Domains
   - Click "Add Domain"
   - Enter: `app.learningadventures.org`
   - Click "Add"

2. **Configure DNS**

   Vercel will provide DNS records. Add to your DNS provider:

   **Option A: CNAME Record (Recommended)**

   ```
   Type: CNAME
   Name: app
   Value: cname.vercel-dns.com
   ```

   **Option B: A Record**

   ```
   Type: A
   Name: app
   Value: [IP provided by Vercel]
   ```

3. **Wait for SSL Provisioning**
   - Vercel automatically provisions SSL certificates
   - Usually takes 1-5 minutes
   - Status will show "Valid" when ready

### Verification

- [ ] Domain shows "Valid" status in Vercel
- [ ] `https://app.learningadventures.org` loads without SSL errors
- [ ] Automatic HTTPS redirect works (http → https)

---

## Step 4: Configure Vercel Environment Variables

### Location

[Vercel Dashboard → Your Project → Settings → Environment Variables](https://vercel.com/dashboard)

### Production Environment Variables

Add these variables for **Production** environment:

| Variable Name               | Value                                | Notes                        |
| --------------------------- | ------------------------------------ | ---------------------------- |
| `NEXT_PUBLIC_APP_URL`       | `https://app.learningadventures.org` | App subdomain URL            |
| `NEXT_PUBLIC_MARKETING_URL` | `https://learningadventures.org`     | Marketing site URL           |
| `NEXTAUTH_URL`              | `https://app.learningadventures.org` | NextAuth base URL            |
| `NEXTAUTH_SECRET`           | `[generate new secret]`              | See below for generation     |
| `DATABASE_URL`              | `[your production DB URL]`           | PostgreSQL connection string |
| `GOOGLE_CLIENT_ID`          | `[from Google Console]`              | OAuth client ID              |
| `GOOGLE_CLIENT_SECRET`      | `[from Google Console]`              | OAuth client secret          |
| `APPLE_CLIENT_ID`           | `[from Apple Portal]`                | OAuth client ID              |
| `APPLE_CLIENT_SECRET`       | `[from Apple Portal]`                | OAuth client secret          |
| `ANTHROPIC_API_KEY`         | `[your API key]`                     | Content generation           |
| `GEMINI_API_KEY`            | `[your API key]`                     | Content generation           |

### Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and use it as `NEXTAUTH_SECRET`

### Preview/Development Environments (Optional)

For preview deployments, you can use the same values OR separate staging credentials:

```
NEXT_PUBLIC_APP_URL=https://[preview-url].vercel.app
NEXT_PUBLIC_MARKETING_URL=https://learningadventures.org
NEXTAUTH_URL=https://[preview-url].vercel.app
```

### Steps

1. **Go to Environment Variables**
   - Project Settings → Environment Variables

2. **Add Each Variable**
   - Click "Add New"
   - Enter Variable Name
   - Enter Value
   - Select Environment: **Production**
   - Click "Save"

3. **Redeploy Application**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Select "Redeploy"
   - Confirm to trigger new build with updated environment variables

---

## Step 5: Testing Checklist

### Local Development Tests

Run these tests in your local environment first:

- [ ] **Login Flow**
  - Navigate to `http://localhost:3000`
  - Click "Sign In"
  - Test credentials login
  - Verify redirect to `http://localhost:3000/dashboard`

- [ ] **Google OAuth**
  - Click "Continue with Google"
  - Complete OAuth flow
  - Verify redirect to dashboard

- [ ] **Apple OAuth** (if configured)
  - Click "Continue with Apple"
  - Complete OAuth flow
  - Verify redirect to dashboard

- [ ] **Protected Routes**
  - Log out
  - Try accessing `http://localhost:3000/dashboard` directly
  - Verify redirect to `http://localhost:3001` (marketing site)

### Production Tests

After deployment, run these tests:

- [ ] **HTTPS & SSL**
  - Visit `http://app.learningadventures.org`
  - Verify automatic redirect to HTTPS
  - Check for SSL certificate validity (🔒 in browser)

- [ ] **Login Flow**
  - Visit `https://app.learningadventures.org`
  - Click "Sign In"
  - Test credentials login
  - Verify redirect to `https://app.learningadventures.org/dashboard`

- [ ] **Google OAuth**
  - Click "Continue with Google"
  - Complete OAuth flow
  - Verify redirect to dashboard
  - Check for no console errors

- [ ] **Apple OAuth**
  - Click "Continue with Apple"
  - Complete OAuth flow
  - Verify redirect to dashboard
  - Check for no console errors

- [ ] **Protected Routes**
  - Log out
  - Try accessing `https://app.learningadventures.org/dashboard` directly
  - Verify redirect to `https://learningadventures.org` (marketing site)
  - Confirm no redirect loops

- [ ] **Session Persistence**
  - Log in
  - Navigate to different pages (`/courses`, `/practice`, `/profile`)
  - Verify session persists (no re-login required)
  - Check profile menu displays user info

- [ ] **Logout**
  - Click logout in user menu
  - Verify redirect to marketing site
  - Confirm session cleared (can't access protected routes)

- [ ] **Admin Upload** (for team members)
  - Log in with admin credentials
  - Navigate to `/internal/content-upload`
  - Verify access granted (no 403 errors)
  - Test file upload functionality

---

## Step 6: Marketing Site Integration

### Update Marketing Site Links

If your marketing site has login/signup buttons, update them to link to:

```html
<!-- Sign In Button -->
<a href="https://app.learningadventures.org">Sign In</a>

<!-- Sign Up Button -->
<a href="https://app.learningadventures.org">Get Started</a>
```

The app will automatically show the auth modal when users arrive.

### Optional: Pre-populate Auth Mode

To open signup modal directly:

```html
<a href="https://app.learningadventures.org?mode=signup">Get Started</a>
```

To open signin modal directly:

```html
<a href="https://app.learningadventures.org?mode=signin">Sign In</a>
```

_Note: This requires adding query param handling in `app/page.tsx` - not currently implemented_

---

## Troubleshooting

### Issue: OAuth Redirect URI Mismatch

**Error**: "redirect_uri_mismatch" in OAuth flow

**Solution**:

1. Check OAuth console has exact URL: `https://app.learningadventures.org/api/auth/callback/google`
2. Verify `NEXTAUTH_URL` in Vercel matches: `https://app.learningadventures.org`
3. Ensure no trailing slashes in URLs
4. Wait 5-10 minutes after updating OAuth console (changes may take time to propagate)

### Issue: Redirect Loop

**Error**: Browser shows "too many redirects" error

**Solution**:

1. Check `NEXT_PUBLIC_MARKETING_URL` is set correctly in Vercel
2. Verify marketing site doesn't redirect back to app
3. Clear browser cookies and try again
4. Check browser console for error messages

### Issue: Session Not Persisting

**Error**: User gets logged out between page navigations

**Solution**:

1. Verify `NEXTAUTH_SECRET` is set in production environment
2. Check `NEXTAUTH_URL` matches your app domain exactly
3. Ensure cookies are not being blocked by browser
4. Check database connection (sessions may not be saving)

### Issue: Marketing Site Redirect Not Working

**Error**: Unauthenticated users stay on app subdomain

**Solution**:

1. Check `NEXT_PUBLIC_MARKETING_URL` is set in Vercel environment variables
2. Verify you redeployed after adding environment variables
3. Check browser console for JavaScript errors
4. Test in incognito mode (may be cached)

### Issue: Admin Upload Page 403 Error

**Error**: Admin users get "Unauthorized" when accessing `/internal/content-upload`

**Solution**:

1. Verify user role in database is set to `ADMIN`
2. Check session token includes role (inspect in browser DevTools → Application → Cookies)
3. Re-login to refresh session token
4. Check API route authentication logic in `app/api/internal/content-upload/route.ts`

---

## Rollback Plan

If issues arise in production:

1. **Revert Environment Variables** (Quick Fix)
   - Change `NEXT_PUBLIC_APP_URL` back to previous value
   - Change `NEXT_PUBLIC_MARKETING_URL` to app URL
   - Redeploy

2. **Remove Custom Domain** (Temporary)
   - Go to Vercel → Domains
   - Remove `app.learningadventures.org`
   - Use Vercel preview URL temporarily

3. **Restore OAuth URLs** (If needed)
   - Update Google/Apple OAuth consoles back to old URLs
   - Wait for changes to propagate

4. **Investigate & Fix**
   - Review error logs in Vercel dashboard
   - Test in staging/preview environment
   - Fix issues before re-deploying

---

## Support & Resources

### Official Documentation

- [NextAuth.js Deployment](https://next-auth.js.org/deployment)
- [Vercel Custom Domains](https://vercel.com/docs/concepts/projects/custom-domains)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In Setup](https://developer.apple.com/sign-in-with-apple/)

### Internal Documentation

- [Local Development Setup](./LOCAL_SETUP.md)
- [Environment Variables Reference](./.env.local.example)
- [Authentication Flow](../lib/auth.ts)
- [URL Helpers](../lib/utils/urls.ts)

### Team Communication

**After completing deployment**:

- [ ] Notify team of new app URL: `app.learningadventures.org`
- [ ] Share admin credentials for content upload access
- [ ] Update any internal documentation with new URLs
- [ ] Test all team member accounts can access admin panel

---

## Completion Checklist

Use this checklist to track deployment progress:

### Pre-Deployment

- [ ] Google OAuth console configured
- [ ] Apple OAuth console configured
- [ ] DNS records ready to update
- [ ] Production database connection string available
- [ ] All API keys collected

### Vercel Configuration

- [ ] Custom domain `app.learningadventures.org` added
- [ ] DNS records configured
- [ ] SSL certificate provisioned (status: Valid)
- [ ] Production environment variables added
- [ ] Application redeployed with new variables

### Testing

- [ ] HTTPS redirect working
- [ ] Login flow redirects to dashboard
- [ ] Google OAuth working in production
- [ ] Apple OAuth working in production
- [ ] Protected routes redirect to marketing site
- [ ] Session persists across app pages
- [ ] Logout clears session properly
- [ ] Admin upload page accessible for team

### Marketing Site

- [ ] Login/signup links updated to `app.learningadventures.org`
- [ ] Marketing site not causing redirect loops

### Team Communication

- [ ] Team notified of new app URL
- [ ] Admin credentials distributed
- [ ] Documentation updated
- [ ] Team tested content upload access

---

**Last Updated**: December 2025
**Deployment Status**: Code Complete - Configuration Pending
**Next Action**: Configure Google OAuth (Step 1)
