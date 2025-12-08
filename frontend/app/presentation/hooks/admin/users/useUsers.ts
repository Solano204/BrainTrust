// ==========================================
// 📁 src/app/features/admin/hooks/useUsers.ts
// ==========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/app/infraestructure/api/admin/usersApi'
import type { User, UserRole, UserStatus } from '@/app/types/index'

// ==========================================
// 🔑 QUERY KEYS
// ==========================================

export const usersKeys = {
    all: ['users'] as const,
    lists: () => [...usersKeys.all, 'list'] as const,
    list: (filters: UserFilters) => [...usersKeys.lists(), filters] as const,
    details: () => [...usersKeys.all, 'detail'] as const,
    detail: (id: string) => [...usersKeys.details(), id] as const,
    stats: () => [...usersKeys.all, 'stats'] as const,
    byRole: (role: UserRole) => [...usersKeys.all, 'role', role] as const,
}

// ==========================================
// 📊 TYPES
// ==========================================

export interface UserFilters {
    search?: string
    role?: UserRole | 'all'
    status?: UserStatus
    sortBy?: 'name' | 'email' | 'createdAt' | 'lastLogin'
    sortOrder?: 'asc' | 'desc'
}

export interface CreateUserData {
    firstName: string
    lastName: string
    email: string
    phone?: string
    role: UserRole
    status?: UserStatus
    password?: string
}

export interface UpdateUserData extends Partial<CreateUserData> {
    id: string
}

export interface UserStats {
    total: number
    active: number
    inactive: number
    suspended: number
    teachers: number
    students: number
    admins: number
}

// ==========================================
// 🎣 HOOKS - GET
// ==========================================

/**
 * Hook para obtener todos los usuarios con filtros opcionales
 */
export function useUsers(filters: UserFilters = {}) {
    return useQuery({
        queryKey: usersKeys.list(filters),
        queryFn: () => usersApi.getAll(filters),
        staleTime: 1000 * 60 * 5, // 5 minutos
    })
}

/**
 * Hook para obtener un usuario por ID
 */
export function useUser(id: string | undefined) {
    return useQuery({
        queryKey: usersKeys.detail(id || ''),
        queryFn: () => usersApi.getById(id!),
        enabled: !!id,
    })
}

/**
 * Hook para obtener estadísticas de usuarios
 */
export function useUserStats() {
    return useQuery({
        queryKey: usersKeys.stats(),
        queryFn: () => usersApi.getStats(),
        staleTime: 1000 * 60 * 10, // 10 minutos
    })
}

/**
 * Hook para obtener usuarios por rol
 */
export function useUsersByRole(role: UserRole) {
    return useQuery({
        queryKey: usersKeys.byRole(role),
        queryFn: () => usersApi.getByRole(role),
        staleTime: 1000 * 60 * 5,
    })
}

/**
 * Hook para buscar usuarios (con debounce implícito en el componente)
 */
export function useSearchUsers(searchTerm: string) {
    return useQuery({
        queryKey: [...usersKeys.lists(), { search: searchTerm }],
        queryFn: () => usersApi.search(searchTerm),
        enabled: searchTerm.length >= 3,
        staleTime: 1000 * 60 * 2,
    })
}

// ==========================================
// 🎣 HOOKS - MUTATIONS
// ==========================================

/**
 * Hook para crear un nuevo usuario
 */
export function useCreateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateUserData) => usersApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
            queryClient.invalidateQueries({ queryKey: usersKeys.stats() })
        },
    })
}

/**
 * Hook para actualizar un usuario
 */
export function useUpdateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: UpdateUserData) => usersApi.update(data.id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: usersKeys.detail(variables.id)
            })
            queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
            queryClient.invalidateQueries({ queryKey: usersKeys.stats() })
        },
    })
}

/**
 * Hook para eliminar un usuario
 */
export function useDeleteUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => usersApi.delete(id),
        onSuccess: (_, id) => {
            queryClient.removeQueries({ queryKey: usersKeys.detail(id) })
            queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
            queryClient.invalidateQueries({ queryKey: usersKeys.stats() })
        },
    })
}

/**
 * Hook para cambiar el estado de un usuario
 */
export function useUpdateUserStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
            usersApi.updateStatus(id, status),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) })
            queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
            queryClient.invalidateQueries({ queryKey: usersKeys.stats() })
        },
    })
}

/**
 * Hook para cambiar el rol de un usuario
 */
export function useUpdateUserRole() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
            usersApi.updateRole(id, role),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) })
            queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
            queryClient.invalidateQueries({ queryKey: usersKeys.stats() })
        },
    })
}

/**
 * Hook para suspender un usuario
 */
export function useSuspendUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => usersApi.suspend(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) })
            queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
            queryClient.invalidateQueries({ queryKey: usersKeys.stats() })
        },
    })
}

/**
 * Hook para reactivar un usuario
 */
export function useActivateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => usersApi.activate(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) })
            queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
            queryClient.invalidateQueries({ queryKey: usersKeys.stats() })
        },
    })
}

/**
 * Hook para resetear la contraseña de un usuario
 */
export function useResetUserPassword() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => usersApi.resetPassword(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) })
        },
    })
}

/**
 * Hook para eliminar múltiples usuarios
 */
export function useBulkDeleteUsers() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (ids: string[]) => usersApi.bulkDelete(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
            queryClient.invalidateQueries({ queryKey: usersKeys.stats() })
        },
    })
}

// ==========================================
// 🎣 HOOKS COMPUESTOS
// ==========================================

/**
 * Hook que combina datos de usuarios y estadísticas
 */
export function useUsersWithStats(filters: UserFilters = {}) {
    const usersQuery = useUsers(filters)
    const statsQuery = useUserStats()

    return {
        users: usersQuery.data,
        stats: statsQuery.data,
        isLoading: usersQuery.isLoading || statsQuery.isLoading,
        isError: usersQuery.isError || statsQuery.isError,
        error: usersQuery.error || statsQuery.error,
    }
}

/**
 * Hook para gestión completa de un usuario (detalle + acciones)
 */
export function useUserManagement(id: string | undefined) {
    const userQuery = useUser(id)
    const updateMutation = useUpdateUser()
    const deleteMutation = useDeleteUser()
    const updateStatusMutation = useUpdateUserStatus()
    const updateRoleMutation = useUpdateUserRole()

    return {
        user: userQuery.data,
        isLoading: userQuery.isLoading,
        isError: userQuery.isError,
        error: userQuery.error,
        update: updateMutation.mutateAsync,
        delete: deleteMutation.mutateAsync,
        updateStatus: updateStatusMutation.mutateAsync,
        updateRole: updateRoleMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    }
}