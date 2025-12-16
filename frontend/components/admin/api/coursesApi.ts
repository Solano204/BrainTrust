// File: src/app/features/admin/api/admin-courses-api.ts
"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { UserRole } from "./usersApi";
import { Course } from "@/app/domain/entities";

// ============================================
// CONFIGURATION
// ============================================K
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// ============================================
// BACKEND DTO TYPES
// ============================================


export interface PaginatedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  role?: UserRole;
  active?: boolean;
  teacherId?: string;
  grade?: string;
  group?: string;
}

export interface CourseDTO {
  id: string;
  code: string;
  name: string;
  description: string;
  urlImage: string;
  grade: string;
  group: string;
  teacherId: string;
  teacherName: string;
  active: boolean;
  studentCount: number;
  assignmentCount: number;
  unitCount: number;
  createdAt: string;
}

export interface CourseUnitDTO {
  id: string;
  courseId: string;
  name: string;
  urlImage: string;
  numUnity: number;
  description: string;
}

export interface EnrollmentDTO {
  id: string;
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentRefId: string;
  enrollmentDate: string;
  status: string;
  finalGrade: GradeDTO | null;
}

export interface GradeDTO {
  grade: number;
  feedback: string;
  gradedBy: string;
  gradedDate: string;
}

export interface UnitGradeDTO {
  id: string;
  unitId: string;
  unitName: string;
  studentId: string;
  studentName: string;
  grade: GradeInfoDTO;
  assignmentGrades: Record<string, GradeInfoDTO>;
  quizGrades: Record<string, GradeInfoDTO>;
  feedback: string;
  lastCalculated: string;
  calculatedTotal: string;
  finalGrade: string;
  finalFeedback: string;
}

export interface GradeInfoDTO {
  value: string;
  maxScore: string;
  percentage: string;
}

export interface TeacherDTO {
  userId: string;
  personId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
}

export interface StudentDTO {
  userId: string;
  personId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  studentRefId: string;
  isAlreadyEnrolled: boolean;
  enrollmentId: string | null;
  enrollmentStatus: string | null;
}

// ============================================
// COMMAND TYPES
// ============================================

export interface CreateCourseCommand {
  code: string;
  name: string;
  description: string;
  grade: string;
  group: string;
  teacherId: string;
  urlImage?: string;
}

export interface UpdateCourseCommand {
  name: string;
  description: string;
  grade: string;
  group: string;
  teacherId?: string; // Allow changing teacher
  imageUrl?: string;
  courseId: string;
}

export interface BulkEnrollCommand {
  studentIds: string[];
}

export interface BulkUnenrollCommand {
  studentIds: string[];
}

export interface AssignFinalGradeCommand {
  gradeValue: number;
  feedback: string;
}

export interface AssignUnitFinalGradeCommand {
  gradeValue: number;
  feedback: string;
}

export interface UpdateStudentGradeCommand {
  studentId: string;
  gradeValue: number;
  feedback: string;
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface SuccessResponseDTO {
  success: boolean;
  message: string;
  data: any;
}

export interface CourseStatsDTO {
  totalCourses: number;
  activeCourses: number;
  inactiveCourses: number;
  totalStudents: number;
  totalTeachers: number;
  averageStudentsPerCourse: number;
}

// ============================================
// DOMAIN TYPES
// ============================================

export interface AdminCourse {
  id: string;
  code: string;
  name: string;
  description: string;
  urlImage: string;
  grade: string;
  group: string;
  teacherId: string;
  teacherName: string;
  active: boolean;
  studentCount: number;
  assignmentCount: number;
  unitCount: number;
  createdAt: string;
}

export interface AdminCourseUnit {
  id: string;
  courseId: string;
  name: string;
  urlImage: string;
  numUnity: number;
  description: string;
}

export interface AdminEnrollment {
  id: string;
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentRefId: string;
  enrollmentDate: string;
  status: string;
  finalGrade: FinalGradeDTO | null;
}


export interface FinalGradeDTO {
  value: string;
  maxScore: string;
  percentage: string;
}
export interface Teacher {
  userId: string;
  personId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
}

export interface Student {
  userId: string;
  personId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  studentRefId: string;
  isAlreadyEnrolled: boolean;
  enrollmentId: string | null;
  enrollmentStatus: string | null;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
interface PaginatedResponseDTO<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  
}

// Add these interfaces for courses
interface CourseFilterParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  active?: boolean;
  teacherId?: string;
  grade?: string;
  group?: string;
}



