

export interface Question {
  id: string;
  type: "multiple-choice" | "open-ended" | "true-false";
  text: string;
  maxPoints: number;
  question: string;
  options?: string[];
  correctAnswer?: number;
  points: number;
  expectedAnswer?: string;
}

export interface QuizInventoryItem {
  id: string;
  quizId: string;
  title: string;
  unit: string;
  type: "QUIZ";
  courseId: string;
  deadline: string;
  isOverdue: boolean;
  studentId: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  courseID: string;
  studentId: string;
  content: string;
  attachments: DocumentDTO[];
  submittedAt: string;
  status: "DRAFT" | "SUBMITTED" | "GRADED" | "RETURNED" | "LATE_SUBMITTED";
  grade: Grade | null;
  teacherFeedback: string | null;
}

export interface SubmissionQuiz {
  id: string;
  quizId: string;
  studentId: string;
  courseId: string;
  studentName: string;
  content: string;
  submittedAt: string;
  status: "DRAFT" | "SUBMITTED" | "GRADED" | "RETURNED" | "LATE_SUBMITTED";
  grade: Grade | null;
  teacherFeedback: string | null;
  quizData?: QuizData;
}

export interface QuizData {
  answers: QuizAnswer[];
  timeSpent: number;
  totalScore: number;
  maxScore: number;
}

export interface QuizAnswer {
  questionId: string;
  questionText: string;
  questionType: string;
  studentAnswer: string | number;
  correctAnswer: string | number;
  points: number;
  maxPoints: number;
  isCorrect?: boolean;
  feedback?: string;
}

export interface Grade {
  value: number;
  maxScore: number;
}

export interface DocumentDTO {
  name: string;
  storagePath: string;
  createdAt: string;
}

export interface CreateQuizRequest {
  title: string;
  description: string;
  courseUnitId: string;
  courseId: string;
  maxGrade: number;
  timeLimit: number;
  passingScore: number;
  dueDate: string;
  acceptLateSubmissions: boolean;
  questions: Omit<Question, "id">[];
}

export interface UpdateQuizRequest {
  title?: string;
  description?: string;
  maxGrade?: number;
  timeLimit?: number;
  passingScore?: number;
  dueDate?: string;
  acceptLateSubmissions?: boolean;
  questions?: Question[];
}

export interface SubmitQuizRequest {
  studentId: string;
  answers: Array<{
    questionId: string;
    answer: string | number;
  }>;
  timeSpent?: number;
}

export interface GradeQuizRequest {
  grades: Array<{
    questionId: string;
    score: number;
    feedback?: string;
  }>;
}

export interface QuizStats {
  totalSubmissions: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  completionRate: number;
}

export type CourseId = string;
export type UserId = string;
export type QuizId = string;
export type QuestionId = string;
export type SubmissionId = string;