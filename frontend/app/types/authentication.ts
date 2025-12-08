// types/auth.ts
export type UserRole = 'admin' | 'teacher' | 'student' | 'guest';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  permissions: string[];
  iat?: number;
  exp?: number;
}

export interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userId: string;
  user: UserSession;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

// Permission constants
export const PERMISSIONS = {
  // Admin permissions
  ADMIN_DASHBOARD: 'admin:dashboard',
  USER_MANAGEMENT: 'admin:users',
  // USER_MANAGEMENT: 'admin:user:management',
  SYSTEM_SETTINGS: 'admin:settings',
  COURSE_MANAGEMENT: 'admin:courses',
  VIEW_REPORTS: 'admin:reports:view',
  EXPORT_DATA: 'admin:data:export',
  
  
  // Teacher permissions
  TEACHER_DASHBOARD: 'teacher:dashboard',
  MANAGE_CLASSES: 'teacher:classes',
  MANAGE_STUDENTS: 'teacher:students',
  VIEW_GRADES: 'teacher:grades',
  MANAGE_ASSIGNMENTS: 'teacher:assignments',
  GRADE_SUBMISSIONS: 'teacher:grade',
  
  // Student permissions
  STUDENT_DASHBOARD: 'student:dashboard',
  VIEW_COURSES: 'student:courses',
  SUBMIT_ASSIGNMENTS: 'student:submit',
  VIEW_GRADESS: 'student:grades',
  TAKE_QUIZZES: 'student:quizzes',
} as const;

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: Object.values(PERMISSIONS), // Admin has all permissions
  teacher: [
    PERMISSIONS.TEACHER_DASHBOARD,
    PERMISSIONS.MANAGE_CLASSES,
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.VIEW_GRADES,
    PERMISSIONS.MANAGE_ASSIGNMENTS,
    PERMISSIONS.GRADE_SUBMISSIONS,
    PERMISSIONS.STUDENT_DASHBOARD,
    PERMISSIONS.VIEW_COURSES,
  ],
  student: [
    PERMISSIONS.STUDENT_DASHBOARD,
    PERMISSIONS.VIEW_COURSES,
    PERMISSIONS.SUBMIT_ASSIGNMENTS,
    PERMISSIONS.VIEW_GRADES,
    PERMISSIONS.TAKE_QUIZZES,
  ],
  guest: [],
};

// Configuration
export const AUTH_CONFIG = {
  ACCESS_TOKEN_EXPIRY: 15 * 60 * 1000, // 15 minutes
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
  MOCK_MODE: process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
} as const;