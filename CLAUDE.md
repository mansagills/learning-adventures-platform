# Learning Adventures Platform - Claude Instructions

## 🚀 Platform Development Sessions

### Current Development Status

**Active Development Plan**: COMPREHENSIVE_PLATFORM_PLAN.md
**Current Phase**: Plan 2 - Frontend Adventure Preview System
**Last Completed**: Phase 2C - Advanced Preview Features (Partial) ✅
**Next Phase**: Phase 2C - Completion (content rotation, save for later, social sharing)
**Current Focus**: Continue Learning section, progress indicators, authentication gating

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
- ✅ PostgreSQL database (local installation via Homebrew)
- ✅ User roles: Admin, Teacher, Parent, Student
- ✅ Login/signup modals with role selection
- ✅ Header integration with auth status
- ✅ UserMenu dropdown with profile access
- ✅ ProtectedRoute HOC for authenticated pages
- ✅ ProfileSettings component with preferences management
- ✅ Profile page with comprehensive user information
- ✅ RoleGuard and PermissionProvider for role-based access control
- ✅ AdminPanel navigation and TeacherDashboard routes
- ✅ User progress tracking with API routes and hooks
- ✅ Achievement system with automatic badge awarding
- ✅ Progress indicators (linear & circular) and stats dashboard
- ✅ User dashboard with progress overview and recent activity
- ✅ 5-subject catalog system (Math, Science, English, History, Interdisciplinary)
- ✅ Adventure preview system with horizontal scrolling cards
- ✅ Subject-specific preview sections with featured content
- ✅ Homepage integration with loading states and error handling
- ✅ Authentication gating (3 adventures for unauthenticated, 5 for authenticated)
- ✅ Continue Learning section for in-progress adventures
- ✅ Progress indicators on adventure preview cards
- ✅ Smart loading states to prevent skeleton flash
- ✅ Intersection Observer animations for preview sections
- ✅ Touch-friendly scrolling for mobile devices

**In Progress**: Complete remaining Phase 2C features (content rotation, save for later, social sharing)
**Next Up**: Admin panel and content management system

### 🔄 Development Commands

```bash
# Start development server
cd learning-adventures-app
npm run dev

# Database operations
npx prisma generate
npx prisma db push
npx prisma studio
npm run db:seed  # Seed test users and sample data

# PostgreSQL management (if installed via Homebrew)
brew services start postgresql@14
brew services stop postgresql@14
brew services restart postgresql@14

# Type checking and linting
npm run lint
npm run type-check
```

### 🗄️ Database Configuration

**Local PostgreSQL Setup**:
- Database: `template1` (default PostgreSQL database)
- Username: `mansagills` (system username)
- Connection: `postgresql://mansagills@localhost:5432/template1?sslmode=disable`
- Environment files: `.env` and `.env.local` (must have matching DATABASE_URL)

**Test Credentials** (created by seed script):
- Student: `student@test.com` / `password123`
- Teacher: `teacher@test.com` / `password123`
- Parent: `parent@test.com` / `password123`
- Admin: `admin@test.com` / `password123`

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

**Last Updated**: October 2024
**Total Adventures**: 85+ games and lessons across 5 categories
**Development Status**: Phase 2C (Partial) Complete - Advanced Preview Features
**Platform Features**: NextAuth.js, PostgreSQL, Prisma, User Roles, Permission System, Progress Tracking, Achievement System, Continue Learning Section, Authentication Gating, Preview Components with Progress Indicators
**Database**: PostgreSQL 14 (local via Homebrew)
- Always check the comprehensive_platform_plan to see which phase we last worked on from previous sessions.