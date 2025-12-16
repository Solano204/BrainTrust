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
import { QuestionId, QuizId, SubmissionStatus } from "@/app/domain/valueObjects/CourseValues";

// ============================================
// CONFIGURATION
// ============================================

const isMockEnabled = false; // Switch between mock and real API

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
    courseUnitId: "unit-1-1",
    courseId: "crs-101",
    maxGrade: 100,
    timeLimit: 30,
    passingScore: 70,
    dueDate: "2025-11-28T23:59:00Z",
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

const simulateDelay = async (ms: number = 500): Promise<void> =>
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

const handleApiError = async (error: unknown): Promise<never> => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
   
    throw new Error(errorMessage);
  }
  throw error;
};

// ============================================
// MAPPERS - BACKEND TO FRONTEND
// ============================================

async function mapQuizFromBackend(dto: QuizDTO): Promise<Quiz> {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    courseId: dto.courseId,
    courseUnitId: "", // Will be populated from CompleteQuizDTO
    maxGrade: dto.totalPoints,
    timeLimit: dto.timeLimitMinutes,
    dueDate: dto.availableUntil,
    acceptLateSubmissions: true, // Default value
    questions: [], // Will be populated from CompleteQuizDTO
  };
}
async function mapCompleteQuizFromBackend(dto: CompleteQuizDTO): Promise<Quiz> {
  console.log("Mapping complete quiz data...");
  console.log("Raw questions from backend:", JSON.stringify(dto.questions, null, 2));
  
  return {
    id: dto.id,
    idUser: "", // Will be populated from auth context
    title: dto.title,
    description: dto.description,
    courseId: dto.courseId,
    courseUnitId: dto.unitId,
    maxGrade: dto.totalPoints,
    timeLimit: dto.timeLimitMinutes,
    dueDate: dto.availableUntil,
    acceptLateSubmissions: true,
    availableFrom: dto.availableFrom,
    availableUntil: dto.availableUntil,
    maxAttempts: dto.maxAttempts,
    shuffleQuestions: dto.shuffleQuestions,
    showCorrectAnswers: dto.showCorrectAnswers,
    totalPoints: dto.totalPoints,
    questionCount: dto.questionCount,
    createdAt: dto.createdAt,
    active: dto.active,
    availableNow: dto.availableNow,
    courseName: dto.courseName,
    unitName: dto.unitId,
    questions: dto.questions.map((q, index) => {
      console.log(`\nProcessing Question ${index + 1}:`, {
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        correctAnswerFromBackend: q.correctAnswer,
        options: q.options,
        optionsCount: q.options?.length || 0
      });
      
      // Normalize backend question type to the frontend literal union
      const normalizedType = (q.questionType || "").toUpperCase() === "MULTIPLE_CHOICE"
        ? ("multiple-choice" as const)
        : ("open-ended" as const);

      let correctAnswer: number | undefined;
      let expectedAnswer: string | undefined;

      if (normalizedType === "multiple-choice") {
        // First, let's see what options we have
        if (q.options && q.options.length > 0) {
          console.log("Multiple choice options details:");
          q.options.forEach((opt, optIndex) => {
            console.log(`  Option ${optIndex}:`, {
              text: opt.text,
              correct: opt.correct,
              matchesCorrectAnswer: opt.text === q.correctAnswer
            });
          });
          
          // Try to find by correct flag
          const correctIndexByFlag = q.options.findIndex(opt => opt.correct === true);
          console.log("Correct index by flag:", correctIndexByFlag);
          
          // Try to find by matching text
          const correctIndexByText = q.options.findIndex(opt => 
            opt.text === q.correctAnswer
          );
          console.log("Correct index by text match:", correctIndexByText);
          
          // Determine which method to use
          if (correctIndexByFlag >= 0) {
            correctAnswer = correctIndexByFlag;
            console.log(`Using flag-based mapping: option ${correctAnswer} is correct`);
          } else if (correctIndexByText >= 0) {
            correctAnswer = correctIndexByText;
            console.log(`Using text-based mapping: option ${correctAnswer} matches correct answer text`);
          } else {
            // Last resort: check if any option text contains the correct answer
            const fuzzyMatchIndex = q.options.findIndex(opt => 
              opt.text.includes(q.correctAnswer) || q.correctAnswer.includes(opt.text)
            );
            if (fuzzyMatchIndex >= 0) {
              correctAnswer = fuzzyMatchIndex;
              console.log(`Using fuzzy text matching: option ${correctAnswer}`);
            } else {
              correctAnswer = 0;
              console.log("WARNING: Could not find correct answer, defaulting to first option (0)");
            }
          }
        } else {
          correctAnswer = 0;
          console.log("WARNING: No options provided for multiple choice question");
        }
        
        expectedAnswer = undefined;
      } else {
        // For open-ended questions
        correctAnswer = undefined;
        expectedAnswer = q.correctAnswer;
        console.log("Open-ended question, expectedAnswer:", expectedAnswer);
      }

      const mappedQuestion = {
        id: q.id,
        type: normalizedType,
        text: q.questionText,
        maxPoints: q.points,
        question: q.questionText,
        options: q.options ? q.options.map(opt => opt.text) : [],
        correctAnswer: correctAnswer,
        points: q.points,
        expectedAnswer: expectedAnswer,
      };
      
      console.log("Mapped question result:", mappedQuestion);
      return mappedQuestion;
    }),
  };
}

