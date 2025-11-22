# Game Platform Integration Guide

## 📋 Overview

This guide explains how to import games created with professional game development platforms into the Learning Adventures Platform. We support games from various engines and builders.

---

## 🎮 Supported Platforms

### Tier 1: Fully Supported (Auto-Detected)
- ✅ **HTML5 Single File** - Standalone HTML games
- ✅ **Replit** - Exported HTML/JS projects
- ✅ **Base44** - AI-generated game exports
- ✅ **Construct 3** - HTML5 exports
- ✅ **Phaser** - HTML5 game framework
- ✅ **PixiJS** - 2D rendering engine games

### Tier 2: Supported (Manual Configuration)
- ⚠️ **BuildBox** - HTML5/WebGL exports
- ⚠️ **Unity WebGL** - Unity game builds
- ⚠️ **GDevelop** - HTML5 exports
- ⚠️ **GameMaker Studio** - HTML5 exports
- ⚠️ **Godot** - HTML5/WebGL exports
- ⚠️ **PlayCanvas** - WebGL game engine

### Tier 3: Experimental
- 🔬 **Unreal Engine Pixel Streaming** - Requires server setup
- 🔬 **Custom WebGL Frameworks** - Case-by-case basis

---

## 📦 Platform-Specific Export Instructions

### BuildBox

**Export Steps:**
1. Open your BuildBox project
2. Go to **File → Export**
3. Select **HTML5** as the export platform
4. Configure settings:
   - ✅ Enable "Single Page Application"
   - ✅ Enable "Responsive Scaling"
   - ✅ Set Canvas Size: 1024x768 or responsive
   - ✅ Embed all assets
5. Click **Export**
6. You'll get a folder with:
   ```
   buildbox-export/
   ├── index.html          # Main entry point
   ├── js/
   │   ├── game.js         # Game logic
   │   └── libs/           # Libraries
   ├── css/
   │   └── style.css       # Styles
   └── assets/             # Images, sounds, etc.
   ```

**Upload to Learning Adventures:**
1. **Zip the entire folder** (not just contents)
2. Go to **Content Studio** (`/internal`)
3. Select **"Upload Platform"**: BuildBox
4. Upload the zip file
5. System will auto-detect `index.html` and structure

**Important Notes:**
- BuildBox exports are usually 5-50 MB
- Ensure all assets are embedded or included
- Test on mobile - BuildBox games are often touch-optimized
- Check for any external API dependencies

---

### Unity WebGL

**Export Steps:**
1. In Unity, go to **File → Build Settings**
2. Select **WebGL** platform
3. Click **Player Settings** and configure:
   - **Company Name**: Learning Adventures
   - **Product Name**: Your Game Name
   - **WebGL Template**: Minimal or Default
   - **Compression Format**: Gzip or Brotli
   - **Enable Exceptions**: Full (for debugging)
4. Click **Build** and choose output folder
5. Unity creates:
   ```
   unity-build/
   ├── index.html
   ├── Build/
   │   ├── UnityLoader.js
   │   ├── build.json
   │   ├── build.data.unityweb
   │   ├── build.wasm.unityweb
   │   └── build.framework.js.unityweb
   └── TemplateData/
       └── style.css
   ```

**Upload to Learning Adventures:**
1. **Zip the entire build folder**
2. Content Studio → Upload Platform: **Unity WebGL**
3. Upload zip file
4. System detects Unity structure automatically

**Important Notes:**
- Unity WebGL builds are 10-100+ MB
- Requires WebAssembly support (all modern browsers)
- Initial load time can be 5-30 seconds
- Consider compression settings for faster loading
- May need to adjust memory settings for complex games

**Special Configuration:**
Add to metadata:
```json
{
  "platform": "unity-webgl",
  "memorySize": 256,  // MB
  "loaderOptimizations": true
}
```

---

### Construct 3

**Export Steps:**
1. In Construct 3, go to **Menu → Project → Export**
2. Select **Web (HTML5)**
3. Configure export settings:
   - **Export for**: Web
   - **Minify script**: Yes (for production)
   - **Deobfuscate errors**: Yes (for debugging)
   - **PNG recompression**: On
   - **Convert to WebP**: Optional
4. Click **Next** → **Export**
5. Download the zip file
6. Extract to see structure:
   ```
   construct-export/
   ├── index.html
   ├── sw.js              # Service worker
   ├── offline.js
   ├── icons/
   ├── images/
   ├── media/
   └── scripts/
       └── c3runtime.js
   ```

**Upload to Learning Adventures:**
1. Use the exported zip directly (no need to re-zip)
2. Content Studio → Upload Platform: **Construct 3**
3. Upload zip file
4. Auto-detection handles service worker and manifest

**Important Notes:**
- Construct 3 exports are 2-20 MB typically
- Games are automatically mobile-responsive
- Service worker provides offline support
- PWA features are preserved

---

### GDevelop