// ============================================
// BACKEND DTO TYPES
// ============================================

export interface TeacherDTO {
  userId: string;
  personId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
}

export interface PaginatedTeacherResponseDTO {
  content: TeacherDTO[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
// ============================================
// UTILITIES
// ============================================

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = (await cookies()).get("session")?.value;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const handleApiError = async (error: unknown): Promise<never> => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error("API Error:", errorMessage);
    throw new Error(errorMessage);
  }
  throw error;
};

function mapPaginatedResponseFromBackend<T, U>(
  dto: PaginatedResponseDTO<U>,
  mapper: (item: U) => T
): PaginatedResponse<T> {
  return {
    content: dto.content.map(mapper),
    pageNumber: dto.pageNumber,
    pageSize: dto.pageSize,
    totalElements: dto.totalElements,
    totalPages: dto.totalPages,
    first: dto.first,
    last: dto.last
  };
}
// ============================================
// MAPPERS
// ============================================

function mapCourseFromBackend(dto: CourseDTO): AdminCourse {
  return {
    id: dto.id,
    code: dto.code,
    name: dto.name,
    description: dto.description,
    urlImage: dto.urlImage,
    grade: dto.grade,
    group: dto.group,
    teacherId: dto.teacherId,
    teacherName: dto.teacherName,
    active: dto.active,
    studentCount: dto.studentCount,
    assignmentCount: dto.assignmentCount,
    unitCount: dto.unitCount,
    createdAt: dto.createdAt,
  };
}

function mapEnrollmentFromBackend(enrollment: any): AdminEnrollment {
  return {
    id: enrollment.id,
    courseId: enrollment.courseId,
    courseName: enrollment.courseName,
    studentId: enrollment.studentId,
    studentName: enrollment.studentName,
    studentEmail: enrollment.studentEmail,
    studentRefId: enrollment.studentRefId,
    enrollmentDate: enrollment.enrollmentDate,
    status: enrollment.status,
    finalGrade: enrollment.finalGrade ? {
      value: enrollment.finalGrade.value,
      maxScore: enrollment.finalGrade.maxScore,
      percentage: enrollment.finalGrade.percentage
    } : null
  };
}

function mapCourseUnitFromBackend(dto: CourseUnitDTO): AdminCourseUnit {
  return {
    id: dto.id,
    courseId: dto.courseId,
    name: dto.name,
    urlImage: dto.urlImage,
    numUnity: dto.numUnity,
    description: dto.description,
  };
}


function mapTeacherFromBackend(dto: any): Teacher {
  // Handle both structures:
  // 1. Flat structure (your expected TeacherDTO)
  // 2. Nested structure (what your backend actually returns)
  
  if (dto.person) {
    // Handle nested person structure
    return {
      userId: dto.id, // Backend uses 'id', you expect 'userId'
      personId: dto.person.id,
      firstName: dto.person.firstName,
      lastName: dto.person.lastName,
      fullName: dto.person.fullName || `${dto.person.firstName} ${dto.person.lastName}`,
      email: dto.email
    };
  } else {
    // Handle flat structure (for backward compatibility)
    return {
      userId: dto.userId || dto.id,
      personId: dto.personId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      fullName: dto.fullName,
      email: dto.email
    };
  }
}

function mapStudentFromBackend(dto: StudentDTO): Student {
  return {
    userId: dto.userId,
    personId: dto.personId,
    firstName: dto.firstName,
    lastName: dto.lastName,
    fullName: dto.fullName,
    email: dto.email,
    studentRefId: dto.studentRefId,
    isAlreadyEnrolled: dto.isAlreadyEnrolled,
    enrollmentId: dto.enrollmentId,
    enrollmentStatus: dto.enrollmentStatus,
  };
}






/**
 * Fetch all courses with pagination (admin view)
 */
