# Non-Developer Game Creation Workflow

## 📋 Overview

This guide is for **content creators, educators, and non-developers** who want to create educational games using the Learning Adventures Platform's AI-powered studios. No coding experience required!

## 🎯 Three Ways to Create Games

### 1. **Gemini Studio** (AI-Powered Game Generation)
### 2. **AI Agent Studio** (Multi-Agent Workflows)
### 3. **Content Studio** (Upload & Publish)

All three methods now follow the same quality assurance workflow: **Create → Test → Approve → Publish**

---

## 🚀 Method 1: Gemini Studio (Recommended for Beginners)

### What It Does:
Creates complete educational games from natural language descriptions using Google Gemini AI.

### Step-by-Step Process:

#### Step 1: Access Gemini Studio
1. Log in as **ADMIN**
2. Click **"Gemini Studio"** in the left sidebar
3. You'll see: **✨ Gemini 3 Content Studio**

#### Step 2: Describe Your Game
Fill out the creation form:

```
Subject: Math, Science, English, History, or Interdisciplinary
Grade Level: K, 1, 2, 3, 4, 5, 6
Difficulty: Easy, Medium, Hard
Game Type: Interactive Quiz, Simulation, Puzzle, Adventure, etc.

Description: Be specific!
Example: "Create a 3D space adventure where students solve
multiplication problems (2-12 tables) to navigate through
asteroid fields. Include sound effects and particle effects."
```

**💡 Pro Tips:**
- Be specific about the educational objectives
- Mention desired visual elements (3D, animations, colors)
- Include interaction types (click, drag, type answers)
- Specify any special features (timer, hints, levels)

#### Step 3: Preview & Iterate
1. **Wait** for AI generation (~30-60 seconds)
2. **Preview** your game in the live preview window
3. **Test** the game directly in the preview
4. **Provide feedback** if you want changes:
   - "Add sound effects"
   - "Make it 3D"
   - "Change colors to blue and green"
   - "Add a timer"
   - "Make questions easier"

#### Step 4: Submit for Testing
When you're happy with the game:

1. Fill in **Game Metadata**:
   - Title
   - Description (min 20 characters)
   - Estimated Time
   - Feature checkbox (if you want it featured)

2. Review **Quality Check** scores:
   - Accessibility: 95%
   - Performance: 92%
   - Educational: 90%

3. Click **"🧪 Submit for Testing & Review"**

#### Step 5: Game Submitted!
You'll see a success message:
```
🎉 Submitted for Review!
Your game has been added to the testing queue
```

**Next Steps:**
- Click **"Test Game"** to play it yourself
- Click **"Go to Testing Dashboard"** to see it in the queue
- Your game shows as **"NOT_TESTED"** status

---

## 🤖 Method 2: AI Agent Studio

### What It Does:
Uses multiple AI agents working together to create complex, multi-part educational content.

### When to Use:
- Complex lesson plans with multiple activities
- Series of related games
- Interactive storytelling with branching
- Multi-subject interdisciplinary content

### Process:
1. Navigate to **AI Agent Studio**
2. Select a **workflow template**:
   - Content Creation Workflow
   - Quality Assurance Workflow
   - Catalog Integration Workflow
3. Configure **agents** and **tasks**
4. Run the **workflow**
5. Review **generated content**
6. Submit to **testing queue**

*Note: This method is more advanced - see `docs/agents/` for detailed guides*

---

## 📤 Method 3: Content Studio (Upload Existing Games)

### What It Does:
Upload HTML games or React components you already have.

### Step-by-Step:

#### Step 1: Prepare Your Content
Ensure you have:
- ✅ HTML file (single file or zip)
- ✅ All assets embedded or included
- ✅ Mobile-responsive design
- ✅ No external dependencies

#### Step 2: Upload
1. Navigate to **Content Studio** (`/internal`)
2. Select **"Content Creator"** tab
3. Choose **upload source**:
   - 📦 Uploaded Content
   - 🤖 AI-Generated
4. Upload your **file or zip**
5. Fill in **metadata**:
   - Subject
   - Type (Game or Lesson)
   - Grade Levels
   - Skills
   - Subscription Tier

#### Step 3: Preview
Review your uploaded content in the preview pane.

#### Step 4: Publish to Testing
1. Click **"Publish to Catalog"**
   *(Note: This currently publishes directly - will be updated to testing workflow soon)*

---

## 🧪 Testing & Approval Workflow

### All Methods Lead to Testing Dashboard

After creating a game with any method, it appears in the **Testing Dashboard** at `/internal/testing`.

### Testing Process:

#### 1. **Your Game Shows as "NOT_TESTED"**
   - It's in the queue
   - Other admins can see it
   - It's NOT in the public catalog yet

#### 2. **Test the Game**
   - Click on your game in the dashboard
   - Click **"Preview Game"** to play it
   - Test all features and mechanics
   - Check for bugs or issues

#### 3. **Update Status to "IN_TESTING"**
   - Select your game
   - Change status dropdown to **"In Testing"**
   - This signals to the team you're actively reviewing it

#### 4. **Provide Feedback** (If needed)
   - Click **"💬 Add Feedback"**
   - Choose feedback type:
     - BUG - Something is broken
     - SUGGESTION - Improvement idea
     - ACCESSIBILITY_ISSUE - WCAG compliance problem
     - CONTENT_ERROR - Educational content issue
     - GENERAL - Other feedback
   - Add detailed message
   - Submit