**Export Steps:**
1. In GDevelop, click **Export** (top toolbar)
2. Choose **Web (upload online or self-hosted)**
3. Export settings:
   - **Minify**: Yes
   - **Include source maps**: No (for production)
   - **Export for Cordova/Electron**: No
4. Click **Export**
5. GDevelop creates:
   ```
   gdevelop-export/
   ├── index.html
   ├── code0.js           # Game code
   ├── libs/              # GDevelop engine
   ├── assets/            # Images, sounds
   └── gd.js              # Main engine file
   ```

**Upload to Learning Adventures:**
1. Zip the export folder
2. Content Studio → Upload Platform: **GDevelop**
3. Upload zip
4. System handles GDevelop structure

---

### GameMaker Studio

**Export Steps:**
1. In GameMaker Studio, go to **Build → HTML5**
2. Configure HTML5 settings:
   - **Output Folder**: Choose location
   - **Game Name**: Your game name
   - **Scaling**: Keep aspect ratio
   - **Browser Title**: Learning Adventures - [Game Name]
3. Click **Create Executable**
4. GameMaker creates:
   ```
   gamemaker-export/
   ├── index.html
   ├── html5game/
   │   ├── [gamename].js
   │   └── [gamename].png
   └── favicon.ico
   ```

**Upload to Learning Adventures:**
1. Zip the entire export folder
2. Content Studio → Upload Platform: **GameMaker**
3. Upload zip
4. System detects `html5game/` folder structure

---

### Godot Engine

**Export Steps:**
1. In Godot, go to **Project → Export**
2. Add **HTML5** export preset (if not exists)
3. Configure:
   - **Export Path**: Choose folder
   - **Export Type**: HTML5
   - **Head Include**: (leave default)
   - **Custom HTML Shell**: (optional - for custom loading screen)
4. Click **Export Project**
5. Godot creates:
   ```
   godot-export/
   ├── index.html
   ├── [gamename].wasm
   ├── [gamename].pck
   └── [gamename].js
   ```

**Upload to Learning Adventures:**
1. Zip the export folder
2. Content Studio → Upload Platform: **Godot**
3. Upload zip
4. Supports both WASM and asm.js builds

**Important Notes:**
- Godot exports are 5-30 MB
- WASM provides best performance
- SharedArrayBuffer may be required for threading
- Check browser compatibility

---

## 🔧 Platform Detection System

Our system automatically detects platforms based on file structure:

### Detection Logic:

```javascript
BuildBox Detection:
- Look for: js/game.js, js/libs/buildbox.js
- Entry point: index.html
- Confidence: High

Unity Detection:
- Look for: Build/UnityLoader.js, Build/*.unityweb
- Entry point: index.html
- Confidence: Very High

Construct 3 Detection:
- Look for: scripts/c3runtime.js, sw.js
- Entry point: index.html
- Confidence: Very High

GDevelop Detection:
- Look for: libs/gdjs.js, gd.js
- Entry point: index.html
- Confidence: High

GameMaker Detection:
- Look for: html5game/[name].js folder
- Entry point: index.html
- Confidence: High

Godot Detection:
- Look for: *.wasm, *.pck files
- Entry point: index.html
- Confidence: Very High
```

---

## 📋 Upload Workflow

### Step 1: Prepare Your Game
1. Export from your game platform (see platform-specific instructions above)
2. Test the export locally:
   - Extract zip to folder
   - Run a local web server: `python -m http.server 8000`
   - Open `http://localhost:8000` in browser
   - Verify game works correctly

### Step 2: Upload to Content Studio
1. Log in as **ADMIN**
2. Navigate to **Content Studio** (`/internal`)
3. Fill in the form:
   - **Title**: Your game title
   - **Subject**: Math, Science, etc.
   - **Grade Levels**: Select appropriate levels
   - **Type**: Game or Lesson
   - **Skills**: Educational skills taught
   - **Upload Source**: Uploaded Content
   - **Upload Platform**: Select your platform (BuildBox, Unity, etc.)
   - **Project Type**: HTML (for all web exports)

### Step 3: Upload File
1. Click **"Choose File"** or drag-drop
2. Upload your **ZIP file**
3. System will:
   - Extract the zip
   - Detect the platform automatically
   - Validate file structure
   - Preview the game

### Step 4: Preview & Test
1. Review the live preview
2. Test all game mechanics
3. Check mobile responsiveness
4. Verify assets load correctly

### Step 5: Submit for Testing
1. Click **"Publish to Catalog"**
2. Game is added to testing queue
3. Navigate to **Testing Dashboard** (`/internal/testing`)
4. Update status to **"IN_TESTING"**

### Step 6: Get Approved
1. Team reviews the game
2. Provide/receive feedback
3. Make any necessary adjustments
4. Get **APPROVED** status

### Step 7: Promote to Catalog
1. Admin promotes to public catalog
2. Game appears for all students!

---

## 🚨 Common Issues & Solutions

### Issue: "Zip file too large"
**Solution:**
- Check file size limit (usually 100 MB)
- Compress assets (use tools like TinyPNG for images)
- Remove unnecessary source files
- Use gzip compression in engine export settings

