// File: src/app/features/courses/api/quiz-api.ts
"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  Quiz,
  Question,
  QuizInventoryItem,
  SubmissionQuiz,
  QuizAnswer,
} from "@/app/domain/entities/CourseEntities";
import { CourseId, UserId } from "@/app/domain/valueObjects";
import { QuestionId, QuizId } from "@/app/domain/valueObjects/CourseValues";

// ============================================
// CONFIGURATION
// ============================================

const isMockEnabled = true; // Switch between mock and real API

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ============================================
// BACKEND DTO TYPES
// ============================================

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
}

export interface QuizAnswerDTO {
  questionId: string;
  questionText: string;
  selectedOptions: number[];
  textAnswer: string;
  correct: boolean;
  pointsEarned: number;
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

export interface GradeDTO {
  value: string;
  maxScore: string;
  percentage: string;
}

export interface SuccessResponseDTO {
  success: boolean;
  message: string;
  data: any;
}

export interface CreateQuizWithQuestionsCommand {
  courseId: string;
  unitId: string;
  title: string;
  description: string;
  availableFrom: string;
  availableUntil: string;
  timeLimitMinutes: number;
  questions: QuizQuestionData[];
}

export interface QuizQuestionData {
  questionText: string;
  questionType: string;
  points: number;
  options: QuestionOptionData[];
  correctAnswer: string;
}

export interface QuestionOptionData {
  text: string;
  correct: boolean;
}

export interface UpdateQuizCommand {
  quizId: string;
  title: string;
  description: string;
  availableFrom: string;
  availableUntil: string;
  timeLimitMinutes: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
}

export interface SubmitQuizWithAnswersCommand {
  quizId: string;
  studentId: string;
  answers: Map<string, QuizAnswerData>;
}

export interface QuizAnswerData {
  selectedOptions: number[];
  textAnswer: string;
  timeSpentSeconds: number;
}

export interface GradeQuizSubmissionCommand {
  quizSubmissionId: string;
  earnedPoints: number;
  totalPoints: number;
}

// ============================================
// MOCK DATA
// ============================================

const MOCK_QUIZZES: Quiz[] = [
  {
    id: "quiz-2",
    title: "UX Design Fundamentals Quiz",
    description: "Test your knowledge of basic UX design principles and methodologies",
    courseUnitId: "UNIT-1",
    courseId: "crs-101",
    maxGrade: 100,
    timeLimit: 30,
    passingScore: 70,
    dueDate: "2024-03-25T23:59:00Z",
    acceptLateSubmissions: true,
    questions: [
      {
        id: "q-101-1",
        type: "multiple-choice",
        text: "What does UCD stand for in design?",
        maxPoints: 10,
        question: "What does UCD stand for in design?",
        options: [
          "User-Centered Design",
          "User-Created Development",
          "Universal Component Design",
          "User Configuration Document",
        ],
        correctAnswer: 0,
        points: 10,
        expectedAnswer: "",
      },
      {
        id: "q-101-2",
        type: "multiple-choice",
        text: "Which of the following is NOT a key principle of UX design?",
        maxPoints: 10,
        question: "Which of the following is NOT a key principle of UX design?",
        options: [
          "Consistency",
          "User Control",
          "Complex Navigation",
          "Accessibility",
        ],
        correctAnswer: 2,
        points: 10,
        expectedAnswer: "",
      },
      {
        id: "q-101-3",
        type: "open-ended",
        text: "Explain the importance of user research in the design process.",
        maxPoints: 20,
        question: "Explain the importance of user research in the design process.",
        points: 20,
        expectedAnswer: "User research helps designers understand user needs, behaviors, and pain points, ensuring the final product meets real user requirements rather than assumptions.",
      },
    ],
  },
];

const MOCK_QUIZZES_INVENTORY: QuizInventoryItem[] = [
  {
    id: "quiz-2",
    quizId: "quiz-2",
    title: "UX Design Fundamentals Quiz",
    unit: "UNIT-1",
    type: "QUIZ",
    courseId: "crs-101",
    deadline: "2024-03-25T23:59:00Z",
    isOverdue: false,
    studentId: "student-001",
  },
];

const MOCK_SUBMISSION_QUIZZES: SubmissionQuiz[] = [
  {
    id: "sub-quiz-2-emma",
    quizId: "quiz-2",
    studentId: "student-001",
    courseId: "crs-101",
    content: JSON.stringify([
      {
        questionId: "q1",
        answer: 1,
        type: "multiple-choice",
      },
      {
        questionId: "q2",
        answer: "Open ended answer explaining the concept",
        type: "open-ended",
      },
    ]),
    submittedAt: "2024-03-21T10:15:00Z",
    status: "GRADED",
    grade: { value: 90, maxScore: 100 },
    teacherFeedback: "Excellent understanding of the concepts.",
    quizData: {
      answers: [
        {
          questionId: "q1",
          questionText: "What is the capital of France?",
          questionType: "multiple-choice",
          studentAnswer: "Complex Navigation",
          correctAnswer: 1,
          points: 10,
          maxPoints: 10,
          isCorrect: true,
          feedback: "Correct! Paris is the capital of France.",
        },
        {
          questionId: "q2",
          questionText: "Explain the concept of gravity",
          questionType: "open-ended",
          studentAnswer: "Gravity is the force that attracts objects with mass towards each other.",
          correctAnswer: "Gravity is a fundamental force that causes mutual attraction between all things that have mass.",
          points: 8,
          maxPoints: 10,
          isCorrect: true,
          feedback: "Good explanation, but could be more detailed about how it relates to mass and distance.",
        },
      ],
      timeSpent: 1200,
      totalScore: 18,
      maxScore: 20,
    },
    studentName: "Emma Johnson",
  },
];

// ============================================
// UTILITIES
// ============================================

const simulateDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = (await cookies()).get("session")?.value;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
    redirect("/courses");
    throw new Error(errorMessage);
  }
  throw error;
};

