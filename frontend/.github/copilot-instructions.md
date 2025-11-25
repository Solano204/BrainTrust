# BrainTrust Frontend - Copilot Instructions

## Project Overview
BrainTrust is a Next.js 16 educational platform with role-based access (admin, teacher, student). The frontend uses a **Clean Architecture** pattern separating domain logic, infrastructure, and presentation layers.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, TailwindCSS, Radix UI, React Query, Zod validation

---

## Architecture & Layers

### 1. **Domain Layer** (`app/domain/`)
Pure business logic independent of frameworks. Contains:
- **`entities/`** - Domain models (`CourseEntities.ts`, `IdentityEntities.ts`, `AnalisisEntities.ts`)
- **`valueObjects/`** - Type-safe primitives (`CourseValues.ts`, `IdentityValues.ts`, `AnalisisValues.ts`)
- **`services/`** - Business rules (`authService.ts`, `service.ts`, `serviceCourse.ts`)

**Pattern:** Use branded types from valueObjects for IDs:
```typescript
import { CourseId, UserId, AssignmentId } from "@/app/domain/valueObjects";
async function fetchStudentAssignments(courseId: CourseId, studentId: UserId)
```

### 2. **Infrastructure Layer** (`app/infraestructure/`)
External system adapters:
- **`api/`** - HTTP clients with Axios interceptors for auth headers
- Backend communication uses DTO interfaces (e.g., `AssignmentDTO`, `SubmissionDTO`)
- Mock mode enabled via `NEXT_PUBLIC_MOCK_ENABLED=true`

**Pattern:** Server Actions with "use server" for auth token management and API calls

### 3. **Presentation Layer** (`components/`, `app/`)
React components organized by role:
- **`components/ui/`** - Radix UI base components (buttons, dialogs, forms)
- **`components/student/`**, **`components/teacher/`** - Role-specific views
- **`app/[route]/page.tsx`** - Page components (mostly client-side with "use client")

---

## Critical Workflows

### Authentication Flow
1. User logs in via `AuthContext.login()` → calls `authService.login()` → receives JWT tokens
2. Tokens stored in HttpOnly cookies via `/api/auth/set-tokens` Server Action
3. Auth state persists in React Context with:
   - `user: UserSession | null`
   - `isAuthenticated: boolean`
   - `accessToken` / `refreshToken`
4. **Mock mode:** Set `NEXT_PUBLIC_USE_MOCK_AUTH=true` to bypass login; use `AuthContext.enableMock()`

**Key File:** `app/context/AuthContext.tsx` - Handles token refresh 1 min before expiry

### Permission & Role Checking
```typescript
const { hasPermission, hasRole, user } = useAuth();

// Use route guards in components:
import { RouteGuard, StudentOnly, TeacherOnly } from "@/app/auth/RouteGuard";
```

Roles define permissions via `ROLE_PERMISSIONS` in `app/types/authentication.ts`.

### Data Fetching Pattern
- **Server Actions** (`"use server"`) for backend API calls from `components/student/api/student-submission.tsx`
- **React Query** for client-side caching (5-min staleTime)
- **Axios interceptor** automatically adds `Authorization: Bearer {token}` header
- **Mock data** for testing without backend (e.g., `MOCK_STUDENT_ASSIGNMENTS`)

**Example:**
```typescript
export async function fetchStudentAssignmentsItem(courseId: CourseId, studentId: UserId) {
  if (isMockEnabled) return MOCK_STUDENT_ASSIGNMENTS;
  const response = await apiClient.get<AssignmentDTO[]>(`/api/assignments/course/${courseId}`);
  return response.data.map(a => mapBackendAssignmentToFrontend(a));
}
```

---

## Key Conventions & Patterns

### Component Organization
- **"use client"** directives: Most components are client-side; only layout/metadata are server
- **Server Actions** marked with `"use server"` for auth & backend calls
- Naming: `[entity]-[feature]-[role].tsx` (e.g., `course-gradebook-student.tsx`)

### DTO Mapping
Backend DTOs (`AssignmentDTO`, `QuizDTO`) map to frontend types (`StudentAssignment`, `StudentQuiz`):
```typescript
// Function: mapBackendAssignmentToFrontend()
// Converts backend DTO fields → frontend domain model
// Handles date formatting, nullable fields, overdue status calculation
```

### Forms & Validation
- Use **React Hook Form** + **Zod** for type-safe forms
- Validation rules in `app/types/validator.ts`
- Submit via `apiClient.post()` with token auto-attached

### State Management
- **AuthContext** - Global auth state (tokens, user, permissions)
- **React Query** - Server state caching (courses, submissions, grades)
- **Local state** - Component-level UI state (form inputs, modals)

### Styling
- **TailwindCSS** with theme support (light/dark) via `next-themes`
- Utility function `cn()` in `lib/utils.ts` combines Tailwind classes with Clsx+TailwindMerge
- Responsive: `lg:hidden` (mobile), `md:`, `xl:` breakpoints

---

## Project-Specific Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # TypeScript + Next.js build
npm run lint         # ESLint check
npm run start        # Production server
```

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_MOCK_ENABLED=true         # Enable mock data
NEXT_PUBLIC_USE_MOCK_AUTH=true        # Bypass login
```

---

## Common Patterns by Feature

### Adding Student Feature
1. Create component in `components/student/`
2. Use `useAuth()` to check permissions
3. Fetch data from `components/student/api/student-submission.tsx`
4. Wrap in `<StudentOnly>` route guard

### Adding Teacher Feature
1. Similar to student; place in `components/teacher/`
2. Use `hasPermission('teacher:grade')` checks
3. Handle submission grading with grade DTOs

### API Integration
- Backend endpoints: Java Spring Boot at `NEXT_PUBLIC_API_URL`
- Request/response types in domain `Dtos/` and value objects
- Always use `CourseId`, `UserId` branded types (not raw strings)

---

## Critical Files Reference

| File | Purpose |
|------|---------|
| `app/context/AuthContext.tsx` | Auth state, token refresh, login/logout |
| `components/student/api/student-submission.tsx` | Student assignment/quiz data fetching |
| `app/auth/RouteGuard.tsx` | Role-based access control components |
| `app/types/authentication.ts` | Auth types, permissions, role definitions |
| `app/domain/valueObjects/` | Branded ID types (CourseId, UserId, etc.) |
| `components/layout/dashboard-header.tsx` | Top nav with auth menu |
| `app/api/providers/ReactQueryProvider.tsx` | React Query client setup |

---

## Known Constraints & Quirks

- **TypeScript Build Errors Ignored:** `next.config.mjs` sets `ignoreBuildErrors: true` (handle carefully)
- **Images Unoptimized:** `images.unoptimized: true` for dev; optimize before production
- **Mock Toggle:** When enabling mock auth, bypass actual token validation; use only for testing
- **HttpOnly Cookies:** Tokens stored server-side; client reads from cookies via server actions
- **30-min staleTime on queries** may need adjustment for real-time features

---

## When Stuck

- Check `AuthContext.tsx` for auth issues (token expiry, mock mode)
- Use React Query DevTools to inspect cached data
- Enable mock mode (`NEXT_PUBLIC_MOCK_ENABLED=true`) to test without backend
- Verify role-based permission in `ROLE_PERMISSIONS` before denying access
