// File: src/app/features/courses/components/UnitDetail.tsx
"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChevronLeft, ChevronRight, Trash2, Edit, Eye, Plus, X, Check, Loader2 } from "lucide-react";
import { UnitResource, CourseUnit, Assignment, Quiz, Page } from "@/app/domain/entities/CourseEntities";
import { CourseId, UnitId } from "@/app/domain/valueObjects/CourseValues";
import { ResourceTypeSelector } from "./resource-type-selector";
import { TaskCreator } from "./task-creator";
import { ForumCreator } from "./forum-creator";
import { QuizCreator } from "./quiz-creator";
import { TaskView } from "./task-view";
import { QuizView } from "./quiz-view";
import { PageView } from "./forum-view";
import { useAssignmentsByUnit } from "@/app/presentation/hooks/course/assignment-hooks";
import { useQuizzesByUnit } from "@/app/presentation/hooks/course/quiz-hooks";
import { usePagesByUnit } from "@/app/presentation/hooks/course/page-hooks";
import { useAssignmentMutations } from "@/app/presentation/hooks/course/assignment-hooks";
import { useQuizMutations } from "@/app/presentation/hooks/course/quiz-hooks";
import { usePageMutations } from "@/app/presentation/hooks/course/page-hooks";
interface UnitDetailProps {
  idUnit: UnitId;
  idCourse: CourseId;
  onBack: () => void;
  unitData?: CourseUnit;
}