#### 5. **Request Approval**
When ready for team review:
   - Click **"✅ Approve/Review"**
   - Fill out quality checklist:
     - ✅ Educational Quality
     - ✅ Technical Quality
     - ✅ Accessibility Compliant
     - ✅ Age Appropriate
     - ⭐⭐⭐⭐⭐ Engagement Level (1-5 stars)
   - Add review notes
   - Select decision:
     - **APPROVE** - Ready for catalog
     - **REQUEST_CHANGES** - Needs fixes
     - **REJECT** - Not suitable
   - Submit review

#### 6. **Game Approved!**
   - Status changes to **"APPROVED"**
   - **"🚀 Promote to Catalog"** button appears

#### 7. **Promotion to Catalog** (ADMIN ONLY)
   - Admin clicks **"🚀 Promote to Catalog"**
   - Game is automatically added to `lib/catalogData.ts`
   - Game appears in public catalog
   - Students can now play it!

---

## 🎯 Best Practices

### For Game Creation:

1. **Start Simple**
   - Test the workflow with a simple game first
   - Learn the iteration process
   - Build complexity gradually

2. **Be Specific in Descriptions**
   - Bad: "Make a math game"
   - Good: "Create a pirate-themed addition game for grades 1-2 where students help Captain Math find treasure by solving addition problems (1-20). Include 3 difficulty levels and island-hopping animations."

3. **Test Thoroughly Before Submitting**
   - Play through the entire game
   - Try to break it
   - Test on mobile device
   - Check educational accuracy

4. **Provide Clear Feedback**
   - Be specific about what's wrong
   - Suggest specific improvements
   - Include screenshots if needed

### For Team Review:

1. **Review Within 48 Hours**
   - Don't let games sit in "NOT_TESTED"
   - Maintain momentum
   - Give creators timely feedback

2. **Use the Quality Checklist**
   - Don't skip any criteria
   - Be thorough but fair
   - Document concerns in notes

3. **Provide Constructive Feedback**
   - Start with what works well
   - Be specific about issues
   - Suggest actionable improvements

---

## 📊 Workflow Comparison

| Method | Best For | Time | Skill Level | Iteration |
|--------|----------|------|-------------|-----------|
| **Gemini Studio** | Quick games, beginners | 5-10 min | None | Easy (feedback-based) |
| **AI Agent Studio** | Complex content, series | 15-30 min | Intermediate | Moderate (template-based) |
| **Content Studio** | Existing content | 5 min | Varies | Manual (re-upload) |

---

## 🚦 Status Meanings

| Status | Meaning | Who Can Change It |
|--------|---------|-------------------|
| **NOT_TESTED** | New submission, not reviewed | Creator (on submit) |
| **IN_TESTING** | Currently being reviewed | Any admin |
| **APPROVED** | Passed quality checks | Reviewer |
| **NEEDS_REVISION** | Requires changes | Reviewer |
| **REJECTED** | Not suitable for platform | Reviewer |

---

## 📝 Example Workflow: Start to Finish

### Sarah's Story - Creating a Science Game

**10:00 AM** - Sarah opens Gemini Studio

**10:02 AM** - She fills in the form:
```
Subject: Science
Grade: 3-5
Game Type: Interactive Simulation
Description: "Create a water cycle game where students move
water droplets through evaporation, condensation, precipitation.
Include cloud formation animation and 3D rain effects. Add quiz
questions at each stage."
```

**10:03 AM** - Clicks "Generate Game", waits 45 seconds

**10:04 AM** - Game appears! She tests it and loves the 3D effects

**10:05 AM** - She provides feedback: "Add sound effects for rain"

**10:06 AM** - Updated game generated with rain sounds

**10:08 AM** - She fills in metadata:
```
Title: Water Cycle Adventure
Description: "Learn the water cycle through an interactive 3D
simulation with quiz questions and beautiful animations!"
Time: 15-20 mins
Featured: ✅ Yes
```

**10:09 AM** - Clicks "🧪 Submit for Testing & Review"

**10:10 AM** - Success! Game is in testing queue

**10:15 AM** - She clicks "Test Game" and plays through it twice

**10:30 AM** - She updates status to "IN_TESTING"

**2:00 PM** - Team member Mike reviews the game

**2:05 PM** - Mike provides feedback: "Love it! One typo on question 3"

**2:10 PM** - Sarah fixes the typo using iteration

**2:15 PM** - Mike approves:
```
Educational: ✅ Technical: ✅ Accessibility: ✅ Age-Appropriate: ✅
Engagement: ⭐⭐⭐⭐⭐
Decision: APPROVE
Notes: "Excellent water cycle simulation. Very engaging!"
```

**2:20 PM** - Sarah (as admin) promotes to catalog

**2:21 PM** - Students can now play "Water Cycle Adventure"!

**Total Time**: ~10 minutes creation + 5 minutes review = 15 minutes

---

## ❓ FAQs

**Q: Do I need to know how to code?**
A: No! Gemini Studio and AI Agent Studio require zero coding knowledge.

**Q: Can I edit a game after submitting it?**
A: Yes! Use the iteration feature in Gemini Studio or re-upload in Content Studio.

**Q: How long does approval take?**
A: Typically 24-48 hours, depending on team availability.

**Q: Can I approve my own game?**
A: Technically yes, but we recommend peer review for quality assurance.

**Q: What if my game gets rejected?**
A: Review the feedback, make improvements, and re-submit. Most rejections are minor issues.

**Q: Can students see games in the testing queue?**
A: No, only ADMIN users can see and access the testing dashboard.

---

## 🆘 Getting Help

- **Testing Dashboard Issues**: Check `/internal/testing`
- **Game Not Generating**: Refresh page, try simpler description
- **Questions**: Ask in team chat or consult `GAME_DEVELOPMENT.md`

---

**Last Updated**: November 2025
**Platform Version**: 0.2.0
**Testing System**: Active
