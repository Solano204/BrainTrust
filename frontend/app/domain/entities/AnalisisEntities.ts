

import { AIProbability, AnalysisId, AnalysisStatus, ModelType, DetectedSegment, SubmissionId } from "../valueObjects";

export interface DetectionResult {
  probability: AIProbability;
  modelUsed: ModelType;
  analyzedContent: string;
  detectedSegments: DetectedSegment[];
  metadata: { [key: string]: any };
}

export interface AnalysisRequest {
  id: AnalysisId;
  submissionId: SubmissionId;
  contentToAnalyze: string;
  status: AnalysisStatus;
  result: DetectionResult | null;
  errorMessage: string | null;
  createdAt: string;
  analyzedAt: string | null;
}