// ============================================
// MAPPERS - BACKEND TO FRONTEND
// ============================================

function mapQuizFromBackend(dto: QuizDTO): Quiz {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    courseId: dto.courseId,
    courseUnitId: "", // Will be populated from CompleteQuizDTO
    maxGrade: dto.totalPoints,
    timeLimit: dto.timeLimitMinutes,
    passingScore: 70, // Default value
    dueDate: dto.availableUntil,
    acceptLateSubmissions: true, // Default value
    questions: [], // Will be populated from CompleteQuizDTO
  };
}

function mapCompleteQuizFromBackend(dto: CompleteQuizDTO): Quiz {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    courseId: dto.courseId,
    courseUnitId: dto.unitId,
    maxGrade: dto.totalPoints,
    timeLimit: dto.timeLimitMinutes,
    passingScore: 70, // Default value
    dueDate: dto.availableUntil,
    acceptLateSubmissions: true, // Default value
    questions: dto.questions.map(q => ({
      id: q.id,
      type: q.questionType.toLowerCase(),
      text: q.questionText,
      maxPoints: q.points,
      question: q.questionText,
      options: q.options.map(opt => opt.text),
      correctAnswer: q.questionType === 'MULTIPLE_CHOICE' ? parseInt(q.correctAnswer) : 0,
      points: q.points,
      expectedAnswer: q.correctAnswer,
    })),
  };
}

function mapQuizInventoryFromBackend(dto: QuizDTO): QuizInventoryItem {
  return {
    id: dto.id,
    quizId: dto.id,
    title: dto.title,
    unit: "", // Will be populated from course context
    type: "QUIZ",
    courseId: dto.courseId,
    deadline: dto.availableUntil,
    isOverdue: new Date(dto.availableUntil) < new Date(),
    studentId: "current-student-id", // This should come from auth context
  };
}

function mapSubmissionQuizFromBackend(dto: QuizSubmissionDTO): SubmissionQuiz {
  return {
    id: dto.id,
    quizId: dto.quizId,
    studentId: dto.studentId,
    courseId: "", // Will be populated from context
    studentName: dto.studentName,
    content: JSON.stringify(dto.answers),
    submittedAt: dto.submittedAt,
    status: dto.status,
    grade: dto.grade ? {
      value: parseFloat(dto.grade.value),
      maxScore: parseFloat(dto.grade.maxScore)
    } : null,
    teacherFeedback: "", // Will be populated from detail
    quizData: {
      answers: dto.answers.map(a => ({
        questionId: a.questionId,
        questionText: a.questionText,
        questionType: "multiple-choice", // Default, should be mapped properly
        studentAnswer: a.selectedOptions.length > 0 ? a.selectedOptions[0] : a.textAnswer,
        correctAnswer: "", // Will be populated from detail
        points: a.pointsEarned,
        maxPoints: 0, // Will be populated from context
        isCorrect: a.correct,
        feedback: "", // Will be populated from context
      })),
      timeSpent: 0, // Will be populated from context
      totalScore: dto.grade ? parseFloat(dto.grade.value) : 0,
      maxScore: dto.grade ? parseFloat(dto.grade.maxScore) : 0,
    },
  };
}

