export type AssignmentId = string;
export type SubmissionId = string;
export type DeliveryMode = "INDIVIDUAL" | "TEAM";

export interface Assignment {
    id: AssignmentId;
    courseId: string;
    unitId: string;
    courseName: string;
    unitName: string;
    title: string;
    description: string;
    createdAt: string;
    dueDate: string;
    maxPoints: number;
    instructions: string;
    active: boolean;
    submissionCount: number;
    attachmentCount: number;
    canAcceptSubmissions: boolean;
    targetType: string;
    isTeamAssignment: boolean;
    attachments: Document[];
}

export interface Document {
    name: string;
    storagePath: string;
    createdAt?: string;
}

export interface Submission {
    id: SubmissionId;
    assignmentId: AssignmentId;
    studentId: string;
    studentName: string;
    content: string;
    attachments: Document[];
    deliveryMode: DeliveryMode;
    submittedAt: string;
    status: string;
    grade: Grade | null;
    teacherFeedback: string | null;
    aiAnalysis?: AIAnalysisData;
    isTeamSubmission?: boolean;
    teamName?: string;
    courseId: string;
}

export interface Grade {
    value: string;
    maxScore: string;
}

export interface AIAnalysisData {
    analysisId: string;
    probability: string;
    percentage: string;
    isLikelyAI: boolean;
    confidenceLevel: string;
    modelUsed: string;
    analyzedAt: string;
    segments?: AISegmentAnalysis[];
}

export interface AISegmentAnalysis {
    segmentId?: string;
    text: string;
    startIndex: number;
    endIndex: number;
    aiProbability?: string;
    probability?: string;
    percentage?: string;
    isLikelyAI: boolean;
    reasoning?: string;
}

export interface SubmissionTask {
    id: string;
    name: string;
    unit: string;
    instructions: string;
    maxPoints: number;
    deadline: string;
    deliveryMode: DeliveryMode;
    studentName: string;
    isOverdue: boolean;
    submission?: SubmissionData;
}

export interface SubmissionData {
    id: string;
    content: string;
    submittedAt: string;
    status: string;
    grade?: {
        value: string;
        maxScore: number;
    };
    teacherFeedback?: string;
    attachments: AttachmentData[];
    aiAnalysis?: AIAnalysisData;
    isTeamSubmission?: boolean;
    teamName?: string;
    teamMemberSubmissionIds?: string[];
}

export interface AttachmentData {
    name: string;
    storagePath: string;
}

export interface SubmissionAnalytics {
    totalSubmissions: number;
    gradedSubmissions: number;
    averageGrade: number;
    lateSubmissions: number;
    submissionRate: number;
}