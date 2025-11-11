// ----------------------------------------------------
// ENTITIES
// ----------------------------------------------------

import { LucideIcon } from "lucide-react";
import {
  CourseId,
  UnitId,
  UserId,
  AssignmentId,
  EnrollmentId,
  SubmissionId,
  SubmissionStatus,
  CourseCode,
  Document,
  Grade,
  Score,
  EnrollmentStatus,
} from "../valueObjects";
import {
  PageId,
  QuestionId,
  QuizId,
  Option,
  calificationId,
} from "../valueObjects/CourseValues";
import { ComponentType } from "react";

/** Represents com.braintrust.education.domain.model.CourseUnit */
export interface CourseUnit {
  id: UnitId;
  courseId: CourseId;
  name: string;
  urlImage: string | null;
  numUnity: number; // Maps to Java's numUnity / order
  description: string;
  resources: UnitResource[];
}

/** Represents com.braintrust.education.domain.model.Submission */
export interface Submission {
  id: SubmissionId;
  assignmentId: AssignmentId;
  studentId: UserId;
  content: string;
  attachments: Document[];
  /** Java: LocalDateTime, serialized to ISO 8601 string */
  submittedAt: string;
  status: SubmissionStatus;
  grade: Grade | null;
  teacherFeedback: string | null;
}

export interface calificationStudent {
  id: calificationId;
  student: {
    studentId: UserId;
    nameStudent: string;
    taskId: SubmissionId;
    calification: number;
  };
  task: {
    id: AssignmentId;
    nameTask: string;
    maxPoints: number | 0;
    unitId: UnitId;
    unitName: string;
    CourseId: CourseId;
    
  }
  total: number | 0;
}
/** Represents com.braintrust.education.domain.model.Assignment (Aggregate Root) */
export interface Assignment {
  id: AssignmentId;
  title: string;
  courseId: CourseId; 
  unitId: CourseId;
  description: string;
  /** Java: LocalDateTime, serialized to ISO 8601 string */
  createdAt: string;
  urls: string[];
  attachments: Document[];
  links: string[];
  deliveryMode: deliveryMode;
  /** Java: LocalDateTime, serialized to ISO 8601 string */
  dueDate: string | null;
  maxScore: Score;
  instructions: string;
  submissions: Submission[];
  allowLateSubmissions: boolean;
}

export type deliveryMode = "GROUP" | "INDIVIDUAL"; // Added PAGE for general content

export interface Page {
  id: PageId;
  title: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  sectionTitle: string;
  sectionContent: string;
  courseId: CourseId;
  unitId: CourseId;
  createdAt: string;
  attachments: Document[];
  urlsSupport: string[];
  /** Java: LocalDateTime, serialized to ISO 8601 string */
}

/** Represents com.braintrust.education.domain.model.Enrollment */
export interface Enrollment {
  id: EnrollmentId;
  courseId: CourseId;
  studentId: UserId;
  /** Java: LocalDate, serialized to ISO 8601 date string (YYYY-MM-DD) */
  enrollmentDate: string;
  status: EnrollmentStatus;
  grade: Grade | null;
}

/** * Represents com.braintrust.education.domain.model.Course (Aggregate Root)
 * This is the main type for your CourseData object.
 */
export interface Course {
  id: CourseId;
  code: CourseCode;
  name: string;
  description: string;
  urlImage: string | null;
  grade: string;
  group: string;
  teacherId: UserId;
  active: boolean;
  /** Set of Enrollments (Set on Java side, usually array on frontend) */
  enrollments: Enrollment[] |  [];
  /** List of CourseUnits */
  units: CourseUnit[] | [];
}




export interface Team {
  courseId: CourseId;
  name: string;
  description: string;
  leaderId: UserId | null;  // Team leader (optional)
  members: Set<UserId>;
  maxMembers: number;
  active: boolean;
  createdAt: Date;
}

export interface TeamWithMembers {
  courseId: CourseId;
  name: string;
  description: string;
  leaderId: UserId | null;  // Team leader (optional)
  members: Set<string>;
  active: boolean;
  createdAt: Date;
}



/** Represents the instructional content page or lesson for a unit. */

/** Represents a single question within a quiz. */
export interface Question {
  /** Unique ID for the specific question (allows reuse). */
  id: QuestionId;
  /** Defines the question format: "OPEN_ENDED" or "CLOSED_CHOICE". */
  type: "multiple-choice" | "open-ended";
  /** The question prompt itself. */
  text: string;
  /** Points awarded for a correct answer. */
  maxPoints: number;

  question: string;
  options?: string[];
  correctAnswer?: number;
  points: number;

  // --- Attributes specific to CLOSED_CHOICE ---
  /** Array of choices (only required for CLOSED_CHOICE). */
  /** ID(s) or index(es) of the correct option(s) (only required for CLOSED_CHOICE). */
  // --- Attributes specific to OPEN_ENDED ---
  /** A reference/model answer for manual or AI grading (only required for OPEN_ENDED). */
  expectedAnswer?: string;
}

/** Represents a collection of questions used for assessment. */
export interface Quiz {
  /** Unique identifier for the quiz. */
  id: QuizId;
  description: string;
  /** Link back to the parent course unit. */
  courseUnitId: UnitId;
  courseId: CourseId; 

  /** Name of the quiz (e.g., "UCD Fundamentals Quiz"). */
  title: string;
  /** Maximum number of times a student can take the quiz. */
  maxGrade: number;
  /** Time limit in minutes (or seconds). */
  timeLimit: number;
  /** Percentage required to pass (e.g., 70). */
  passingScore: number;

  dueDate: string | null;
  /** Array of Question objects. */
  questions: Question[];
  acceptLateSubmissions: boolean;
}

// Define the TypeScript ENUM/Union Type for resource categories
export type CourseResourceType = "ASSIGNMENT" | "QUIZ" | "PAGE"; // Added PAGE for general content

/**
 * Interface representing a selectable item in the ResourceTypeSelector component.
 */
export interface ResourceItem {
  id: string; // The selector key (e.g., 'task', 'quiz')
  name: string;
  description: string;
  type: CourseResourceType;
  icon: ComponentType; // 💡 Now includes the icon component directly
}

export type UnitResource = Page | Assignment | Quiz;
