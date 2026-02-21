import { QuestionOptionDTO } from "@/app/shared/dtos/quiz.dto";

/* =========================
   QUIZ CREATION & UPDATE
========================= */

export interface CreateQuizWithQuestionsCommand {
    courseId: string;
    unitId: string;
    title: string;
    description: string;
    availableFrom?: string;
    availableUntil?: string;
    timeLimitMinutes?: number;
    questions: QuizQuestionData[];
}

export interface QuizQuestionData {
    questionText: string;
    questionType: string;
    points: number;
    options: QuestionOptionData[];
    correctAnswer?: string;
}

export interface QuestionOptionData {
    text: string;
    correct: boolean;
}

export interface UpdateQuizCommand {
    quizId: string;
    title?: string;
    description?: string;
    availableFrom?: string;
    availableUntil?: string;
    timeLimitMinutes?: number;
    maxAttempts?: number;
    shuffleQuestions?: boolean;
    showCorrectAnswers?: boolean;
}

/* =========================
   QUESTION MANAGEMENT
========================= */

export interface AddQuizQuestionCommand {
    quizId: string;
    questionText: string;
    questionType: string;
    points: number;
    options: QuestionOptionDTO[];
    correctAnswer?: string;
}

export interface AddQuizQuestionsBulkCommand {
    quizId: string;
    questions: QuizQuestionData[];
}

export interface DeleteQuizQuestionsBulkCommand {
    quizId: string;
    questionIds: string[];
}

export interface UpdateQuizQuestionsBulkCommand {
    quizId: string;
    questions: QuestionUpdateData[];
}

export interface QuestionUpdateData {
    questionId: string;
    questionText: string | null;
    questionType: string | null;
    points: number | null;
    options: QuestionOptionUpdateData[] | null;
    correctAnswer: string | null;
    action: "UPDATE_TEXT" | "UPDATE_POINTS" | "UPDATE_ANSWER" | "UPDATE_OPTIONS" | "UPDATE_ALL" | "CHANGE_TYPE";
}

export interface QuestionOptionUpdateData {
    text: string;
    correct: boolean;
    optionId: string | null;
    action: "ADD" | "UPDATE" | "REMOVE";
}

export interface UpdateQuestionsPointsCommand {
    quizId: string;
    questionPoints: Record<string, number>;
}

export interface UpdateQuestionsOptionsCommand {
    quizId: string;
    questionOptions: Record<string, QuestionOptionData[]>;
}

/* =========================
   QUIZ SUBMISSION
========================= */

export interface SubmitQuizWithAnswersCommand {
    quizId: string;
    studentId: string;
    answers: { [questionId: string]: QuizAnswerData };
}

export interface QuizAnswerData {
    selectedOptions: number[];
    textAnswer: string;
    timeSpentSeconds: number;
}

/* =========================
   QUIZ GRADING
========================= */

export interface GradeQuizSubmissionCommand {
    quizSubmissionId: string;
    earnedPoints: number;
    totalPoints: number;
    questionGrades?: QuestionGrade[];
}

export interface QuestionGrade {
    questionId: string;
    earnedPoints: number;
    maxPoints: number;
    feedback: string;
}