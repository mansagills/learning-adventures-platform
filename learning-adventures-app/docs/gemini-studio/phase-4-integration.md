# Phase 4: Integration & Testing

## 🎯 Overview

Phase 4 completes the Gemini 3 Content Studio by integrating all components with the existing platform, adding final polish, and conducting comprehensive testing.

**Status**: 📋 **PLANNED**
**Estimated Duration**: 2-3 hours
**Prerequisites**: Phases 1, 2, and 3 completed

## 🔗 Integration Tasks

### 1. AdminPanel Navigation Integration

Update the admin panel to include Gemini Studio access.

**File**: `components/admin/AdminPanel.tsx`

```typescript
// Update navItems array
const navItems: NavItem[] = [
  {
    label: 'Gemini Studio',
    href: '/internal/studio',
    icon: 'sparkles', // or 'rocket'
    description: 'AI-powered game creation',
  },
  {
    label: 'Content Studio',
    href: '/internal',
    icon: 'upload',
    description: 'Upload and manage games',
  },
  {
    label: 'User Management',
    href: '/internal/users',
    icon: 'users',
    description: 'Manage platform users',
  },
  {
    label: 'Analytics',
    href: '/internal/analytics',
    icon: 'chart',
    description: 'View platform statistics',
  },
  {
    label: 'Content Management',
    href: '/internal/content',
    icon: 'settings',
    description: 'Manage existing content',
  },
];
```

**Update Quick Stats** to show Gemini usage:

```typescript
// Fetch Gemini stats
const [geminiStats, setGeminiStats] = useState({ total: 0, thisMonth: 0 });

useEffect(() => {
  fetch('/api/gemini/stats')
    .then(res => res.json())
    .then(data => setGeminiStats(data));
}, []);

// Add to Quick Stats section
<div className="flex items-center justify-between">
  <span className="text-sm text-ink-600">Gemini Games</span>
  <span className="text-sm font-semibold text-ink-800">{geminiStats.total}</span>
</div>
```

---

### 2. Create Gemini Stats API

**File**: `app/api/gemini/stats/route.ts`

```typescript
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get total Gemini content
  const total = await prisma.geminiContent.count();

  // Get this month's count
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const thisMonth = await prisma.geminiContent.count({
    where: {
      createdAt: {
        gte: startOfMonth
      }
    }
  });

  // Get published count
  const published = await prisma.geminiContent.count({
    where: {
      status: 'PUBLISHED'
    }
  });

  // Get total cost this month
  const monthlyCost = await prisma.geminiUsage.aggregate({
    where: {
      createdAt: {
        gte: startOfMonth
      },
      success: true
    },
    _sum: {
      estimatedCost: true
    }
  });

  return Response.json({
    total,
    thisMonth,
    published,
    monthlyCost: monthlyCost._sum.estimatedCost || 0
  });
}
```

---

### 3. File Management System

Create utility functions for saving games to the file system.

**File**: `lib/fileManager.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export interface SaveGameOptions {
  code: string;
  title: string;
  category: string;
}

export interface SaveGameResult {
  filename: string;
  filePath: string;
  publicPath: string;
}

/**
 * Save generated game code to the public/games directory
 */
export async function saveGameToFile(options: SaveGameOptions): Promise<SaveGameResult> {
  const { code, title, category } = options;

  // Generate unique filename
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const hash = crypto.createHash('md5').update(code).digest('hex').slice(0, 8);
  const filename = `gemini-${category}-${slug}-${hash}`;

  // Define paths
  const publicDir = path.join(process.cwd(), 'public', 'games');
  const filePath = path.join(publicDir, `${filename}.html`);
  const publicPath = `/games/${filename}.html`;

  // Ensure directory exists
  await fs.mkdir(publicDir, { recursive: true });

  // Check if file already exists
  try {
    await fs.access(filePath);
    // File exists, append timestamp
    const timestamp = Date.now();
    const uniqueFilename = `${filename}-${timestamp}`;
    return saveGameToFile({
      ...options,
      title: uniqueFilename
    });
  } catch {
    // File doesn't exist, proceed
  }

  // Write file
  await fs.writeFile(filePath, code, 'utf-8');

  return {
    filename,
    filePath,
    publicPath
  };
}

/**
 * Delete a game file
 */
export async function deleteGameFile(publicPath: string): Promise<void> {
  const filePath = path.join(process.cwd(), 'public', publicPath);
  await fs.unlink(filePath);
}

/**
 * Check if a game file exists
 */
export async function gameFileExists(publicPath: string): Promise<boolean> {
  const filePath = path.join(process.cwd(), 'public', publicPath);
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
```

---

### 4. Update Publish API to Use File Manager

**File**: `app/api/gemini/publish/route.ts`

Update the publish endpoint to use the file manager:

