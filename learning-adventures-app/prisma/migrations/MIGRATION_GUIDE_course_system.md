# Database Migration - Course System

## Overview
This migration adds the complete Course System to the Learning Adventures platform.

## New Models Added
1. **Course** - Course definitions with metadata
2. **CourseLesson** - Individual lessons within courses
3. **CourseEnrollment** - User's course progress
4. **CourseLessonProgress** - Progress tracking per lesson
5. **DailyXP** - Daily XP accumulation tracking
6. **UserLevel** - User level and streak system

## New Enums
- `Difficulty` (BEGINNER, INTERMEDIATE, ADVANCED)
- `LessonType` (VIDEO, INTERACTIVE, GAME, QUIZ, READING, PROJECT)
- `CourseStatus` (NOT_STARTED, IN_PROGRESS, COMPLETED)
- `LessonProgressStatus` (NOT_STARTED, IN_PROGRESS, COMPLETED, LOCKED)

## Migration Commands

### Development (Local)
```bash
cd learning-adventures-app

# Push schema changes to database
npx prisma db push

# Or create a migration
npx prisma migrate dev --name add_course_system

# Generate Prisma client
npx prisma generate

# Run seed data
npm run db:seed
```

### Production
```bash
# Run migration
npx prisma migrate deploy

# Seed production data (if needed)
npm run db:seed:production
```

## Post-Migration Steps

1. **Verify tables created:**
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name LIKE 'Course%';
   ```

2. **Check sample courses seeded:**
   ```sql
   SELECT id, title, subject, "isPremium" FROM "Course";
   ```

3. **Verify User relations:**
   ```sql
   SELECT id, email FROM "User" LIMIT 1;
   -- Should work without errors (relations added)
   ```

## Rollback (if needed)

```bash
# Revert migration
npx prisma migrate resolve --rolled-back add_course_system

# Or manually drop tables
```

```sql
DROP TABLE IF EXISTS "CourseLessonProgress" CASCADE;
DROP TABLE IF EXISTS "CourseLesson" CASCADE;
DROP TABLE IF EXISTS "CourseEnrollment" CASCADE;
DROP TABLE IF EXISTS "Course" CASCADE;
DROP TABLE IF EXISTS "DailyXP" CASCADE;
DROP TABLE IF EXISTS "UserLevel" CASCADE;

DROP TYPE IF EXISTS "Difficulty";
DROP TYPE IF EXISTS "LessonType";
DROP TYPE IF EXISTS "CourseStatus";
DROP TYPE IF EXISTS "LessonProgressStatus";
```

## Data Validation

After migration, verify:
- [ ] All tables created successfully
- [ ] Indexes created on key fields
- [ ] Foreign key constraints work
- [ ] Enum types created
- [ ] Sample courses can be queried
- [ ] User relations intact

## Notes

- **Breaking Changes**: None - this is additive only
- **Data Loss Risk**: None - existing data unaffected
- **Downtime Required**: No
- **Index Creation**: May take a few seconds on large User tables

## Seeded Data

The migration includes seed data for:
- 3 sample courses (Multiplication Mastery, Fractions Foundations, Science Lab Basics)
- 25+ lessons across all courses
- Ready for testing enrollment and progress tracking
