export interface QuizDTO {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  availableFrom: string;
  availableUntil: string;
  timeLimitMinutes: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  totalPoints: number;
  questionCount: number;
  createdAt: string;
  active: boolean;
  availableNow: boolean;
}

export interface CompleteQuizDTO {
  id: string;
  courseId: string;
  courseName: string;
  unitId: string;
  title: string;
  description: string;
  availableFrom: string;
  availableUntil: string;
  timeLimitMinutes: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  totalPoints: number;
  questionCount: number;
  createdAt: string;
  allowSeeResults: boolean;
  totalScore: number;
  active: boolean;
  availableNow: boolean;
  questions: CompleteQuizQuestionDTO[];
}

export interface CompleteQuizQuestionDTO {
  id: string;
  questionText: string;
  questionType: string;
  points: number;
  options: QuestionOptionDTO[];
  correctAnswer: string;
}

export interface QuestionOptionDTO {
  text: string;
  correct: boolean;
}

/* =========================
   QUIZ SUBMISSIONS
========================= */

export interface SubmissionQuizDTO {
  id: string;
  quizId: string;
  studentId: string;
  courseId: string;
  submittedAt: string;
  score: number;
  maxScore: number;
  passed: boolean;
  answers: QuizAnswerDTO[];
  feedback?: string;
}

export interface QuizAnswerDTO {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  points: number;
}

export interface QuizSubmissionDTO {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  attemptNumber: number;
  startedAt: string;
  submittedAt: string;
  status: string;
  grade: GradeDTO;
  autoGraded: boolean;
  answers: QuizAnswerDTO[];
  timeExpired: boolean;
  teacherFeedback?: string;
}

export interface QuizSubmissionDetailDTO {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  attemptNumber: number;
  startedAt: string;
  submittedAt: string;
  status: string;
  grade: GradeDTO;
  autoGraded: boolean;
  questionResponses: QuestionResponseDTO[];
  timeExpired: boolean;
}

// DETAILS
export interface QuizSubmissionDetailDTONew {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  attemptNumber: number;
  startedAt: string;
  submittedAt: string;
  status: string;
  grade: {
    value: string;
    maxScore: string;
    percentage: string;
  } | null;
  finalGrade: number | null; // ✅ NEW from backend
  canViewResults: boolean; // ✅ NEW from backend
  autoGraded: boolean;
  questionResponses: GradedQuestionResponseDTO[];
  timeExpired: boolean;
  unitId: string;
  unitName: string;
}

export interface GradedQuestionResponseDTO {
  questionId: string;
  questionText: string;
  questionType: string;
  maxPoints: number; // ✅ FIXED: backend sends maxPoints (not points)
  earnedPoints: number; // ✅ FIXED: backend sends earnedPoints
  teacherFeedback: string;
  isAutoGraded: boolean;
  options: { text: string; correct: boolean }[];
  selectedOptions: number[];
  textAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface QuizSubmissionDetailForStudentDTO {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  attemptNumber: number;
  startedAt: string;
  submittedAt: string;
  status: string;
  grade: GradeDTO;
  autoGraded: boolean;
  canViewResults: boolean; // ✅ NEW — student can see answers/feedback
  finalGrade: number | null;
  questionResponses: GradedQuestionResponseDTO[];
  timeExpired: boolean;
  unitId: string;
  unitName: string;
}

export interface QuizSubmissionDetailForGradingDTO {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  attemptNumber: number;
  startedAt: string;
  submittedAt: string;
  status: string;
  grade: GradeDTO;
  autoGraded: boolean;
  questionResponses: GradedQuestionResponseDTO[];
  timeExpired: boolean;
  unitId: string;
  unitName: string;
}

export interface QuizSubmissionBasicDTO {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  status: string;
  submittedAt: string;
  attemptNumber: number;
}

export interface QuestionResponseDTO {
  questionId: string;
  questionText: string;
  questionType: string;
  points: number;
  options: QuestionOptionDTO[];
  selectedOptions: number[];
  textAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface GradedQuestionResponseDTO {
  questionId: string;
  questionText: string;
  questionType: string;
  maxPoints: number;
  earnedPoints: number;
  teacherFeedback: string;
  isAutoGraded: boolean;
  options: QuestionOptionDTO[];
  selectedOptions: number[];
  textAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface GradeDTO {
  value: string;
  maxScore: string;
  percentage: string;
}

/* =========================
   RESPONSE TYPES
========================= */

export interface SuccessResponseDTO {
  success: boolean;
  message: string;
  data: any;
}

export interface ErrorResponseDTO {
  success: false;
  message: string;
  error: string;
  timestamp: string;
}
