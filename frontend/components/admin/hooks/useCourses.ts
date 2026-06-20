'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchAllCoursesPaginated,
  fetchActiveCoursesPaginated,
  fetchCoursesByTeacherPaginated,
  searchCoursesByNamePaginated,
  fetchCourseById,
  createCourse,
  createCourseWithImage,
  updateCourse,
  deleteCourse,
  fetchCourseUnits,
  deleteUnit,
  fetchCourseEnrollments,
  searchStudentsForCourse,
  bulkEnrollStudents,
  bulkUnenrollStudents,
  unenrollStudent,
  fetchCourseGrades,
  assignFinalGrade,
  bulkUpdateCourseGrades,
  fetchUnitGrades,
  assignUnitFinalGrade,
  bulkUpdateUnitGrades,
  getCourseStats,
  getCourseEnrollmentStats,
  fetchAllTeachers,
  fetchAllTeachersPaginated,
  searchTeachers,
} from '@/components/admin/api/coursesApi';
import { uploadImageFile } from '@/app/utils/cloudinary/cloudinary';

import type { AdminCourse } from '@/app/shared/models/admin-course.model';
import type {
  CreateCourseCommand,
  UpdateCourseCommand,
  UpdateStudentGradeCommand
} from '@/app/shared/dtos/commands/course.commands';
import type { PaginatedResponse, PaginationParams } from '@/app/shared/types/pagination';
import { Teacher, Student } from "@/app/shared/models/user.model";

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

function invalidateAllCourseQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({
    queryKey: adminCoursesKeys.all,
    refetchType: 'active'
  });

  queryClient.invalidateQueries({
    queryKey: adminCoursesKeys.stats()
  });
}

function invalidateCourseDetailQueries(
    queryClient: ReturnType<typeof useQueryClient>,
    courseId: string
) {
  queryClient.invalidateQueries({
    queryKey: adminCoursesKeys.detail(courseId)
  });
}

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
    queryFn: async () => {
      const teachers = await searchTeachers(search);
      const { page = 0, size = 20 } = params;
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedTeachers = teachers.slice(startIndex, endIndex);

      return {
        content: paginatedTeachers,
        pageNumber: page,
        pageSize: size,
        totalElements: teachers.length,
        totalPages: Math.ceil(teachers.length / size),
        first: page === 0,
        last: endIndex >= teachers.length,
      };
    },
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
    queryFn: async () => {

      const allTeachers = await searchTeachers(searchTerm);
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
    },
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

export function useAdminCourse(courseId: string) {
  return useQuery({
    queryKey: adminCoursesKeys.detail(courseId),
    queryFn: () => fetchCourseById(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminCourseUnits(courseId: string) {
  return useQuery({
    queryKey: adminCoursesKeys.units(courseId),
    queryFn: () => fetchCourseUnits(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminCourseEnrollments(courseId: string) {
  return useQuery({
    queryKey: adminCoursesKeys.enrollments(courseId),
    queryFn: () => fetchCourseEnrollments(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminCourseGrades(courseId: string) {
  return useQuery({
    queryKey: adminCoursesKeys.grades(courseId),
    queryFn: () => fetchCourseGrades(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminUnitGrades(unitId: string) {
  return useQuery({
    queryKey: adminCoursesKeys.unitGrades(unitId),
    queryFn: () => fetchUnitGrades(unitId),
    enabled: !!unitId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminCourseStats() {
  return useQuery({
    queryKey: adminCoursesKeys.stats(),
    queryFn: getCourseStats,
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
      if (imageFile) {
        const uploadedUrl = await uploadImageFile(imageFile);
        courseData.urlImage = uploadedUrl;
        return await createCourseWithImage(courseData);
      } else {
        return await createCourse(courseData);
      }
    },
    onSuccess: (newCourse) => {
      invalidateAllCourseQueries(queryClient);

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

      if (imageFile) {
        console.log(`Uploading new image for course ${courseId}...`);
        const uploadedUrl = await uploadImageFile(imageFile);
        finalCourseData.imageUrl = uploadedUrl;
      }

      return await updateCourse(courseId, finalCourseData);
    },
    onSuccess: (updatedCourse, variables) => {
      invalidateAllCourseQueries(queryClient);

      queryClient.setQueryData(
          adminCoursesKeys.detail(variables.courseId),
          updatedCourse
      );

      invalidateCourseDetailQueries(queryClient, variables.courseId);
    },
    onError: (error: Error) => {
      console.error("Error updating course:", error.message);
    },
  });
}

export function useDeleteCourseAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => deleteCourse(courseId),
    onSuccess: (_, courseId) => {
      invalidateAllCourseQueries(queryClient);

      queryClient.removeQueries({
        queryKey: adminCoursesKeys.detail(courseId)
      });
    },
  });
}

export function useDeleteUnitAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, unitId }: { courseId: string; unitId: string }) =>
        deleteUnit(courseId, unitId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminCoursesKeys.units(variables.courseId)
      });
      invalidateCourseDetailQueries(queryClient, variables.courseId);

      invalidateAllCourseQueries(queryClient);
    },
  });
}

export function useBulkEnrollStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, studentIds }: { courseId: string; studentIds: string[] }) =>
        bulkEnrollStudents(courseId, studentIds),
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

export function useBulkUnenrollStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, studentIds }: { courseId: string; studentIds: string[] }) =>
        bulkUnenrollStudents(courseId, studentIds),
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
        unenrollStudent(courseId, studentId),
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
    }) => assignFinalGrade(courseId, studentId, { gradeValue, feedback }),
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
    }) => assignUnitFinalGrade(unitId, studentId, { gradeValue, feedback }),
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

export function useSearchStudentsForCourse(courseId: string, searchTerm: string) {
  return useQuery({
    queryKey: [...adminCoursesKeys.students(courseId), 'search', searchTerm],
    queryFn: () => searchStudentsForCourse(courseId, searchTerm),
    enabled: !!courseId && !!searchTerm && searchTerm.trim().length > 0,
    staleTime: 1000 * 30,
  });
}

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
