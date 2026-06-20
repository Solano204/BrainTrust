---
name: responsive-table
description: >
  Convert an existing desktop-only table in a BrainTrust component into a
  responsive layout where the table shows on lg+ screens and each row becomes
  a card on mobile screens. No data changes, pure layout transformation.
---

# Skill: Make Table Responsive

When the user runs `/responsive-table`, ask:
1. Which component file has the table? (e.g., `components/admin/CoursesManagement.tsx`)
2. What columns does the table have?

Then:

## Step 1 — Read the file
Find the existing `<table>` element and understand its columns and row data.

## Step 2 — Wrap the table in a desktop-only container
```tsx
{/* Tabla — solo escritorio */}
<div className="hidden lg:block overflow-x-auto">
  <table className="w-full">
    {/* existing table content */}
  </table>
</div>
```

## Step 3 — Add a mobile card section below the table
```tsx
{/* Tarjetas — solo móvil */}
<div className="lg:hidden space-y-3">
  {items.map(item => (
    <div key={item.id} className="mobile-card">

      {/* Header row: name + status badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-sm text-foreground truncate">
          {item.name}
        </span>
        <span className={`badge-${statusVariant(item.status)}`}>
          {item.statusLabel}
        </span>
      </div>

      {/* Detail rows */}
      <div className="space-y-1.5">
        {/* For each column that has a label */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{item.detail}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <button className="btn-ghost flex-1 text-xs py-1.5">
          <Edit className="h-3.5 w-3.5" /> Editar
        </button>
        <button className="icon-btn-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

    </div>
  ))}
</div>
```

## Mobile Card Design Rules
- Always show the most important field prominently (name/title)
- Status badge in the top-right corner
- Secondary details with icons below
- Actions at the bottom, separated by a border
- Use `.mobile-card` utility class (it handles bg, border, padding, spacing)
- Use `.badge-*` for status (badge-primary, badge-success, badge-muted, badge-destructive)
- Text: `text-foreground` for main, `text-muted-foreground` for secondary
- Keep action buttons small (`text-xs`, smaller padding)

## Final Check
- Desktop table: `hidden lg:block`
- Mobile cards: `lg:hidden`
- Same `key={item.id}` on both
- No data duplication — both read from the same `items` array
- Works in dark mode (using semantic color tokens, not literal colors)
