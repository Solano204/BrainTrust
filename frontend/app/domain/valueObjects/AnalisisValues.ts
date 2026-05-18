

export type AnalysisId = string;

export type SubmissionId = string;

export type AnalysisStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface ModelType {
  displayName: string;
  version: string;
}

export interface AIProbability {
  value: string;

}

export interface DetectedSegment {
  text: string;
  startIndex: number;
  endIndex: number;
  aiProbability: string;
  reason: string;
}

export interface DocumentMetadata {
  originalFilename: string;
  storagePath: string;
  dateCreated: string;
}