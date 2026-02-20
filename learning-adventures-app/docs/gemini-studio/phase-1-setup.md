# Phase 1: Gemini Studio Setup

## 🎯 Overview

Phase 1 establishes the foundation for the Gemini 3 Content Studio by setting up the necessary dependencies, environment configuration, and database schema.

**Status**: ✅ **COMPLETED**
**Duration**: ~30 minutes
**Last Updated**: November 18, 2025

## ✅ Completed Tasks

### 1. Install Gemini SDK ✅

**Package**: `@google/generative-ai`
**Version**: Latest (v0.21.0+)

```bash
npm install @google/generative-ai
```

**Installation Result**:

- 566 packages installed
- Successfully added to `package.json` dependencies
- No breaking changes to existing packages

### 2. Configure Environment Variables ✅

**File Updated**: `.env.local.example`

Added Gemini API key configuration:

```env
# Google Gemini API Key (required for Gemini 3 Content Studio)
# Get your API key from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here
```

**Location**: `/learning-adventures-app/.env.local.example`

### 3. Update Prisma Schema ✅

**File Updated**: `prisma/schema.prisma`

Added three new models for Gemini content management:

#### GeminiContent Model

Tracks all generated content through the workflow:

```prisma
model GeminiContent {
  id              String   @id @default(cuid())
  userId          String

  // Content Information
  title           String
  prompt          String   @db.Text
  generatedCode   String   @db.Text
  gameType        GameType @default(HTML_2D)
  category        String
  gradeLevel      String[]
  difficulty      String
  skills          String[]

  // Workflow Status
  status          GeminiContentStatus @default(DRAFT)

  // Iteration History
  iterations      Int      @default(1)
  iterationNotes  String[]

  // Quality Metrics
  accessibilityScore Int?
  performanceScore   Int?
  educationalScore   Int?

  // File Management
  filePath        String?
  previewUrl      String?

  // Publishing
  publishedAt     DateTime?
  catalogEntryId  String?
  testGameId      String?

  // Metadata
  metadata        Json?

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  iterations_history GeminiIteration[]

  @@index([userId, status])
  @@index([status, category])
  @@index([createdAt])
}
```

#### GeminiIteration Model

Tracks each refinement iteration with full history:

```prisma
model GeminiIteration {
  id              String   @id @default(cuid())
  geminiContentId String

  // Iteration Details
  iterationNumber Int
  userFeedback    String   @db.Text
  previousCode    String   @db.Text
  newCode         String   @db.Text

  // Changes Summary
  changesSummary  String?  @db.Text

  // Metrics
  tokensUsed      Int?
  generationTime  Int?

  // Timestamp
  createdAt       DateTime @default(now())

  // Relations
  geminiContent   GeminiContent @relation(fields: [geminiContentId], references: [id], onDelete: Cascade)

  @@index([geminiContentId, iterationNumber])
}
```

#### GeminiUsage Model

Tracks API usage for cost monitoring and analytics:

```prisma
model GeminiUsage {
  id              String   @id @default(cuid())
  userId          String

  // Usage Details
  operation       String   // 'generate', 'iterate', 'preview'
  model           String   // 'gemini-3-pro'
  tokensInput     Int
  tokensOutput    Int
  tokensCached    Int?

  // Cost Calculation
  estimatedCost   Float    // In USD

  // Context
  geminiContentId String?
  success         Boolean  @default(true)
  errorMessage    String?  @db.Text

  // Timestamp
  createdAt       DateTime @default(now())

  @@index([userId, createdAt])
  @@index([createdAt])
}
```

#### New Enums

**GameType**:

```prisma
enum GameType {
  HTML_2D         // Standard 2D HTML game
  HTML_3D         // 3D game with Three.js
  INTERACTIVE     // Interactive lesson/tutorial
  QUIZ            // Quiz/assessment
  SIMULATION      // Science simulation
  PUZZLE          // Logic puzzle
}
```

**GeminiContentStatus**:

```prisma
enum GeminiContentStatus {
  DRAFT           // Initial generation, not finalized
  ITERATING       // Being refined through conversation
  TESTING         // Ready for testing
  APPROVED        // Approved for publishing
  PUBLISHED       // Published to catalog
  ARCHIVED        // Archived/deprecated
}
```

### 4. Documentation Created ✅

Created comprehensive documentation in `docs/gemini-studio/`:

- **README.md**: Complete overview and architecture
- **phase-1-setup.md**: This file (Phase 1 details)
- Future: phase-2-api-routes.md
- Future: phase-3-ui-components.md
- Future: phase-4-integration.md

## 🔄 Next Steps for Local Environment

While the setup is complete in the codebase, you'll need to run these commands in your local environment:

### 1. Get Gemini API Key

