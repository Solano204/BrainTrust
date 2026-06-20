---
name: weekly-cleanup
description: >
  Weekly code cleanup routine for BrainTrust LMS. Finds unused imports, dead code,
  files with no consumers, TODO comments, and console.log statements left in
  production code. Reports everything without making changes — you review and approve.
schedule: "0 10 * * 5"
---

# Weekly Cleanup Routine

Run every Friday to identify technical debt before the weekend.

## Step 1 — Find console.log Statements
Search all `.tsx` and `.ts` files for `console.log`, `console.error`, `console.warn`
that are NOT inside `.claude/` or `node_modules/`.

Report file + line for each one found.

## Step 2 — Find TODO / FIXME Comments
Search for `// TODO`, `// FIXME`, `// HACK`, `// XXX` comments.
Report them grouped by file.

## Step 3 — Find Commented-Out Code Blocks
Search for patterns like:
- Multiple consecutive lines starting with `//` (3+ lines = likely commented-out code)
- `{/*` JSX comment blocks with code inside

Report file + line range for each block.

## Step 4 — Find Potentially Unused Files
Check `components/teacher/quiz-view-submission-teacher copy.tsx` — files with "copy"
in the name are often forgotten duplicates.

Also check for any `.tsx` files that are NOT imported anywhere:
- Scan imports across `app/` and `components/`
- Flag any component file that has no `import` statement pointing to it

## Step 5 — Check `styles/` Directory
The `styles/globals.css` file is not imported anywhere (the active CSS is `app/globals.css`).
Report this as a candidate for deletion.

## Step 6 — Check Empty / Stub API Routes
The `app/api/extract-pdf-text-from-url/route.ts` file is empty.
Report any API route files that are empty or only have stubs.

## Step 7 — Summary Report
```
🧹 WEEKLY CLEANUP — BrainTrust LMS
Week: [date range]

console.log:      X occurrences in Y files
TODOs/FIXMEs:     X comments
Commented code:   X blocks
Unused files:     X candidates
Empty API routes: X files

Top 5 Cleanup Actions (priority order):
1. ...
2. ...
3. ...
4. ...
5. ...
```

## Important
This routine is READ-ONLY — it reports, never edits.
Review the report and decide which cleanup tasks to tackle.
