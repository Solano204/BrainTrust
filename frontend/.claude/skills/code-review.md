---
name: code-review
description: >
  Quick code review of recently changed files in BrainTrust LMS. Checks TypeScript
  safety, React patterns, design system compliance, security, and language (Spanish UI).
  For a deeper review, use the code-reviewer sub-agent instead.
---

# Skill: Code Review

When the user runs `/code-review`, ask:
1. Which files to review? (or "the last commit" to review git diff)
2. What kind of review? (quick / thorough)

## Quick Review (default)
Run these checks in order:

### 1. TypeScript
```bash
npx tsc --noEmit
```
Report any errors with file + line + fix.

### 2. Lint
```bash
npm run lint
```
Report any ESLint warnings/errors.

### 3. Manual Checks
Read the changed files and check:

**Design System**
- Are custom utility classes used instead of long class strings? (e.g., `btn-primary` not `flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground...`)
- No hardcoded colors? (`text-gray-*`, `bg-white`, etc.)
- Dark mode support? (all color classes are semantic)

**React Patterns**
- No `any` types
- Loading + error states in every data-fetching component
- Unique keys on all lists
- `"use client"` not on server components

**Language**
- All user-visible strings in Spanish
- No English labels, placeholders, or button text visible to users

**Security**
- No API keys in component code
- User input validated with Zod before API calls
- `hasPermission()` guarding admin/teacher actions

## Thorough Review
For a deep review across the whole codebase, say:
"Use the code-reviewer agent for a thorough review of [files/feature]"

## Output Format
```
✅ TypeScript — no errors
⚠️ Lint — 2 warnings (see below)
❌ Design System — 3 issues found

Issues:
1. [file:line] ISSUE — FIX
2. [file:line] ISSUE — FIX
```
