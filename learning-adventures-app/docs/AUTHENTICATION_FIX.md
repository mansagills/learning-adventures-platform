# Authentication Fix - Content Studio Access

## Problem
When unauthenticated users clicked "Content Studio" in the header from the marketing preview page, they experienced a redirect loop:

1. User clicks "Content Studio" → navigates to `/internal`
2. `/internal` layout has `ProtectedRoute` requiring ADMIN role
3. `ProtectedRoute` redirects to `/` (fallbackUrl)
4. Root page redirects unauthenticated users back to `/marketing-preview`
5. User never sees login modal - stuck in redirect loop

## Solution
Modified the Header component to show a sign-in modal for unauthenticated users instead of redirecting them:

### Changes Made

#### 1. Header Component ([components/Header.tsx](../components/Header.tsx))
- Added `authCallbackUrl` state to track where to redirect after login
- Updated `handleSignIn()` and `handleSignUp()` to accept optional `callbackUrl` parameter
- Changed "Content Studio" link to conditional rendering:
  - **Authenticated users**: Shows link to `/internal`
  - **Unauthenticated users**: Shows button that opens sign-in modal with `/internal` as callback URL

**Desktop Navigation** (lines 97-115):
```typescript
{session ? (
  <Link href="/internal" className="...">
    Content Studio
  </Link>
) : (
  <button onClick={() => handleSignIn('/internal')} className="...">
    Content Studio
  </button>
)}
```

**Mobile Navigation** (lines 195-217):
```typescript
{session ? (
  <Link href="/internal" onClick={() => setIsMenuOpen(false)} className="...">
    Content Studio
  </Link>
) : (
  <button
    onClick={() => {
      setIsMenuOpen(false);
      handleSignIn('/internal');
    }}
    className="..."
  >
    Content Studio
  </button>
)}
```

#### 2. AuthModal Component ([components/AuthModal.tsx](../components/AuthModal.tsx))
- Added optional `callbackUrl` prop (defaults to '/')
- Updated all sign-in methods to use `callbackUrl`:
  - Google OAuth sign-in
  - Apple OAuth sign-in
  - Credentials sign-in
  - Sign-up flow

**Key Addition** (lines 104-109):
```typescript
if (result?.ok) {
  onClose();
  // Redirect to callback URL after successful sign in
  if (callbackUrl && callbackUrl !== '/') {
    window.location.href = callbackUrl;
  }
}
```

## Testing Instructions

### 1. Start PostgreSQL and Dev Server
```bash
# Ensure PostgreSQL is running
brew services start postgresql@14

# Start development server
cd learning-adventures-app
npm run dev
```

### 2. Test Unauthenticated Access
1. Open browser in incognito mode
2. Navigate to `http://localhost:3001`
3. You should be redirected to `/marketing-preview`
4. Click **"Content Studio"** in the header
5. ✅ Sign-in modal should appear (NOT a redirect loop)

### 3. Test Credentials Login
1. In the sign-in modal, enter test credentials:
   - Email: `admin@test.com`
   - Password: `password123`
2. Click "Sign In"
3. ✅ Modal should close
4. ✅ Page should redirect to `/internal` (Content Studio)
5. ✅ You should see the Content Creation Studio with admin panel

### 4. Test Authenticated Access
1. While still logged in, refresh the page
2. Navigate back to home or marketing preview
3. Click **"Content Studio"** in the header
4. ✅ Should navigate directly to `/internal` without showing modal

### 5. Test Mobile Menu
1. Resize browser to mobile width (< 768px)
2. Open hamburger menu
3. Click **"Content Studio"**
4. ✅ Should show sign-in modal if not authenticated
5. ✅ Should navigate directly if authenticated

## Test Credentials
Created by seed script:
- **Admin**: `admin@test.com` / `password123`
- **Teacher**: `teacher@test.com` / `password123`
- **Parent**: `parent@test.com` / `password123`
- **Student**: `student@test.com` / `password123`

## Technical Details

### Authentication Flow
1. **Unauthenticated user clicks "Content Studio"**
   - `handleSignIn('/internal')` called
   - Sets `authCallbackUrl` to `/internal`
   - Opens `AuthModal`

2. **User enters credentials and signs in**
   - `signIn('credentials', { redirect: false })` called
   - If successful: modal closes
   - If `callbackUrl !== '/'`: redirects to `/internal`

3. **Protected Route Check**
   - User arrives at `/internal`
   - `ProtectedRoute` checks session
   - User has ADMIN role → allowed through
   - Renders Content Creation Studio

### Role Requirements
- `/internal` route requires `ADMIN` role
- Test admin user has ADMIN role
- Other users (TEACHER, PARENT, STUDENT) will see "unauthorized" page

## Files Modified
1. [components/Header.tsx](../components/Header.tsx:17) - Added callback URL state and conditional rendering
2. [components/AuthModal.tsx](../components/AuthModal.tsx:13) - Added callbackUrl prop and redirect logic

## Related Documentation
- [Test Credentials](../TEST_CREDENTIALS.md) - All test user accounts
- [Learning Builder Agent](./LEARNING_BUILDER_AGENT.md) - Main agent documentation
- [Authentication System](../README.md#authentication) - Overall auth architecture

---

**Status**: ✅ Fixed and Tested
**Date**: December 2025
