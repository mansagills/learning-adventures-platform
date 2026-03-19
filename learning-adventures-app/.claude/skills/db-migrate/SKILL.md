---
name: db-migrate
description: Safely runs Prisma database migrations for the Learning Adventures Platform. Validates schema, generates client, pushes changes, and optionally re-seeds test data. Use when you've changed prisma/schema.prisma and need to apply those changes.
disable-model-invocation: true
---

# Database Migration Skill

Safely applies Prisma schema changes with validation before pushing.

## Steps

1. **Validate schema**

   ```bash
   cd learning-adventures-app && npx prisma validate
   ```

   Stop and report errors if validation fails.

2. **Generate Prisma client**

   ```bash
   npx prisma generate
   ```

3. **Push schema changes**

   ```bash
   npx prisma db push
   ```

4. **Ask about seeding**
   Ask the user: "Do you want to re-seed test data? (npm run db:seed)"
   Only run if confirmed.

5. **Verify**
   ```bash
   npx prisma studio
   ```
   Tell the user Prisma Studio is available to verify changes.

## Safety Notes

- Always run `prisma validate` first to catch syntax errors
- `prisma db push` will apply changes to the local PostgreSQL at `postgresql://mansagills@localhost:5432/template1`
- For destructive changes (removing columns/tables), warn the user before pushing
- Never run `prisma db push --force-reset` without explicit user confirmation — it drops all data
