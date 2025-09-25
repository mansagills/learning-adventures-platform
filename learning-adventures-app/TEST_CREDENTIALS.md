# 🔐 Test Credentials - Quick Reference

## Ready-to-Use Test Accounts

| Role | Email | Password | Name | Features |
|------|-------|----------|------|----------|
| **🎓 Student** | `student@test.com` | `password123` | Alex Student | Grade 3, Progress tracking, Sample achievements |
| **👩‍🏫 Teacher** | `teacher@test.com` | `password123` | Sarah Teacher | Classroom management, All subjects |
| **👨‍👩‍👧‍👦 Parent** | `parent@test.com` | `password123` | Maria Parent | Child monitoring |
| **👩‍💼 Admin** | `admin@test.com` | `password123` | Jordan Admin | Full platform access, Content Studio |

## 🎯 Quick Testing Guide

### 1. Student Experience
- **Login**: `student@test.com` / `password123`
- **Test Features**: Dashboard, progress tracking, adventure previews, profile settings
- **Sample Data**: Has completed adventures and achievements already

### 2. Teacher Experience
- **Login**: `teacher@test.com` / `password123`
- **Test Features**: All student features + "My Classroom" menu item
- **Permissions**: Can access teacher-specific dashboard views

### 3. Parent Experience
- **Login**: `parent@test.com` / `password123`
- **Test Features**: Child monitoring dashboard, progress oversight
- **Permissions**: Parent-level access controls

### 4. Admin Experience
- **Login**: `admin@test.com` / `password123`
- **Test Features**: Everything + Content Studio (`/internal`) + Analytics
- **Permissions**: Full platform administration

## 🚀 How to Test

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Visit**: `http://localhost:3000`

3. **Click "Sign In"** and use any credentials above

4. **Explore role-specific features** in the UserMenu dropdown

## 📊 Sample Data Included

The **Student account** comes pre-loaded with:
- ✅ **Completed**: "Fraction Pizza Party" (Math, 95% score)
- 🚧 **In Progress**: "Solar System Explorer" (Science)
- ✅ **Completed**: "Math Treasure Hunt" (Math, 87% score)
- 🏆 **Achievements**: "Math Explorer", "Learning Streak"

## 🔄 Database Management

```bash
# Reset and re-seed all test data
npm run db:reset

# Just add test accounts (keeps existing data)
npm run db:seed

# View database in browser
npm run db:studio
```

## 📝 Notes

- All passwords are hashed with bcrypt (same as production)
- Database must be running (`npx prisma dev` or external PostgreSQL)
- Test accounts are automatically recreated when seeding
- Sample progress data helps test dashboard features

**Ready to test!** 🎉