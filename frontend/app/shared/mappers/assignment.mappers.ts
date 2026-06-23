import {
    AssignmentDTO,
    SubmissionDTO,
    FrontendDocumentDTO,
} from "@/app/shared/dtos/assignment.dto";

import {
    SubmitAssignmentFrontendDTO,
    SubmitTeamAssignmentFrontendDTO,
} from "@/app/shared/dtos/commands/assignment.commands";

import {
    Assignment,
    Submission,
    SubmissionTask,
    DeliveryMode,
    Grade,
    AIAnalysisData,
} from "@/app/shared/models/assignment.model";

import { getPdfContent, uploadDocumentFile } from "@/app/utils/cloudinary/cloudinary-pdf";

export function mapAssignmentFromBackend(dto: AssignmentDTO): Assignment {
    return {
        id: dto.id,
        courseId: dto.courseId,
        unitId: dto.unitId,
        courseName: dto.courseName,
        unitName: dto.unitName,
        title: dto.title,
        description: dto.description,
        createdAt: dto.createdAt,
        dueDate: dto.dueDate,
        maxPoints: dto.maxPoints,
        instructions: dto.instructions,
        active: dto.active,
        submissionCount: dto.submissionCount,
        attachmentCount: dto.attachmentCount,
        canAcceptSubmissions: dto.canAcceptSubmissions,
        targetType: dto.targetType,
        isTeamAssignment: dto.isTeamAssignment,
        attachments: dto.attachments.map(att => ({
            name: att.name,
            storagePath: att.storagePath,
        })),
    };
}

export function mapSubmissionFromBackend(dto: SubmissionDTO): Submission {
    const mappedGrade: Grade | null = dto.grade
        ? {
            value: dto.grade.value.toString(),
            maxScore: dto.grade.maxScore.toString(),
        }
        : null;

    const aiAnalysis = dto.aiAnalysis ? {
        analysisId: dto.aiAnalysis.analysisId,
        probability: dto.aiAnalysis.aiProbability || dto.aiAnalysis.probability || "",
        percentage: dto.aiAnalysis.aiPercentage || dto.aiAnalysis.percentage || "",
        isLikelyAI: dto.aiAnalysis.likelyAI || dto.aiAnalysis.isLikelyAI || false,
        confidenceLevel: dto.aiAnalysis.confidenceLevel,
        modelUsed: dto.aiAnalysis.modelUsed,
        analyzedAt: dto.aiAnalysis.analyzedAt,
        segments: dto.aiSegments || dto.aiAnalysis.segments || dto.aiAnalysis.detectedSegments,
    } : undefined;

    return {
        id: dto.id,
        assignmentId: dto.assignmentId,
        courseId: dto.assignmentId,
        studentId: dto.studentId,
        studentName: dto.studentName,
        content: dto.content || "",
        attachments: dto.attachments.map(att => ({
            name: att.name,
            storagePath: att.storagePath,
            createdAt: dto.submittedAt,
        })),
        deliveryMode: (dto.type || dto.deliveryMode || "INDIVIDUAL") as DeliveryMode,
        submittedAt: dto.submittedAt,
        status: dto.status,
        grade: mappedGrade,
        teacherFeedback: dto.teacherFeedback,
        aiAnalysis,
        isTeamSubmission: dto.isTeamSubmission,
        teamName: dto.teamName || undefined,
    };
}