### Issue: "Game not loading in preview"
**Solution:**
- Check browser console for errors
- Verify all assets are included in zip
- Ensure no external API dependencies
- Test with different browsers

### Issue: "Game runs locally but not on platform"
**Solution:**
- Check for hardcoded absolute paths (use relative paths)
- Verify CORS settings for external resources
- Remove localhost references
- Check for file case sensitivity (important for Linux servers)

### Issue: "Controls not working"
**Solution:**
- Test on actual mobile device (not just responsive mode)
- Verify touch events are implemented
- Check for keyboard/mouse-only controls (add touch alternatives)
- Ensure game viewport is properly configured

### Issue: "Assets not loading"
**Solution:**
- Verify all assets are in the zip
- Check file paths in code (should be relative)
- Look for missing font files
- Verify audio formats are web-compatible (MP3, OGG, WAV)

---

## ✅ Pre-Upload Checklist

Before uploading your game, verify:

### Required:
- [ ] Game exports to HTML5/WebGL
- [ ] All assets are included in export
- [ ] Game runs in local browser test
- [ ] No external dependencies or API calls
- [ ] No hardcoded localhost URLs
- [ ] File size is under 100 MB (or platform limit)

### Recommended:
- [ ] Mobile-responsive or touch controls
- [ ] Loading screen/progress indicator
- [ ] Error handling for missing assets
- [ ] Compatible with Chrome, Firefox, Safari
- [ ] Tested on both desktop and mobile
- [ ] Educational objectives are clear
- [ ] Age-appropriate content

### Platform-Specific:
- [ ] Unity: WebGL compression enabled
- [ ] BuildBox: Responsive scaling enabled
- [ ] Construct 3: Minification enabled
- [ ] Godot: WASM build (not just asm.js)
- [ ] GameMaker: HTML5 target configured

---

## 📊 Platform Comparison

| Platform | Avg. Size | Load Time | Mobile Support | Complexity |
|----------|-----------|-----------|----------------|------------|
| HTML5 Single | 100 KB - 2 MB | < 1s | Excellent | Low |
| Construct 3 | 2-20 MB | 2-5s | Excellent | Low-Medium |
| BuildBox | 5-50 MB | 3-8s | Excellent | Medium |
| GDevelop | 3-15 MB | 2-6s | Good | Medium |
| Phaser | 1-10 MB | 1-4s | Excellent | Medium |
| Unity WebGL | 10-100+ MB | 5-30s | Good | High |
| Godot | 5-30 MB | 3-10s | Good | Medium-High |
| GameMaker | 3-20 MB | 2-7s | Good | Medium |

---

## 🎯 Best Practices

### For Educators:
1. **Start Simple**: Begin with simpler platforms (Construct 3, GDevelop)
2. **Test Thoroughly**: Try game on multiple devices before uploading
3. **Optimize Assets**: Compress images and audio to reduce file size
4. **Clear Instructions**: Include in-game tutorials or help screens

### For Game Performance:
1. **Asset Optimization**:
   - Images: Use WebP or compressed PNG
   - Audio: Use MP3 (128 kbps is usually fine)
   - Fonts: Embed only used characters
   - Remove unused assets

2. **Loading Experience**:
   - Show progress bar during loading
   - Preload critical assets first
   - Use splash screen with instructions
   - Handle slow connections gracefully

3. **Mobile Optimization**:
   - Test touch controls thoroughly
   - Use larger hit areas for buttons
   - Support both orientations (or lock one)
   - Optimize for lower-end devices

---

## 💡 Advanced: Custom Platform Integration

If your platform isn't listed, you can still upload if it exports to HTML5/WebGL:

### Requirements:
1. Exports to static HTML/JS/CSS files
2. Runs entirely in browser (no server required)
3. No dependencies on platform-specific servers
4. All assets can be bundled/embedded

### Process:
1. Export your game
2. Test locally with a web server
3. Upload as "Custom HTML" platform
4. Provide documentation on how it works
5. Work with our team for integration

### Contact:
For custom platform integration support, contact the admin team with:
- Platform name and version
- Sample export (small test game)
- Documentation on export format
- Any special requirements

---

## 📚 Additional Resources

- [Unity WebGL Documentation](https://docs.unity3d.com/Manual/webgl-building.html)
- [Construct 3 Export Guide](https://www.construct.net/en/make-games/manuals/construct-3/project-primitives/exporting)
- [GDevelop HTML5 Export](https://wiki.gdevelop.io/gdevelop5/publishing/html5_game_in_a_local_folder)
- [BuildBox Export Tutorial](https://www.buildbox.com/tutorials/exporting-games/)
- [Godot Web Export](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html)

---

**Last Updated**: November 2025
**Supported Platforms**: 12+
**Max Upload Size**: 100 MB
**Questions?** Ask in admin team chat or check `NON_DEVELOPER_WORKFLOW.md`
