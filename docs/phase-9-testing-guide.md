# Phase 9: Course Certificates - Testing Guide

## Overview
Phase 9 implements course completion certificates with PDF generation, certificate viewing, and profile integration. This guide covers comprehensive testing to ensure proper certificate generation, display, and verification.

## Components Tested

1. **Certificate Generator** - Backend logic for creating certificates
2. **CertificateView** - Printable/downloadable certificate display
3. **CertificatesSection** - Profile page certificate gallery
4. **Certificate API Routes** - Generate, retrieve, and list certificates
5. **Course Detail Page** - "Get Certificate" button for completed courses
6. **Database Schema** - CourseCertificate model

---

## Test Prerequisites

### Setup
```bash
# Ensure development server is running
cd learning-adventures-app
npm run dev

# Update database schema
npx prisma generate
npx prisma db push

# Seed database with test courses
npm run db:seed
```

### Test Accounts
- **Student**: `student@test.com` / `password123`
- **Admin**: `admin@test.com` / `password123`

### Test Course
Complete a course to test certificates:
1. Login as student
2. Enroll in "Multiplication Mastery"
3. Complete all lessons to reach COMPLETED status

---

## 1. Certificate Generation Tests

### Test 1.1: Generate Certificate for Completed Course
**URL**: http://localhost:3000/courses/multiplication-mastery

**Setup**:
1. Complete all lessons in the course
2. Course status should be "COMPLETED"

**Steps**:
1. Verify "Get Your Certificate" button appears
2. Click the button
3. Observe navigation to certificate page

**Expected Results**:
- ✅ Button only appears when course is COMPLETED
- ✅ Button text: "Get Your Certificate" (first time) or "View Certificate" (subsequent)
- ✅ Loading state shows while generating
- ✅ Redirects to `/certificates/{certificateId}`
- ✅ Certificate displays with correct information

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 1.2: Certificate Number Generation
**API Endpoint**: POST `/api/courses/{courseId}/certificate`

**Test with curl**:
```bash
# Replace {courseId} with actual course ID
curl -X POST http://localhost:3000/api/courses/{courseId}/certificate \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "certificate": {
      "id": "cert_id",
      "certificateNumber": "CERT-2025-000001",
      "studentName": "Student Name",
      "courseTitle": "Course Title",
      "completionDate": "2025-01-15T00:00:00.000Z",
      "totalXPEarned": 575,
      "averageScore": 95.5,
      "totalLessons": 7,
      "timeSpent": 120,
      "issuedAt": "2025-01-15T12:00:00.000Z"
    }
  }
}
```

**Expected Certificate Number Format**:
- ✅ Format: `CERT-YYYY-NNNNNN`
- ✅ Year matches current year
- ✅ Sequence number increments with each certificate
- ✅ Number is unique

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 1.3: Duplicate Certificate Prevention
**Steps**:
1. Generate certificate for a course
2. Click "View Certificate" button again
3. Verify same certificate is returned

**Expected Results**:
- ✅ Same certificate ID returned
- ✅ No duplicate certificate created in database
- ✅ Certificate number remains the same
- ✅ Verification code unchanged

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 1.4: Incomplete Course Certificate Block
**Setup**: Enroll in course but don't complete all lessons

**Steps**:
1. Navigate to course detail page
2. Check for certificate button

**Expected Results**:
- ✅ Certificate button does NOT appear
- ✅ Only "Continue Learning" button shows
- ✅ Attempting to call API directly returns error

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

## 2. Certificate Display Tests

### Test 2.1: Certificate View Page Layout
**URL**: http://localhost:3000/certificates/{certificateId}

**Visual Checks**:
- ✅ Certificate has decorative border (double border, indigo color)
- ✅ Platform logo/icon at top (gradient circle with star)
- ✅ "Certificate of Achievement" title (or variant based on score)
- ✅ Student name prominently displayed
- ✅ Course title clearly shown
- ✅ Completion date formatted nicely (e.g., "January 15, 2025")
- ✅ Achievement details in grid layout:
  - Completion Date
  - Total XP Earned
  - Lessons Completed
  - Time Invested
- ✅ Average score badge (if applicable)
- ✅ Signature line and issue date
- ✅ Certificate number at bottom
- ✅ Verification code at bottom
- ✅ "Verify at learningadventures.com/verify" message

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 2.2: Achievement Level Calculation
**Test Cases**:
- Average Score ≥ 95%: "Outstanding Achievement"
- Average Score ≥ 85%: "High Achievement"
- Average Score ≥ 75%: "Achievement"
- No score or < 75%: "Completion"

**Steps**:
1. Complete courses with different average scores
2. Generate certificates for each
3. Verify achievement level matches score

**Expected Results**:
- ✅ Certificate title changes based on score
- ✅ All score ranges work correctly
- ✅ Null/undefined scores show "Completion"

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 2.3: Certificate Action Buttons
**Steps**:
1. Navigate to certificate page
2. Test "Print Certificate" button
3. Test "Download PDF" button
4. Test "Back" button

