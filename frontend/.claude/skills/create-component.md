---
name: create-component
description: >
  Create a new React component for BrainTrust LMS. Scaffolds the file with correct
  structure, TypeScript types, design system utility classes, responsive table/card
  layout, dark mode support, and Spanish UI text.
---

# Skill: Create Component

When the user runs `/create-component`, ask them:
1. What is the component name? (e.g., "CourseCard", "StudentList")
2. Which folder? (`components/admin/`, `components/student/`, `components/teacher/`, etc.)
3. Does it show a list/table? (yes/no — determines if responsive table pattern is needed)
4. What data does it display? (describe the shape)
5. Does it need to call an API? (which entity/endpoint?)

Then generate the component following these rules:

## Component Structure
```tsx
"use client"  // only if the component uses hooks or event handlers

// 1. External imports (lucide-react, shadcn/ui)
// 2. Internal imports (hooks, types, utils)

interface [Name]Props {
  // All props explicitly typed
}

export function [Name]({ ... }: [Name]Props) {
  // Hooks first
  const { user, hasPermission } = useAuth()

  // State second
  const [state, setState] = useState(...)

  // Derived values
  const filteredItems = useMemo(...)

  // Handlers
  const handleX = () => { ... }

  // Loading state
  if (isLoading) {
    return <div className="flex items-center justify-center py-12">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  }

  // Error state
  if (error) {
    return <div className="text-center py-12 text-destructive text-sm">
      Ocurrió un error al cargar los datos.
    </div>
  }

  // Main JSX
  return (
    <div className="page-container">
      ...
    </div>
  )
}
```

## If Component Has a Table → Always Add Mobile Cards
```tsx
{/* Desktop */}
<div className="hidden lg:block overflow-x-auto">
  <table className="w-full">
    <thead className="border-b border-border bg-muted/30">
      <tr>
        <th className="table-th">Columna</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-border">
      {items.map(item => (
        <tr key={item.id} className="table-row">
          <td className="table-td">...</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

{/* Mobile */}
<div className="lg:hidden space-y-3">
  {items.map(item => (
    <div key={item.id} className="mobile-card">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm text-foreground">{item.name}</span>
        <span className="badge-primary">{item.status}</span>
      </div>
      <div className="text-xs text-muted-foreground">{item.detail}</div>
    </div>
  ))}
</div>
```

## Utility Classes to Use
- Containers: `.page-container`, `.card-elevated`, `.card-padded`
- Buttons: `.btn-primary`, `.btn-ghost`, `.btn-destructive`
- Icons: `.icon-btn`, `.icon-badge`
- Inputs: `.input-field`, `.form-label`, `.section-label`
- Badges: `.badge-primary`, `.badge-muted`, `.badge-success`, `.badge-destructive`
- Modals: `.modal-overlay`, `.modal-panel`, `.modal-header`, `.modal-body`, `.modal-footer`

## Checklist Before Finishing
- [ ] All text in Spanish
- [ ] No `any` types
- [ ] No AI-generated comments
- [ ] No hardcoded colors (no `text-gray-*`, `bg-white`, etc.)
- [ ] Has loading and error states
- [ ] Mobile responsive if has table
- [ ] Props interface defined
