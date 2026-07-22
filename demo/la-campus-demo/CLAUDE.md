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
5. **Create the games/lessons** - Build HTML or React component files
6. **Upload to the app** - Place files in correct directories
7. **Test in isolated environment** - Add to test games list (see Test Games Workflow below)
8. **Quality assurance** - Run comprehensive testing
9. **Publish to catalog** - Update catalog data with metadata when ready for production

### 🧪 Test Games Workflow

**IMPORTANT**: Games can be tested without adding them to the catalog!

**For React Component Games:**
1. Create game in `components/games/[game-name]/`
2. Register in `lib/gameLoader.ts` `initializeGameRegistry()`
3. Add to `docs/test-games.md` with direct URL
4. Test at `http://localhost:3000/games/[game-id]`
5. DO NOT add to `lib/catalogData.ts` until testing is complete

**For HTML Games/Lessons:**
1. Save file to `public/games/` or `public/lessons/`
2. Add to `docs/test-games.md` with direct URL
3. Test at `http://localhost:3000/games/[game-name].html`
4. DO NOT add to `lib/catalogData.ts` until testing is complete

**Key Concept**: Registered ≠ Cataloged
- **Registered**: Game is accessible by URL and can be tested
- **Cataloged**: Game appears in public catalog for all users

**Testing Reference**: See `docs/test-games.md` for complete testing workflow and checklist

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
├── public/
│   ├── games/                  # HTML game files
│   └── lessons/                # HTML lesson files
└── lib/catalogData.ts          # Catalog metadata
```

### 🎯 File Locations for New Content
- **Lessons**: `/public/lessons/[lesson-name].html`
- **Games**: `/public/games/[game-name].html`
- **Catalog Updates**: `/lib/catalogData.ts`

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

**Last Updated**: October 2025
**Total Adventures**: 85+ games and lessons across 5 categories
**Development Status**: Phase 3A Complete - Dashboard Infrastructure Built
**Platform Features**: NextAuth.js, PostgreSQL, Prisma, User Roles, Permission System, Progress Tracking, Achievement System, Continue Learning Section, Authentication Gating, Preview Components with Progress Indicators, Save for Later, Social Sharing, Content Rotation, Dashboard Infrastructure
**Database**: PostgreSQL 14 (local via Homebrew)
- Always check the comprehensive_platform_plan to see which phase we last worked on from previous sessions.

<!-- ROCKETRIDE:BEGIN -->

# RocketRide — AI Pipeline Builder

Use RocketRide when building AI pipelines, document processing, RAG systems, or data integration.

## Documentation

Full docs: `.rocketride/docs/`

**Read the relevant doc(s) before generating any RocketRide code.**

| File                              | Read when...                                                      |
| --------------------------------- | ----------------------------------------------------------------- |
| ROCKETRIDE_README.md              | Starting any RocketRide work — overview + mandatory setup steps   |
| ROCKETRIDE_QUICKSTART.md          | Writing first pipeline — complete working examples (Python & TS)  |
| ROCKETRIDE_PIPELINE_RULES.md      | Defining pipelines — structure, lane wiring, config rules         |
| ROCKETRIDE_COMPONENT_REFERENCE.md | Choosing/configuring components — all providers and config fields |
| ROCKETRIDE_COMMON_MISTAKES.md     | Before finalizing — known pitfalls to avoid                       |
| ROCKETRIDE_python_API.md          | Python SDK — client methods, types, patterns                      |
| ROCKETRIDE_typescript_API.md      | TypeScript SDK — client methods, types, patterns                  |

## Before Writing ANY RocketRide Code

1. Read `.rocketride/docs/ROCKETRIDE_README.md` for mandatory setup requirements
2. Read the relevant API doc (Python or TypeScript) for your language
3. Read `.rocketride/docs/ROCKETRIDE_PIPELINE_RULES.md` + `.rocketride/docs/ROCKETRIDE_COMPONENT_REFERENCE.md`
4. Read `.rocketride/docs/ROCKETRIDE_COMMON_MISTAKES.md` before finalizing
<!-- ROCKETRIDE:END -->