async function mapQuizInventoryFromBackend(dto: QuizDTO): Promise<QuizInventoryItem> {
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

async function mapSubmissionQuizFromBackend(dto: QuizSubmissionDTO): Promise<SubmissionQuiz> {
  return {
    id: dto.id,
    quizId: dto.quizId,
    studentId: dto.studentId,
    courseId: "", // Will be populated from context
    studentName: dto.studentName,
    content: JSON.stringify(dto.answers),
    submittedAt: dto.submittedAt,
    status: dto.status as SubmissionStatus,
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

async function mapSubmissionQuizDetailFromBackend(dto: QuizSubmissionDetailDTO): Promise<SubmissionQuiz> {
  return {
    id: dto.id,
    quizId: dto.quizId,
    studentId: dto.studentId,
    courseId: "", // Will be populated from context
    studentName: dto.studentName,
    content: JSON.stringify(dto.questionResponses),
    submittedAt: dto.submittedAt,
    status: dto.status as SubmissionStatus,
    grade: dto.grade ? {
      value: parseFloat(dto.grade.value),
      maxScore: parseFloat(dto.grade.maxScore)
    } : null,
    teacherFeedback: "", // Will be populated from context
    quizData: {
      answers: dto.questionResponses.map(qr => ({
        questionId: qr.questionId,
        questionText: qr.questionText,
      
        questionType: qr.questionType.toLowerCase() === "multiple_choice" ? "multiple-choice" : "open-ended",
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

async function mapCreateQuizToBackendCommand(data: Quiz): Promise<CreateQuizWithQuestionsCommand> {
  return {
    courseId: data.courseId,
    unitId: data.courseUnitId, // Map courseUnitId to unitId
    title: data.title,
    description: data.description,
    availableFrom: new Date().toISOString(), // Set current time as available from
    availableUntil: data.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to 7 days from now if no due date
    timeLimitMinutes: data.timeLimit,
    questions: data.questions.map(q => ({
      questionText: q.question || q.text, // Use question field, fallback to text
      questionType: q.type === 'multiple-choice' ? 'CLOSED_CHOICE' : 'OPEN_ENDED', // Convert to backend enum values
      points: q.points || q.maxPoints, // Use points field, fallback to maxPoints
      options: (q.options || []).map((opt, index) => ({
        text: opt,
        correct: index === q.correctAnswer
      })),
      correctAnswer: q.type === 'multiple-choice'
        ? (q.correctAnswer !== undefined && q.correctAnswer !== null ? q.correctAnswer.toString() : "")
        : (q.expectedAnswer || "")
    }))
  };
}

async function mapUpdateQuizToBackendCommand(quizId: string, data: Partial<Omit<Quiz, "id" | "questions">>): Promise<UpdateQuizCommand> {
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

async function mapSubmitQuizToBackendCommand(quizId: string, studentId: string, answers: Array<{ questionId: string; answer: string | number }>): Promise<SubmitQuizWithAnswersCommand> {
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

// CURRENTLY WORKS

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
    const quizzes = await Promise.all(response.data.map(dto => mapQuizFromBackend(dto)));
    return quizzes;
  } catch (error) {
    return await handleApiError(error);
  }
}

// CURRENTLY WORKS

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
    console.log("THIS WEEK QUIZZES DATA:", response.data);
    const quizzes = await Promise.all(response.data.map(dto => mapQuizFromBackend(dto)));
    return quizzes;
  } catch (error) {
    return await handleApiError(error);
  }
}


// THIS CURRENTLY WORKS

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
    
    // DEBUG: Log raw backend response with options expanded
    console.log("RAW BACKEND RESPONSE WITH OPTIONS:");
    if (response.data.questions) {
      response.data.questions.forEach((q, i) => {
        console.log(`Question ${i + 1}:`, {
          id: q.id,
          text: q.questionText,
          type: q.questionType,
          correctAnswer: q.correctAnswer,
          options: q.options?.map((opt, optIndex) => ({
            index: optIndex,
            text: opt.text,
            correct: opt.correct
          }))
        });
      });
    }
    
    const quiz = await mapCompleteQuizFromBackend(response.data);
    
    console.log("FINAL MAPPED QUIZ DATA:", {
      ...quiz,
      questions: quiz.questions.map((q, i) => ({
        questionNumber: i + 1,
        type: q.type,
        correctAnswer: q.correctAnswer,
        options: q.options,
        expectedAnswer: q.expectedAnswer
      }))
    });
    
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
    return await handleApiError(error);
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
    return await handleApiError(error);
  }
}



/**
 * Fetch quizzes by course unit
 * Backend: GET /api/quizzes/course/{courseId}/unit/{unitId}
 */


// CURRENTLY WORKS

export async function fetchQuizzesByUnit(courseId: CourseId, unitId: string): Promise<Quiz[]> {
  if (isMockEnabled) {
    await simulateDelay();
    console.log(`MOCK: Fetching quizzes for course ${courseId}, unit ${unitId}`);
    return MOCK_QUIZZES.filter(quiz => quiz.courseId === courseId && quiz.courseUnitId === unitId);
  }

  try {
    const response = await apiClient.get<QuizDTO[]>(`/api/quizzes/course/${courseId}/unit/${unitId}`);
    const quizzes = await Promise.all(response.data.map(dto => mapQuizFromBackend(dto)));
    return quizzes;
  } catch (error) {
    return await handleApiError(error);
  }
}



// FILE: src/app/features/courses/api/quiz-teacher.ts
// REPLACE the existing updateQuizQuestionsBulk function with this:

/**
 * 7. Update multiple questions in bulk - COMPLETE UPDATE
 * Backend: PUT /api/quizzes/{quizId}/questions/bulk
 */
export async function updateQuizQuestionsBulk(
  quizId: string,
  updates: Array<{
    questionId: string;
    questionText?: string;
    type?: "multiple-choice" | "open-ended";
    points?: number;
    options?: string[];
    correctAnswer?: number | string;
    expectedAnswer?: string;
    action?: "UPDATE_TEXT" | "UPDATE_POINTS" | "UPDATE_ANSWER" | "UPDATE_OPTIONS" | "UPDATE_ALL" | "CHANGE_TYPE";
  }>
): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const quizIndex = MOCK_QUIZZES.findIndex((q) => q.id === quizId);
    if (quizIndex === -1) throw new Error(`Quiz not found: ${quizId}`);

    updates.forEach((update) => {
      const questionIndex = MOCK_QUIZZES[quizIndex].questions.findIndex(
        (q) => q.id === update.questionId
      );
      if (questionIndex !== -1) {
        const question = MOCK_QUIZZES[quizIndex].questions[questionIndex];
        if (update.questionText !== undefined) {
          question.question = update.questionText;
          question.text = update.questionText;
        }
        if (update.points !== undefined) {
          question.points = update.points;
          question.maxPoints = update.points;
        }
        if (update.type !== undefined) question.type = update.type;
        if (update.options !== undefined && question.type === "multiple-choice") {
          question.options = update.options;
        }
        if (update.correctAnswer !== undefined && question.type === "multiple-choice") {
          question.correctAnswer = update.correctAnswer as number;
        }
        if (update.expectedAnswer !== undefined && question.type === "open-ended") {
          question.expectedAnswer = update.expectedAnswer;
        }
      }
    });
    console.log(`MOCK: Updated ${updates.length} questions in quiz ${quizId}`);
    return;
  }

  try {
    const questionUpdates = updates.map((update) => {
      const updateData: any = {
        questionId: update.questionId,
        action: update.action || "UPDATE_ALL",
      };

      if (update.questionText !== undefined) {
        updateData.questionText = update.questionText;
      }
      if (update.points !== undefined) {
        updateData.points = update.points;
      }
      if (update.type !== undefined) {
        updateData.questionType =
          update.type === "multiple-choice" ? "MULTIPLE_CHOICE" : "OPEN_ENDED";
      }

      // Map options for multiple-choice questions
      if (update.options !== undefined && update.type === "multiple-choice") {
        updateData.options = update.options.map((option, index) => ({
          text: option,
          correct: index === (update.correctAnswer as number),
        }));
      }

      // Map correct answer for open-ended questions
      if (update.expectedAnswer !== undefined && update.type === "open-ended") {
        updateData.correctAnswer = update.expectedAnswer;
      }

      return updateData;
    });

    const command = {
      quizId,
      questions: questionUpdates,
    };

    console.log(`Updating ${updates.length} questions in bulk for quiz:`, quizId);
    await apiClient.put(`/api/quizzes/${quizId}/questions/bulk`, command);
    console.log(`Backend: Updated ${updates.length} questions in quiz:`, quizId);
  } catch (error) {
    console.error("Error updating questions in bulk:", error);
    return await handleApiError(error);
  }
}

/**
 * 8. Update points for multiple questions - POINTS ONLY
 * Backend: PATCH /api/quizzes/{quizId}/questions/points
 */
export async function updateQuestionsPointsBulk(
  quizId: string,
  questionPoints: Record<string, number>
): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const quizIndex = MOCK_QUIZZES.findIndex((q) => q.id === quizId);
    if (quizIndex === -1) throw new Error(`Quiz not found: ${quizId}`);

    Object.entries(questionPoints).forEach(([questionId, points]) => {
      const questionIndex = MOCK_QUIZZES[quizIndex].questions.findIndex(
        (q) => q.id === questionId
      );
      if (questionIndex !== -1) {
        MOCK_QUIZZES[quizIndex].questions[questionIndex].points = points;
        MOCK_QUIZZES[quizIndex].questions[questionIndex].maxPoints = points;
      }
    });
    console.log(`MOCK: Updated points for ${Object.keys(questionPoints).length} questions`);
    return;
  }

  try {
    console.log(`Updating points for ${Object.keys(questionPoints).length} questions:`, quizId);
    await apiClient.patch(`/api/quizzes/${quizId}/questions/points`, questionPoints);
    console.log(`Backend: Updated points for ${Object.keys(questionPoints).length} questions`);
  } catch (error) {
    console.error("Error updating question points in bulk:", error);
    return await handleApiError(error);
  }
}

/**
 * 9. Update text for multiple questions - TEXT ONLY
 * Backend: PATCH /api/quizzes/{quizId}/questions/text
 */
export async function updateQuestionsTextBulk(
  quizId: string,
  questionTexts: Record<string, string>
): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const quizIndex = MOCK_QUIZZES.findIndex((q) => q.id === quizId);
    if (quizIndex === -1) throw new Error(`Quiz not found: ${quizId}`);

    Object.entries(questionTexts).forEach(([questionId, text]) => {
      const questionIndex = MOCK_QUIZZES[quizIndex].questions.findIndex(
        (q) => q.id === questionId
      );
      if (questionIndex !== -1) {
        MOCK_QUIZZES[quizIndex].questions[questionIndex].question = text;
        MOCK_QUIZZES[quizIndex].questions[questionIndex].text = text;
      }
    });
    console.log(`MOCK: Updated text for ${Object.keys(questionTexts).length} questions`);
    return;
  }

  try {
    console.log(`Updating text for ${Object.keys(questionTexts).length} questions:`, quizId);
    await apiClient.patch(`/api/quizzes/${quizId}/questions/text`, questionTexts);
    console.log(`Backend: Updated text for ${Object.keys(questionTexts).length} questions`);
  } catch (error) {
    console.error("Error updating question text in bulk:", error);
    return await handleApiError(error);
  }
}

