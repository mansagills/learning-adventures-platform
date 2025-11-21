# Gemini Studio - Quick Start Guide

## 🚀 Getting Started

### Prerequisites

1. **Admin Access**: Only users with ADMIN role can access Gemini Studio
2. **Gemini API Key**: Required for game generation
3. **Database**: PostgreSQL with Prisma schema applied

### Setup

1. **Get Your API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Copy the key

2. **Configure Environment**:
   ```bash
   cd learning-adventures-app

   # Create .env.local if it doesn't exist
   cp .env.local.example .env.local

   # Add your Gemini API key
   echo "GEMINI_API_KEY=your_actual_api_key_here" >> .env.local
   ```

3. **Update Database** (if not already done):
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Access Gemini Studio**:
   - Navigate to `/internal/studio` (or click "Gemini Studio" in Admin Panel)
   - You must be logged in as an ADMIN user

## 🎮 Creating Your First Game

### Step 1: Describe Your Game

1. Use the **natural language textarea** to describe your game idea
2. **Be specific**: Instead of "make a math game", try:
   ```
   Create a 3D space adventure where students pilot a spaceship
   and solve multiplication problems (2-12 tables) to navigate
   through asteroid fields. Include power-ups for streaks and
   celebratory animations for correct answers.
   ```

3. **Or use a template**: Click one of the quick-start templates to get started faster

### Step 2: Configure Settings

- **Subject**: Math, Science, English, History, or Interdisciplinary
- **Game Type**:
  - 2D Interactive Game
  - 3D Simulation (with Three.js)
  - Interactive Lesson
  - Quiz/Assessment
  - Science Simulation
  - Logic Puzzle
- **Grade Level**: Select one or more (K-8)
- **Difficulty**: Easy, Medium, or Hard
- **Learning Skills**: Add tags like "Multiplication", "Critical Thinking", etc.

### Step 3: Generate

1. Click **✨ Generate Game** button
2. Wait 1-3 minutes for generation (progress shown in Live Preview)
3. Preview your game in real-time

## 🔄 Iterating on Your Game

### Make It Better

Once your game is generated, you can improve it:

1. **Use Quick Suggestions**:
   - "Make it 3D with physics"
   - "Add sound effects"
   - "Use more colorful graphics"
   - "Include difficulty levels"
   - And more...

2. **Or Write Custom Feedback**:
   ```
   Add sound effects when students answer correctly,
   make the buttons 50px tall, and include a timer
   that counts down from 60 seconds
   ```

3. Click **🔄 Iterate** and wait for the updated version

### Best Practices for Iteration

✅ **DO**:
- Be specific about what you want changed
- Reference exact measurements ("50px", "20% larger")
- Describe desired behaviors clearly
- Request one type of change at a time for best results

❌ **DON'T**:
- Use vague terms like "make it better" or "improve it"
- Request contradictory changes in one iteration
- Expect it to remember context from several iterations ago

## 📱 Preview Your Game

### Device Switcher

Test your game on different screen sizes:
- **🖥️ Desktop**: Full-width preview
- **📱 Tablet**: 768px width
- **📱 Mobile**: 375px width (iPhone-sized)

### Metrics

Check the generation metrics:
- **Generation Time**: How long it took to create
- **Tokens Used**: API usage (helps estimate costs)
- **Cost**: Estimated cost in USD (~$0.30 per game)

### Open in New Tab

Click the "Open in New Tab" button to test the game in a full browser window.

## 🚀 Publishing Your Game

### Step 1: Add Metadata

- **Title**: Give your game a catchy name
- **Description**: Describe what students will learn (min 20 characters)
- **Estimated Time**: How long it takes to play (e.g., "10-15 mins")
- **Featured**: Check if you want to feature this game

### Step 2: Review Quality Scores

The system automatically analyzes:
- **Accessibility**: WCAG compliance estimate
- **Performance**: Code quality and speed
- **Educational Value**: Learning objective clarity

### Step 3: Choose Destination

