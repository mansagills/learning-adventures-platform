# Multi-Provider Authentication Setup Guide

This guide will walk you through setting up Google, Apple, and Email/Password authentication for the Learning Adventures Platform.

## Overview

The platform supports three authentication methods:

1. **Google OAuth** - Sign in with Google account
2. **Apple OAuth** - Sign in with Apple ID
3. **Email/Password** - Traditional email and password authentication

## Prerequisites

- Node.js and npm installed
- PostgreSQL database set up (see main README)
- NextAuth.js configured (already included in the project)

---

## 1. Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** > **Credentials**

### Step 2: Configure OAuth Consent Screen

1. Click **OAuth consent screen** in the left sidebar
2. Select **External** user type (or **Internal** if using Google Workspace)
3. Fill in the required fields:
   - **App name**: Learning Adventures Platform
   - **User support email**: Your email address
   - **Developer contact email**: Your email address
4. Add scopes:
   - `userinfo.email`
   - `userinfo.profile`
5. Save and continue

### Step 3: Create OAuth 2.0 Credentials

1. Click **Credentials** in the left sidebar
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application**
4. Configure:
   - **Name**: Learning Adventures Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

### Step 4: Add to Environment Variables

Add to your `.env.local` file:

```env
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

---

## 2. Apple OAuth Setup

### Step 1: Enroll in Apple Developer Program

1. Enroll at [Apple Developer](https://developer.apple.com/programs/) (requires $99/year)
2. Complete enrollment process

### Step 2: Create App ID

1. Go to [Apple Developer Account](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** > **+** button
4. Select **App IDs** > Continue
5. Select **App** > Continue
6. Configure:
   - **Description**: Learning Adventures Platform
   - **Bundle ID**: `com.learningadventures.app`
   - Enable **Sign in with Apple** capability
7. Click **Continue** > **Register**

### Step 3: Create Services ID

1. Click **Identifiers** > **+** button
2. Select **Services IDs** > Continue
3. Configure:
   - **Description**: Learning Adventures Web
   - **Identifier**: `com.learningadventures.web`
4. Enable **Sign in with Apple**
5. Click **Configure** next to Sign in with Apple:
   - **Primary App ID**: Select the App ID created in Step 2
   - **Web Domain**: `yourdomain.com` (or `localhost` for development)
   - **Return URLs**:
     - `http://localhost:3000/api/auth/callback/apple` (development)
     - `https://yourdomain.com/api/auth/callback/apple` (production)
6. Click **Save** > **Continue** > **Register**

### Step 4: Create Private Key

1. Navigate to **Keys** > **+** button
2. Configure:
   - **Key Name**: Learning Adventures Sign in with Apple Key
   - Enable **Sign in with Apple**
   - Click **Configure** > Select your Primary App ID
3. Click **Continue** > **Register**
4. **Download the key file** (.p8 file) - you can only download this once!
5. Note the **Key ID** shown on the page

### Step 5: Generate Client Secret

Apple requires a JWT token as the client secret. You'll need to generate this using the private key.

**Option A: Use a JWT Generator Tool**

