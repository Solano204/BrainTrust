// ==========================================
// 📁 src/app/features/admin/hooks/useReports.ts
// ==========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportsApi } from '@/app/infraestructure/api/admin/reportsApi'
import type {
    CourseReport,
    StudentPerformance,
    OverviewStats,
    ReportPeriod,
    ExportFormat
} from '@/app/types/index'

// ==========================================
// 🔑 QUERY KEYS
// ==========================================

export const reportsKeys = {
    all: ['reports'] as const,
    overview: () => [...reportsKeys.all, 'overview'] as const,
    overviewByPeriod: (period: ReportPeriod) =>
        [...reportsKeys.overview(), period] as const,
    courses: () => [...reportsKeys.all, 'courses'] as const,
    courseReports: (filters: CourseReportFilters) =>
        [...reportsKeys.courses(), filters] as const,
    courseReport: (id: string) =>
        [...reportsKeys.courses(), 'detail', id] as const,
    students: () => [...reportsKeys.all, 'students'] as const,
    studentPerformance: (filters: StudentPerformanceFilters) =>
        [...reportsKeys.students(), filters] as const,
    studentDetail: (id: string) =>
        [...reportsKeys.students(), 'detail', id] as const,
    charts: () => [...reportsKeys.all, 'charts'] as const,
    chartData: (type: ChartType, period: ReportPeriod) =>
        [...reportsKeys.charts(), type, period] as const,
}

// ==========================================
// 📊 TYPES
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

// ==========================================
// 🎣 HOOKS - OVERVIEW & STATS
// ==========================================

/**
 * Hook para obtener estadísticas generales
 */
export function useOverviewStats(period: ReportPeriod = 'month') {
    return useQuery({
        queryKey: reportsKeys.overviewByPeriod(period),
        queryFn: () => reportsApi.getOverviewStats(period),
        staleTime: 1000 * 60 * 5, // 5 minutos
    })
}

/**
 * Hook para obtener datos de gráficos
 */
export function useChartData(type: ChartType, period: ReportPeriod = 'week') {
    return useQuery({
        queryKey: reportsKeys.chartData(type, period),
        queryFn: () => reportsApi.getChartData(type, period),
        staleTime: 1000 * 60 * 10, // 10 minutos
    })
}

// ==========================================
// 🎣 HOOKS - COURSE REPORTS
// ==========================================

/**
 * Hook para obtener reportes de cursos
 */
export function useCourseReports(filters: CourseReportFilters = {}) {
    return useQuery({
        queryKey: reportsKeys.courseReports(filters),
        queryFn: () => reportsApi.getCourseReports(filters),
        staleTime: 1000 * 60 * 5,
    })
}

/**
 * Hook para obtener reporte detallado de un curso específico
 */
export function useCourseReport(courseId: string | undefined) {
    return useQuery({
        queryKey: reportsKeys.courseReport(courseId || ''),
        queryFn: () => reportsApi.getCourseReportById(courseId!),
        enabled: !!courseId,
        staleTime: 1000 * 60 * 5,
    })
}

// ==========================================
// 🎣 HOOKS - STUDENT PERFORMANCE
// ==========================================

/**
 * Hook para obtener rendimiento de estudiantes
 */
export function useStudentPerformance(filters: StudentPerformanceFilters = {}) {
    return useQuery({
        queryKey: reportsKeys.studentPerformance(filters),
        queryFn: () => reportsApi.getStudentPerformance(filters),
        staleTime: 1000 * 60 * 5,
    })
}

/**
 * Hook para obtener rendimiento detallado de un estudiante
 */
export function useStudentDetail(studentId: string | undefined) {
    return useQuery({
        queryKey: reportsKeys.studentDetail(studentId || ''),
        queryFn: () => reportsApi.getStudentDetailReport(studentId!),
        enabled: !!studentId,
        staleTime: 1000 * 60 * 5,
    })
}

// ==========================================
// 🎣 HOOKS - EXPORTS
// ==========================================

/**
 * Hook para exportar reporte de cursos
 */
export function useExportCourseReports() {
    return useMutation({
        mutationFn: (options: ExportOptions) =>
            reportsApi.exportCourseReports(options),
    })
}

/**
 * Hook para exportar rendimiento de estudiantes
 */
