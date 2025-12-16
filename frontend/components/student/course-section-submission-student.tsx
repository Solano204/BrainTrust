"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Eye, Loader2, BarChart3, FileText, HelpCircle, Calendar, Clock, CheckCircle, XCircle, AlertCircle, BookOpen, ArrowLeft } from "lucide-react"
import { useAuth } from "@/app/context/AuthContext"
import { useStudentTaskOverview } from "@/components/student/hooks/student-task-hooks"
import { StudentTaskSubmissionView } from "./StudentTaskSubmissionView"
import { StudentQuizView } from "./StudentQuizViewSubmission"
import { useCourseAllUnits } from "@/components/teacher/hooks/courses-hooks"

interface StudentCourseTaskOverviewProps {
    courseId: string
}

export function StudentCourseTaskOverview({ courseId }: StudentCourseTaskOverviewProps) {
    const { user } = useAuth()
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("assignments")
    const [selectedTask, setSelectedTask] = useState<string | null>(null)
    const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")

    const { 
        units: courseUnits, 
        isLoading: isLoadingUnits, 
        error: unitsError 
    } = useCourseAllUnits(courseId)

    const {
        assignments,
        quizzes,
        stats,
        isLoading: isLoadingTasks,
        error: tasksError,
        refetchAssignments,
        refetchQuizzes,
    } = useStudentTaskOverview(courseId, user?.id || null, selectedUnitId)

    const handleSelectUnit = (unitId: string) => {
        setSelectedUnitId(unitId)
        setActiveTab("assignments")
        setSelectedTask(null)
        setSelectedQuiz(null)
        setSearchTerm("")
    }

    const handleBackToUnits = () => {
        setSelectedUnitId(null)
        setSelectedTask(null)
        setSelectedQuiz(null)
        setSearchTerm("")
    }

    const handleViewTask = (taskId: string) => {
        setSelectedTask(taskId)
    }

    const handleViewQuiz = (quizId: string) => {
        setSelectedQuiz(quizId)
    }

    const handleBackFromTask = () => {
        setSelectedTask(null)
        refetchAssignments()
    }

    const handleBackFromQuiz = () => {
        setSelectedQuiz(null)
        refetchQuizzes()
    }


    console.log("assignments", assignments)
    if (selectedTask) {
        const assignment = assignments.find(a => a.id === selectedTask)
        return assignment ? (
            <StudentTaskSubmissionView
                assignment={assignment}
                onExit={handleBackFromTask}
            />
        ) : null
    }

    if (selectedQuiz) {
        const quiz = quizzes.find(q => q.id === selectedQuiz)
        return quiz ? (
            <StudentQuizView
                quiz={quiz}
                onExit={handleBackFromQuiz}
            />
        ) : null
    }

    console.log("submissions", assignments)
    if (!selectedUnitId) {
        return (
            <div className="p-4 md:p-6 lg:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Course Units</h1>
                        <p className="text-muted-foreground mt-2">
                            Select a unit to view your tasks and quizzes
                        </p>
                    </div>
                </div>

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
                                    <div className="flex items-center justify-between">
                                        <Badge variant="secondary" className="text-sm">
                                            Unit {unit.numUnity}
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
                                        View Tasks & Quizzes
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    const selectedUnit = courseUnits.find(unit => unit.id === selectedUnitId)

    const filteredAssignments = assignments.filter(assignment => 
        assignment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.unit.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredQuizzes = quizzes.filter(quiz => 
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) 
    )

    const getStatusBadge = (status: string, isOverdue: boolean) => {
        if (isOverdue && !status) {
            return <Badge variant="destructive" className="gap-1 text-xs">Overdue</Badge>
        }
        
        switch (status) {
            case 'SUBMITTED':
                return <Badge variant="secondary" className="gap-1 text-xs bg-blue-100 text-blue-800">Submitted</Badge>
            case 'GRADED':
                return <Badge variant="default" className="gap-1 text-xs bg-green-100 text-green-800">Graded</Badge>
            case 'LATE_SUBMITTED':
                return <Badge variant="destructive" className="gap-1 text-xs">Late</Badge>
            default:
                return <Badge variant="outline" className="gap-1 text-xs">Not Started</Badge>
        }
    }

    const getStatusIcon = (status: string, isOverdue: boolean) => {
        if (isOverdue && !status) return <XCircle className="h-4 w-4 text-destructive" />
        
        switch (status) {
            case 'SUBMITTED':
            case 'LATE_SUBMITTED':
                return <Clock className="h-4 w-4 text-blue-500" />
            case 'GRADED':
                return <CheckCircle className="h-4 w-4 text-green-500" />
            default:
                return <FileText className="h-4 w-4 text-gray-500" />
        }
    }

    const getGradeDisplay = (grade: any, maxPoints: number) => {
        if (!grade) return null
        
        const percentage = (Number(grade.value) / maxPoints) * 100
        return (
            <div className="flex items-center gap-2">
                <span className="font-semibold">{grade.value}/{maxPoints}</span>
                <Badge variant={percentage >= 70 ? "default" : "destructive"} className="text-xs">
                    {percentage.toFixed(1)}%
                </Badge>
            </div>
        )
    }

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
                                    Total: {stats.totalTasks} tasks
                                </span>
                                <span className="flex items-center gap-1">
                                    <CheckCircle className="h-4 w-4" />
                                    Completed: {stats.completedTasks}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Pending: {stats.pendingTasks}
                                </span>
                                {stats.overdueTasks > 0 && (
                                    <span className="flex items-center gap-1 text-destructive font-medium">
                                        <AlertCircle className="h-4 w-4" />
                                        Overdue: {stats.overdueTasks}
                                    </span>
                                )}
                                {stats.averageGrade > 0 && (
                                    <span className="flex items-center gap-1">
                                        <BarChart3 className="h-4 w-4" />
                                        Average: {stats.averageGrade}%
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Card className="p-6 shadow-md">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tasks or quizzes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </Card>

            {tasksError && (
                <Card className="p-6 bg-destructive/10 border-destructive">
                    <div className="flex items-center gap-3 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        <div>
                            <h3 className="font-semibold">Error loading tasks</h3>
                            <p className="text-sm">{tasksError}</p>
                        </div>
                    </div>
                </Card>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="assignments" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        My Assignments ({assignments.length})
                    </TabsTrigger>
                    <TabsTrigger value="quizzes" className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" />
                        My Quizzes ({quizzes.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="assignments" className="space-y-4">
                    {isLoadingTasks ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                            Loading your assignments...
                        </div>
                    ) : filteredAssignments.length === 0 ? (
                        <Card className="p-8 text-center text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">No Assignments</h3>
                            <p>
                                {searchTerm 
                                    ? "No assignments match your search."
                                    : "You don't have any assignments in this unit yet."
                                }
                            </p>
                        </Card>
                    ) : (
                        <>
                            <Card className="overflow-hidden hidden lg:block shadow-lg">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-muted/50 border-b border-border">
                                                <th className="px-6 py-4 text-left text-sm font-bold uppercase text-muted-foreground">Assignment</th>
                                                <th className="px-6 py-4 text-left text-sm font-bold uppercase text-muted-foreground">Status</th>
                                                <th className="px-6 py-4 text-left text-sm font-bold uppercase text-muted-foreground">Due Date</th>
                                                <th className="px-6 py-4 text-left text-sm font-bold uppercase text-muted-foreground">Grade</th>
                                                <th className="px-6 py-4 text-center text-sm font-bold uppercase text-muted-foreground">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredAssignments.map((assignment) => (
                                                <tr key={assignment.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                                    <td className="px-6 py-4 font-medium">{assignment.name}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(assignment.submission?.status || '', assignment.isOverdue)}
                                                            {getStatusBadge(assignment.submission?.status || '', assignment.isOverdue)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={assignment.isOverdue ? "text-destructive font-semibold" : ""}>
                                                            {assignment.deadline}
                                                            {assignment.isOverdue && <span className="ml-1 text-xs">(OVERDUE)</span>}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {assignment.submission?.grade 
                                                            ? getGradeDisplay(assignment.submission.grade, assignment.maxPoints)
                                                            : <span className="text-muted-foreground">—</span>
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-3">
                                                            <Button
                                                                onClick={() => handleViewTask(assignment.id)}
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-primary hover:bg-primary/10 transition-colors"
                                                                title={assignment.submission ? "View Submission" : "Start Assignment"}
                                                            >
                                                                <Eye className="h-5 w-5" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>

                            <div className="space-y-4 lg:hidden">
                                {filteredAssignments.map((assignment) => (
                                    <Card key={assignment.id} className="p-4 shadow-md">
                                        <div className="space-y-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg mb-1">{assignment.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{assignment.unit}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(assignment.submission?.status || '', assignment.isOverdue)}
                                                    {getStatusBadge(assignment.submission?.status || '', assignment.isOverdue)}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                                                <div>
                                                    <div className="text-xs text-muted-foreground mb-1">Due Date</div>
                                                    <div className={`text-sm font-medium ${assignment.isOverdue ? "text-destructive" : ""}`}>
                                                        {assignment.deadline}
                                                        {assignment.isOverdue && <div className="text-xs">(OVERDUE)</div>}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-muted-foreground mb-1">Grade</div>
                                                    <div className="text-sm font-medium">
                                                        {assignment.submission?.grade 
                                                            ? getGradeDisplay(assignment.submission.grade, assignment.maxPoints)
                                                            : "—"
                                                        }
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <Button 
                                                    onClick={() => handleViewTask(assignment.id)} 
                                                    size="sm" 
                                                    className="flex-1 gap-2"
                                                    variant={assignment.submission ? "outline" : "default"}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    {assignment.submission ? "View Submission" : "Start Assignment"}
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </TabsContent>

                <TabsContent value="quizzes" className="space-y-4">
                    {isLoadingTasks ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                            Loading your quizzes...
                        </div>
                    ) : filteredQuizzes.length === 0 ? (
                        <Card className="p-8 text-center text-muted-foreground">
                            <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">No Quizzes</h3>
                            <p>
                                {searchTerm 
                                    ? "No quizzes match your search."
                                    : "You don't have any quizzes in this unit yet."
                                }
                            </p>
                        </Card>
                    ) : (
                        <>
                            <Card className="overflow-hidden hidden lg:block shadow-lg">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-muted/50 border-b border-border">
                                                <th className="px-6 py-4 text-left text-sm font-bold uppercase text-muted-foreground">Quiz Title</th>
                                                <th className="px-6 py-4 text-left text-sm font-bold uppercase text-muted-foreground">Status</th>
                                                <th className="px-6 py-4 text-left text-sm font-bold uppercase text-muted-foreground">Grade</th>
                                                <th className="px-6 py-4 text-center text-sm font-bold uppercase text-muted-foreground">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredQuizzes.map((quiz) => (
                                                <tr key={quiz.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                                    <td className="px-6 py-4 font-medium">{quiz.title}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(quiz.submission?.status || '', quiz.isOverdue)}
                                                            {getStatusBadge(quiz.submission?.status || '', quiz.isOverdue)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {quiz.submission?.grade 
                                                            ? (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold">
                                                                        {quiz.submission.grade.value}/{quiz.submission.grade.maxScore}
                                                                    </span>
                                                                    <Badge 
                                                                        variant={quiz.submission.grade.value >= (quiz.submission.grade.maxScore * 0.7) ? "default" : "destructive"} 
                                                                        className="text-xs"
                                                                    >
                                                                        {((quiz.submission.grade.value / quiz.submission.grade.maxScore) * 100).toFixed(1)}%
                                                                    </Badge>
                                                                </div>
                                                            )
                                                            : <span className="text-muted-foreground">—</span>
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-3">
                                                            <Button
                                                                onClick={() => handleViewQuiz(quiz.id)}
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-primary hover:bg-primary/10 transition-colors"
                                                                title={quiz.submission ? "View Results" : "Take Quiz"}
                                                            >
                                                                <Eye className="h-5 w-5" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>

                            <div className="space-y-4 lg:hidden">
                                {filteredQuizzes.map((quiz) => (
                                    <Card key={quiz.id} className="p-4 shadow-md">
                                        <div className="space-y-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg mb-1">{quiz.title}</h3>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(quiz.submission?.status || '', quiz.isOverdue)}
                                                    {getStatusBadge(quiz.submission?.status || '', quiz.isOverdue)}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                                                <div>
                                                    <div className="text-xs text-muted-foreground mb-1">Max Grade</div>
                                                    <div className="text-sm font-medium">
                                                        {quiz.maxGrade}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-muted-foreground mb-1">Grade</div>
                                                    <div className="text-sm font-medium">
                                                        {quiz.submission?.grade 
                                                            ? `${quiz.submission.grade.value}/${quiz.submission.grade.maxScore}`
                                                            : "—"
                                                        }
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <Button 
                                                    onClick={() => handleViewQuiz(quiz.id)} 
                                                    size="sm" 
                                                    className="flex-1 gap-2"
                                                    variant={quiz.submission ? "outline" : "default"}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    {quiz.submission ? "View Results" : "Take Quiz"}
                                                </Button>
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
    )
}