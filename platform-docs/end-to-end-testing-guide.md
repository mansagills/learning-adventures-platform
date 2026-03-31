# End-to-End Testing Guide

## Overview
Comprehensive guide for testing the complete Learning Adventures platform course system, covering all features from Phases 1-9.

## Test Environment Setup

### Prerequisites
```bash
# Ensure database is set up
npx prisma generate
npx prisma db push
npm run db:seed

# Start development server
npm run dev
```

### Test Accounts
- **Student**: `student@test.com` / `password123`
- **Teacher**: `teacher@test.com` / `password123`
- **Parent**: `parent@test.com` / `password123`
- **Admin**: `admin@test.com` / `password123`

### Seeded Courses
1. **Multiplication Mastery** - Free, Beginner, 7 lessons, 575 XP
2. **Fractions Foundations** - Premium, Intermediate, 9 lessons, 825 XP (requires Multiplication Mastery)
3. **Science Lab Basics** - Free, Beginner, 8 lessons, 625 XP

---

## Complete User Journeys

### Journey 1: New User → Course Completion → Certificate

**Objective**: Test complete flow from signup to earning a certificate

**Steps**:
1. **Sign Up**
   - Navigate to homepage
   - Click "Sign Up"
   - Create account with role: STUDENT
   - Verify redirect to dashboard

2. **Browse Courses**
   - Navigate to `/courses`
   - Verify 3 courses display
   - Check filters work (subject, difficulty)
   - Test search functionality

3. **Enroll in Free Course**
   - Click "Multiplication Mastery"
   - Review course details
   - Click "Enroll in Course"
   - Verify enrollment success
   - Check "Continue Learning" button appears

4. **Complete Lessons**
   - Click "Continue Learning"
   - Complete Lesson 1
   - Verify linear progression (Lesson 2 unlocks)
   - Complete all 7 lessons
   - Verify XP awarded after each lesson
   - Check progress bar updates

5. **Generate Certificate**
   - Return to course detail page
   - Verify course status shows "COMPLETED"
   - Click "Get Your Certificate"
   - Verify certificate displays correctly
   - Check all details are accurate:
     - Student name
     - Course title
     - Completion date
     - Total XP (575)
     - Total lessons (7)

6. **View Certificate in Profile**
   - Navigate to `/profile`
   - Scroll to Certificates section
   - Verify certificate appears
   - Click certificate to view full version
   - Test Print/Download buttons

**Expected Results**:
- [ ] User can complete entire flow without errors
- [ ] All XP is awarded correctly (575 total)
- [ ] Certificate generates with accurate data
- [ ] Certificate appears in profile
- [ ] Progress tracked in dashboard

---

### Journey 2: Premium Features & Limits

**Objective**: Test premium course restrictions and free user limits

**Steps**:
1. **Login as Free User** (`student@test.com`)

2. **Attempt Premium Course Enrollment**
   - Navigate to "Fractions Foundations"
   - Note "Premium" badge
   - Click "Enroll in Course"
   - Verify premium paywall modal appears
   - Check modal shows:
     - "Premium Course" heading
     - Course title
     - Premium benefits list
     - "Upgrade to Premium" button
     - "Maybe Later" button
   - Close modal
   - Verify enrollment did not occur

3. **Test 2-Course Free Limit**
   - Enroll in "Multiplication Mastery" (Course 1/2)
   - Enroll in "Science Lab Basics" (Course 2/2)
   - Create a 3rd free course (if possible) or:
     - Use Prisma Studio to create another free course
   - Attempt to enroll in 3rd course
   - Verify paywall modal appears with:
     - "Free Course Limit Reached" heading
     - "You're currently enrolled in 2 free courses"
     - "Free users can enroll in up to 2 free courses"
   - Close modal

4. **Check Upgrade CTAs**
   - Navigate to `/courses`
   - Verify upgrade banner shows for authenticated free users
   - Check banner displays enrollment count (2 of 2)
   - Click "View Plans" button
   - Verify navigation to `/pricing`

5. **Login as Admin** (`admin@test.com`)
   - Navigate to `/courses`
   - Verify upgrade banner does NOT appear
   - Enroll in premium course "Fractions Foundations"
   - Verify enrollment succeeds (admin bypass)

**Expected Results**:
- [ ] Premium paywall prevents free users from enrolling
- [ ] 2-course limit enforced correctly
- [ ] Upgrade CTAs appear for free users only
- [ ] Admin/premium users can enroll in premium courses
- [ ] All modals display correct information

---

### Journey 3: XP & Leveling System

**Objective**: Test XP earning, leveling, and streak tracking

**Steps**:
1. **Fresh Student Account**
   - Create new student account or reset test account
   - Navigate to dashboard
   - Verify starting state:
     - Level 1
     - 0 XP
     - 0 streak

