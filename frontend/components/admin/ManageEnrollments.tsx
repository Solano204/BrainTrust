// File: src/app/features/admin/components/ManageEnrollments.tsx
'use client';

import { useState } from 'react';
import {
  useAdminCourseEnrollments,
  useSearchStudentsForCourse,
  useBulkEnrollStudents,
  useBulkUnenrollStudents,
  useUnenrollStudentAdmin,
} from '@/components/admin/hooks/useCourses';
import { AdminCourse } from '@/components/admin/api/coursesApi';
import { X, Search, UserPlus, UserMinus, Mail, Calendar, Loader2 } from 'lucide-react';

interface ManageEnrollmentsProps {
  course: AdminCourse;
  isOpen: boolean;
  onClose: () => void;
}

export function ManageEnrollments({ course, isOpen, onClose }: ManageEnrollmentsProps) {
  const { data: enrollments, isLoading, refetch } = useAdminCourseEnrollments(course.id);
  const bulkEnrollMutation = useBulkEnrollStudents();
  const bulkUnenrollMutation = useBulkUnenrollStudents();
  const unenrollMutation = useUnenrollStudentAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [enrolledSelectedStudents, setEnrolledSelectedStudents] = useState<string[]>([]);
  const [showAddStudents, setShowAddStudents] = useState(false);

  const { data: availableStudents, isLoading: searchingStudents } = useSearchStudentsForCourse(
    course.id,
    showAddStudents ? searchTerm : ''
  );

  const handleBulkEnroll = async () => {
    if (selectedStudents.length === 0) return;

    try {
      await bulkEnrollMutation.mutateAsync({
        courseId: course.id,
        studentIds: selectedStudents,
      });
      setSelectedStudents([]);
      setSearchTerm('');
      setShowAddStudents(false);
      refetch();
    } catch (error) {
      console.error('Failed to enroll students:', error);
    }
  };

  const handleBulkUnenroll = async () => {
    if (enrolledSelectedStudents.length === 0) return;

 

    try {
      await bulkUnenrollMutation.mutateAsync({
        courseId: course.id,
        studentIds: enrolledSelectedStudents,
      });
      setEnrolledSelectedStudents([]);
      refetch();
    } catch (error) {
      console.error('Failed to unenroll students:', error);
    }
  };

  const handleUnenrollSingle = async (studentId: string) => {
   
    try {
      await unenrollMutation.mutateAsync({ courseId: course.id, studentId });
      refetch();
    } catch (error) {
      console.error('Failed to unenroll student:', error);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleEnrolledSelection = (studentId: string) => {
    setEnrolledSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Enrollments</h2>
            <p className="text-gray-500 text-sm mt-1">{course.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600">Total Enrolled</div>
              <div className="text-2xl font-bold text-blue-900">
                {enrollments?.length || 0}
              </div>
            </div>
           
           
          </div>

          {/* Add Students Section */}
          {!showAddStudents ? (
            <button
              onClick={() => setShowAddStudents(true)}
              className="w-full mb-6 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Add Students to Course
            </button>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Add Students</h3>
                <button
                  onClick={() => {
                    setShowAddStudents(false);
                    setSelectedStudents([]);
                    setSearchTerm('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search students by name or email..."
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute right-3 top-3">
                  {searchingStudents ? (
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Available Students */}
              {availableStudents && availableStudents.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                  {availableStudents.map((student) => (
                    <div
                      key={student.userId}
                      className="flex items-center gap-3 p-3 bg-white rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleStudentSelection(student.userId)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.userId)}
                        onChange={() => toggleStudentSelection(student.userId)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {student.fullName}
                        </div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                        <div className="text-xs text-gray-400">ID: {student.studentRefId}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchTerm.length > 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchingStudents ? 'Searching...' : 'No available students found'}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Enter a search term to find students
                </div>
              )}

              {/* Bulk Enroll Button */}
              {selectedStudents.length > 0 && (
                <button
                  onClick={handleBulkEnroll}
                  disabled={bulkEnrollMutation.isPending}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {bulkEnrollMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Enroll {selectedStudents.length} Student(s)
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Enrolled Students */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Enrolled Students</h3>
              {enrolledSelectedStudents.length > 0 && (
                <button
                  onClick={handleBulkUnenroll}
                  disabled={bulkUnenrollMutation.isPending}
                  className="px-3 py-1 bg-red-50 text-red-700 rounded text-sm hover:bg-red-100 transition flex items-center gap-1"
                >
                  {bulkUnenrollMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Unenrolling...
                    </>
                  ) : (
                    <>
                      <UserMinus className="w-4 h-4" />
                      Unenroll {enrolledSelectedStudents.length} Selected
                    </>
                  )}
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-8 flex items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="text-gray-500">Loading enrollments...</span>
              </div>
            ) : enrollments && enrollments.length > 0 ? (
              enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200"
                >
                  <input
                    type="checkbox"
                    checked={enrolledSelectedStudents.includes(enrollment.studentId)}
                    onChange={() => toggleEnrolledSelection(enrollment.studentId)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {enrollment.studentName}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs rounded ${
                          enrollment.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : enrollment.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {enrollment.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {enrollment.studentEmail}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                      </span>
                    </div>
                    {enrollment.finalGrade && (
                      <div className="mt-1 text-sm text-blue-600 font-medium">
                        Grade: {enrollment.finalGrade.value}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleUnenrollSingle(enrollment.studentId)}
                    disabled={unenrollMutation.isPending}
                    className="px-3 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition disabled:opacity-50"
                    title="Unenroll student"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No students enrolled yet
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}