**Option A: Test Games** (Recommended)
- Game goes to review queue
- Can be tested before public release
- Creates a TestGame database entry

**Option B: Public Catalog** (Direct)
- Game file is created
- You'll get a catalog entry template
- Requires manual addition to `lib/catalogData.ts`

### Step 4: Publish

Click **🚀 Publish** and your game will be saved to `public/games/` with a unique filename.

## 📊 Understanding Costs

### Pricing (Gemini 1.5 Pro)

- **Input tokens**: $1.25 per 1 million tokens
- **Output tokens**: $5 per 1 million tokens

### Typical Costs

- **Simple 2D game**: ~$0.20 - $0.30
- **Complex 3D game**: ~$0.30 - $0.50
- **Iterations**: ~$0.10 - $0.20 each

### Monthly Budget Example

If you create 100 games per month:
- **Cost**: ~$30/month
- **Time saved**: 200-300 hours (vs manual creation)
- **Value**: $6,000-$9,000 at $30/hour

## 🔍 Viewing Generated Games

### In the Admin Panel

The "Quick Stats" section shows:
- **Gemini Games**: Total number of AI-generated games

### Via API

You can fetch stats programmatically:
```bash
GET /api/gemini/stats
```

Returns:
```json
{
  "total": 5,
  "thisMonth": 3,
  "published": 2,
  "testing": 1,
  "monthlyCost": 1.20,
  "byCategory": [...],
  "byStatus": [...],
  "recentGenerations": [...]
}
```

## 🛠️ Troubleshooting

### "Gemini API key not configured"

**Problem**: You see a 503 error saying API key is missing

**Solution**:
1. Check that `.env.local` exists in `learning-adventures-app/`
2. Verify it contains: `GEMINI_API_KEY=your_actual_key`
3. Restart the dev server: `npm run dev`

### Game Preview Not Loading

**Problem**: Iframe shows blank or error

**Solutions**:
1. Check browser console for CSP errors
2. Try "Open in New Tab" button
3. Verify the generated code is valid HTML
4. Check that preview URL is correct: `/api/gemini/preview/[contentId]`

### Generation Takes Too Long

**Problem**: Generation hangs or times out

**Solutions**:
1. Simplify your prompt (remove unnecessary details)
2. Try a 2D game instead of 3D (faster generation)
3. Check your internet connection
4. Verify API key is valid and has quota remaining

### Iteration Doesn't Change Anything

**Problem**: Game looks the same after iteration

**Solutions**:
1. Be more specific in your feedback
2. Try one change at a time
3. Refresh the preview manually (click device switcher)
4. Check the iteration history to see if it actually changed

## 💡 Tips & Best Practices

### Writing Great Prompts

1. **Be Specific**: Include exact requirements
2. **Set Context**: Mention grade level and learning goals
3. **Provide Examples**: "Like [existing game] but with [feature]"
4. **Mention Constraints**: "Must run in under 3MB", "60 FPS required"

### Optimizing Costs

1. **Start Simple**: Generate basic version first, then iterate
2. **Batch Changes**: Combine multiple small changes into one iteration
3. **Use Templates**: Start with templates to save on initial generation
4. **Preview Before Publishing**: Don't generate multiple versions unnecessarily

### Quality Assurance

1. **Test on Multiple Devices**: Use the device switcher
2. **Check Accessibility**: Review keyboard navigation
3. **Verify Learning Goals**: Ensure educational value is clear
4. **Get Feedback**: Have teachers or students test before publishing

## 📚 Additional Resources

- **Full Documentation**: `docs/gemini-studio/README.md`
- **Phase Guides**: `docs/gemini-studio/phase-*.md`
- **API Documentation**: `docs/gemini-studio/phase-2-api-routes.md`
- **Component Docs**: `docs/gemini-studio/phase-3-ui-components.md`

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the comprehensive documentation
3. Check the browser console for errors
4. Verify your API key and environment setup
5. Ensure you're logged in as an ADMIN user

---

**Version**: 1.0.0
**Last Updated**: November 18, 2025
**Status**: Production Ready (requires API key)
