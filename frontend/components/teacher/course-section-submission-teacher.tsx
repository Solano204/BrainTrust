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
  Calendar,
  Clock,
  BookOpen,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import {
  useTaskInventoryManagement,
  useTaskInventoryMutations,
  // useTaskInventoryMutations,
} from "@/app/presentation/hooks/task/task-inventory-hooks";
import { useQuizzesByCourseWithoutDetails } from "@/components/teacher/hooks/quiz-hooks";
import { useCourseAllUnits } from "@/components/teacher/hooks/courses-hooks";

import { SubmissionDetailView } from "./task-view-submission-teacher";
import { QuizSubmissionsView } from "./quiz-view-submission-teacher";
import { SubmissionTask } from "@/app/shared/models/assignment.model";
import { StudentSubmissionQuiz } from "@/app/shared/models/quiz.model";

interface CourseTaskOverviewProps {
  courseId: string;
}

interface TaskItem {
  id: string;
  type: "ASSIGNMENT";
  data: SubmissionTask;
  uniqueKey: string;
}

interface QuizItem {
  id: string;
  type: "QUIZ";
  data: StudentSubmissionQuiz;
  uniqueKey: string;
}

const getTaskDisplayProperties = (item: TaskItem) => {
  return {
    title: item.data.name,
    studentName: item.data.studentName || "—",
    deadline: item.data.deadline || "No deadline",
    isOverdue: item.data.isOverdue,
    submission: item.data.submission,
    maxPoints: item.data.maxPoints,
    instructions: item.data.instructions,
    unit: item.data.unit,
    attachments: item.data.submission?.attachments || [],
    aiAnalysis: item.data.submission?.aiAnalysis,
    teacherFeedback: item.data.submission?.teacherFeedback,
  };
};

const getQuizDisplayProperties = (item: QuizItem) => {
  return {
    title: item.data.title,
    studentName: item.data.studentName || "—",
    deadline: "No deadline",
    isOverdue: item.data.isOverdue,
    submission: item.data.submission,
    maxGrade: item.data.maxGrade,
    studentId: item.data.studentId,
    unitId: item.data.unitId,
    
  };
};

const getDisplayProperties = (item: TaskItem | QuizItem) => {
  if (item.type === "ASSIGNMENT") {
    return getTaskDisplayProperties(item);
  } else {
    return getQuizDisplayProperties(item);
  }
};

