# Content Upload Guide

This guide explains how team members can upload games and lessons to the Learning Adventures platform.

## Table of Contents
1. [Access Requirements](#access-requirements)
2. [Accessing the Upload Interface](#accessing-the-upload-interface)
3. [File Requirements](#file-requirements)
4. [Upload Process](#upload-process)
5. [Metadata Guidelines](#metadata-guidelines)
6. [Testing Content](#testing-content)
7. [Publishing Workflow](#publishing-workflow)
8. [Troubleshooting](#troubleshooting)

---

## Access Requirements

### Required Permissions
You need **Admin** access to upload content. Contact the system administrator if you need access.

### Admin Login
1. Navigate to the platform login page
2. Log in with your admin credentials
3. You'll see additional menu options for admin functions

---

## Accessing the Upload Interface

### Navigation
1. Log in with admin credentials
2. Navigate to `/internal` or click **Admin Panel** in the menu
3. Select **Content Upload** from the sidebar

### Interface Overview
The upload interface provides:
- Drag-and-drop file upload zone
- Content type selector (Game/Lesson/Video)
- Metadata editor
- Preview panel
- Publish controls

---

## File Requirements

### Supported File Types

| Content Type | Format | Max Size | Destination |
|-------------|--------|----------|-------------|
| Games | .html | 10 MB | `/public/games/` |
| Lessons | .html | 10 MB | `/public/lessons/` |
| Videos | .mp4 | 100 MB | `/public/videos/` |

### HTML File Requirements

Your HTML file should be **self-contained** with:
- All CSS embedded in `<style>` tags
- All JavaScript embedded in `<script>` tags
- No external dependencies (or use CDN links)
- Responsive design for mobile and desktop

### Required HTML Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Game/Lesson Title</title>
    <meta name="description" content="Brief description of the content">
    <meta name="grade-level" content="K,1,2,3,4,5">
    <meta name="difficulty" content="easy|medium|hard">
    <meta name="skills" content="skill1,skill2,skill3">
    <meta name="estimated-time" content="15-20 mins">
    <style>
        /* All CSS here */
    </style>
</head>
<body>
    <!-- Content here -->
    <script>
        /* All JavaScript here */
    </script>
</body>
</html>
```

### Meta Tag Reference

| Meta Name | Required | Values | Example |
|-----------|----------|--------|---------|
| description | Yes | Text | "Learn fractions with pizza!" |
| grade-level | Yes | K,1,2,3,4,5,6 | "2,3,4" |
| difficulty | Yes | easy, medium, hard | "medium" |
| skills | Recommended | Comma-separated | "Fractions,Math,Problem Solving" |
| estimated-time | Recommended | Time range | "15-20 mins" |

---

## Upload Process

### Step 1: Prepare Your File
1. Ensure your HTML file meets all requirements
2. Test locally in a browser
3. Verify mobile responsiveness
4. Check all interactive elements work

### Step 2: Upload File
1. Navigate to **Content Upload**
2. Select content type: **Game** or **Lesson**
3. Drag and drop your file OR click to browse
4. Wait for upload to complete

### Step 3: Review Metadata
The system automatically extracts metadata from your HTML. Review and edit:
- **Title** - Clear, engaging title
- **Description** - 1-2 sentence description
- **Category** - math, science, english, history, interdisciplinary
- **Grade Level** - Target grades (K-5)
- **Difficulty** - easy, medium, or hard
- **Skills** - Learning skills covered
- **Estimated Time** - Expected completion time

### Step 4: Preview
Click **Preview** to see how your content will appear:
- In the catalog listing
- On the content detail page
- In the player/viewer

### Step 5: Publish or Save Draft
- **Save Draft** - Save without publishing (content not visible to users)
- **Publish** - Make content immediately available to users

---

## Metadata Guidelines

### Writing Effective Titles
- Keep titles under 50 characters
- Use action words when possible
- Make it engaging and descriptive

**Good Examples:**
- "Fraction Pizza Party"
- "Ocean Conservation Heroes"
- "Ancient Egypt Explorer"

**Avoid:**
- "Math Game 1"
- "Untitled Lesson"
- Very long titles

### Writing Descriptions
- 1-2 sentences maximum
- Highlight the learning objective
- Mention what makes it fun

**Good Example:**
> "Slice virtual pizzas to learn fractions while running your own pizzeria! Compare, add, and order fractions in this delicious math adventure."

### Selecting Categories

| Category | Use For |
|----------|---------|
| math | Numbers, operations, geometry, measurement |
| science | Biology, chemistry, physics, earth science |
| english | Reading, writing, spelling, grammar |
| history | Historical events, cultures, geography |
| interdisciplinary | Cross-subject content |

### Choosing Difficulty

| Level | Description | Target |
|-------|-------------|--------|
| Easy | Basic concepts, simple interactions | K-2, beginners |
| Medium | Moderate challenge, multiple concepts | 2-4, some experience |
| Hard | Complex problems, advanced concepts | 4-5, experienced |

---

## Testing Content

### Pre-Upload Testing Checklist

- [ ] Opens correctly in Chrome, Firefox, Safari
- [ ] Works on mobile devices (touch-friendly)
- [ ] All buttons and interactions function
- [ ] No JavaScript console errors
- [ ] Text is readable at all sizes
- [ ] Instructions are clear
- [ ] Progress saves correctly (if applicable)
- [ ] Audio works (if applicable)
- [ ] No broken images or resources

### Post-Upload Testing

After uploading, verify:
1. Content appears in catalog (if published)
2. Filters work correctly (category, grade, difficulty)
3. Content loads when clicked
4. Preview card shows correct information
5. Full-screen mode works

### Testing Without Publishing

To test content without making it public:
1. Upload and **Save as Draft**
2. Access via direct URL: `/games/[filename].html` or `/lessons/[filename].html`
3. Use the **Test Games** workflow (see `docs/test-games.md`)

---

## Publishing Workflow

### Standard Workflow
```
1. Upload File
2. Edit Metadata
3. Save Draft
4. Internal Review
5. QA Testing
6. Publish
```

### Quick Publish (for urgent content)
```
1. Upload File
2. Verify Metadata
3. Publish Immediately
```

### Content Review Checklist

Before publishing, ensure:
- [ ] Educational content is accurate
- [ ] Age-appropriate for target grade levels
- [ ] No spelling or grammatical errors
- [ ] Accessibility considerations met
- [ ] Thumbnail/preview image looks good
- [ ] Works on all supported devices

---

## Batch Uploads

### ZIP File Upload
For uploading multiple files:
1. Create a ZIP file containing HTML files
2. Navigate to **Content Upload** > **Batch Upload**
3. Upload the ZIP file
4. Review each extracted file's metadata
5. Publish all or select individual items

### ZIP File Structure
```
my-games.zip
├── game1.html
├── game2.html
└── game3.html
```

---

## Troubleshooting

### Upload Fails

**Possible Causes:**
- File too large (check size limits)
- Invalid file format
- Network timeout

**Solutions:**
1. Compress file if too large
2. Ensure file is valid HTML
3. Try uploading again
4. Check network connection

### Metadata Not Extracting

**Possible Causes:**
- Missing meta tags in HTML
- Malformed HTML structure

**Solutions:**
1. Add required meta tags
2. Validate HTML structure
3. Manually enter metadata

### Content Not Appearing in Catalog

**Possible Causes:**
- Content saved as draft (not published)
- Missing required metadata
- Cache needs refresh

**Solutions:**
1. Check publish status
2. Complete all required fields
3. Clear browser cache
4. Wait a few minutes for cache refresh

### Content Broken After Upload

**Possible Causes:**
- External resource links not accessible
- JavaScript errors
- CSS not loading

**Solutions:**
1. Embed all resources directly in HTML
2. Check browser console for errors
3. Verify CDN links are valid

---

## API Reference (Advanced)

### Upload Endpoint
```
POST /api/internal/content-upload
Content-Type: multipart/form-data

Parameters:
- file: The HTML/video file
- type: "game" | "lesson" | "video"
- metadata: JSON object with content details
```

### List Uploaded Content
```
GET /api/internal/content-upload/list
Authorization: Bearer {admin-token}
```

### Batch Upload
```
POST /api/internal/upload-zip
Content-Type: multipart/form-data

Parameters:
- file: ZIP archive containing HTML files
- type: "game" | "lesson"
```

---

## Need Help?

- Check the [FAQ section](./faq.md)
- Contact the development team
- Review existing uploaded content for examples

---

*Last Updated: January 2026*
