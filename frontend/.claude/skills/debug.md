---
name: debug
description: >
  Systematic debugging workflow for BrainTrust LMS. Diagnose TypeScript errors,
  React runtime errors, API failures, auth issues, and styling bugs. Always finds
  root cause before fixing.
---

# Skill: Debug

When the user runs `/debug`, ask them to provide:
1. The exact error message or unexpected behavior
2. The file/component where it happens (if known)
3. Steps to reproduce

Then follow this exact process:

## Phase 1 — Understand the Error

**For TypeScript compile errors (`npx tsc --noEmit` output)**:
- Read the file at the reported line
- Find the type mismatch or missing property
- Trace back to where the value originates

**For browser runtime errors (from browser console)**:
- Identify the error type:
  - `TypeError: Cannot read properties of undefined` → null check missing
  - `Hydration error` → server/client mismatch (check `window`, `Date`, `localStorage` usage)
  - `CORS error` → backend CORS config issue, NOT a frontend fix
  - `401 Unauthorized` → auth token not being sent or expired
  - `404` → wrong API endpoint path
  - `500 Internal Server Error` → backend bug, check Spring Boot logs

**For visual/styling issues**:
- Check if the element uses semantic color tokens (`text-foreground`) vs literal colors (`text-gray-800`)
- Check if `dark:` variant is applied correctly
- Check if a custom utility class from `app/globals.css` is being misused

## Phase 2 — Find Root Cause

Read these files in order:
1. The component file where the error originates
2. Its API hooks (in `app/infraestructure/api/`)
3. The TypeScript model (`app/shared/models/`)
4. The context it uses (`app/context/AuthContext.tsx` if auth-related)

Common BrainTrust root causes:
- Backend DTO changed but frontend model wasn't updated
- `user?.role` is `"ADMIN"` (uppercase) but code checks for `"admin"` (lowercase)
- Component runs before auth is initialized → shows loading flash
- Missing `"use client"` on a component that uses `useState` / `useEffect`
- React Query cache stale after mutation (wrong invalidation key)
- Zod schema rejects a valid value (check error message in Spanish)

## Phase 3 — Fix

Make the minimal change that addresses the root cause:
- TypeScript error: fix the type, not cast to `any`
- Undefined access: add `?.` or a proper null check with a fallback
- API type mismatch: update the model in `app/shared/models/`
- Auth role mismatch: fix role normalization in the component or `normalizeRole()` function
- Query invalidation: use the correct key from `[entity]-keys.ts`

## Phase 4 — Verify
```bash
npx tsc --noEmit    # no TS errors
npm run lint        # no ESLint errors
npm run build       # full build succeeds
```

## Output Format
```
ROOT CAUSE: [one sentence]
FILE: [path:line]
FIX: [code change]
VERIFICATION: [what to check after fix]
```
