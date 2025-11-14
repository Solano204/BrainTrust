// If that still fails, you must explicitly name the exports:
export type {
    // Education Types (from CourseValues)
    AssignmentId,CourseCode,CourseId,Document,EnrollmentId,EnrollmentStatus,Grade,Score,SubmissionId,SubmissionStatus,UnitId,DocumentType

    // ... all other types from that file
} from './CourseValues';


export type {
    AIProbability, AnalysisId, AnalysisStatus, ModelType, DetectedSegment, DocumentMetadata
} from './AnalisisValues';

export type { Email, PersonId, Address,UserId} from './IdentityValues';