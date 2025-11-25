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
    idUser: "", // Will be populated from auth context
    title: dto.title,
    description: dto.description,
    courseId: dto.courseId,
    courseUnitId: dto.unitId,
    maxGrade: dto.totalPoints,
    timeLimit: dto.timeLimitMinutes,
    passingScore: 70, // Default value
    dueDate: dto.availableUntil,
    acceptLateSubmissions: true, // Default value
    questions: dto.questions.map(q => {
      // normalize backend question type to the frontend literal union
      const normalizedType = (q.questionType || "").toUpperCase() === "MULTIPLE_CHOICE"
        ? ("multiple-choice" as const)
        : ("open-ended" as const);

      return {
        id: q.id,
        type: normalizedType,
        text: q.questionText,
        maxPoints: q.points,
        question: q.questionText,
        options: q.options.map(opt => opt.text),
        // for multiple-choice provide numeric index, otherwise leave undefined
        correctAnswer: normalizedType === "multiple-choice"
          ? parseInt(q.correctAnswer ?? "0", 10)
          : undefined,
        points: q.points,
        // for open-ended questions use expectedAnswer, otherwise undefined
        expectedAnswer: normalizedType === "open-ended" ? q.correctAnswer : undefined,
      };
    }),
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
export async function fetchQuizzesByMonth(
  userId: string,
  monthStart: string,
  userType: 'teacher' | 'student'
): Promise<Quiz[]> {
  if (isMockEnabled) {
    await simulateDelay();
    
    const month = new Date(monthStart).getMonth();
    const year = new Date(monthStart).getFullYear();
    
    const filteredQuizzes = MOCK_QUIZZES.filter(quiz => {
      if (!quiz.dueDate) return false;
      
      const quizDate = new Date(quiz.dueDate);
      const isInMonth = quizDate.getMonth() === month && quizDate.getFullYear() === year;
      
      // For students, only show upcoming or recent quizzes
      if (userType === 'student') {
        const now = new Date();
        const timeDiff = quizDate.getTime() - now.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        
        // Show quizzes from the last 7 days and next 30 days
        return isInMonth && daysDiff >= -7 && daysDiff <= 30;
      }
      
      // For teachers, show all quizzes in the month
      return isInMonth;
    });

    console.log(`MOCK: Returning ${filteredQuizzes.length} quizzes for ${userType} ${userId} in month ${monthStart}`);
    return filteredQuizzes;
  }

  try {
    const endpoint = userType === 'teacher' ? 'teacher' : 'student';
    const response = await apiClient.get<QuizDTO[]>(`/api/quizzes/calendar/${endpoint}/${userId}/month?monthStart=${monthStart}`);
    return response.data.map(mapQuizFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchThisWeekQuizzes(
  userId: string,
  weekStart: string,
  userType: 'teacher' | 'student'
): Promise<Quiz[]> {
  if (isMockEnabled) {
    await simulateDelay();
    
    const weekStartDate = new Date(weekStart);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 7);
    
    const thisWeekQuizzes = MOCK_QUIZZES.filter(quiz => {
      if (!quiz.dueDate) return false;
      
      const quizDate = new Date(quiz.dueDate);
      const isInWeek = quizDate >= weekStartDate && quizDate < weekEndDate;
      
      // For students, only show upcoming quizzes
      if (userType === 'student') {
        const now = new Date();
        return isInWeek && quizDate >= now;
      }
      
      return isInWeek;
    });

    console.log(`MOCK: Returning ${thisWeekQuizzes.length} quizzes for ${userType} ${userId} in week starting ${weekStart}`);
    return thisWeekQuizzes;
  }

  try {
    const endpoint = userType === 'teacher' ? 'teacher' : 'student';
    const response = await apiClient.get<QuizDTO[]>(`/api/quizzes/calendar/${endpoint}/${userId}/week?weekStart=${weekStart}`);
    return response.data.map(mapQuizFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchQuizDetail(
  quizId: string,
  userType: 'teacher' | 'student'
): Promise<Quiz> {
  if (isMockEnabled) {
    const quiz = MOCK_QUIZZES.find(q => q.id === quizId);
    
    if (!quiz) {
      throw new Error(`Quiz not found: ${quizId}`);
    }

    // For students, hide correct answers until after submission
    const quizForUser = userType === 'student' 
      ? {
          ...quiz,
          questions: quiz.questions.map(q => ({
            ...q,
            correctAnswer: undefined,
            expectedAnswer: undefined
          }))
        }
      : quiz;

    console.log(`MOCK: Returning quiz detail for ${quizId} for ${userType}`);
    return quizForUser;
  }

  try {
    const response = await apiClient.get<CompleteQuizDTO>(`/api/quizzes/${quizId}/complete`);
    const quiz = mapCompleteQuizFromBackend(response.data);
    
    // Hide answers for students
    if (userType === 'student') {
      quiz.questions = quiz.questions.map(q => ({
        ...q,
        correctAnswer: undefined,
        expectedAnswer: undefined
      }));
    }
    
    return quiz;
  } catch (error) {
    return handleApiError(error);
  }
}


export async function updateQuiz(quizId: string, quizData: Partial<Quiz>): Promise<Quiz> {
  if (isMockEnabled) {
    await simulateDelay(800);
    
    const quizIndex = MOCK_QUIZZES.findIndex(q => q.id === quizId);
    
    if (quizIndex === -1) {
      throw new Error(`Quiz not found: ${quizId}`);
    }
    
    MOCK_QUIZZES[quizIndex] = {
      ...MOCK_QUIZZES[quizIndex],
      ...quizData
    } as Quiz;
    
    console.log(`MOCK: Updated quiz ${quizId}`);
    return MOCK_QUIZZES[quizIndex];
  }

  try {
    // For simplicity, we'll use the mock approach for update
    await simulateDelay(800);
    throw new Error("Update quiz backend integration not implemented");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteQuiz(quizId: string): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(800);
    
    const quizIndex = MOCK_QUIZZES.findIndex(q => q.id === quizId);
    
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

export async function submitQuizAnswers(
  quizId: string,
  answers: Array<{
    questionId: string;
    answer: string | number;
  }>
): Promise<{
  score: number;
  totalPoints: number;
  passed: boolean;
  feedback: string;
}> {
  if (isMockEnabled) {
    await simulateDelay(1200);
    
    const quiz = MOCK_QUIZZES.find(q => q.id === quizId);
    
    if (!quiz) {
      throw new Error(`Quiz not found: ${quizId}`);
    }
    
    let totalScore = 0;
    let maxPossibleScore = 0;
    
    answers.forEach(answer => {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      if (question) {
        maxPossibleScore += question.points;
        
        if (question.type === "multiple-choice") {
          if (question.correctAnswer === answer.answer) {
            totalScore += question.points;
          }
        } else {
          // For open-ended questions, give partial credit based on answer length
          const answerText = answer.answer as string;
          const minLength = question.expectedAnswer ? question.expectedAnswer.length * 0.5 : 50;
          if (answerText.length >= minLength) {
            totalScore += question.points * 0.8; // 80% for decent attempt
          }
        }
      }
    });
    
    const percentage = (totalScore / maxPossibleScore) * 100;
    const passed = percentage >= quiz.passingScore;
    
    const result = {
      score: totalScore,
      totalPoints: maxPossibleScore,
      passed,
      feedback: passed 
        ? `Congratulations! You scored ${totalScore}/${maxPossibleScore} (${percentage.toFixed(1)}%) and passed the quiz.`
        : `You scored ${totalScore}/${maxPossibleScore} (${percentage.toFixed(1)}%). The passing score is ${quiz.passingScore}%. Please review the material and try again.`
    };
    
    console.log(`MOCK: Submitted answers for quiz ${quizId}`);
    return result;
  }

  try {
    // For simplicity, we'll use the mock approach for submission
    await simulateDelay(1200);
    throw new Error("Submit quiz answers backend integration not implemented");
  } catch (error) {
    return handleApiError(error);
  }
}



/**
 * Fetch quizzes by course unit
 * Backend: GET /api/quizzes/course/{courseId}/unit/{unitId}
 */
export async function fetchQuizzesByUnit(courseId: CourseId, unitId: string): Promise<Quiz[]> {
  if (isMockEnabled) {
    await simulateDelay();
    console.log(`MOCK: Fetching quizzes for course ${courseId}, unit ${unitId}`);
    return MOCK_QUIZZES.filter(quiz => quiz.courseId === courseId && quiz.courseUnitId === unitId);
  }

  try {
    const response = await apiClient.get<QuizDTO[]>(`/api/quizzes/course/${courseId}/unit/${unitId}`);
    return response.data.map(mapQuizFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Create a new quiz with questions
 * Backend: POST /api/quizzes/with-questions
 */
export async function createQuiz(quizData: Omit<Quiz, "id">): Promise<Quiz> {
  if (isMockEnabled) {
    await simulateDelay(800);
    
    const newQuiz: Quiz = {
      ...quizData,
      id: `quiz-${Date.now()}`
    };
    
    MOCK_QUIZZES.push(newQuiz);
    
    console.log("MOCK: Created new quiz");
    console.log("QUIZ DATA PROVIDED:", quizData);
    console.log("CREATED QUIZ DATA:", newQuiz);
    console.log("NEW QUIZ ID:", newQuiz.id);
    
    return newQuiz;
  }

  try {
    // Map frontend quiz data to backend command
    const command: CreateQuizWithQuestionsCommand = mapCreateQuizToBackendCommand(quizData);
    
    const response = await apiClient.post<SuccessResponseDTO>("/api/quizzes/with-questions", command);
    
    // The response should contain the created quiz ID
    const quizId = response.data.data;
    
    // Fetch the complete quiz details to return
    const quizDetail = await fetchQuizDetail(quizId, 'teacher');
    
    console.log("Backend: Created new quiz with ID:", quizId);
    return quizDetail;
  } catch (error) {
    return handleApiError(error);
  }
}

