export type QuizId = string;
export type QuestionId = string;
export type QuizSubmissionId = string;
export type QuestionType = "multiple-choice" | "open-ended";

/* =========================
   QUIZ MODELS
========================= */

export interface Quiz {
    id: QuizId;
    title: string;
    description: string;
    timeLimit: number;
    maxGrade: number;
    dueDate?: string;
    acceptLateSubmissions: boolean;
    courseId: string;
    courseUnitId: string;
    questions: Question[];
    availableFrom: string;
    availableUntil: string;
    maxAttempts: number;
    shuffleQuestions: boolean;
    showCorrectAnswers: boolean;
    totalPoints: number;
    questionCount: number;
    allowSeeResults: boolean;
    totalScore: number;
    courseName: string;
    createdAt: string;
    active: boolean;
    availableNow: boolean;
}

export interface Question {
    id: QuestionId;
    type: QuestionType;
    question: string;
    points: number;
    text: string;
    maxPoints: number;
    options?: string[];
    correctAnswer?: number;
    expectedAnswer?: string;
}

/* =========================
   QUIZ SUBMISSION MODELS
========================= */

export interface SubmissionQuiz {
    id: string;
    quizId: QuizId;
    studentId: string;
    courseId: string;
    submittedAt: string;
    score: number;
    maxScore: number;
    passed: boolean;
    answers: QuizAnswer[];
    feedback?: string;
    studentName?: string;
}

export interface QuizAnswer {
    questionId: QuestionId;
    selectedAnswer: string;
    isCorrect: boolean;
    points: number;
}

export interface StudentSubmissionQuiz {
    id: string;
    title: string;
    maxGrade: number;
    isOverdue: boolean;
    studentId: string;
    unitId: string;
    studentName: string;
    submission?: {
        id: string;
        status: string;
        submittedAt: string;
        grade?: { value: number; maxScore: number };
    };
}

export interface QuizSubmissionDetail {
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
    autoGraded: boolean;
    questionResponses: GradedQuestionResponse[];
    timeExpired: boolean;
    unitId: string;
    unitName: string;
    earnedPoints?: number;
    totalPoints?: number;
    timeSpentSeconds?: number;
}

export interface GradedQuestionResponse {
    questionId: string;
    questionText: string;
    questionType: string;
    maxPoints: number;
    earnedPoints: number;
    teacherFeedback: string;
    isAutoGraded: boolean;
    options: { text: string; correct: boolean }[];
    selectedOptions: number[];
    textAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
}

/* =========================
   EXTENDED QUIZ SUBMISSION (para compatibilidad con código anterior)
========================= */

export interface QuizSubmission {
    id: QuizSubmissionId;
    quizId: QuizId;
    studentId: string;
    studentName: string;
    courseId: string;
    content: string;
    submittedAt: string;
    status: string;
    grade: QuizGrade | null;
    teacherFeedback: string | null;
    quizData: QuizSubmissionData;
    canViewResults: boolean;
}

export interface QuizGrade {
    value: number;
    maxScore: number;
}

export interface QuizSubmissionData {
    answers: ExtendedQuizAnswer[];
    timeSpent: number;
    totalScore: number;
    maxScore: number;
}

export interface ExtendedQuizAnswer {
    questionId: string;
    questionText: string;
    questionType: QuestionType;
    studentAnswer: number | string;
    correctAnswer: string;
    points: number;
    maxPoints: number;
    isCorrect: boolean;
    feedback: string;
}