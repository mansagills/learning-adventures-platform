# Phase 7: XP Dashboard Integration - Testing Guide

**Status**: Ready for Testing
**Date**: November 2025
**Components**: XP Widget, Streak Display, Daily XP Goal, Recent Courses

---

## 🧪 Testing Checklist

### Prerequisites

**Before testing, ensure:**

- [x] Prisma client is generated (`npx prisma generate`)
- [x] Database is seeded (`npm run db:seed`)
- [x] Dev server is running (`npm run dev`)
- [x] You're logged in as a test user

---

## 📋 Step-by-Step Testing

### 1. Test API Endpoints

**Test Level Status Endpoint:**

```bash
# Open your browser and go to:
http://localhost:3000/api/level/status
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "level": {
      "id": "...",
      "userId": "...",
      "currentLevel": 1,
      "totalXP": 0,
      "xpToNextLevel": 100,
      "currentStreak": 0,
      "longestStreak": 0,
      "lastActivityDate": null,
      "xpInCurrentLevel": 0
    },
    "dailyXP": {
      "id": "...",
      "userId": "...",
      "date": "2025-11-16",
      "xpFromLessons": 0,
      "xpFromGames": 0,
      "totalXP": 0,
      "lessonsCompleted": 0,
      "gamesCompleted": 0
    },
    "streak": 0
  }
}
```

**Test Dashboard Endpoint:**

```bash
http://localhost:3000/api/courses/user/dashboard
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "recentCourses": [],
    "inProgressCount": 0,
    "completedCount": 0,
    "totalCourseXP": 0
  }
}
```

✅ **Pass Criteria:**

- Both endpoints return 200 status
- Data structure matches expected format
- No errors in console

---

### 2. Test Dashboard Page

**Navigate to:**

```
http://localhost:3000/dashboard
```

**You should see:**

**Top Section:**

- ✅ XP Widget (left) - Purple gradient card
  - Shows "Level 1"
  - Lightning bolt icon
  - Progress bar (0%)
  - "0 Total XP"
  - "100 XP needed"

- ✅ Streak Display (center) - White card with orange border
  - Shows "0 days" streak
  - 🌱 seedling emoji (for 0 streak)
  - "Start your streak today!" message

- ✅ Daily XP Goal (right) - White card
  - Shows "0 / 200 XP"
  - Progress bar (0%)
  - "200 XP to reach your daily goal"

**Recent Courses Section:**

- ✅ Shows "No Courses Yet" state
  - 📚 Book icon
  - "Start your learning journey" message
  - "Browse Courses" button

---

### 3. Test With Course Enrollment

**Step 1: Enroll in a Course**

1. Go to http://localhost:3000/courses
2. Click on "Multiplication Mastery" (free course)
3. Click "Enroll in Course" button
4. You should be enrolled

**Step 2: Complete a Lesson**

1. Click on "Lesson 1: What is Multiplication?"
2. Complete the lesson
3. Should earn 50 XP
4. Return to dashboard

**Step 3: Verify Dashboard Updates**

Navigate back to: http://localhost:3000/dashboard

**Expected Changes:**

**XP Widget:**

- ✅ Total XP: 50
- ✅ Progress bar: ~50% to Level 2
- ✅ "50 XP needed" to next level

**Streak Display:**

- ✅ Current streak: 1 day
- ✅ Shows 🔥 fire emoji
- ✅ "Great start! Keep it going!"

**Daily XP Goal:**

- ✅ Shows "50 / 200 XP"
- ✅ Progress bar: 25%
- ✅ Shows "1 Lesson" completed
- ✅ "150 XP to reach your daily goal"

**Recent Courses:**

- ✅ Shows "Multiplication Mastery" card
- ✅ Progress bar shows completion percentage
- ✅ Shows "1/7 lessons" completed
- ✅ Subject color stripe (blue for math)
- ✅ Difficulty badge "Beginner"
- ✅ "⭐ 575 XP"

---

### 4. Test Multiple Lesson Completions

**Complete 3 more lessons to test:**

1. Complete Lesson 2 (75 XP)
2. Complete Lesson 3 (75 XP)
3. Complete Lesson 4 (50 XP)

**Total XP: 250 XP**

**Expected Dashboard:**

**XP Widget:**

- ✅ Level 2 (since 250 XP > 100 XP for Level 1→2)
- ✅ Shows progress to Level 3
- ✅ Calculates XP in current level correctly

**Daily XP Goal:**

