
"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Download,
  FileText,
  Calendar,
  User,
  Brain,
  AlertTriangle,
  BarChart3,
  Clock,
  Users,
  File,
  Hash,
  Award,
  Eye,
  X,
  Activity,
  Shield,
  Cpu,
} from "lucide-react";
import { SubmissionTask } from "../student/api/student-submission";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SubmissionDetailViewProps {
  data: SubmissionTask;
  onBack: () => void;
  onUpdateGrade: (data: {
    submissionId: string;
    gradeValue: string;
    maxScore: string;
    feedback: string;
  }) => void;
  onDownloadAttachment: (attachment: {
    name: string;
    storagePath: string;
  }) => void;
  isUpdatingGrade: boolean;
  isDownloadingAttachment?: boolean;
}

export function SubmissionDetailView({
  data,
  onBack,
  onUpdateGrade,
  onDownloadAttachment,
  isUpdatingGrade,
  isDownloadingAttachment = false,
}: SubmissionDetailViewProps) {
  const [gradeValue, setGradeValue] = React.useState(
    data.submission?.grade?.value || ""
  );
  const [feedback, setFeedback] = React.useState(
    data.submission?.teacherFeedback || ""
  );
  const [showAIAnalysisModal, setShowAIAnalysisModal] = React.useState(false);

  const percentage = React.useMemo(() => {
    if (!data.submission?.grade) return 0;
    const gradeNum = Number(gradeValue || data.submission.grade.value);
    return (gradeNum / data.maxPoints) * 100;
  }, [gradeValue, data.submission?.grade, data.maxPoints]);

  const handleSubmitGrade = () => {
    console.log("Submitting grade for submission:", data.submission?.id);
    if (!data.submission) return;
    
    onUpdateGrade({
      submissionId: data.submission.id,
      gradeValue,
      maxScore: data.maxPoints.toString(),
      feedback,
    });
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

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'GRADED':
        return 'default';
      case 'SUBMITTED':
        return 'secondary';
      case 'LATE_SUBMITTED':
        return 'destructive';
      case 'NOT_SUBMITTED':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatStatusText = (status: string) => {
    return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };


  console.log("Submission data:", data);

  const AIAnalysisModal = () => (
    <Dialog open={showAIAnalysisModal} onOpenChange={setShowAIAnalysisModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-purple-600" />
              <div>
                <DialogTitle className="text-2xl">AI Detection Analysis Report</DialogTitle>
                <DialogDescription>
                  Detailed analysis of submission content authenticity
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAIAnalysisModal(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {data.submission?.aiAnalysis && (
          <div className="space-y-6">
            {/* Summary Header */}
            <div className={`p-4 rounded-lg border ${
              data.submission.aiAnalysis.isLikelyAI 
                ? 'bg-red-50 border-red-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    data.submission.aiAnalysis.isLikelyAI 
                      ? 'bg-red-100' 
                      : 'bg-green-100'
                  }`}>
                    {data.submission.aiAnalysis.isLikelyAI ? (
                      <Cpu className="h-5 w-5 text-red-600" />
                    ) : (
                      <User className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      {data.submission.aiAnalysis.isLikelyAI 
                        ? 'AI-Generated Content Detected' 
                        : 'Human-Written Content Confirmed'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Analysis conducted on {formatDate(data.submission.aiAnalysis.analyzedAt)}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={data.submission.aiAnalysis.isLikelyAI ? "destructive" : "default"}
                  className="px-4 py-2 text-sm"
                >
                  {data.submission.aiAnalysis.isLikelyAI ? 'AI CONTENT' : 'HUMAN CONTENT'}
                </Badge>
              </div>
            </div>

            {/* Analysis Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-medium">AI Probability</p>
                </div>
                <p className="text-2xl font-bold">{data.submission.aiAnalysis.probability}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Likelihood of AI generation
                </p>
              </div>

              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium">Confidence Score</p>
                </div>
                <p className="text-2xl font-bold">{data.submission.aiAnalysis.percentage}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Analysis confidence level
                </p>
              </div>

              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <p className="text-sm font-medium">Confidence Level</p>
                </div>
                <p className="text-lg font-bold capitalize">
                  {data.submission.aiAnalysis.confidenceLevel}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Result reliability rating
                </p>
              </div>

              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="h-4 w-4 text-orange-600" />
                  <p className="text-sm font-medium">Detection Model</p>
                </div>
                <p className="text-lg font-bold">{data.submission.aiAnalysis.modelUsed}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  AI detection system used
                </p>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Analysis Reference
                </h4>
                <div className="p-2 bg-white border rounded">
                  <code className="text-sm font-mono break-all">
                    {data.submission.aiAnalysis.analysisId}
                  </code>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Unique identifier for this analysis session
                </p>
              </div>

              <div className={`p-4 rounded-lg border ${
                data.submission.aiAnalysis.isLikelyAI 
                  ? 'bg-yellow-50 border-yellow-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-2">Important Considerations</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
                        <span>
                          AI detection tools have varying accuracy rates and may produce false positives or false negatives.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
                        <span>
                          Human-written content may be flagged as AI-generated if it follows predictable patterns.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
                        <span>
                          Consider the analysis as one factor among many when evaluating academic integrity.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
                        <span>
                          Always review the student's writing style and compare with previous submissions.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

{data.submission.aiAnalysis.segments && data.submission.aiAnalysis.segments.length > 0 && (
  <div className="space-y-4">
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Segment Analysis
        </h4>
        <Badge variant="outline">
          {data.submission.aiAnalysis.segments.length} segments analyzed
        </Badge>
      </div>
      
      <div className="space-y-3">
        {data.submission.aiAnalysis.segments.map((segment, index) => (
          <div 
            key={index} 
            className={`p-4 rounded-lg border ${
              segment.isLikelyAI 
                ? 'bg-red-50 border-red-200' 
                : 'bg-green-50 border-green-200'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">Segment {index + 1}</span>
                  <Badge variant={segment.isLikelyAI ? "destructive" : "default"}>
                    {segment.isLikelyAI ? 'AI-GENERATED' : 'HUMAN-WRITTEN'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    <span>Position: {segment.startIndex}-{segment.endIndex}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    <span>AI Probability: {(parseFloat(segment.aiProbability || segment.aiProbability || '0') * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-3">
              <p className="text-sm font-medium mb-1">Text Content:</p>
              <div className="p-3 bg-white/80 rounded border">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  "{segment.text}"
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
             
              
              <div className="p-2 bg-white/50 rounded">
                <p className="font-medium text-xs mb-1">AI Percentage</p>
                <p className="text-lg font-bold">
                  {segment.percentage || 'N/A'}
                </p>
              </div>
              
              {segment.reasoning && (
                <div className="col-span-2 p-2 bg-blue-50 rounded border border-blue-100">
                  <p className="font-medium text-xs mb-1">Analysis Reasoning</p>
                  <p className="text-sm text-blue-700">{segment.reasoning}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 bg-white border rounded-lg">
        <p className="text-sm font-medium mb-2">AI-Generated Segments</p>
        <p className="text-2xl font-bold text-red-600">
          {data.submission.aiAnalysis.segments.filter(s => s.isLikelyAI).length}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          of {data.submission.aiAnalysis.segments.length} total segments
        </p>
      </div>
      
      <div className="p-4 bg-white border rounded-lg">
        <p className="text-sm font-medium mb-2">Average AI Probability</p>
        <p className="text-2xl font-bold">
          {(
            data.submission.aiAnalysis.segments.reduce((sum, seg) => 
              sum + parseFloat(seg.probability || seg.probability || '0'), 0
            ) / data.submission.aiAnalysis.segments.length * 100
          ).toFixed(1)}%
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Across all segments
        </p>
      </div>
      
      <div className="p-4 bg-white border rounded-lg">
        <p className="text-sm font-medium mb-2">Human-Written Segments</p>
        <p className="text-2xl font-bold text-green-600">
          {data.submission.aiAnalysis.segments.filter(s => !s.isLikelyAI).length}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          of {data.submission.aiAnalysis.segments.length} total segments
        </p>
      </div>
    </div>
  </div>
)}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowAIAnalysisModal(false)}
              >
                Close Report
              </Button>
              <Button
                onClick={() => {
                  console.log("Export AI Analysis Report");
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Button onClick={onBack} variant="outline" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Submissions
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {data.name} - Submission Review
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Student: {data.studentName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              <span>Task ID: {data.id}</span>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
            <Award className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">
              Max: {data.maxPoints} pts
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
            <Calendar className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">
              Deadline: {formatShortDate(data.deadline)}
            </span>
          </div>
          <Badge 
            variant={getStatusBadgeVariant(data.submission?.status || 'NOT_SUBMITTED')}
            className="px-3 py-2"
          >
            {formatStatusText(data.submission?.status || 'Not Submitted')}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Task Overview</h2>
              <Badge variant="outline" className="capitalize">
                {data.deliveryMode}
              </Badge>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Unit Information</h3>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="font-medium">{data.unit}</p>
                  <p className="text-sm text-muted-foreground mt-1">Associated Unit</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Instructions</h3>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {data.instructions}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">Max Points</p>
                  <p className="text-lg font-bold">{data.maxPoints}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">Delivery Mode</p>
                  <p className="text-lg font-bold capitalize">{data.deliveryMode}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <p className="text-lg font-bold">{new Date(data.deadline).toLocaleDateString()}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={data.isOverdue ? "destructive" : "default"}>
                    {data.isOverdue ? "Overdue" : "Active"}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {data.submission && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Student Submission</h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Submitted: {formatShortDate(data.submission.submittedAt)}</span>
                  </div>
                  <Badge variant={getStatusBadgeVariant(data.submission.status)}>
                    {formatStatusText(data.submission.status)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-6">
                {data.submission.isTeamSubmission && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">
                        Team Submission: {data.submission.teamName}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-3">Submission Content</h3>
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <p className="whitespace-pre-wrap">
                      {data.submission.content || "No content provided"}
                    </p>
                  </div>
                </div>

                {data.submission.attachments.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Attachments</h3>
                      <span className="text-sm text-muted-foreground">
                        {data.submission.attachments.length} file(s)
                      </span>
                    </div>
                    <div className="space-y-2">
                      {data.submission.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="font-medium">{attachment.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Storage Path: {attachment.storagePath}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDownloadAttachment(attachment)}
                            disabled={isDownloadingAttachment}
                            className="gap-2"
                          >
                            <Download className="h-4 w-4" />
                            {isDownloadingAttachment ? 'Downloading...' : 'Download'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.submission.grade && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-800">Current Grade</h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-blue-800">
                          {data.submission.grade.value} / {data.maxPoints}
                        </p>
                        <p className="text-sm text-blue-600">
                          {percentage.toFixed(1)}% achieved
                        </p>
                      </div>
                      <Badge variant={percentage >= 70 ? "default" : "secondary"}>
                        {percentage >= 70 ? "Passing" : "Needs Improvement"}
                      </Badge>
                    </div>
                    {data.submission.teacherFeedback && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-sm font-medium text-blue-800 mb-1">Feedback:</p>
                        <p className="text-sm text-blue-700">{data.submission.teacherFeedback}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Grading Section */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Grade Submission</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Enter Grade</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={gradeValue}
                    onChange={(e) => setGradeValue(e.target.value)}
                    placeholder="0"
                    className="flex-1"
                    min="0"
                    max={data.maxPoints}
                  />
                  <span className="text-muted-foreground">/ {data.maxPoints}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Calculated Percentage</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={percentage.toFixed(1)}
                    readOnly
                    className="flex-1 bg-muted"
                  />
                  <span>%</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Feedback for Student</label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide constructive feedback to help the student improve..."
                  rows={6}
                  className="resize-none"
                />
              </div>

              <Button
                onClick={handleSubmitGrade}
                disabled={isUpdatingGrade || !gradeValue}
                className="w-full gap-2"
              >
                {isUpdatingGrade ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    Updating Grade...
                  </>
                ) : (
                  <>
                    <Award className="h-4 w-4" />
                    {data.submission?.grade ? 'Update Grade' : 'Submit Grade'}
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* AI Analysis Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-bold">AI Content Analysis</h2>
            </div>
            
            {data.submission?.aiAnalysis ? (
              <div className="space-y-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Status</p>
                    <Badge variant={data.submission.aiAnalysis.isLikelyAI ? "destructive" : "default"}>
                      {data.submission.aiAnalysis.isLikelyAI ? 'AI Detected' : 'Human Content'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Analyzed: {formatShortDate(data.submission.aiAnalysis.analyzedAt)}
                    </p>
                    <span className="text-xs font-medium">
                      {data.submission.aiAnalysis.percentage}% confidence
                    </span>
                  </div>
                </div>
                
                <Button
                  onClick={() => setShowAIAnalysisModal(true)}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Full Analysis Report
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  No AI analysis has been performed on this submission.
                </p>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-700">
                    AI analysis can help detect AI-generated content. This feature requires manual activation.
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Quick Information Panel */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Submission Details</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Student</span>
                </div>
                <span className="font-medium">{data.studentName}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Task ID</span>
                </div>
                <span className="font-medium text-xs">{data.id}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Deadline</span>
                </div>
                <span className="font-medium">{new Date(data.deadline).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Delivery Mode</span>
                </div>
                <Badge variant="outline" className="capitalize">
                  {data.deliveryMode}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Max Points</span>
                </div>
                <span className="font-medium">{data.maxPoints}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Submission Status</span>
                </div>
                <Badge variant={getStatusBadgeVariant(data.submission?.status || 'NOT_SUBMITTED')}>
                  {formatStatusText(data.submission?.status || 'Not Submitted')}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Task Status</span>
                </div>
                <Badge variant={data.isOverdue ? "destructive" : "default"}>
                  {data.isOverdue ? "Overdue" : "Active"}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <AIAnalysisModal />
    </div>
  );
}