- Visit [jwt.io](https://jwt.io/)
- Use the RS256 algorithm
- Include claims: `iss` (Team ID), `iat` (current timestamp), `exp` (expiration), `aud` (https://appleid.apple.com), `sub` (Services ID)

**Option B: Use Node.js Script**

Create a file `generate-apple-secret.js`:

```javascript
const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKey = fs.readFileSync('./AuthKey_XXXXXXXXXX.p8', 'utf8');

const token = jwt.sign({}, privateKey, {
  algorithm: 'ES256',
  expiresIn: '180d', // 6 months
  audience: 'https://appleid.apple.com',
  issuer: 'YOUR_TEAM_ID', // 10 character Team ID
  subject: 'com.learningadventures.web', // Services ID
  keyid: 'YOUR_KEY_ID', // 10 character Key ID
});

console.log(token);
```

Run: `node generate-apple-secret.js`

### Step 6: Add to Environment Variables

Add to your `.env.local` file:

```env
APPLE_CLIENT_ID=com.learningadventures.web
APPLE_CLIENT_SECRET=your-generated-jwt-token-here
```

**Note**: The Apple client secret (JWT) expires every 6 months, so you'll need to regenerate it periodically.

---

## 3. Email/Password Authentication

Email/Password authentication is already configured and works out of the box! No additional setup required.

The system uses bcrypt for secure password hashing and NextAuth's Credentials provider for authentication.

### Features:

- Secure password hashing with bcrypt
- Password validation (minimum 6 characters)
- Automatic user creation on signup
- Role-based registration (Student, Parent, Teacher)
- Grade level selection for students

---

## 4. NextAuth Configuration

### Required Environment Variables

Add these to your `.env.local` file:

```env
# NextAuth Base Configuration
NEXTAUTH_URL=http://localhost:3000  # Change to your domain in production
NEXTAUTH_SECRET=your-nextauth-secret-here

# Generate a secret with: openssl rand -base64 32
```

### Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or in Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 5. Database Setup

The platform uses PostgreSQL with Prisma ORM. Make sure your database is running and configured:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/learning_adventures
```

Run migrations:

```bash
npx prisma generate
npx prisma db push
```

---

## 6. Testing Authentication

### Development Testing

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`

3. Click **Sign In** or **Sign Up** in the header

4. Test each authentication method:
   - **Google**: Click "Continue with Google"
   - **Apple**: Click "Continue with Apple"
   - **Email/Password**: Fill in the form and submit

### Testing Checklist

- [ ] Google OAuth redirects to Google login
- [ ] Apple OAuth redirects to Apple login
- [ ] Email/Password signup creates new user
- [ ] Email/Password signin works with existing credentials
- [ ] User is redirected back to the app after successful login
- [ ] User session persists across page refreshes
- [ ] User can sign out successfully

---

## 7. Production Deployment

### Environment Variables

Make sure to set all environment variables in your production environment:

```env
# Production URLs
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database
DATABASE_URL=your-production-database-url

# OAuth Providers
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
APPLE_CLIENT_ID=com.learningadventures.web
APPLE_CLIENT_SECRET=your-production-apple-jwt-token

# NextAuth Secret (generate a new one for production!)
NEXTAUTH_SECRET=your-production-nextauth-secret
```

### Update OAuth Redirect URIs

Don't forget to add your production URLs to:

- **Google Cloud Console**: Authorized redirect URIs
- **Apple Developer Console**: Return URLs

---

## 8. Troubleshooting

### Google OAuth Issues

**Problem**: "redirect_uri_mismatch" error

- **Solution**: Make sure the redirect URI in Google Console exactly matches `http://localhost:3000/api/auth/callback/google`

**Problem**: "Access blocked: This app's request is invalid"

- **Solution**: Configure the OAuth consent screen and add test users if in development mode

### Apple OAuth Issues

**Problem**: "invalid_client" error

- **Solution**: Regenerate your JWT client secret and ensure all values (Team ID, Key ID, Services ID) are correct

**Problem**: "invalid_grant" error

- **Solution**: Check that your return URL exactly matches the one configured in Apple Developer Console

### Email/Password Issues

**Problem**: "Invalid email or password" on login

- **Solution**: Ensure the user was created via the signup endpoint, not manually in the database (passwords must be hashed)

**Problem**: Cannot create account

- **Solution**: Check that the PostgreSQL database is running and DATABASE_URL is correct

---

## 9. Security Best Practices

1. **Never commit** `.env.local` to version control
2. **Use different secrets** for development and production
3. **Rotate Apple JWT tokens** every 6 months
4. **Enable HTTPS** in production
5. **Set secure cookie options** in production
6. **Implement rate limiting** for login attempts
7. **Monitor failed login attempts**
8. **Keep NextAuth.js updated** to the latest version

---

## 10. Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Prisma Documentation](https://www.prisma.io/docs)

---

## Support

If you encounter issues:

1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure database is running and accessible
4. Check that OAuth redirect URIs match exactly
5. Review NextAuth debug logs in development mode

For additional help, refer to the main project README or contact the development team.
