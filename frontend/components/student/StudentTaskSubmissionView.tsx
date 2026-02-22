"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
    ArrowLeft, 
    Paperclip, 
    Calendar,
    Clock,
    FileText,
    CheckCircle,
    Download,
    AlertCircle,
    Award,
    User,
    Info,
    TrendingUp,
    Bot
} from "lucide-react"

interface StudentAssignment {
  id: string
  name: string
  unit: string
  instructions: string
  maxPoints: number
  deadline: string
  deliveryMode: string
  studentName: string
  isOverdue: boolean
  submission?: {
    id: string
    content: string
    submittedAt: string
    status: string
    grade?: { value: string; maxScore: number }
    teacherFeedback?: string
    attachments: Array<{ name: string; storagePath: string; createdAt: string }>
    aiAnalysis?: {
      analysisId: string
      probability: string
      percentage: string
      isLikelyAI: boolean
      confidenceLevel: string
      modelUsed: string
      analyzedAt: string
    }
  }
}

interface StudentTaskSubmissionViewProps {
  assignment: StudentAssignment
  onExit: () => void
}

const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <label className={`text-sm font-medium leading-none ${className || ''}`}>
        {children}
    </label>
)

export function StudentTaskSubmissionView({ assignment, onExit }: StudentTaskSubmissionViewProps) {

    console.log(assignment)
    const isSubmitted = assignment.submission?.status === 'SUBMITTED' || assignment.submission?.status === 'GRADED'
    const isGraded = assignment.submission?.status === 'GRADED'

    if (!assignment.submission) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-border">
                        <div>
                            <Button onClick={onExit} variant="outline" className="gap-2 mb-4">
                                <ArrowLeft className="h-4 w-4" /> Back to Tasks
                            </Button>
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                {assignment.name}
                            </h1>
                            <p className="text-muted-foreground mt-1">{assignment.unit}</p>
                        </div>
                        <Badge variant="outline">Not Submitted</Badge>
                    </div>

                    <Card className="text-center p-8">
                        <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h2 className="text-xl font-semibold mb-2">No Submission Found</h2>
                        <p className="text-muted-foreground mb-4">
                            You haven't submitted this assignment yet.
                        </p>
                        <Button onClick={onExit}>
                            Back to Tasks
                        </Button>
                    </Card>
                </div>
            </div>
        )
    }

    const submission = assignment.submission
    const percentage = submission.grade 
        ? (parseInt(submission.grade.value) / assignment.maxPoints) * 100 
        : 0

    const getPerformanceLevel = (pct: number) => {
        if (pct >= 90) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' }
        if (pct >= 80) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' }
        if (pct >= 70) return { label: 'Satisfactory', color: 'text-yellow-600', bg: 'bg-yellow-50' }
        return { label: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-50' }
    }

    const performance = getPerformanceLevel(percentage)

    const getAIAnalysisColor = (isLikelyAI: boolean, confidenceLevel: string) => {
        if (!isLikelyAI) return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' }
        if (confidenceLevel === 'HIGH') return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' }
        if (confidenceLevel === 'MEDIUM') return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800' }
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <Button onClick={onExit} variant="outline" className="gap-2 w-fit">
                        <ArrowLeft className="h-4 w-4" /> Back to Tasks
                    </Button>
                    
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                                {assignment.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    {assignment.studentName}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(submission.submittedAt).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {new Date(submission.submittedAt).toLocaleTimeString()}
                                </span>
                                <Badge variant="outline">{assignment.deliveryMode}</Badge>
                            </div>
                        </div>
                        
                        <Badge variant={isGraded ? "default" : "secondary"} className="text-base px-4 py-1">
                            {isGraded ? '✓ Graded' : '⏳ Submitted'}
                        </Badge>
                    </div>
                </div>

                {isGraded && submission.grade && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="border-2 border-primary">
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
                                    <div className="text-3xl font-bold text-primary mb-1">
                                        {submission.grade.value}/{assignment.maxPoints}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Your Score</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                                    <div className="text-3xl font-bold text-blue-500 mb-1">
                                        {percentage.toFixed(1)}%
                                    </div>
                                    <div className="text-sm text-muted-foreground">Percentage</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <CheckCircle className={`h-8 w-8 mx-auto mb-2 ${performance.color}`} />
                                    <div className={`text-lg font-bold ${performance.color} mb-1`}>
                                        {performance.label}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Performance</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                                    <div className={`text-lg font-bold mb-1 ${assignment.isOverdue ? 'text-red-600' : 'text-green-600'}`}>
                                        {assignment.isOverdue ? 'Late' : 'On Time'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Submission</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Submitted Answer */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Your Submission
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                                    {submission.content}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                                    <Clock className="h-4 w-4" />
                                    Submitted on: {new Date(submission.submittedAt).toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Attachments */}
                        {submission.attachments && submission.attachments.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Paperclip className="h-5 w-5" />
                                        Attached Files ({submission.attachments.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {submission.attachments.map((file, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                                                <Paperclip className="h-4 w-4 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Uploaded: {new Date(file.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                                <Button variant="outline" size="sm" className="gap-2">
                                                    <Download className="h-4 w-4" />
                                                    Download
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* AI Analysis */}
                        {submission.aiAnalysis && (
                            <Card className={`border-l-4 ${submission.aiAnalysis.isLikelyAI ? 'border-orange-500' : 'border-green-500'}`}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bot className="h-5 w-5" />
                                        AI Detection Analysis
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className={`p-4 rounded-lg border ${getAIAnalysisColor(submission.aiAnalysis.isLikelyAI, submission.aiAnalysis.confidenceLevel).bg} ${getAIAnalysisColor(submission.aiAnalysis.isLikelyAI, submission.aiAnalysis.confidenceLevel).border}`}>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold">AI Likelihood:</span>
                                                <Badge variant={submission.aiAnalysis.isLikelyAI ? "destructive" : "default"}>
                                                    {submission.aiAnalysis.percentage}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold">Confidence Level:</span>
                                                <Badge variant="outline">{submission.aiAnalysis.confidenceLevel}</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold">Model Used:</span>
                                                <span className="text-sm text-muted-foreground">{submission.aiAnalysis.modelUsed}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground pt-2 border-t">
                                                Analyzed: {new Date(submission.aiAnalysis.analyzedAt).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {submission.teacherFeedback && (
                            <Card className="border-l-4 border-blue-500">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-blue-600">
                                        <CheckCircle className="h-5 w-5" />
                                        Teacher Feedback
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <p className="whitespace-pre-wrap">{submission.teacherFeedback}</p>
                                    </div>
                                    {submission.grade && (
                                        <div className={`mt-4 p-4 rounded-lg ${performance.bg}`}>
                                            <div className="flex items-center gap-4">
                                                <span className="font-semibold">Grade:</span>
                                                <Badge variant="default" className="text-lg">
                                                    {submission.grade.value}/{assignment.maxPoints}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    ({percentage.toFixed(1)}%)
                                                </span>
                                                <Badge className={performance.color}>
                                                    {performance.label}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Submission Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Submission Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-sm text-muted-foreground">Status</Label>
                                    <div className="mt-1">
                                        <Badge variant={isGraded ? "default" : "secondary"}>
                                            {isGraded ? 'Graded' : 'Submitted'}
                                        </Badge>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm text-muted-foreground">Student</Label>
                                    <p className="mt-1 font-medium">{assignment.studentName}</p>
                                </div>

                                <div>
                                    <Label className="text-sm text-muted-foreground">Submission Date</Label>
                                    <p className="mt-1 font-medium">
                                        {new Date(submission.submittedAt).toLocaleString()}
                                    </p>
                                </div>

                                <div>
                                    <Label className="text-sm text-muted-foreground">Due Date</Label>
                                    <p className={`mt-1 font-medium ${assignment.isOverdue ? 'text-destructive' : ''}`}>
                                        {assignment.deadline}
                                        {assignment.isOverdue && (
                                            <span className="block text-xs text-destructive">(Late Submission)</span>
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <Label className="text-sm text-muted-foreground">Delivery Mode</Label>
                                    <p className="mt-1 font-medium">{assignment.deliveryMode}</p>
                                </div>

                                <div>
                                    <Label className="text-sm text-muted-foreground">Max Points</Label>
                                    <p className="mt-1 font-medium">{assignment.maxPoints} points</p>
                                </div>

                                {isGraded && submission.grade && (
                                    <>
                                        <div className="pt-3 border-t">
                                            <Label className="text-sm text-muted-foreground">Your Grade</Label>
                                            <p className="mt-1 font-bold text-2xl">
                                                {submission.grade.value}/{assignment.maxPoints}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {percentage.toFixed(1)}% - {performance.label}
                                            </p>
                                        </div>
                                        
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Submission ID</Label>
                                            <p className="mt-1 text-xs font-mono bg-muted p-2 rounded">
                                                {submission.id}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Assignment Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Info className="h-5 w-5" />
                                    Assignment Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <Label className="text-sm text-muted-foreground">Title</Label>
                                    <p className="mt-1 font-medium">{assignment.name}</p>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">Unit</Label>
                                    <p className="mt-1 font-medium">{assignment.unit}</p>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">Instructions</Label>
                                    <p className="mt-1 text-sm line-clamp-4">
                                        {assignment.instructions}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}