2. **Earn XP from Lessons**
   - Enroll in "Multiplication Mastery"
   - Complete Lesson 1 (check XP reward in database)
   - Navigate to dashboard
   - Verify XP Widget shows updated XP
   - Check progress bar toward next level
   - Complete 2 more lessons
   - Verify XP accumulates

3. **Level Up**
   - Continue completing lessons until level up
   - Formula: Level 1→2 requires 100 XP
   - Verify level increases
   - Check XP resets to progress within new level
   - Verify "XP to Next Level" updates

4. **Daily XP Goal**
   - Complete lessons to earn XP
   - Check Daily XP Goal widget
   - Goal is 200 XP/day
   - Verify progress bar updates
   - Complete goal (200+ XP in one day)
   - Check for celebration/completion state

5. **Streak Tracking**
   - Complete at least one lesson/activity
   - Check StreakDisplay widget
   - Note current streak
   - (Manual test) Return next day and complete activity
   - Verify streak increments
   - Check streak bonuses:
     - 1 day = 1x
     - 3 days = 1.2x
     - 7 days = 1.5x
     - 30 days = 2x

**Expected Results**:
- [ ] XP awarded correctly after lesson completion
- [ ] Level calculation is accurate
- [ ] Daily XP goal tracks properly
- [ ] Streak increments on consecutive days
- [ ] Widgets display current state correctly

---

### Journey 4: Linear Progression & Prerequisites

**Objective**: Test lesson locking and course prerequisites

**Steps**:
1. **Lesson Linear Progression**
   - Enroll in "Multiplication Mastery"
   - Attempt to access Lesson 3 directly (URL: `/courses/multiplication-mastery/lessons/3`)
   - Verify redirect or lock message
   - Complete Lessons 1 and 2
   - Verify Lesson 3 unlocks
   - Check lesson list shows locked/unlocked states

2. **Course Prerequisites**
   - Ensure NOT enrolled in "Multiplication Mastery"
   - Navigate to "Fractions Foundations"
   - Note prerequisite listed
   - Attempt enrollment
   - Verify error message lists prerequisite courses
   - Complete "Multiplication Mastery"
   - Return to "Fractions Foundations"
   - Verify prerequisite check passes
   - (As admin) Verify enrollment succeeds

**Expected Results**:
- [ ] Cannot access future lessons directly
- [ ] Lessons unlock sequentially
- [ ] Course prerequisites enforced
- [ ] Clear error messages show missing prerequisites
- [ ] Completing prerequisites allows enrollment

---

### Journey 5: Dashboard & Progress Tracking

**Objective**: Test dashboard widgets and progress display

**Steps**:
1. **Empty Dashboard**
   - Create new student account
   - Navigate to `/dashboard`
   - Verify empty state:
     - "Start Your Learning Journey" message
     - No progress data
     - Recommended content shows

2. **Dashboard with Progress**
   - Enroll in and start courses
   - Return to dashboard
   - Verify widgets show:
     - **Progress Overview**: Total adventures, completed, time spent, avg score
     - **Weekly Activity**: Chart of completions over 7 days
     - **Subject Progress**: Breakdown by subject
     - **XP Widget**: Current level, total XP, progress
     - **Streak Display**: Current streak with emojis
     - **Daily XP Goal**: Progress toward 200 XP
     - **Recent Courses**: Last 5 accessed courses with progress
     - **Recent Activity**: Last 10 activities
     - **Achievement Showcase**: Earned badges
     - **Recommended Content**: Personalized suggestions

3. **Recent Courses Section**
   - Enroll in multiple courses
   - Complete some lessons in each
   - Check "Recent Courses" section
   - Verify:
     - Shows last 5 accessed courses
     - Progress bars are accurate
     - "Continue Learning" links work
     - Completed courses show checkmark

**Expected Results**:
- [ ] Empty state displays when no progress
- [ ] All widgets populate with correct data
- [ ] Progress percentages are accurate
- [ ] Recent courses ordered by last accessed
- [ ] Dashboard updates after completing lessons

---

## Feature-Specific Tests

### Premium Badges
- [ ] Appear on premium courses in catalog
- [ ] Appear on course detail pages
- [ ] Correct size (sm/md/lg) in different contexts
- [ ] Gradient styling displays correctly

### Paywall Modals
- [ ] Premium required modal shows course title
- [ ] Free limit modal shows enrollment count
- [ ] Benefits list displays
- [ ] "Upgrade to Premium" links to `/pricing`
- [ ] "Maybe Later" closes modal
- [ ] Backdrop click closes modal
- [ ] ESC key closes modal

