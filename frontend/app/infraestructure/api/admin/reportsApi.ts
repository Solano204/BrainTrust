// ==========================================
// 📁 src/app/features/admin/api/reportsApi.ts
// ==========================================

import { apiClient } from '@/lib/apiClient'
import type {
  CourseReport,
  StudentPerformance,
  OverviewStats,
  ReportPeriod,
  ExportFormat,
  ChartDataPoint,
  PerformanceTrend,
  EngagementMetrics
} from '@/app/types/index'

// ==========================================
// 🔧 INTERFACES
// ==========================================

export interface CourseReportFilters {
  search?: string
  minCompletionRate?: number
  maxCompletionRate?: number
  minAverageGrade?: number
  sortBy?: 'name' | 'completionRate' | 'averageGrade' | 'enrolledStudents'
  sortOrder?: 'asc' | 'desc'
}

export interface StudentPerformanceFilters {
  search?: string
  minGrade?: number
  courseId?: string
  sortBy?: 'name' | 'averageGrade' | 'assignmentsCompleted'
  sortOrder?: 'asc' | 'desc'
}

export type ChartType =
  | 'grades-weekly'
  | 'assignments-weekly'
  | 'enrollment-trend'
  | 'completion-rate'
  | 'activity-heatmap'

export interface ExportOptions {
  format: ExportFormat
  includeCharts?: boolean
  dateRange?: {
    start: string
    end: string
  }
}

export interface DateRangeParams {
  startDate?: string
  endDate?: string
}

// ==========================================
// 🌐 API METHODS
// ==========================================

