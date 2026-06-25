"use client";

import { useState, useMemo } from "react";
import { getCloudinaryDownloadUrl } from "@/app/utils/cloudinary/cloudinary-pdf";
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
    deadline: item.data.deadline || "Sin fecha límite",
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
    deadline: "Sin fecha límite",
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
          Vencido
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
              Calificado
            </Badge>
          );
        case "SUBMITTED":
          return (
            <Badge
              variant="secondary"
              className="text-xs bg-blue-100 text-blue-800"
            >
              Enviado
            </Badge>
          );
        case "LATE_SUBMITTED":
          return (
            <Badge variant="destructive" className="text-xs">
              Tarde
            </Badge>
          );
        default:
          return (
            <Badge variant="outline" className="text-xs">
              Enviado
            </Badge>
          );
      }
    }

    return (
      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
        Activo
      </Badge>
    );
  };

  const getGradeDisplay = (submission: any, maxPoints: number) => {
    if (!submission?.grade) return null;

    const gradeValue = submission.grade.value;
    const maxScore = maxPoints || submission.grade.maxScore || 1;
    
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
          title="Ver Detalles del Envío"
        >
          <Eye className="h-5 w-5" />
          <span className="sr-only">Ver Tarea</span>
        </Button>
      );
    } else {
      return (
        <Button
          onClick={() => handleViewQuiz(item.data)}
          variant="ghost"
          size="sm"
          className="text-green-600 hover:bg-green-100 transition-colors"
          title="Ver Detalles del Cuestionario"
        >
          <Eye className="h-5 w-5" />
          <span className="sr-only">Ver Cuestionario</span>
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
          Ver Tarea
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
          Ver Cuestionario
        </Button>
      );
    }
  };

  const isLoading = isLoadingTasks || isLoadingQuizzes;

  if (!selectedUnitId) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Unidades del Curso
            </h1>
            <p className="text-muted-foreground mt-2">
              Selecciona una unidad para ver tareas y cuestionarios
            </p>
          </div>
        </div>

        {isLoadingUnits ? (
          <Card className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando unidades...</p>
          </Card>
        ) : unitsError ? (
          <Card className="p-6 bg-destructive/10 border-destructive">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Error al cargar unidades</h3>
                <p className="text-sm">{unitsError.message}</p>
              </div>
            </div>
          </Card>
        ) : courseUnits.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Hay Unidades Disponibles</h3>
            <p>Todavía no hay unidades en este curso.</p>
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
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-sm">
                      Unidad {unit.numUnity}
                    </Badge>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                      {unit.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {unit.description}
                    </p>
                  </div>

                  <Button className="w-full gap-2" variant="default">
                    <Eye className="h-4 w-4" />
                    Ver Tareas y Cuestionarios
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
          window.open(getCloudinaryDownloadUrl(attachment.storagePath), '_blank');
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
  <div className="page-container">

    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="flex items-start gap-3">
        <button
          onClick={handleBackToUnits}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mt-1 flex-shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a Unidades
        </button>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {selectedUnit?.name || "Tareas y Cuestionarios de la Unidad"}
          </h1>
          {stats && (
            <div className="flex flex-wrap gap-3 mt-2">
              {[
                { icon: BarChart3,   label: `Total: ${stats.totalTasks} elementos`         },
                { icon: FileText,    label: `Tareas: ${stats.totalAssignments}`    },
                { icon: HelpCircle,  label: `Cuestionarios: ${stats.totalQuizzes}`            },
                { icon: Calendar,    label: `Vencidos: ${stats.overdueTasks}`            },
                { icon: Clock,       label: `Completado: ${stats.completionRate}%`      },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Icon className="w-3.5 h-3.5" />{label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        placeholder="Buscar por nombre de tarea o estudiante..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
      />
    </div>

    {tasksError && (
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20">
        <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-destructive">Error al cargar tareas</p>
          <p className="text-xs text-destructive/80">{tasksError.message}</p>
        </div>
      </div>
    )}

    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
      <TabsList className="w-full grid grid-cols-3 rounded-2xl bg-muted/50 p-1 h-auto">
        {[
          { value: 'all',        icon: BarChart3,  label: `Todos (${combinedItems.length})`            },
          { value: 'assignment', icon: FileText,   label: `Tareas (${stats.totalAssignments})`  },
          { value: 'quiz',       icon: HelpCircle, label: `Cuestionarios (${stats.totalQuizzes})`          },
        ].map(({ value, icon: Icon, label }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="flex items-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground transition-all"
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(' ')[0]}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={activeTab} className="space-y-4">

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Cargando tareas y cuestionarios...</span>
          </div>

        ) : tasksError ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-destructive">
            <span className="text-2xl">⚠️</span>
            <p className="text-sm font-semibold">Error al cargar datos. Por favor, intenta de nuevo.</p>
          </div>

        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground bg-card rounded-2xl border border-border">
            <HelpCircle className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-base font-semibold text-foreground">No se encontraron elementos</p>
            <p className="text-sm">Ajusta tus criterios de búsqueda o filtro</p>
          </div>

        ) : (
          <>
            <div className="hidden lg:block bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/40">
                    <tr>
                      {[
                        { label: 'Título',        align: 'left'   },
                        { label: 'Estudiante', align: 'left'   },
                        { label: 'Tipo',         align: 'left'   },
                        { label: 'Fecha Límite',     align: 'left'   },
                        { label: 'Estado',       align: 'left'   },
                        { label: 'Calificación',        align: 'left'   },
                        { label: 'Acciones',      align: 'center' },
                      ].map(({ label, align }) => (
                        <th
                          key={label}
                          className={`px-6 py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground text-${align}`}
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredItems.map((item) => {
                      const displayProps = getDisplayProperties(item);
                      return (
                        <tr
                          key={item.uniqueKey}
                          className="hover:bg-muted/30 transition-colors group"
                        >
                          <td className="px-6 py-4 font-semibold text-sm text-foreground">
                            {displayProps.title}
                           </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {displayProps.studentName}
                           </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${getTaskColor(item.type)}`}>
                              {getTaskIcon(item.type)}
                              {item.type === "ASSIGNMENT" ? "TAREA" : "CUESTIONARIO"}
                              {item.type === "ASSIGNMENT" && " #" + item.data.deliveryMode}
                            </span>
                           </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm ${displayProps.isOverdue ? 'text-destructive font-semibold' : 'text-foreground'}`}>
                              {displayProps.deadline}
                              {displayProps.isOverdue && (
                                <span className="ml-1 text-xs">(VENCIDO)</span>
                              )}
                            </span>
                           </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(displayProps.isOverdue, displayProps.submission)}
                           </td>
                          <td className="px-6 py-4">
                            {displayProps.submission?.grade ? (
                              item.type === "ASSIGNMENT" ? (
                                getGradeDisplay(displayProps.submission, displayProps.submission.grade.maxScore || 0)
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm text-foreground">
                                    {displayProps.submission.grade.value}/{displayProps.submission.grade.maxScore || 0}
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded-md text-xs font-semibold ${
                                    (Number(displayProps.submission.grade.value) / (displayProps.submission.grade.maxScore || 1)) >= 0.7
                                      ? 'bg-primary/10 text-primary'
                                      : 'bg-destructive/10 text-destructive'
                                  }`}>
                                    {((Number(displayProps.submission.grade.value) / (displayProps.submission.grade.maxScore || 1)) * 100).toFixed(1)}%
                                  </span>
                                </div>
                              )
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                           </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                              {getActionButton(item)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3 lg:hidden">
              {filteredItems.map((item) => {
                const displayProps = getDisplayProperties(item);
                return (
                  <div
                    key={item.uniqueKey}
                    className="bg-card rounded-2xl border border-border p-4 space-y-3 hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-foreground truncate mb-0.5">
                          {displayProps.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Estudiante: {displayProps.studentName}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold flex-shrink-0 ${getTaskColor(item.type)}`}>
                        {getTaskIcon(item.type)}
                        {item.type === "ASSIGNMENT" ? "TAREA" : "CUESTIONARIO"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Fecha Límite</p>
                        <p className={`text-xs font-semibold ${displayProps.isOverdue ? 'text-destructive' : 'text-foreground'}`}>
                          {displayProps.deadline}
                          {displayProps.isOverdue && <span className="block">(VENCIDO)</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Estado</p>
                        {getStatusBadge(displayProps.isOverdue, displayProps.submission)}
                      </div>
                    </div>

                    {displayProps.submission?.grade && (
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-1">Calificación</p>
                        {item.type === "ASSIGNMENT" ? (
                          getGradeDisplay(displayProps.submission, displayProps.submission.grade.maxScore || 0)
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">
                              {displayProps.submission.grade.value}/{displayProps.submission.grade.maxScore || 0}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded-md text-xs font-semibold ${
                              (Number(displayProps.submission.grade.value) / (displayProps.submission.grade.maxScore || 1)) >= 0.7
                                ? 'bg-primary/10 text-primary'
                                : 'bg-destructive/10 text-destructive'
                            }`}>
                              {((Number(displayProps.submission.grade.value) / (displayProps.submission.grade.maxScore || 1)) * 100).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {getActionButtonMobile(item)}
                    </div>
                  </div>
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
