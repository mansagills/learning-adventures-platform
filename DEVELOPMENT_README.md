# Development Guide - Test Credentials & Database Setup

## 🔐 Test Credentials for Authentication Testing

Once the database is set up and seeded, you can use these test accounts:

### Available Test Accounts

| Role        | Email              | Password      | Name          | Special Features                          |
| ----------- | ------------------ | ------------- | ------------- | ----------------------------------------- |
| **Student** | `student@test.com` | `password123` | Alex Student  | Grade 3, Math/Science/English subjects    |
| **Teacher** | `teacher@test.com` | `password123` | Sarah Teacher | All subjects, classroom management access |
| **Parent**  | `parent@test.com`  | `password123` | Maria Parent  | Child monitoring capabilities             |
| **Admin**   | `admin@test.com`   | `password123` | Jordan Admin  | Full platform administration              |

## 🗄️ Database Setup

### Option 1: Using Prisma Local Database (Recommended for Development)

If you're using the Prisma development database (as indicated by the `prisma+postgres://` connection string in `.env`):

1. **Start Prisma Development Database**:

   ```bash
   npx prisma dev
   ```

2. **Push Schema to Database**:

   ```bash
   npm run db:push
   ```

3. **Seed Test Data**:
   ```bash
   npm run db:seed
   ```

### Option 2: Using External Database

If you want to use a different PostgreSQL database:

1. **Update DATABASE_URL** in `.env` file:

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/learning_adventures"
   ```

2. **Push Schema**:

   ```bash
   npm run db:push
   ```

3. **Seed Test Data**:
   ```bash
   npm run db:seed
   ```

## 🧪 Testing the Authentication Flow

### 1. Sign Up Flow Testing

- Visit `http://localhost:3000`
- Click "Sign Up" button
- Create a new account with any email/password
- Test different user roles (Student, Teacher, Parent)

### 2. Sign In Flow Testing

- Use any of the test credentials above
- Visit `http://localhost:3000`
- Click "Sign In" button
- Enter test credentials

### 3. Role-Specific Feature Testing

**Student Account** (`student@test.com`):

- ✅ Access to dashboard and progress tracking
- ✅ Can view adventures and catalog
- ✅ Grade level specific content
- ✅ Profile settings with grade selection

**Teacher Account** (`teacher@test.com`):

- ✅ All student features plus:
- ✅ "My Classroom" menu item
- ✅ Access to teacher-specific dashboard views
- ✅ All subject categories available

**Parent Account** (`parent@test.com`):

- ✅ Child monitoring dashboard access
- ✅ Progress oversight capabilities
- ✅ Parental control features

**Admin Account** (`admin@test.com`):

- ✅ All features plus:
- ✅ "Content Studio" access (`/internal`)
- ✅ "Analytics" dashboard
- ✅ User management capabilities
- ✅ Full platform administration

## 🛠️ Useful Development Commands

```bash
# Database Management
npm run db:generate    # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:seed       # Populate with test data
npm run db:reset      # Reset database and re-seed
npm run db:studio     # Open Prisma Studio (database GUI)

# Development
npm run dev           # Start development server
npm run build         # Build for production
npm run lint          # Run ESLint
npm run test          # Run tests
```

## 🔧 Troubleshooting

### Database Connection Issues

**Error**: "Can't reach database server"

- **Solution**: Start your PostgreSQL server or run `npx prisma dev` for local development

**Error**: "Table doesn't exist"

- **Solution**: Run `npm run db:push` to create database tables

**Error**: "No test users found"

- **Solution**: Run `npm run db:seed` to create test accounts

### Authentication Issues

**Google OAuth not working**:

- Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`
- Or use email/password authentication with test accounts

**Session not persisting**:

- Check `NEXTAUTH_SECRET` is set in `.env.local`
- Clear browser cookies and try again

## 📈 Sample Data

The seed script creates sample progress data for the student account:

- ✅ Completed: "Fraction Pizza Party" lesson (Math, 95% score)
- 🚧 In Progress: "Solar System Explorer" lesson (Science, 8 min spent)
- ✅ Completed: "Math Treasure Hunt" game (Math, 87% score)

Plus sample achievements:

- 🏆 "Math Explorer" - First math adventure completed
- 🔥 "Learning Streak" - 2 days in a row

This gives you realistic test data to work with when developing dashboard and progress features.

## 🎯 Next Steps

1. Start with the student account to test the basic user experience
2. Try the admin account to test content management features
3. Use the teacher account to test classroom functionality
4. Test the parent account for child monitoring features

Each role demonstrates different aspects of the platform's role-based access control system!
