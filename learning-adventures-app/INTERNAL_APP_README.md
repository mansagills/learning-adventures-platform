# Content Creation Studio - Internal App

An internal application for teammates to create educational games and interactive learning activities using AI assistance.

## Features

### 🎨 Content Creation Form
- **Content Type Selection**: Choose between educational games or interactive lessons
- **Subject Matter**: Select Math or Science
- **Detailed Inputs**: Title, description, grade levels, difficulty, skills, and more
- **Additional Requirements**: Optional field for specific features or themes

### 🤖 AI-Powered Assistance
- **Claude Integration**: Uses Anthropic's Claude API for content refinement and generation
- **Expert Suggestions**: Get AI-powered recommendations to improve your content ideas
- **Content Generation**: Automatically generates complete HTML files based on your specifications

### 👀 Preview & Testing
- **Live Preview**: See your generated content in an embedded iframe
- **HTML Source View**: Examine the generated code
- **Interactive Testing**: Test functionality before publishing

### 📚 Catalog Integration
- **Automatic Publishing**: Seamlessly adds content to the Learning Adventures catalog
- **Metadata Management**: Automatically updates `catalogData.ts` with proper metadata
- **File Management**: Saves HTML files to the correct public directories

## Setup

### 1. Environment Configuration

1. Copy the environment template:
   ```bash
   cp .env.local.example .env.local
   ```

2. Add your Anthropic API key to `.env.local`:
   ```env
   ANTHROPIC_API_KEY=your_actual_api_key_here
   ```

   Get your API key from: https://console.anthropic.com/

### 2. Development Server

Start the development server:
```bash
npm run dev
```

Access the Content Studio at: http://localhost:3000/internal

## Usage Workflow

### Step 1: Create Content
1. Navigate to `/internal` in your browser
2. Select content type (Game or Lesson)
3. Choose subject (Math or Science)
4. Fill in all required fields:
   - Title and description
   - Main concept being taught
   - Target grade levels
   - Difficulty level
   - Skills taught
   - Estimated time
   - Optional additional requirements

### Step 2: Preview & Refine
1. Click "Generate Content" to create initial version
2. Use "Get AI Refinements" for expert suggestions
3. Apply refinements and regenerate if needed
4. Test the content in the preview frame
5. Review HTML source if necessary

### Step 3: Publish
1. Click "Publish to Catalog" when satisfied
2. Content is automatically:
   - Saved as HTML file in `/public/games/` or `/public/lessons/`
   - Added to the catalog metadata in `lib/catalogData.ts`
   - Made available on the main catalog page

## Content Guidelines

### Educational Games
- Balance 70% entertainment with 30% obvious learning
- Include progressive difficulty and achievable challenges
- Provide immediate feedback and positive reinforcement
- Use engaging themes and storylines

### Interactive Lessons
- Follow scaffolded learning progression
- Include multiple learning modalities (visual, auditory, kinesthetic)
- Provide formative assessment opportunities
- Use clear, age-appropriate language

### Technical Requirements
- Single HTML file with embedded CSS and JavaScript
- No external dependencies
- Mobile-responsive design
- Accessibility compliance (WCAG 2.1 AA)
- File size optimization for quick loading

## File Structure

```
app/internal/
├── page.tsx                    # Main internal app page
├── types.ts                   # TypeScript interfaces
├── components/
│   ├── ContentCreationForm.tsx
│   ├── ContentPreview.tsx
│   └── ContentPublisher.tsx
└── services/
    └── claudeApi.ts           # Claude API integration

app/api/internal/
├── save-content/
│   └── route.ts              # API for saving HTML files
└── update-catalog/
    └── route.ts              # API for updating catalog metadata
```

## API Endpoints

### POST `/api/internal/save-content`
Saves generated HTML content to the public directory.

**Request Body:**
```json
{
  "content": "HTML content string",
  "fileName": "content-name.html",
  "type": "game" | "lesson"
}
```

### POST `/api/internal/update-catalog`
Updates the catalog metadata with new content information.

**Request Body:**
```json
{
  "metadata": {
    "id": "content-id",
    "title": "Content Title",
    "description": "Content description",
    // ... other metadata fields
  }
}
```

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify your API key is correct in `.env.local`
   - Ensure you have credits in your Anthropic account
   - Check that the key has the necessary permissions

2. **Content Generation Fails**
   - Check browser console for error messages
   - Verify all required form fields are filled
   - Try refreshing the page and starting over

3. **Publishing Fails**
   - Ensure the server has write permissions to the public directory
   - Check that the catalog file is not being used by another process
   - Verify the file path structure matches expectations

### Development Notes

- The Claude API calls are made from the client-side for simplicity
- In production, consider moving API calls to server-side for better security
- The catalog update modifies the source file directly - consider using a database in production
- Content is not versioned - consider adding version control for content management

## Security Considerations

- API keys are exposed to the client-side (development only)
- No authentication/authorization implemented
- Direct file system access from API routes
- Consider adding proper security measures for production use

---

**Access**: Navigate to `/internal` from the main application header "Content Studio" link.