# Learning Adventures Platform - Claude Instructions

## 🚀 Platform Development Sessions

### Current Development Status

**Active Development Plan**: COMPREHENSIVE_PLATFORM_PLAN.md
**Current Phase**: Plan 1 - Authentication & Login System
**Last Completed**: Phase 1A - Authentication Infrastructure ✅
**Next Phase**: Phase 1B - Database Setup & User Registration Flow

### 📋 Development Session Protocol

**IMPORTANT**: When starting any development session, ALWAYS:

1. **Check Development Status**: Read `COMPREHENSIVE_PLATFORM_PLAN.md` to understand current progress
2. **Review Last Completed Phase**: Look for the "COMPLETED" marker in the plan
3. **Continue from Next Phase**: Pick up from the next uncompleted phase/day
4. **Update Progress**: When completing a phase, mark it as "COMPLETED ✅" in the plan
5. **Track Session Work**: Update the plan with detailed progress notes

### 🎯 Session Continuation Instructions

When asked to continue development work:
- Read the comprehensive plan to understand the current state
- Continue from the next uncompleted phase
- Use TodoWrite to track current session progress
- Update the comprehensive plan when phases are completed
- Commit changes with descriptive messages including phase completion status

### 📊 Current Platform Architecture

**Completed Features**:
- ✅ Authentication system with NextAuth.js
- ✅ Database schema design (Prisma)
- ✅ User roles: Admin, Teacher, Parent, Student
- ✅ Login/signup modals with role selection
- ✅ Header integration with auth status
- ✅ 5-subject catalog system (Math, Science, English, History, Interdisciplinary)

**In Progress**: Database connection and user registration flow
**Next Up**: Frontend adventure preview system

### 🔄 Development Commands

```bash
# Start development server
cd learning-adventures-app
npm run dev

# Database operations (when DB is connected)
npx prisma generate
npx prisma db push
npx prisma studio

# Type checking and linting
npm run lint
npm run type-check
```

---

## Game/Lesson Creation Workflow

When creating new games or lessons for this platform, follow this specific workflow:

### 📋 Step-by-Step Process
1. **Review content in `games` folder** - Check existing game ideas and patterns
2. **Review content in `interactive-learning` folder** - Check existing lesson ideas and patterns
3. **Review prompts in `final-content/` folders** - Use established prompt templates
4. **Look at README files** - Understand project structure and requirements
5. **Create the games/lessons** - Build HTML files following existing patterns
6. **Upload to the app** - Place files in correct directories
7. **Host on the catalogue page** - Update catalog data with metadata

### 📁 Directory Structure
```
learning-adventures-platform/
├── games/                          # Game ideas and concepts
├── interactive-learning/           # Lesson ideas and concepts
├── final-content/                  # Prompt templates and finished content
│   ├── interactive-game-prompts.txt
│   ├── interactive-learning-prompts.txt
│   ├── finished-games/
│   └── finished-lessons/
└── learning-adventures-app/        # Main Next.js application
    ├── public/
    │   ├── games/                  # HTML game files
    │   └── lessons/                # HTML lesson files
    └── lib/catalogData.ts          # Catalog metadata
```

### 🎯 File Locations for New Content
- **Lessons**: `/learning-adventures-app/public/lessons/[lesson-name].html`
- **Games**: `/learning-adventures-app/public/games/[game-name].html`
- **Catalog Updates**: `/learning-adventures-app/lib/catalogData.ts`

### 🔄 Integration Process
1. Create HTML files in appropriate public directories
2. Add metadata to `catalogData.ts` in the corresponding arrays:
   - Science lessons: `scienceLessons` array
   - Science games: `scienceGames` array
   - Math lessons: `mathLessons` array
   - Math games: `mathGames` array
3. Include required metadata fields:
   - `id`, `title`, `description`, `type`, `category`
   - `gradeLevel`, `difficulty`, `skills`, `estimatedTime`
   - `featured` (boolean), `htmlPath` (for clickable items)

### ✅ Testing Checklist
- [ ] Files accessible at correct URLs
- [ ] Catalog page shows updated count
- [ ] New items appear in featured section (if featured: true)
- [ ] HTML files load and function properly
- [ ] Metadata displays correctly in catalog

### 🎨 Design Patterns to Follow
- Single HTML files with embedded CSS and JavaScript
- Child-friendly, colorful interfaces
- Interactive elements with immediate feedback
- Progress tracking and educational objectives
- Mobile-responsive design
- Accessibility considerations

### 🧪 Development Commands
```bash
# Start development server
cd learning-adventures-app
npm run dev

# Test specific lesson/game
curl http://localhost:3000/lessons/[lesson-name].html
curl http://localhost:3000/games/[game-name].html

# Check catalog integration
curl http://localhost:3000/catalog
```

## 📝 Content Creation Guidelines

### For Interactive Lessons:
- Use educational best practices with scaffolded learning
- Include multiple learning modalities (visual, auditory, kinesthetic)
- Provide immediate feedback and progress tracking
- Follow the lesson prompt template in `final-content/interactive-learning-prompts.txt`

### For Educational Games:
- Balance 70% entertainment with 30% obvious learning
- Include progressive difficulty and achievable challenges
- Provide meaningful choices that affect learning outcomes
- Follow the game prompt template in `final-content/interactive-game-prompts.txt`

---

**Last Updated**: September 2024
**Total Adventures**: 85+ games and lessons across 5 categories
**Development Status**: Phase 1A Complete - Authentication Infrastructure Implemented
**Platform Features**: NextAuth.js, Prisma Schema, User Roles, Modal System, 5-Subject Catalog
- Always check the comprehensive_platform_plan to see which phase we last worked on from previous sessions.