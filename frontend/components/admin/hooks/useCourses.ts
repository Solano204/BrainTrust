// File: src/app/features/admin/hooks/useAdminCourses.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAllCoursesAdmin,
  fetchCourseByIdAdmin,
  createCourseAdmin,
  updateCourseAdmin,
  deleteCourseAdmin,
  fetchAllTeachers,
  searchTeachers,
  fetchCourseUnitsAdmin,
  deleteUnitAdmin,
  fetchCourseEnrollmentsAdmin,
  searchStudentsForCourse,
  bulkEnrollStudentsAdmin,
  bulkUnenrollStudentsAdmin,
  unenrollStudentAdmin,
  fetchCourseGradesAdmin,
  assignFinalGradeAdmin,
  bulkUpdateCourseGrades,
  fetchUnitGradesAdmin,
  assignUnitFinalGradeAdmin,
  bulkUpdateUnitGrades,
  getCourseStatsAdmin,
  getCourseEnrollmentStats,
  type AdminCourse,
  type CreateCourseCommand,
  type UpdateCourseCommand,
  type UpdateStudentGradeCommand,
  Teacher,
  PaginatedResponse,
  fetchAllTeachersPaginated,
  searchTeachersPaginated,
  fetchCoursesByTeacherPaginated,
  fetchActiveCoursesPaginated,
  fetchAllCoursesPaginated,
  searchCoursesByNamePaginated,
  createCourseWithImage,
  createCourse,
} from '@/components/admin/api/coursesApi';
import { uploadImageFile } from '@/app/utils/cloudinary/cloudinary';

// ============================================
// QUERY KEYS
// ============================================

export const adminCoursesKeys = {
  all: ['admin-courses'] as const,
  lists: () => [...adminCoursesKeys.all, 'list'] as const,
  list: (filters?: any) => [...adminCoursesKeys.lists(), filters] as const,
  paginated: (params: CourseFilterParams) => [...adminCoursesKeys.all, 'paginated', params] as const,
  activePaginated: (params: Omit<CourseFilterParams, 'active'>) => 
    [...adminCoursesKeys.all, 'active', 'paginated', params] as const,
  byTeacherPaginated: (teacherId: string, params: Omit<CourseFilterParams, 'teacherId'>) => 
    [...adminCoursesKeys.all, 'teacher', teacherId, 'paginated', params] as const,
  searchPaginated: (search: string, params: Omit<CourseFilterParams, 'search'>) => 
    [...adminCoursesKeys.all, 'search', search, 'paginated', params] as const,
  teachers: () => ['admin-teachers'] as const,
  teachersPaginated: (params: PaginationParams) => [...adminCoursesKeys.teachers(), 'paginated', params] as const,
  searchTeachersPaginated: (search: string, params: Omit<PaginationParams, 'search'>) => 
    [...adminCoursesKeys.teachers(), 'search', search, 'paginated', params] as const,
  details: () => [...adminCoursesKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminCoursesKeys.details(), id] as const,
  units: (courseId: string) => [...adminCoursesKeys.detail(courseId), 'units'] as const,
  enrollments: (courseId: string) => [...adminCoursesKeys.detail(courseId), 'enrollments'] as const,
  grades: (courseId: string) => [...adminCoursesKeys.detail(courseId), 'grades'] as const,
  unitGrades: (unitId: string) => ['admin-unit-grades', unitId] as const,
  teachersSearchPaginated: (search: string, params: Omit<PaginationParams, 'search'>) => 
    ['admin-teachers', 'search', search, 'paginated', params] as const,
  students: (courseId: string) => ['admin-students', courseId] as const,
  stats: () => [...adminCoursesKeys.all, 'stats'] as const,
  enrollmentStats: (courseId: string) => [...adminCoursesKeys.detail(courseId), 'enrollment-stats'] as const,
};

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

interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  active?: boolean;
}

// ============================================
// UTILITY FUNCTION FOR CACHE INVALIDATION
// ============================================

/**
 * Invalidates all course-related queries
 * Use this after mutations that affect course data
 */
