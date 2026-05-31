#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if command -v pbpaste &>/dev/null; then
  pbpaste | node scripts/process-data.mjs
elif command -v xclip &>/dev/null; then
  xclip -selection clipboard -o | node scripts/process-data.mjs
elif command -v wl-paste &>/dev/null; then
  wl-paste | node scripts/process-data.mjs
else
  echo "No clipboard utility found. Use: cat > /tmp/myair.json (paste, Ctrl+D)"
  echo "Then: node scripts/process-data.mjs /tmp/myair.json"
  exit 1
fi
