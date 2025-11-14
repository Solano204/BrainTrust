// ----------------------------------------------------
// IDs (Value Objects - serialized as strings)
// ----------------------------------------------------
/** Represents com.braintrust.identity.domain.valueobjects.UserId */
export type UserId = string;
/** Represents com.braintrust.education.domain.valueobjects.AssignmentId */
export type AssignmentId = string;

export type PageId = string;
/** Represents com.braintrust.education.domain.valueobjects.CourseId */
export type CourseId = string;
/** Represents com.braintrust.education.domain.valueobjects.UnitId */
export type UnitId = string;
/** Represents com.braintrust.education.domain.valueobjects.EnrollmentId */
export type EnrollmentId = string;
/** Represents com.braintrust.education.domain.valueobjects.SubmissionId */
export type SubmissionId = string;
export type calificationId = string;
/** Represents com.braintrust.education.domain.valueobjects.CourseCode */
export type CourseCode = string;
export type QuizId = string;
export type QuestionId = string;


// ----------------------------------------------------
// Complex Value Objects
// ----------------------------------------------------
/** Represents com.braintrust.education.domain.valueobjects.Document */
export interface Document {
  name: string;
  storagePath: string;
  /** Java: LocalDateTime, serialized to ISO 8601 string */
  createdAt: string; 
}

/** Represents com.braintrust.education.domain.valueobjects.Score (used for max points) */
export interface Score {
  value: number; // Java: int
  maxPoints: number; // Java: int
}

/** Represents com.braintrust.education.domain.valueobjects.Grade (used for final grades) */
export interface Grade {
  /** Java: BigDecimal, serialized as string or number (using string for precision) */
  value: number; 
  /** Java: BigDecimal, serialized as string or number */
  maxScore: number; 
}
export interface GradeEnrollment {
  /** Java: BigDecimal, serialized as string or number (using string for precision) */
  value: string; 
  /** Java: BigDecimal, serialized as string or number */
  maxScore: string; 
}


export interface Option {
  /** Unique ID for the option (used in correctAnswer). */
  id: string; 
  /** The text of the choice. */
  text: string;
}





// ----------------------------------------------------
// Enums
// ----------------------------------------------------
/** Represents com.braintrust.education.domain.model.SubmissionStatus */
export type SubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'LATE_SUBMITTED' | 'GRADED' | 'RETURNED' | 'REJECTED';

/** Represents com.braintrust.education.domain.model.EnrollmentStatus */
export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

/** Represents com.braintrust.education.domain.model.DocumentType */
export type DocumentType = 'INSTRUCTION' | 'SUBMISSION' | 'MATERIAL';