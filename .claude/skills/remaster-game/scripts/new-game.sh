#!/usr/bin/env bash
# Scaffold a new remastered game from the closest existing one.
#   .claude/skills/remaster-game/scripts/new-game.sh <slug> <reference-slug> "<Title>"
# Example: new-game.sh fraction-pizza-party time-attack-clock "Fraction Pizza Party"
# Copies index.html, main.ts, pix.ts and the CSS file, renamed. Everything else
# (problems, art, world, content, save, music, game) is written fresh using the
# reference game's files as the model.
set -euo pipefail
slug="${1:?slug}"; ref="${2:?reference game slug}"; title="${3:?title}"
root="$(git rev-parse --show-toplevel)/games-src/adventures"
src="$root/src/games/$ref"; dst="$root/src/games/$slug"
[ -d "$src" ] || { echo "No reference game at $src"; exit 1; }
[ -e "$dst" ] && { echo "$dst already exists"; exit 1; }
mkdir -p "$dst" "$root/$slug"
refcss="$(cd "$src" && ls *.css | head -1)"
short="$(echo "$slug" | awk -F- '{for(i=1;i<=NF;i++) printf substr($i,1,1)}')"
cp "$src/pix.ts" "$dst/pix.ts"
sed -e "s#$ref#$slug#g" -e "s#./$refcss#./$slug.css#" "$src/main.ts" > "$dst/main.ts"
reftitle="$(grep -o '<title>[^|<]*' "$root/$ref/index.html" | sed 's/<title>//; s/ *$//')"
sed -e "s#$ref#$slug#g" -e "s#$reftitle#$title#g" "$root/$ref/index.html" > "$root/$slug/index.html"
sed -i "s#$reftitle#$title#g" "$dst/main.ts"
cp "$src/$refcss" "$dst/$slug.css"
echo "Created:"
echo "  games-src/adventures/$slug/index.html   (edit the meta description, theme color and favicon)"
echo "  games-src/adventures/src/games/$slug/{main.ts,pix.ts,$slug.css}"
echo "Next: write problems.ts + tests/$short-problems.test.ts, then art, world, content, save, music, game."
echo "The CSS still uses the reference game's class prefix; rename it to a short prefix for this game (e.g. .$short-)."
