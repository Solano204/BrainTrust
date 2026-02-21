
export type UserId = string;
export type AssignmentId = string;

export type PageId = string;
export type CourseId = string;
export type UnitId = string;
export type EnrollmentId = string;
export type SubmissionId = string;
export type calificationId = string;
export type CourseCode = string;
export type QuizId = string;
export type QuestionId = string;



export interface Document {
  name: string;
  storagePath: string;
  createdAt: string;
}

export interface Score {
  value: number;
  maxPoints: number;
}

export interface Grade {
  value: number;
  maxScore: number;
}
export interface GradeEnrollment {
  value: string;
  maxScore: string;
}


export interface Option {
  id: string;
  text: string;
}


export type SubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'LATE_SUBMITTED' | 'GRADED' | 'RETURNED' | 'REJECTED';

export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

 export type DocumentType = 'INSTRUCTION' | 'SUBMISSION' | 'MATERIAL';