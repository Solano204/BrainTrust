// If that still fails, you must explicitly name the exports:
export type {
    // Education Types (from CourseValues)
    Course,
    CourseUnit,
    Submission,
    Assignment,
    Enrollment,

    // ... all other types from that file
} from './CourseEntities';

export type {
    // AI Detection Types (from AnalisisValues)
    AnalysisRequest,DetectionResult
    // ... all other types from that file
} from './AnalisisEntities';

export type { Role, Person, User} from './IdentityEntities';