// File: src/app/features/courses/components/CourseTaskOverview.tsx
"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Eye,
  Loader2,
  BarChart3,
  FileText,
  HelpCircle,
  Users,
  Calendar,
  Clock,
} from "lucide-react";
import { SubmissionId, UserId } from "@/app/domain/valueObjects";
import { SubmissionDetailView } from "./task-view-submission-teacher";
import { QuizSubmissionsView } from "./quiz-view-submission-teacher";
import {
  useTaskInventoryManagement,
  useTaskInventoryMutations,
} from "@/app/presentation/hooks/task/task-inventory-hooks";
import { useQuizzesByCourse, useQuizzesByCourseWithoutDetails } from "@/components/teacher/hooks/quiz-hooks";
import {
  TaskType,
} from "@/app/domain/entities/CourseEntities";
import { useSubmissionQuizByStudentAndQuiz } from "@/app/infraestructure/api/course/teacher/submission/quiz-submissions-hooks";

interface CourseTaskOverviewProps {
  courseId: string;
}

// Combined interface for displaying both tasks and quizzes
interface CombinedTaskItem {
  id: string;
  title: string;
  unit: string;
  type: TaskType;
  deadline: string;
  isOverdue: boolean;
  courseId: string;
  // Task specific
  taskId?: string;
  studentId?: string;
  // Quiz specific
  quizId?: string;
  timeLimit?: number;
  questions?: any[];
  maxGrade?: number;
  dueDate?: string;
}