### Certificate System
- [ ] Only generates for completed courses
- [ ] Certificate number is unique and sequential
- [ ] Verification code is unique
- [ ] All data matches enrollment record
- [ ] Achievement level calculated correctly based on score
- [ ] Print layout works (no action buttons)
- [ ] PDF download works via browser print
- [ ] Certificate appears in profile
- [ ] Public certificate URL works (no auth required)

### Course Catalog
- [ ] All courses display
- [ ] Filters work (subject, difficulty)
- [ ] Search works (title, description)
- [ ] Premium badges show
- [ ] Enrollment status indicators work
- [ ] Upgrade banner shows for free users
- [ ] Loading skeleton prevents layout shift

### Course Detail Page
- [ ] Course info displays correctly
- [ ] Lesson list shows all lessons
- [ ] Prerequisites listed
- [ ] Enrollment button works
- [ ] Progress bar accurate
- [ ] Certificate button appears when completed
- [ ] Loading state works

---

## Cross-Browser Testing

Test in the following browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Critical flows to test**:
1. Sign up and login
2. Course enrollment
3. Lesson completion
4. Certificate generation
5. Payment modal interactions

---

## Mobile Testing

Test on the following devices:
- [ ] iPhone (iOS Safari)
- [ ] Android (Chrome)
- [ ] Tablet (iPad/Android)

**Critical flows**:
1. Navigation and menus
2. Course browsing
3. Lesson completion
4. Certificate viewing
5. Modal interactions

**Mobile-specific checks**:
- [ ] Touch targets ≥ 44x44px
- [ ] Text is readable (not too small)
- [ ] Modals fit on screen
- [ ] Forms are usable
- [ ] Horizontal scroll issues
- [ ] Navigation menu works

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Focus indicators visible
- [ ] Modal focus trap works
- [ ] ESC closes modals
- [ ] Enter/Space activate buttons

### Screen Reader
- [ ] Page structure makes sense
- [ ] Headings hierarchical (h1 → h2 → h3)
- [ ] ARIA labels on icon buttons
- [ ] Form labels associated
- [ ] Dynamic content announces

### Color Contrast
- [ ] Text meets 4.5:1 ratio
- [ ] Large text meets 3:1 ratio
- [ ] Interactive elements meet 3:1
- [ ] Use browser tools to verify

---

## Performance Testing

### Lighthouse Scores
Run Lighthouse audit on key pages:
- [ ] Homepage
- [ ] Course catalog
- [ ] Course detail
- [ ] Dashboard
- [ ] Certificate page

**Target Scores**:
- Performance: ≥ 90
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 90

### Load Time Metrics
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Total Blocking Time < 300ms
- [ ] Cumulative Layout Shift < 0.1

---

## Error Scenarios

Test graceful error handling:
- [ ] Invalid course ID (404)
- [ ] Invalid lesson ID (404)
- [ ] Network failure during enrollment
- [ ] Network failure during lesson completion
- [ ] Expired session (redirect to login)
- [ ] Database connection error
- [ ] Invalid certificate ID
- [ ] Unenroll confirmation works
- [ ] Duplicate enrollment attempt

---

## Edge Cases

- [ ] User with no courses
- [ ] User with all courses completed
- [ ] Course with 0 lessons
- [ ] Course with 100+ lessons
- [ ] Very long course titles
- [ ] Very long student names
- [ ] Courses with same titles
- [ ] Simultaneous enrollments
- [ ] Completing same lesson twice
- [ ] Certificate generation twice

---

## Regression Testing

After any changes, verify:
- [ ] Authentication still works
- [ ] Course enrollment still works
- [ ] Lesson completion still works
- [ ] Certificate generation still works
- [ ] Dashboard loads correctly
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Database migrations work

---

## Test Sign-Off Checklist

Before declaring Phase 10 complete:

### Critical Functionality
- [ ] All core user journeys work end-to-end
- [ ] No blocking bugs
- [ ] Authentication works across all pages
- [ ] Data persists correctly

### User Experience
- [ ] Loading states prevent layout shift
- [ ] Error messages are clear
- [ ] Forms have proper validation
- [ ] Mobile experience is good

### Quality
- [ ] No console errors in production
- [ ] TypeScript compilation succeeds
- [ ] Lighthouse scores meet targets
- [ ] Accessibility issues addressed

### Documentation
- [ ] Testing guides are complete
- [ ] API documentation exists
- [ ] Deployment guide written
- [ ] README updated

---

## Bug Report Template

```markdown
### Bug Title

**Severity**: Critical / High / Medium / Low

**Browser/Device**: Chrome 120 / iPhone 14

**User Journey**: [e.g., Journey 1, Step 3]

**Steps to Reproduce**:
1.
2.
3.

**Expected Behavior**:


**Actual Behavior**:


**Screenshots**:


**Console Errors**:
```

---

**Last Updated**: 2025-11-16
**Status**: Ready for Testing
**Next Review**: After UAT feedback
