export interface Page {
  id: PageId;
  title: string;
  sectionContent: string;
  courseId: CourseId;
  unitId: CourseId;
  createdAt: string;
  attachments: Document[];
  urlsSupport: string[];
}

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
  GradeEnrollment,
} from "../valueObjects/CourseValues";
import { ComponentType } from "react";
import { GroupMemberDTO } from "@/components/teacher-student/api/group";
import { GradeDTO } from "@/components/student/api/enrollment";
import { submissionFormat } from "@/components/teacher-student/api/task-teacher";


export interface CourseUnit {
  id: UnitId;
  courseId: CourseId;
  name: string;
  urlImage: string | null;
  numUnity: number;
  description: string;
  resources: UnitResource[];
}


type  TypeTask = "INDIVIDUAL" | "TEAM";
export interface Submission {
  id: SubmissionId;
  assignmentId: AssignmentId;
  studentId: UserId;
  content: string;
  attachments: Document[];
  courseID:  CourseId;
  submittedAt: string;
  status: SubmissionStatus;
  grade: Grade | null;
  type: TypeTask
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
  };
  total: number | 0;
}

export interface Assignment {
  id: AssignmentId;
  title: string;
  courseId: CourseId;
  unitId: CourseId;
  description: string;
    submissionFormat: submissionFormat

  createdAt: string;
  urls: string[];
  attachments: Document[];
  links: string[];
  deliveryMode: deliveryMode;
  dueDate: string | null;
  maxScore: Score;
  instructions: string;
  submissions: Submission[];
  allowLateSubmissions: boolean;
  idUser: UserId;
}

export type deliveryMode = "TEAM" | "INDIVIDUAL";


export interface Enrollment {
  id: EnrollmentId;
  courseId: CourseId;
  studentId: UserId;
  enrollmentDate: string;
    status: string,
    studentName: string,
    studentEmail: string,
    studentRefId: string,
    finalGrade: GradeDTO | null
}

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
  enrollments: Enrollment[] | [];
  units: CourseUnit[] | [];
}

export interface Team {
  courseId: CourseId;
  teamId: TeamId;
  name: string;
  description: string;
  members: Set<GroupMemberDTO>;
  active: boolean;
  createdAt: Date;
}
export interface TeamWithIds {
  courseId: CourseId;
  teamId: TeamId;
  name: string;
  description: string;
  members: Set<UserId>;
  active: boolean;
  createdAt: Date;
}



export interface TeamWithMembers {
  courseId: CourseId;
  name: string;
  description: string;
  leaderId: UserId | null;
  members: Set<string>;
  active: boolean;
  createdAt: Date;
}


export interface Question {
  id: QuestionId;
  type: "multiple-choice" | "open-ended";
  text: string;
  maxPoints: number;

  question: string;
  options?: string[];
  correctAnswer?: number;
  points: number;

  expectedAnswer?: string;
}


export interface Quiz {
  id: QuizId;
  description: string;
  courseUnitId: UnitId;
  courseId: CourseId;
  title: string;
  maxGrade: number;
  timeLimit: number;
  dueDate: string | null;
  questions: Question[];
  acceptLateSubmissions: boolean;
  idUser?: UserId;

  availableFrom?: string;
  availableUntil?: string;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  showCorrectAnswers?: boolean;
  totalPoints?: number;
  questionCount?: number;
  createdAt?: string;
  active?: boolean;
  availableNow?: boolean;
  courseName?: string;
  unitName?: string;
  allowSeeResults: boolean;
}



export type CourseResourceType = "ASSIGNMENT" | "QUIZ" | "PAGE"; // Added PAGE for general content

export interface ResourceItem {
  id: string;
  name: string;
  description: string;
  type: CourseResourceType;
  icon: ComponentType;
}

export type UnitResource = Page | Assignment | Quiz;

export interface QuizAnswers {
  [questionId: string]: {
    answer: string | number;
    type: "multiple-choice" | "open-ended";
    timeSpent?: number;
    flagged?: boolean;
  };
}


export type QuestionType = "multiple-choice" | "open-ended";
export interface QuizAnswer {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  studentAnswer: string | number;
  correctAnswer?: string | number;
  points: number;
  maxPoints: number;
  isCorrect?: boolean;
  feedback?: string;
}

export interface SubmissionQuiz {
  id: SubmissionId;
  courseId: CourseId;
  quizId: QuizId;
  studentId: UserId;
  studentName: string;
  content: string;
  submittedAt: string;
  status: SubmissionStatus;
  grade: { value: number; maxScore: number } | null;
  teacherFeedback: string | null;
  quizData?: {
    answers: QuizAnswer[];
    timeSpent: number;
    totalScore: number;
    maxScore: number;
  };
}

export interface TaskInventoryItem {
  id: SubmissionId;
  taskId: AssignmentId;
  title: string;
  courseId: CourseId;
  studentId: UserId;
  unit: string;
  type: TaskType;
  deadline: string;
  isOverdue: boolean;
}

export interface QuizInventoryItem {
  id: SubmissionId;
  quizId: QuizId;
  courseId: CourseId;
  studentId: UserId;
  unit: string;
  type: TaskType;
  deadline: string;
  isOverdue: boolean;
}



export interface SubmissionDetailData {
  submission: {
    id: SubmissionId;
    content: string;
    submittedAt: string;
    status: SubmissionStatus;
    attachments: Document[];
    grade: Grade | null;
    teacherFeedback: string | null;
  };

  task: {
    id: AssignmentId;
    title: string;
    maxPoints: number;
    instructions: string;
  };

  student: {
    id: UserId;
    name: string;
    avatarUrl: string;
  };
  
  aiAnalysis: AnalysisRequest;
}
export type AnalysisRequest = {
  status: "PENDING" | "COMPLETED" | "FAILED";
  result: any | null;
};
export type TaskType = "ASSIGNMENT" | "QUIZ" 
