// components/Student/TaskSubmissionView.tsx
"use client";
// HERE IM RECIVING THE ASSIGNMENT COMPLETE OBJECT TO SHOW THE TASK INFORMAITON BUT TO ENABLE THE USER TO SUBMIT THE TASK I NEED CHECK THE STATUS OF THE TASK (IF IT WAS SUBMITTED OR NOT)
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Paperclip, 
  Upload, 
  Clock, 
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
  Send,
  Download,
  X
} from "lucide-react";
import { Assignment, Submission } from '@/app/domain/entities';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TaskSubmissionViewProps {
  assignment: Assignment;
  existingSubmission?: Submission;
  onSubmit: (submission: {
    content: string;
    attachments: File[];
  }) => Promise<void>;
  onDownloadAttachment: (attachment: Document) => void;
  isSubmitting?: boolean;
  onExit?: () => void; // Added exit handler
}

export const TaskSubmissionView: React.FC<TaskSubmissionViewProps> = ({
  assignment,
  existingSubmission,
  onSubmit,
  onDownloadAttachment,
  isSubmitting = false,
  onExit
}) => {
  const [content, setContent] = useState(existingSubmission?.content || '');
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLate = existingSubmission?.status === 'LATE_SUBMITTED';
  const isSubmitted = existingSubmission?.status === 'SUBMITTED' || existingSubmission?.status === 'LATE_SUBMITTED' || existingSubmission?.status === 'GRADED';
  const isGraded = existingSubmission?.status === 'GRADED';

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setUploadProgress(0);
      }
    }, 100);
  };

  // Remove file from list
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle submission
  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) {
      // Use a more elegant alert - you could replace this with a toast notification
      const shouldContinue = window.confirm(
        'Please provide either written content or attach files. Do you want to continue without submitting?'
      );
      if (!shouldContinue) return;
    }

    try {
      await onSubmit({ content, attachments: files });
      setShowSubmitConfirm(false);
      // Reset form on successful submission if it's a new submission
      if (!existingSubmission) {
        setContent('');
        setFiles([]);
      }
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  const handleSubmitConfirm = () => {
    setShowSubmitConfirm(true);
  };

  const handleExitConfirm = () => {
    setShowExitConfirm(false);
    onExit?.();
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!assignment.dueDate) return null;
    
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    
    if (diff <= 0) return { overdue: true, text: 'Overdue' };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return { 
      overdue: false, 
      text: `${days}d ${hours}h remaining` 
    };
  };

  const timeRemaining = getTimeRemaining();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header with Exit Button */}
          <div className="flex justify-between items-center">
            <div className="text-center space-y-2 flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {assignment.title}
              </h1>
              <p className="text-lg text-muted-foreground">
                Submit your work for evaluation
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowExitConfirm(true)}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Assignment Details Card */}
              <Card className="shadow-lg border-l-4 border-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Assignment Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {assignment.instructions}
                    </p>
                  </div>
                  
                  {/* Assignment Metadata */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Due Date</Label>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        {assignment.dueDate ? formatDate(assignment.dueDate) : 'No due date'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Max Score</Label>
                      <div className="text-sm font-semibold">
                        {assignment.maxScore.value} points
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Delivery Mode</Label>
                      <Badge variant="secondary">
                        {assignment.deliveryMode}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="flex items-center gap-2">
                        {timeRemaining && (
                          <Badge 
                            variant={timeRemaining.overdue ? "destructive" : "default"}
                            className="flex items-center gap-1"
                          >
                            <Clock className="h-3 w-3" />
                            {timeRemaining.text}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submission Form */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-green-500" />
                    Your Submission
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Written Content */}
                  <div className="space-y-3">
                    <Label htmlFor="content" className="text-base">
                      Written Response {!assignment.attachments.length && <span className="text-red-500">*</span>}
                    </Label>
                    <Textarea
                      id="content"
                      placeholder="Type your response here... You can include explanations, code, essays, or any written content required for this assignment."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={12}
                      className="resize-none font-mono text-sm"
                      disabled={isSubmitted}
                    />
                    <p className="text-sm text-muted-foreground">
                      Character count: {content.length}
                    </p>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-3">
                    <Label className="text-base">
                      Attachments {!content.trim() && <span className="text-red-500">*</span>}
                    </Label>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      multiple
                      className="hidden"
                      disabled={isSubmitted}
                    />
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitted}
                      className="w-full h-20 border-dashed"
                    >
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm font-medium">Click to upload files</p>
                        <p className="text-xs text-muted-foreground">
                          PDF, DOC, images, code files (Max: 10MB each)
                        </p>
                      </div>
                    </Button>

                    {/* Upload Progress */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="space-y-2">
                        <Progress value={uploadProgress} className="w-full" />
                        <p className="text-xs text-center text-muted-foreground">
                          Uploading... {uploadProgress}%
                        </p>
                      </div>
                    )}

                    {/* File List */}
                    {files.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Selected Files:</h4>
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Paperclip className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium">{file.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              disabled={isSubmitted}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Existing Attachments */}
                  {existingSubmission?.attachments && existingSubmission.attachments.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-base">Previously Submitted Files:</Label>
                      <div className="space-y-2">
                        {existingSubmission.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <Paperclip className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium">{attachment.name}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onDownloadAttachment(attachment)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submission Status */}
                  {isSubmitted && (
                    <div className={`p-4 rounded-lg border ${
                      isGraded 
                        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                        : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                    }`}>
                      <div className="flex items-center gap-3">
                        {isGraded ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-blue-500" />
                        )}
                        <div>
                          <p className="font-medium">
                            {isGraded ? 'Submission Graded' : 'Submission Received'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Submitted on {formatDate(existingSubmission!.submittedAt)}
                            {isLate && ' (Late submission)'}
                            {isGraded && ` • Grade: ${existingSubmission!.grade?.value}/${assignment.maxScore.value}`}
                          </p>
                          {existingSubmission?.teacherFeedback && (
                            <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded border">
                              <p className="font-medium text-sm">Teacher Feedback:</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {existingSubmission.teacherFeedback}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  {!isSubmitted && (
                    <Button
                      onClick={handleSubmitConfirm}
                      disabled={isSubmitting || (!content.trim() && files.length === 0)}
                      className="w-full py-6 text-lg font-semibold"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Submit Assignment
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="space-y-6">
              
              {/* Submission Guidelines */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Submission Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>Ensure your work is original and properly cited</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>Check file formats and sizes before uploading</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>Review your submission before sending</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>Late submissions may be penalized</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Support Resources */}
              {assignment.attachments.length > 0 && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Support Materials</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {assignment.attachments.map((attachment, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => onDownloadAttachment(attachment)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {attachment.name}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Submission Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Delivery Mode:</span>
                    <Badge variant="secondary">{assignment.deliveryMode}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Points:</span>
                    <span className="font-semibold">{assignment.maxScore.value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Late Submissions:</span>
                    <span>{assignment.allowLateSubmissions ? 'Allowed' : 'Not Allowed'}</span>
                  </div>
                  {existingSubmission && (
                    <div className="flex justify-between">
                      <span>Your Status:</span>
                      <Badge variant={
                        isGraded ? "default" : 
                        isLate ? "destructive" : 
                        "secondary"
                      }>
                        {existingSubmission.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              Any unsaved changes will be lost. Are you sure you want to exit?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleExitConfirm} className="bg-red-600 hover:bg-red-700">
              Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit Confirmation Dialog */}
        <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit this assignment? You won't be able to make changes after submission.
            </AlertDialogDescription>
            {files.length > 0 && (
              <div className="mt-2 text-sm text-muted-foreground">
                <strong>Files to upload:</strong>
                <ul className="list-disc list-inside mt-1">
                  {files.map((file, index) => (
                    <li key={index} className="text-sm">{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Submission</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Assignment'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};