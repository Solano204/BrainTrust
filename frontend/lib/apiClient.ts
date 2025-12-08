// ==========================================
// 📁 src/lib/apiClient.ts
// ==========================================

import axios, {
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig
} from 'axios'

// ==========================================
// 🔧 CONFIGURACIÓN
// ==========================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const API_TIMEOUT = 30000 // 30 segundos

// ==========================================
// 📦 TIPOS
// ==========================================

export interface ApiResponse<T = any> {
    data: T
    message?: string
    success: boolean
    errors?: Record<string, string[]>
}

export interface ApiError {
    message: string
    code?: string
    statusCode?: number
    errors?: Record<string, string[]>
}

// ==========================================
// 🌐 CREAR INSTANCIA DE AXIOS
// ==========================================

const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true, // Para enviar cookies
})

// ==========================================
// 🔐 INTERCEPTOR DE REQUEST
// ==========================================

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Obtener token del localStorage o cookies
        const token = getAuthToken()

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // Log en desarrollo
        if (process.env.NODE_ENV === 'development') {
            console.log('🚀 Request:', {
                method: config.method?.toUpperCase(),
                url: config.url,
                data: config.data,
            })
        }

        return config
    },
    (error) => {
        console.error('❌ Request Error:', error)
        return Promise.reject(error)
    }
)

// ==========================================
// 📥 INTERCEPTOR DE RESPONSE
// ==========================================

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        // Log en desarrollo
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Response:', {
                status: response.status,
                data: response.data,
            })
        }

        return response
    },
    async (error) => {
        const originalRequest = error.config

        // Log del error
        console.error('❌ Response Error:', {
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            url: error.config?.url,
        })

        // Manejo de errores específicos
        if (error.response) {
            const { status } = error.response

            switch (status) {
                case 401:
                    // Token expirado o inválido
                    if (!originalRequest._retry) {
                        originalRequest._retry = true

                        try {
                            // Intentar refrescar el token
                            const newToken = await refreshAuthToken()

                            if (newToken) {
                                originalRequest.headers.Authorization = `Bearer ${newToken}`
                                return axiosInstance(originalRequest)
                            }
                        } catch (refreshError) {
                            // Si falla el refresh, redirigir al login
                            handleLogout()
                            return Promise.reject(refreshError)
                        }
                    }
                    break

                case 403:
                    // Sin permisos
                    console.error('⛔ Acceso denegado')
                    break

                case 404:
                    // Recurso no encontrado
                    console.error('🔍 Recurso no encontrado')
                    break

                case 422:
                    // Error de validación
                    console.error('⚠️ Error de validación:', error.response.data.errors)
                    break

                case 500:
                    // Error del servidor
                    console.error('🔥 Error del servidor')
                    break

                default:
                    console.error('❓ Error desconocido')
            }
        } else if (error.request) {
            // Request hecho pero sin respuesta
            console.error('🌐 Sin respuesta del servidor')
        } else {
            // Error al configurar el request
            console.error('⚙️ Error de configuración:', error.message)
        }

        return Promise.reject(formatError(error))
    }
)

// ==========================================
// 🛠️ UTILIDADES
// ==========================================

/**
 * Obtener token de autenticación
 */
function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null

    // Desde localStorage
    const token = localStorage.getItem('auth_token')

    // O desde cookies
    // const token = document.cookie
    //   .split('; ')
    //   .find(row => row.startsWith('auth_token='))
    //   ?.split('=')[1]

    return token
}

/**
 * Guardar token de autenticación
 */
function setAuthToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('auth_token', token)
}

/**
 * Eliminar token de autenticación
 */
function removeAuthToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('auth_token')
}

/**
 * Refrescar token de autenticación
 */
async function refreshAuthToken(): Promise<string | null> {
    try {
        const refreshToken = localStorage.getItem('refresh_token')

        if (!refreshToken) return null

        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken,
        })

        const { token } = response.data
        setAuthToken(token)

        return token
    } catch (error) {
        console.error('Error refreshing token:', error)
        return null
    }
}

/**
 * Manejar logout
 */
function handleLogout(): void {
    removeAuthToken()
    localStorage.removeItem('refresh_token')

    // Redirigir al login
    if (typeof window !== 'undefined') {
        window.location.href = '/login'
    }
}

/**
 * Formatear error para React Query
 */
function formatError(error: any): ApiError {
    if (error.response) {
        return {
            message: error.response.data?.message || 'Error en la petición',
            code: error.response.data?.code,
            statusCode: error.response.status,
            errors: error.response.data?.errors,
        }
    }

    if (error.request) {
        return {
            message: 'No se pudo conectar con el servidor',
            code: 'NETWORK_ERROR',
        }
    }

    return {
        message: error.message || 'Error desconocido',
        code: 'UNKNOWN_ERROR',
    }
}

// ==========================================
// 🎯 API CLIENT
// ==========================================

export const apiClient = {
    /**
     * GET request
     */
    get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return axiosInstance.get<T>(url, config)
    },

    /**
     * POST request
     */
    post: <T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> => {
        return axiosInstance.post<T>(url, data, config)
    },

    /**
     * PUT request
     */
    put: <T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> => {
        return axiosInstance.put<T>(url, data, config)
    },

    /**
     * PATCH request
     */
    patch: <T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> => {
        return axiosInstance.patch<T>(url, data, config)
    },

    /**
     * DELETE request
     */
    delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return axiosInstance.delete<T>(url, config)
    },

    /**
     * Request genérico
     */
    request: <T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return axiosInstance.request<T>(config)
    },
}

// ==========================================
// 🔧 HELPERS ADICIONALES
// ==========================================

/**
 * Helper para manejar uploads de archivos
 */
export async function uploadFile(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)

    const config: AxiosRequestConfig = {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                onProgress(progress)
            }
        },
    }

    const response = await apiClient.post(url, formData, config)
    return response.data
}

/**
 * Helper para descargar archivos
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
    const response = await apiClient.get(url, { responseType: 'blob' })

    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
}

// ==========================================
// 📦 EXPORT
// ==========================================

export default apiClient

// Exportar utilidades adicionales
export {
    getAuthToken,
    setAuthToken,
    removeAuthToken,
    refreshAuthToken,
    handleLogout,
}