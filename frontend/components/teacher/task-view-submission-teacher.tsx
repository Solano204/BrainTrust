
"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
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
  Download,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SubmissionTask } from "@/app/shared/models/assignment.model";

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
    if (!data.submission) return;
    onUpdateGrade({
      submissionId: data.submission.id,
      gradeValue,
      maxScore: data.maxPoints.toString(),
      feedback,
    });
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatShortDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "GRADED": return "default";
      case "SUBMITTED": return "secondary";
      case "LATE_SUBMITTED": return "destructive";
      case "NOT_SUBMITTED": return "outline";
      default: return "secondary";
    }
  };

  const formatStatusText = (status: string) =>
    status.replace("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());

  /* ─── AI Analysis Modal ─── */
  const AIAnalysisModal = () => {
    const analysis = data.submission?.aiAnalysis;
    if (!analysis) return null;

    const isAI = analysis.isLikelyAI;
    const aiSegments = analysis.segments?.filter((s) => s.isLikelyAI) ?? [];
    const humanSegments = analysis.segments?.filter((s) => !s.isLikelyAI) ?? [];
    const totalSegments = analysis.segments?.length ?? 0;

    const avgProbability =
      totalSegments > 0
        ? (
            (analysis.segments!.reduce(
              (sum, seg) => sum + parseFloat(seg.probability || "0"),
              0
            ) /
              totalSegments) *
            100
          ).toFixed(1)
        : "N/A";

    return (
      <Dialog open={showAIAnalysisModal} onOpenChange={setShowAIAnalysisModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-0 shadow-2xl">
          {/* Modal Header */}
          <div
            className={`px-8 py-6 rounded-t-2xl ${
              isAI
                ? "bg-gradient-to-r from-rose-600 to-red-500"
                : "bg-gradient-to-r from-emerald-600 to-teal-500"
            }`}
          >
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white/20 rounded-xl">
                    {isAI ? (
                      <Cpu className="h-6 w-6 text-white" />
                    ) : (
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div>
                    <DialogTitle className="text-white text-xl font-bold">
                      {isAI ? "AI-Generated Content Detected" : "Human-Written Content Confirmed"}
                    </DialogTitle>
                    <DialogDescription className="text-white/75 text-sm mt-0.5">
                      Analyzed on {formatDate(analysis.analyzedAt)}
                    </DialogDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAIAnalysisModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg h-8 w-8 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>
          </div>

          <div className="px-8 py-6 space-y-6 bg-white">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  icon: <Activity className="h-4 w-4 text-blue-500" />,
                  label: "AI Probability",
                  value: analysis.probability,
                  bg: "bg-blue-50",
                },
                {
                  icon: <BarChart3 className="h-4 w-4 text-violet-500" />,
                  label: "Confidence",
                  value: `${analysis.percentage}%`,
                  bg: "bg-violet-50",
                },
                {
                  icon: <Shield className="h-4 w-4 text-amber-500" />,
                  label: "Level",
                  value: analysis.confidenceLevel,
                  bg: "bg-amber-50",
                  capitalize: true,
                },
                {
                  icon: <Cpu className="h-4 w-4 text-slate-500" />,
                  label: "Model",
                  value: analysis.modelUsed,
                  bg: "bg-slate-50",
                },
              ].map((metric, i) => (
                <div
                  key={i}
                  className={`${metric.bg} rounded-xl p-4 flex flex-col gap-2`}
                >
                  <div className="flex items-center gap-1.5">
                    {metric.icon}
                    <span className="text-xs font-medium text-muted-foreground">
                      {metric.label}
                    </span>
                  </div>
                  <span
                    className={`text-lg font-bold leading-none ${
                      metric.capitalize ? "capitalize" : ""
                    }`}
                  >
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Segment Summary — only if segments exist */}
            {totalSegments > 0 && (
              <div className="grid grid-cols-3 gap-3">
                <div className="border rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-slate-800">{totalSegments}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total Segments</p>
                </div>
                <div className="border border-red-100 bg-red-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">{aiSegments.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">AI-Generated</p>
                </div>
                <div className="border border-emerald-100 bg-emerald-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{humanSegments.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Human-Written</p>
                </div>
              </div>
            )}

            {/* Segment Detail List */}
            {totalSegments > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Segment Breakdown
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {totalSegments} segments
                  </Badge>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {analysis.segments!.map((segment, index) => (
                    <div
                      key={index}
                      className={`rounded-xl border p-4 ${
                        segment.isLikelyAI
                          ? "bg-red-50 border-red-200"
                          : "bg-emerald-50 border-emerald-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {segment.isLikelyAI ? (
                            <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          )}
                          <span className="text-sm font-semibold text-slate-700">
                            Segment {index + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>
                            AI:{" "}
                            <strong>
                              {(
                                parseFloat(segment.aiProbability || "0") * 100
                              ).toFixed(1)}
                              %
                            </strong>
                          </span>
                          <span>
                            Pos: {segment.startIndex}–{segment.endIndex}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed bg-white/60 rounded-lg px-3 py-2 italic">
                        "{segment.text}"
                      </p>
                      {segment.reasoning && (
                        <p className="text-xs text-slate-500 mt-2 pl-1">
                          💡 {segment.reasoning}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis Reference */}
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" /> Analysis Reference ID
              </p>
              <code className="text-xs font-mono text-slate-600 break-all">
                {analysis.analysisId}
              </code>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 text-sm text-amber-800">
                  <p className="font-semibold">Important Considerations</p>
                  <ul className="space-y-1 text-xs text-amber-700 list-disc list-inside">
                    <li>AI detection tools may produce false positives or negatives.</li>
                    <li>Human content following predictable patterns may be flagged.</li>
                    <li>Use this as one signal — not the sole basis for decisions.</li>
                    <li>Compare with the student's prior writing style and submissions.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Close */}
            <div className="flex justify-end pt-2 border-t">
              <Button
                variant="outline"
                onClick={() => setShowAIAnalysisModal(false)}
                className="rounded-lg"
              >
                Close Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  /* ─── Main View ─── */
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
            {data.name} — Submission Review
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

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
            <Award className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Max: {data.maxPoints} pts</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
            <Calendar className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">
              Deadline: {formatShortDate(data.deadline)}
            </span>
          </div>
          <Badge
            variant={getStatusBadgeVariant(data.submission?.status || "NOT_SUBMITTED")}
            className="px-3 py-2"
          >
            {formatStatusText(data.submission?.status || "Not Submitted")}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Overview */}
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
                {[
                  { label: "Max Points", value: data.maxPoints },
                  { label: "Delivery Mode", value: data.deliveryMode, capitalize: true },
                  {
                    label: "Deadline",
                    value: new Date(data.deadline).toLocaleDateString(),
                  },
                  {
                    label: "Status",
                    value: (
                      <Badge variant={data.isOverdue ? "destructive" : "default"}>
                        {data.isOverdue ? "Overdue" : "Active"}
                      </Badge>
                    ),
                  },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    {typeof item.value === "string" || typeof item.value === "number" ? (
                      <p className={`text-lg font-bold ${item.capitalize ? "capitalize" : ""}`}>
                        {item.value}
                      </p>
                    ) : (
                      <div className="mt-1">{item.value}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Student Submission */}
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
                                {attachment.storagePath}
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
                            {isDownloadingAttachment ? "Downloading..." : "Download"}
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

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Grading */}
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
                    {data.submission?.grade ? "Update Grade" : "Submit Grade"}
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
                <div
                  className={`p-4 rounded-xl border ${
                    data.submission.aiAnalysis.isLikelyAI
                      ? "bg-red-50 border-red-200"
                      : "bg-emerald-50 border-emerald-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {data.submission.aiAnalysis.isLikelyAI ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      )}
                      <p className="text-sm font-semibold">
                        {data.submission.aiAnalysis.isLikelyAI
                          ? "AI Content Detected"
                          : "Human Content Confirmed"}
                      </p>
                    </div>
                    <Badge
                      variant={
                        data.submission.aiAnalysis.isLikelyAI ? "destructive" : "default"
                      }
                      className="text-xs"
                    >
                      {data.submission.aiAnalysis.percentage}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Analyzed: {formatShortDate(data.submission.aiAnalysis.analyzedAt)}
                  </p>
                </div>
                <Button
                  onClick={() => setShowAIAnalysisModal(true)}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Full Analysis
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  No AI analysis has been performed on this submission.
                </p>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-700">
                    AI analysis can help detect AI-generated content. This feature requires
                    manual activation.
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Submission Details */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Submission Details</h2>
            <div className="space-y-3">
              {[
                { icon: <User />, label: "Student", value: data.studentName },
                { icon: <Hash />, label: "Task ID", value: data.id, small: true },
                {
                  icon: <Calendar />,
                  label: "Deadline",
                  value: new Date(data.deadline).toLocaleDateString(),
                },
                {
                  icon: <File />,
                  label: "Delivery Mode",
                  value: (
                    <Badge variant="outline" className="capitalize">
                      {data.deliveryMode}
                    </Badge>
                  ),
                },
                { icon: <BarChart3 />, label: "Max Points", value: data.maxPoints },
                {
                  icon: <Clock />,
                  label: "Submission Status",
                  value: (
                    <Badge
                      variant={getStatusBadgeVariant(
                        data.submission?.status || "NOT_SUBMITTED"
                      )}
                    >
                      {formatStatusText(data.submission?.status || "Not Submitted")}
                    </Badge>
                  ),
                },
                {
                  icon: <Users />,
                  label: "Task Status",
                  value: (
                    <Badge variant={data.isOverdue ? "destructive" : "default"}>
                      {data.isOverdue ? "Overdue" : "Active"}
                    </Badge>
                  ),
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {React.cloneElement(item.icon as React.ReactElement, {
                      className: "h-4 w-4",
                    })}
                    <span className="text-sm">{item.label}</span>
                  </div>
                  {typeof item.value === "string" || typeof item.value === "number" ? (
                    <span
                      className={`font-medium ${item.small ? "text-xs" : ""}`}
                    >
                      {item.value}
                    </span>
                  ) : (
                    item.value
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <AIAnalysisModal />
    </div>
  );
}