**Expected Results**:
- ✅ "Print Certificate" triggers browser print dialog
- ✅ "Download PDF" triggers browser print dialog (for Save as PDF)
- ✅ "Back" button returns to previous page
- ✅ Buttons are hidden when printing (CSS @media print)

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

## 3. Print and PDF Tests

### Test 3.1: Print Layout
**Steps**:
1. Click "Print Certificate"
2. Preview print layout
3. Check appearance

**Expected Results**:
- ✅ Action buttons hidden in print view
- ✅ Instructions section hidden in print view
- ✅ Certificate fills page appropriately
- ✅ No page breaks within certificate
- ✅ Colors print correctly (or acceptable in grayscale)
- ✅ Border and decorations visible

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 3.2: Save as PDF
**Steps**:
1. Click "Download PDF"
2. In print dialog, select "Save as PDF"
3. Save PDF to local machine
4. Open and review PDF

**Expected Results**:
- ✅ PDF generated successfully
- ✅ Certificate layout preserved in PDF
- ✅ Text is selectable/searchable
- ✅ All information visible and readable
- ✅ Colors and gradients render properly

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

## 4. Profile Integration Tests

### Test 4.1: Certificates Section Display
**URL**: http://localhost:3000/profile

**Setup**: Have at least 1 earned certificate

**Steps**:
1. Navigate to profile page
2. Scroll to Certificates section
3. Verify certificates display

**Expected Results**:
- ✅ "Certificates" section appears
- ✅ Shows count of earned certificates (e.g., "2 earned")
- ✅ Certificates displayed in grid (2 columns on desktop)
- ✅ Each certificate card shows:
  - Course icon/badge
  - Course title
  - Completion date
  - XP earned
  - Average score (if applicable)
  - Certificate number
  - "View Certificate →" link
- ✅ Hover effect on certificate cards

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 4.2: Empty Certificates State
**Setup**: User with no earned certificates

**Steps**:
1. Login as user with no completed courses
2. Navigate to profile page
3. Check Certificates section

**Expected Results**:
- ✅ Empty state displays
- ✅ Icon showing clipboard/certificate
- ✅ Message: "No Certificates Yet"
- ✅ Subtitle: "Complete courses to earn certificates!"
- ✅ "Browse Courses" button links to /courses

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 4.3: Certificate Card Interaction
**Steps**:
1. Click on a certificate card in profile
2. Verify navigation

**Expected Results**:
- ✅ Clicking card navigates to `/certificates/{certificateId}`
- ✅ Certificate opens in same tab
- ✅ Certificate number links to same page

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

## 5. API Endpoint Tests

### Test 5.1: Get Certificate by ID
**API Endpoint**: GET `/api/certificates/{certificateId}`

**Test with curl**:
```bash
curl http://localhost:3000/api/certificates/{certificateId}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "certificate": {
      "id": "cert123",
      "certificateNumber": "CERT-2025-000001",
      "verificationCode": "A1B2C3D4E5F6",
      "studentName": "John Doe",
      "courseTitle": "Multiplication Mastery",
      "completionDate": "2025-01-15T00:00:00.000Z",
      "totalXPEarned": 575,
      "averageScore": 95.5,
      "totalLessons": 7,
      "timeSpent": 120,
      "issuedAt": "2025-01-15T12:00:00.000Z"
    }
  }
}
```

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 5.2: Get User Certificates
**API Endpoint**: GET `/api/certificates/user`

**Setup**: Authenticated user with multiple certificates

**Test with curl**:
```bash
curl http://localhost:3000/api/certificates/user \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "certificates": [...],
    "count": 3
  }
}
```

**Expected Results**:
- ✅ Returns array of user's certificates
- ✅ Certificates ordered by completion date (newest first)
- ✅ Count matches array length
- ✅ Only returns certificates for authenticated user

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 5.3: Generate Certificate API
**API Endpoint**: POST `/api/courses/{courseId}/certificate`

**Test Cases**:
1. **Valid completed course**: Should create certificate
2. **Incomplete course**: Should return 400 error
3. **Not enrolled**: Should return 404 error
4. **Already has certificate**: Should return existing certificate

**Expected Error Responses**:
```json
{
  "success": false,
  "error": {
    "code": "COURSE_NOT_COMPLETED",
    "message": "You must complete the course before generating a certificate"
  }
}
```

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

## 6. Database Tests

### Test 6.1: Certificate Model Fields
**Steps**:
1. Generate a certificate
2. Check database using Prisma Studio

**Expected Fields**:
- ✅ `id` (unique)
- ✅ `enrollmentId` (unique, links to CourseEnrollment)
- ✅ `certificateNumber` (unique, format: CERT-YYYY-NNNNNN)
- ✅ `verificationCode` (unique, 12-char alphanumeric)
- ✅ `studentName`
- ✅ `courseTitle`
- ✅ `completionDate`
- ✅ `totalXPEarned`
- ✅ `averageScore` (nullable)
- ✅ `totalLessons`
- ✅ `timeSpent`
- ✅ `issuedAt`
- ✅ `createdAt`

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 6.2: Enrollment Certificate Flag
**Steps**:
1. Generate certificate for course
2. Check CourseEnrollment record

