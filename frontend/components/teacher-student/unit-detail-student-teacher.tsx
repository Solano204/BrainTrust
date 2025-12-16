// File: src/app/features/courses/components/UnitDetail.tsx
"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eye,
  Plus,
  X,
  Check,
  Loader2,
  Users,
  BookOpen,
  Monitor,
} from "lucide-react";
import {
  UnitResource,
  CourseUnit,
  Assignment,
  Quiz,
  Page,
} from "@/app/domain/entities/CourseEntities";
import { CourseId, UnitId } from "@/app/domain/valueObjects/CourseValues";
import { ResourceTypeSelector } from "../teacher/resource-type-selector-teacher";
import { TaskCreator } from "../teacher/task-form-creator-teacher";
import { PageCreator } from "../teacher/page-form-creator-teacher";
import { QuizCreator } from "../teacher/quiz-form-creator-teacher";
import { QuizView } from "../teacher/quiz-view-information-teacher";
import { PageView } from "./page-view-student-teacher";
import { AssignmentInfoView } from "../teacher/task-view-information-teacher";
import { StudentTaskView } from "../student/tasks-transactional-view-student";
import { StudentQuizView } from "../student/quiz-transactional-view-student";

import { useAuth } from "@/app/context/AuthContext";
import {
  useAssignmentMutations,
  useAssignmentsByUnit,
  useAssignment,
} from "./hooks/assignment-hooks";
import { useQuizMutations, useQuizzesByUnit } from "./hooks/quiz-hooks";
import { usePageMutations, usePagesByUnit } from "./hooks/page-hooks";
import { useUserTeam } from "./hooks/team-hooks";
import { useQuizSubmission, useTaskSubmission } from "./hooks/submission-hooks";

interface UnitDetailProps {
  idUnit: UnitId;
  idCourse: CourseId;
  onBack: () => void;
  unitData?: CourseUnit;
}