```typescript
import { saveGameToFile } from '@/lib/fileManager';

// In the POST handler...

// Save file using file manager
const savedFile = await saveGameToFile({
  code: content.generatedCode,
  title: metadata.title,
  category: content.category
});

// Update GeminiContent with file path
await prisma.geminiContent.update({
  where: { id: contentId },
  data: {
    filePath: savedFile.publicPath,
    publishedAt: new Date()
  }
});
```

---

### 5. Add Environment Variable Validation

**File**: `lib/env.ts`

```typescript
/**
 * Validate required environment variables
 */
export function validateEnv() {
  const required = [
    'GEMINI_API_KEY',
    'DATABASE_URL',
    'NEXTAUTH_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env.local file.`
    );
  }
}

/**
 * Get Gemini API key with validation
 */
export function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error(
      'GEMINI_API_KEY is not set. ' +
      'Get your API key from https://aistudio.google.com/app/apikey'
    );
  }

  return key;
}
```

**Usage in API routes**:

```typescript
import { getGeminiApiKey } from '@/lib/env';

// In route handler
const apiKey = getGeminiApiKey();
const genAI = new GoogleGenerativeAI(apiKey);
```

---

### 6. Error Logging System

**File**: `lib/logger.ts`

```typescript
import { prisma } from './prisma';

export interface LogEntry {
  level: 'info' | 'warning' | 'error';
  message: string;
  context?: Record<string, any>;
  userId?: string;
}

/**
 * Log application events
 */
export async function log(entry: LogEntry) {
  const { level, message, context, userId } = entry;

  // Console log
  console.log(`[${level.toUpperCase()}]`, message, context || '');

  // In production, you might want to send to external logging service
  // e.g., Sentry, LogRocket, Datadog, etc.

  if (level === 'error') {
    // Track errors in database for admin review
    try {
      await prisma.geminiUsage.create({
        data: {
          userId: userId || 'system',
          operation: 'error',
          model: 'system',
          tokensInput: 0,
          tokensOutput: 0,
          estimatedCost: 0,
          success: false,
          errorMessage: JSON.stringify({ message, context })
        }
      });
    } catch (dbError) {
      console.error('Failed to log error to database:', dbError);
    }
  }
}

/**
 * Log Gemini generation events
 */
export function logGeneration(data: {
  userId: string;
  operation: string;
  success: boolean;
  tokensUsed?: number;
  cost?: number;
  error?: string;
}) {
  return log({
    level: data.success ? 'info' : 'error',
    message: `Gemini ${data.operation} ${data.success ? 'succeeded' : 'failed'}`,
    context: data,
    userId: data.userId
  });
}
```

---

## 🧪 Testing Strategy

### 1. Unit Tests

**File**: `__tests__/gemini/fileManager.test.ts`

```typescript
import { saveGameToFile, gameFileExists, deleteGameFile } from '@/lib/fileManager';

describe('FileManager', () => {
  it('should save game file successfully', async () => {
    const result = await saveGameToFile({
      code: '<html><body>Test</body></html>',
      title: 'Test Game',
      category: 'math'
    });

    expect(result.filename).toMatch(/^gemini-math-test-game-/);
    expect(result.publicPath).toMatch(/^\/games\//);

    // Cleanup
    await deleteGameFile(result.publicPath);
  });

  it('should handle duplicate filenames', async () => {
    // Test duplicate handling logic
  });

  it('should check file existence', async () => {
    // Test file existence check
  });
});
```

### 2. Integration Tests

**File**: `__tests__/gemini/api.test.ts`

```typescript
import { POST as generatePost } from '@/app/api/gemini/generate/route';

describe('Gemini API', () => {
  it('should generate content successfully', async () => {
    const mockRequest = new Request('http://localhost:3000/api/gemini/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Create a simple math game',
        category: 'math',
        gameType: 'HTML_2D',
        gradeLevel: ['K', '1'],
        difficulty: 'easy',
        skills: ['Addition']
      })
    });

    // Mock authentication
    // Mock Gemini API

    const response = await generatePost(mockRequest);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.gameCode).toBeTruthy();
  });
});
```

### 3. E2E Tests

**File**: `e2e/gemini-studio.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Gemini Studio', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/auth/login');
    await page.fill('[name="email"]', 'admin@test.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('should generate a game', async ({ page }) => {
    await page.goto('/internal/studio');

    // Fill prompt
    await page.fill('textarea[placeholder*="Describe"]',
      'Create a simple addition game for kindergarten'
    );

    // Select options
    await page.selectOption('select', 'math');

    // Generate
    await page.click('button:has-text("Generate Game")');

    // Wait for generation
    await page.waitForSelector('iframe[title="Game Preview"]', {
      timeout: 60000
    });

    expect(await page.locator('iframe').count()).toBe(1);
  });

  test('should iterate on generated game', async ({ page }) => {
    // Generate initial game
    // ... (from previous test)

    // Add iteration feedback
    await page.fill('textarea[placeholder*="change"]',
      'Add more colors'
    );

    await page.click('button:has-text("Iterate")');

    // Wait for updated preview
    await page.waitForTimeout(3000);

    expect(await page.locator('text=/Iteration 2/').count()).toBe(1);
  });

  test('should publish to test games', async ({ page }) => {
    // Generate and iterate
    // ... (from previous tests)

    // Fill metadata
    await page.fill('input[placeholder="Game Title"]', 'Test Math Game');
    await page.fill('textarea[placeholder="Description"]',
      'A simple addition game'
    );

    // Publish
    await page.click('button:has-text("Publish to Test Games")');

    // Verify success
    await page.waitForSelector('text=/Published successfully/');
  });
});
```

---

## 📊 Performance Optimization

### 1. Add Response Caching

**File**: `lib/cache.ts`

```typescript
import NodeCache from 'node-cache';

