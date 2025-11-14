// File: src/app/features/gradebook/components/CourseGradebook.tsx
"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Lock, Check, Loader2, BarChart3, Users, FileText, Target } from "lucide-react"
import { AssignmentId, UserId } from "@/app/domain/valueObjects/CourseValues"
import { useGradebookManagement } from "@/app/presentation/hooks/gradebook/gradebook-hooks"

interface CourseGradebookProps {
    courseId: string
}

interface StudentScore {
    score: number | null;
    max: number;
}

interface StudentRow {
    studentId: UserId;
    name: string;
    totalPercentage: number | null;
    scores: { [taskId: AssignmentId]: StudentScore };
}

interface TaskColumn {
    id: AssignmentId;
    name: string;
    maxPoints: number;
    unitName: string;
}

export interface GradebookData {
    professor: string;
    tasks: TaskColumn[];
    students: StudentRow[];
}

export function TeacherCourseGradebook({ courseId }: CourseGradebookProps) {
    const {
        gradebook,
        isLoading,
        error,
        stats,
        pendingUpdates,
        hasPendingChanges,
        handleGradeChange,
        handleSaveGrades,
        handleExport,
        isSaving,
        isExporting,
        getOptimisticGrade,
        hasOptimisticUpdate
    } = useGradebookManagement(courseId);

    if (isLoading) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading Gradebook...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-destructive">
                <div className="h-8 w-8 mx-auto mb-4">⚠️</div>
                Error loading gradebook. Please try again.
            </div>
        );
    }

    if (!gradebook) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                No gradebook data available.
            </div>
        );
    }

    const maxTotalPoints = gradebook.tasks.reduce((sum, t) => sum + t.maxPoints, 0);

    // Helper function to get display value for a grade
    const getDisplayGrade = (studentId: UserId, taskId: AssignmentId, originalScore: number | null) => {
        // Check if there's an optimistic update for this grade
        const optimisticGrade = getOptimisticGrade(studentId, taskId);
        return optimisticGrade !== null ? optimisticGrade : originalScore;
    };

    // Helper function to check if a grade has an optimistic update
    const hasUpdate = (studentId: UserId, taskId: AssignmentId) => {
        return hasOptimisticUpdate(studentId, taskId);
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            {/* Header with Stats */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gradebook</h1>
                    {stats && (
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                Students: {stats.totalStudents}
                            </span>
                            <span className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                Tasks: {stats.totalTasks}
                            </span>
                            <span className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                Average: {stats.averageGrade}%
                            </span>
                            <span className="flex items-center gap-1">
                                <BarChart3 className="h-4 w-4" />
                                Completion: {stats.completionRate}%
                            </span>
                        </div>
                    )}
                </div>
               
                <div className="flex gap-3">
                    {hasPendingChanges && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            {pendingUpdates.length} unsaved changes
                        </Badge>
                    )}
                    
                    <Button 
                        onClick={handleExport} 
                        variant="outline" 
                        className="gap-2"
                        disabled={isExporting}
                    >
                        {isExporting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        Export CSV
                    </Button>
                    
                    <Button 
                        onClick={handleSaveGrades} 
                        disabled={isSaving || !hasPendingChanges}
                        className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Check className="h-4 w-4" />
                        )}
                        {isSaving ? 'Saving...' : 'Save Grades'}
                    </Button>
                </div>
            </div>

            {/* Desktop Table View */}
            <Card className="overflow-hidden hidden lg:block border shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-muted/50">
                                <th className="sticky left-0 z-20 bg-muted/50 backdrop-blur-sm px-4 py-3 text-left font-bold text-sm uppercase text-muted-foreground border-b border-r border-border min-w-[180px]">
                                    Student Name
                                </th>
                                {gradebook.tasks.map((task) => (
                                    <th
                                        key={task.id}
                                        className="px-4 py-3 text-center font-bold text-sm uppercase text-muted-foreground border-b border-r border-border cursor-pointer hover:bg-muted/70 transition-colors min-w-[140px]"
                                        title={`Unit: ${task.unitName}`}
                                    >
                                        <div className="truncate max-w-[120px] mx-auto" title={task.name}>
                                            {task.name}
                                        </div>
                                        <div className="text-xs font-normal mt-1">({task.maxPoints} pts)</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[120px] mx-auto" title={task.unitName}>
                                            {task.unitName}
                                        </div>
                                    </th>
                                ))}
                                <th className="sticky right-0 z-10 bg-muted/50 backdrop-blur-sm px-4 py-3 text-center font-bold text-sm uppercase text-muted-foreground border-b border-border min-w-[120px]">
                                    Overall Grade
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {gradebook.students.map((student) => (
                                <tr key={student.studentId} className="hover:bg-muted/30 transition-colors group">
                                    <td className="sticky left-0 z-10 bg-card backdrop-blur-sm px-4 py-3 font-medium border-b border-r border-border cursor-pointer hover:text-primary transition-colors">
                                        <div className="flex items-center gap-2">
                                            {student.name}
                                            {pendingUpdates.some(update => update.studentId === student.studentId) && (
                                                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" title="Unsaved changes" />
                                            )}
                                        </div>
                                    </td>
                                    {gradebook.tasks.map((task) => {
                                        const scoreData = student.scores[task.id];
                                        const displayScore = getDisplayGrade(student.studentId, task.id, scoreData?.score ?? null);
                                        const hasUpdate = hasOptimisticUpdate(student.studentId, task.id);
                                        const isPending = pendingUpdates.some(update => 
                                            update.studentId === student.studentId && update.taskId === task.id
                                        );
                                        
                                        return (
                                            <td key={task.id} className="px-4 py-3 text-center border-b border-r border-border group relative">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Input
                                                        type="number"
                                                        value={displayScore ?? ""}
                                                        onChange={(e) => handleGradeChange(student.studentId, task.id, e.target.value)}
                                                        className={`w-20 text-center transition-all ${
                                                            isPending ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''
                                                        }`}
                                                        placeholder="—"
                                                        min="0"
                                                        max={task.maxPoints}
                                                        step="0.1"
                                                    />
                                                    {isPending && (
                                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                                                    )}
                                                </div>
                                                {displayScore !== null && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {((displayScore / task.maxPoints) * 100).toFixed(1)}%
                                                        {hasUpdate && " • unsaved"}
                                                    </div>
                                                )}
                                            </td>
                                        )
                                    })}
                                    <td className="sticky right-0 z-10 bg-card backdrop-blur-sm px-4 py-3 text-center font-bold border-b border-border">
                                        <span
                                            className={
                                                student.totalPercentage === null
                                                    ? "text-muted-foreground"
                                                    : student.totalPercentage >= 90
                                                        ? "text-green-600 dark:text-green-400"
                                                        : student.totalPercentage < 70
                                                            ? "text-destructive"
                                                            : "text-foreground"
                                            }
                                        >
                                            {student.totalPercentage !== null ? `${student.totalPercentage}%` : "—"}
                                        </span>
                                        {student.totalPercentage !== null && (
                                            <div className="text-xs text-muted-foreground font-normal">
                                                {((student.totalPercentage / 100) * maxTotalPoints).toFixed(1)}/{maxTotalPoints} pts
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Mobile Card View */}
            <div className="space-y-4 lg:hidden">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">Student Scores</h2>
                    {hasPendingChanges && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            {pendingUpdates.length} unsaved
                        </Badge>
                    )}
                </div>
                
                {gradebook.students.map((student) => {
                    const hasStudentPendingChanges = pendingUpdates.some(update => update.studentId === student.studentId);
                    
                    return (
                        <Card key={student.studentId} className="p-4 border shadow-md">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-border">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg">{student.name}</h3>
                                        {hasStudentPendingChanges && (
                                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" title="Unsaved changes" />
                                        )}
                                    </div>
                                    <span
                                        className={`text-xl font-bold ${
                                            student.totalPercentage === null
                                                ? "text-muted-foreground"
                                                : student.totalPercentage >= 90
                                                    ? "text-green-600 dark:text-green-400"
                                                    : student.totalPercentage < 70
                                                        ? "text-destructive"
                                                        : "text-foreground"
                                        }`}
                                    >
                                        {student.totalPercentage !== null ? `${student.totalPercentage}%` : "—"}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {gradebook.tasks.map((task) => {
                                        const scoreData = student.scores[task.id];
                                        const displayScore = getDisplayGrade(student.studentId, task.id, scoreData?.score ?? null);
                                        const hasUpdate = hasOptimisticUpdate(student.studentId, task.id);
                                        const isPending = pendingUpdates.some(update => 
                                            update.studentId === student.studentId && update.taskId === task.id
                                        );
                                        
                                        return (
                                            <div key={task.id} className={`flex items-center justify-between gap-3 p-3 rounded-lg border transition-colors ${
                                                isPending ? 'bg-yellow-50 border-yellow-200' : 'bg-muted/30 border-border'
                                            }`}>
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm">{task.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Max: {task.maxPoints} pts | Unit: {task.unitName}
                                                    </div>
                                                    {displayScore !== null && (
                                                        <div className="text-xs text-green-600 mt-1">
                                                            {((displayScore / task.maxPoints) * 100).toFixed(1)}%
                                                            {hasUpdate && " • unsaved"}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        value={displayScore ?? ""}
                                                        onChange={(e) => handleGradeChange(student.studentId, task.id, e.target.value)}
                                                        className={`w-20 text-center ${
                                                            isPending ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''
                                                        }`}
                                                        placeholder="—"
                                                        min="0"
                                                        max={task.maxPoints}
                                                        step="0.1"
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}