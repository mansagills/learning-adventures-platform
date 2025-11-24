# Quick Setup: Populate Test Games Database

## 🚀 Run This on Your Local Machine

You have 19 test games ready to be added to your testing dashboard. Here's how to populate them:

### Step 1: Navigate to Your Project
```bash
cd learning-adventures-platform/learning-adventures-app
```

### Step 2: Install Dependencies (if not done)
```bash
npm install
```

### Step 3: Generate Prisma Client
```bash
npx prisma generate
```

### Step 4: Run the Seed Script
```bash
npm run db:seed:test-games
```

## ✅ What This Does

The seed script will:
1. Create **3 admin users** for your team
2. Add **19 test games** to the TestGame database:
   - 16 Math games
   - 3 Science games
   - 18 HTML games
   - 1 React component game

### Admin Credentials Created:
```
Email: admin1@learningadventures.org
Password: admin123

Email: admin2@learningadventures.org
Password: admin123

Email: admin3@learningadventures.org
Password: admin123
```

**⚠️ IMPORTANT: Change these passwords in production!**

## 🎮 Games Added:

### Math Games (16):
1. Number Monster Feeding - K-3, Easy
2. Treasure Hunt Calculator - 2-5, Medium
3. Pizza Fraction Frenzy - 3-5, Medium
4. Multiplication Bingo Bonanza - 3-5, Medium
5. Shape Sorting Arcade - K-4, Easy
6. Math Jeopardy Junior - 2-5, Medium
7. Number Line Ninja - 1-4, Easy
8. Equation Balance Scale - 3-6, Medium
9. Math Memory Match - 1-4, Easy
10. Counting Carnival - K-2, Easy
11. Geometry Builder Challenge - 2-5, Medium
12. Money Market Madness - 2-4, Medium
13. Time Attack Clock - 1-3, Easy
14. Math Race Rally - 2-5, Medium
15. Multiplication Space Quest - 3-4, Medium
16. Math Adventure Island - 2-4, Easy

### Science Games (3):
1. Solar System Explorer - 3-6, Medium
2. Ocean Conservation Heroes - 3-6, Medium
3. Ecosystem Builder (React) - 3-6, Medium

## 📊 After Running the Script

You should see output like:
```
🌱 Starting seed for test games and admin users...

👥 Creating admin users...
  ✅ Created admin: admin1@learningadventures.org
  ✅ Created admin: admin2@learningadventures.org
  ✅ Created admin: admin3@learningadventures.org

🎮 Adding test games...
  ✅ Added: Number Monster Feeding
  ✅ Added: Treasure Hunt Calculator
  ... (17 more games)

✨ Seed completed!

📊 Summary:
   - Admin users: 3
   - Test games: 19
   - HTML games: 18
   - React component games: 1

🔐 Admin Login Credentials:
   Email: admin1@learningadventures.org (or admin2/admin3)
   Password: admin123 (CHANGE THIS IN PRODUCTION!)

🎮 Access test games at:
   - Local: http://localhost:3000/internal/testing
   - Production: https://app.learningadventures.org/internal/testing
```

## 🧪 Verify It Worked

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Log in as admin:
   ```
   Email: admin1@learningadventures.org
   Password: admin123
   ```

3. Navigate to Testing Dashboard:
   ```
   http://localhost:3000/internal/testing
   ```

4. You should see **19 games** with status "NOT_TESTED"

## 🐛 Troubleshooting

### If you see "Already exists" for some games:
This is normal - it means those games are already in your database. The script skips duplicates.

### If Prisma generate fails:
```bash
# Try with environment variable
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
```

### If database connection fails:
1. Check PostgreSQL is running:
   ```bash
   brew services list | grep postgresql
   ```

2. Start it if needed:
   ```bash
   brew services start postgresql@14
   ```

3. Verify connection string in `.env`:
   ```
   DATABASE_URL="postgresql://mansagills@localhost:5432/template1?sslmode=disable"
   ```

### If you want to start fresh:
```bash
# This will reset the database (WARNING: deletes all data)
npm run db:reset
```

## 🔄 Re-running the Script

The script is safe to run multiple times. It will:
- Skip admin users that already exist
- Skip test games that already exist
- Only add new entries

## 📝 Next Steps After Seeding

1. **Review games in testing dashboard**
2. **Update status** from "NOT_TESTED" to "IN_TESTING"
3. **Test each game** by clicking "Preview Game"
4. **Provide feedback** using the feedback system
5. **Approve games** using the quality checklist
6. **Promote to catalog** once approved

---

## 🎯 Quick Start Commands

```bash
# Full setup (one-time)
cd learning-adventures-platform/learning-adventures-app
npm install
npx prisma generate
npm run db:seed:test-games

# Start server
npm run dev

# Log in and navigate to:
# http://localhost:3000/internal/testing
```

That's it! Your testing dashboard should now have all 19 games ready for review.