function mapSubmissionQuizDetailFromBackend(dto: QuizSubmissionDetailDTO): SubmissionQuiz {
  return {
    id: dto.id,
    quizId: dto.quizId,
    studentId: dto.studentId,
    courseId: "", // Will be populated from context
    studentName: dto.studentName,
    content: JSON.stringify(dto.questionResponses),
    submittedAt: dto.submittedAt,
    status: dto.status,
    grade: dto.grade ? {
      value: parseFloat(dto.grade.value),
      maxScore: parseFloat(dto.grade.maxScore)
    } : null,
    teacherFeedback: "", // Will be populated from context
    quizData: {
      answers: dto.questionResponses.map(qr => ({
        questionId: qr.questionId,
        questionText: qr.questionText,
        questionType: qr.questionType.toLowerCase(),
        studentAnswer: qr.selectedOptions.length > 0 ? qr.selectedOptions[0] : qr.textAnswer,
        correctAnswer: qr.correctAnswer,
        points: 0, // Will be calculated
        maxPoints: qr.points,
        isCorrect: qr.isCorrect,
        feedback: "", // Will be populated from context
      })),
      timeSpent: 0, // Will be populated from context
      totalScore: dto.grade ? parseFloat(dto.grade.value) : 0,
      maxScore: dto.grade ? parseFloat(dto.grade.maxScore) : 0,
    },
  };
}

// ============================================
// MAPPERS - FRONTEND TO BACKEND
// ============================================

function mapCreateQuizToBackendCommand(data: Omit<Quiz, "id">): CreateQuizWithQuestionsCommand {
  return {
    courseId: data.courseId,
    unitId: data.courseUnitId,
    title: data.title,
    description: data.description,
    availableFrom: new Date().toISOString(),
    availableUntil: data.dueDate,
    timeLimitMinutes: data.timeLimit,
    questions: data.questions.map(q => ({
      questionText: q.text,
      questionType: q.type.toUpperCase(),
      points: q.points,
      options: q.options.map((opt, index) => ({
        text: opt,
        correct: index === q.correctAnswer
      })),
      correctAnswer: q.type === 'multiple-choice' ? q.correctAnswer.toString() : q.expectedAnswer
    }))
  };
}

function mapUpdateQuizToBackendCommand(quizId: string, data: Partial<Omit<Quiz, "id" | "questions">>): UpdateQuizCommand {
  return {
    quizId,
    title: data.title || "",
    description: data.description || "",
    availableFrom: new Date().toISOString(), // Default value
    availableUntil: data.dueDate || new Date().toISOString(),
    timeLimitMinutes: data.timeLimit || 60,
    maxAttempts: 3, // Default value
    shuffleQuestions: false, // Default value
    showCorrectAnswers: true, // Default value
  };
}

