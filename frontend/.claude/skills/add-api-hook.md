---
name: add-api-hook
description: >
  Add a new API integration for BrainTrust. Creates the Axios client, TanStack Query
  cache keys, React Query hooks, TypeScript model, and Zod validation schema for
  a new backend endpoint. Follows the project's infraestructure/ pattern.
---

# Skill: Add API Hook

When the user runs `/add-api-hook`, ask:
1. What is the entity name? (e.g., "notification", "grade", "resource")
2. What CRUD operations are needed? (list / get-one / create / update / delete)
3. What is the Spring Boot endpoint base path? (e.g., `/api/notifications`)
4. What fields does the model have?
5. Is there a form that submits this data? (yes/no — determines if Zod schema needed)

Then create these files:

## File 1: `app/shared/models/[entity].model.ts`
```typescript
export interface [Entity]Model {
  id: string
  // fields from backend DTO
  createdAt: string
  updatedAt?: string
}

export interface Create[Entity]Dto {
  // required fields for POST
}

export interface Update[Entity]Dto {
  // fields for PUT (often Partial<Create[Entity]Dto>)
}
```

## File 2: `app/infraestructure/api/[entity]/[entity]-keys.ts`
```typescript
export const [entity]Keys = {
  all: ['[entity]'] as const,
  lists: () => [...[entity]Keys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...[entity]Keys.lists(), { filters }] as const,
  details: () => [...[entity]Keys.all, 'detail'] as const,
  detail: (id: string) => [...[entity]Keys.details(), id] as const,
}
```

## File 3: `app/infraestructure/api/[entity]/[entity]-api.ts`
```typescript
import axios from 'axios'
import type { [Entity]Model, Create[Entity]Dto, Update[Entity]Dto } from '@/app/shared/models/[entity].model'

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/[entities]`

export async function get[Entities](): Promise<[Entity]Model[]> {
  const { data } = await axios.get<[Entity]Model[]>(BASE)
  return data
}

export async function get[Entity](id: string): Promise<[Entity]Model> {
  const { data } = await axios.get<[Entity]Model>(`${BASE}/${id}`)
  return data
}

export async function create[Entity](payload: Create[Entity]Dto): Promise<[Entity]Model> {
  const { data } = await axios.post<[Entity]Model>(BASE, payload)
  return data
}

export async function update[Entity](id: string, payload: Update[Entity]Dto): Promise<[Entity]Model> {
  const { data } = await axios.put<[Entity]Model>(`${BASE}/${id}`, payload)
  return data
}

export async function delete[Entity](id: string): Promise<void> {
  await axios.delete(`${BASE}/${id}`)
}
```

## File 4: `app/infraestructure/api/[entity]/use-[entity].ts`
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { [entity]Keys } from './[entity]-keys'
import {
  get[Entities], get[Entity], create[Entity], update[Entity], delete[Entity]
} from './[entity]-api'
import type { Create[Entity]Dto, Update[Entity]Dto } from '@/app/shared/models/[entity].model'

export function use[Entities]() {
  return useQuery({
    queryKey: [entity]Keys.lists(),
    queryFn: get[Entities],
  })
}

export function use[Entity](id: string) {
  return useQuery({
    queryKey: [entity]Keys.detail(id),
    queryFn: () => get[Entity](id),
    enabled: !!id,
  })
}

export function useCreate[Entity]() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: create[Entity],
    onSuccess: () => qc.invalidateQueries({ queryKey: [entity]Keys.lists() }),
  })
}

export function useUpdate[Entity]() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Update[Entity]Dto }) =>
      update[Entity](id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [entity]Keys.all }),
  })
}

export function useDelete[Entity]() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: delete[Entity],
    onSuccess: () => qc.invalidateQueries({ queryKey: [entity]Keys.lists() }),
  })
}
```

## File 5 (if form needed): `lib/validation/[entity].schema.ts`
```typescript
import { z } from 'zod'

export const create[Entity]Schema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  // ... other fields with Spanish error messages
})

export const update[Entity]Schema = create[Entity]Schema.partial()

export type Create[Entity]Form = z.infer<typeof create[Entity]Schema>
export type Update[Entity]Form = z.infer<typeof update[Entity]Schema>
```

## Rules
- All Zod error messages in Spanish
- Always invalidate the right query keys after mutations
- Use `enabled: !!id` to avoid fetching when id is undefined
- Generic parameter on `axios.get<Type>` always specified
