#!/bin/bash

echo "🧹 Nuclear Clean & Restart Script"
echo "=================================="

# Kill all node processes
echo "1. Killing all Node.js processes..."
pkill -9 node 2>/dev/null || echo "  No node processes running"

# Kill anything on port 3000
echo "2. Freeing port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "  Port 3000 is free"

# Remove all Next.js caches
echo "3. Removing Next.js build caches..."
rm -rf .next
rm -rf .swc
rm -rf .turbo
rm -rf node_modules/.cache
rm -rf out
find . -name "*.tsbuildinfo" -delete

echo "4. Verifying space-multiplication-adventure is deleted..."
if [ -d "components/games/space-multiplication-adventure" ]; then
    echo "  ⚠️  Found directory! Deleting..."
    rm -rf components/games/space-multiplication-adventure
else
    echo "  ✅ Directory does not exist"
fi

if grep -r "space-multiplication" lib/gameLoader.ts 2>/dev/null; then
    echo "  ⚠️  Found reference in gameLoader.ts!"
else
    echo "  ✅ No references in gameLoader.ts"
fi

echo ""
echo "✅ Clean complete!"
echo ""
echo "Now run:"
echo "  npm run dev"
echo ""
echo "Then in your browser:"
echo "  1. Open DevTools (F12)"
echo "  2. Right-click the refresh button"
echo "  3. Select 'Empty Cache and Hard Reload'"
echo ""