export const reportsApi = {
  // ==========================================
  // 📊 OVERVIEW & STATS
  // ==========================================

  /**
   * Obtener estadísticas generales del sistema
   */
  async getOverviewStats(period: ReportPeriod = 'month'): Promise<OverviewStats> {
    const response = await apiClient.get<OverviewStats>(
      `/api/admin/reports/overview?period=${period}`
    )
    return response.data
  },

  /**
   * Obtener datos para gráficos
   */
  async getChartData(
    type: ChartType,
    period: ReportPeriod = 'week'
  ): Promise<ChartDataPoint[]> {
    const response = await apiClient.get<ChartDataPoint[]>(
      `/api/admin/reports/charts/${type}?period=${period}`
    )
    return response.data
  },

  // ==========================================
  // 📚 COURSE REPORTS
  // ==========================================

  /**
   * Obtener reportes de cursos
   */
  async getCourseReports(filters: CourseReportFilters = {}): Promise<CourseReport[]> {
    const params = new URLSearchParams()

    if (filters.search) params.append('search', filters.search)
    if (filters.minCompletionRate)
      params.append('minCompletionRate', filters.minCompletionRate.toString())
    if (filters.maxCompletionRate)
      params.append('maxCompletionRate', filters.maxCompletionRate.toString())
    if (filters.minAverageGrade)
      params.append('minAverageGrade', filters.minAverageGrade.toString())
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

    const queryString = params.toString()
    const url = `/api/admin/reports/courses${queryString ? `?${queryString}` : ''}`

    const response = await apiClient.get<CourseReport[]>(url)
    return response.data
  },

  /**
   * Obtener reporte detallado de un curso específico
   */
  async getCourseReportById(courseId: string): Promise<CourseReport & any> {
    const response = await apiClient.get(`/api/admin/reports/courses/${courseId}`)
    return response.data
  },

  /**
   * Obtener comparativa entre cursos
   */
  async compareCourses(courseIds: string[]): Promise<any> {
    const response = await apiClient.post('/api/admin/reports/courses/compare', {
      courseIds,
    })
    return response.data
  },

  // ==========================================
  // 👥 STUDENT PERFORMANCE
  // ==========================================

  /**
   * Obtener rendimiento de estudiantes
   */
  async getStudentPerformance(
    filters: StudentPerformanceFilters = {}
  ): Promise<StudentPerformance[]> {
    const params = new URLSearchParams()

    if (filters.search) params.append('search', filters.search)
    if (filters.minGrade) params.append('minGrade', filters.minGrade.toString())
    if (filters.courseId) params.append('courseId', filters.courseId)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

    const queryString = params.toString()
    const url = `/api/admin/reports/students${queryString ? `?${queryString}` : ''}`

    const response = await apiClient.get<StudentPerformance[]>(url)
    return response.data
  },

  /**
   * Obtener reporte detallado de un estudiante
   */
  async getStudentDetailReport(studentId: string): Promise<StudentPerformance & any> {
    const response = await apiClient.get(`/api/admin/reports/students/${studentId}`)
    return response.data
  },

  /**
   * Obtener progreso de un estudiante en un curso
   */
  async getStudentCourseProgress(studentId: string, courseId: string): Promise<any> {
    const response = await apiClient.get(
      `/api/admin/reports/students/${studentId}/courses/${courseId}`
    )
    return response.data
  },

  // ==========================================
  // 📈 ANALYTICS & TRENDS
  // ==========================================

  /**
   * Obtener tendencias de rendimiento
   */
  async getPerformanceTrends(period: ReportPeriod = 'month'): Promise<PerformanceTrend[]> {
    const response = await apiClient.get<PerformanceTrend[]>(
      `/api/admin/reports/trends?period=${period}`
    )
    return response.data
  },

  /**
   * Obtener métricas de engagement
   */
  async getEngagementMetrics(period: ReportPeriod = 'week'): Promise<EngagementMetrics> {
    const response = await apiClient.get<EngagementMetrics>(
      `/api/admin/reports/engagement?period=${period}`
    )
    return response.data
  },

  /**
   * Obtener análisis de completitud
   */
  async getCompletionAnalysis(dateRange?: DateRangeParams): Promise<any> {
    const params = new URLSearchParams()
    if (dateRange?.startDate) params.append('startDate', dateRange.startDate)
    if (dateRange?.endDate) params.append('endDate', dateRange.endDate)

    const response = await apiClient.get(
      `/api/admin/reports/completion-analysis?${params.toString()}`
    )
    return response.data
  },

  /**
   * Obtener análisis de actividad por hora del día
   */
  async getActivityHeatmap(period: ReportPeriod = 'week'): Promise<any> {
    const response = await apiClient.get(
      `/api/admin/reports/activity-heatmap?period=${period}`
    )
    return response.data
  },

  // ==========================================
  // 📥 EXPORTS
  // ==========================================

  /**
   * Exportar reportes de cursos
   */
  async exportCourseReports(options: ExportOptions): Promise<Blob> {
    const params = new URLSearchParams()
    params.append('format', options.format)
    if (options.includeCharts) params.append('includeCharts', 'true')
    if (options.dateRange?.start) params.append('startDate', options.dateRange.start)
    if (options.dateRange?.end) params.append('endDate', options.dateRange.end)

    const response = await apiClient.get(
      `/api/admin/reports/courses/export?${params.toString()}`,
      { responseType: 'blob' }
    )
    return response.data
  },

  /**
   * Exportar rendimiento de estudiantes
   */
  async exportStudentPerformance(options: ExportOptions): Promise<Blob> {
    const params = new URLSearchParams()
    params.append('format', options.format)
    if (options.includeCharts) params.append('includeCharts', 'true')
    if (options.dateRange?.start) params.append('startDate', options.dateRange.start)
    if (options.dateRange?.end) params.append('endDate', options.dateRange.end)

    const response = await apiClient.get(
      `/api/admin/reports/students/export?${params.toString()}`,
      { responseType: 'blob' }
    )
    return response.data
  },

  /**
   * Exportar reporte completo del sistema
   */
  async exportFullReport(
    options: ExportOptions & { period: ReportPeriod }
  ): Promise<Blob> {
    const params = new URLSearchParams()
    params.append('format', options.format)
    params.append('period', options.period)
    if (options.includeCharts) params.append('includeCharts', 'true')
    if (options.dateRange?.start) params.append('startDate', options.dateRange.start)
    if (options.dateRange?.end) params.append('endDate', options.dateRange.end)

    const response = await apiClient.get(
      `/api/admin/reports/full/export?${params.toString()}`,
      { responseType: 'blob' }
    )
    return response.data
  },

  /**
   * Exportar gráfico específico
   */
  async exportChart(type: ChartType, period: ReportPeriod = 'week'): Promise<Blob> {
    const response = await apiClient.get(
      `/api/admin/reports/charts/${type}/export?period=${period}`,
      { responseType: 'blob' }
    )
    return response.data
  },

  // ==========================================
  // 📧 SCHEDULED REPORTS
  // ==========================================

  /**
   * Programar envío de reportes
   */
  async scheduleReport(config: {
    type: 'course' | 'student' | 'full'
    frequency: 'daily' | 'weekly' | 'monthly'
    recipients: string[]
    format: ExportFormat
  }): Promise<any> {
    const response = await apiClient.post('/api/admin/reports/schedule', config)
    return response.data
  },

  /**
   * Obtener reportes programados
   */
  async getScheduledReports(): Promise<any[]> {
    const response = await apiClient.get('/api/admin/reports/schedule')
    return response.data
  },

  /**
   * Eliminar reporte programado
   */
  async deleteScheduledReport(id: string): Promise<void> {
    await apiClient.delete(`/api/admin/reports/schedule/${id}`)
  },

  // ==========================================
  // 🔍 CUSTOM QUERIES
  // ==========================================

  /**
   * Ejecutar query personalizado
   */
  async executeCustomQuery(query: {
    metrics: string[]
    filters: Record<string, any>
    groupBy?: string[]
    dateRange?: DateRangeParams
  }): Promise<any> {
    const response = await apiClient.post('/api/admin/reports/custom-query', query)
    return response.data
  },

  /**
   * Obtener plantillas de reportes guardadas
   */
  async getSavedTemplates(): Promise<any[]> {
    const response = await apiClient.get('/api/admin/reports/templates')
    return response.data
  },

  /**
   * Guardar plantilla de reporte
   */
  async saveTemplate(template: {
    name: string
    description?: string
    config: any
  }): Promise<any> {
    const response = await apiClient.post('/api/admin/reports/templates', template)
    return response.data
  },

  /**
   * Eliminar plantilla guardada
   */
  async deleteTemplate(id: string): Promise<void> {
    await apiClient.delete(`/api/admin/reports/templates/${id}`)
  },
}

// ==========================================
// 📦 EXPORT DEFAULT
// ==========================================

export default reportsApi