/**
 * 10. Update answers for multiple questions - ANSWERS ONLY
 * Backend: PATCH /api/quizzes/{quizId}/questions/answers
 */
export async function updateQuestionsAnswersBulk(
  quizId: string,
  questionAnswers: Record<string, string>
): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const quizIndex = MOCK_QUIZZES.findIndex((q) => q.id === quizId);
    if (quizIndex === -1) throw new Error(`Quiz not found: ${quizId}`);

    Object.entries(questionAnswers).forEach(([questionId, answer]) => {
      const questionIndex = MOCK_QUIZZES[quizIndex].questions.findIndex(
        (q) => q.id === questionId && q.type === "open-ended"
      );
      if (questionIndex !== -1) {
        MOCK_QUIZZES[quizIndex].questions[questionIndex].expectedAnswer = answer;
      }
    });
    console.log(`MOCK: Updated answers for ${Object.keys(questionAnswers).length} questions`);
    return;
  }

  try {
    console.log(`Updating answers for ${Object.keys(questionAnswers).length} questions:`, quizId);
    await apiClient.patch(`/api/quizzes/${quizId}/questions/answers`, questionAnswers);
    console.log(`Backend: Updated answers for ${Object.keys(questionAnswers).length} questions`);
  } catch (error) {
    console.error("Error updating question answers in bulk:", error);
    return await handleApiError(error);
  }
}

