// File: src/app/features/timeline/components/TimelineSection.tsx
"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, AlertTriangle, MessageSquare, FileText, ArrowRight, Trash2, X, ClipboardList, Check, Loader2, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { CourseResourceType, Assignment, Quiz } from "@/app/domain/entities/CourseEntities"
import { TaskView } from '@/components/task-view'
import { QuizView } from '@/components/quiz-view'
import { useTimelineResources, useTimelineMutations } from "@/app/presentation/hooks/calendar/timeline-hooks"
import { formatForAPI, getDaysUntilDue, getStartOfWeek, getTimelineUrgency } from "@/app/presentation/hooks/calendar/date-utils"
import { useTaskDetail } from "@/app/presentation/hooks/calendar/task-hooks"
import { useQuizDetail } from "@/app/presentation/hooks/calendar/quiz-hooks"

export type TimelineResourceData = Assignment | Quiz;
type TimelineType = "urgent" | "warning" | "normal";

// Helper functions
const getResourceType = (resource: TimelineResourceData): CourseResourceType => {
    if ('questions' in resource) return 'QUIZ';
    return 'ASSIGNMENT';
};

const getResourceIcon = (resource: TimelineResourceData): React.ElementType => {
    switch (getResourceType(resource)) {
        case 'ASSIGNMENT': return AlertTriangle;
        case 'QUIZ': return ClipboardList;
        default: return FileText;
    }
};

const getResourceTimeDisplay = (resource: TimelineResourceData): string => {
    const dueDate = 'dueDate' in resource ? resource.dueDate : null;
    
    if (!dueDate) return "No deadline";

    const daysUntilDue = getDaysUntilDue(dueDate);
    
    if (daysUntilDue < 0) return "OVERDUE";
    if (daysUntilDue === 0) return "Due today";
    if (daysUntilDue === 1) return "Due tomorrow";
    if (daysUntilDue <= 2) return `Due in ${daysUntilDue} days`;
    if (daysUntilDue <= 7) return "Due this week";
    return "Upcoming";
};

const getResourceStatus = (
    resource: TimelineResourceData,
    userType: 'teacher' | 'student',
    userId?: string
): string => {
    const type = getResourceType(resource);
    const dueDate = 'dueDate' in resource ? resource.dueDate : null;
    
    if (dueDate && new Date(dueDate) < new Date()) {
        return "OVERDUE - Needs attention";
    }
    
    if (userType === 'teacher') {
        switch (type) {
            case 'ASSIGNMENT': 
                const assignment = resource as Assignment;
                const pendingSubmissions = assignment.submissions?.filter(s => 
                    s.status === 'SUBMITTED' || s.status === 'LATE_SUBMITTED'
                ).length || 0;
                return `${pendingSubmissions} submissions need grading`;
            case 'QUIZ': 
                return "Needs review";
            default: 
                return "Pending review";
        }
    } else {
        // Student view
        switch (type) {
            case 'ASSIGNMENT': 
                const assignment = resource as Assignment;
                const isSubmitted = assignment.submissions?.some(s => s.studentId === userId);
                return isSubmitted ? "Submitted" : "Not submitted";
            case 'QUIZ': 
                return "Not attempted";
            default: 
                return "Not started";
        }
    }
};

const getResourceCourseInfo = (resource: TimelineResourceData): { courseName: string, courseCode: string } => {
    const courseId = 'courseId' in resource ? resource.courseId : 
                     'courseUnitId' in resource ? ((resource as Quiz).courseUnitId || '').split('-')[0] || 'unknown' : 
                     'unknown';
    
    const mockCourses: Record<string, { courseName: string, courseCode: string }> = {
        'C-UX': { courseName: "Advanced UX Design", courseCode: "DES-401" },
        'C-PSI': { courseName: "Educational Psychology", courseCode: "PSI-203" },
        'C-UI': { courseName: "UI Design Fundamentals", courseCode: "UI-101" },
        'unknown': { courseName: "Unknown Course", courseCode: "N/A" }
    };
    
    return mockCourses[courseId] || mockCourses['unknown'];
};

interface TimelineSectionProps {
  userId: string;
  userType: 'teacher' | 'student';
}