function invalidateAllCourseQueries(queryClient: ReturnType<typeof useQueryClient>) {
  // Invalidate all course lists (paginated and non-paginated)
  queryClient.invalidateQueries({ 
    queryKey: adminCoursesKeys.all,
    refetchType: 'active' // Only refetch currently mounted queries
  });
  
  // Invalidate stats
  queryClient.invalidateQueries({ 
    queryKey: adminCoursesKeys.stats() 
  });
}

/**
 * Invalidates queries for a specific course
 */
function invalidateCourseDetailQueries(
  queryClient: ReturnType<typeof useQueryClient>, 
  courseId: string
) {
  queryClient.invalidateQueries({ 
    queryKey: adminCoursesKeys.detail(courseId) 
  });
}

// ============================================
// COURSE QUERIES
// ============================================

export function useAdminCoursesPaginated(params: CourseFilterParams = {}) {
  return useQuery<PaginatedResponse<AdminCourse>, Error>({
    queryKey: adminCoursesKeys.paginated(params),
    queryFn: () => fetchAllCoursesPaginated(params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useAdminActiveCoursesPaginated(params: Omit<CourseFilterParams, 'active'> = {}) {
  return useQuery<PaginatedResponse<AdminCourse>, Error>({
    queryKey: adminCoursesKeys.activePaginated(params),
    queryFn: () => fetchActiveCoursesPaginated(params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useAdminCoursesByTeacherPaginated(
  teacherId: string, 
  params: Omit<CourseFilterParams, 'teacherId'> = {}
) {
  return useQuery<PaginatedResponse<AdminCourse>, Error>({
    queryKey: adminCoursesKeys.byTeacherPaginated(teacherId, params),
    queryFn: () => fetchCoursesByTeacherPaginated(teacherId, params),
    enabled: !!teacherId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useAdminSearchCoursesPaginated(
  search: string, 
  params: Omit<CourseFilterParams, 'search'> = {}
) {
  return useQuery<PaginatedResponse<AdminCourse>, Error>({
    queryKey: adminCoursesKeys.searchPaginated(search, params),
    queryFn: () => searchCoursesByNamePaginated(search, params),
    enabled: true,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });
}

// ============================================
// TEACHER QUERIES
// ============================================

export function useAdminTeachersPaginated(params: PaginationParams = {}) {
  return useQuery<PaginatedResponse<Teacher>, Error>({
    queryKey: adminCoursesKeys.teachersPaginated(params),
    queryFn: () => fetchAllTeachersPaginated(params),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 20,
  });
}

export function useAdminSearchTeachersPaginated(
  search: string, 
  params: Omit<PaginationParams, 'search'> = {}
) {
  return useQuery<PaginatedResponse<Teacher>, Error>({
    queryKey: adminCoursesKeys.searchTeachersPaginated(search, params),
    queryFn: () => searchTeachersPaginated(search, params),
    enabled: true,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useAdminTeachers() {
  return useQuery<Teacher[], Error>({
    queryKey: adminCoursesKeys.teachers(),
    queryFn: fetchAllTeachers,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 20,
  });
}

export function useSearchTeachersPaginated(
  searchTerm: string,
  params: Omit<PaginationParams, 'search'> = {}
) {
  return useQuery<PaginatedResponse<Teacher>, Error>({
    queryKey: adminCoursesKeys.teachersSearchPaginated(searchTerm, params),
    queryFn: () => searchTeachersPaginated(searchTerm, params),
    enabled: !!searchTerm && searchTerm.trim().length > 0,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
}

export function useSearchTeachers(searchTerm: string) {
  return useQuery({
    queryKey: [...adminCoursesKeys.teachers(), 'search', searchTerm],
    queryFn: () => searchTeachers(searchTerm),
    enabled: !!searchTerm && searchTerm.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

// ============================================
// COURSE DETAIL QUERIES
// ============================================

export function useAdminCourse(courseId: string) {
  return useQuery({
    queryKey: adminCoursesKeys.detail(courseId),
    queryFn: () => fetchCourseByIdAdmin(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminCourseUnits(courseId: string) {
  return useQuery({
    queryKey: adminCoursesKeys.units(courseId),
    queryFn: () => fetchCourseUnitsAdmin(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminCourseEnrollments(courseId: string) {
  return useQuery({
    queryKey: adminCoursesKeys.enrollments(courseId),
    queryFn: () => fetchCourseEnrollmentsAdmin(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminCourseGrades(courseId: string) {
  return useQuery({
    queryKey: adminCoursesKeys.grades(courseId),
    queryFn: () => fetchCourseGradesAdmin(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminUnitGrades(unitId: string) {
  return useQuery({
    queryKey: adminCoursesKeys.unitGrades(unitId),
    queryFn: () => fetchUnitGradesAdmin(unitId),
    enabled: !!unitId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminCourseStats() {
  return useQuery({
    queryKey: adminCoursesKeys.stats(),
    queryFn: getCourseStatsAdmin,
    staleTime: 1000 * 60 * 10,
  });
}

export function useAdminCourseEnrollmentStats(courseId: string) {
  return useQuery({
    queryKey: adminCoursesKeys.enrollmentStats(courseId),
    queryFn: () => getCourseEnrollmentStats(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 5,
  });
}

// ============================================
// COURSE MUTATIONS (FIXED)
// ============================================

/**
 * Create course with immediate cache update
 */
export function useCreateCourseAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseData,
      imageFile,
    }: {
      courseData: CreateCourseCommand;
      imageFile?: File | null;
    }) => {
      // Upload image if provided
      if (imageFile) {
        const uploadedUrl = await uploadImageFile(imageFile);
        courseData.urlImage = uploadedUrl;
        return await createCourseWithImage(courseData);
      } else {
        return await createCourse(courseData);
      }
    },
    onSuccess: (newCourse) => {
      // Invalidate ALL course-related queries
      invalidateAllCourseQueries(queryClient);
      
      // Optionally: Set the new course data in cache immediately
      queryClient.setQueryData(
        adminCoursesKeys.detail(newCourse.id),
        newCourse
      );
    },
    onError: (error: Error) => {
      console.error("Error creating course:", error.message);
    },
  });
}

/**
 * Update course with immediate cache update
 */
export function useUpdateCourseAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      courseData,
      imageFile,
    }: {
      courseId: string;
      courseData: UpdateCourseCommand;
      imageFile?: File | null;
    }) => {
      let finalCourseData = { ...courseData };

      // Upload new image if provided
      if (imageFile) {
        console.log(`Uploading new image for course ${courseId}...`);
        const uploadedUrl = await uploadImageFile(imageFile);
        finalCourseData.imageUrl = uploadedUrl;
      }

      return await updateCourseAdmin(courseId, finalCourseData);
    },
    onSuccess: (updatedCourse, variables) => {
      // Invalidate all course lists
      invalidateAllCourseQueries(queryClient);
      
      // Update the specific course detail in cache
      queryClient.setQueryData(
        adminCoursesKeys.detail(variables.courseId),
        updatedCourse
      );
      
      // Invalidate related queries
      invalidateCourseDetailQueries(queryClient, variables.courseId);
    },
    onError: (error: Error) => {
      console.error("Error updating course:", error.message);
    },
  });
}

/**
 * Delete course with immediate cache update
 */
export function useDeleteCourseAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => deleteCourseAdmin(courseId),
    onSuccess: (_, courseId) => {
      // Invalidate all course lists
      invalidateAllCourseQueries(queryClient);
      
      // Remove the deleted course from cache
      queryClient.removeQueries({ 
        queryKey: adminCoursesKeys.detail(courseId) 
      });
    },
  });
}

// ============================================
// UNIT MUTATIONS (FIXED)
// ============================================

export function useDeleteUnitAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, unitId }: { courseId: string; unitId: string }) =>
      deleteUnitAdmin(courseId, unitId),
    onSuccess: (_, variables) => {
      // Invalidate units and course details
      queryClient.invalidateQueries({ 
        queryKey: adminCoursesKeys.units(variables.courseId) 
      });
      invalidateCourseDetailQueries(queryClient, variables.courseId);
      
      // Also invalidate course lists as unit count changes
      invalidateAllCourseQueries(queryClient);
    },
  });
}

// ============================================
// ENROLLMENT MUTATIONS (FIXED)
// ============================================

export function useBulkEnrollStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, studentIds }: { courseId: string; studentIds: string[] }) =>
      bulkEnrollStudentsAdmin(courseId, studentIds),
    onSuccess: (_, variables) => {
      // Invalidate all enrollment-related queries
      queryClient.invalidateQueries({ 
        queryKey: adminCoursesKeys.enrollments(variables.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: adminCoursesKeys.enrollmentStats(variables.courseId) 
      });
      invalidateCourseDetailQueries(queryClient, variables.courseId);
      
      // Invalidate course lists as student count changes
      invalidateAllCourseQueries(queryClient);
    },
  });
}

export function useBulkUnenrollStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, studentIds }: { courseId: string; studentIds: string[] }) =>
      bulkUnenrollStudentsAdmin(courseId, studentIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: adminCoursesKeys.enrollments(variables.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: adminCoursesKeys.enrollmentStats(variables.courseId) 
      });
      invalidateCourseDetailQueries(queryClient, variables.courseId);
      invalidateAllCourseQueries(queryClient);
    },
  });
}

export function useUnenrollStudentAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, studentId }: { courseId: string; studentId: string }) =>
      unenrollStudentAdmin(courseId, studentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: adminCoursesKeys.enrollments(variables.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: adminCoursesKeys.enrollmentStats(variables.courseId) 
      });
      invalidateCourseDetailQueries(queryClient, variables.courseId);
      invalidateAllCourseQueries(queryClient);
    },
  });
}

// ============================================
// GRADE MUTATIONS (FIXED)
// ============================================

export function useAssignFinalGradeAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      studentId,
      gradeValue,
      feedback,
    }: {
      courseId: string;
      studentId: string;
      gradeValue: number;
      feedback: string;
    }) => assignFinalGradeAdmin(courseId, studentId, gradeValue, feedback),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: adminCoursesKeys.grades(variables.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: adminCoursesKeys.enrollments(variables.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: adminCoursesKeys.enrollmentStats(variables.courseId) 
      });
    },
  });
}

