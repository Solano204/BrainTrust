"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Loader2,
  Users,
  User,
} from "lucide-react";
import {
  Assignment,
  Quiz,
  CourseResourceType,
} from "@/app/domain/entities/CourseEntities";
import {
  useQuizDetail,
  useQuizzesByMonth,
} from "@/app/presentation/hooks/calendar/quiz-hooks";
import {
  useTasksByMonth,
} from "@/app/presentation/hooks/calendar/task-hooks";
import { useAuth } from "@/app/context/AuthContext";
import { Submission } from "@/app/domain/entities";
import { StudentTaskView } from "../student/tasks-transactional-view-student";
import { StudentQuizView } from "../student/quiz-transactional-view-student";
import { QuizView as QuizTeacherView } from "../teacher/quiz-view-information-teacher";
import { AssignmentInfoView } from "../teacher/task-view-information-teacher";
import {
  useQuizSubmission,
  useTaskSubmission,
} from "@/components/teacher-student/hooks/submission-hooks";
import { useUserTeam } from "./hooks/team-hooks";

export type CalendarResource = Assignment | Quiz;

const dateFns = {

  format: (date: Date, formatStr: string) => {
    const d = new Date(date);
    if (formatStr === "yyyy-MM-dd") {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
    }
    if (formatStr === "MMM yyyy") {
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
      });
    }
    if (formatStr === "dd") {
      return String(d.getDate());
    }
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  },
  startOfWeek: (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  },
  getStartOfMonth: (date: Date) => {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  },
  addMonths: (date: Date, amount: number) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + amount);
    return d;
  },
  subMonths: (date: Date, amount: number) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() - amount);
    return d;
  },
  addDays: (date: Date, amount: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + amount);
    return d;
  },
  isSameDay: (date1: Date, date2: Date) =>
    new Date(date1).toDateString() === new Date(date2).toDateString(),
  isSameMonth: (date1: Date, date2: Date) =>
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear(),
};

const {
  format,
  startOfWeek,
  getStartOfMonth,
  addMonths,
  subMonths,
  addDays,
  isSameDay,
  isSameMonth,
} = dateFns;

const getResourceType = (resource: CalendarResource): CourseResourceType => {
  if ("questions" in resource) return "QUIZ";
  return "ASSIGNMENT";
};

const getResourceStyles = (resource: CalendarResource) => {
  const type = getResourceType(resource);
  switch (type) {
    case "ASSIGNMENT":
      const assignment = resource as Assignment;
      const isGroupAssignment = assignment.deliveryMode === "TEAM";
      return {
        icon: isGroupAssignment ? "👥" : "📝",
        color: isGroupAssignment 
          ? "text-blue-600 bg-blue-100 border-blue-200" 
          : "text-red-600 bg-red-100 border-red-200",
        title: isGroupAssignment ? "Group Assignment" : "Individual Assignment",
      };
    case "QUIZ":
      return {
        icon: "📋",
        color: "text-purple-600 bg-purple-100 border-purple-200",
        title: "Quiz",
      };
    default:
      return {
        icon: "📎",
        color: "text-gray-600 bg-gray-100 border-gray-200",
        title: "Resource",
      };
  }
};

const formatForAPI = (date: Date): string => {
  return date.toISOString().split("T")[0] + "T00:00:00";
};

interface CalendarViewProps {
  userId: string;
  userType: "teacher" | "student";
}