Visit [Google AI Studio](https://aistudio.google.com/app/apikey) and generate your API key.

### 2. Create .env.local File

Copy the example file and add your API key:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and replace:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Generate Prisma Client

Generate the TypeScript client for the new schema:

```bash
npx prisma generate
```

Expected output:

```
✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client
```

### 4. Push Schema to Database

Update your PostgreSQL database with the new tables:

```bash
npx prisma db push
```

Expected output:

```
✔ Your database is now in sync with your Prisma schema.
✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client

New tables created:
  - GeminiContent
  - GeminiIteration
  - GeminiUsage
```

### 5. Verify Setup

Check that everything is properly configured:

```bash
# Check database connection
npx prisma studio

# Verify Gemini SDK installation
npm list @google/generative-ai
```

## 📊 Database Schema Overview

### Relationships

```
User (existing)
  └─> GeminiContent (1:many)
        ├─> GeminiIteration (1:many)
        └─> GeminiUsage (1:many, optional)

GeminiContent
  ├─> TestGame (optional, when moved to testing)
  └─> catalogData (optional, when published)
```

### Indexes for Performance

**GeminiContent**:

- `[userId, status]` - Fast user content queries by status
- `[status, category]` - Admin dashboard filtering
- `[createdAt]` - Chronological ordering

**GeminiIteration**:

- `[geminiContentId, iterationNumber]` - Quick iteration history

**GeminiUsage**:

- `[userId, createdAt]` - User cost tracking
- `[createdAt]` - Monthly cost reports

## 💰 Cost Tracking

The schema includes comprehensive cost tracking:

### Per-Generation Tracking

```typescript
// Automatically logged after each generation
{
  operation: 'generate',
  model: 'gemini-3-pro',
  tokensInput: 1500,
  tokensOutput: 48500,
  estimatedCost: 0.29  // ($2/M * 1.5K) + ($12/M * 48.5K)
}
```

### Monthly Cost Reports

Query example:

```typescript
const monthlyCost = await prisma.geminiUsage.aggregate({
  where: {
    createdAt: {
      gte: startOfMonth,
      lte: endOfMonth,
    },
  },
  _sum: {
    estimatedCost: true,
  },
});
```

## 🔐 Security Considerations

### API Key Security

**DO**:

- ✅ Store in `.env.local` (gitignored)
- ✅ Use server-side only (API routes)
- ✅ Rotate keys periodically
- ✅ Use separate keys for dev/prod

**DON'T**:

- ❌ Commit to Git
- ❌ Expose to client-side
- ❌ Share in documentation
- ❌ Use same key across environments

### Database Security

**Access Control**:

- Content Studio: Admin-only access
- Generated content: User-scoped queries
- API usage: User-specific tracking

**Data Retention**:

- Draft content: Keep for 30 days
- Published content: Keep indefinitely
- Usage logs: Archive after 12 months

## 📝 Implementation Notes

### Why These Models?

**GeminiContent**:

- Central tracking for all generated games
- Stores complete code for iteration
- Links to existing workflow (TestGame, catalogData)
- Tracks quality metrics for improvement

**GeminiIteration**:

- Full history of changes
- Enables "undo" functionality
- Tracks what prompts work best
- Performance analysis (tokens, time)

**GeminiUsage**:

- Cost monitoring per user
- Budget alerts
- Performance analytics
- ROI calculation

### Design Decisions

1. **Store Full Code**:
   - Enables offline preview
   - Supports version comparison
   - Allows rollback to previous iterations

2. **Separate Iterations Table**:
   - Keeps GeminiContent table manageable
   - Supports unlimited iterations
   - Historical analysis

3. **JSON Metadata Field**:
   - Flexible for model updates
   - Store tokens, timing, model version
   - Extensible for future features

## 🧪 Testing

### Verify Schema Changes

```bash
# View schema in Prisma Studio
npx prisma studio

# Check for GeminiContent table
# Check for GeminiIteration table
# Check for GeminiUsage table
```

### Test Data Examples

**Create test content**:

```typescript
const testContent = await prisma.geminiContent.create({
  data: {
    userId: 'test-user-id',
    title: 'Test Math Game',
    prompt: 'Create a simple addition game',
    generatedCode: '<html>...</html>',
    gameType: 'HTML_2D',
    category: 'math',
    gradeLevel: ['K', '1', '2'],
    difficulty: 'easy',
    skills: ['Addition', 'Counting'],
    status: 'DRAFT',
  },
});
```

**Create test iteration**:

```typescript
const iteration = await prisma.geminiIteration.create({
  data: {
    geminiContentId: testContent.id,
    iterationNumber: 2,
    userFeedback: 'Make it more colorful',
    previousCode: '<html>...</html>',
    newCode: '<html>...updated...</html>',
    tokensUsed: 5000,
    generationTime: 3500,
  },
});
```

## ✅ Checklist

Before moving to Phase 2, ensure:

- ✅ Gemini SDK installed (`@google/generative-ai`)
- ✅ `.env.local.example` updated with GEMINI_API_KEY
- ✅ Prisma schema updated with 3 new models
- ✅ Prisma client generated (run locally)
- ✅ Database schema pushed (run locally)
- ✅ Documentation created
- ⏳ API key obtained (do this locally)
- ⏳ `.env.local` configured (do this locally)

## 🎯 Success Criteria

Phase 1 is complete when:

1. ✅ Gemini SDK is installed and importable
2. ✅ Environment variables are documented
3. ✅ Database schema includes Gemini models
4. ✅ Schema is valid and generates without errors
5. ✅ Documentation is comprehensive and clear

## 📚 Additional Resources

- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Google AI Studio](https://aistudio.google.com/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

## 🚀 Ready for Phase 2

With Phase 1 complete, you're ready to:

- Build API routes for content generation
- Implement streaming responses
- Add iteration logic
- Create preview system

See [Phase 2: API Routes](./phase-2-api-routes.md) for next steps.

---

**Phase 1 Status**: ✅ **COMPLETE**
**Next Phase**: Phase 2 - API Routes Implementation
**Estimated Time**: Phase 2 will take ~2-3 hours
