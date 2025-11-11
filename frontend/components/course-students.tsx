// File: src/app/features/courses/components/CourseStudents.tsx
"use client";

import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Search, UserPlus, Settings, MessageSquare, Trash2, Loader2, Mail, Calendar, BookOpen, Phone, MapPin } from "lucide-react"
import { User } from "@/app/domain/entities/IdentityEntities"
import { CourseId, UserId } from "@/app/domain/valueObjects/CourseValues"
import { useEnrollmentsByCourse, useStudentMutations, useEnrollmentStats, useAvailableUsersSearch } from "@/app/presentation/hooks/student/student-hooks"

// Custom Type for Display with complete user data
interface CourseStudentDisplay {
    id: string; // User ID
    enrollmentId: string; // Enrollment ID for mutations
    name: string;
    email: string;
    image: string;
    group: string | null;
    lastAccess: string;
    isActive: boolean;
    grade: number | null;
    user: User; // Complete user data from API
}

interface CourseStudentsProps {
    courseId: CourseId
}

export function CourseStudents({ courseId }: CourseStudentsProps) {
    // React Query for data fetching
    const { 
        data: enrollments = [], 
        isLoading: isLoadingEnrollments,
        error: enrollmentsError,
        refetch: refetchEnrollments 
    } = useEnrollmentsByCourse(courseId);
    
    const { 
        data: stats 
    } = useEnrollmentStats(courseId);

    // Student mutations
    const { 
        createEnrollment, 
        bulkEnroll, 
        deleteEnrollment,
        updateGrade 
    } = useStudentMutations();

    // Local state
    const [searchTerm, setSearchTerm] = useState("");
    const [filterGroup, setFilterGroup] = useState("all");
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showStudentDetail, setShowStudentDetail] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<CourseStudentDisplay | null>(null);
    const [enrollSearchTerm, setEnrollSearchTerm] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<UserId[]>([]);

    // Use React Query for available users search - FIXED: Added courseId dependency
    const { 
        data: enrollResults = [], 
        isLoading: isSearching 
    } = useAvailableUsersSearch( enrollSearchTerm);

    // Transform enrollments to display format using useMemo instead of useEffect
    const students = useMemo(() => {
        if (enrollments.length > 0) {
            return enrollments.map((enrollment) => ({
                id: enrollment.studentId,
                enrollmentId: enrollment.id,
                name: `${enrollment.user.person.firstName} ${enrollment.user.person.lastName}`,
                email: enrollment.user.email,
                image: enrollment.user.person.imagePath || "/placeholder.svg",
                group: null, // This would come from team data
                lastAccess: "Recently", // This would come from activity data
                isActive: enrollment.status === "ACTIVE",
                grade: enrollment.grade ? parseInt(enrollment.grade.value) : null,
                user: enrollment.user // Complete user data from API
            }));
        }
        return [];
    }, [enrollments]); // Only recalculate when enrollments changes

    // Filter students for the main grid display
    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const matchesSearch =
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGroup =
                filterGroup === "all" || student.group === filterGroup || (filterGroup === "none" && !student.group);
            return matchesSearch && matchesGroup;
        });
    }, [students, searchTerm, filterGroup]);

    const handleEnrollUser = (user: User) => {
        createEnrollment.mutate({
            courseId,
            studentId: user.id,
            enrollmentDate: new Date().toISOString().split('T')[0]
        }, {
            onSuccess: () => {
                setEnrollSearchTerm('');
                setSelectedUsers([]);
                setShowEnrollModal(false);
                refetchEnrollments();
            }
        });
    };

    const handleBulkEnroll = () => {
        if (selectedUsers.length > 0) {
            bulkEnroll.mutate({
                courseId,
                studentIds: selectedUsers
            }, {
                onSuccess: () => {
                    setSelectedUsers([]);
                    setEnrollSearchTerm('');
                    setShowEnrollModal(false);
                    refetchEnrollments();
                }
            });
        }
    };

    const handleDeleteStudent = () => {
        if (selectedStudent) {
            deleteEnrollment.mutate(selectedStudent.enrollmentId, {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setSelectedStudent(null);
                    refetchEnrollments();
                }
            });
        }
    };

    const handleToggleUserSelection = (userId: UserId) => {
        setSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleViewStudentDetails = (student: CourseStudentDisplay) => {
        setSelectedStudent(student);
        setShowStudentDetail(true);
    };

    // Helper functions for display
    const getGradeDisplay = (grade: number | null | undefined) => {
        const g = grade ?? null;
        if (g === null) return 'N/A';
        if (typeof g === 'number' && !isNaN(g)) {
            return `${Math.round(g)}%`;
        }
        return 'N/A';
    };

    const getGradeColor = (grade: number | null | undefined) => {
        const g = grade ?? 0;
        if (g >= 90) return "bg-green-600";
        if (g >= 70) return "bg-blue-600";
        return "bg-red-600";
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return 'Invalid date';
        }
    };

    if (isLoadingEnrollments) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                Loading students...
            </div>
        );
    }

    if (enrollmentsError) {
        return (
            <div className="p-8 text-center text-destructive">
                <div className="h-8 w-8 mx-auto mb-4">⚠️</div>
                Error loading students. Please try again.
                <Button onClick={() => refetchEnrollments()} className="mt-4">
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
            {/* Header with Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Student Management</h1>
                    {stats && (
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Total: {stats.total}</span>
                            <span>Active: {stats.active}</span>
                            <span>Average Grade: {stats.averageGrade}%</span>
                        </div>
                    )}
                </div>
                <Button 
                    onClick={() => setShowEnrollModal(true)} 
                    className="gap-2 w-full sm:w-auto"
                    disabled={createEnrollment.isPending}
                >
                    <UserPlus className="h-4 w-4" />
                    {createEnrollment.isPending ? "Enrolling..." : "Enroll Students"}
                </Button>
            </div>

            {/* Filters */}
            <Card className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <select
                        value={filterGroup}
                        onChange={(e) => setFilterGroup(e.target.value)}
                        className="px-4 py-2 border border-input rounded-md bg-background"
                    >
                        <option value="all">Filter by Group: All</option>
                        <option value="Project Final A">Project Final A</option>
                        <option value="Project Final B">Project Final B</option>
                        <option value="none">No Group</option>
                    </select>
                </div>
            </Card>

            {/* Students Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredStudents.map((student) => (
                    <StudentCard
                        key={student.id}
                        student={student}
                        onViewDetails={handleViewStudentDetails}
                        onDelete={(student) => {
                            setSelectedStudent(student);
                            setShowDeleteModal(true);
                        }}
                        onUpdateGrade={(studentId, grade) => {
                            // Implementation for grade update
                            console.log(`Update grade for ${studentId}: ${grade}`);
                        }}
                        isDeleting={deleteEnrollment.isPending}
                    />
                ))}
            </div>

            {/* Empty State */}
            {!isLoadingEnrollments && filteredStudents.length === 0 && (
                <Card className="text-center p-12 border-2 border-dashed">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">No students enrolled</h3>
                    <p className="text-muted-foreground mb-4">Start by enrolling students in this course</p>
                    <Button onClick={() => setShowEnrollModal(true)} className="gap-2">
                        <UserPlus className="h-4 w-4" /> Enroll Students
                    </Button>
                </Card>
            )}

            {/* Enroll Modal */}
            <Dialog open={showEnrollModal} onOpenChange={setShowEnrollModal}>
                <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Enroll Students in Course</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label htmlFor="enroll-search" className="font-bold mb-2 block">Search User by Name or Email</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    id="enroll-search"
                                    placeholder="Ex. Juan Pérez or juan.perez@email.com" 
                                    value={enrollSearchTerm}
                                    onChange={(e) => setEnrollSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        
                        {/* Selected Users Counter */}
                        {selectedUsers.length > 0 && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    {selectedUsers.length} user(s) selected for enrollment
                                </p>
                            </div>
                        )}
                        
                        {/* Search Results Display */}
                        <div className="border border-border rounded-md max-h-96 overflow-y-auto">
                            {isSearching && (
                                <div className="p-3 text-center text-primary/70 flex items-center justify-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                                </div>
                            )}
                            
                            {!isSearching && enrollResults.length === 0 && enrollSearchTerm && (
                                <div className="p-3 text-center text-muted-foreground">
                                    No users found matching "{enrollSearchTerm}" or user already enrolled.
                                </div>
                            )}
                            
                            {enrollResults.map((user) => (
                                <div 
                                    key={user.id} 
                                    className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user.id)}
                                            onChange={() => handleToggleUserSelection(user.id)}
                                            className="rounded"
                                        />
                                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                            {user.person.imagePath ? (
                                                <img 
                                                    src={user.person.imagePath} 
                                                    alt={`${user.person.firstName} ${user.person.lastName}`}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-sm font-medium">
                                                    {user.person.firstName[0]}{user.person.lastName[0]}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                {user.person.lastName}, {user.person.firstName}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {user.email} • {user.role}
                                                {user.person.phone && ` • ${user.person.phone}`}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Registered: {formatDate(user.person.registrationDate)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => handleEnrollUser(user)}
                                            disabled={createEnrollment.isPending}
                                        >
                                            {createEnrollment.isPending ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <UserPlus className="h-3 w-3" />
                                            )}
                                            Enroll
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {!enrollSearchTerm && (
                                <div className="p-3 text-center text-muted-foreground italic">
                                    Start typing a name or email to search for users not yet in this course.
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setShowEnrollModal(false);
                                setSelectedUsers([]);
                                setEnrollSearchTerm('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleBulkEnroll}
                            disabled={selectedUsers.length === 0 || bulkEnroll.isPending}
                            className="gap-2"
                        >
                            {bulkEnroll.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <UserPlus className="h-4 w-4" />
                            )}
                            Enroll {selectedUsers.length} Selected
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent className="max-w-[95vw] sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm Student Removal</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-muted-foreground">
                            Are you sure you want to remove {selectedStudent?.name} from the course? 
                            Their grades and data will be maintained in the system.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleDeleteStudent}
                            disabled={deleteEnrollment.isPending}
                        >
                            {deleteEnrollment.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            {deleteEnrollment.isPending ? "Removing..." : "Remove Student"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Student Detail Modal */}
            <Dialog open={showStudentDetail} onOpenChange={setShowStudentDetail}>
                <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Student Details</DialogTitle>
                    </DialogHeader>
                    {selectedStudent && (
                        <div className="space-y-6 py-4">
                            {/* Header */}
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                    {selectedStudent.user.person.imagePath ? (
                                        <img 
                                            src={selectedStudent.user.person.imagePath} 
                                            alt={selectedStudent.name}
                                            className="h-20 w-20 rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl font-bold text-white">
                                            {selectedStudent.user.person.firstName[0]}{selectedStudent.user.person.lastName[0]}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                                    <p className="text-muted-foreground">{selectedStudent.email}</p>
                                    <Badge className={`mt-2 ${selectedStudent.isActive ? 'bg-green-600' : 'bg-yellow-600'}`}>
                                        {selectedStudent.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>

                            {/* Personal Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-lg">Personal Information</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Full Name:</span>
                                            <span>{selectedStudent.user.person.firstName} {selectedStudent.user.person.lastName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Gender:</span>
                                            <span>{selectedStudent.user.person.gender || 'Not specified'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Phone:</span>
                                            <span>{selectedStudent.user.person.phone || 'Not provided'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Registration Date:</span>
                                            <span>{formatDate(selectedStudent.user.person.registrationDate)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Course Information */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-lg">Course Information</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Enrollment Status:</span>
                                            <Badge variant={selectedStudent.isActive ? "default" : "secondary"}>
                                                {selectedStudent.isActive ? 'ACTIVE' : 'INACTIVE'}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Current Grade:</span>
                                            <Badge className={getGradeColor(selectedStudent.grade)}>
                                                {getGradeDisplay(selectedStudent.grade)}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Last Access:</span>
                                            <span>{selectedStudent.lastAccess}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Group:</span>
                                            <span>{selectedStudent.group || 'Not assigned'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address Information */}
                            {selectedStudent.user.person.address && (
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-lg">Address</h3>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span>
                                            {selectedStudent.user.person.address.street}, {selectedStudent.user.person.address.colony}, {selectedStudent.user.person.address.state} {selectedStudent.user.person.address.postalCode}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowStudentDetail(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Individual Student Card Component
interface StudentCardProps {
    student: CourseStudentDisplay;
    onViewDetails: (student: CourseStudentDisplay) => void;
    onDelete: (student: CourseStudentDisplay) => void;
    onUpdateGrade: (studentId: string, grade: number) => void;
    isDeleting: boolean;
}

const StudentCard: React.FC<StudentCardProps> = ({
    student,
    onViewDetails,
    onDelete,
    onUpdateGrade,
    isDeleting
}) => {
    const getGradeDisplay = (grade: number | null | undefined) => {
        const g = grade ?? null;
        if (g === null) return 'N/A';
        if (typeof g === 'number' && !isNaN(g)) {
            return `${Math.round(g)}%`;
        }
        return 'N/A';
    };

    const getGradeColor = (grade: number | null | undefined) => {
        const g = grade ?? 0;
        if (g >= 90) return "bg-green-600";
        if (g >= 70) return "bg-blue-600";
        return "bg-red-600";
    };

    return (
        <Card key={student.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="relative">
                {/* Status Indicator */}
                <div className="absolute top-4 right-4 z-10">
                    <div
                        className={`h-3 w-3 rounded-full ${student.isActive ? "bg-green-500" : "bg-yellow-500"} shadow-lg`}
                        title={student.isActive ? "Active" : "Inactive"}
                    />
                </div>

                {/* Student Image */}
                <div className="relative h-40 bg-gradient-to-br from-blue-100 to-gray-100 dark:from-blue-950/30 dark:to-gray-950/30 flex items-center justify-center">
                    <div 
                        className="relative h-28 w-28 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg group-hover:scale-110 transition-transform cursor-pointer"
                        onClick={() => onViewDetails(student)}
                    >
                        {student.user.person.imagePath ? (
                            <img 
                                src={student.user.person.imagePath} 
                                alt={student.name} 
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <span className="text-2xl font-bold text-white">
                                    {student.user.person.firstName[0]}{student.user.person.lastName[0]}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Grade Badge */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                    <Badge
                        className={`text-lg font-bold px-4 py-1 ${getGradeColor(student.grade)}`}
                    >
                        {getGradeDisplay(student.grade)}
                    </Badge>
                </div>
            </div>

            <div className="p-4 space-y-3">
                <div 
                    className="text-center cursor-pointer" 
                    onClick={() => onViewDetails(student)}
                >
                    <h3 className="font-bold text-lg hover:text-primary transition-colors">{student.name}</h3>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                </div>

                {student.group && (
                    <div className="flex justify-center">
                        <Badge variant="secondary" className="text-xs">
                            {student.group}
                        </Badge>
                    </div>
                )}

                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <div className={`h-2 w-2 rounded-full ${student.isActive ? "bg-green-500" : "bg-yellow-500"}`} />
                    <span>Last access: {student.lastAccess}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-2 pt-2 border-t border-border">
                    <button 
                        className="p-2 hover:bg-muted rounded-md transition-colors" 
                        title="View Details"
                        onClick={() => onViewDetails(student)}
                    >
                        <Settings className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </button>
                    <button className="p-2 hover:bg-muted rounded-md transition-colors" title="Send Message">
                        <Mail className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </button>
                    <button
                        onClick={() => onDelete(student)}
                        className="p-2 hover:bg-muted rounded-md transition-colors"
                        title="Remove Student"
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        )}
                    </button>
                </div>
            </div>
        </Card>
    );
};