// Cache for 5 minutes
const cache = new NodeCache({ stdTTL: 300 });

export function getCached<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

export function setCached<T>(key: string, value: T, ttl?: number): boolean {
  return cache.set(key, value, ttl);
}

export function deleteCached(key: string): number {
  return cache.del(key);
}
```

### 2. Optimize Database Queries

Add database query optimization:

```typescript
// Use select to fetch only needed fields
const content = await prisma.geminiContent.findMany({
  select: {
    id: true,
    title: true,
    category: true,
    status: true,
    createdAt: true,
    // Don't fetch large 'generatedCode' field
  },
  orderBy: {
    createdAt: 'desc'
  },
  take: 20
});
```

### 3. Implement Request Rate Limiting

**File**: `lib/rateLimit.ts`

```typescript
import { LRUCache } from 'lru-cache';

type RateLimitOptions = {
  interval: number;
  uniqueTokenPerInterval: number;
};

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;

        return isRateLimited ? reject() : resolve();
      }),
  };
}

// Usage in API route
const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500,
});

export async function POST(req: Request) {
  const session = await getServerSession();

  try {
    await limiter.check(10, session.user.id); // 10 requests per minute
  } catch {
    return Response.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    );
  }

  // ... rest of handler
}
```

---

## ✅ Phase 4 Checklist

### Integration
- [ ] Update AdminPanel with Gemini Studio link
- [ ] Add Gemini stats to admin dashboard
- [ ] Create file manager utility
- [ ] Integrate file manager with publish API
- [ ] Add environment variable validation
- [ ] Implement error logging system

### Testing
- [ ] Write unit tests for core functions
- [ ] Write integration tests for API routes
- [ ] Write E2E tests for user workflows
- [ ] Test with various prompt types
- [ ] Test error handling scenarios
- [ ] Test rate limiting

### Performance
- [ ] Add response caching
- [ ] Optimize database queries
- [ ] Implement rate limiting
- [ ] Test with concurrent requests
- [ ] Monitor API response times

### Documentation
- [ ] Update user documentation
- [ ] Document API endpoints
- [ ] Create troubleshooting guide
- [ ] Add code comments

### Polish
- [ ] Review UI/UX feedback
- [ ] Fix any accessibility issues
- [ ] Add loading animations
- [ ] Improve error messages
- [ ] Add success notifications

---

## 🎯 Success Criteria

Phase 4 is complete when:

1. ✅ Gemini Studio is accessible from admin panel
2. ✅ All components integrate seamlessly
3. ✅ File management saves/retrieves games correctly
4. ✅ Error handling covers all edge cases
5. ✅ Rate limiting prevents abuse
6. ✅ Unit tests pass (>80% coverage)
7. ✅ Integration tests pass
8. ✅ E2E tests pass
9. ✅ Performance meets targets (<3s generation)
10. ✅ Documentation is complete

---

## 🚀 Go Live Checklist

Before deploying to production:

- [ ] All 4 phases completed
- [ ] All tests passing
- [ ] Security review completed
- [ ] Performance benchmarks met
- [ ] Documentation reviewed
- [ ] API keys configured (production)
- [ ] Database migrations run
- [ ] Error monitoring setup (Sentry, etc.)
- [ ] Cost monitoring alerts configured
- [ ] User training completed
- [ ] Rollback plan documented

---

## 📊 Post-Launch Monitoring

### Week 1
- Monitor API usage and costs
- Track error rates
- Collect user feedback
- Review generation quality

### Month 1
- Analyze usage patterns
- Optimize based on data
- Plan feature improvements
- Review ROI metrics

### Ongoing
- Monthly cost reports
- Quarterly feature reviews
- Continuous optimization
- User satisfaction surveys

---

**Phase 4 Status**: 📋 **PLANNED**
**Estimated Duration**: 2-3 hours
**Total Project Duration**: 8-12 hours across all phases

---

## 🎉 Congratulations!

With Phase 4 complete, you have a fully functional AI-powered content creation studio integrated into your Learning Adventures platform. You can now create educational games in minutes instead of hours, dramatically accelerating your content production pipeline.

**Next Steps**:
- Train your team on the new system
- Start generating games for your catalog
- Monitor usage and optimize based on data
- Collect feedback and iterate on features
