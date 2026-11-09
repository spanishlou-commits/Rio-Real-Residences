#!/bin/bash
# Fetch fresh Resales Online data, commit and push to GitHub.
# Runs via cron — do not run between 09:00–19:00 (Resales API restriction).

set -e

REPO="/Users/lou/rio-real-residences"
LOG="$REPO/data/fetch.log"

echo "" >> "$LOG"
echo "=== $(date '+%Y-%m-%d %H:%M:%S') ===" >> "$LOG"

cd "$REPO"

# Run the fetch script
python3 scripts/fetch-resales.py >> "$LOG" 2>&1

# Commit and push if the data file changed
if git diff --quiet data/resales-properties.json; then
  echo "No changes to resales data." >> "$LOG"
else
  git add data/resales-properties.json
  git commit -m "Weekly resales update $(date '+%Y-%m-%d')"
  git push
  echo "Pushed to GitHub." >> "$LOG"
fi
