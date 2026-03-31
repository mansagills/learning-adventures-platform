# Phase 8: Premium Access Control - Testing Guide

## Overview
Phase 8 implements premium access control with paywall modals, premium badges, and upgrade CTAs. This guide covers comprehensive testing to ensure proper enforcement of the 2-course limit for free users and premium access requirements.

## Components Tested

1. **PremiumBadge** - Visual indicator for premium courses
2. **PremiumPaywallModal** - Modal shown when premium/limit restrictions apply
3. **EnrollButton** - Updated to show paywall modal
4. **CourseCard** - Displays premium badge
5. **Course Catalog** - Shows upgrade CTA banner
6. **Enrollment API** - Backend enforcement of limits

---

## Test Prerequisites

### Setup
```bash
# Ensure development server is running
cd learning-adventures-app
npm run dev

# Database should be seeded with test courses
npm run db:seed
```

### Test Accounts
- **Free Student**: `student@test.com` / `password123`
- **Admin (acts as premium)**: `admin@test.com` / `password123`

### Seeded Courses
1. **Multiplication Mastery** - Free, Beginner
2. **Fractions Foundations** - Premium, Intermediate (requires Multiplication Mastery)
3. **Science Lab Basics** - Free, Beginner

---

## 1. Premium Badge Component Tests

### Test 1.1: Premium Badge Display on Course Cards
**URL**: http://localhost:3000/courses

**Steps**:
1. Navigate to course catalog
2. Look for "Fractions Foundations" course (premium)
3. Verify premium badge is displayed

**Expected Results**:
- ✅ Premium badge shows gradient yellow-to-orange background
- ✅ Badge displays crown/star icon
- ✅ Badge text reads "Premium"
- ✅ Badge is positioned in top-right of course card

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 1.2: Premium Badge on Course Detail Page
**URL**: http://localhost:3000/courses/fractions-foundations

**Steps**:
1. Navigate to premium course detail page
2. Verify premium badge appears in metadata section

**Expected Results**:
- ✅ Premium badge displays with medium size
- ✅ Badge appears alongside difficulty and grade level badges
- ✅ Badge styling matches brand colors

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

## 2. Free Course Limit Enforcement Tests

### Test 2.1: First Free Course Enrollment
**URL**: http://localhost:3000/courses/multiplication-mastery

**Setup**: Login as `student@test.com`, ensure not yet enrolled in any courses

**Steps**:
1. Click "Enroll in Course"
2. Verify successful enrollment

**Expected Results**:
- ✅ Enrollment succeeds
- ✅ No paywall modal appears
- ✅ Button changes to "Continue Learning"
- ✅ Course appears in "Recent Courses" on dashboard

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 2.2: Second Free Course Enrollment
**URL**: http://localhost:3000/courses/science-lab-basics

**Setup**: Already enrolled in 1 free course

**Steps**:
1. Navigate to second free course
2. Click "Enroll in Course"
3. Verify successful enrollment

**Expected Results**:
- ✅ Enrollment succeeds (2nd course of 2 allowed)
- ✅ No paywall modal appears
- ✅ Course appears in enrollments

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 2.3: Third Free Course Enrollment (Limit Reached)
**URL**: http://localhost:3000/courses

**Setup**:
1. Create a 3rd free course using Prisma Studio (or use API)
2. Already enrolled in 2 free courses

**Steps**:
1. Attempt to enroll in 3rd free course
2. Observe paywall modal

**Expected Results**:
- ✅ Enrollment fails
- ✅ Paywall modal appears with reason "free_limit_reached"
- ✅ Modal displays: "You're currently enrolled in 2 free courses"
- ✅ Modal shows: "Free users can enroll in up to 2 free courses"
- ✅ "Upgrade to Premium" button links to /pricing
- ✅ "Maybe Later" button closes modal

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

## 3. Premium Course Access Tests

### Test 3.1: Premium Course Enrollment (Free User)
**URL**: http://localhost:3000/courses/fractions-foundations

**Setup**: Login as `student@test.com` (free user)

**Steps**:
1. Navigate to "Fractions Foundations" (premium course)
2. Complete prerequisite "Multiplication Mastery" if needed
3. Click "Enroll in Course"

**Expected Results**:
- ✅ Enrollment fails
- ✅ Paywall modal appears with reason "premium_required"
- ✅ Modal displays course title: "Fractions Foundations is a premium course"
- ✅ Modal shows premium benefits list
- ✅ "Upgrade to Premium" button links to /pricing
- ✅ "Maybe Later" button closes modal

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 3.2: Premium Course Enrollment (Admin/Premium User)
**URL**: http://localhost:3000/courses/fractions-foundations

**Setup**: Login as `admin@test.com` (has premium access)

**Steps**:
1. Complete prerequisite if needed
2. Click "Enroll in Course"

**Expected Results**:
- ✅ Enrollment succeeds
- ✅ No paywall modal appears
- ✅ Admin users bypass premium requirement

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

## 4. Paywall Modal Component Tests

### Test 4.1: Paywall Modal UI - Premium Required
**Setup**: Trigger premium paywall modal

