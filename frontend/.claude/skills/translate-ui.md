---
name: translate-ui
description: >
  Scan one or more BrainTrust component files and replace all English user-visible
  text with Spanish. Never touches code identifiers, imports, or comments.
---

# Skill: Translate UI

When the user runs `/translate-ui`, ask:
1. Which file(s) to translate? (path or "all components")
2. Any specific section that needs priority?

## What to Translate

### YES — Translate These
```tsx
// JSX text content
<h1>User Management</h1>          → <h1>Gestión de Usuarios</h1>
<Button>Save</Button>             → <Button>Guardar</Button>
<p>No results found</p>           → <p>No se encontraron resultados</p>

// Attributes
placeholder="Search..."          → placeholder="Buscar..."
title="Delete user"               → title="Eliminar usuario"
aria-label="Close modal"          → aria-label="Cerrar modal"

// String literals that appear in UI
label="Course Name"               → label="Nombre del Curso"
```

### NO — Don't Touch These
```tsx
// Variable/function names
const userName = ...              // ← NEVER change
function handleSubmit() { ... }   // ← NEVER change
className="btn-primary"           // ← NEVER change (CSS class)
import { ... } from '...'         // ← NEVER change (imports)
console.log("Debug: ...")         // ← NEVER change (dev tool)
```

## Key Translation Dictionary (BrainTrust)
| English | Spanish |
|---------|---------|
| Dashboard | Tablero |
| Courses | Cursos |
| Users | Usuarios |
| Students | Estudiantes |
| Teachers | Profesores |
| Admins | Administradores |
| Grades | Calificaciones |
| Assignments | Tareas |
| Quiz | Cuestionario |
| Enrollment | Inscripción |
| Reports | Reportes |
| Statistics | Estadísticas |
| Calendar | Calendario |
| Settings | Configuración |
| Profile | Perfil |
| Search | Buscar |
| Save | Guardar |
| Cancel | Cancelar |
| Delete | Eliminar |
| Edit | Editar |
| Create | Crear |
| Update | Actualizar |
| View | Ver |
| Close | Cerrar |
| Back | Regresar |
| Loading... | Cargando... |
| No results | No se encontraron resultados |
| Error loading data | Error al cargar los datos |
| Are you sure? | ¿Estás seguro? |
| This cannot be undone | Esta acción no se puede deshacer |
| Name | Nombre |
| Last name | Apellidos |
| Email | Correo electrónico |
| Password | Contraseña |
| Role | Rol |
| Status | Estado |
| Active | Activo |
| Inactive | Inactivo |
| Pending | Pendiente |
| Completed | Completado |
| Submitted | Enviado |

## Process
1. Read the file completely
2. Identify every English string visible to users
3. Apply translations from the dictionary above
4. For strings not in the dictionary, use correct Spanish with proper accents
5. Edit the file with all changes at once
6. Report a summary: how many strings were translated

## Quality Check
- All accents present: `á é í ó ú ñ ü ¿ ¡`
- No code identifiers were changed
- Meaning preserved (not just word-for-word)
- Concise enough to fit the UI (buttons, badges are short)