export function useBulkUpdateCourseGrades() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, grades }: { courseId: string; grades: UpdateStudentGradeCommand[] }) =>
      bulkUpdateCourseGrades(courseId, grades),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: adminCoursesKeys.grades(variables.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: adminCoursesKeys.enrollments(variables.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: adminCoursesKeys.enrollmentStats(variables.courseId) 
      });
    },
  });
}

export function useAssignUnitFinalGradeAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      unitId,
      studentId,
      gradeValue,
      feedback,
    }: {
      unitId: string;
      studentId: string;
      gradeValue: number;
      feedback: string;
    }) => assignUnitFinalGradeAdmin(unitId, studentId, gradeValue, feedback),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: adminCoursesKeys.unitGrades(variables.unitId) 
      });
    },
  });
}

export function useBulkUpdateUnitGrades() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ unitId, grades }: { unitId: string; grades: UpdateStudentGradeCommand[] }) =>
      bulkUpdateUnitGrades(unitId, grades),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: adminCoursesKeys.unitGrades(variables.unitId) 
      });
    },
  });
}

// ============================================
// SEARCH HOOKS
// ============================================

export function useSearchStudentsForCourse(courseId: string, searchTerm: string) {
  return useQuery({
    queryKey: [...adminCoursesKeys.students(courseId), 'search', searchTerm],
    queryFn: () => searchStudentsForCourse(courseId, searchTerm),
    enabled: !!courseId && !!searchTerm && searchTerm.trim().length > 0,
    staleTime: 1000 * 30,
  });
}

// Legacy hook for backward compatibility
export function useAdminCourses() {
  return useQuery<AdminCourse[], Error>({
    queryKey: adminCoursesKeys.list({}),
    queryFn: async () => {
      const response = await fetchAllCoursesPaginated({ page: 0, size: 1000 });
      return response.content;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}