export function UnitDetail({
  idUnit,
  idCourse,
  onBack,
  unitData,
}: UnitDetailProps) {
  const { user } = useAuth();
  const isStudent = user?.role === "student";

  // Data fetching for each resource type
  const {
    data: assignments = [],
    isLoading: isLoadingAssignments,
    refetch: refetchAssignments,
  } = useAssignmentsByUnit(idCourse, idUnit);


// CURRENTLY WORKS

  const {
    data: quizzes = [],
    isLoading: isLoadingQuizzes,
    refetch: refetchQuizzes,
  } = useQuizzesByUnit(idCourse, idUnit);

  const {
    data: pages = [],
    isLoading: isLoadingPages,
    refetch: refetchPages,
  } = usePagesByUnit(idCourse, idUnit);

  // Get user's team for group assignments
  const { data: userTeam } = useUserTeam(user?.id || "");

  // Mutations for teachers
  const assignmentMutations = useAssignmentMutations();
  const quizMutations = useQuizMutations();
  const pageMutations = usePageMutations();

  // Student submission hooks
  const { submitTask: submitTaskMutation, isSubmitting: isSubmittingTask } =
    useTaskSubmission();
  const { submitQuiz: submitQuizMutation, isSubmitting: isSubmittingQuiz } =
    useQuizSubmission();

  // Combine all resources for carousel display
  const resources = React.useMemo((): UnitResource[] => {
    return [...assignments, ...quizzes, ...pages].sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  }, [assignments, quizzes, pages]);

  // Carousel state
  const [currentResourceIndex, setCurrentResourceIndex] = React.useState(0);
  const [viewMode, setViewMode] = React.useState<
    "carousel" | "detail" | "student"
  >("carousel");
  const [currentResource, setCurrentResource] =
    React.useState<UnitResource | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);
  const [showResourceSelector, setShowResourceSelector] = React.useState(false);
  const [selectedResourceType, setSelectedResourceType] = React.useState<
    "ASSIGNMENT" | "QUIZ" | "PAGE" | null
  >(null);

  // Fetch individual assignment when viewing in detail mode
  const { data: viewedAssignment, refetch: refetchViewedAssignment } =
    useAssignment(
      viewMode === "detail" &&
        currentResource &&
        getResourceType(currentResource) === "ASSIGNMENT"
        ? currentResource.id
        : null
    );

  const isLoading = isLoadingAssignments || isLoadingQuizzes || isLoadingPages;

  // Helper function to determine resource type
  function getResourceType(
    resource: UnitResource
  ): "ASSIGNMENT" | "QUIZ" | "PAGE" {
    if ("questions" in resource) return "QUIZ";
    if ("submissions" in resource) return "ASSIGNMENT";
    if ("sectionContent" in resource) return "PAGE";
    return "PAGE";
  }

  // Handle resource creation with file support
  const handleCreateResource = (resourceData: any, files?: File[]) => {
    if (!selectedResourceType) return;

    const commonConfig = {
      courseId: idCourse,
      unitId: idUnit,
      onSuccess: () => {
        setSelectedResourceType(null);
        refetchAssignments();
        refetchQuizzes();
        refetchPages();
      },
    };

    switch (selectedResourceType) {
      case "ASSIGNMENT":
        assignmentMutations.createAssignment.mutate({
          ...commonConfig,
          assignmentData: resourceData,
          files: files,
        });
        break;
      case "QUIZ":
        // ACTUALIZADO: Ahora maneja correctamente la creación del quiz
        quizMutations.createQuiz.mutate({
          ...commonConfig,
          quizData: resourceData,
        });
        break;
      case "PAGE":
        pageMutations.createPage.mutate({
          ...commonConfig,
          pageData: resourceData,
          attachments: files,
        });
        break;
    }
  };

  // Handle resource deletion (for teachers)
  const handleDeleteResource = (resource: UnitResource) => {
    const resourceType = getResourceType(resource);

    const commonConfig = {
      onSuccess: () => {
        setDeleteConfirm(null);
        if (
          currentResourceIndex >= resources.length - 1 &&
          currentResourceIndex > 0
        ) {
          setCurrentResourceIndex(currentResourceIndex - 1);
        }
        refetchAssignments();
        refetchQuizzes();
        refetchPages();
      },
    };

    switch (resourceType) {
      case "ASSIGNMENT":
        assignmentMutations.deleteAssignment.mutate(resource.id, commonConfig);
        break;
      case "QUIZ":
        quizMutations.deleteQuiz.mutate(resource.id, commonConfig);
        break;
      case "PAGE":
        pageMutations.deletePage.mutate(resource.id, commonConfig);
        break;
    }
  };

  // Handle student viewing/submitting a resource
  const handleStudentView = (resource: UnitResource) => {
    setCurrentResource(resource);
    setViewMode("student");
  };

  // Handle task submission from student with delivery mode detection
  const handleTaskSubmit = async (submissionData: {
    content: string;
    attachments: File[];
  }) => {
    if (!currentResource || !user?.id) return;

    try {
      const assignment = currentResource as Assignment;
      const submissionType =
        assignment.deliveryMode === "TEAM" ? "TEAM" : "INDIVIDUAL";

      let groupId: string | undefined;
      if (submissionType === "TEAM" && userTeam) {
        groupId = userTeam.teamId;
      }

      const submissionParams = {
        assignmentId: currentResource.id,
        studentId: user.id,
        content: submissionData.content,
        attachments: submissionData.attachments,
        submissionType: submissionType as "INDIVIDUAL" | "TEAM",
        ...(groupId && { groupId }),
      };

      await submitTaskMutation.mutateAsync(submissionParams);

      setViewMode("carousel");
      setCurrentResource(null);
      refetchAssignments();
    } catch (error) {
      console.error("Failed to submit task:", error);
    }
  };

  // Handle quiz submission from student
  const handleQuizSubmit = async (answers: any) => {
    if (!currentResource || !user?.id) return;

    try {
      await submitQuizMutation.mutateAsync({
        quizId: currentResource.id,
        studentId: user.id,
        answers: answers,
      });

      setViewMode("carousel");
      setCurrentResource(null);
      refetchQuizzes();
    } catch (error) {
      console.error("Failed to submit quiz:", error);
    }
  };

  // Navigation handlers
  const handlePrevious = () => {
    if (currentResourceIndex > 0)
      setCurrentResourceIndex(currentResourceIndex - 1);
  };

  const handleNext = () => {
    if (currentResourceIndex < resources.length - 1)
      setCurrentResourceIndex(currentResourceIndex + 1);
  };

  const handleView = (resource: UnitResource) => {
    setCurrentResource(resource);
    setViewMode("detail");
  };

  const handleBackFromDetail = () => {
    setViewMode("carousel");
    setCurrentResource(null);
    // Refetch all resources when returning to carousel
    refetchAssignments();
    refetchQuizzes();
    refetchPages();
  };

  // Utility functions
 const getResourceIcon = (resource: UnitResource) => {
  const resourceType = getResourceType(resource);
  if (resourceType === "ASSIGNMENT") {
    const assignment = resource as Assignment;
    // Show notebook or digital icon based on submission format
    if (assignment.submissionFormat === "NOTEBOOK") {
      return "📓"; // Notebook icon
    }
    // Show team or individual icon for digital
    return assignment.deliveryMode === "TEAM" ? "👥" : "📝";
  }
  if (resourceType === "QUIZ") return "📋";
  if (resourceType === "PAGE") return "📄";
  return "📚";
};

  const getResourceColor = (resource: UnitResource) => {
    const resourceType = getResourceType(resource);
    if (resourceType === "ASSIGNMENT") {
      const assignment = resource as Assignment;
      return assignment.deliveryMode === "TEAM"
        ? "from-blue-500 to-blue-600"
        : "from-orange-500 to-orange-600";
    }
    if (resourceType === "QUIZ") return "from-purple-500 to-purple-600";
    if (resourceType === "PAGE") return "from-cyan-500 to-cyan-600";
    return "from-gray-500 to-gray-600";
  };

  // Update the getResourceDetails function to include submission format:
