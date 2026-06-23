# BrainTrust LMS — Frontend

## Project Overview
Learning Management System with three user roles: **Admin**, **Teacher**, and **Student**.
Built with Next.js 16 App Router. All user-visible text must be in **Spanish**.

## Tech Stack
| Tool | Version | Purpose |
|------|---------|---------|
| Next.js | 16.2.6 | Framework (App Router) |
| React | 19.2.6 | UI library |
| TypeScript | 5 | Type safety |
| Tailwind CSS | v4 | Styling (`@import "tailwindcss"`, no config file) |
| shadcn/ui | latest | Radix-based component library |
| Axios | 1.x | HTTP client |
| TanStack Query | latest | Server state / caching |
| React Hook Form | 7.x | Forms |
| Zod | 3.x | Schema validation |
| next-themes | 0.4.x | Dark / light mode |
| Cloudinary | 2.x | Image & document uploads |

## Directory Structure
```
app/
  admin/           ← Admin pages (role-gated)
  auth/            ← Login / auth pages
  calendar/        ← Calendar page
  courses/         ← Course listing
  context/         ← AuthContext (useAuth hook)
  domain/          ← Domain models
  infraestructure/
    api/           ← Axios API clients, grouped by entity:
      calendar/    course/  gradebook/  students/  submission/  task/  team/
    utils.ts       hooks/
  presentation/    ← Presentation layer
  shared/models/   ← Shared TypeScript types/models
  student/         ← Student-specific pages
  types/           ← Global TypeScript types (authentication.ts with PERMISSIONS)
  utils/           ← Utility functions
  api/             ← Next.js API routes (auth, file uploads, PDF)

components/
  admin/           ← Admin UI components (CoursesManagement, UsersManagement, etc.)
  auth/            ← Auth UI (profile-modal)
  layout/          ← Dashboard layout (sidebar, header)
  sketons/         ← Skeleton loaders
  student/         ← Student-specific components
  teacher/         ← Teacher-specific components
  teacher-student/ ← Shared teacher+student components
  ui/              ← shadcn/ui primitives (DO NOT modify)

lib/
  utils.ts         ← cn() helper
  hooks/           ← Custom React hooks
  validation/      ← Zod schemas
```

## Design System
All design tokens live in `app/globals.css`. **Navy & Gold hotel theme**.

### Colors
- Primary (light): deep navy `oklch(0.23 0.075 262)` → `#1B2A4A`
- Primary (dark): champagne gold `oklch(0.73 0.13 83)` → `#C9A84C`
- Accent: gold `#C9A84C`
- Sidebar: always navy, gold active states

### Custom Utility Classes (use instead of repeating inline Tailwind)
```
.btn-primary      .btn-ghost         .btn-destructive   .btn-accent
.icon-btn         .icon-btn-primary  .icon-btn-destructive
.input-field      .select-field      .form-label        .section-label
.badge-primary    .badge-accent      .badge-muted       .badge-success   .badge-destructive
.card-base        .card-elevated     .card-padded       .card-interactive
.modal-overlay    .modal-panel       .modal-header      .modal-body      .modal-footer
.table-th         .table-td          .table-row
.page-container   .icon-badge        .stat-card         .mobile-card
```

## Code Conventions

### TypeScript
- Always type component props with an explicit interface
- Use `type` for unions/aliases, `interface` for object shapes
- Never use `any` — use `unknown` or proper types

### Components
- Functional components only, always with explicit return type when complex
- Hooks at the top, destructure early
- Keep components under 250 lines — extract sub-components if larger
- `"use client"` only when needed (interactivity / hooks)
- Responsive pattern: `hidden lg:block` for desktop table + `lg:hidden` for mobile cards

### API Layer (`app/infraestructure/api/`)
- One file per entity: `[entity]-api.ts` + `[entity]-keys.ts`
- All API calls go through Axios (never `fetch` directly)
- React Query hooks wrap all mutations and queries
- Always handle loading + error states in components

### Forms
- React Hook Form + Zod for all forms
- Schema defined in `lib/validation/`
- `resolver: zodResolver(schema)` pattern

### Auth & Permissions
- Auth state: `useAuth()` from `app/context/AuthContext`
- Role check: `hasPermission(PERMISSIONS.X)` from `app/types/authentication`
- Never hardcode role strings — use the PERMISSIONS constants

## Language Rules
- ALL user-visible text must be in **Spanish**
- Code identifiers, variable names, function names → English
- Comments → English
- Error messages shown to users → Spanish

## What NOT to Do
- Do NOT edit files in `components/ui/` — those are shadcn/ui auto-generated
- Do NOT use `any` TypeScript type
- Do NOT add AI-generated comments explaining what the code does
- Do NOT hardcode colors — use CSS custom properties (`text-primary`, `bg-card`, etc.)
- Do NOT repeat Tailwind class strings — use the utility classes from `app/globals.css`
- Do NOT use `fetch` for API calls — use the Axios clients in `app/infraestructure/api/`
- Do NOT push with `--force` to main branch
- Do NOT commit `.env.local` or any secrets

## Common Commands
```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint check
npx tsc --noEmit     # TypeScript type check
```

## Backend API
- Base URL: configured in environment (`NEXT_PUBLIC_API_URL`)
- Java/Spring Boot backend (separate project at `../backend/`)
- Auth: JWT tokens stored in cookies/localStorage
- CORS: configured on backend, no `withCredentials` needed

## Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```