**Expected Results**:
- ✅ `certificateEarned` field set to `true`
- ✅ Enrollment record updated after certificate generation
- ✅ Certificate relation exists

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

## 7. Edge Cases and Error Handling

### Test 7.1: Invalid Certificate ID
**URL**: http://localhost:3000/certificates/invalid-id

**Expected Results**:
- ✅ Shows error message: "Certificate not found"
- ✅ "Return to Profile" button displayed
- ✅ No crash or unhandled error

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 7.2: Unauthenticated Access to Certificate
**Steps**:
1. Logout from application
2. Navigate to certificate URL with valid ID
3. Check if certificate displays

**Expected Results**:
- ✅ Certificate displays (certificates are public for verification)
- ✅ All certificate information visible
- ✅ Action buttons still functional

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 7.3: Network Failure During Generation
**Steps**:
1. Disconnect network
2. Try to generate certificate
3. Reconnect and retry

**Expected Results**:
- ✅ Shows error message
- ✅ Button re-enables after error
- ✅ Retry succeeds after reconnecting

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

## 8. Mobile Responsiveness Tests

### Test 8.1: Certificate View on Mobile
**Device**: iPhone/Android simulator or actual device

**Steps**:
1. Open certificate on mobile device
2. Check layout and readability

**Expected Results**:
- ✅ Certificate is readable on small screens
- ✅ Text doesn't overflow or get cut off
- ✅ Achievement grid stacks appropriately
- ✅ Borders and decorations scale well
- ✅ Action buttons are touch-friendly

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 8.2: Profile Certificates on Mobile
**Steps**:
1. View profile on mobile
2. Check Certificates section

**Expected Results**:
- ✅ Certificate cards stack in single column on mobile
- ✅ All information remains visible
- ✅ Cards are tappable (touch-friendly)
- ✅ Icons and badges scale properly

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

## 9. Data Accuracy Tests

### Test 9.1: Certificate Data Matches Enrollment
**Steps**:
1. Complete course with known metrics
2. Generate certificate
3. Compare certificate data to enrollment record

**Expected Results**:
- ✅ Student name matches user record
- ✅ Course title matches course record
- ✅ Completion date matches enrollment.completedAt
- ✅ Total XP matches enrollment.totalXPEarned
- ✅ Average score matches enrollment.averageScore
- ✅ Total lessons matches course.lessons.length
- ✅ Time spent calculated from lesson progress

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 9.2: Time Spent Calculation
**Steps**:
1. Complete lessons with varying time spent
2. Generate certificate
3. Verify time calculation

**Expected Results**:
- ✅ Time is sum of all lesson progress timeSpent fields
- ✅ Displayed in human-readable format (e.g., "2 hours 15 minutes")
- ✅ Handles edge cases (0 minutes, exactly 1 hour, etc.)

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

## 10. Performance Tests

### Test 10.1: Certificate Generation Speed
**Steps**:
1. Time certificate generation
2. Check database query count

**Expected Results**:
- ✅ Certificate generates in < 2 seconds
- ✅ Minimal database queries (efficient)
- ✅ No N+1 query problems

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

### Test 10.2: Certificate Page Load Time
**Steps**:
1. Clear cache
2. Navigate to certificate page
3. Measure load time

**Expected Results**:
- ✅ Page loads in < 1 second
- ✅ Certificate renders without delay
- ✅ No layout shift during load

**Actual Results**:
- [ ] Pass / [ ] Fail

**Notes**: _______________________

---

## Success Criteria

### Critical (Must Pass)
- [ ] Certificates generate for completed courses only
- [ ] Certificate displays all required information accurately
- [ ] Certificate can be printed/saved as PDF
- [ ] Certificates appear in user profile
- [ ] Certificate numbers are unique and sequential
- [ ] Verification codes are unique

### Important (Should Pass)
- [ ] Certificate design is professional and attractive
- [ ] Mobile responsiveness works correctly
- [ ] Error handling is graceful
- [ ] API endpoints return correct data
- [ ] Database schema is correct

### Nice to Have (May Pass)
- [ ] Certificate verification system (future feature)
- [ ] Email certificate to user
- [ ] Social sharing for certificates

---

## Bug Report Template

If issues are found, report using this template:

```markdown
### Bug: [Short Description]

**Component**: [e.g., CertificateView]
**Severity**: Critical / High / Medium / Low
**Test Case**: [e.g., Test 2.1]

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

Before marking Phase 9 as complete:

- [ ] All critical tests pass
- [ ] At least 90% of important tests pass
- [ ] No critical bugs remain unfixed
- [ ] Database schema updated and migrated
- [ ] Code is committed and pushed to branch
- [ ] Testing guide is updated with actual results
- [ ] Known issues are documented

---

**Last Updated**: 2025-11-16
**Phase**: 9 - Course Certificates
**Status**: Ready for Testing
