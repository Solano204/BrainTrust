// File: src/app/features/admin/components/AdminCoursesList.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAdminCoursesPaginated, useDeleteCourseAdmin } from '@/components/admin/hooks/useCourses';
import { AdminCourse } from '@/components/admin/api/coursesApi';
import { 
  Trash2, Edit, Users, BookOpen, BarChart3, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Search, Filter, X, Loader2
} from 'lucide-react';

interface AdminCoursesListProps {
  onEditCourse?: (course: AdminCourse) => void;
  onManageEnrollments?: (course: AdminCourse) => void;
  onManageGrades?: (course: AdminCourse) => void;
  onCreateCourse?: () => void;
}

export function AdminCoursesList({
  onEditCourse,
  onManageEnrollments,
  onManageGrades,
  onCreateCourse,
}: AdminCoursesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [sort, setSort] = useState('createdAt,desc');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Build query params
  const queryParams = {
    page,
    size: pageSize,
    sort,
    search: debouncedSearch || undefined,
    active: filterStatus === 'all' ? undefined : filterStatus === 'active'
  };

  const { data: paginatedResponse, isLoading, error, refetch } = useAdminCoursesPaginated(queryParams);
  const deleteMutation = useDeleteCourseAdmin();

  const courses = paginatedResponse?.content || [];
  const totalElements = paginatedResponse?.totalElements || 0;
  const totalPages = paginatedResponse?.totalPages || 0;

  const handleDelete = async (courseId: string) => {
    if (deleteConfirm === courseId) {
      try {
        await deleteMutation.mutateAsync(courseId);
        setDeleteConfirm(null);
        refetch();
      } catch (error) {
        console.error('Failed to delete course:', error);
      }
    } else {
      setDeleteConfirm(courseId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (field: string) => {
    const [currentField, currentDirection] = sort.split(',');
    let newSort = sort;
    
    if (currentField === field) {
      newSort = `${field},${currentDirection === 'asc' ? 'desc' : 'asc'}`;
    } else {
      newSort = `${field},desc`;
    }
    
    setSort(newSort);
    setPage(0);
  };

  if (isLoading && page === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500 mr-2" />
        <div className="text-gray-500">Loading courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading courses: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-500 mt-1">
            Manage all courses, enrollments, and grades
          </p>
        </div>
        <button
          onClick={onCreateCourse}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <span>+</span>
          Create New Course
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses by name, code, or teacher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as any);
                setPage(0);
              }}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">All Courses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
          
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="12">12 per page</option>
            <option value="24">24 per page</option>
            <option value="48">48 per page</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Total Courses</div>
          <div className="text-2xl font-bold text-gray-900">{totalElements}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Active Courses</div>
          <div className="text-2xl font-bold text-green-600">
            {courses.filter((c) => c.active).length} / {courses.length}
          </div>
        </div>
       
      </div>

      {/* Sorting Controls */}
      <div className="flex gap-4 text-sm">
        <button
          onClick={() => handleSortChange('name')}
          className={`px-3 py-1 rounded ${sort.startsWith('name') ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
        >
          Name {sort.startsWith('name') && (sort.endsWith('asc') ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSortChange('createdAt')}
          className={`px-3 py-1 rounded ${sort.startsWith('createdAt') ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
        >
          Date {sort.startsWith('createdAt') && (sort.endsWith('asc') ? '↑' : '↓')}
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className={`bg-white rounded-lg border-2 overflow-hidden transition hover:shadow-lg ${
              course.active ? 'border-gray-200' : 'border-gray-300 opacity-75'
            }`}
          >
            {/* Course Image */}
            <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 relative">
              {course.urlImage ? (
                <img
                  src={course.urlImage}
                  alt={course.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-lg font-semibold">
                  {course.code}
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    course.active
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}
                >
                  {course.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Course Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                    {course.name}
                  </h3>
                  <p className="text-sm text-gray-500">{course.code}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {course.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Teacher: {course.teacherName}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-1 flex-shrink-0" />
                    {course.studentCount} Students
                  </span>
                  <span className="flex items-center text-gray-600">
                    <BookOpen className="w-4 h-4 mr-1 flex-shrink-0" />
                    {course.unitCount} Units
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Grade: {course.grade} | Group: {course.group}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => onEditCourse?.(course)}
                  className="px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition flex items-center gap-1"
                  title="Edit Course"
                >
                  <Edit className="w-4 h-4" />
                  <span className="sr-only sm:not-sr-only sm:text-sm">Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  className={`px-3 py-2 rounded transition flex items-center gap-1 ${
                    deleteConfirm === course.id
                      ? 'bg-red-600 text-white'
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                  disabled={deleteMutation.isPending}
                  title={deleteConfirm === course.id ? 'Click again to confirm' : 'Delete Course'}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="sr-only sm:not-sr-only sm:text-sm">
                    {deleteConfirm === course.id ? 'Confirm' : 'Delete'}
                  </span>
                </button>
              </div>

              {/* Management Buttons */}
              <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                <button
                  onClick={() => onManageEnrollments?.(course)}
                  className="flex-1 px-3 py-2 bg-purple-50 text-purple-700 rounded text-sm hover:bg-purple-100 transition flex items-center justify-center gap-1"
                >
                  <Users className="w-4 h-4" />
                  <span>Enrollments</span>
                </button>
                <button
                  onClick={() => onManageGrades?.(course)}
                  className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-700 rounded text-sm hover:bg-indigo-100 transition flex items-center justify-center gap-1"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Grades</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Showing {page * pageSize + 1} - {Math.min((page + 1) * pageSize, totalElements)} of {totalElements} courses
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(0)}
              disabled={page === 0}
              className="p-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              title="First Page"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
              className="p-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              title="Previous Page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (page < 3) {
                  pageNum = i;
                } else if (page > totalPages - 3) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 flex items-center justify-center rounded ${
                      page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages - 1}
              className="p-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              title="Next Page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={page >= totalPages - 1}
              className="p-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              title="Last Page"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {courses.length === 0 && !isLoading && (
        <div className="text-center py-12 text-gray-500">
          No courses found matching your criteria
        </div>
      )}

      {/* Loading indicator for pagination */}
      {isLoading && page > 0 && (
        <div className="text-center py-4">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
        </div>
      )}
    </div>
  );
}