export function UnitDetail({ idUnit, idCourse, onBack, unitData }: UnitDetailProps) {
  // Separate data fetching for each resource type
  const { 
    data: assignments = [], 
    isLoading: isLoadingAssignments,
    refetch: refetchAssignments 
  } = useAssignmentsByUnit(idCourse, idUnit);

  const { 
    data: quizzes = [], 
    isLoading: isLoadingQuizzes,
    refetch: refetchQuizzes 
  } = useQuizzesByUnit(idCourse, idUnit);

  const { 
    data: pages = [], 
    isLoading: isLoadingPages,
    refetch: refetchPages 
  } = usePagesByUnit(idCourse, idUnit);

  // Separate mutations for each resource type
  const assignmentMutations = useAssignmentMutations();
  const quizMutations = useQuizMutations();
  const pageMutations = usePageMutations();

  // Combine all resources for carousel display
  const resources = React.useMemo((): UnitResource[] => {
    return [
      ...assignments,
      ...quizzes,
      ...pages
    ].sort((a, b) => a.title.localeCompare(b.title));
  }, [assignments, quizzes, pages]);

  // Carousel state
  const [currentResourceIndex, setCurrentResourceIndex] = React.useState(0);
  const [viewMode, setViewMode] = React.useState<"carousel" | "detail" | "edit">("carousel");
  const [currentResource, setCurrentResource] = React.useState<UnitResource | null>(null);
  const [editingResource, setEditingResource] = React.useState<UnitResource | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);
  const [showResourceSelector, setShowResourceSelector] = React.useState(false);
  const [selectedResourceType, setSelectedResourceType] = React.useState<"ASSIGNMENT" | "QUIZ" | "PAGE" | null>(null);

  const isLoading = isLoadingAssignments || isLoadingQuizzes || isLoadingPages;

  // Helper function to determine resource type
  const getResourceType = (resource: UnitResource): "ASSIGNMENT" | "QUIZ" | "PAGE" => {
    if ("questions" in resource) return "QUIZ";
    if ("submissions" in resource) return "ASSIGNMENT";
    if ("sectionContent" in resource) return "PAGE";
    return "PAGE";
  };

  // Handle resource creation
  const handleCreateResource = (resourceData: any) => {
    if (!selectedResourceType) return;

    const commonConfig = {
      courseId: idCourse,
      unitId: idUnit,
      onSuccess: () => {
        setSelectedResourceType(null);
        refetchAssignments();
        refetchQuizzes();
        refetchPages();
      }
    };

    switch (selectedResourceType) {
      case "ASSIGNMENT":
        assignmentMutations.createAssignment.mutate({
          ...commonConfig,
          assignmentData: resourceData
        });
        break;
      case "QUIZ":
        quizMutations.createQuiz.mutate({
          ...commonConfig,
          quizData: resourceData
        });
        break;
      case "PAGE":
        pageMutations.createPage.mutate({
          ...commonConfig,
          pageData: resourceData
        });
        break;
    }
  };

  // Handle resource update
  const handleUpdateResource = (resourceData: any) => {
    if (!editingResource) return;

    const resourceType = getResourceType(editingResource);
    const commonConfig = {
      onSuccess: () => {
        setViewMode("carousel");
        refetchAssignments();
        refetchQuizzes();
        refetchPages();
      }
    };

    switch (resourceType) {
      case "ASSIGNMENT":
        assignmentMutations.updateAssignment.mutate({
          ...commonConfig,
          assignmentId: editingResource.id,
          assignmentData: resourceData
        });
        break;
      case "QUIZ":
        quizMutations.updateQuiz.mutate({
          ...commonConfig,
          quizId: editingResource.id,
          quizData: resourceData
        });
        break;
      case "PAGE":
        pageMutations.updatePage.mutate({
          ...commonConfig,
          pageId: editingResource.id,
          pageData: resourceData
        });
        break;
    }
  };

  // Handle resource deletion
  const handleDeleteResource = (resource: UnitResource) => {
    const resourceType = getResourceType(resource);

    const commonConfig = {
      onSuccess: () => {
        setDeleteConfirm(null);
        if (currentResourceIndex >= resources.length - 1 && currentResourceIndex > 0) {
          setCurrentResourceIndex(currentResourceIndex - 1);
        }
      }
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

  // Navigation handlers
  const handlePrevious = () => {
    if (currentResourceIndex > 0) setCurrentResourceIndex(currentResourceIndex - 1);
  };

  const handleNext = () => {
    if (currentResourceIndex < resources.length - 1) setCurrentResourceIndex(currentResourceIndex + 1);
  };

  const handleView = (resource: UnitResource) => {
    setCurrentResource(resource);
    setViewMode("detail");
  };

  const handleEdit = (resource: UnitResource) => {
    setEditingResource(resource);
    setViewMode("edit");
  };

  const handleBackFromDetail = () => {
    setViewMode("carousel");
    setCurrentResource(null);
  };

  const handleCancelEdit = () => {
    setViewMode("carousel");
    setEditingResource(null);
  };

  // Utility functions
  const getResourceIcon = (resource: UnitResource) => {
    switch (getResourceType(resource)) {
      case "ASSIGNMENT": return "📝";
      case "QUIZ": return "📋";
      case "PAGE": return "📄";
      default: return "📚";
    }
  };

  const getResourceColor = (resource: UnitResource) => {
    switch (getResourceType(resource)) {
      case "ASSIGNMENT": return "from-orange-500 to-orange-600";
      case "QUIZ": return "from-purple-500 to-purple-600";
      case "PAGE": return "from-cyan-500 to-cyan-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const getResourceDetails = (resource: UnitResource) => {
    switch (getResourceType(resource)) {
      case "ASSIGNMENT": {
        const assign = resource as Assignment;
        return assign.dueDate ? `Due: ${new Date(assign.dueDate).toLocaleDateString()}` : `Max Score: ${assign.maxScore.maxPoints}`;
      }
      case "QUIZ": {
        const quiz = resource as Quiz;
        return `Max Grade: ${quiz.maxGrade} | Time: ${quiz.timeLimit} min`;
      }
      case "PAGE": {
        const page = resource as Page;
        return page.welcomeSubtitle || page.sectionTitle;
      }
      default: return "";
    }
  };

  // Render detail view
  const renderDetailView = () => {
    if (!currentResource) return null;

    const resourceType = getResourceType(currentResource);

    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {resourceType === "ASSIGNMENT" && <TaskView task={currentResource as Assignment} onClose={handleBackFromDetail} />}
          {resourceType === "QUIZ" && <QuizView quiz={currentResource as Quiz} onClose={handleBackFromDetail} />}
          {resourceType === "PAGE" && <PageView page={currentResource as Page} onClose={handleBackFromDetail} />}
        </div>
      </div>
    );
  };

  // Early returns
  if (isLoading) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center text-lg text-primary">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Loading Unit Resources...
      </div>
    );
  }

  // Edit mode
  if (viewMode === "edit" && editingResource) {
    const resourceType = getResourceType(editingResource);
    
    switch (resourceType) {
      case "ASSIGNMENT":
        return (
          <TaskCreator
            open={true}
            onClose={handleCancelEdit}
            onSave={handleUpdateResource}
            idCourse={idCourse}
            idUnit={idUnit}
            editMode={true}
            initialData={editingResource as Assignment}
            // isSaving={assignmentMutations.updateAssignment.isPending}
          />
        );
      case "QUIZ":
        return (
          <QuizCreator
            open={true}
            onClose={handleCancelEdit}
            onSave={handleUpdateResource}
            unitId={idUnit}
            courseId={idCourse}
            editMode={true}
            initialData={editingResource as Quiz}
            // isSaving={quizMutations.updateQuiz.isPending}
          />
        );
      case "PAGE":
        return (
          <ForumCreator
            open={true}
            onClose={handleCancelEdit}
            onSave={handleUpdateResource}
            unitId={idUnit}
            courseId={idCourse}
            editMode={true}
            initialData={editingResource as Page}
            // isSaving={pageMutations.updatePage.isPending}
          />
        );
      default:
        return null;
    }
  }

  // Detail mode
  if (viewMode === "detail" && currentResource) {
    return renderDetailView();
  }

  // Carousel view
  const currentCarouselResource = resources[currentResourceIndex];

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
                {resources.length} {resources.length === 1 ? "resource" : "resources"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {unitData ? `Unit ${unitData.numUnity}: ${unitData.name}` : `Unit Resources`}
              </h1>
              <p className="text-muted-foreground">
                Manage learning resources for this unit
              </p>
            </div>
            <Button
              onClick={() => setShowResourceSelector(true)}
              className="gap-2"
              disabled={
                assignmentMutations.createAssignment.isPending ||
                quizMutations.createQuiz.isPending ||
                pageMutations.createPage.isPending
              }
            >
              <Plus className="h-4 w-4" />
              Add Resource
            </Button>
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
                <p className="text-muted-foreground text-lg mb-4">No resources yet</p>
                <Button onClick={() => setShowResourceSelector(true)}>
                  Add Your First Resource
                </Button>
              </div>
            ) : (
              <div className="space-y-12">
                {/* Resource Navigation */}
                <div className="flex items-center justify-center gap-8">
                  <button
                    onClick={handlePrevious}
                    disabled={currentResourceIndex === 0}
                    className={`h-16 w-16 rounded-full border-4 border-orange-500 flex items-center justify-center transition-all ${
                      currentResourceIndex === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-orange-500 hover:text-white cursor-pointer"
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
                      currentResourceIndex === resources.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-orange-500 hover:text-white cursor-pointer"
                    }`}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </button>
                </div>

                {/* Resource Details */}
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                  <Badge className="text-sm">
                    {getResourceType(currentCarouselResource)}
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    {currentCarouselResource.title}
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    {"description" in currentCarouselResource
                      ? (currentCarouselResource as Assignment).description
                      : ""}
                    {"sectionContent" in currentCarouselResource
                      ? (currentCarouselResource as Page).sectionContent
                      : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getResourceDetails(currentCarouselResource)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" onClick={() => handleView(currentCarouselResource)} className="gap-2">
                    <Eye className="h-4 w-4" /> View
                  </Button>

                  <Button variant="outline" onClick={() => handleEdit(currentCarouselResource)} className="gap-2">
                    <Edit className="h-4 w-4" /> Edit
                  </Button>

                  {deleteConfirm === currentCarouselResource.id ? (
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteResource(currentCarouselResource)}
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
                         pageMutations.deletePage.isPending ? "Deleting..." : "Confirm"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)} className="gap-2">
                        <X className="h-4 w-4" /> Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button variant="destructive" onClick={() => setDeleteConfirm(currentCarouselResource.id)} className="gap-2">
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  )}
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-center gap-2 pt-4 pb-8">
                  {resources.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentResourceIndex(index)}
                      className={`h-3 rounded-full transition-all ${
                        index === currentResourceIndex ? "w-8 bg-orange-500" : "w-3 bg-gray-300 dark:bg-gray-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Resource Creator Selectors */}
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
          // isSaving={assignmentMutations.createAssignment.isPending}
        />
      )}
      {selectedResourceType === "PAGE" && (
        <ForumCreator
          courseId={idCourse}
          open={true}
          onClose={() => setSelectedResourceType(null)}
          unitId={idUnit}
          onSave={handleCreateResource}
          // isSaving={pageMutations.createPage.isPending}
        />
      )}
      {selectedResourceType === "QUIZ" && (
        <QuizCreator
          courseId={idCourse}
          open={true}
          onClose={() => setSelectedResourceType(null)}
          unitId={idUnit}
          onSave={handleCreateResource}
          // isSaving={quizMutations.createQuiz.isPending}
        />
      )}
    </div>
  );
}