/**
 * 11. Update options for multiple questions - OPTIONS ONLY
 * Backend: PATCH /api/quizzes/{quizId}/questions/options
 */
export async function updateQuestionsOptionsBulk(
  quizId: string,
  questionOptions: Record<string, { options: string[]; correctAnswer: number }>
): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const quizIndex = MOCK_QUIZZES.findIndex((q) => q.id === quizId);
    if (quizIndex === -1) throw new Error(`Quiz not found: ${quizId}`);

    Object.entries(questionOptions).forEach(([questionId, data]) => {
      const questionIndex = MOCK_QUIZZES[quizIndex].questions.findIndex(
        (q) => q.id === questionId && q.type === "multiple-choice"
      );
      if (questionIndex !== -1) {
        MOCK_QUIZZES[quizIndex].questions[questionIndex].options = data.options;
        MOCK_QUIZZES[quizIndex].questions[questionIndex].correctAnswer = data.correctAnswer;
      }
    });
    console.log(`MOCK: Updated options for ${Object.keys(questionOptions).length} questions`);
    return;
  }

  try {
    const backendQuestionOptions: Record<string, any[]> = {};
    Object.entries(questionOptions).forEach(([questionId, data]) => {
      backendQuestionOptions[questionId] = data.options.map((option, index) => ({
        text: option,
        correct: index === data.correctAnswer,
      }));
    });

    console.log(`Updating options for ${Object.keys(questionOptions).length} questions:`, quizId);
    await apiClient.patch(`/api/quizzes/${quizId}/questions/options`, backendQuestionOptions);
    console.log(`Backend: Updated options for ${Object.keys(questionOptions).length} questions`);
  } catch (error) {
    console.error("Error updating question options in bulk:", error);
    return await handleApiError(error);
  }
}

