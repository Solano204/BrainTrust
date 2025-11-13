// File: src/app/features/courses/components/StudentTaskSubmissionView.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    ArrowLeft, 
    Paperclip, 
    Calendar,
    Clock,
    FileText,
    CheckCircle,
    Download,
    AlertCircle
} from "lucide-react";

interface StudentAssignment {
  id: string;
  name: string;
  unit: string;
  instructions: string;
  maxPoints: number;
  deadline: string;
  isOverdue: boolean;
  submission?: {
    id: string;
    content: string;
    submittedAt: string;
    status: string;
    grade?: { value: string; maxScore: number };
    teacherFeedback?: string;
    attachments: Array<{ name: string; storagePath: string; createdAt: string }>;
  };
}

interface StudentTaskSubmissionViewProps {
  assignment: StudentAssignment;
  onExit: () => void;
}

export function StudentTaskSubmissionView({ assignment, onExit }: StudentTaskSubmissionViewProps) {
    console.log("Assignment Submission:", assignment);

    const isSubmitted = assignment.submission?.status === 'SUBMITTED' || assignment.submission?.status === 'GRADED';
    const isGraded = assignment.submission?.status === 'GRADED';

    // If no submission exists, show a message
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
        );
    }

    const submission = assignment.submission;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-border">
                    <div>
                        <Button onClick={onExit} variant="outline" className="gap-2 mb-4">
                            <ArrowLeft className="h-4 w-4" /> Back to Tasks
                        </Button>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                            Submission: {assignment.name}
                        </h1>
                        <p className="text-muted-foreground mt-1">{assignment.unit}</p>
                    </div>
                    
                    <div className="text-right space-y-2">
                        <div className="flex items-center gap-2 justify-end">
                            <Calendar className="h-4 w-4" />
                            <span className={assignment.isOverdue ? "text-destructive font-semibold" : ""}>
                                Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                            </span>
                        </div>
                        <Badge variant={isGraded ? "default" : "secondary"}>
                            {isGraded ? 'Graded' : 'Submitted'}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Submission Content */}
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
                                            <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
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

                        {/* Teacher Feedback */}
                        { (
                            <Card className="border-l-4 border-green-500">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-green-600">
                                        <CheckCircle className="h-5 w-5" />
                                        Teacher Feedback
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <p className="whitespace-pre-wrap">{submission.teacherFeedback}</p>
                                    </div>
                                    {submission.grade && (
                                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <span className="font-semibold">Grade:</span>
                                                <Badge variant="default" className="text-lg">
                                                    {submission.grade.value}/{assignment.maxPoints}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    ({((parseInt(submission.grade.value) / assignment.maxPoints) * 100).toFixed(1)}%)
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Submission Info */}
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
                                    <Label className="text-sm text-muted-foreground">Submission Date</Label>
                                    <p className="mt-1 font-medium">
                                        {new Date(submission.submittedAt).toLocaleString()}
                                    </p>
                                </div>

                                <div>
                                    <Label className="text-sm text-muted-foreground">Assignment Due Date</Label>
                                    <p className={`mt-1 font-medium ${assignment.isOverdue ? 'text-destructive' : ''}`}>
                                        {assignment.deadline}
                                        {assignment.isOverdue && ' (Overdue)'}
                                    </p>
                                </div>

                                <div>
                                    <Label className="text-sm text-muted-foreground">Max Points</Label>
                                    <p className="mt-1 font-medium">{assignment.maxPoints} points</p>
                                </div>

                                {isGraded && submission.grade && (
                                    <div>
                                        <Label className="text-sm text-muted-foreground">Your Grade</Label>
                                        <p className="mt-1 font-bold text-lg">
                                            {submission.grade.value}/{assignment.maxPoints}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            ({((parseInt(submission.grade.value) / assignment.maxPoints) * 100).toFixed(1)}%)
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Assignment Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Assignment Info</CardTitle>
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
                                    <p className="mt-1 text-sm line-clamp-3">
                                        {assignment.instructions}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Add the missing Label component
const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
        {children}
    </label>
);