export function CalendarView({ userId, userType }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    getStartOfMonth(new Date())
  );
  const [activeResource, setActiveResource] =
    React.useState<CalendarResource | null>(null);
  const [selectedResourceId, setSelectedResourceId] = React.useState<
    string | null
  >(null);
  const { user } = useAuth();

  const monthStartString = formatForAPI(currentMonth);

  const {
    data: tasks = [],
    isLoading: tasksLoading,
    error: tasksError,
  } = useTasksByMonth(userId, monthStartString, userType);

  const {
    data: quizzes = [],
    isLoading: quizzesLoading,
    error: quizzesError,
  } = useQuizzesByMonth(userId, monthStartString, userType);

  const { data: userTeam } = useUserTeam(userId);

  const { data: quizDetail, isLoading: quizLoading } = useQuizDetail(
    selectedResourceId && activeResource && "questions" in activeResource
      ? selectedResourceId
      : null,
    userType
  );

  const allResources = React.useMemo(() => {
    return [...tasks, ...quizzes];
  }, [tasks, quizzes]);

  const eventsByDay = React.useMemo(() => {
    const grouped: { [dateKey: string]: CalendarResource[] } = {};

    allResources.forEach((resource) => {
      const dueDate = "dueDate" in resource ? (resource as any).dueDate : null;

      if (dueDate) {
        const dateKey = format(new Date(dueDate), "yyyy-MM-dd");
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(resource);
      }
    });

    return grouped;
  }, [allResources]);

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => getStartOfMonth(subMonths(prev, 1)));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => getStartOfMonth(addMonths(prev, 1)));
  };

  const goToToday = () => {
    setCurrentMonth(getStartOfMonth(new Date()));
  };

  const handleResourceClick = (resource: CalendarResource) => {
    setActiveResource(resource);
    setSelectedResourceId(resource.id);
  };

  const handleBackFromDetail = () => {
    setActiveResource(null);
    setSelectedResourceId(null);
  };

  const { submitTask: submitTaskMutation, isSubmitting: isSubmittingTask } =
    useTaskSubmission();
  const { submitQuiz: submitQuizMutation, isSubmitting: isSubmittingQuiz } =
    useQuizSubmission();

  const handleTaskSubmit = async (submissionData: {
  content: string;
  attachments: File[];
}) => {
  if (!activeResource || !user?.id) return;

  try {
    const assignment = activeResource as Assignment;
    const submissionType = assignment.deliveryMode === "TEAM" ? "TEAM" : "INDIVIDUAL";
    
    let groupId: string | undefined;
    if (submissionType === "TEAM" && userTeam) {
      groupId = userTeam.teamId;
    }
    
    const submissionParams = {
      assignmentId: activeResource.id,
      studentId: user.id,
      content: submissionData.content,
      attachments: submissionData.attachments,
      submissionType: submissionType as "INDIVIDUAL" | "TEAM",
      ...(groupId && { groupId })
    };

    await submitTaskMutation.mutateAsync(submissionParams);

    handleBackFromDetail();
  } catch (error) {
    console.error("Failed to submit task:", error);
  }
};

  const handleQuizSubmit = async (answers: any) => {
    if (!activeResource || !user?.id) return;
    try {
      await submitQuizMutation.mutateAsync({
        quizId: activeResource.id,
        studentId: user.id,
        answers: answers,
      });

      handleBackFromDetail();
    } catch (error) {
      console.error("Failed to submit quiz:", error);
    }
  };

  const getExistingSubmission = (
    resourceId: string
  ): Submission | undefined => {
    if (userType === "student") {
      return tasks
        .flatMap((t) => t.submissions)
        .find((s) => s.studentId === userId);
    }
    return undefined;
  };

  const firstDayOfMonth = getStartOfMonth(currentMonth);
  const startDayOfGrid = startOfWeek(firstDayOfMonth);
  const calendarDays: Date[] = [];
  let currentDate = startDayOfGrid;

  for (let i = 0; i < 42; i++) {
    calendarDays.push(currentDate);
    currentDate = addDays(currentDate, 1);
    if (i >= 28 && !isSameMonth(currentDate, currentMonth)) break;
  }

  const renderDayCell = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const isToday = isSameDay(date, new Date());
    const isOutsideMonth = !isSameMonth(date, currentMonth);
    const dayEvents = eventsByDay[dateKey] || [];

    return (
      <div
        key={dateKey}
        className={`flex flex-col p-2 min-h-[8rem] border border-border/50 transition-colors 
                    ${
                      isOutsideMonth
                        ? "bg-gray-100/50 text-muted-foreground/60 dark:bg-gray-700/50"
                        : "bg-white dark:bg-gray-800"
                    }
                    ${
                      isToday
                        ? "ring-2 ring-primary border-primary/50 dark:bg-blue-900/20"
                        : ""
                    }
                `}
      >
        <div
          className={`text-sm font-semibold mb-2 ${
            isToday && !isOutsideMonth ? "text-primary" : "text-foreground"
          }`}
        >
          {format(date, "dd")}
        </div>

        {dayEvents.map((resource, index) => {
          const { icon, color, title } = getResourceStyles(resource);
          const displayTitle =
            resource.title.length > 20
              ? resource.title.substring(0, 20) + "..."
              : resource.title;

          const existingSubmission =
            userType === "student"
              ? getExistingSubmission(resource.id)
              : undefined;
          const isSubmitted = !!existingSubmission;

          return (
            <div
              key={`${resource.id}-${index}`}
              onClick={() => handleResourceClick(resource)}
              className={`flex items-center gap-1 p-1.5 rounded text-xs font-medium cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md border ${color} mb-1 ${
                isSubmitted ? "opacity-80" : ""
              }`}
              title={`${title}: ${resource.title}${
                isSubmitted ? " (Submitted)" : ""
              }`}
            >
              <span className="text-xs">{icon}</span>
              <span className="truncate flex-1">{displayTitle}</span>
              {isSubmitted && <span className="text-xs">✓</span>}
            </div>
          );
        })}

        {(tasksLoading || quizzesLoading) && isToday && (
          <div className="flex items-center text-xs text-muted-foreground mt-auto">
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
            Loading...
          </div>
        )}
      </div>
    );
  };

  const renderDetailView = () => {
    if (!activeResource) return null;

    const resourceType = getResourceType(activeResource);
    
    const isLoading = quizLoading && resourceType === "QUIZ";

    if (isLoading) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl dark:bg-gray-900">
            <div className="min-h-full bg-background p-8 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-xl text-primary">
                  Loading quiz details...
                </p>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    if (userType === "student") {
      if (resourceType === "ASSIGNMENT") {
        const assignment = activeResource as Assignment;
        const existingSubmission = getExistingSubmission(assignment.id);

        return (
          <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
            <div className="container mx-auto py-4">
              <StudentTaskView
                onExit={handleBackFromDetail}
                assignment={assignment}
                onSubmit={handleTaskSubmit}
                studentId={userId}
                isSubmitting={isSubmittingTask}
              />
              <div className="text-center mt-4">
                <Button
                  onClick={handleBackFromDetail}
                  variant="outline"
                  className="mx-auto"
                >
                  Back to Calendar
                </Button>
              </div>
            </div>
          </div>
        );
      } else if (resourceType === "QUIZ" && quizDetail) {
        const existingSubmission = getExistingSubmission(quizDetail.id);

        return (
          <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
            <div className="container mx-auto py-4">
              <StudentQuizView
                quizData={quizDetail}
                onSubmit={handleQuizSubmit}
                onExit={handleBackFromDetail}
                studentId={userId}
                isSubmitting={isSubmittingQuiz}
              />
            </div>
          </div>
        );
      }
    } else {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl dark:bg-gray-900">
            <div className="min-h-full bg-background p-4 md:p-6">
              <div className="max-w-4xl mx-auto">
                {resourceType === "ASSIGNMENT" && (
                  <AssignmentInfoView assignment={activeResource as Assignment} onClose={handleBackFromDetail} />
                )}
                {resourceType === "QUIZ" && quizDetail && (
                  <QuizTeacherView
                    quiz={quizDetail}
                    onClose={handleBackFromDetail}
                  />
                )}
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return null;
  };

  const isLoading = tasksLoading || quizzesLoading;
  const hasError = tasksError || quizzesError;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <Card className="max-w-7xl mx-auto p-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <Button onClick={goToToday} variant="outline" className="text-sm">
            Today
          </Button>
          <div className="flex items-center gap-4">
            <Button
              onClick={goToPreviousMonth}
              size="icon"
              className="h-8 w-8 p-0"
              disabled={isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-bold text-foreground min-w-[200px] text-center">
              {format(currentMonth, "MMM yyyy")}
            </h2>
            <Button
              onClick={goToNextMonth}
              size="icon"
              className="h-8 w-8 p-0"
              disabled={isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            <span className="capitalize">{userType}</span>
            {user && (
              <span className="text-xs bg-primary/10 px-2 py-1 rounded">
                {user.name}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {tasks.length}
            </div>
            <div className="text-sm text-muted-foreground">Tasks</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {quizzes.length}
            </div>
            <div className="text-sm text-muted-foreground">Quizzes</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {
                allResources.filter((r) => {
                  const dueDate = "dueDate" in r ? r.dueDate : null;
                  return dueDate && new Date(dueDate) >= new Date();
                }).length
              }
            </div>
            <div className="text-sm text-muted-foreground">Upcoming</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {
                allResources.filter((r) => {
                  const dueDate = "dueDate" in r ? r.dueDate : null;
                  return dueDate && new Date(dueDate) < new Date();
                }).length
              }
            </div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </Card>
        </div>

        <div className="grid grid-cols-7 text-center font-bold text-sm uppercase tracking-wider text-muted-foreground border-b border-border/50">
          {dayNames.map((day) => (
            <div key={day} className="p-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px border border-border/50 rounded-lg overflow-hidden bg-border/50">
          {calendarDays.map(renderDayCell)}
        </div>

        <div className="flex flex-wrap gap-4 justify-center text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
            <span>Individual Assignment</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
            <span>Group Assignment</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-100 border border-purple-200 rounded"></div>
            <span>Quiz</span>
          </div>
          {userType === "student" && (
            <div className="flex items-center gap-1">
              <span className="text-green-600">✓</span>
              <span>Submitted</span>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span className="text-muted-foreground">
              Loading {tasksLoading ? "tasks" : ""}
              {tasksLoading && quizzesLoading ? " and " : ""}
              {quizzesLoading ? "quizzes" : ""}...
            </span>
          </div>
        )}

        {hasError && (
          <div className="text-center py-8 text-destructive">
            Error loading calendar data. Please try again.
            {tasksError && <div>Tasks: {tasksError.message}</div>}
            {quizzesError && <div>Quizzes: {quizzesError.message}</div>}
          </div>
        )}
      </Card>

      {renderDetailView()}
    </div>
  );
}