export async function fetchAllCoursesPaginated(
  params: CourseFilterParams = {}
): Promise<PaginatedResponse<AdminCourse>> {
  try {
    const {
      page = 0,
      size = 20,
      sort = 'createdAt,desc',
      search,
      active,
      teacherId,
      grade,
      group
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort
    });

    if (search) queryParams.append('name', search);
    if (active !== undefined) queryParams.append('active', active.toString());
    if (teacherId) queryParams.append('teacherId', teacherId);
    if (grade) queryParams.append('grade', grade);
    if (group) queryParams.append('group', group);

    const url = `/api/courses/paginated?${queryParams.toString()}`;
    const response = await apiClient.get<PaginatedResponseDTO<CourseDTO>>(url);
    
    const result = mapPaginatedResponseFromBackend(response.data, mapCourseFromBackend);
    console.log(`Fetched page ${result.pageNumber + 1}/${result.totalPages} with ${result.content.length} courses`);
    
    return result;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Fetch active courses with pagination
 */
export async function fetchActiveCoursesPaginated(
  params: Omit<CourseFilterParams, 'active'> = {}
): Promise<PaginatedResponse<AdminCourse>> {
  try {
    const {
      page = 0,
      size = 20,
      sort = 'name,asc',
      search,
      teacherId,
      grade,
      group
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort
    });

    if (search) queryParams.append('name', search);
    if (teacherId) queryParams.append('teacherId', teacherId);
    if (grade) queryParams.append('grade', grade);
    if (group) queryParams.append('group', group);

    const url = `/api/courses/active/paginated?${queryParams.toString()}`;
    const response = await apiClient.get<PaginatedResponseDTO<CourseDTO>>(url);
    
    const result = mapPaginatedResponseFromBackend(response.data, mapCourseFromBackend);
    console.log(`Fetched active courses page ${result.pageNumber + 1}/${result.totalPages}`);
    
    return result;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Fetch courses by teacher with pagination
 */
export async function fetchCoursesByTeacherPaginated(
  teacherId: string,
  params: Omit<CourseFilterParams, 'teacherId'> = {}
): Promise<PaginatedResponse<AdminCourse>> {
  try {
    const {
      page = 0,
      size = 20,
      sort = 'name,asc',
      search,
      active,
      grade,
      group
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort
    });

    if (search) queryParams.append('name', search);
    if (active !== undefined) queryParams.append('active', active.toString());
    if (grade) queryParams.append('grade', grade);
    if (group) queryParams.append('group', group);

    const url = `/api/courses/teacher/${teacherId}/paginated?${queryParams.toString()}`;
    const response = await apiClient.get<PaginatedResponseDTO<CourseDTO>>(url);
    
    const result = mapPaginatedResponseFromBackend(response.data, mapCourseFromBackend);
    console.log(`Fetched teacher ${teacherId} courses page ${result.pageNumber + 1}/${result.totalPages}`);
    
    return result;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Search courses by name with pagination
 */
export async function searchCoursesByNamePaginated(
  name: string,
  params: Omit<CourseFilterParams, 'search'> = {}
): Promise<PaginatedResponse<AdminCourse>> {
  try {
    const {
      page = 0,
      size = 20,
      sort = 'name,asc',
      active,
      teacherId,
      grade,
      group
    } = params;

    const queryParams = new URLSearchParams({
      name,
      page: page.toString(),
      size: size.toString(),
      sort
    });

    if (active !== undefined) queryParams.append('active', active.toString());
    if (teacherId) queryParams.append('teacherId', teacherId);
    if (grade) queryParams.append('grade', grade);
    if (group) queryParams.append('group', group);

    const url = `/api/courses/search?${queryParams.toString()}`;
    const response = await apiClient.get<PaginatedResponseDTO<CourseDTO>>(url);
    
    const result = mapPaginatedResponseFromBackend(response.data, mapCourseFromBackend);
    console.log(`Searched "${name}" page ${result.pageNumber + 1}/${result.totalPages}`);
    
    return result;
  } catch (error) {
    return await handleApiError(error);
  }
}
















/**
 * Get all teachers with pagination
 */
export async function fetchAllTeachersPaginated(
  params: PaginationParams = {}
): Promise<PaginatedResponse<Teacher>> {
  try {
    const {
      page = 0,
      size = 20,
      sort = 'fullName,asc',
      search,
      active
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort
    });

    if (search) queryParams.append('search', search);
    if (active !== undefined) queryParams.append('active', active.toString());

    // Adjust URL based on your backend
    const url = `/api/users/role/teacher/paginated?${queryParams.toString()}`;
    const response = await apiClient.get<PaginatedResponseDTO<TeacherDTO>>(url);
    

    const result = mapPaginatedResponseFromBackend(response.data, mapTeacherFromBackend);
    
    return result;
  } catch (error) {
    console.warn("Teachers pagination endpoint not available, falling back to all teachers");
    
    // Fallback to getAllTeachers if pagination endpoint doesn't exist
    const allTeachers = await fetchAllTeachers();

    console.log(`Fetched ${allTeachers} teachers`);
    const { page = 0, size = 20 } = params;
    const startIndex = page * size;
    const endIndex = startIndex + size;
    
    const paginatedTeachers = allTeachers.slice(startIndex, endIndex);
    
    return {
      content: paginatedTeachers,
      pageNumber: page,
      pageSize: size,
      totalElements: allTeachers.length,
      totalPages: Math.ceil(allTeachers.length / size),
      first: page === 0,
      last: endIndex >= allTeachers.length
    };
  }
}
/**
 * Search teachers by name with pagination
 */
export async function searchTeachersPaginated(
  searchTerm: string,
  params: Omit<PaginationParams, 'search'> = {}
): Promise<PaginatedResponse<Teacher>> {
  try {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return {
        content: [],
        pageNumber: 0,
        pageSize: 20,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true
      };
    }

    const {
      page = 0,
      size = 20,
      sort = 'name',  // Changed from 'fullName,asc' to 'firstName,asc'
      active
    } = params;

    const queryParams = new URLSearchParams({
      name: searchTerm,
      page: page.toString(),
      size: size.toString(),
      sort
    });

    if (active !== undefined) queryParams.append('active', active.toString());

    // FIX: Changed from /search/${queryParams.toString()} to /search?${queryParams.toString()}
    const url = `/api/users/search?${queryParams.toString()}`;
    const response = await apiClient.get<PaginatedResponseDTO<TeacherDTO>>(url);
    
    const result = mapPaginatedResponseFromBackend(response.data, mapTeacherFromBackend);
    console.log(`Searched teachers "${searchTerm}" page ${result.pageNumber + 1}/${result.totalPages}`);
    
    return result;
  } catch (error) {
    console.warn("Teachers search pagination endpoint not available, falling back to client-side search");
    
    // Fallback to client-side search
    const allTeachers = await fetchAllTeachers();

    console.log(`Fetched ${allTeachers.length} teachers`);
    const filteredTeachers = allTeachers.filter(teacher =>
      teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const { page = 0, size = 20 } = params;
    const startIndex = page * size;
    const endIndex = startIndex + size;
    
    const paginatedTeachers = filteredTeachers.slice(startIndex, endIndex);
    
    return {
      content: paginatedTeachers,
      pageNumber: page,
      pageSize: size,
      totalElements: filteredTeachers.length,
      totalPages: Math.ceil(filteredTeachers.length / size),
      first: page === 0,
      last: endIndex >= filteredTeachers.length
    };
  }
}

// ============================================
// LEGACY FUNCTIONS (keep for backward compatibility)
// ============================================

/**
 * Fetch all courses (legacy - use paginated version instead)
 */
export async function fetchAllCoursesAdmin(): Promise<AdminCourse[]> {
  try {
    console.warn("Using legacy fetchAllCoursesAdmin function. Consider switching to paginated version.");
    
    // For backward compatibility, get first page with large size
    const paginatedResponse = await fetchAllCoursesPaginated({
      page: 0,
      size: 1000
    });
    
    return paginatedResponse.content;
  } catch (error) {
    return await handleApiError(error);
  }





}

/**
 * Get all teachers (legacy - for backward compatibility)
 */
export async function fetchAllTeachers(): Promise<Teacher[]> {
  try {
    // Try multiple possible endpoints
    const endpoints = [
      '/api/users/role/teacher',
      '/api/users/role/admin',
      '/api/users/role/student'
    ];

    let lastError;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Fetching teachers from ${endpoint}`);
        const response = await apiClient.get<TeacherDTO[]>(endpoint);
        const teachers = response.data.map(mapTeacherFromBackend);
        console.log(`Fetched ${teachers.length} teachers from ${endpoint}`);
        return teachers;
      } catch (error) {
        lastError = error;
        console.log(`Failed to fetch from ${endpoint}:`, error);
        continue;
      }
    }
    
    throw lastError || new Error('No teacher endpoints available');
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Search teachers (legacy - for backward compatibility)
 */
export async function searchTeachers(searchTerm: string): Promise<Teacher[]> {
  try {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }

    // Try search endpoint
    try {
      const response = await apiClient.get<TeacherDTO[]>('/api/users/teachers/search', {
        params: { query: searchTerm.trim() }
      });
      
      const teachers = response.data.map(mapTeacherFromBackend);
      console.log(`Found ${teachers.length} teachers matching "${searchTerm}"`);
      
      return teachers;
    } catch {
      // Fallback: get all and filter client-side
      const allTeachers = await fetchAllTeachers();
      const filteredTeachers = allTeachers.filter(teacher =>
        teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      return filteredTeachers;
    }
  } catch (error) {
    return await handleApiError(error);
  }
}


// ============================================
// COURSE MANAGEMENT API FUNCTIONS
// ============================================

/**
 * Fetch all courses (admin view)
 */


/**
 * Fetch course by ID (admin view)
 */
export async function fetchCourseByIdAdmin(courseId: string): Promise<AdminCourse> {
  try {
    const response = await apiClient.get<CourseDTO>(`/api/courses/${courseId}`);
    
    const course = mapCourseFromBackend(response.data);
    console.log(`Fetched course ${courseId} for admin`);
    
    return course;
  } catch (error) {
    return await handleApiError(error);
  }
}

export interface CreateCourseWithImageCommand {
  code: string;
  name: string;
  description: string;
  grade: string;
  group: string;
  teacherId: string;
  imageUrl: string;
}



async function mapCreateCourseToBackendCommand(data: Omit<CreateCourseCommand, "id" | "enrollments" | "units">): Promise<CreateCourseCommand> {
  return {
    code: data.code,
    name: data.name,
    description: data.description,
    grade: data.grade,
    group: data.group,
    teacherId: data.teacherId // This should come from auth context
  };
}

/**
 * Maps frontend course data to backend CreateCourseWithImageCommand
 */
async function mapCreateCourseWithImageToBackendCommand(data: Omit<CreateCourseCommand, "id"  | "enrollments" | "units">): Promise<CreateCourseWithImageCommand> {
  return {
    code: data.code,
    name: data.name,
    description: data.description,
    grade: data.grade,
    group: data.group,
    teacherId: data.teacherId, // This should come from auth context
    imageUrl: data.urlImage || ""
  };
}


export async function createCourse(
  courseData: CreateCourseCommand
): Promise<AdminCourse> {
  

  try {
    const backendCommand = await mapCreateCourseToBackendCommand(courseData);
    const courseResponse = await apiClient.post<CourseDTO>("/api/courses", backendCommand);
    
    // Fetch the created course to get full details
   
    const course = await mapCourseFromBackend(courseResponse.data);
    return course;
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function createCourseWithImage(
  courseData: CreateCourseCommand
): Promise<AdminCourse> {
 

  try {
    // Create a mapping function for the new command

    console.log("COURSE DATA PROVIDED:", courseData);
    const backendCommand = await mapCreateCourseWithImageToBackendCommand(courseData);
    const courseResponse = await apiClient.post<CourseDTO>("/api/courses/with-image", backendCommand);
    
    const course = await mapCourseFromBackend(courseResponse.data);
    return course;
  } catch (error) {
    return await handleApiError(error);
  }
}



/**
 * Create a new course (admin)
 */
export async function createCourseAdmin(command: CreateCourseCommand): Promise<AdminCourse> {
  try {

    console.log("COMMAND PROVIDED:", command);
    const response = await apiClient.post<CourseDTO>('/api/courses', command);
    
    const course = mapCourseFromBackend(response.data);
    console.log(`Created course ${course.id} with teacher ${command.teacherId}`);
    
    return course;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Update course (admin can change teacher)
 */
export async function updateCourseAdmin(
  courseId: string,
  command: UpdateCourseCommand
): Promise<AdminCourse> {
  try {


    console.log("COMMAND PROVIDED UPDATE:", command);
    const response = await apiClient.put<CourseDTO>(`/api/courses/${courseId}`, command);
    
    const course = mapCourseFromBackend(response.data);
    console.log(`Updated course ${courseId}`);
    
    return course;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Delete course (admin)
 */
export async function deleteCourseAdmin(courseId: string): Promise<void> {
  try {
    await apiClient.delete(`/api/courses/${courseId}`);
    
    console.log(`Deleted course ${courseId}`);
  } catch (error) {
    return await handleApiError(error);
  }
}






// ============================================
// UNIT MANAGEMENT API FUNCTIONS
// ============================================

/**
 * Fetch all units for a course
 */
export async function fetchCourseUnitsAdmin(courseId: string): Promise<AdminCourseUnit[]> {
  try {
    const response = await apiClient.get<CourseUnitDTO[]>(`/api/courses/${courseId}/units`);
    
    const units = response.data.map(mapCourseUnitFromBackend);
    console.log(`Fetched ${units.length} units for course ${courseId}`);
    
    return units;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Delete unit (admin)
 */
export async function deleteUnitAdmin(courseId: string, unitId: string): Promise<void> {
  try {
    await apiClient.delete(`/api/courses/${courseId}/units/${unitId}`);
    
    console.log(`Deleted unit ${unitId} from course ${courseId}`);
  } catch (error) {
    return await handleApiError(error);
  }
}


// ============================================
// ENROLLMENT MANAGEMENT API FUNCTIONS
// ============================================

/**
 * Fetch all enrollments for a course
 */
export async function fetchCourseEnrollmentsAdmin(courseId: string): Promise<AdminEnrollment[]> {
  try {
    const response = await apiClient.get<EnrollmentDTO[]>(`/api/courses/${courseId}/enrollments`);
    
    const enrollments = response.data.map(mapEnrollmentFromBackend);
    console.log(`Fetched ${enrollments} enrollments for course ${courseId}`);
    
    return enrollments;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Search students for enrollment
 */
export async function searchStudentsForCourse(
  courseId: string,
  searchTerm: string
): Promise<Student[]> {
  try {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }

    const response = await apiClient.get<StudentDTO[]>(
      `/api/courses/${courseId}/enrollments/search`,
      {
        params: { query: searchTerm.trim() }
      }
    );
    
    const availableStudents = response.data
      .filter(dto => !dto.isAlreadyEnrolled)
      .map(mapStudentFromBackend);
    
    console.log(`Found ${availableStudents.length} available students for course ${courseId}`);
    
    return availableStudents;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Bulk enroll students
 */
export async function bulkEnrollStudentsAdmin(
  courseId: string,
  studentIds: string[]
): Promise<{ enrollmentIds: string[]; courseId: string }> {
  try {
    const command: BulkEnrollCommand = { studentIds };

    const response = await apiClient.post<SuccessResponseDTO>(
      `/api/courses/${courseId}/enrollments/bulk`,
      command
    );
    
    const enrollmentIds = Array.isArray(response.data.data) 
      ? response.data.data 
      : [response.data.data];
    
    console.log(`Bulk enrolled ${studentIds.length} students in course ${courseId}`);
    
    return { enrollmentIds, courseId };
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Bulk unenroll students
 */
export async function bulkUnenrollStudentsAdmin(
  courseId: string,
  studentIds: string[]
): Promise<void> {
  try {
    const command: BulkUnenrollCommand = { studentIds };

    await apiClient.delete(`/api/courses/${courseId}/enrollments/bulk`, {
      data: command
    });
    
    console.log(`Bulk unenrolled ${studentIds.length} students from course ${courseId}`);
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Unenroll single student
 */
export async function unenrollStudentAdmin(
  courseId: string,
  studentId: string
): Promise<void> {
  try {
    await apiClient.delete(`/api/courses/${courseId}/enrollments/${studentId}`);
    
    console.log(`Unenrolled student ${studentId} from course ${courseId}`);
  } catch (error) {
    return await handleApiError(error);
  }
}

// ============================================
// GRADE MANAGEMENT API FUNCTIONS
// ============================================

/**
 * Fetch all grades for a course
 */
export async function fetchCourseGradesAdmin(courseId: string): Promise<AdminEnrollment[]> {
  try {
    const enrollments = await fetchCourseEnrollmentsAdmin(courseId);
    
    // Filter to show only enrollments with grades or active status
    const gradesView = enrollments.filter(e => 
      e.status === 'ACTIVE' || e.finalGrade !== null
    );
    
    console.log(`Fetched grades for ${gradesView} students in course ${courseId}`);
    
    return gradesView;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Assign final grade to student in course
 */
export async function assignFinalGradeAdmin(
  courseId: string,
  studentId: string,
  gradeValue: number,
  feedback: string
): Promise<void> {
  try {
    const command: AssignFinalGradeCommand = {
      gradeValue,
      feedback
    };

    await apiClient.put(
      `/api/gradebook/course/${courseId}/student/${studentId}/final-grade`,
      command
    );
    
    console.log(`Assigned final grade ${gradeValue} to student ${studentId} in course ${courseId}`);
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Bulk update grades for multiple students in a course
 */
export async function bulkUpdateCourseGrades(
  courseId: string,
  grades: UpdateStudentGradeCommand[]
): Promise<void> {
  try {
  
    await apiClient.put(`/api/gradebook/course/${courseId}/bulk-grades`, {
      grades
    });
    
    console.log(`Bulk updated ${grades.length} grades for course ${courseId}`);
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Fetch unit grades for a specific unit
 */
export async function fetchUnitGradesAdmin(unitId: string): Promise<UnitGradeDTO[]> {
  try {
    const response = await apiClient.get<UnitGradeDTO[]>(`/api/unit-grades/unit/${unitId}`);
    
    console.log(`Fetched unit grades for unit ${unitId}`);
    
    return response.data;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Assign final grade to student for a unit
 */
export async function assignUnitFinalGradeAdmin(
  unitId: string,
  studentId: string,
  gradeValue: number,
  feedback: string
): Promise<void> {
  try {
    const command: AssignUnitFinalGradeCommand = {
      gradeValue,
      feedback
    };

    // LACK OF NO
    await apiClient.put(
      `/api/unit-grades/unit/${unitId}/student/${studentId}/final-grade`,
      command
    );
    
    console.log(`Assigned unit final grade ${gradeValue} to student ${studentId} for unit ${unitId}`);
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Bulk update grades for multiple students in a unit
 */
export async function bulkUpdateUnitGrades(
  unitId: string,
  grades: UpdateStudentGradeCommand[]
): Promise<void> {
  try {
    // 
    await apiClient.put(`/api/unit-grades/unit/${unitId}/bulk-grades`, {
      grades
    });
    
    console.log(`Bulk updated ${grades.length} grades for unit ${unitId}`);
  } catch (error) {
    return await handleApiError(error);
  }
}

// ============================================
// STATISTICS API FUNCTIONS
// ============================================

/**
 * Get course statistics for admin dashboard
 */
export async function getCourseStatsAdmin(): Promise<CourseStatsDTO> {
  try {
    
    const response = await apiClient.get<CourseStatsDTO>('/api/admin/courses/stats');
    
    console.log('Fetched course statistics for admin');
    
    return response.data;
  } catch (error) {
    // Fallback: calculate from available data
    const courses = await fetchAllCoursesAdmin();
    
    const activeCourses = courses.filter(c => c.active).length;
    const inactiveCourses = courses.filter(c => !c.active).length;
    const totalStudents = courses.reduce((sum, c) => sum + c.studentCount, 0);
    const uniqueTeachers = new Set(courses.map(c => c.teacherId)).size;
    const averageStudentsPerCourse = courses.length > 0 
      ? totalStudents / courses.length 
      : 0;
    
    return {
      totalCourses: courses.length,
      activeCourses,
      inactiveCourses,
      totalStudents,
      totalTeachers: uniqueTeachers,
      averageStudentsPerCourse: Math.round(averageStudentsPerCourse * 100) / 100
    };
  }
}

/**
 * Get enrollment statistics for a specific course
 */
export async function getCourseEnrollmentStats(courseId: string): Promise<{
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  averageGrade: number;
}> {
  try {
    const enrollments = await fetchCourseEnrollmentsAdmin(courseId);
    
    const active = enrollments.filter(e => e.status === 'ACTIVE').length;
    const completed = enrollments.filter(e => e.status === 'COMPLETED').length;
    const cancelled = enrollments.filter(e => e.status === 'CANCELLED').length;
    
    const gradesWithValues = enrollments
        .filter(e => e.finalGrade?.value != null)
      .map(e => parseFloat(e.finalGrade!.value));
    
    const averageGrade = gradesWithValues.length > 0
      ? gradesWithValues.reduce((sum, grade) => sum + grade, 0) / gradesWithValues.length
      : 0;
    
    return {
      total: enrollments.length,
      active,
      completed,
      cancelled,
      averageGrade: Math.round(averageGrade * 100) / 100
    };
  } catch (error) {
    return await handleApiError(error);
  }
}