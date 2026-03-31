# Gemini 3 Content Studio

## 🎯 Overview

The Gemini 3 Content Studio is an AI-powered content creation tool integrated into the Learning Adventures platform. It leverages Google's Gemini 3 Pro model with "vibe coding" capabilities to enable rapid creation of 2D and 3D educational games through natural language prompts.

### Key Features

- **Natural Language Creation**: Describe games in plain English, get working code
- **2D → 3D Upgrade**: Start with 2D, upgrade to 3D with physics simulation
- **Iterative Refinement**: Conversational improvements in real-time
- **Quality Assurance**: Automatic accessibility, performance, and educational validation
- **Seamless Publishing**: Direct integration with platform catalog
- **Cost-Effective**: ~$0.30 per game generation

### Technology Stack

- **AI Model**: Google Gemini 3 Pro
- **SDK**: `@google/generative-ai` (v0.21.0+)
- **Database**: PostgreSQL (Prisma ORM)
- **Frontend**: Next.js 14 + React + TypeScript
- **Backend**: Next.js API Routes

## 📋 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Content Studio (Admin Panel)                   │
│                                                              │
│  ┌────────────────┐         ┌──────────────────┐          │
│  │  Prompt Input  │────────>│  Gemini 3 API    │          │
│  │  (Natural Lang)│         │  (Vibe Coding)   │          │
│  └────────────────┘         └──────────────────┘          │
│         │                            │                      │
│         ▼                            ▼                      │
│  ┌────────────────────────────────────────┐               │
│  │  Real-time Preview & Iteration         │               │
│  │  - 2D → 3D upgrade                     │               │
│  │  - Physics simulation                  │               │
│  │  - Interactive refinement              │               │
│  └────────────────────────────────────────┘               │
│         │                                                   │
│         ▼                                                   │
│  ┌────────────────────────────────────────┐               │
│  │  Save & Publish to Catalog             │               │
│  └────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

## 🗂️ Database Schema

### GeminiContent Model

Tracks all Gemini-generated content through the workflow:

```prisma
model GeminiContent {
  id              String   @id @default(cuid())
  userId          String
  title           String
  prompt          String   @db.Text
  generatedCode   String   @db.Text
  gameType        GameType @default(HTML_2D)
  category        String
  gradeLevel      String[]
  difficulty      String
  skills          String[]
  status          GeminiContentStatus @default(DRAFT)
  iterations      Int      @default(1)
  iterationNotes  String[]

  // Quality metrics
  accessibilityScore Int?
  performanceScore   Int?
  educationalScore   Int?

  // Publishing
  filePath        String?
  publishedAt     DateTime?
  catalogEntryId  String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  iterations_history GeminiIteration[]
}
```

### GeminiIteration Model

Tracks each refinement iteration:

```prisma
model GeminiIteration {
  id              String   @id @default(cuid())
  geminiContentId String
  iterationNumber Int
  userFeedback    String   @db.Text
  previousCode    String   @db.Text
  newCode         String   @db.Text
  changesSummary  String?  @db.Text
  tokensUsed      Int?
  generationTime  Int?
  createdAt       DateTime @default(now())

  geminiContent   GeminiContent @relation(...)
}
```

### GeminiUsage Model

Tracks API usage for cost monitoring:

```prisma
model GeminiUsage {
  id              String   @id @default(cuid())
  userId          String
  operation       String   // 'generate', 'iterate', 'preview'
  model           String   // 'gemini-3-pro'
  tokensInput     Int
  tokensOutput    Int
  estimatedCost   Float    // In USD
  geminiContentId String?
  success         Boolean  @default(true)
  createdAt       DateTime @default(now())
}
```

## 🔧 API Endpoints

### `/api/gemini/generate`

- **Method**: POST
- **Purpose**: Generate new game from prompt
- **Input**: `{ prompt, context, gameType, category, gradeLevel }`
- **Output**: `{ gameCode, contentId, tokens }`

### `/api/gemini/iterate`

- **Method**: POST
- **Purpose**: Refine existing game
- **Input**: `{ contentId, feedback, existingCode }`
- **Output**: `{ updatedCode, iteration, changes }`

### `/api/gemini/stream`

- **Method**: POST
- **Purpose**: Stream generation in real-time
- **Input**: `{ prompt, options }`
- **Output**: Server-Sent Events stream

### `/api/gemini/preview`

- **Method**: POST
- **Purpose**: Create temporary preview URL
- **Input**: `{ contentId, code }`
- **Output**: `{ previewUrl, expiresIn }`

### `/api/gemini/publish`

- **Method**: POST
- **Purpose**: Publish to catalog
- **Input**: `{ contentId, metadata }`
- **Output**: `{ catalogEntryId, filePath, testGameId }`

## 🎨 UI Components

### Page Components

- **`/app/internal/studio/page.tsx`**: Main Content Studio page
- **`/app/internal/studio/[contentId]/page.tsx`**: Edit existing content

### Core Components

- **`PromptInput`**: Natural language input with templates
- **`LivePreview`**: Real-time game preview with device switcher
- **`IterationControls`**: Refinement feedback interface
- **`PublishWorkflow`**: 3-step publishing process
- **`ContentHistory`**: View all generated content
- **`UsageAnalytics`**: Cost and usage tracking

## 📖 Implementation Phases

### ✅ Phase 1: Environment Setup (Completed)

- ✅ Install Gemini SDK (`@google/generative-ai`)
- ✅ Configure API keys in `.env.local`
- ✅ Update Prisma schema with Gemini models
- ✅ Create documentation