export function mapSubmissionToTask(submission: SubmissionDTO & { _teamMemberIds?: string[] }): SubmissionTask {
    const deadline = submission.assignmentDeadline || new Date().toISOString();
    const isOverdue = new Date(deadline) < new Date() &&
        submission.status !== 'GRADED' &&
        submission.status !== 'RETURNED';

    const maxPoints = submission.assignmentMaxPoints || 100;
    const deliveryMode = (submission.type || submission.deliveryMode || 'INDIVIDUAL') as DeliveryMode;

    const aiAnalysis = submission.aiAnalysis ? {
        analysisId: submission.aiAnalysis.analysisId,
        probability: submission.aiAnalysis.aiProbability || submission.aiAnalysis.probability || "",
        percentage: submission.aiAnalysis.aiPercentage || submission.aiAnalysis.percentage || "",
        isLikelyAI: submission.aiAnalysis.likelyAI || submission.aiAnalysis.isLikelyAI || false,
        confidenceLevel: submission.aiAnalysis.confidenceLevel,
        modelUsed: submission.aiAnalysis.modelUsed,
        analyzedAt: submission.aiAnalysis.analyzedAt,
        segments: submission.aiSegments || submission.aiAnalysis.segments || submission.aiAnalysis.detectedSegments,
    } : undefined;

    return {
        id: submission.assignmentId,
        name: submission.assignmentTitle,
        studentName: submission.isTeamSubmission && submission.teamName
            ? submission.teamName
            : submission.studentName,
        unit: submission.unitName,
        instructions: submission.assignmentInstructions || 'No instructions provided',
        maxPoints: maxPoints,
        deadline: deadline,
        isOverdue: isOverdue,
        deliveryMode: deliveryMode,
        submission: {
            id: submission.id,
            content: submission.content || '',
            submittedAt: submission.submittedAt,
            status: submission.status,
            grade: submission.grade ? {
                value: submission.grade.value,
                maxScore: parseInt(submission.grade.maxScore) || maxPoints,
            } : undefined,
            teacherFeedback: submission.teacherFeedback || undefined,
            attachments: submission.attachments?.map(att => ({
                name: att.name,
                storagePath: att.storagePath,
            })) || [],
            aiAnalysis: aiAnalysis,
            isTeamSubmission: submission.isTeamSubmission,
            teamName: submission.teamName || undefined,
            teamMemberSubmissionIds: submission._teamMemberIds,
        },
    };
}

/* =========================
   FILE PROCESSING HELPERS
========================= */

async function processFile(
    file: File,
    folder: string = "assignments"
): Promise<FrontendDocumentDTO> {
    const isPdf = true
    let extractedText: string | undefined;

    if (isPdf) {
        try {
            extractedText = await getPdfContent(file);
            console.log(`Extracted ${extractedText.length} characters from ${file.name}`);
            console.log(`EXTRACTED TEXT $ ${extractedText}`);
        } catch (error) {
            console.error(`Failed to extract text from ${file.name}:`, error);
        }
    }
    

    const uploadResult = await uploadDocumentFile(file, folder);

    return {
        originalFilename: file.name,
        uploadedUrl: uploadResult.url,
        extractedText: extractedText,
    };
}

async function processAttachments(
    attachments: File[],
    assignmentId: string
): Promise<FrontendDocumentDTO[]> {
    if (!attachments || attachments.length === 0) {
        return [];
    }

    const folder = `assignments/${assignmentId}`;
    const processedDocuments = await Promise.all(
        attachments.map(file => processFile(file, folder))
    );

    return processedDocuments;
}

export async function mapIndividualSubmissionToFrontendDTO(params: {
    assignmentId: string;
    studentId: string;
    content: string;
    attachments: File[];
}): Promise<SubmitAssignmentFrontendDTO> {
    const frontendDocuments = await processAttachments(
        params.attachments,
        params.assignmentId
    );

    return {
        assignmentId: params.assignmentId,
        studentId: params.studentId,
        content: params.content,
        frontendDocuments: frontendDocuments.length > 0 ? frontendDocuments : undefined,
    };
}

export async function mapTeamSubmissionToFrontendDTO(params: {
    assignmentId: string;
    studentId: string;
    content: string;
    attachments: File[];
    groupId: string;
}): Promise<SubmitTeamAssignmentFrontendDTO> {
    
    const frontendDocuments = await processAttachments(
        params.attachments,
        params.assignmentId
    );

    return {
        assignmentId: params.assignmentId,
        groupId: params.groupId,
        studentSenderId: params.studentId,
        content: params.content,
        frontendDocuments: frontendDocuments.length > 0 ? frontendDocuments : undefined,
    };
}