export function TimelineSection({ userId, userType }: TimelineSectionProps) {
  const [showAll, setShowAll] = React.useState(false);
  const [dismissingId, setDismissingId] = React.useState<string | null>(null);
  const [activeResource, setActiveResource] = React.useState<TimelineResourceData | null>(null);
  const [selectedResourceId, setSelectedResourceId] = React.useState<string | null>(null);

  // Calculate current week start (Monday)
  const weekStart = React.useMemo(() => {
    const startOfWeek = getStartOfWeek();
    return formatForAPI(startOfWeek);
  }, []);

  const { data: timelineResources = [], isLoading, error } = useTimelineResources(userId, weekStart, userType);
  const { dismissItem } = useTimelineMutations();

  // Fetch detailed resource data when a resource is clicked
  const { data: taskDetail, isLoading: taskLoading } = useTaskDetail(
    selectedResourceId && activeResource && 'deliveryMode' in activeResource ? selectedResourceId : null,
    userType
  );

  const { data: quizDetail, isLoading: quizLoading } = useQuizDetail(
    selectedResourceId && activeResource && 'questions' in activeResource ? selectedResourceId : null,
    userType
  );

  const handleDismiss = (id: string) => {
    dismissItem.mutate(id);
    setDismissingId(null);
  };
  
  const handleViewDetails = (item: TimelineResourceData) => {
    setActiveResource(item);
    setSelectedResourceId(item.id);
  };
  
  const handleCloseModal = () => {
    setActiveResource(null);
    setSelectedResourceId(null);
  };

  // Sort by urgency and due date
  const sortedResources = React.useMemo(() => {
    return [...timelineResources].sort((a, b) => {
      const aDue = 'dueDate' in a ? a.dueDate : null;
      const bDue = 'dueDate' in b ? b.dueDate : null;
      
      // First sort by urgency
      const aUrgency = getTimelineUrgency(aDue);
      const bUrgency = getTimelineUrgency(bDue);
      
      if (aUrgency !== bUrgency) {
        const urgencyOrder = { urgent: 0, warning: 1, normal: 2 };
        return urgencyOrder[aUrgency] - urgencyOrder[bUrgency];
      }
      
      // Then sort by due date (soonest first)
      if (aDue && bDue) {
        return new Date(aDue).getTime() - new Date(bDue).getTime();
      }
      
      return 0;
    });
  }, [timelineResources]);

  const displayedResources = showAll ? sortedResources : sortedResources.slice(0, 4);

  const renderDetailView = () => {
    if (!activeResource) return null;
    
    const resourceType = getResourceType(activeResource);
    const isLoading = taskLoading || quizLoading;

    if (isLoading) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl dark:bg-gray-900">
            <div className="min-h-full bg-background p-8 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-xl text-primary">Loading {resourceType.toLowerCase()} details...</p>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl dark:bg-gray-900">
          <div className="min-h-full bg-background p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
              {resourceType === "ASSIGNMENT" && taskDetail && (
                <TaskView 
                  task={taskDetail} 
                  onClose={handleCloseModal} 
                />
              )}
              {resourceType === "QUIZ" && quizDetail && (
                <QuizView 
                  quiz={quizDetail} 
                  onClose={handleCloseModal} 
                />
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Calculate week range for display
  const weekRange = React.useMemo(() => {
    const start = getStartOfWeek();
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    return {
      start: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  }, []);

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">This Week</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {weekRange.start} - {weekRange.end} • {isLoading ? "Loading..." : `${sortedResources.length} ${sortedResources.length === 1 ? "item" : "items"}`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary"
            onClick={() => setShowAll(!showAll)}
            disabled={isLoading || sortedResources.length === 0}
          >
            {showAll ? "Show Less" : "View All"}
            <ArrowRight className={cn("ml-2 h-4 w-4 transition-transform", showAll && "rotate-180")} />
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading this week's activities...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Error loading timeline</h3>
            <p className="text-sm text-muted-foreground">Please try again later.</p>
          </div>
        ) : sortedResources.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">All caught up for this week!</h3>
            <p className="text-sm text-muted-foreground">No pending activities for this week.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedResources.map((item) => {
              const itemStatus = getResourceStatus(item, userType, userId);
              const timeDisplay = getResourceTimeDisplay(item);
              const itemUrgency = getTimelineUrgency('dueDate' in item ? item.dueDate : null);
              const itemIcon = getResourceIcon(item);
              const itemCourse = getResourceCourseInfo(item);
              
              return (
                <div
                  key={item.id}
                  className={cn(
                    "group relative p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer",
                    itemUrgency === "urgent"
                      ? "border-destructive/30 bg-destructive/5 hover:border-destructive/50"
                      : itemUrgency === "warning"
                        ? "border-warning/30 bg-warning/5 hover:border-warning/50"
                        : "border-border bg-card hover:border-primary/30",
                  )}
                  onClick={() => handleViewDetails(item)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                        itemUrgency === "urgent"
                          ? "bg-destructive/10 text-destructive"
                          : itemUrgency === "warning"
                            ? "bg-warning/10 text-warning"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {React.createElement(itemIcon, { className: "h-5 w-5" })}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={cn(
                            "font-semibold text-base leading-tight",
                            itemUrgency === "urgent" ? "text-destructive" : "text-foreground",
                          )}
                        >
                          {item.title}
                        </h3>
                        <Badge 
                          variant={
                            itemUrgency === "urgent" ? "destructive" : 
                            itemUrgency === "warning" ? "secondary" : "outline"
                          } 
                          className="shrink-0"
                        >
                          {timeDisplay}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-foreground/80 mt-1">{itemStatus}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {itemCourse.courseName} ({itemCourse.courseCode})
                      </p>
                      
                      {/* Due date */}
                      {'dueDate' in item && item.dueDate && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Due: {new Date(item.dueDate).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}
                    </div>

                    {/* Dismiss Button */}
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {dismissingId === item.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDismiss(item.id)}
                            disabled={dismissItem.isPending}
                          >
                            {dismissItem.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => setDismissingId(null)}
                            disabled={dismissItem.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setDismissingId(item.id)}
                          title="Dismiss"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
      
      {/* Detail Modal */}
      {renderDetailView()}
    </>
  );
}