- ✅ Shows "250 / 200 XP"
- ✅ Progress bar: 100%+ (overflowed)
- ✅ Green celebration: "🎉 Amazing! You've exceeded your daily goal by 50 XP!"
- ✅ Shows "4 Lessons" completed

**Recent Courses:**

- ✅ Progress updated to ~57% (4/7 lessons)
- ✅ Progress bar reflects completion

---

### 5. Test Streak Bonus Display

**To test streak bonuses:**

The seed script doesn't automatically create multi-day streaks, but you can verify the UI logic:

**Expected Behavior:**

- 1 day: 🔥 "Great start!"
- 3+ days: 🔥🔥 "You're on fire!" + Shows "1.2x XP" bonus
- 7+ days: 🔥🔥🔥 "Amazing streak!" + Shows "1.5x XP" bonus
- 30+ days: 🔥🔥🔥🏆 "Legendary!" + Shows "2x XP" bonus

---

### 6. Edge Cases to Test

**Test as New User (No Progress):**

- ✅ All widgets show 0 state
- ✅ "No Courses Yet" message appears
- ✅ No errors in console

**Test with Multiple Courses:**

1. Enroll in 2-3 courses
2. Complete lessons in different courses
3. Verify "Recent Courses" shows all enrolled courses
4. Verify they're sorted by last accessed

**Test Course Completion:**

1. Complete all 7 lessons in Multiplication Mastery
2. Verify course shows 100% complete
3. Verify "Course Completed!" badge appears

---

## 🐛 Known Issues to Check

**Issue 1: API Returns 401 Unauthorized**

- **Cause:** Not logged in
- **Fix:** Login with test credentials (student@test.com / password123)

**Issue 2: Widgets Show Loading Forever**

- **Cause:** API endpoints failing
- **Fix:** Check browser console for errors
- **Check:** Database connection is working

**Issue 3: Recent Courses Empty After Enrolling**

- **Cause:** Dashboard API might not be returning data
- **Fix:** Check /api/courses/user/dashboard response
- **Verify:** Enrollment was successful in database

**Issue 4: XP Not Updating After Lesson Completion**

- **Cause:** XP calculation might have failed
- **Fix:** Check lesson completion API response
- **Verify:** UserLevel table was updated

---

## ✅ Test Completion Checklist

Mark off each item as you test:

**API Tests:**

- [ ] /api/level/status returns correct data
- [ ] /api/courses/user/dashboard returns correct data
- [ ] No 401/500 errors

**Component Tests:**

- [ ] XP Widget displays and updates correctly
- [ ] Streak Display shows proper emoji and messages
- [ ] Daily XP Goal tracks progress accurately
- [ ] Recent Courses lists enrolled courses
- [ ] All progress bars animate smoothly

**Functional Tests:**

- [ ] Completing a lesson updates all widgets
- [ ] XP accumulates correctly
- [ ] Level up works (test by completing enough lessons)
- [ ] Course progress updates in real-time
- [ ] "No courses" state shows when applicable

**Edge Cases:**

- [ ] Works for brand new users
- [ ] Works with multiple courses
- [ ] Handles 100% course completion
- [ ] Handles daily goal exceeded (>200 XP)

---

## 📊 Sample Test Data

**User Levels:**

- Level 1: 0-99 XP
- Level 2: 100-299 XP (100 + 200)
- Level 3: 300-649 XP (100 + 200 + 350)
- Level 4: 650-1199 XP (100 + 200 + 350 + 550)

**Lesson XP Values:**

- Interactive lessons: 50-75 XP
- Games: 75-125 XP
- Projects: 150-175 XP

**Daily XP Goal:** 200 XP

- ~3-4 lessons to reach daily goal

---

## 🎯 Success Criteria

Phase 7 is successful if:

✅ All API endpoints return correct data
✅ All widgets display without errors
✅ XP updates in real-time after lesson completion
✅ Streak tracking works correctly
✅ Daily XP goal shows accurate progress
✅ Recent courses displays enrolled courses
✅ Progress bars are accurate
✅ No console errors
✅ Mobile responsive (test on small screen)

---

## 📝 Bug Report Template

If you find issues, report using this format:

```
**Bug:** [Brief description]
**Steps to Reproduce:**
1.
2.
3.

**Expected:** [What should happen]
**Actual:** [What actually happens]
**Console Errors:** [Any errors in browser console]
**Screenshot:** [If applicable]
```

---

**Happy Testing!** 🚀

Once testing is complete, we can move on to Phase 8: Premium Access Control.