export function CourseTaskOverviewTeacher({
  courseId,
}: CourseTaskOverviewProps) {
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTask, setSelectedTask] = useState<SubmissionTask | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<StudentSubmissionQuiz | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    units: courseUnits,
    isLoading: isLoadingUnits,
    error: unitsError,
  } = useCourseAllUnits(courseId);

  const {
    tasks,
    isLoadingTasks,
    tasksError,
    selectedSubmissionId,
    handleViewSubmission,
    handleBackFromDetail,
  } = useTaskInventoryManagement(courseId, selectedUnitId);


  console.log("tasks", tasks);
  const { updateGrade } =
    useTaskInventoryMutations();

  const { data: quizzes = [], isLoading: isLoadingQuizzes } =
    useQuizzesByCourseWithoutDetails(courseId, selectedUnitId);

  const combinedItems: (TaskItem | QuizItem)[] = useMemo(() => {
    const taskItems: TaskItem[] = tasks.map((task) => ({
      id: task.id,
      type: "ASSIGNMENT" as const,
      data: task,
      uniqueKey: uuidv4(),
    }));

    const quizItems: QuizItem[] = quizzes.map((quiz) => ({
      id: quiz.id,
      type: "QUIZ" as const,
      data: quiz,
      uniqueKey: uuidv4(),
    }));

    return [...taskItems, ...quizItems];
  }, [tasks, quizzes]);

  const filteredItems = useMemo(() => {
    return combinedItems.filter((item) => {
      const displayProps = getDisplayProperties(item);
      const matchesSearch = displayProps.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        displayProps.studentName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType =
        activeTab === "all" ||
        item.type.toLowerCase() === activeTab.toLowerCase();
      
      return matchesSearch && matchesType;
    });
  }, [combinedItems, searchTerm, activeTab]);

  const stats = useMemo(() => {
    const totalTasks = combinedItems.length;
    const assignments = combinedItems.filter(
      (item) => item.type === "ASSIGNMENT"
    );
    const quizzes = combinedItems.filter((item) => item.type === "QUIZ");
    const overdueTasks = combinedItems.filter((item) => {
      const displayProps = getDisplayProperties(item);
      return displayProps.isOverdue;
    }).length;

    return {
      totalTasks,
      totalAssignments: assignments.length,
      totalQuizzes: quizzes.length,
      overdueTasks,
      completionRate:
        Math.round(((totalTasks - overdueTasks) / totalTasks) * 100) || 0,
    };
  }, [combinedItems]);

  const handleSelectUnit = (unitId: string) => {
    setSelectedUnitId(unitId);
    setActiveTab("all");
    setSelectedTask(null);
    setSelectedQuiz(null);
    setSearchTerm("");
  };

  const handleBackToUnits = () => {
    setSelectedUnitId(null);
    setSelectedTask(null);
    setSelectedQuiz(null);
  };

  const handleViewTask = (task: SubmissionTask) => {
    setSelectedTask(task);
  };

  const handleViewQuiz = (quiz: StudentSubmissionQuiz) => {
    setSelectedQuiz(quiz);
  };

  const handleBackFromTask = () => {
    setSelectedTask(null);
  };

  const handleBackFromQuiz = () => {
    setSelectedQuiz(null);
  };

  const getTaskIcon = (type: "ASSIGNMENT" | "QUIZ") => {
    switch (type) {
      case "ASSIGNMENT":
        return <FileText className="h-4 w-4" />;
      case "QUIZ":
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTaskColor = (type: "ASSIGNMENT" | "QUIZ") => {
    switch (type) {
      case "ASSIGNMENT":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "QUIZ":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusBadge = (isOverdue: boolean, submission?: any) => {
    if (isOverdue && !submission) {
      return (
        <Badge variant="destructive" className="text-xs">
          Overdue
        </Badge>
      );
    }

    if (submission) {
      switch (submission.status) {
        case "GRADED":
          return (
            <Badge
              variant="default"
              className="text-xs bg-green-100 text-green-800"
            >
              Graded
            </Badge>
          );
        case "SUBMITTED":
          return (
            <Badge
              variant="secondary"
              className="text-xs bg-blue-100 text-blue-800"
            >
              Submitted
            </Badge>
          );
        case "LATE_SUBMITTED":
          return (
            <Badge variant="destructive" className="text-xs">
              Late
            </Badge>
          );
        default:
          return (
            <Badge variant="outline" className="text-xs">
              Submitted
            </Badge>
          );
      }
    }

    return (
      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
        Active
      </Badge>
    );
  };

  const getGradeDisplay = (submission: any, maxPoints: number) => {
    if (!submission?.grade) return null;

    const gradeValue = submission.grade.value;
    const maxScore = maxPoints || submission.grade.maxScore || 1;
    
    // Handle both string and number grade values
    const numericValue = typeof gradeValue === 'string' ? parseFloat(gradeValue) : gradeValue;
    const percentage = (numericValue / maxScore) * 100;
    
    return (
      <div className="flex items-center gap-2">
        <span className="font-semibold">
          {numericValue}/{maxScore}
        </span>
        <Badge
          variant={percentage >= 70 ? "default" : "destructive"}
          className="text-xs"
        >
          {percentage.toFixed(1)}%
        </Badge>
      </div>
    );
  };

  const getActionButton = (item: TaskItem | QuizItem) => {
    if (item.type === "ASSIGNMENT") {
      return (
        <Button
          onClick={() => handleViewTask(item.data)}
          variant="ghost"
          size="sm"
          className="text-primary hover:bg-primary/10 transition-colors"
          title="View Submission Details"
        >
          <Eye className="h-5 w-5" />
          <span className="sr-only">View Assignment</span>
        </Button>
      );
    } else {
      return (
        <Button
          onClick={() => handleViewQuiz(item.data)}
          variant="ghost"
          size="sm"
          className="text-green-600 hover:bg-green-100 transition-colors"
          title="View Quiz Details"
        >
          <Eye className="h-5 w-5" />
          <span className="sr-only">View Quiz</span>
        </Button>
      );
    }
  };

  const getActionButtonMobile = (item: TaskItem | QuizItem) => {
    if (item.type === "ASSIGNMENT") {
      return (
        <Button
          onClick={() => handleViewTask(item.data)}
          size="sm"
          className="flex-1 gap-2"
        >
          <Eye className="h-4 w-4" />
          View Assignment
        </Button>
      );
    } else {
      return (
        <Button
          onClick={() => handleViewQuiz(item.data)}
          size="sm"
          className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
        >
          <Eye className="h-4 w-4" />
          View Quiz
        </Button>
      );
    }
  };

  const isLoading = isLoadingTasks || isLoadingQuizzes;

  if (!selectedUnitId) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Course Units
            </h1>
            <p className="text-muted-foreground mt-2">
              Select a unit to view tasks and quizzes
            </p>
          </div>
        </div>

        {/* Units Grid */}
        {isLoadingUnits ? (
          <Card className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading units...</p>
          </Card>
        ) : unitsError ? (
          <Card className="p-6 bg-destructive/10 border-destructive">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Error loading units</h3>
                <p className="text-sm">{unitsError.message}</p>
              </div>
            </div>
          </Card>
        ) : courseUnits.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Units Available</h3>
            <p>There are no units in this course yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courseUnits.map((unit) => (
              <Card
                key={unit.id}
                className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group"
                onClick={() => handleSelectUnit(unit.id)}
              >
                <div className="space-y-4">
                  {/* Unit Number */}
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-sm">
                      Unit {unit.numUnity}
                    </Badge>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                  </div>

                  {/* Unit Name and Description */}
                  <div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                      {unit.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {unit.description}
                    </p>
                  </div>

                  {/* Action Button */}
                  <Button className="w-full gap-2" variant="default">
                    <Eye className="h-4 w-4" />
                    View Tasks & Quizzes
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

 if (selectedTask) {
  return (
    <SubmissionDetailView
      data={selectedTask}
      onBack={handleBackFromTask}
      onUpdateGrade={updateGrade.mutate}
      onDownloadAttachment={(attachment) => {
        if (attachment.storagePath) {
          window.open(attachment.storagePath, '_blank');
        }
      }}
      isUpdatingGrade={updateGrade.isPending}
    />
  );
}

  if (selectedQuiz) {

    console.log("selectedQuiz", selectedQuiz.submission);
    return (
      <QuizSubmissionsView
        submissionId={selectedQuiz.submission?.id || ""}
        onBack={handleBackFromQuiz}
      />
    );
  }

  const selectedUnit = courseUnits.find((unit) => unit.id === selectedUnitId);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToUnits}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Units
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {selectedUnit?.name || "Unit Tasks & Quizzes"}
            </h1>
            {stats && (
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
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="p-6 shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by task name or student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Error Display */}
      {tasksError && (
        <Card className="p-6 bg-destructive/10 border-destructive">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">Error loading tasks</h3>
              <p className="text-sm">{tasksError.message}</p>
            </div>
          </div>
        </Card>
      )}

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
              <div className="flex flex-col items-center gap-3">
                <HelpCircle className="h-12 w-12" />
                <h3 className="text-lg font-semibold">No items found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
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
                          Student Name
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
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase text-muted-foreground">
                          Grade
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold uppercase text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => {
                        const displayProps = getDisplayProperties(item);
                        return (
                          <tr
                            key={item.uniqueKey}
                            className="border-b border-border hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-6 py-4 font-medium">
                              {displayProps.title}
                            </td>
                            <td className="px-6 py-4">
                              {displayProps.studentName}
                            </td>
                            <td className="px-6 py-4">
                              <Badge
                                variant="secondary"
                                className={`${getTaskColor(item.type)} gap-1`}
                              >
                                {getTaskIcon(item.type)}
                                {item.type}
                                {item.type === "ASSIGNMENT" && " #" + item.data.deliveryMode }
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={
                                  displayProps.isOverdue
                                    ? "text-destructive font-semibold"
                                    : ""
                                }
                              >
                                {displayProps.deadline}
                                {displayProps.isOverdue && (
                                  <span className="ml-1 text-xs">(OVERDUE)</span>
                                )}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(
                                displayProps.isOverdue,
                                displayProps.submission
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {displayProps.submission?.grade ? (
                                item.type === "ASSIGNMENT" ? (
                                  getGradeDisplay(
                                    displayProps.submission,
                                    displayProps.submission.grade.maxScore || 0
                                  )
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">
                                      {displayProps.submission.grade.value}/{displayProps.submission.grade.maxScore || 0}
                                    </span>
                                    <Badge
                                      variant={
                                        (Number(displayProps.submission.grade.value) / (displayProps.submission.grade.maxScore || 1)) >= 0.7 
                                          ? "default" 
                                          : "destructive"
                                      }
                                      className="text-xs"
                                    >
                                      {((Number(displayProps.submission.grade.value) / (displayProps.submission.grade.maxScore || 1)) * 100).toFixed(1)}%
                                    </Badge>
                                  </div>
                                )
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center">
                                {getActionButton(item)}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              <div className="space-y-4 lg:hidden">
                {filteredItems.map((item) => {
                  const displayProps = getDisplayProperties(item);
                  return (
                    <Card
                      key={item.uniqueKey}
                      className="p-4 shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1">
                              {displayProps.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Student: {displayProps.studentName}
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
                                displayProps.isOverdue ? "text-destructive" : ""
                              }`}
                            >
                              {displayProps.deadline}
                              {displayProps.isOverdue && (
                                <div className="text-xs">(OVERDUE)</div>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">
                              Status
                            </div>
                            <div className="text-sm">
                              {getStatusBadge(
                                displayProps.isOverdue,
                                displayProps.submission
                              )}
                            </div>
                          </div>
                        </div>

                        {displayProps.submission?.grade && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">
                              Grade
                            </div>
                            <div>
                              {item.type === "ASSIGNMENT" ? (
                                getGradeDisplay(
                                  displayProps.submission,
                                  displayProps.submission.grade.maxScore || 0
                                )
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">
                                    {displayProps.submission.grade.value}/{displayProps.submission.grade.maxScore || 0}
                                  </span>
                                  <Badge
                                    variant={
                                      (Number(displayProps.submission.grade.value) / (displayProps.submission.grade.maxScore || 1)) >= 0.7 
                                        ? "default" 
                                        : "destructive"
                                    }
                                    className="text-xs"
                                  >
                                    {((Number(displayProps.submission.grade.value) / (displayProps.submission.grade.maxScore || 1)) * 100).toFixed(1)}%
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-3">
                          {getActionButtonMobile(item)}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}