#!/bin/bash

echo "🔍 Diagnostic Script - Space Multiplication Issue"
echo "=================================================="
echo ""

# 1. Check current directory
echo "1. Current directory:"
pwd
echo ""

# 2. Check git branch
echo "2. Current git branch:"
git branch --show-current
echo ""

# 3. Check for uncommitted files
echo "3. Git status:"
git status --short
echo ""

# 4. Check if directory exists
echo "4. Checking for space-multiplication-adventure directory:"
if [ -d "components/games/space-multiplication-adventure" ]; then
    echo "   ❌ FOUND! This directory should NOT exist!"
    ls -la components/games/space-multiplication-adventure/
else
    echo "   ✅ Directory does not exist (correct)"
fi
echo ""

# 5. Check for references in gameLoader
echo "5. Checking lib/gameLoader.ts for 'space' references:"
if grep -i "space" lib/gameLoader.ts; then
    echo "   ❌ FOUND references to space!"
else
    echo "   ✅ No references found (correct)"
fi
echo ""

# 6. Check for any space-multiplication files
echo "6. Searching for any space-multiplication files:"
find . -type f -name "*space-multiplication*" ! -path "*/node_modules/*" ! -path "*/.next/*" ! -path "*/.git/*" 2>/dev/null
echo ""

# 7. Check git history
echo "7. Last 3 commits:"
git log --oneline -3
echo ""

# 8. Check if .next exists
echo "8. Build cache status:"
if [ -d ".next" ]; then
    echo "   .next directory exists (size: $(du -sh .next | cut -f1))"
    echo "   To fix: rm -rf .next"
else
    echo "   ✅ No .next directory"
fi
echo ""

# 9. Check for running processes
echo "9. Running Node processes:"
ps aux | grep -E "next|node" | grep -v grep | grep -v diagnostic || echo "   No Node processes found"
echo ""

# 10. Check what's on port 3000
echo "10. Port 3000 status:"
lsof -ti:3000 2>/dev/null && echo "   ⚠️  Port 3000 is in use!" || echo "   ✅ Port 3000 is free"
echo ""

echo "=================================================="
echo "Please share this output to help diagnose the issue!"
echo ""
