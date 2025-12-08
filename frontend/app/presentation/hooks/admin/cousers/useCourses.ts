// ==========================================
// 📁 src/app/features/admin/hooks/useCourses.ts
// ==========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { coursesApi } from '@/app/infraestructure/api/admin/coursesApi'
import type { Course, CourseStatus } from '@/app/types/index'
// ==========================================
// 🔑 QUERY KEYS
// ==========================================

export const coursesKeys = {
    all: ['courses'] as const,
    lists: () => [...coursesKeys.all, 'list'] as const,
    list: (filters: CourseFilters) => [...coursesKeys.lists(), filters] as const,
    details: () => [...coursesKeys.all, 'detail'] as const,
    detail: (id: string) => [...coursesKeys.details(), id] as const,
    stats: () => [...coursesKeys.all, 'stats'] as const,
}

// ==========================================
// 📊 TYPES
// ==========================================

export interface CourseFilters {
    search?: string
    status?: CourseStatus | 'all'
    teacherId?: string
    grade?: string
}

export interface CreateCourseData {
    name: string
    code: string
    description?: string
    grade?: string
    group?: string
    urlImage?: string
    maxStudents: number
    startDate?: string
    endDate?: string
    status: CourseStatus
}

export interface UpdateCourseData extends Partial<CreateCourseData> {
    id: string
}

// ==========================================
// 🎣 HOOKS - GET
// ==========================================

/**
 * Hook para obtener todos los cursos con filtros opcionales
 */
export function useCourses(filters: CourseFilters = {}) {
    return useQuery({
        queryKey: coursesKeys.list(filters),
        queryFn: () => coursesApi.getAll(filters),
        staleTime: 1000 * 60 * 5, // 5 minutos
    })
}

/**
 * Hook para obtener un curso por ID
 */
export function useCourse(id: string | undefined) {
    return useQuery({
        queryKey: coursesKeys.detail(id || ''),
        queryFn: () => coursesApi.getById(id!),
        enabled: !!id,
    })
}

/**
 * Hook para obtener estadísticas de cursos
 */
export function useCourseStats() {
    return useQuery({
        queryKey: coursesKeys.stats(),
        queryFn: () => coursesApi.getStats(),
        staleTime: 1000 * 60 * 10, // 10 minutos
    })
}

// ==========================================
// 🎣 HOOKS - MUTATIONS
// ==========================================

/**
 * Hook para crear un nuevo curso
 */
export function useCreateCourse() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateCourseData) => coursesApi.create(data),
        onSuccess: () => {
            // Invalidar todas las listas de cursos
            queryClient.invalidateQueries({ queryKey: coursesKeys.lists() })
            queryClient.invalidateQueries({ queryKey: coursesKeys.stats() })
        },
    })
}

/**
 * Hook para actualizar un curso existente
 */
export function useUpdateCourse() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: UpdateCourseData) => coursesApi.update(data.id, data),
        onSuccess: (_, variables) => {
            // Invalidar el detalle específico del curso
            queryClient.invalidateQueries({
                queryKey: coursesKeys.detail(variables.id)
            })
            // Invalidar las listas
            queryClient.invalidateQueries({ queryKey: coursesKeys.lists() })
            queryClient.invalidateQueries({ queryKey: coursesKeys.stats() })
        },
    })
}

/**
 * Hook para eliminar un curso
 */
export function useDeleteCourse() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => coursesApi.delete(id),
        onSuccess: (_, id) => {
            // Remover el curso del cache
            queryClient.removeQueries({ queryKey: coursesKeys.detail(id) })
            // Invalidar las listas
            queryClient.invalidateQueries({ queryKey: coursesKeys.lists() })
            queryClient.invalidateQueries({ queryKey: coursesKeys.stats() })
        },
    })
}

/**
 * Hook para cambiar el estado de un curso
 */
export function useUpdateCourseStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: CourseStatus }) =>
            coursesApi.updateStatus(id, status),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: coursesKeys.detail(id) })
            queryClient.invalidateQueries({ queryKey: coursesKeys.lists() })
            queryClient.invalidateQueries({ queryKey: coursesKeys.stats() })
        },
    })
}

/**
 * Hook para archivar múltiples cursos
 */
export function useArchiveCourses() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (ids: string[]) => coursesApi.archiveMultiple(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: coursesKeys.lists() })
            queryClient.invalidateQueries({ queryKey: coursesKeys.stats() })
        },
    })
}

// ==========================================
// 🎣 HOOKS COMPUESTOS
// ==========================================

/**
 * Hook que combina datos de cursos y estadísticas
 */
export function useCoursesWithStats(filters: CourseFilters = {}) {
    const coursesQuery = useCourses(filters)
    const statsQuery = useCourseStats()

    return {
        courses: coursesQuery.data,
        stats: statsQuery.data,
        isLoading: coursesQuery.isLoading || statsQuery.isLoading,
        isError: coursesQuery.isError || statsQuery.isError,
        error: coursesQuery.error || statsQuery.error,
    }
}