// ==========================================
// 📁 src/app/features/admin/api/coursesApi.ts
// ==========================================

import { apiClient } from '@/lib/apiClient'
import type {
    Course,
    CourseStatus,
    CourseStats
} from '@/app/types/index'

// ==========================================
// 🔧 INTERFACES
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
    id?: string
}

// ==========================================
// 🌐 API METHODS
// ==========================================

export const coursesApi = {
    /**
     * Obtener todos los cursos con filtros opcionales
     */
    async getAll(filters: CourseFilters = {}): Promise<Course[]> {
        const params = new URLSearchParams()

        if (filters.search) params.append('search', filters.search)
        if (filters.status && filters.status !== 'all') params.append('status', filters.status)
        if (filters.teacherId) params.append('teacherId', filters.teacherId)
        if (filters.grade) params.append('grade', filters.grade)

        const queryString = params.toString()
        const url = `/api/admin/courses${queryString ? `?${queryString}` : ''}`

        const response = await apiClient.get<Course[]>(url)
        return response.data
    },

    /**
     * Obtener un curso por ID
     */
    async getById(id: string): Promise<Course> {
        const response = await apiClient.get<Course>(`/api/admin/courses/${id}`)
        return response.data
    },

    /**
     * Obtener estadísticas de cursos
     */
    async getStats(): Promise<CourseStats> {
        const response = await apiClient.get<CourseStats>('/api/admin/courses/stats')
        return response.data
    },

    /**
     * Crear un nuevo curso
     */
    async create(data: CreateCourseData): Promise<Course> {
        const response = await apiClient.post<Course>('/api/admin/courses', data)
        return response.data
    },

    /**
     * Actualizar un curso existente
     */
    async update(id: string, data: UpdateCourseData): Promise<Course> {
        const response = await apiClient.put<Course>(`/api/admin/courses/${id}`, data)
        return response.data
    },

    /**
     * Actualizar parcialmente un curso (PATCH)
     */
    async patch(id: string, data: Partial<UpdateCourseData>): Promise<Course> {
        const response = await apiClient.patch<Course>(`/api/admin/courses/${id}`, data)
        return response.data
    },

    /**
     * Eliminar un curso
     */
    async delete(id: string): Promise<void> {
        await apiClient.delete(`/api/admin/courses/${id}`)
    },

    /**
     * Cambiar el estado de un curso
     */
    async updateStatus(id: string, status: CourseStatus): Promise<Course> {
        const response = await apiClient.patch<Course>(
            `/api/admin/courses/${id}/status`,
            { status }
        )
        return response.data
    },

    /**
     * Archivar un curso
     */
    async archive(id: string): Promise<Course> {
        return this.updateStatus(id, 'ARCHIVED')
    },

    /**
     * Activar un curso
     */
    async activate(id: string): Promise<Course> {
        return this.updateStatus(id, 'ACTIVE')
    },

    /**
     * Archivar múltiples cursos
     */
    async archiveMultiple(ids: string[]): Promise<void> {
        await apiClient.post('/api/admin/courses/bulk/archive', { ids })
    },

    /**
     * Eliminar múltiples cursos
     */
    async deleteMultiple(ids: string[]): Promise<void> {
        await apiClient.post('/api/admin/courses/bulk/delete', { ids })
    },

    /**
     * Obtener cursos por profesor
     */
    async getByTeacher(teacherId: string): Promise<Course[]> {
        const response = await apiClient.get<Course[]>(
            `/api/admin/courses/teacher/${teacherId}`
        )
        return response.data
    },

    /**
     * Obtener estudiantes inscritos en un curso
     */
    async getEnrolledStudents(courseId: string): Promise<any[]> {
        const response = await apiClient.get(`/api/admin/courses/${courseId}/students`)
        return response.data
    },

    /**
     * Inscribir estudiante en un curso
     */
    async enrollStudent(courseId: string, studentId: string): Promise<void> {
        await apiClient.post(`/api/admin/courses/${courseId}/enroll`, { studentId })
    },

    /**
     * Desinscribir estudiante de un curso
     */
    async unenrollStudent(courseId: string, studentId: string): Promise<void> {
        await apiClient.post(`/api/admin/courses/${courseId}/unenroll`, { studentId })
    },

    /**
     * Duplicar un curso
     */
    async duplicate(id: string): Promise<Course> {
        const response = await apiClient.post<Course>(`/api/admin/courses/${id}/duplicate`)
        return response.data
    },

    /**
     * Exportar cursos
     */
    async export(filters: CourseFilters = {}): Promise<Blob> {
        const params = new URLSearchParams()
        if (filters.status && filters.status !== 'all') params.append('status', filters.status)

        const response = await apiClient.get(
            `/api/admin/courses/export?${params.toString()}`,
            { responseType: 'blob' }
        )
        return response.data
    },
}

// ==========================================
// 📦 EXPORT DEFAULT
// ==========================================

export default coursesApi