const getResourceDetails = (resource: UnitResource) => {
  const resourceType = getResourceType(resource);

  switch (resourceType) {
    case "ASSIGNMENT": {
      const assign = resource as Assignment;
      const deliveryMode =
        assign.deliveryMode === "TEAM"
          ? "Group Assignment"
          : "Individual Assignment";
      const submissionFormat = 
        assign.submissionFormat === "NOTEBOOK"
          ? "Notebook Submission"
          : "Digital Submission";
      const dueDate = assign.dueDate
        ? `Due: ${new Date(assign.dueDate).toLocaleDateString()}`
        : "";
      const maxScore = `Max Score: ${assign.maxScore.maxPoints}`;
      return `${deliveryMode} | ${submissionFormat} | ${maxScore} ${dueDate ? `| ${dueDate}` : ""}`;
    }
    case "QUIZ": {
      const quiz = resource as Quiz;
      return `Max Grade: ${quiz.maxGrade} | Time: ${quiz.timeLimit} min`;
    }
    case "PAGE": {
      const page = resource as Page;
      const preview = page.sectionContent.substring(0, 100);
      return preview + (page.sectionContent.length > 100 ? "..." : "");
    }
    default:
      return "";
  }
};


  // Render detail view (teacher/student view with edit capabilities)

  const renderDetailView = () => {
    if (!currentResource) return null;

    const resourceType = getResourceType(currentResource);

    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {resourceType === "ASSIGNMENT" && viewedAssignment && (
            <AssignmentInfoView
              assignment={viewedAssignment}
              onClose={handleBackFromDetail}
            />
          )}
          {/* ACTUALIZADO: QuizView ahora tiene todas las operaciones CRUD integradas */}
          {resourceType === "QUIZ" && (
            <QuizView
              quiz={currentResource as Quiz}
              onClose={handleBackFromDetail}
            />
          )}
          {resourceType === "PAGE" && (
            <PageView
              page={currentResource as Page}
              onClose={handleBackFromDetail}
            />
          )}
        </div>
      </div>
    );
  };

  // Render student view
  const renderStudentView = () => {
    if (!currentResource || !user) return null;

    const resourceType = getResourceType(currentResource);

    if (resourceType === "ASSIGNMENT") {
      return (
        <StudentTaskView
          assignment={currentResource as Assignment}
          studentId={user.id}
          onSubmit={handleTaskSubmit}
          onExit={handleBackFromDetail}
          isSubmitting={isSubmittingTask}
        />
      );
    } else if (resourceType === "QUIZ") {
      return (
        <StudentQuizView
          quizData={currentResource as Quiz}
          studentId={user.id}
          onSubmit={handleQuizSubmit}
          onExit={handleBackFromDetail}
          isSubmitting={isSubmittingQuiz}
        />
      );
    } else if (resourceType === "PAGE") {
      return (
        <PageView
          page={currentResource as Page}
          onClose={handleBackFromDetail}
        />
      );
    }

    return null;
  };

  // Early returns for different view modes
  if (isLoading) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center text-lg text-primary">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Loading Unit Resources...
      </div>
    );
  }

  // Detail mode (teacher/student view with inline editing)
  if (viewMode === "detail" && currentResource) {
    return renderDetailView();
  }

  // Student view mode
  if (viewMode === "student" && currentResource) {
    return renderStudentView();
  }

  // Carousel view
  const currentCarouselResource = resources[currentResourceIndex];
  const currentResourceType = currentCarouselResource
    ? getResourceType(currentCarouselResource)
    : null;
  const isGroupAssignment =
    currentResourceType === "ASSIGNMENT" &&
    (currentCarouselResource as Assignment).deliveryMode === "TEAM";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-blue-950/20">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-sm">
                {resources.length}{" "}
                {resources.length === 1 ? "resource" : "resources"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {unitData
                  ? `Unit ${unitData.numUnity}: ${unitData.name}`
                  : `Unit Resources`}
              </h1>
              <p className="text-muted-foreground">
                {isStudent
                  ? "View and complete learning resources"
                  : "Manage learning resources for this unit"}
              </p>
            </div>

            {/* Add Resource button - only for teachers */}
            {!isStudent && (
              <Button
                onClick={() => setShowResourceSelector(true)}
                className="gap-2"
                disabled={
                  assignmentMutations.createAssignment.isPending ||
                  quizMutations.createQuiz.isPending ||
                  pageMutations.createPage.isPending
                }
              >
                {assignmentMutations.createAssignment.isPending ||
                quizMutations.createQuiz.isPending ||
                pageMutations.createPage.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add Resource
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <Card className="overflow-hidden border-2 border-gray-600">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
              UNIT RESOURCES
            </h2>
          </div>

          <div className="p-8 md:p-12">
            {resources.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg mb-4">
                  {isStudent ? "No resources available" : "No resources yet"}
                </p>
                {!isStudent && (
                  <Button onClick={() => setShowResourceSelector(true)}>
                    Add Your First Resource
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-12">
                {/* Resource Navigation */}
                <div className="flex items-center justify-center gap-8">
                  <button
                    onClick={handlePrevious}
                    disabled={currentResourceIndex === 0}
                    className={`h-16 w-16 rounded-full border-4 border-orange-500 flex items-center justify-center transition-all ${
                      currentResourceIndex === 0
                        ? "opacity-30 cursor-not-allowed"
                        : "hover:bg-orange-500 hover:text-white cursor-pointer"
                    }`}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </button>

                  <div
                    className={`h-40 w-40 md:h-48 md:w-48 rounded-full bg-gradient-to-br ${getResourceColor(
                      currentCarouselResource
                    )} flex items-center justify-center shadow-2xl border-4 border-white dark:border-gray-800`}
                  >
                    <div className="text-white text-4xl">
                      {getResourceIcon(currentCarouselResource)}
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={currentResourceIndex === resources.length - 1}
                    className={`h-16 w-16 rounded-full border-4 border-orange-500 flex items-center justify-center transition-all ${
                      currentResourceIndex === resources.length - 1
                        ? "opacity-30 cursor-not-allowed"
                        : "hover:bg-orange-500 hover:text-white cursor-pointer"
                    }`}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </button>
                </div>

                {/* Resource Details */}
                <div className="text-center space-y-4 max-w-2xl mx-auto">
               <div className="flex items-center justify-center gap-2">
  <Badge className="text-sm">{currentResourceType}</Badge>
  {isGroupAssignment && (
    <Badge variant="secondary" className="text-sm">
      <Users className="h-3 w-3 mr-1" />
      Group Assignment
    </Badge>
  )}
  {/* NEW: Add submission format badge for assignments */}
  {currentResourceType === "ASSIGNMENT" && (
    <Badge 
      variant={
        (currentCarouselResource as Assignment).submissionFormat === "NOTEBOOK" 
          ? "outline" 
          : "secondary"
      } 
      className="text-sm"
    >
      {(currentCarouselResource as Assignment).submissionFormat === "NOTEBOOK" ? (
        <>
          <BookOpen className="h-3 w-3 mr-1" />
          Notebook
        </>
      ) : (
        <>
          <Monitor className="h-3 w-3 mr-1" />
          Digital
        </>
      )}
    </Badge>
  )}
</div>   <div className="flex items-center justify-center gap-2">
                    <Badge className="text-sm">{currentResourceType}</Badge>
                    {isGroupAssignment && (
                      <Badge variant="secondary" className="text-sm">
                        <Users className="h-3 w-3 mr-1" />
                        Group Assignment
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    {currentCarouselResource.title}
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    {"description" in currentCarouselResource
                      ? (currentCarouselResource as Assignment).description
                      : ""}
                    {"sectionContent" in currentCarouselResource
                      ? (
                          currentCarouselResource as Page
                        ).sectionContent.substring(0, 200) + "..."
                      : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getResourceDetails(currentCarouselResource)}
                  </p>
                </div>

                {/* Actions - Different for students vs teachers */}
                <div className="flex items-center justify-center gap-4">
                  {isStudent ? (
                    // Student Actions
                    <Button
                      onClick={() => handleStudentView(currentCarouselResource)}
                      className="gap-2"
                      size="lg"
                    >
                      <Eye className="h-4 w-4" />
                      {currentResourceType === "PAGE"
                        ? "View Content"
                        : "Start"}
                    </Button>
                  ) : (
                    // Teacher Actions
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleView(currentCarouselResource)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" /> View & Edit
                      </Button>

                      {deleteConfirm === currentCarouselResource.id ? (
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleDeleteResource(currentCarouselResource)
                            }
                            className="gap-2"
                            disabled={
                              assignmentMutations.deleteAssignment.isPending ||
                              quizMutations.deleteQuiz.isPending ||
                              pageMutations.deletePage.isPending
                            }
                          >
                            {assignmentMutations.deleteAssignment.isPending ||
                            quizMutations.deleteQuiz.isPending ||
                            pageMutations.deletePage.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                            {assignmentMutations.deleteAssignment.isPending ||
                            quizMutations.deleteQuiz.isPending ||
                            pageMutations.deletePage.isPending
                              ? "Deleting..."
                              : "Confirm"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirm(null)}
                            className="gap-2"
                          >
                            <X className="h-4 w-4" /> Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="destructive"
                          onClick={() =>
                            setDeleteConfirm(currentCarouselResource.id)
                          }
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </Button>
                      )}
                    </>
                  )}
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-center gap-2 pt-4 pb-8">
                  {resources.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentResourceIndex(index)}
                      className={`h-3 rounded-full transition-all ${
                        index === currentResourceIndex
                          ? "w-8 bg-orange-500"
                          : "w-3 bg-gray-300 dark:bg-gray-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Resource Creator Selectors - Only for teachers */}
      {!isStudent && (
        <>
          <ResourceTypeSelector
            open={showResourceSelector}
            onClose={() => setShowResourceSelector(false)}
            onSelect={setSelectedResourceType}
          />

          {/* Conditional Creators */}
          {selectedResourceType === "ASSIGNMENT" && (
            <TaskCreator
              idCourse={idCourse}
              idUnit={idUnit}
              open={true}
              onClose={() => setSelectedResourceType(null)}
              onSave={handleCreateResource}
            />
          )}
          {selectedResourceType === "PAGE" && (
            <PageCreator
              courseId={idCourse}
              open={true}
              onClose={() => setSelectedResourceType(null)}
              unitId={idUnit}
              onSave={handleCreateResource}
            />
          )}
          {/* ACTUALIZADO: QuizCreator ahora es solo para crear */}
          {selectedResourceType === "QUIZ" && (
            <QuizCreator
              courseId={idCourse}
              unitId={idUnit}
              open={true}
              onClose={() => setSelectedResourceType(null)}
              onSave={handleCreateResource}
            />
          )}
        </>
      )}
    </div>
  );
}