function mapSubmitQuizToBackendCommand(quizId: string, studentId: string, answers: Array<{ questionId: string; answer: string | number }>): SubmitQuizWithAnswersCommand {
  const answerMap = new Map<string, QuizAnswerData>();
  
  answers.forEach(ans => {
    answerMap.set(ans.questionId, {
      selectedOptions: typeof ans.answer === 'number' ? [ans.answer] : [],
      textAnswer: typeof ans.answer === 'string' ? ans.answer : "",
      timeSpentSeconds: 0 // Default value
    });
  });

  return {
    quizId,
    studentId,
    answers: answerMap
  };
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Fetch quizzes by course
 */
export async function fetchQuizzesByCourse(courseId: CourseId): Promise<Quiz[]> {
  if (isMockEnabled) {
    await simulateDelay();
    const quizzes = MOCK_QUIZZES.filter((quiz) => quiz.courseId === courseId);
    console.log(`MOCK: Returning quizzes for course ${courseId}`);
    return quizzes;
  }

  try {
    const response = await apiClient.get<QuizDTO[]>(`/api/quizzes/course/${courseId}/basic`);
    return response.data.map(mapQuizFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch quizzes by course without details (for inventory)
 */
export async function fetchQuizzesByCourseWithoutDetails(courseId: CourseId): Promise<QuizInventoryItem[]> {
  if (isMockEnabled) {
    await simulateDelay();
    const quizzes = MOCK_QUIZZES_INVENTORY.filter((quiz) => quiz.courseId === courseId);
    console.log(`MOCK: Returning quiz inventory for course ${courseId}`);
    return quizzes;
  }

  try {
    const response = await apiClient.get<QuizDTO[]>(`/api/quizzes/course/${courseId}/basic`);
    return response.data.map(mapQuizInventoryFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch quiz by ID
 */
export async function fetchQuizById(quizId: QuizId): Promise<Quiz> {
  if (isMockEnabled) {
    const quiz = MOCK_QUIZZES.find((q) => q.id === quizId);
    if (!quiz) {
      throw new Error(`Quiz not found: ${quizId}`);
    }
    console.log(`MOCK: Returning quiz ${quizId}`);
    return quiz;
  }

  try {
    const response = await apiClient.get<CompleteQuizDTO>(`/api/quizzes/${quizId}/complete`);
    return mapCompleteQuizFromBackend(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Create a new quiz
 */
export async function createQuiz(quizData: Omit<Quiz, "id">): Promise<Quiz> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const newQuiz: Quiz = {
      ...quizData,
      id: `quiz-${Date.now()}`,
    };
    MOCK_QUIZZES.push(newQuiz);
    console.log("MOCK: Created new quiz");
    return newQuiz;
  }

  try {
    const backendCommand: CreateQuizWithQuestionsCommand = mapCreateQuizToBackendCommand(quizData);
    const response = await apiClient.post<SuccessResponseDTO>("/api/quizzes/with-questions", backendCommand);
    
    // Fetch the created quiz to get full details
    const quizId = response.data.data;
    const quizResponse = await apiClient.get<CompleteQuizDTO>(`/api/quizzes/${quizId}/complete`);
    return mapCompleteQuizFromBackend(quizResponse.data);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Update an existing quiz
 */
export async function updateQuiz(quizId: QuizId, quizData: Partial<Omit<Quiz, "id">>): Promise<Quiz> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const quizIndex = MOCK_QUIZZES.findIndex((q) => q.id === quizId);
    if (quizIndex === -1) {
      throw new Error(`Quiz not found: ${quizId}`);
    }
    MOCK_QUIZZES[quizIndex] = { ...MOCK_QUIZZES[quizIndex], ...quizData } as Quiz;
    console.log(`MOCK: Updated quiz ${quizId}`);
    return MOCK_QUIZZES[quizIndex];
  }

  try {
    const backendCommand: UpdateQuizCommand = mapUpdateQuizToBackendCommand(quizId, quizData);
    await apiClient.put(`/api/quizzes/${quizId}`, backendCommand);
    
    // Fetch the updated quiz
    const response = await apiClient.get<CompleteQuizDTO>(`/api/quizzes/${quizId}/complete`);
    return mapCompleteQuizFromBackend(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Delete a quiz
 */
export async function deleteQuiz(quizId: QuizId): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const quizIndex = MOCK_QUIZZES.findIndex((q) => q.id === quizId);
    if (quizIndex === -1) {
      throw new Error(`Quiz not found: ${quizId}`);
    }
    MOCK_QUIZZES.splice(quizIndex, 1);
    console.log(`MOCK: Deleted quiz ${quizId}`);
    return;
  }

  try {
    await apiClient.delete(`/api/quizzes/${quizId}`);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch student submissions for a quiz
 */
export async function fetchQuizSubmissions(quizId: QuizId): Promise<SubmissionQuiz[]> {
  if (isMockEnabled) {
    await simulateDelay();
    const submissions = MOCK_SUBMISSION_QUIZZES.filter((sub) => sub.quizId === quizId);
    console.log(`MOCK: Returning submissions for quiz ${quizId}`);
    return submissions;
  }

  try {
    const response = await apiClient.get<QuizSubmissionDTO[]>(`/api/quiz-submissions/course/${quizId}`);
    return response.data.map(mapSubmissionQuizFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch specific student submission for a quiz
 */
export async function fetchStudentQuizSubmission(quizId: QuizId, studentId: UserId): Promise<SubmissionQuiz> {
  if (isMockEnabled) {
    await simulateDelay(600);
    const submission = MOCK_SUBMISSION_QUIZZES.find((sub) => sub.quizId === quizId && sub.studentId === studentId);
    if (!submission) {
      throw new Error(`Submission not found for student ${studentId}`);
    }
    console.log(`MOCK: Returning submission for quiz ${quizId} and student ${studentId}`);
    return submission;
  }

  try {
    // This endpoint might need to be adjusted based on your backend
    const response = await apiClient.get<QuizSubmissionDetailDTO>(`/api/quiz-submissions/detail`);
    return mapSubmissionQuizDetailFromBackend(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Submit quiz answers
 */
export async function submitQuizAnswers(
  quizId: QuizId,
  studentId: UserId,
  answers: Array<{ questionId: QuestionId; answer: string | number }>,
  timeSpent?: number
): Promise<SubmissionQuiz> {
  if (isMockEnabled) {
    await simulateDelay(1000);
    
    const quiz = MOCK_QUIZZES.find((q) => q.id === quizId);
    if (!quiz) {
      throw new Error(`Quiz not found: ${quizId}`);
    }

    const quizAnswers: QuizAnswer[] = answers.map((submittedAnswer) => {
      const question = quiz.questions.find((q) => q.id === submittedAnswer.questionId);
      if (!question) {
        throw new Error(`Question not found: ${submittedAnswer.questionId}`);
      }

      let points = 0;
      let isCorrect: boolean | undefined = undefined;

      if (question.type === "multiple-choice") {
        isCorrect = submittedAnswer.answer === question.correctAnswer;
        points = isCorrect ? question.points : 0;
      }

      return {
        questionId: question.id,
        questionText: question.text,
        questionType: question.type,
        studentAnswer: submittedAnswer.answer,
        correctAnswer: question.type === "multiple-choice" ? question.correctAnswer : question.expectedAnswer,
        points: points,
        maxPoints: question.points,
        isCorrect: isCorrect,
      };
    });

    const totalScore = quizAnswers.reduce((sum, answer) => sum + answer.points, 0);
    const submissionQuiz: SubmissionQuiz = {
      id: `sub-quiz-${quizId}-${studentId}-${Date.now()}`,
      quizId: quizId,
      studentId: studentId,
      courseId: quiz.courseId,
      studentName: `Student ${studentId}`,
      content: `Quiz submission for ${quiz.title}`,
      submittedAt: new Date().toISOString(),
      status: "SUBMITTED",
      grade: totalScore > 0 ? { value: totalScore, maxScore: quiz.maxGrade } : null,
      teacherFeedback: null,
      quizData: {
        answers: quizAnswers,
        timeSpent: timeSpent || 0,
        totalScore: totalScore,
        maxScore: quiz.maxGrade,
      },
    };

    MOCK_SUBMISSION_QUIZZES.push(submissionQuiz);
    console.log(`MOCK: Created submission for quiz ${quizId}`);
    return submissionQuiz;
  }

  try {
    const backendCommand: SubmitQuizWithAnswersCommand = mapSubmitQuizToBackendCommand(quizId, studentId, answers);
    const response = await apiClient.post<SuccessResponseDTO>("/api/quiz-submissions/submit-with-answers", backendCommand);
    
    // Fetch the created submission
    const submissionId = response.data.data;
    const submissionResponse = await apiClient.get<QuizSubmissionDetailDTO>(`/api/quiz-submissions/${submissionId}/detail`);
    return mapSubmissionQuizDetailFromBackend(submissionResponse.data);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Grade a quiz submission
 */
export async function gradeQuizSubmission(
  submissionId: string,
  grades: { questionId: QuestionId; score: number }[]
): Promise<SubmissionQuiz> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const submissionIndex = MOCK_SUBMISSION_QUIZZES.findIndex((sub) => sub.id === submissionId);
    if (submissionIndex === -1) {
      throw new Error(`Submission not found: ${submissionId}`);
    }

    const submission = MOCK_SUBMISSION_QUIZZES[submissionIndex];
    if (!submission.quizData) {
      throw new Error(`Submission ${submissionId} has no quiz data`);
    }

    grades.forEach((grade) => {
      const answerIndex = submission.quizData.answers.findIndex((ans) => ans.questionId === grade.questionId);
      if (answerIndex !== -1) {
        submission.quizData.answers[answerIndex].points = grade.score;
      }
    });

    const totalScore = submission.quizData.answers.reduce((sum, answer) => sum + answer.points, 0);
    submission.quizData.totalScore = totalScore;
    submission.grade = {
      value: totalScore,
      maxScore: submission.quizData.maxScore,
    };
    submission.status = "GRADED";

    console.log(`MOCK: Graded submission ${submissionId}`);
    return submission;
  }

  try {
    const totalPoints = grades.reduce((sum, grade) => sum + grade.score, 0);
    const backendCommand: GradeQuizSubmissionCommand = {
      quizSubmissionId: submissionId,
      earnedPoints: totalPoints,
      totalPoints: 100, // This should be calculated from the quiz
    };

    await apiClient.post(`/api/quiz-submissions/${submissionId}/grade`, backendCommand);
    
    // Fetch the graded submission
    const response = await apiClient.get<QuizSubmissionDetailDTO>(`/api/quiz-submissions/${submissionId}/detail`);
    return mapSubmissionQuizDetailFromBackend(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Get quiz statistics
 */
export async function getQuizStats(quizId: QuizId): Promise<{
  totalSubmissions: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  completionRate: number;
}> {
  if (isMockEnabled) {
    await simulateDelay(400);
    const submissions = MOCK_SUBMISSION_QUIZZES.filter((sub) => sub.quizId === quizId);
    const gradedSubmissions = submissions.filter((sub) => sub.grade !== null);
    
    const scores = gradedSubmissions.map((sub) => sub.grade?.value || 0);
    const stats = {
      totalSubmissions: submissions.length,
      averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      highestScore: scores.length > 0 ? Math.max(...scores) : 0,
      lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
      completionRate: Math.round((submissions.length / 25) * 100),
    };

    console.log(`MOCK: Returning stats for quiz ${quizId}`);
    return stats;
  }

  try {
    // Note: Your backend might not have a stats endpoint
    // You might need to calculate from submission data
    const submissions = await fetchQuizSubmissions(quizId);
    const gradedSubmissions = submissions.filter((sub) => sub.grade !== null);
    const scores = gradedSubmissions.map((sub) => sub.grade?.value || 0);
    
    return {
      totalSubmissions: submissions.length,
      averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      highestScore: scores.length > 0 ? Math.max(...scores) : 0,
      lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
      completionRate: Math.round((submissions.length / 25) * 100), // Assuming 25 students
    };
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch calendar quizzes for student
 */
export async function fetchStudentCalendarQuizzes(
  studentId: UserId,
  period: 'week' | 'month',
  startDate: string
): Promise<Quiz[]> {
  if (isMockEnabled) {
    await simulateDelay();
    console.log(`MOCK: Returning ${period} calendar quizzes for student ${studentId}`);
    return MOCK_QUIZZES;
  }

  try {
    const endpoint = period === 'week' ? 'week' : 'month';
    const response = await apiClient.get<QuizDTO[]>(`/api/quizzes/calendar/student/${studentId}/${endpoint}?${period}Start=${startDate}`);
    return response.data.map(mapQuizFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch calendar quizzes for teacher
 */
export async function fetchTeacherCalendarQuizzes(
  teacherId: UserId,
  period: 'week' | 'month',
  startDate: string
): Promise<Quiz[]> {
  if (isMockEnabled) {
    await simulateDelay();
    console.log(`MOCK: Returning ${period} calendar quizzes for teacher ${teacherId}`);
    return MOCK_QUIZZES;
  }

  try {
    const endpoint = period === 'week' ? 'week' : 'month';
    const response = await apiClient.get<QuizDTO[]>(`/api/quizzes/calendar/teacher/${teacherId}/${endpoint}?${period}Start=${startDate}`);
    return response.data.map(mapQuizFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}