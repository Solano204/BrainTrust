"use client";

import { useState, useEffect, useRef } from "react";
import {
  useCreateCourseAdmin,
  useUpdateCourseAdmin,
  useAdminTeachersPaginated,
} from "@/components/admin/hooks/useCourses";
import {
  AdminCourse,
  CreateCourseCommand,
  UpdateCourseCommand,
  Teacher,
} from "@/components/admin/api/coursesApi";
import {
  X,
  Search,
  ChevronDown,
  Loader2,
  User,
  Mail,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  UserCheck,
  Star,
  BookOpen,
} from "lucide-react";
import { ImageUploadWithValidation } from "../teacher-student/image-upload-with-validation";

interface CreateEditCourseModalProps {
  course?: AdminCourse | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const getInitials = (fullName: string): string => {
  const parts = fullName.split(" ");
  return parts.length > 1
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : fullName.substring(0, 2).toUpperCase();
};

export function CreateEditCourseModal({
  course,
  isOpen,
  onClose,
  onSuccess,
}: CreateEditCourseModalProps) {
  const isEdit = !!course;
  const createMutation = useCreateCourseAdmin();
  const updateMutation = useUpdateCourseAdmin();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    grade: "",
    group: "",
    teacherId: "",
    imageUrl: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [teacherSearch, setTeacherSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [teacherPage, setTeacherPage] = useState(0);
  const [teacherPageSize, setTeacherPageSize] = useState(10);
  const [teacherSort, setTeacherSort] = useState<"fullName,asc" | "email,asc">(
    "fullName,asc"
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const teachersListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(teacherSearch);
      setTeacherPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [teacherSearch]);

  const {
    data: teachersData,
    isLoading: loadingTeachers,
    isFetching: fetchingTeachers,
    error: teachersError,
    refetch: refetchTeachers,
  } = useAdminTeachersPaginated({
    page: teacherPage,
    size: teacherPageSize,
    sort: teacherSort,
    search: debouncedSearch || undefined,
    active: true,
  });

  const teachers = teachersData?.content || [];
  const totalPages = teachersData?.totalPages || 0;
  const totalElements = teachersData?.totalElements || 0;

  const startItem = Math.min(teacherPage * teacherPageSize + 1, totalElements);
  const endItem = Math.min((teacherPage + 1) * teacherPageSize, totalElements);

  useEffect(() => {
    if (isOpen) {
      if (course) {
        setFormData({
          code: course.code,
          name: course.name,
          description: course.description,
          grade: course.grade,
          group: course.group,
          teacherId: course.teacherId,
          imageUrl: course.urlImage || "",
        });

        setImagePreview(course.urlImage || "");
        setImageFile(null);

        setTeacherSearch(`Teacher ID: ${course.teacherId}`);
      } else {
        setFormData({
          code: "",
          name: "",
          description: "",
          grade: "",
          group: "",
          teacherId: "",
          imageUrl: "",
        });
        setTeacherSearch("");
        setImagePreview("");
        setImageFile(null);
      }
    }
  }, [isOpen, course]);

  useEffect(() => {
    if (formData.teacherId && teachers.length > 0) {
      const teacher = teachers.find((t) => t.userId === formData.teacherId);
      if (teacher) {
        setTeacherSearch(teacher.fullName);
      }
    }
  }, [teachers, formData.teacherId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowTeacherDropdown(false);
      }
    };

    if (showTeacherDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTeacherDropdown]);

  useEffect(() => {
    if (showTeacherDropdown && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [showTeacherDropdown]);

  useEffect(() => {
    if (!isOpen) {
      setTeacherSearch("");
      setDebouncedSearch("");
      setTeacherPage(0);
      setShowTeacherDropdown(false);
      setImagePreview("");
      setImageFile(null);
    }
  }, [isOpen]);

  const handleImageChange = (
    imageData: { file: File; previewUrl: string; validationType: string } | null
  ) => {
    if (imageData) {
      setImageFile(imageData.file);
      setImagePreview(imageData.previewUrl);
      setFormData({ ...formData, imageUrl: imageData.previewUrl });
    } else {
      setImageFile(null);
      setImagePreview("");
      setFormData({ ...formData, imageUrl: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEdit && course) {
        const command: UpdateCourseCommand = {
          name: formData.name,
          description: formData.description,
          grade: formData.grade,
          group: formData.group,
          teacherId: formData.teacherId,
          courseId: course.id

        };
        await updateMutation.mutateAsync({
          courseId: course.id,
          courseData: command,
          imageFile,
        });
      } else {
        let finalImageUrl = formData.imageUrl;

        if (imageFile) {
          // TODO: Implement image upload to your backend
          console.log("Image file ready for upload:", imageFile);
        }

        const command: CreateCourseCommand = {
          code: formData.code,
          name: formData.name,
          description: formData.description,
          grade: formData.grade,
          group: formData.group,
          teacherId: formData.teacherId,
          urlImage: finalImageUrl,
        };
        await createMutation.mutateAsync({ courseData: command, imageFile });
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to save course:", error);
    }
  };

  const handleTeacherSelect = (teacher: Teacher) => {
    if (!teacher.userId) {
      console.error("Teacher object is missing userId property:", teacher);
      return;
    }

    setFormData({ ...formData, teacherId: teacher.userId });
    setTeacherSearch(teacher.fullName);
    setShowTeacherDropdown(false);
    setTeacherPage(0);
  };

  const handleSearchChange = (value: string) => {
    setTeacherSearch(value);
    

    if (!value.trim()) {
      setFormData({ ...formData, teacherId: "" });
    }
  };

  const handleSearchFocus = () => {
    setShowTeacherDropdown(true);
    if (formData.teacherId) {
      setTeacherSearch("");
      setDebouncedSearch("");
    }
  };

  const handleNextPage = () => {
    if (teacherPage < totalPages - 1) {
      setTeacherPage(teacherPage + 1);
      if (teachersListRef.current) {
        teachersListRef.current.scrollTop = 0;
      }
    }
  };

  const handlePrevPage = () => {
    if (teacherPage > 0) {
      setTeacherPage(teacherPage - 1);
      if (teachersListRef.current) {
        teachersListRef.current.scrollTop = 0;
      }
    }
  };

  const handlePageSizeChange = (size: number) => {
    setTeacherPageSize(size);
    setTeacherPage(0);
  };

  const handleSortChange = (sort: "fullName,asc" | "email,asc") => {
    setTeacherSort(sort);
    setTeacherPage(0);
  };

  const selectedTeacher = teachers.find((t) => t.userId === formData.teacherId);
  const isLoading = loadingTeachers || fetchingTeachers;
  const error = teachersError;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(
        0,
        teacherPage - Math.floor(maxVisiblePages / 2)
      );
      let endPage = startPage + maxVisiblePages - 1;

      if (endPage >= totalPages) {
        endPage = totalPages - 1;
        startPage = Math.max(0, endPage - maxVisiblePages + 1);
      }

      if (startPage > 0) {
        pages.push(0);
        if (startPage > 1) pages.push(-1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        if (endPage < totalPages - 2) pages.push(-1);
        pages.push(totalPages - 1);
      }
    }

    return pages;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEdit ? "Edit Course" : "Create New Course"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isEdit
                ? "Update course information and assign teacher"
                : "Create a new course with all necessary details"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Course Code */}
            {!isEdit && (
              <div className="bg-gradient-to-r from-blue-50 to-transparent p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Course Code *
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="e.g., CS-101, MATH-201, ENG-301"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Unique identifier for the course. Use a consistent format.
                </p>
              </div>
            )}

            {/* Course Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="e.g., Introduction to Computer Science, Advanced Mathematics"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                rows={3}
                placeholder="Brief description of the course content, objectives, and requirements..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade Level *
                </label>
                <input
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData({ ...formData, grade: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white"
                  required
                >
                 
                </input>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group / Section *
                </label>
                <input
                  type="text"
                  value={formData.group}
                  onChange={(e) =>
                    setFormData({ ...formData, group: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="e.g., Section A, Group 1"
                  required
                />
              </div>
            </div>

            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Assign Teacher *
                </span>
              </label>

              <div className="relative">
                {/* Search Input */}
                <input
                  ref={searchInputRef}
                  type="text"
                  value={teacherSearch}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={handleSearchFocus}
                  className="w-full px-4 py-3 pl-11 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Search for a teacher by name or email..."
                />
                <div className="absolute left-3 top-3.5 pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <div className="absolute right-3 top-3.5 pointer-events-none">
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  ) : (
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        showTeacherDropdown ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </div>
              </div>

              {selectedTeacher && !showTeacherDropdown && (
                <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {getInitials(selectedTeacher.fullName)}
                      </div>
                      <div>
                        <div className="font-medium text-blue-900 flex items-center gap-2">
                          {selectedTeacher.fullName}
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            <Star className="w-3 h-3 mr-1" />
                            Teacher
                          </span>
                        </div>
                        <div className="text-sm text-blue-700 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {selectedTeacher.email}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, teacherId: "" });
                        setTeacherSearch("");
                        setDebouncedSearch("");
                      }}
                      className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition"
                      title="Remove teacher"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {showTeacherDropdown && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl max-h-[400px] overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium text-gray-900">
                        Select Teacher{" "}
                        {totalElements > 0 && `(${totalElements} found)`}
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={teacherSort}
                          onChange={(e) =>
                            handleSortChange(e.target.value as any)
                          }
                          className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="fullName,asc">Sort by Name</option>
                          <option value="email,asc">Sort by Email</option>
                        </select>
                        <select
                          value={teacherPageSize}
                          onChange={(e) =>
                            handlePageSizeChange(Number(e.target.value))
                          }
                          className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="5">5 per page</option>
                          <option value="10">10 per page</option>
                          <option value="20">20 per page</option>
                        </select>
                      </div>
                    </div>
                    {debouncedSearch && (
                      <div className="text-sm text-gray-500">
                        Searching for: "{debouncedSearch}"
                      </div>
                    )}
                  </div>

                  {/* Loading State */}
                  {isLoading && teachers.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                      <div className="text-gray-500">Loading teachers...</div>
                      {error && (
                        <div className="mt-2 text-sm text-red-500">
                          Error loading teachers. Please try again.
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Teacher List */}
                      <div
                        ref={teachersListRef}
                        className="flex-1 overflow-y-auto"
                        style={{ maxHeight: "280px" }}
                      >
                        {teachers.length > 0 ? (
                          teachers.map((teacher) => (
                            <button
                              key={teacher.userId}
                              type="button"
                              onClick={() => handleTeacherSelect(teacher)}
                              className="w-full px-4 py-4 text-left hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0 flex items-center justify-between group"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                                  {getInitials(teacher.fullName)}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 group-hover:text-blue-600 transition">
                                    {teacher.fullName}
                                  </div>
                                  <div className="text-sm text-gray-500 flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {teacher.email}
                                  </div>
                                </div>
                              </div>
                              {formData.teacherId === teacher.userId && (
                                <Check className="w-5 h-5 text-blue-600" />
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center p-8 text-center">
                            <User className="w-12 h-12 text-gray-300 mb-4" />
                            <div className="text-gray-500 font-medium mb-1">
                              {debouncedSearch
                                ? "No teachers found"
                                : "No teachers available"}
                            </div>
                            {debouncedSearch && (
                              <div className="text-sm text-gray-400">
                                Try a different search term
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 0 && (
                        <div className="border-t border-gray-200 bg-gray-50">
                          <div className="px-4 py-3 border-b border-gray-200">
                            <div className="flex items-center justify-between text-sm">
                              <div className="text-gray-600">
                                Showing{" "}
                                <span className="font-medium">
                                  {startItem}-{endItem}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium">
                                  {totalElements}
                                </span>{" "}
                                teachers
                              </div>
                              <div className="text-gray-600">
                                Page{" "}
                                <span className="font-medium">
                                  {teacherPage + 1}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium">
                                  {totalPages}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="px-4 py-3">
                            <div className="flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => setTeacherPage(0)}
                                disabled={teacherPage === 0}
                                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition flex items-center gap-1 text-sm"
                              >
                                <ChevronsLeft className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={handlePrevPage}
                                disabled={teacherPage === 0}
                                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition flex items-center gap-1 text-sm"
                              >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Previous</span>
                              </button>

                              <div className="flex items-center gap-1">
                                {getPageNumbers().map((pageNum, index) =>
                                  pageNum === -1 ? (
                                    <span
                                      key={`ellipsis-${index}`}
                                      className="px-2 py-1 text-gray-400"
                                    >
                                      ...
                                    </span>
                                  ) : (
                                    <button
                                      key={pageNum}
                                      type="button"
                                      onClick={() => {
                                        setTeacherPage(pageNum);
                                        if (teachersListRef.current) {
                                          teachersListRef.current.scrollTop = 0;
                                        }
                                      }}
                                      className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium ${
                                        teacherPage === pageNum
                                          ? "bg-blue-600 text-white"
                                          : "border border-gray-300 hover:bg-gray-50 text-gray-700"
                                      }`}
                                    >
                                      {pageNum + 1}
                                    </button>
                                  )
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={handleNextPage}
                                disabled={teacherPage >= totalPages - 1}
                                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition flex items-center gap-1 text-sm"
                              >
                                <span>Next</span>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setTeacherPage(totalPages - 1)}
                                disabled={teacherPage >= totalPages - 1}
                                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition flex items-center gap-1 text-sm"
                              >
                                <ChevronsRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {!isEdit && (
              <ImageUploadWithValidation
                currentImageUrl={imagePreview}
                onImageChange={handleImageChange}
                label="Course Cover Image"
                disabled={createMutation.isPending}
              />
            )}
          </div>
          {/* Footer Actions */}
          <div className="border-t border-gray-200 bg-gray-50 p-6 sticky bottom-0">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending ||
                  !formData.teacherId ||
                  !formData.name ||
                  !formData.description ||
                  !formData.grade ||
                  !formData.group ||
                  (!isEdit && !formData.code)
                }
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isEdit ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    {isEdit ? "Update Course" : "Create Course"}
                  </>
                )}
              </button>
            </div>

            {/* Validation Messages */}
            <div className="mt-4 space-y-2">
              {!formData.teacherId && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                  <div className="font-medium mb-1">⚠️ Teacher Required</div>
                  <div>
                    Please select a teacher from the dropdown list above.
                  </div>
                </div>
              )}

              {(createMutation.error || updateMutation.error) && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                  <div className="font-medium mb-1">❌ Error</div>
                  <div>
                    {(createMutation.error || updateMutation.error)?.message ||
                      "An error occurred while saving the course."}
                  </div>
                </div>
              )}

              {/* Success Message */}
              {(createMutation.isSuccess || updateMutation.isSuccess) && (
                <div className="text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg p-3">
                  <div className="font-medium mb-1">✅ Success!</div>
                  <div>
                    {isEdit
                      ? "Course updated successfully!"
                      : "Course created successfully!"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}