/**
 * 12. Update types for multiple questions - TYPES ONLY
 * Backend: PATCH /api/quizzes/{quizId}/questions/types
 */
export async function updateQuestionsTypesBulk(
  quizId: string,
  questionTypes: Record<string, "multiple-choice" | "open-ended">
): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const quizIndex = MOCK_QUIZZES.findIndex((q) => q.id === quizId);
    if (quizIndex === -1) throw new Error(`Quiz not found: ${quizId}`);

    Object.entries(questionTypes).forEach(([questionId, type]) => {
      const questionIndex = MOCK_QUIZZES[quizIndex].questions.findIndex(
        (q) => q.id === questionId
      );
      if (questionIndex !== -1) {
        MOCK_QUIZZES[quizIndex].questions[questionIndex].type = type;
      }
    });
    console.log(`MOCK: Updated types for ${Object.keys(questionTypes).length} questions`);
    return;
  }

  try {
    const backendTypes: Record<string, string> = {};
    Object.entries(questionTypes).forEach(([questionId, type]) => {
      backendTypes[questionId] = type === "multiple-choice" ? "MULTIPLE_CHOICE" : "OPEN_ENDED";
    });

    console.log(`Updating types for ${Object.keys(questionTypes).length} questions:`, quizId);
    await apiClient.patch(`/api/quizzes/${quizId}/questions/types`, backendTypes);
    console.log(`Backend: Updated types for ${Object.keys(questionTypes).length} questions`);
  } catch (error) {
    console.error("Error updating question types in bulk:", error);
    return await handleApiError(error);
  }
}



//// teacher 