export function CourseTaskOverviewTeacher({
  courseId,
}: CourseTaskOverviewProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<UserId | null>(
    null
  );
  const [viewingQuiz, setViewingQuiz] = useState<string | null>(null);

  // Use existing hooks
  const {
    tasks,
    isLoadingTasks,
    tasksError,
    searchTerm,
    setSearchTerm,
    selectedSubmissionId,
    submissionDetail,
    isLoadingDetail,
    detailError,
    handleViewSubmission,
    handleBackFromDetail,
  } = useTaskInventoryManagement(courseId);

  const { updateGrade, requestAnalysis, downloadAttachment } =
    useTaskInventoryMutations();

  const { data: quizzes = [], isLoading: isLoadingQuizzes } =
    useQuizzesByCourseWithoutDetails(courseId);
  // NEW: Get single quiz submission for specific student and quiz
  const { data: singleQuizSubmission, isLoading: isLoadingSingleSubmission } =
    useSubmissionQuizByStudentAndQuiz(selectedQuizId);

  // Combine tasks and quizzes for display
  const combinedItems: CombinedTaskItem[] = useMemo(() => {
    const taskItems: CombinedTaskItem[] = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      unit: task.unit,
      type: task.type,
      deadline: task.deadline,
      isOverdue: task.isOverdue,
      courseId: task.courseId,
      taskId: task.taskId,
      studentId: task.studentId,
    }));

    const quizItems: CombinedTaskItem[] = quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      unit: quiz.unit,
      type: "QUIZ" as TaskType,
      deadline: quiz.deadline,
      isOverdue: quiz.isOverdue,
      courseId: quiz.courseId,
      quizId: quiz.quizId,
      studentId: quiz.studentId,
    }));

    return [...taskItems, ...quizItems];
  }, [tasks, quizzes]);

  // Filter combined items based on search and active tab
  const filteredItems = useMemo(() => {
    return combinedItems.filter((item) => {
      const matchesSearch = item.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType =
        activeTab === "all" ||
        item.type.toLowerCase() === activeTab.toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [combinedItems, searchTerm, activeTab]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTasks = combinedItems.length;
    const assignments = combinedItems.filter(
      (item) => item.type === "ASSIGNMENT"
    );
    const quizzes = combinedItems.filter((item) => item.type === "QUIZ");
    const overdueTasks = combinedItems.filter((item) => item.isOverdue).length;

    return {
      totalTasks,
      totalAssignments: assignments.length,
      totalQuizzes: quizzes.length,
      overdueTasks,
      completionRate:
        Math.round(((totalTasks - overdueTasks) / totalTasks) * 100) || 0,
    };
  }, [combinedItems]);

  const handleViewSubmissionWithCallback = (submissionId: SubmissionId) => {
    handleViewSubmission(submissionId);
  };

  const handleViewQuizSubmissions = (quizId: string, studentId?: UserId) => {
    setSelectedQuizId(quizId);
    setSelectedStudentId(studentId || null);
  };

  const handleViewQuizDetails = (quizId: string) => {
    setViewingQuiz(quizId);
  };

  const handleBackFromQuiz = () => {
    setSelectedQuizId(null);
    setSelectedStudentId(null);
    setViewingQuiz(null);
  };

  // File: src/app/features/courses/components/CourseTaskOverview.tsx

  // Add these methods inside your CourseTaskOverviewTeacher component, before the return statement:

  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case "ASSIGNMENT":
        return <FileText className="h-4 w-4" />;
      case "QUIZ":
        return <HelpCircle className="h-4 w-4" />;
      case "FORUM":
        return <Users className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTaskColor = (type: TaskType) => {
    switch (type) {
      case "ASSIGNMENT":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "QUIZ":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "FORUM":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusColor = (isOverdue: boolean) => {
    return isOverdue ? "text-destructive" : "text-green-600";
  };

  const getStatusText = (isOverdue: boolean) => {
    return isOverdue ? "Overdue" : "Active";
  };

  // Also add this method for the mobile view status display:
  const getStatusBadge = (isOverdue: boolean) => {
    return isOverdue ? (
      <Badge variant="destructive" className="text-xs">
        Overdue
      </Badge>
    ) : (
      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
        Active
      </Badge>
    );
  };

  // ... (getTaskIcon, getTaskColor, getStatusColor functions remain the same)

  const getActionButton = (item: CombinedTaskItem) => {
    if (item.type === "ASSIGNMENT") {
      return (
        <Button
          onClick={() => handleViewSubmissionWithCallback(item.id)}
          variant="ghost"
          size="sm"
          className="text-primary hover:bg-primary/10 transition-colors"
          title="View Submissions"
        >
          <Eye className="h-5 w-5" />
        </Button>
      );
    } else {
      return (
        <Button
          onClick={() =>
            handleViewQuizSubmissions(item.quizId || item.id, item.studentId)
          }
          variant="ghost"
          size="sm"
          className="text-green-600 hover:bg-green-100 transition-colors"
          title="View Quiz Submission"
        >
          <Eye className="h-5 w-5" />
        </Button>
      );
    }
  };

  const getActionButtonMobile = (item: CombinedTaskItem) => {
    if (item.type === "ASSIGNMENT") {
      return (
        <Button
          onClick={() => handleViewSubmissionWithCallback(item.id)}
          size="sm"
          className="flex-1 gap-2"
        >
          <Eye className="h-4 w-4" />
          View Submissions
        </Button>
      );
    } else {
      return (
        <Button
          onClick={() =>
            handleViewQuizSubmissions(item.quizId || item.id, item.studentId)
          }
          size="sm"
          className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
        >
          <Eye className="h-4 w-4" />
          View Quiz Results
        </Button>
      );
    }
  };

  const isLoading = isLoadingTasks || isLoadingQuizzes || isLoadingQuizzesComplete;

  // Show loading state for single submission
  if (selectedQuizId && selectedStudentId && isLoadingSingleSubmission) {
    return (
      <div className="p-8 text-center min-h-[40vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-xl text-primary">Loading Quiz Submission...</p>
      </div>
    );
  }

  // Show submission detail view
  if (submissionDetail) {
    return (
      <SubmissionDetailView
        data={submissionDetail}
        onBack={handleBackFromDetail}
        onUpdateGrade={updateGrade.mutate}
        onRequestAnalysis={requestAnalysis.mutate}
        onDownloadAttachment={downloadAttachment.mutate}
        isUpdatingGrade={updateGrade.isPending}
        isRequestingAnalysis={requestAnalysis.isPending}
        isDownloadingAttachment={downloadAttachment.isPending}
      />
    );
  }

  // Show SINGLE quiz submission view
  if (selectedQuizId && selectedStudentId && singleQuizSubmission) {
    console.log("selectedQuizId", selectedQuizId);
    console.log("quizzesCompleete", quizzesCompleete);
    const quiz = quizzesCompleete.find((q) => q.id === selectedQuizId);

    console.log("quiz", quiz);
    return (
      <QuizSubmissionsView
        quizId={selectedQuizId}
        courseId={courseId}
        // quiz={quiz}
        submission={singleQuizSubmission} // SINGLE submission, not array
        quiz={quiz}
        onBack={handleBackFromQuiz}
      />
    );
  }

  // Show quiz detail view
//   if (viewingQuiz) {
//     const quiz = quizzes.find((q) => q.id === viewingQuiz);
//     return quiz ? <QuizView 
//     quiz={quiz} onClose={handleBackFromQuiz} /> : null;
//   }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header with Statistics */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Course Tasks & Quizzes
          </h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              Total: {stats.totalTasks} items
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Assignments: {stats.totalAssignments}
            </span>
            <span className="flex items-center gap-1">
              <HelpCircle className="h-4 w-4" />
              Quizzes: {stats.totalQuizzes}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Overdue: {stats.overdueTasks}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Completion: {stats.completionRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="p-6 shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks or quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Tabs for All, Assignments and Quizzes */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            All ({combinedItems.length})
          </TabsTrigger>
          <TabsTrigger value="assignment" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Assignments ({stats.totalAssignments})
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Quizzes ({stats.totalQuizzes})
          </TabsTrigger>
        </TabsList>

        {/* All Content */}
        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              Loading tasks and quizzes...
            </div>
          ) : tasksError ? (
            <div className="p-8 text-center text-destructive">
              <div className="h-8 w-8 mx-auto mb-4">⚠️</div>
              Error loading data. Please try again.
            </div>
          ) : filteredItems.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No items found matching criteria.
            </Card>
          ) : (
            <>
              {/* Desktop Table View */}
              <Card className="overflow-hidden hidden lg:block shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase text-muted-foreground">
                          Title
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase text-muted-foreground">
                          Unit / Module
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase text-muted-foreground">
                          Type
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase text-muted-foreground">
                          Deadline
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase text-muted-foreground">
                          Status
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold uppercase text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-border hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium">
                            {item.title}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {item.unit}
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant="secondary"
                              className={`${getTaskColor(item.type)} gap-1`}
                            >
                              {getTaskIcon(item.type)}
                              {item.type}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={
                                item.isOverdue
                                  ? "text-destructive font-semibold"
                                  : ""
                              }
                            >
                              {item.deadline}
                              {item.isOverdue && (
                                <span className="ml-1 text-xs">(OVERDUE)</span>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={getStatusColor(item.isOverdue)}>
                              {item.isOverdue ? "Overdue" : "Active"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-3">
                              {getActionButton(item)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Mobile Card View */}
              <div className="space-y-4 lg:hidden">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="p-4 shadow-md">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">
                            {item.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {item.unit}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`${getTaskColor(item.type)} gap-1`}
                        >
                          {getTaskIcon(item.type)}
                          {item.type}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Deadline
                          </div>
                          <div
                            className={`text-sm font-medium ${
                              item.isOverdue ? "text-destructive" : ""
                            }`}
                          >
                            {item.deadline}
                            {item.isOverdue && (
                              <div className="text-xs">(OVERDUE)</div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Status
                          </div>
                          <div
                            className={`text-sm font-medium ${getStatusColor(
                              item.isOverdue
                            )}`}
                          >
                            {item.isOverdue ? "Overdue" : "Active"}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        {getActionButtonMobile(item)}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
