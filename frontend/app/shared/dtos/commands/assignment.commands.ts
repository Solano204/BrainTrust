import { FrontendDocumentDTO } from "@/app/shared/dtos/assignment.dto";

export interface SubmitAssignmentCommand {
    assignmentId: string;
    studentId: string;
    content: string;
    attachments: File[];
}

export interface SubmitTeamAssignmentCommand {
    assignmentId: string;
    groupId: string;
    studentSenderId: string;
    content: string;
    attachments: File[];
}

export interface SubmitAssignmentFrontendDTO {
    assignmentId: string;
    studentId: string;
    content: string;
    frontendDocuments?: FrontendDocumentDTO[];
}

export interface SubmitTeamAssignmentFrontendDTO {
    assignmentId: string;
    groupId: string;
    studentSenderId: string;
    content: string;
    frontendDocuments?: FrontendDocumentDTO[];
}

export interface GradeSubmissionCommand {
    submissionId: string;
    gradeValue: string;
    maxScore: string;
    feedback: string;
}