export function useExportStudentPerformance() {
    return useMutation({
        mutationFn: (options: ExportOptions) =>
            reportsApi.exportStudentPerformance(options),
    })
}

/**
 * Hook para exportar reporte completo
 */
export function useExportFullReport() {
    return useMutation({
        mutationFn: (options: ExportOptions & { period: ReportPeriod }) =>
            reportsApi.exportFullReport(options),
    })
}

// ==========================================
// 🎣 HOOKS - ANALYTICS
// ==========================================

/**
 * Hook para obtener tendencias de rendimiento
 */
export function usePerformanceTrends(period: ReportPeriod = 'month') {
    return useQuery({
        queryKey: [...reportsKeys.all, 'trends', period],
        queryFn: () => reportsApi.getPerformanceTrends(period),
        staleTime: 1000 * 60 * 15, // 15 minutos
    })
}

/**
 * Hook para obtener comparativas entre cursos
 */
export function useCourseComparisons(courseIds: string[]) {
    return useQuery({
        queryKey: [...reportsKeys.courses(), 'comparison', courseIds],
        queryFn: () => reportsApi.compareCourses(courseIds),
        enabled: courseIds.length >= 2,
        staleTime: 1000 * 60 * 10,
    })
}

/**
 * Hook para obtener métricas de engagement
 */
export function useEngagementMetrics(period: ReportPeriod = 'week') {
    return useQuery({
        queryKey: [...reportsKeys.all, 'engagement', period],
        queryFn: () => reportsApi.getEngagementMetrics(period),
        staleTime: 1000 * 60 * 10,
    })
}

// ==========================================
// 🎣 HOOKS COMPUESTOS
// ==========================================

/**
 * Hook que combina todos los datos del dashboard de reportes
 */
export function useReportsDashboard(period: ReportPeriod = 'month') {
    const overviewQuery = useOverviewStats(period)
    const gradesChartQuery = useChartData('grades-weekly', period)
    const assignmentsChartQuery = useChartData('assignments-weekly', period)
    const trendsQuery = usePerformanceTrends(period)

    return {
        overview: overviewQuery.data,
        gradesChart: gradesChartQuery.data,
        assignmentsChart: assignmentsChartQuery.data,
        trends: trendsQuery.data,
        isLoading:
            overviewQuery.isLoading ||
            gradesChartQuery.isLoading ||
            assignmentsChartQuery.isLoading ||
            trendsQuery.isLoading,
        isError:
            overviewQuery.isError ||
            gradesChartQuery.isError ||
            assignmentsChartQuery.isError ||
            trendsQuery.isError,
        error:
            overviewQuery.error ||
            gradesChartQuery.error ||
            assignmentsChartQuery.error ||
            trendsQuery.error,
    }
}

/**
 * Hook para vista completa de reportes de cursos con exportación
 */
export function useCourseReportsWithExport(filters: CourseReportFilters = {}) {
    const reportsQuery = useCourseReports(filters)
    const exportMutation = useExportCourseReports()

    const handleExport = async (format: ExportFormat) => {
        try {
            const blob = await exportMutation.mutateAsync({
                format,
                includeCharts: true
            })

            // Crear link de descarga
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `course-reports-${new Date().toISOString()}.${format}`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Error exporting reports:', error)
            throw error
        }
    }

    return {
        reports: reportsQuery.data,
        isLoading: reportsQuery.isLoading,
        isError: reportsQuery.isError,
        error: reportsQuery.error,
        exportReport: handleExport,
        isExporting: exportMutation.isPending,
    }
}

/**
 * Hook para análisis completo de un estudiante
 */
export function useStudentAnalysis(studentId: string | undefined) {
    const detailQuery = useStudentDetail(studentId)
    const performanceQuery = useStudentPerformance({
        search: studentId
    })

    return {
        detail: detailQuery.data,
        performance: performanceQuery.data?.[0],
        isLoading: detailQuery.isLoading || performanceQuery.isLoading,
        isError: detailQuery.isError || performanceQuery.isError,
        error: detailQuery.error || performanceQuery.error,
    }
}

/**
 * Hook para refrescar todos los reportes
 */
export function useRefreshReports() {
    const queryClient = useQueryClient()

    return () => {
        queryClient.invalidateQueries({ queryKey: reportsKeys.all })
    }
}