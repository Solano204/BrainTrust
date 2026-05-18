export interface AssignmentDTO {
    id: string;
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
    attachments: DocumentDTO[];
}

export interface DocumentDTO {
    name: string;
    storagePath: string;
}

export interface SubmissionDTO {
    id: string;
    assignmentId: string;
    type?: string;
    deliveryMode?: string;
    assignmentTitle: string;
    assignmentInstructions: string;
    assignmentMaxPoints: number;
    assignmentDeadline: string;
    unitId: string;
    unitName: string;
    studentId: string;
    studentName: string;
    content?: string;
    status: string;
    grade: GradeDTO | null;
    teacherFeedback: string | null;
    submittedAt: string;
    isLate: boolean;
    attachments: DocumentDTO[];
    aiAnalysis: AIDetectionResultDTO | null;
    aiSegments?: AISegmentAnalysis[];
    teamId: string | null;
    teamName: string | null;
    isTeamSubmission: boolean;
}

export interface SubmissionBasicDTO {
    id: string;
    assignmentId: string;
    assignmentTitle: string;
    studentId: string;
    studentName: string;
    status: string;
    submittedAt: string;
    gradeValue: string;
    gradeMaxScore: string;
    isTeamSubmission: boolean;
    teamId: string;
}

export interface GradeDTO {
    value: string;
    maxScore: string;
    percentage: string;
}

export interface AIDetectionResultDTO {
    analysisId: string;
    submissionId?: string;
    aiProbability?: string;
    probability?: string;
    aiPercentage?: string;
    percentage?: string;
    modelUsed: string;
    confidenceLevel: string;
    likelyAI?: boolean;
    isLikelyAI?: boolean;
    uncertain?: boolean;
    likelyHuman?: boolean;
    status?: string;
    analyzedAt: string;
    errorMessage?: string | null;
    detectedSegments?: AISegmentAnalysis[];
    segments?: AISegmentAnalysis[];
    metadata?: Record<string, any>;
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

export interface SuccessResponseDTO {
    success: boolean;
    message: string;
    data: any;
}

export interface SubmissionAnalyticsDTO {
    totalSubmissions: number;
    gradedSubmissions: number;
    averageGrade: number;
    lateSubmissions: number;
    submissionRate: number;
}

export interface FrontendDocumentDTO {
    originalFilename: string;
    fileSize?: number;
    mimeType?: string;
    fileHash?: string;
    uploadedUrl?: string;
    extractedText?: string;
}