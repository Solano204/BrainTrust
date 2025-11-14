// ----------------------------------------------------
// IDs and Enums
// ----------------------------------------------------
/** Represents com.braintrust.aidetectition.domain.valueobjects.AnalysisId */
export type AnalysisId = string;
/** Represents com.braintrust.aidetectition.domain.valueobjects.SubmissionId */
// NOTE: SubmissionId should be imported from the Education domain if needed elsewhere, 
// but is defined here for completeness of the AI Detection context.
export type SubmissionId = string;

/** Represents com.braintrust.aidetectition.domain.model.AnalysisStatus */
export type AnalysisStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

/** Represents com.braintrust.aidetectition.domain.valueobjects.ModelType */
export interface ModelType {
  displayName: string;
  version: string;
}

// ----------------------------------------------------
// Value Objects
// ----------------------------------------------------
/** Represents com.braintrust.aidetectition.domain.valueobjects.AIProbability */
export interface AIProbability {
  /** Java: BigDecimal, represented as a string or number (string is safer for precision) */
  value: string; // Range 0.0 to 1.0
  // Note: getPercentage, isLikelyAI, etc., are domain logic and not included here.
}

/** Represents com.braintrust.aidetectition.domain.model.DetectedSegment */
export interface DetectedSegment {
  text: string;
  startIndex: number; // Java: int
  endIndex: number; // Java: int
  /** Java: BigDecimal, represented as a string */
  aiProbability: string; // Range 0.0 - 1.0
  reason: string; // Why this segment was flagged
}

/** Represents com.braintrust.aidetectition.domain.model.DocumentMetadata */
export interface DocumentMetadata {
  originalFilename: string;
  storagePath: string;
  /** Java: LocalDateTime, serialized to ISO 8601 string */
  dateCreated: string; 
}