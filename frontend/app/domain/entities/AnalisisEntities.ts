// ----------------------------------------------------
// ENTITIES
// ----------------------------------------------------

import { AIProbability, AnalysisId, AnalysisStatus, ModelType, DetectedSegment, SubmissionId } from "../valueObjects";

/** Represents com.braintrust.aidetectition.domain.valueobjects.DetectionResult */
export interface DetectionResult {
  probability: AIProbability;
  modelUsed: ModelType;
  analyzedContent: string;
  detectedSegments: DetectedSegment[];
  metadata: { [key: string]: any };
}

/** Represents com.braintrust.aidetectition.domain.model.AnalysisRequest (Aggregate Root) */
export interface AnalysisRequest {
  id: AnalysisId;
  submissionId: SubmissionId;
  contentToAnalyze: string;
  status: AnalysisStatus;
  result: DetectionResult | null; // Nullable until analysis is COMPLETED
  errorMessage: string | null;
  /** Java: LocalDateTime, serialized to ISO 8601 string */
  createdAt: string; 
  /** Java: LocalDateTime, serialized to ISO 8601 string */
  analyzedAt: string | null;
}