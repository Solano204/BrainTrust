// File: src/app/features/courses/components/SubmissionDetails.tsx
"use client";

import * as React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Paperclip, Download, MonitorCheck, FileText, CheckCircle, Loader2 } from "lucide-react";
import { SubmissionStatus } from "@/app/domain/valueObjects";
import { SubmissionId } from '@/app/domain/services/serviceCourse';
import { AISegmentsModal } from './quiz-view-submission-modalia-teacher';
import { SubmissionDetailData } from '@/app/domain/entities/CourseEntities';

interface SubmissionDetailProps {
    data: SubmissionDetailData;
    onBack: () => void;
    onUpdateGrade: (params: { submissionId: SubmissionId; gradeData: { grade: number; feedback: string } }) => void;
    onRequestAnalysis: (submissionId: SubmissionId) => void;
    onDownloadAttachment: (params: { submissionId: SubmissionId; attachmentId: string }) => void;
    isUpdatingGrade: boolean;
    isRequestingAnalysis: boolean;
    isDownloadingAttachment: boolean;
}

export function SubmissionDetailView({ 
    data, 
    onBack, 
    onUpdateGrade, 
    onRequestAnalysis, 
    onDownloadAttachment,
    isUpdatingGrade,
    isRequestingAnalysis,
    isDownloadingAttachment
}: SubmissionDetailProps) {
    const { submission, task, student, aiAnalysis } = data;

    // State management
    const initialGrade = submission.grade?.value ?? '';
    const [gradeInput, setGradeInput] = React.useState<string | number>(initialGrade);
    const [feedback, setFeedback] = React.useState(submission.teacherFeedback || '');
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    // Handle grade input change
    const handleGradeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const max = task.maxPoints;
        const min = 0;
        
        if (value === '' || value === '-') {
            setGradeInput(value);
        } else {
            const numValue = parseInt(value);
            if (!isNaN(numValue)) {
                const clampedValue = Math.min(Math.max(numValue, min), max);
                setGradeInput(clampedValue);
            }
        }
    };

    // Handle grade submission
    const handleSubmitGrade = () => {
        const finalGrade = typeof gradeInput === 'string' ? parseInt(gradeInput) : gradeInput;

        if (finalGrade === null || isNaN(finalGrade)) {
            alert('Please assign a valid numerical grade.');
            return;
        }

        onUpdateGrade({
            submissionId: submission.id,
            gradeData: {
                grade: finalGrade,
                feedback: feedback
            }
        });
    };

    // Handle AI analysis request
    const handleRequestAnalysis = () => {
        onRequestAnalysis(submission.id);
    };

    // Handle attachment download
    const handleDownloadAttachment = (attachmentId: string, fileName: string) => {
        onDownloadAttachment({
            submissionId: submission.id,
            attachmentId
        });
    };

    // Helper functions
    const formattedDate = (date: string) => 
        new Date(date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

    const getStatusBadge = (status: SubmissionStatus) => {
        switch (status) {
            case 'SUBMITTED': return <Badge className="bg-green-600 text-white hover:bg-green-700 font-semibold">Submitted</Badge>;
            case 'LATE_SUBMITTED': return <Badge className="bg-red-600 text-white hover:bg-red-700 font-semibold">Late</Badge>;
            case 'GRADED': return <Badge className="bg-blue-600 text-white hover:bg-blue-700 font-semibold">Graded</Badge>;
            case 'RETURNED': return <Badge className="bg-yellow-600 text-white hover:bg-yellow-700 font-semibold">Returned</Badge>;
            default: return <Badge variant="secondary">Draft</Badge>;
        }
    };

    // AI Analysis Display Logic
    const aiScore = aiAnalysis.result?.aiProbability?.value 
        ? Math.round(parseFloat(aiAnalysis.result.aiProbability.value) * 100)
        : null;
    
    const aiColor = aiScore !== null ? (aiScore > 50 ? 'text-destructive' : aiScore > 10 ? 'text-yellow-500' : 'text-green-500') : 'text-muted-foreground';
    const aiIcon = aiScore !== null && aiScore > 50 ? <MonitorCheck className="h-5 w-5 text-destructive" /> : <MonitorCheck className="h-5 w-5 text-blue-500" />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-border">
                    <h1 className="text-3xl font-extrabold text-foreground">
                        Review: {task.title}
                    </h1>
                    <Button onClick={onBack} variant="outline" className="gap-2 shadow-sm">
                        <ArrowLeft className="h-4 w-4" /> Back to Inventory
                    </Button>
                </div>
                
                {/* Student Info Card */}
                <Card className="p-6 shadow-xl bg-white dark:bg-gray-800 border-t-4 border-primary">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div className="flex items-center space-x-4 md:col-span-1">
                            <img src={student.avatarUrl} alt={student.name} className="w-16 h-16 rounded-full object-cover border-4 border-primary/50" />
                            <div>
                                <p className="text-lg font-bold text-primary">{student.name}</p>
                                <p className="text-sm text-muted-foreground">Student ID: {student.id}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase">Submission Status</p>
                            {getStatusBadge(submission.status)}
                        </div>
                        
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase">Max Points</p>
                            <p className="text-xl font-extrabold text-gray-800 dark:text-gray-100">{task.maxPoints}</p>
                        </div>

                        <div className="space-y-1 md:text-right">
                            <p className="text-xs text-muted-foreground uppercase">Submitted On</p>
                            <p className="font-medium text-sm">{formattedDate(submission.submittedAt)}</p>
                        </div>
                    </div>
                </Card>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Submission Content */}
                    <Card className="lg:col-span-2 p-6 shadow-xl space-y-4">
                        <h2 className="text-xl font-extrabold border-b pb-3 text-foreground">Submission Content</h2>
                        
                        {/* Instructions */}
                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                            <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                                <FileText className="h-4 w-4" /> Task Instructions:
                            </h3>
                            <p className="text-sm text-muted-foreground italic whitespace-pre-wrap">{task.instructions}</p>
                        </div>
                        
                        {/* Content */}
                        <div className="prose dark:prose-invert max-w-none text-foreground whitespace-pre-wrap border p-4 rounded-lg bg-white dark:bg-gray-900">
                            {submission.content}
                        </div>

                        {/* Attachments */}
                        {submission.attachments.length > 0 && (
                            <div className="pt-4 border-t border-border">
                                <h3 className="font-semibold mb-3">Attached Files ({submission.attachments.length})</h3>
                                <div className="space-y-2">
                                    {submission.attachments.map((file, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 text-sm bg-muted/50 rounded border border-border">
                                            <span className="flex items-center gap-2 font-medium">
                                                <Paperclip className="h-4 w-4 text-primary" /> {file.name}
                                            </span>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="gap-2"
                                                onClick={() => handleDownloadAttachment(file.storagePath, file.name)}
                                                disabled={isDownloadingAttachment}
                                            >
                                                {isDownloadingAttachment ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Download className="h-4 w-4" />
                                                )}
                                                Download
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                    
                    {/* Right Column: Grading & Analysis */}
                    <div className="space-y-6">
                        {/* Grading Card */}
                        <Card className="p-6 shadow-xl bg-white dark:bg-gray-800 border-l-4 border-green-500">
                            <h3 className="text-lg font-extrabold mb-4 border-b pb-2 text-green-600 dark:text-green-400 flex items-center gap-2">
                                <CheckCircle className="h-5 w-5" /> Final Grade
                            </h3>
                            
                            <div className="space-y-3">
                                <Label htmlFor="grade-input" className="font-semibold">
                                    Assign Grade (0 - {task.maxPoints})
                                </Label>
                                <Input 
                                    type="number" 
                                    id="grade-input" 
                                    placeholder="Enter score" 
                                    className="text-xl font-extrabold" 
                                    max={task.maxPoints} 
                                    min={0} 
                                    value={gradeInput} 
                                    onChange={handleGradeChange} 
                                    disabled={isUpdatingGrade}
                                />
                            </div>
                            
                            <div className="space-y-3 mt-4">
                                <Label htmlFor="feedback-input" className="font-semibold">Teacher Feedback</Label>
                                <Textarea 
                                    id="feedback-input" 
                                    rows={5} 
                                    placeholder="Provide constructive feedback..." 
                                    value={feedback} 
                                    onChange={(e) => setFeedback(e.target.value)}
                                    disabled={isUpdatingGrade}
                                />
                            </div>
                            
                            <Button 
                                onClick={handleSubmitGrade}
                                disabled={isUpdatingGrade || !gradeInput}
                                className="w-full mt-4 bg-green-600 hover:bg-green-700 shadow-md"
                            >
                                {isUpdatingGrade ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Grade'
                                )}
                            </Button>
                        </Card>

                        {/* AI Analysis Card */}
                        <Card className="p-6 shadow-xl bg-gray-100 dark:bg-gray-700 border-l-4 border-blue-500">
                            <h3 className="text-lg font-extrabold mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                {aiIcon} AI Detection Analysis
                            </h3>
                            {aiAnalysis.status === 'COMPLETED' && aiScore !== null ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <span className="text-muted-foreground">Likely AI Generated:</span>
                                        <span className={`text-2xl font-extrabold ${aiColor}`}>{aiScore}%</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground pt-2">
                                        Segments flagged: {aiAnalysis.result?.detectedSegments?.length || 0} instances detected.
                                    </p>
                                    <Button 
                                        variant="secondary" 
                                        size="sm" 
                                        className="w-full"
                                        onClick={() => setIsModalOpen(true)}
                                        disabled={!aiAnalysis.result?.detectedSegments?.length}
                                    >
                                        Review AI Segments ({aiAnalysis.result?.detectedSegments?.length || 0})
                                    </Button>
                                </div>
                            ) : aiAnalysis.status === 'PENDING' ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Analysis in progress...
                                    </div>
                                    <Button variant="secondary" size="sm" className="w-full" disabled>
                                        Analyzing...
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-muted-foreground text-sm">No analysis available.</p>
                                    <Button 
                                        variant="secondary" 
                                        size="sm" 
                                        className="w-full"
                                        onClick={handleRequestAnalysis}
                                        disabled={isRequestingAnalysis}
                                    >
                                        {isRequestingAnalysis ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                Requesting...
                                            </>
                                        ) : (
                                            'Request AI Analysis'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>

            {/* AI Segments Modal */}
            {aiAnalysis.result?.detectedSegments && (
                <AISegmentsModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    segments={aiAnalysis.result.detectedSegments}
                    submissionContent={submission.content}
                />
            )}
        </div>
    );
}