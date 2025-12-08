// ==========================================
// 📁 src/app/features/admin/api/usersApi.ts
// ==========================================

import { apiClient } from '@/lib/apiClient'
import type {
    User,
    UserRole,
    UserStatus,
    UserStats
} from '@/app/types/index'

// ==========================================
// 🔧 INTERFACES
// ==========================================

export interface UserFilters {
    search?: string
    role?: UserRole | 'all'
    status?: UserStatus
    sortBy?: 'name' | 'email' | 'createdAt' | 'lastLogin'
    sortOrder?: 'asc' | 'desc'
    page?: number
    limit?: number
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
    id?: string
}

export interface PasswordResetResponse {
    message: string
    temporaryPassword?: string
}

// ==========================================
// 🌐 API METHODS
// ==========================================

export const usersApi = {
    /**
     * Obtener todos los usuarios con filtros opcionales
     */
    async getAll(filters: UserFilters = {}): Promise<User[]> {
        const params = new URLSearchParams()

        if (filters.search) params.append('search', filters.search)
        if (filters.role && filters.role !== 'all') params.append('role', filters.role)
        if (filters.status) params.append('status', filters.status)
        if (filters.sortBy) params.append('sortBy', filters.sortBy)
        if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)
        if (filters.page) params.append('page', filters.page.toString())
        if (filters.limit) params.append('limit', filters.limit.toString())

        const queryString = params.toString()
        const url = `/api/admin/users${queryString ? `?${queryString}` : ''}`

        const response = await apiClient.get<User[]>(url)
        return response.data
    },

    /**
     * Obtener un usuario por ID
     */
    async getById(id: string): Promise<User> {
        const response = await apiClient.get<User>(`/api/admin/users/${id}`)
        
        return response.data
    },

    /**
     * Obtener estadísticas de usuarios
     */
    async getStats(): Promise<UserStats> {
        const response = await apiClient.get<UserStats>('/api/admin/users/stats')
        return response.data
    },

    /**
     * Obtener usuarios por rol
     */
    async getByRole(role: UserRole): Promise<User[]> {
        const response = await apiClient.get<User[]>(`/api/admin/users/role/${role}`)
        return response.data
    },

    /**
     * Buscar usuarios
     */
    async search(searchTerm: string): Promise<User[]> {
        const response = await apiClient.get<User[]>(
            `/api/admin/users/search?q=${encodeURIComponent(searchTerm)}`
        )
        return response.data
    },

    /**
     * Crear un nuevo usuario
     */
    async create(data: CreateUserData): Promise<User> {
        const response = await apiClient.post<User>('/api/admin/users', data)
        return response.data
    },

    /**
     * Actualizar un usuario existente
     */
    async update(id: string, data: UpdateUserData): Promise<User> {
        const response = await apiClient.put<User>(`/api/admin/users/${id}`, data)
        return response.data
    },

    /**
     * Actualizar parcialmente un usuario (PATCH)
     */
    async patch(id: string, data: Partial<UpdateUserData>): Promise<User> {
        const response = await apiClient.patch<User>(`/api/admin/users/${id}`, data)
        return response.data
    },

    /**
     * Eliminar un usuario
     */
    async delete(id: string): Promise<void> {
        await apiClient.delete(`/api/admin/users/${id}`)
    },

    /**
     * Cambiar el estado de un usuario
     */
    async updateStatus(id: string, status: UserStatus): Promise<User> {
        const response = await apiClient.patch<User>(
            `/api/admin/users/${id}/status`,
            { status }
        )
        return response.data
    },

    /**
     * Cambiar el rol de un usuario
     */
    async updateRole(id: string, role: UserRole): Promise<User> {
        const response = await apiClient.patch<User>(
            `/api/admin/users/${id}/role`,
            { role }
        )
        return response.data
    },

    /**
     * Suspender un usuario
     */
    async suspend(id: string): Promise<User> {
        return this.updateStatus(id, 'SUSPENDED')
    },

    /**
     * Activar un usuario
     */
    async activate(id: string): Promise<User> {
        return this.updateStatus(id, 'ACTIVE')
    },

    /**
     * Desactivar un usuario
     */
    async deactivate(id: string): Promise<User> {
        return this.updateStatus(id, 'INACTIVE')
    },

    /**
     * Resetear la contraseña de un usuario
     */
    async resetPassword(id: string): Promise<PasswordResetResponse> {
        const response = await apiClient.post<PasswordResetResponse>(
            `/api/admin/users/${id}/reset-password`
        )
        return response.data
    },

    /**
     * Enviar email de verificación
     */
    async sendVerificationEmail(id: string): Promise<void> {
        await apiClient.post(`/api/admin/users/${id}/send-verification`)
    },

    /**
     * Eliminar múltiples usuarios
     */
    async bulkDelete(ids: string[]): Promise<void> {
        await apiClient.post('/api/admin/users/bulk/delete', { ids })
    },

    /**
     * Actualizar múltiples usuarios
     */
    async bulkUpdate(ids: string[], data: Partial<UpdateUserData>): Promise<void> {
        await apiClient.post('/api/admin/users/bulk/update', { ids, data })
    },

    /**
     * Exportar usuarios
     */
    async export(filters: UserFilters = {}): Promise<Blob> {
        const params = new URLSearchParams()
        if (filters.role && filters.role !== 'all') params.append('role', filters.role)
        if (filters.status) params.append('status', filters.status)

        const response = await apiClient.get(
            `/api/admin/users/export?${params.toString()}`,
            { responseType: 'blob' }
        )
        return response.data
    },

    /**
     * Importar usuarios desde CSV/Excel
     */
    async import(file: File): Promise<{ success: number; errors: any[] }> {
        const formData = new FormData()
        formData.append('file', file)

        const response = await apiClient.post('/api/admin/users/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },

    /**
     * Obtener cursos de un usuario
     */
    async getUserCourses(userId: string): Promise<any[]> {
        const response = await apiClient.get(`/api/admin/users/${userId}/courses`)
        return response.data
    },

    /**
     * Obtener actividad reciente de un usuario
     */
    async getUserActivity(userId: string, limit = 10): Promise<any[]> {
        const response = await apiClient.get(
            `/api/admin/users/${userId}/activity?limit=${limit}`
        )
        return response.data
    },

    /**
     * Obtener rendimiento de un usuario
     */
    async getUserPerformance(userId: string): Promise<any> {
        const response = await apiClient.get(`/api/admin/users/${userId}/performance`)
        return response.data
    },

    /**
     * Actualizar avatar de usuario
     */
    async updateAvatar(userId: string, file: File): Promise<User> {
        const formData = new FormData()
        formData.append('avatar', file)

        const response = await apiClient.post<User>(
            `/api/admin/users/${userId}/avatar`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        )
        return response.data
    },

    /**
     * Eliminar avatar de usuario
     */
    async deleteAvatar(userId: string): Promise<User> {
        const response = await apiClient.delete<User>(`/api/admin/users/${userId}/avatar`)
        return response.data
    },
}

// ==========================================
// 📦 EXPORT DEFAULT
// ==========================================

export default usersApi