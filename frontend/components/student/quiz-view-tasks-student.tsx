"use client";
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  X,
  Brain,
  AlertTriangle,
  Info,
  BarChart3,
  Link as LinkIcon,
  Users,
  User,
  CalendarClock,
  Award,
  MessageSquare,
  ExternalLink,
  BookOpen,
  CalendarCheck,
  Eye,
  File,
  List
} from "lucide-react";
import { Assignment, Submission} from '@/app/domain/entities';
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
import { SubmissionCompleteIa } from './api/student-submission';
import { Document } from '@/app/domain/valueObjects';

interface TaskSubmissionViewProps {
  assignment: Assignment;
  existingSubmission?: SubmissionCompleteIa;
  onSubmit: (submission: {
    content: string;
    attachments: File[];
  }) => Promise<void>;
  onDownloadAttachment: (attachment: Document) => void;
  isSubmitting?: boolean;
  onExit?: () => void;
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
  const [showAllLinks, setShowAllLinks] = useState(false);
  const [showAllAttachments, setShowAllAttachments] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLate = existingSubmission?.status === 'LATE_SUBMITTED';
  const isSubmitted = existingSubmission?.status === 'SUBMITTED' || existingSubmission?.status === 'LATE_SUBMITTED' || existingSubmission?.status === 'GRADED';
  const isGraded = existingSubmission?.status === 'GRADED';
  const hasAIResult = existingSubmission?.iaResult !== undefined;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
    
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

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) {
      const shouldContinue = window.confirm(
        'Please provide either written content or attach files. Do you want to continue without submitting?'
      );
      if (!shouldContinue) return;
    }

    try {
      await onSubmit({ content, attachments: files });
      setShowSubmitConfirm(false);
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

  const formatDateRelative = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (date > now) {
      return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  const getTimeRemaining = () => {
    if (!assignment.dueDate) return null;
    
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    
    if (diff <= 0) return { overdue: true, text: 'Overdue' };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return { overdue: false, text: `${days}d ${hours}h remaining` };
    if (hours > 0) return { overdue: false, text: `${hours}h ${minutes}m remaining` };
    return { overdue: false, text: `${minutes}m remaining` };
  };

  const renderAIDetectionResult = () => {
    if (!hasAIResult || !existingSubmission?.iaResult) return null;

    const aiResult = existingSubmission.iaResult;
    const probability = parseFloat(aiResult.probability);
    const percentage = parseFloat(aiResult.percentage);
    const isLikelyAI = aiResult.isLikelyAI;

    return (
      <Card className={`shadow-lg border-l-4 ${
        isLikelyAI ? 'border-red-500' : 'border-green-500'
      }`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Brain className="h-5 w-5" />
            AI Detection Analysis
            <Badge 
              variant={isLikelyAI ? "destructive" : "default"}
              className="ml-2"
            >
              {isLikelyAI ? 'AI Content Detected' : 'Human Content'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Probability Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">AI Probability Score</Label>
              <span className="text-sm font-semibold">{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className={`h-2.5 rounded-full ${
                  percentage < 30 ? 'bg-green-500' :
                  percentage < 70 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0% (Human)</span>
              <span>50%</span>
              <span>100% (AI)</span>
            </div>
          </div>

          {/* Detailed Analysis Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-sm font-medium">Confidence Level</span>
                <Badge variant="outline" className={
                  aiResult.confidenceLevel === 'HIGH' ? 'bg-red-100 text-red-800' :
                  aiResult.confidenceLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }>
                  {aiResult.confidenceLevel}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium">Probability</span>
                <span className="text-sm font-semibold">{probability.toFixed(4)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium">Detection Model</span>
                <span className="text-sm font-semibold">{aiResult.modelUsed}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium">Analysis Date</span>
                <span className="text-sm">{formatDate(aiResult.analyzedAt)}</span>
              </div>
            </div>
          </div>

          {/* Analysis ID */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Analysis ID:</span>
              <code className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                {aiResult.analysisId}
              </code>
            </div>
          </div>

          {/* Interpretation Guide */}
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-300">
                  Understanding AI Detection Results
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                  <li>• <strong>0-30%:</strong> Likely human-written content</li>
                  <li>• <strong>30-70%:</strong> Mixed or uncertain origin</li>
                  <li>• <strong>70-100%:</strong> High probability of AI-generated content</li>
                </ul>
                <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
                  Note: AI detection tools are not 100% accurate and should be used as a reference only.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const timeRemaining = getTimeRemaining();
  const totalSubmissions = assignment.submissions?.length || 0;

  const displayedLinks = showAllLinks ? assignment.links : assignment.links.slice(0, 3);
  const displayedAttachments = showAllAttachments ? assignment.attachments : assignment.attachments.slice(0, 3);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header with Exit Button */}
          <div className="flex justify-between items-center">
            <div className="text-center space-y-2 flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {assignment.title}
              </h1>
              <p className="text-lg text-muted-foreground">
                {assignment.description}
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

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content - 3/4 width */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Assignment Overview Card */}
              <Card className="shadow-lg border-l-4 border-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    Assignment Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Description */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Description
                    </Label>
                    <p className="text-gray-700 dark:text-gray-300">
                      {assignment.description}
                    </p>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Instructions
                    </Label>
                    <div className="prose dark:prose-invert max-w-none p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {assignment.instructions}
                      </p>
                    </div>
                  </div>

                  {/* Assignment Metadata Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Created
                      </Label>
                      <div className="text-sm">
                        {formatDate(assignment.createdAt)}
                        <p className="text-xs text-muted-foreground">
                          ({formatDateRelative(assignment.createdAt)})
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <CalendarClock className="h-4 w-4" />
                        Due Date
                      </Label>
                      <div className="text-sm">
                        {assignment.dueDate ? (
                          <>
                            {formatDate(assignment.dueDate)}
                            {timeRemaining && (
                              <p className={`text-xs ${timeRemaining.overdue ? 'text-red-500' : 'text-muted-foreground'}`}>
                                {timeRemaining.text}
                              </p>
                            )}
                          </>
                        ) : (
                          'No due date'
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Max Score
                      </Label>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {assignment.maxScore.value} points
                        {assignment.maxScore.maxPoints && (
                          <p className="text-xs text-muted-foreground">
                            out of {assignment.maxScore.maxPoints}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        {assignment.deliveryMode === 'TEAM' ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        Delivery Mode
                      </Label>
                      <Badge variant={assignment.deliveryMode === 'TEAM' ? "secondary" : "outline"}>
                        {assignment.deliveryMode}
                      </Badge>
                    </div>
                  </div>

                  
                </CardContent>
              </Card>

              {/* Resources Section */}
              {(assignment.urls.length > 0 || assignment.attachments.length > 0 || assignment.links.length > 0) && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-500" />
                      Learning Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                  
                    {assignment.links.length > 0 && (
                      <div className="space-y-3">
                        <Label className="text-base font-medium flex items-center gap-2">
                          <LinkIcon className="h-5 w-5" />
                          Reference Links ({assignment.links.length})
                          {assignment.links.length > 3 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowAllLinks(!showAllLinks)}
                              className="ml-auto text-xs"
                            >
                              {showAllLinks ? 'Show Less' : `Show ${assignment.links.length - 3} More`}
                            </Button>
                          )}
                        </Label>
                        <div className="space-y-2">
                          {displayedLinks.map((link, index) => (
                            <div
                              key={index}
                              className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800"
                            >
                              <p className="text-sm font-medium">{link}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Attachments */}
                    {assignment.attachments.length > 0 && (
                      <div className="space-y-3">
                        <Label className="text-base font-medium flex items-center gap-2">
                          <Paperclip className="h-5 w-5" />
                          Attachments ({assignment.attachments.length})
                          {assignment.attachments.length > 3 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowAllAttachments(!showAllAttachments)}
                              className="ml-auto text-xs"
                            >
                              {showAllAttachments ? 'Show Less' : `Show ${assignment.attachments.length - 3} More`}
                            </Button>
                          )}
                        </Label>
                        <div className="space-y-2">
                          {displayedAttachments.map((attachment, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <File className="h-5 w-5 text-blue-500" />
                                <div>
                                  <span className="text-sm font-medium">{attachment.name}</span>
                                  <p className="text-xs text-muted-foreground">
                                    Uploaded: {formatDateRelative(attachment.createdAt)}
                                  </p>
                                </div>
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
                  </CardContent>
                </Card>
              )}

              {hasAIResult && renderAIDetectionResult()}

              {/* Submission Form */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-green-500" />
                    Your Submission
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="space-y-3">
                    <Label htmlFor="content" className="text-base flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
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
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        Character count: {content.length} | Words: {content.split(/\s+/).filter(Boolean).length}
                      </p>
                      {content.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {Math.ceil(content.split(/\s+/).length / 200)} minute read
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-3">
                    <Label className="text-base flex items-center gap-2">
                      <Upload className="h-4 w-4" />
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
                      className="w-full h-24 border-dashed"
                    >
                      <div className="text-center space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">Click to upload files</p>
                          <p className="text-xs text-muted-foreground">
                            PDF, DOC, images, code files (Max: 10MB each)
                          </p>
                        </div>
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
                              <div>
                                <span className="text-sm font-medium block">{file.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              disabled={isSubmitted}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {existingSubmission?.attachments && existingSubmission.attachments.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-base flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Previously Submitted Files:
                      </Label>
                      <div className="space-y-2">
                        {existingSubmission.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-900/20"
                          >
                            <div className="flex items-center gap-3">
                              <Paperclip className="h-4 w-4 text-green-500" />
                              <div>
                                <span className="text-sm font-medium">{attachment.name}</span>
                                <p className="text-xs text-muted-foreground">
                                  Submitted: {formatDateRelative(existingSubmission.submittedAt)}
                                </p>
                              </div>
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

                  {isSubmitted && (
                    <div className={`p-4 rounded-lg border ${
                      isGraded 
                        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                        : isLate
                        ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                        : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                    }`}>
                      <div className="flex items-center gap-3">
                        {isGraded ? (
                          <Award className="h-5 w-5 text-green-500" />
                        ) : isLate ? (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-blue-500" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">
                            {isGraded ? 'Submission Graded' : 
                             isLate ? 'Late Submission Received' : 
                             'Submission Received'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Submitted on {formatDate(existingSubmission!.submittedAt)}
                            {isLate && ' (Late submission)'}
                          </p>
                          {isGraded && existingSubmission?.grade && (
                            <div className="mt-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-lg text-green-600 dark:text-green-400">
                                  Grade: {existingSubmission.grade.value}/{assignment.maxScore.value}
                                </span>
                                <Badge variant="outline">
                                  {((Number(existingSubmission.grade.value) / Number(assignment.maxScore.value)) * 100).toFixed(1)}%
                                </Badge>
                              </div>
                            </div>
                          )}
                          {existingSubmission?.teacherFeedback && (
                            <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border">
                              <p className="font-medium text-sm flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Teacher Feedback:
                              </p>
                              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
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
                      className="w-full py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
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

            {/* Sidebar - 1/4 width */}
            <div className="space-y-6">
              
              {/* Quick Stats Card */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                    Assignment Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Status</span>
                      <Badge variant={
                        isGraded ? "default" : 
                        isLate ? "destructive" : 
                        isSubmitted ? "secondary" : 
                        "outline"
                      }>
                        {isGraded ? 'Graded' : 
                         isLate ? 'Late Submitted' : 
                         isSubmitted ? 'Submitted' : 
                         'Not Submitted'}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Delivery Mode</span>
                      <Badge variant="secondary">
                        {assignment.deliveryMode}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Max Points</span>
                      <span className="font-semibold">{assignment.maxScore.value}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Late Submissions</span>
                      <span className={assignment.allowLateSubmissions ? "text-green-600" : "text-red-600"}>
                        {assignment.allowLateSubmissions ? 'Allowed' : 'Not Allowed'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Created</span>
                      <span className="text-xs">{formatDateRelative(assignment.createdAt)}</span>
                    </div>
                    
                    {assignment.dueDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Due Date</span>
                        <span className="text-xs">{formatDateRelative(assignment.dueDate)}</span>
                      </div>
                    )}
                    
                   
                    
                    {hasAIResult && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm">AI Analysis</span>
                        <Badge variant={
                          existingSubmission?.iaResult?.isLikelyAI ? "destructive" : "default"
                        }>
                          {existingSubmission?.iaResult?.isLikelyAI ? 'Detected' : 'Clear'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Submission Guidelines */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>Ensure originality and proper citations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>Check file formats before uploading</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>Review submission before sending</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>Late submissions may be penalized</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>AI-generated content may be detected</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Time Remaining Card */}
              {assignment.dueDate && (
                <Card className={`shadow-lg border-l-4 ${
                  timeRemaining?.overdue ? 'border-red-500' : 
                  timeRemaining && timeRemaining.text.includes('d') ? 'border-yellow-500' : 
                  'border-green-500'
                }`}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Time Remaining
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-2">
                        {timeRemaining?.text || 'No due date'}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Due: {formatDate(assignment.dueDate)}
                      </p>
                      {timeRemaining?.overdue && (
                        <p className="text-sm text-red-500 mt-2">
                          This assignment is overdue!
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Exit Assignment?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isSubmitted ? 
                "Are you sure you want to exit this submission view?" : 
                "Any unsaved changes will be lost. Are you sure you want to exit?"
              }
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

      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-green-500" />
              Submit Assignment?
            </AlertDialogTitle>
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