**Visual Checks**:
- ✅ Modal has backdrop with opacity
- ✅ Close button (X) in top-right works
- ✅ Clicking backdrop closes modal
- ✅ Crown/star icon displays in gradient circle
- ✅ "Premium Course" heading is bold and visible
- ✅ Course title is bolded in description
- ✅ Premium benefits section has gradient background
- ✅ 5 benefits listed with checkmark icons
- ✅ "Upgrade to Premium" button has gradient background
- ✅ "Maybe Later" button has gray background
- ✅ Footer text: "Start learning with free courses or upgrade anytime"

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 4.2: Paywall Modal UI - Free Limit Reached
**Setup**: Trigger free course limit paywall modal

**Visual Checks**:
- ✅ Modal title: "Free Course Limit Reached"
- ✅ Shows: "You're currently enrolled in 2 free courses"
- ✅ Shows: "Free users can enroll in up to 2 free courses"
- ✅ Premium benefits section displays
- ✅ All buttons and close functions work

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 4.3: Paywall Modal Functionality
**Steps**:
1. Trigger paywall modal
2. Test all interactive elements

**Expected Results**:
- ✅ Close button (X) closes modal
- ✅ Backdrop click closes modal
- ✅ "Maybe Later" button closes modal
- ✅ "Upgrade to Premium" navigates to /pricing (without closing browser)
- ✅ ESC key closes modal (if implemented)
- ✅ Modal prevents scrolling of background

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

## 5. Upgrade CTA Tests

### Test 5.1: Upgrade Banner Display
**URL**: http://localhost:3000/courses

**Setup**: Login as `student@test.com` (free user)

**Steps**:
1. Navigate to course catalog
2. Observe banner below header

**Expected Results**:
- ✅ Banner displays with gradient yellow-to-orange background
- ✅ Crown/star icon appears
- ✅ Heading: "Upgrade to Premium"
- ✅ Shows enrollment count: "X of 2 free courses"
- ✅ 4 benefit checkmarks displayed (Unlimited, Premium, Certificates, Support)
- ✅ "View Plans" button is white with orange text
- ✅ Banner is responsive on mobile

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 5.2: Upgrade Banner Hidden for Premium Users
**URL**: http://localhost:3000/courses

**Setup**: Login as `admin@test.com` or premium user

**Steps**:
1. Navigate to course catalog
2. Check for upgrade banner

**Expected Results**:
- ✅ Upgrade banner does NOT appear
- ✅ Course catalog displays normally

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 5.3: Upgrade Banner Hidden for Unauthenticated Users
**URL**: http://localhost:3000/courses

**Setup**: Logout (unauthenticated)

**Steps**:
1. Navigate to course catalog
2. Check for upgrade banner

**Expected Results**:
- ✅ Upgrade banner does NOT appear
- ✅ Courses display without enrollment status

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

## 6. Backend API Tests

### Test 6.1: Enrollment API - Free Limit Check
**API Endpoint**: POST `/api/courses/{courseId}/enroll`

**Setup**:
- Authenticated as free user with 2 enrollments
- Target a 3rd free course

