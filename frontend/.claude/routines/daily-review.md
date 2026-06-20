---
name: daily-review
description: >
  Daily automated review routine for BrainTrust LMS. Runs a TypeScript check,
  ESLint, checks for leftover English UI strings, and reports a summary.
  Schedule with: claude --schedule "daily-review" --cron "0 9 * * *"
schedule: "0 9 * * 1-5"
---

# Daily Review Routine

Run this routine every weekday morning to catch issues before development begins.

## Step 1 — TypeScript Check
```bash
npx tsc --noEmit
```
Report any errors found.

## Step 2 — ESLint Check
```bash
npm run lint
```
Report warnings and errors.

## Step 3 — English Text Scan
Search for common English strings that should be Spanish in component files:
- "Save", "Cancel", "Delete", "Edit", "Create" (as JSX text, not code)
- "Loading...", "Search...", "No results"
- "Error", "Success", "Warning" (as toast/alert messages)

Use Grep to find these in `components/` and `app/` directories.
Report any English user-visible text found with file + line number.

## Step 4 — Dark Mode Token Check
Search for hardcoded colors (not design tokens) in component files:
- `text-gray-`, `text-black`, `text-white`, `bg-white`, `bg-black`
- These should be `text-foreground`, `bg-background`, `bg-card`, etc.

Report any found with file + line number.

## Step 5 — Summary Report
Output a clean daily summary:
```
📋 DAILY REVIEW — BrainTrust LMS
Date: [date]

TypeScript:   ✅ No errors  /  ❌ X errors
ESLint:       ✅ Clean      /  ⚠️ X warnings
English text: ✅ None found /  ⚠️ X strings need translation
Color tokens: ✅ Clean      /  ⚠️ X hardcoded colors

Action items:
1. [most important fix if any]
```

## Notes
- This routine does NOT make any code changes — read-only scan only
- To run manually: type `/daily-review` in a Claude Code session
- To enable automatic scheduling, see `.claude/routines/README.md`
