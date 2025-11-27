# Google OAuth Setup Guide

This guide will help you configure Google OAuth authentication for your Learning Adventures Platform.

## Overview

Google OAuth allows users to sign in using their existing Google account, providing a seamless authentication experience without requiring them to create a new password.

## Prerequisites

- A Google account
- Access to Google Cloud Console
- Your Learning Adventures Platform running locally or deployed

---

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click "NEW PROJECT"
4. Enter a project name (e.g., "Learning Adventures")
5. Click "CREATE"

---

## Step 2: Enable Google+ API

1. In your Google Cloud Project, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on "Google+ API"
4. Click "ENABLE"

---

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type (unless you have a Google Workspace account)
3. Click "CREATE"

### Fill in the required information:

#### App Information
- **App name**: Learning Adventures Platform
- **User support email**: your-email@example.com
- **App logo**: (Optional) Upload your platform logo

#### App Domain
- **Application home page**: https://learningadventures.org (or your domain)
- **Application privacy policy link**: https://learningadventures.org/privacy
- **Application terms of service link**: https://learningadventures.org/terms

#### Authorized domains
Add your domains:
- `learningadventures.org`
- `app.learningadventures.org`
- For local development: `localhost`

#### Developer contact information
- **Email addresses**: your-email@example.com

4. Click "SAVE AND CONTINUE"

### Scopes
1. Click "ADD OR REMOVE SCOPES"
2. Add these scopes:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
3. Click "UPDATE"
4. Click "SAVE AND CONTINUE"

### Test users (for development)
1. Click "ADD USERS"
2. Add email addresses of users who can test during development
3. Click "ADD"
4. Click "SAVE AND CONTINUE"

---

## Step 4: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click "CREATE CREDENTIALS" → "OAuth client ID"
3. Select **Application type**: Web application
4. **Name**: Learning Adventures Web Client

### Authorized JavaScript origins
Add these URLs:
- Development: `http://localhost:3000`
- Production: `https://app.learningadventures.org`

### Authorized redirect URIs
Add these callback URLs:
- Development: `http://localhost:3000/api/auth/callback/google`
- Production: `https://app.learningadventures.org/api/auth/callback/google`

5. Click "CREATE"

### Save Your Credentials
You'll see a modal with:
- **Client ID**: Copy this value
- **Client Secret**: Copy this value

⚠️ **IMPORTANT**: Keep these credentials secure! Never commit them to version control.

---

## Step 5: Update Environment Variables

1. Open your `.env.local` file
2. Update the Google OAuth credentials:

```env
GOOGLE_CLIENT_ID=your-client-id-from-step-4.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-from-step-4
```

3. Make sure `NEXTAUTH_URL` is set correctly:
   - Development: `http://localhost:3000`
   - Production: `https://app.learningadventures.org`

4. Generate a secure `NEXTAUTH_SECRET` if you haven't already:

```bash
openssl rand -base64 32
```

Update `.env.local`:
```env
NEXTAUTH_SECRET=your-generated-secret-here
```

---

## Step 6: Update Production Environment Variables (Vercel)

If deploying to Vercel:

1. Go to your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Add the following variables:
   - `GOOGLE_CLIENT_ID`: (your production client ID)
   - `GOOGLE_CLIENT_SECRET`: (your production client secret)
   - `NEXTAUTH_URL`: `https://app.learningadventures.org`
   - `NEXTAUTH_SECRET`: (your generated secret)

4. Redeploy your application for changes to take effect

---

## Step 7: Test Google OAuth

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`

3. Click "Sign In" or "Get Started"

4. You should see a "Sign in with Google" button

5. Click it and authenticate with your Google account

6. You should be redirected back to your application and logged in

---

## Troubleshooting

### Error: "redirect_uri_mismatch"
- **Cause**: The redirect URI doesn't match what's configured in Google Cloud Console
- **Fix**: Ensure the redirect URI in your Google Cloud Console matches exactly:
  - Development: `http://localhost:3000/api/auth/callback/google`
  - Production: `https://app.learningadventures.org/api/auth/callback/google`

### Error: "access_denied"
- **Cause**: User denied permission or isn't added as a test user
- **Fix**:
  - Add the user as a test user in OAuth consent screen
  - OR publish your OAuth app (moves from Testing to Production)

### OAuth app in testing mode
- In testing mode, only added test users can sign in
- To allow any Google user to sign in:
  1. Go to **OAuth consent screen**
  2. Click "PUBLISH APP"
  3. Submit for verification (required for production)

### "This app isn't verified"
- Google shows this warning for unpublished apps
- Users can click "Advanced" → "Go to [app name] (unsafe)" to proceed
- For production, submit your app for Google verification

---

## Production Checklist

Before going to production:

- [ ] Created separate OAuth credentials for production domain
- [ ] Updated Vercel environment variables with production credentials
- [ ] Added production redirect URIs to Google Cloud Console
- [ ] Published OAuth app (moved from Testing to Production)
- [ ] Submitted app for Google verification (if needed)
- [ ] Tested sign-in flow on production domain
- [ ] Configured custom branding in OAuth consent screen

---

## Security Best Practices

1. **Never commit credentials** to version control
   - Add `.env.local` to `.gitignore`
   - Use environment variables for all sensitive data

2. **Use different credentials** for development and production

3. **Rotate secrets** if compromised

4. **Monitor OAuth usage** in Google Cloud Console

5. **Keep dependencies updated**:
   ```bash
   npm update next-auth
   ```

---

## Additional Resources

- [NextAuth.js Google Provider Documentation](https://next-auth.js.org/providers/google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

---

**Last Updated**: November 2025
**Platform**: Learning Adventures Platform
**Auth Library**: NextAuth.js v4