**Test with curl**:
```bash
# Get session cookie from browser dev tools
# Replace {courseId} with actual course ID

curl -X POST http://localhost:3000/api/courses/{courseId}/enroll \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response**:
```json
{
  "success": false,
  "error": {
    "code": "ENROLLMENT_NOT_ALLOWED",
    "message": "Cannot enroll in this course",
    "details": {
      "eligible": false,
      "requiresPremium": false,
      "hasPremiumAccess": false,
      "freeCourseLimit": 2,
      "freeCoursesEnrolled": 2,
      "prerequisitesMet": true
    }
  }
}
```

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 6.2: Enrollment API - Premium Course Check
**API Endpoint**: POST `/api/courses/{premiumCourseId}/enroll`

**Setup**:
- Authenticated as free user
- Target premium course

**Expected Response**:
```json
{
  "success": false,
  "error": {
    "code": "ENROLLMENT_NOT_ALLOWED",
    "message": "Cannot enroll in this course",
    "details": {
      "eligible": false,
      "requiresPremium": true,
      "hasPremiumAccess": false,
      "freeCourseLimit": 2,
      "freeCoursesEnrolled": 1,
      "prerequisitesMet": true
    }
  }
}
```

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

## 7. Edge Cases and Error Handling

### Test 7.1: Prerequisite Courses vs Premium
**Setup**: Premium course with incomplete prerequisites

**Steps**:
1. Attempt to enroll in premium course without completing prerequisites
2. Verify appropriate error

**Expected Results**:
- ✅ Shows prerequisite error, NOT premium paywall
- ✅ Prerequisite check happens before premium check
- ✅ Error lists missing prerequisite courses

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 7.2: Unenroll and Re-enroll
**Steps**:
1. Enroll in 2 free courses
2. Unenroll from 1 course
3. Attempt to enroll in a different free course

**Expected Results**:
- ✅ After unenrolling, can enroll in new course
- ✅ Enrollment count decreases after unenroll
- ✅ 2-course limit still applies

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 7.3: Network Error Handling
**Steps**:
1. Disconnect network (offline mode)
2. Attempt to enroll in course
3. Reconnect and retry

**Expected Results**:
- ✅ Shows generic error message
- ✅ Does not show paywall modal
- ✅ Retry succeeds after reconnecting

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

## 8. Mobile Responsiveness Tests

### Test 8.1: Paywall Modal on Mobile
**Device**: iPhone/Android simulator or actual device

**Steps**:
1. Trigger paywall modal on mobile
2. Test all interactions

**Expected Results**:
- ✅ Modal is centered and readable
- ✅ Benefits list wraps properly
- ✅ Buttons are touch-friendly (44x44px minimum)
- ✅ Close button is easily tappable
- ✅ No horizontal scrolling required

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 8.2: Upgrade Banner on Mobile
**Device**: Mobile viewport

**Steps**:
1. View course catalog on mobile
2. Check upgrade banner layout

**Expected Results**:
- ✅ Banner stacks vertically on small screens
- ✅ Text is centered on mobile
- ✅ Benefits wrap to multiple lines
- ✅ "View Plans" button is full-width or centered

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 8.3: Premium Badge on Mobile
**Steps**:
1. View course cards on mobile
2. Check premium badge visibility

**Expected Results**:
- ✅ Badge is visible and readable
- ✅ Badge doesn't overlap course title
- ✅ Badge size is appropriate for mobile

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

## 9. Accessibility Tests

### Test 9.1: Keyboard Navigation
**Steps**:
1. Trigger paywall modal
2. Navigate using Tab key
3. Test Enter/Escape keys

**Expected Results**:
- ✅ Can tab to close button
- ✅ Can tab to "Upgrade to Premium" button
- ✅ Can tab to "Maybe Later" button
- ✅ ESC key closes modal
- ✅ Focus is trapped within modal

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 9.2: Screen Reader Support
**Tools**: NVDA, JAWS, or VoiceOver

**Steps**:
1. Enable screen reader
2. Trigger paywall modal
3. Navigate through content

**Expected Results**:
- ✅ Modal announces when opened
- ✅ Heading hierarchy is correct (h2 for title)
- ✅ Buttons have descriptive labels
- ✅ Close button has aria-label="Close"
- ✅ Icon graphics are decorative (aria-hidden)

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 9.3: Color Contrast
**Tools**: Browser contrast checker or WAVE tool

**Steps**:
1. Check all text against backgrounds
2. Verify WCAG AA compliance

**Expected Results**:
- ✅ Premium badge text has 4.5:1 contrast
- ✅ Upgrade banner text has 4.5:1 contrast
- ✅ Modal text has 4.5:1 contrast
- ✅ Button text is readable

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

## 10. Performance Tests

### Test 10.1: Modal Animation Performance
**Steps**:
1. Open browser DevTools Performance tab
2. Trigger paywall modal multiple times
3. Check for frame drops

**Expected Results**:
- ✅ Modal opens smoothly (60fps)
- ✅ No layout thrashing
- ✅ Backdrop transition is smooth

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 10.2: Course Catalog Load Time
**Steps**:
1. Clear browser cache
2. Navigate to /courses
3. Measure time to interactive

**Expected Results**:
- ✅ Page loads within 2 seconds
- ✅ Premium badges render without delay
- ✅ Upgrade banner appears immediately

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

## Success Criteria

### Critical (Must Pass)
- [ ] Free users cannot enroll in more than 2 courses
- [ ] Free users cannot enroll in premium courses
- [ ] Premium paywall modal displays correct information
- [ ] Upgrade CTA appears for free users only
- [ ] Premium badge displays on premium courses
- [ ] EnrollButton properly handles all eligibility scenarios

### Important (Should Pass)
- [ ] Modal is accessible via keyboard
- [ ] Mobile responsiveness works correctly
- [ ] Network errors are handled gracefully
- [ ] Premium users can enroll in unlimited courses

### Nice to Have (May Pass)
- [ ] Smooth animations throughout
- [ ] Screen reader support is complete
- [ ] Color contrast exceeds WCAG AAA

---

## Bug Report Template

If issues are found, report using this template:

```markdown
### Bug: [Short Description]

**Component**: [e.g., PremiumPaywallModal]
**Severity**: Critical / High / Medium / Low
**Test Case**: [e.g., Test 3.1]

**Steps to Reproduce**:
1.
2.
3.

**Expected Behavior**:


**Actual Behavior**:


**Screenshots/Videos**:


**Browser/Device**:
- Browser:
- Version:
- OS:

**Console Errors**:
```
[Paste any console errors]
```

**Additional Notes**:

```

---

## Phase Completion Checklist

Before marking Phase 8 as complete:

- [ ] All critical tests pass
- [ ] At least 90% of important tests pass
- [ ] No critical bugs remain unfixed
- [ ] Code is committed and pushed to branch
- [ ] Testing guide is updated with actual results
- [ ] Known issues are documented

---

**Last Updated**: 2025-11-16
**Phase**: 8 - Premium Access Control
**Status**: Ready for Testing