### 🔄 Phase 2: API Routes (In Progress)

- ⏳ Create generation endpoint
- ⏳ Create iteration endpoint
- ⏳ Create streaming endpoint
- ⏳ Create preview endpoint
- ⏳ Create publish endpoint

### 📅 Phase 3: UI Components (Planned)

- 📋 Build main Studio page
- 📋 Create PromptInput component
- 📋 Create LivePreview component
- 📋 Create IterationControls component
- 📋 Create PublishWorkflow component

### 📅 Phase 4: Integration & Testing (Planned)

- 📋 Integrate with AdminPanel navigation
- 📋 Connect to catalog system
- 📋 Add file management
- 📋 End-to-end testing
- 📋 Performance optimization

## 🚀 Quick Start Guide

### 1. Get Gemini API Key

Visit [Google AI Studio](https://aistudio.google.com/app/apikey) and generate an API key.

### 2. Configure Environment

Create or update `.env.local`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Update Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Access Content Studio

Navigate to: `http://localhost:3000/internal/studio`

## 📊 Cost Estimation

### Per Game Generation

- **Average tokens**: 50,000 (input + output)
- **Gemini 3 Pro pricing**:
  - Input: $2/million tokens
  - Output: $12/million tokens
- **Estimated cost**: ~$0.30 per game
- **Monthly cost (100 games)**: ~$30

### Comparison to Manual Creation

- **Manual**: 2-3 hours per game
- **Gemini Studio**: 5-10 minutes per game
- **Time saved**: 95%+
- **Cost-effectiveness**: $60-90/hour value

## 🎯 Use Cases

### 1. Rapid Prototyping

```
Prompt: "Create a 2D math game where students solve addition
problems (1-20) by feeding the correct number of apples to a
friendly monster. Use colorful graphics and sound effects."

Output: Complete HTML game in <2 minutes
```

### 2. 2D → 3D Upgrade

```
Initial: 2D multiplication racing game
Iteration: "Make this 3D with realistic physics"
Output: 3D game with Three.js and physics simulation
```

### 3. Science Simulations

```
Prompt: "Create a 3D solar system simulator where students can
explore planets, adjust speed, and see orbital mechanics in action."

Output: Interactive 3D simulation with controls
```

### 4. Subject-Specific Content

```
Prompt: "Build an English vocabulary game for grade 3 students
practicing synonyms and antonyms with visual word cards."

Output: Interactive lesson with educational gameplay
```

## 🔐 Security & Permissions

### Access Control

- **Admin only**: Content Studio access
- **Role-based**: Different permissions for create/publish
- **Audit logging**: Track all generations and publishes

### Content Security

- **Input validation**: Sanitize all user inputs
- **Code scanning**: Validate generated code for safety
- **Sandbox preview**: Isolated preview environment
- **Rate limiting**: Prevent API abuse

## 📈 Monitoring & Analytics

### Tracked Metrics

- Games generated per day/week/month
- Average tokens per generation
- Total API costs
- User adoption rates
- Success vs. failure rate
- Average iteration count
- Time from generation to publish

### Cost Monitoring

- Real-time cost tracking
- User-level cost allocation
- Budget alerts and limits
- Monthly cost reports

## 🔄 Workflow Example

### Complete Game Creation Flow

1. **User opens Content Studio**
   - Selects subject: Math
   - Chooses grade level: 3-5
   - Picks template: Racing Game

2. **Enters natural language prompt**

   ```
   "Create a multiplication racing game where students control
   a race car by solving multiplication problems (2-12 tables).
   The faster they answer correctly, the faster their car goes.
   Include power-ups for streaks."
   ```

3. **Gemini generates initial game**
   - 2D HTML game with embedded CSS/JS
   - ~45 seconds generation time
   - Auto-preview in LivePreview panel

4. **User iterates with feedback**
   - "Add sound effects for correct answers"
   - "Make the car graphics more colorful"
   - "Include a difficulty selector"

5. **Quality checks automatically run**
   - Accessibility score: 98/100
   - Performance score: 95/100
   - Educational value: Confirmed

6. **User publishes**
   - Adds title and description
   - Reviews metadata
   - Publishes to TestGames or directly to catalog

## 🛠️ Troubleshooting

### Common Issues

**API Key Error**

```
Error: Invalid API key
Solution: Check GEMINI_API_KEY in .env.local
```

**Generation Timeout**

```
Error: Request timeout
Solution: Reduce prompt complexity or increase timeout
```

**Preview Not Loading**

```
Error: Preview iframe blocked
Solution: Check sandbox permissions and CORS settings
```

**Database Connection Error**

```
Error: Prisma client not generated
Solution: Run `npx prisma generate`
```

## 📚 Additional Resources

- [Gemini 3 Documentation](https://ai.google.dev/gemini-api/docs)
- [Google AI Studio](https://aistudio.google.com/)
- [Phase 1: Setup Guide](./phase-1-setup.md)
- [Phase 2: API Routes Guide](./phase-2-api-routes.md)
- [Phase 3: UI Components Guide](./phase-3-ui-components.md)
- [Phase 4: Integration Guide](./phase-4-integration.md)

## 🤝 Support

For questions or issues:

- Check the troubleshooting guide above
- Review phase-specific documentation
- Consult the Comprehensive Platform Plan
- Check existing agent documentation in `docs/agents/`

---

**Status**: Phase 1 Complete ✅ | Phase 2 In Progress 🔄
**Last Updated**: November 18, 2025
**Version**: 1.0.0
