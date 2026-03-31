# Email Authentication (Magic Link) Setup Guide

This guide will help you configure passwordless email authentication ("Magic Links") for your Learning Adventures Platform.

## Overview

Magic Link authentication allows users to sign in by clicking a link sent to their email, eliminating the need to remember passwords. This provides a secure and user-friendly authentication method.

## How It Works

1. User enters their email address
2. System sends a unique login link to their email
3. User clicks the link in their email
4. User is automatically signed in

---

## Email Service Options

Choose one of the following email services for sending magic links:

### Option 1: Gmail SMTP (Development & Small Scale)

**Pros**: Free, easy setup
**Cons**: Limited to 500 emails/day, requires app password

### Option 2: Ethereal Email (Testing Only)

**Pros**: Free, no setup, perfect for development
**Cons**: Emails are fake (not delivered to real inboxes)

### Option 3: SendGrid (Production Recommended)

**Pros**: Free tier (100 emails/day), reliable, scalable
**Cons**: Requires account setup and API key

### Option 4: AWS SES (Production - High Volume)

**Pros**: Very scalable, reliable, cost-effective at scale
**Cons**: More complex setup, requires AWS account

---

## Setup Instructions by Provider

## Option 1: Gmail SMTP

### Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification" if not already enabled

### Step 2: Generate App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select app: **Mail**
3. Select device: **Other (Custom name)**
4. Enter name: "Learning Adventures Platform"
5. Click "GENERATE"
6. Copy the 16-character password (you won't see it again!)

### Step 3: Update Environment Variables

```env
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-gmail-address@gmail.com
EMAIL_SERVER_PASSWORD=your-16-char-app-password
EMAIL_FROM=Learning Adventures <your-gmail-address@gmail.com>
```

⚠️ **Important**: The app password is different from your regular Gmail password!

---

## Option 2: Ethereal Email (Development/Testing Only)

Ethereal is a fake SMTP service perfect for testing magic links during development.

### Step 1: Create Ethereal Account

1. Go to [https://ethereal.email/](https://ethereal.email/)
2. Click "Create Ethereal Account"
3. Note the credentials shown (or create a new account each time)

### Step 2: Update Environment Variables

```env
EMAIL_SERVER_HOST=smtp.ethereal.email
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-ethereal-username@ethereal.email
EMAIL_SERVER_PASSWORD=your-ethereal-password
EMAIL_FROM=Learning Adventures <noreply@learningadventures.org>
```

### Step 3: View Test Emails

1. Go to [https://ethereal.email/messages](https://ethereal.email/messages)
2. Log in with your Ethereal credentials
3. Click on emails to view magic link URLs
4. Copy the link and paste in browser to test

---

## Option 3: SendGrid (Production Recommended)

### Step 1: Create SendGrid Account

1. Go to [https://signup.sendgrid.com/](https://signup.sendgrid.com/)
2. Sign up for a free account (100 emails/day)
3. Verify your email address

### Step 2: Create API Key

1. Go to **Settings** → **API Keys**
2. Click "Create API Key"
3. Name: "Learning Adventures Platform"
4. Permissions: "Full Access" (or "Mail Send" only)
5. Click "Create & View"
6. Copy the API key (you won't see it again!)

### Step 3: Verify Sender Identity

1. Go to **Settings** → **Sender Authentication**
2. Choose one of:
   - **Single Sender Verification** (easier, good for testing)
   - **Domain Authentication** (better for production)

#### Single Sender Verification:

1. Click "Verify a Single Sender"
2. Fill in your details:
   - From Name: Learning Adventures
   - From Email: noreply@yourdomain.com
   - Reply To: support@yourdomain.com
3. Click "Create"
4. Check your email and verify

### Step 4: Update Environment Variables

```env
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=Learning Adventures <noreply@learningadventures.org>
```

⚠️ **Important**:

- `EMAIL_SERVER_USER` must be exactly `apikey`
- `EMAIL_SERVER_PASSWORD` is your actual API key
- `EMAIL_FROM` must match your verified sender

---

## Option 4: AWS SES

### Step 1: Set Up AWS Account

1. Go to [https://aws.amazon.com/ses/](https://aws.amazon.com/ses/)
2. Sign in or create an AWS account

### Step 2: Verify Email or Domain

1. Go to AWS SES Console
2. Choose **Email Addresses** or **Domains**
3. Click "Verify a New Email Address" or "Verify a New Domain"
4. Follow verification steps

### Step 3: Create SMTP Credentials

1. In SES Console, go to **SMTP Settings**
2. Click "Create My SMTP Credentials"
3. Enter IAM User Name: "learning-adventures-smtp"
4. Click "Create"
5. Download or copy the SMTP credentials

### Step 4: Request Production Access

By default, SES is in "sandbox mode" (can only email verified addresses).

1. Go to **SES Console** → **Account Dashboard**
2. Click "Request Production Access"
3. Fill out the form explaining your use case
4. Wait for approval (usually 24 hours)

### Step 5: Update Environment Variables

```env
EMAIL_SERVER_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-smtp-username
EMAIL_SERVER_PASSWORD=your-smtp-password
EMAIL_FROM=Learning Adventures <noreply@learningadventures.org>
```

Replace `us-east-1` with your AWS region.

---

## Testing Email Authentication

### Step 1: Start Development Server

```bash
cd learning-adventures-app
npm run dev
```

### Step 2: Test Sign In

1. Navigate to `http://localhost:3000`
2. Click "Sign In"
3. Look for "Sign in with Email" option
4. Enter your email address
5. Click "Sign in with Email"

### Step 3: Check Email

- **Gmail**: Check your inbox
- **Ethereal**: Go to https://ethereal.email/messages
- **SendGrid**: Check your inbox
- **AWS SES**: Check your inbox (if in sandbox, must be verified email)

### Step 4: Click Magic Link

1. Open the email
2. Click the "Sign in to Learning Adventures" button/link
3. You should be redirected to the platform and logged in

---

## Customizing Email Templates

NextAuth.js uses default email templates. To customize them, you can override the `sendVerificationRequest` function.

### Create Custom Email Template

Create a file: `lib/email-template.ts`

```typescript
import { SendVerificationRequestParams } from 'next-auth/providers/email';

export async function sendVerificationRequest(
  params: SendVerificationRequestParams
) {
  const { identifier: email, url, provider } = params;

  const { host } = new URL(url);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Learning Adventures</h1>
          </div>
          <div class="content">
            <h2>Sign in to your account</h2>
            <p>Hello!</p>
            <p>Click the button below to sign in to your Learning Adventures account:</p>
            <a href="${url}" class="button">Sign in to Learning Adventures</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${url}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't request this email, you can safely ignore it.</p>
          </div>
          <div class="footer">
            <p>Learning Adventures Platform | Making Education Fun</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `Sign in to Learning Adventures\n\nClick this link to sign in:\n${url}\n\nThis link will expire in 24 hours.\n\nIf you didn't request this email, you can safely ignore it.`;

  const { createTransport } = require('nodemailer');
  const transport = createTransport(provider.server);

  await transport.sendMail({
    to: email,
    from: provider.from,
    subject: `Sign in to Learning Adventures`,
    text,
    html,
  });
}
```

### Update auth.ts

```typescript
import { sendVerificationRequest } from '@/lib/email-template'

// In providers array:
EmailProvider({
  server: { /* ... */ },
  from: process.env.EMAIL_FROM,
  sendVerificationRequest, // Add this line
}),
```

---

## Troubleshooting

### Emails Not Sending

**Gmail**:

- Verify 2FA is enabled
- Ensure you're using an App Password (not your regular password)
- Check "Less secure app access" is NOT needed (App Passwords work around this)

**SendGrid**:

- Verify your sender email is verified in SendGrid
- Check API key has "Mail Send" permissions
- Verify `EMAIL_FROM` matches verified sender

**AWS SES**:

- If in sandbox mode, recipient email must be verified
- Request production access for unrestricted sending
- Check SMTP credentials are correct

### Magic Link Not Working

1. **Check link expiration**: Links expire after 24 hours
2. **Verify NEXTAUTH_URL**: Must match your domain
3. **Check callback configuration**: Ensure NextAuth API route is working
4. **Database issues**: Verify Prisma schema has verification token table

### "Configuration error" in browser

- **Cause**: Missing or incorrect environment variables
- **Fix**: Check all EMAIL\_\* variables are set in `.env.local`
- Restart development server after changing environment variables

---

## Production Checklist

- [ ] Choose production email service (SendGrid or AWS SES recommended)
- [ ] Set up sender domain authentication (SPF, DKIM)
- [ ] Verify sender identity
- [ ] Update Vercel/production environment variables
- [ ] Test magic link flow on production domain
- [ ] Customize email template with brand colors and logo
- [ ] Set up email delivery monitoring
- [ ] Configure email bounce/complaint handling

---

## Security Best Practices

1. **Use HTTPS in production**: Magic links must use secure connections
2. **Set link expiration**: Default is 24 hours (can be customized)
3. **Rate limit sign-in attempts**: Prevent email bombing
4. **Verify email domains**: Consider blocking disposable email services
5. **Monitor email bounces**: Remove invalid emails from database
6. **Use verified sender domains**: Improves deliverability and trust

---

## Additional Resources

- [NextAuth.js Email Provider Documentation](https://next-auth.js.org/providers/email)
- [Nodemailer Documentation](https://nodemailer.com/)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)

---

**Last Updated**: November 2025
**Platform**: Learning Adventures Platform
**Auth Library**: NextAuth.js v4
**Email Library**: Nodemailer
