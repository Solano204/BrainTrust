// ==========================================
// 📁 src/app/features/admin/types/index.ts
// ==========================================

// ==========================================
// 🎓 COURSES TYPES
// ==========================================

export type CourseStatus = 'ACTIVE' | 'ARCHIVED' | 'DRAFT'

export interface Course {
    id: string
    name: string
    code: string
    description: string
    grade: string
    group: string
    urlImage: string
    teacherId: string
    teacherName: string
    status: CourseStatus
    enrolledStudents: number
    maxStudents: number
    unitsCount: number
    startDate: string
    endDate: string
    createdAt: string
    updatedAt?: string
}

export interface CourseStats {
    total: number
    active: number
    archived: number
    draft: number
    totalStudents: number
    avgEnrollment: number
}

// ==========================================
// 👥 USERS TYPES
// ==========================================

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT'
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

export interface User {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    role: UserRole
    status: UserStatus
    createdAt: string
    updatedAt?: string
    lastLogin: string | null
    coursesCount: number
    avatarUrl: string
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
// 📊 REPORTS TYPES
// ==========================================

export type ReportPeriod = 'week' | 'month' | 'quarter' | 'year'
export type ExportFormat = 'pdf' | 'excel' | 'csv'

export interface CourseReport {
    id: string
    courseName: string
    courseCode: string
    enrolledStudents: number
    completionRate: number
    averageGrade: number
    submittedAssignments: number
    totalAssignments: number
    activeStudents: number
}

export interface StudentPerformance {
    id: string
    name: string
    email: string
    coursesEnrolled: number
    averageGrade: number
    assignmentsCompleted: number
    totalAssignments: number
    lastActivity: string
}

export interface OverviewStats {
    totalStudents: number
    activeCourses: number
    averageGrade: number
    completionRate: number
    assignmentsSubmitted: number
    activeUsers: number
    trends: {
        students: number
        courses: number
        grade: number
        completion: number
        assignments: number
        users: number
    }
}

export interface ChartDataPoint {
    label: string
    value: number
    date?: string
}

export interface PerformanceTrend {
    period: string
    averageGrade: number
    completionRate: number
    activeStudents: number
    assignmentsSubmitted: number
}

export interface EngagementMetrics {
    dailyActiveUsers: number
    weeklyActiveUsers: number
    monthlyActiveUsers: number
    averageSessionDuration: number
    coursesAccessed: number
    assignmentsViewed: number
}

// ==========================================
// 🔔 API RESPONSE TYPES
// ==========================================

export interface ApiResponse<T> {
    data: T
    message?: string
    success: boolean
}

export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export interface ApiError {
    message: string
    code?: string
    details?: Record<string, any>
}

// ==========================================
// 📋 FORM TYPES
// ==========================================

export interface CourseFormData {
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

export interface UserFormData {
    firstName: string
    lastName: string
    email: string
    phone?: string
    role: UserRole
    status: UserStatus
    password?: string
}

// ==========================================
// 🔍 FILTER TYPES
// ==========================================

export interface BaseFilters {
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    page?: number
    limit?: number
}

export interface CourseFilters extends BaseFilters {
    status?: CourseStatus | 'all'
    teacherId?: string
    grade?: string
}

export interface UserFilters extends BaseFilters {
    role?: UserRole | 'all'
    status?: UserStatus
}

export interface ReportFilters extends BaseFilters {
    period?: ReportPeriod
    startDate?: string
    endDate?: string
    courseId?: string
    studentId?: string
}