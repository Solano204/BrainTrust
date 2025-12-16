// File: src/app/features/courses/components/CourseStudents.tsx
"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, UserPlus, Settings, Mail, Trash2, Loader2, BookOpen, Eye, Users } from "lucide-react";
import { CourseId, UserId } from "@/app/domain/valueObjects";
import { useAuth } from "@/app/context/AuthContext";
import { 
  useEnrollmentsByCourse, 
  useEnrollmentStats, 
  useAvailableUsersSearch,
  useStudentMutations 
} from "@/app/presentation/hooks/student/student-hooks";
import { Enrollment } from "@/app/domain/entities/CourseEntities";
import { User } from "@/app/domain/entities/IdentityEntities";

interface CourseStudentsProps {
  courseId: CourseId;
}

export function CourseStudents({ courseId }: CourseStudentsProps) {
  const { user: currentUser } = useAuth();
  const isTeacher = currentUser?.role === 'teacher';
  
  // Data fetching
  const { 
    data: enrollments = [], 
    isLoading: isLoadingEnrollments,
    error: enrollmentsError,
    refetch: refetchEnrollments 
  } = useEnrollmentsByCourse(courseId);
  
  const { data: stats } = useEnrollmentStats(courseId);

  // Mutations
  const { 
    createEnrollment, 
    bulkEnroll, 
    deleteEnrollment 
  } = useStudentMutations();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStudentDetail, setShowStudentDetail] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [enrollSearchTerm, setEnrollSearchTerm] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<UserId[]>([]);

  // Search for available students
  const { 
    data: searchResults = [], 
    isLoading: isSearching 
  } = useAvailableUsersSearch(courseId, enrollSearchTerm);

  // Filter enrollments for display
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((enrollment) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        enrollment.studentName.toLowerCase().includes(searchLower) ||
        enrollment.studentEmail.toLowerCase().includes(searchLower)
      );
    });
  }, [enrollments, searchTerm]);

  // Handlers
  const handleEnrollUser = (userId: UserId) => {
    if (!isTeacher) return;
    
    createEnrollment.mutate({
      courseId,
      studentId: userId
    }, {
      onSuccess: () => {
        setEnrollSearchTerm('');
        setSelectedUserIds([]);
        setShowEnrollModal(false);
      }
    });
  };

  const handleBulkEnroll = () => {
    if (!isTeacher || selectedUserIds.length === 0) return;
    
    bulkEnroll.mutate({
      courseId,
      studentIds: selectedUserIds
    }, {
      onSuccess: () => {
        setSelectedUserIds([]);
        setEnrollSearchTerm('');
        setShowEnrollModal(false);
      }
    });
  };

  const handleDeleteStudent = () => {
    if (!isTeacher || !selectedEnrollment) return;
    
    deleteEnrollment.mutate({
      courseId,
      studentId: selectedEnrollment.studentId
    }, {
      onSuccess: () => {
        setShowDeleteModal(false);
        setSelectedEnrollment(null);
      }
    });
  };

  const handleToggleUserSelection = (userId: UserId) => {
    if (!isTeacher) return;
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
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

  // STUDENT VIEW - Read Only
  if (!isTeacher) {
    return (
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Classmates</h1>
            {stats && (
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {stats.total} students
                </span>
                <span>Active: {stats.active}</span>
              </div>
            )}
          </div>
        </div>

        <Card className="p-4 sm:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search classmates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredEnrollments.map((enrollment) => (
            <StudentCardReadOnly
              key={enrollment.id}
              enrollment={enrollment}
              onViewDetails={(e) => {
                setSelectedEnrollment(e);
                setShowStudentDetail(true);
              }}
            />
          ))}
        </div>

        {!isLoadingEnrollments && filteredEnrollments.length === 0 && (
          <Card className="text-center p-12 border-2 border-dashed">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No classmates found</h3>
            <p className="text-muted-foreground">No students match your search criteria.</p>
          </Card>
        )}

        <StudentDetailDialog
          isOpen={showStudentDetail}
          onClose={() => setShowStudentDetail(false)}
          enrollment={selectedEnrollment}
          formatDate={formatDate}
          isTeacher={false}
        />
      </div>
    );
  }

  // TEACHER VIEW - Full Access
  if (isLoadingEnrollments) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading students...</p>
      </div>
    );
  }

  if (enrollmentsError) {
    return (
      <div className="p-8 text-center text-destructive">
        <div className="text-4xl mb-4">⚠️</div>
        <p>Error loading students. Please try again.</p>
        <Button onClick={() => refetchEnrollments()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Student Management</h1>
          {stats && (
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span>Total: {stats.total}</span>
              <span>Active: {stats.active}</span>
              {stats.averageGrade > 0 && <span>Avg Grade: {stats.averageGrade}%</span>}
            </div>
          )}
        </div>
        <Button 
          onClick={() => setShowEnrollModal(true)} 
          className="gap-2 w-full sm:w-auto"
        >
          <UserPlus className="h-4 w-4" />
          Enroll Students
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4 sm:p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Students Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredEnrollments.map((enrollment) => (
          <StudentCard
            key={enrollment.id}
            enrollment={enrollment}
            onViewDetails={(e) => {
              setSelectedEnrollment(e);
              setShowStudentDetail(true);
            }}
            onDelete={(e) => {
              setSelectedEnrollment(e);
              setShowDeleteModal(true);
            }}
            isDeleting={deleteEnrollment.isPending}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredEnrollments.length === 0 && (
        <Card className="text-center p-12 border-2 border-dashed">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No students enrolled</h3>
          <p className="text-muted-foreground mb-4">Start by enrolling students in this course</p>
          <Button onClick={() => setShowEnrollModal(true)} className="gap-2">
            <UserPlus className="h-4 w-4" /> Enroll Students
          </Button>
        </Card>
      )}

      {/* Enroll Modal */}
      <Dialog open={showEnrollModal} onOpenChange={setShowEnrollModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enroll Students</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="font-semibold mb-2 block">Search Students</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name or email..." 
                  value={enrollSearchTerm}
                  onChange={(e) => setEnrollSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {selectedUserIds.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {selectedUserIds.length} student(s) selected
                </p>
              </div>
            )}
            
            <div className="border rounded-md max-h-96 overflow-y-auto">
              {isSearching && (
                <div className="p-4 text-center flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                </div>
              )}
              
              {!isSearching && searchResults.length === 0 && enrollSearchTerm && (
                <div className="p-4 text-center text-muted-foreground">
                  No available students found matching "{enrollSearchTerm}"
                </div>
              )}
              
              {searchResults.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-3 hover:bg-muted border-b last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => handleToggleUserSelection(user.id)}
                      className="rounded"
                    />
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                      {user.person.firstName[0]}{user.person.lastName[0]}
                    </div>
                    <div>
                      <div className="font-medium">
                        {user.person.lastName}, {user.person.firstName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEnrollUser(user.id)}
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
              ))}

              {!enrollSearchTerm && (
                <div className="p-4 text-center text-muted-foreground italic">
                  Start typing to search for students
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowEnrollModal(false);
                setSelectedUserIds([]);
                setEnrollSearchTerm('');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleBulkEnroll}
              disabled={selectedUserIds.length === 0 || bulkEnroll.isPending}
              className="gap-2"
            >
              {bulkEnroll.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Enroll {selectedUserIds.length} Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Removal</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to remove {selectedEnrollment?.studentName} from this course?
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
              {deleteEnrollment.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <StudentDetailDialog
        isOpen={showStudentDetail}
        onClose={() => setShowStudentDetail(false)}
        enrollment={selectedEnrollment}
        formatDate={formatDate}
        isTeacher={true}
      />
    </div>
  );
}

// Student Card Components
interface StudentCardProps {
  enrollment: Enrollment;
  onViewDetails: (enrollment: Enrollment) => void;
  onDelete: (enrollment: Enrollment) => void;
  isDeleting: boolean;
}

const StudentCard: React.FC<StudentCardProps> = ({
  enrollment,
  onViewDetails,
  onDelete,
  isDeleting
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'COMPLETED': return 'bg-blue-500';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const initials = enrollment.studentName.split(' ').map(n => n[0]).join('').substring(0, 2);

  return (
    <Card className="group hover:shadow-xl transition-all duration-300">
      <div className="relative">
        <div className="absolute top-4 right-4 z-10">
          <Badge className={getStatusColor(enrollment.status)}>
            {enrollment.status}
          </Badge>
        </div>

        <div className="h-40 bg-gradient-to-br from-blue-100 to-gray-100 dark:from-blue-950/30 dark:to-gray-950/30 flex items-center justify-center">
          <div 
            className="h-28 w-28 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold cursor-pointer group-hover:scale-110 transition-transform"
            onClick={() => onViewDetails(enrollment)}
          >
            {initials}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div 
          className="text-center cursor-pointer" 
          onClick={() => onViewDetails(enrollment)}
        >
          <h3 className="font-bold text-lg hover:text-primary transition-colors">
            {enrollment.studentName}
          </h3>
          <p className="text-sm text-muted-foreground">{enrollment.studentEmail}</p>
        </div>

        {enrollment.finalGrade && (
          <div className="text-center">
            <Badge variant="secondary">
              Grade: {enrollment.finalGrade.grade}%
            </Badge>
          </div>
        )}

        <div className="flex justify-center gap-2 pt-2 border-t">
          <button 
            className="p-2 hover:bg-muted rounded-md transition-colors" 
            onClick={() => onViewDetails(enrollment)}
          >
            <Settings className="h-4 w-4" />
          </button>
          <button className="p-2 hover:bg-muted rounded-md transition-colors">
            <Mail className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(enrollment)}
            className="p-2 hover:bg-muted rounded-md transition-colors"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 hover:text-destructive" />
            )}
          </button>
        </div>
      </div>
    </Card>
  );
};

const StudentCardReadOnly: React.FC<{
  enrollment: Enrollment;
  onViewDetails: (enrollment: Enrollment) => void;
}> = ({ enrollment, onViewDetails }) => {
  const initials = enrollment.studentName.split(' ').map(n => n[0]).join('').substring(0, 2);

  return (
    <Card className="group hover:shadow-xl transition-all duration-300">
      <div className="h-40 bg-gradient-to-br from-blue-100 to-gray-100 dark:from-blue-950/30 dark:to-gray-950/30 flex items-center justify-center">
        <div 
          className="h-28 w-28 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold cursor-pointer group-hover:scale-110 transition-transform"
          onClick={() => onViewDetails(enrollment)}
        >
          {initials}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div 
          className="text-center cursor-pointer" 
          onClick={() => onViewDetails(enrollment)}
        >
          <h3 className="font-bold text-lg hover:text-primary transition-colors">
            {enrollment.studentName}
          </h3>
          <p className="text-sm text-muted-foreground">{enrollment.studentEmail}</p>
        </div>

        <div className="flex justify-center pt-2 border-t">
          <button 
            className="p-2 hover:bg-muted rounded-md transition-colors flex items-center gap-2" 
            onClick={() => onViewDetails(enrollment)}
          >
            <Eye className="h-4 w-4" />
            <span className="text-sm">View Details</span>
          </button>
        </div>
      </div>
    </Card>
  );
};

const StudentDetailDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  enrollment: Enrollment | null;
  formatDate: (date: string) => string;
  isTeacher: boolean;
}> = ({ isOpen, onClose, enrollment, formatDate, isTeacher }) => {
  if (!enrollment) return null;

  const initials = enrollment.studentName.split(' ').map(n => n[0]).join('').substring(0, 2);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isTeacher ? 'Student' : 'Classmate'} Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {initials}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{enrollment.studentName}</h2>
              <p className="text-muted-foreground">{enrollment.studentEmail}</p>
              <Badge className="mt-2">{enrollment.status}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Enrollment Information</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Enrollment Date:</span>
                  <span>{formatDate(enrollment.enrollmentDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span>{enrollment.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student Ref:</span>
                  <span className="font-mono text-xs">{enrollment.studentRefId}</span>
                </div>
              </div>
            </div>

       
          </div>

        
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};