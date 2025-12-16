// File: src/app/features/courses/api/quiz-api.ts
"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Question, Quiz } from "@/app/domain/entities/CourseEntities";
import { GradeDTO } from "./quiz";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const isMockEnabled = false; // Enable mock data

// ============================================
// DTO INTERFACES - MATCHING BACKEND
// ============================================

// File: src/app/features/courses/api/quiz-api.ts
// Add these to your existing DTO INTERFACES section:

// ============================================
// BULK OPERATION DTOs
// ============================================

// For bulk adding questions
export interface AddQuizQuestionsBulkCommand {
  quizId: string;
  questions: QuizQuestionData[];
}

// For bulk deleting questions
export interface DeleteQuizQuestionsBulkCommand {
  quizId: string;
  questionIds: string[];
}

// For bulk updating questions
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

export enum QuestionUpdateAction {
  UPDATE = "UPDATE",
  CHANGE_TYPE = "CHANGE_TYPE",
  ADD_OPTION = "ADD_OPTION",
  REMOVE_OPTION = "REMOVE_OPTION",
  UPDATE_OPTIONS = "UPDATE_OPTIONS",
}

export interface QuestionOptionUpdateData {
  text: string;
  correct: boolean;
  optionId: string | null;
  action: "ADD" | "UPDATE" | "REMOVE";
}
// For bulk updating points
export interface UpdateQuestionsPointsCommand {
  quizId: string;
  questionPoints: Record<string, number>; // questionId -> new points
}

// For bulk updating options
export interface UpdateQuestionsOptionsCommand {
  quizId: string;
  questionOptions: Record<string, QuestionOptionData[]>; // questionId -> new options
}

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

export interface AddQuizQuestionCommand {
  quizId: string;
  questionText: string;
  questionType: string;
  points: number;
  options: QuestionOptionDTO[];
  correctAnswer?: string;
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

// ============================================
// MAPPERS - FRONTEND TO BACKEND CONVERSION
// ============================================

/**
 * Maps frontend Quiz data to backend CreateQuizWithQuestionsCommand
 */
/**
 * Maps frontend Quiz data to backend CreateQuizWithQuestionsCommand
 */
/**
 * Maps frontend Quiz data to backend CreateQuizWithQuestionsCommand
 */
async function mapCreateQuizToBackendCommand(
  quizData: Omit<
    Quiz,
    "id" | "courseId" | "courseUnitId" | "createdAt" | "active" | "availableNow"
  >
): Promise<CreateQuizWithQuestionsCommand> {
  const questions: QuizQuestionData[] = quizData.questions.map((q) => {
    // For multiple-choice, we need to find the correct answer text
    let correctAnswer: string | undefined = undefined;
    
    if (q.type === "multiple-choice" && q.options && q.correctAnswer !== undefined) {
      // Get the text of the correct option
      const correctOption = q.options[q.correctAnswer];
      if (correctOption) {
        correctAnswer = correctOption;
      }
    } else if (q.type === "open-ended") {
      correctAnswer = q.expectedAnswer;
    }

    const question: QuizQuestionData = {
      questionText: q.question,
      questionType:
        q.type === "multiple-choice" ? "MULTIPLE_CHOICE" : "OPEN_ENDED",
      points: q.points,
      options: [],
      correctAnswer: correctAnswer, // Set for both types
    };

    // Map multiple-choice options
    if (q.type === "multiple-choice" && q.options) {
      question.options = q.options.map((option, index) => ({
        text: option,
        correct: index === q.correctAnswer,
      }));
    }

    return question;
  });

  // FIXED: Format dates properly with full ISO string
  const now = new Date();
  const formatDate = (dateString?: string): string => {
    if (!dateString) return now.toISOString();

    // Ensure the date string is properly formatted
    let date = new Date(dateString);

    // If it's an invalid date, use now
    if (isNaN(date.getTime())) {
      date = new Date();
    }

    // Ensure it has seconds and milliseconds
    if (!dateString.includes(":")) {
      // If no time provided, set to end of day
      date.setHours(23, 59, 59, 999);
    } else if (dateString.split(":").length === 2) {
      // If only hours and minutes, add seconds
      date.setSeconds(0, 0);
    }

    return date.toISOString();
  };

  return {
    courseId: "", // Will be set by caller
    unitId: "", // Will be set by caller
    title: quizData.title,
    description: quizData.description || "",
    timeLimitMinutes: quizData.timeLimit || 0,
    availableFrom: formatDate(quizData.dueDate ?? ""),
    availableUntil: formatDate(quizData.dueDate ?? ""),
    questions,
  };
}

/**
 * Maps frontend Quiz data to backend UpdateQuizCommand
 */
async function mapUpdateQuizToBackendCommand(
  quizId: string,
  quizData: Partial<Quiz>
): Promise<UpdateQuizCommand> {
  const command: UpdateQuizCommand = {
    quizId,
  };

  if (quizData.title !== undefined) command.title = quizData.title;
  if (quizData.description !== undefined)
    command.description = quizData.description;
  if (quizData.timeLimit !== undefined)
    command.timeLimitMinutes = quizData.timeLimit;

  // Map dueDate to availableFrom/availableUntil
  if (quizData.dueDate) {
    command.availableFrom = new Date().toISOString();
    command.availableUntil = quizData.dueDate;
  }

  // Set defaults for required fields
  command.maxAttempts = 1;
  command.shuffleQuestions = false;
  command.showCorrectAnswers = false;

  return command;
}

/**
 * Maps backend CompleteQuizDTO to frontend Quiz interface
 */
async function mapQuizFromBackend(dto: CompleteQuizDTO): Promise<Quiz> {
  const questions: Question[] = dto.questions.map((q, index) => {
    const question: Question = {
      id: q.id || `question-${index}`,
      type:
        q.questionType === "MULTIPLE_CHOICE" ? "multiple-choice" : "open-ended",
      question: q.questionText,
      points: q.points,
      text: q.questionText,
      maxPoints: q.points,
    };

    // Map multiple-choice options
    if (q.questionType === "MULTIPLE_CHOICE" && q.options) {
      question.options = q.options.map((opt) => opt.text);

      // Find correct answer index
      const correctIndex = q.options.findIndex((opt) => opt.correct);
      question.correctAnswer = correctIndex >= 0 ? correctIndex : 0;
    }

    // Map open-ended correct answer
    if (q.questionType === "OPEN_ENDED" && q.correctAnswer) {
      question.expectedAnswer = q.correctAnswer;
    }

    return question;
  });

  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    timeLimit: dto.timeLimitMinutes || 0,
    maxGrade: dto.totalPoints || 100,
    dueDate: dto.availableUntil,
    acceptLateSubmissions: true, // Default
    courseId: dto.courseId,

    courseUnitId: dto.unitId,
    questions,
    availableFrom: dto.availableFrom,
    availableUntil: dto.availableUntil,
    maxAttempts: dto.maxAttempts,
    shuffleQuestions: dto.shuffleQuestions,
    showCorrectAnswers: dto.showCorrectAnswers,
    totalPoints: dto.totalPoints,
    questionCount: dto.questionCount,
    courseName: dto.courseName,
    createdAt: dto.createdAt,
    active: dto.active,
    availableNow: dto.availableNow,
  };
}

/**
 * Maps frontend Question to backend AddQuizQuestionCommand
 */
async function mapAddQuestionToBackendCommand(
  quizId: string,
  question: Omit<Question, "id" | "text" | "maxPoints">
): Promise<AddQuizQuestionCommand> {
  // Determine correct answer based on question type
  let correctAnswer: string | undefined;
  
  if (question.type === "multiple-choice") {
    if (question.correctAnswer !== undefined && question.options) {
      const correctOption = question.options[question.correctAnswer];
      correctAnswer = correctOption;
    }
  } else if (question.type === "open-ended") {
    correctAnswer = question.expectedAnswer;
  }

  const command: AddQuizQuestionCommand = {
    quizId,
    questionText: question.question,
    questionType:
      question.type === "multiple-choice" ? "MULTIPLE_CHOICE" : "OPEN_ENDED",
    points: question.points,
    options: [],
    correctAnswer: correctAnswer, // Set for both types
  };

  // Map multiple-choice options
  if (question.type === "multiple-choice" && question.options) {
    command.options = question.options.map((option, index) => ({
      text: option,
      correct: index === question.correctAnswer,
    }));
  }

  return command;
}
// ============================================
// CONFIGURATION & CLIENT SETUP
// ============================================

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = (await cookies()).get("session")?.value;
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

const handleApiError = async (error: unknown): Promise<never> => {
  if (axios.isAxiosError(error)) {
    const errorResponse = error.response?.data as ErrorResponseDTO;
    const errorMessage = errorResponse?.message || error.message;
    console.error("API Error:", errorMessage);

    if (error.response?.status === 401 || error.response?.status === 403) {
      redirect("/courses");
    }

    throw new Error(errorMessage);
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error("An unexpected error occurred");
};

// ============================================
// MOCK DATA
// ============================================

const MOCK_QUIZZES: Quiz[] = [
  {
    id: "quiz-1",
    title: "JavaScript Basics Quiz",
    description: "Test your knowledge of JavaScript fundamentals",
    timeLimit: 30,
    maxGrade: 100,
    dueDate: "2024-12-31T23:59:59Z",
    acceptLateSubmissions: true,
    courseId: "crs-101",
    courseUnitId: "unit-1-1",
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        question: "What is JavaScript?",
        options: [
          "A coffee brand",
          "A programming language",
          "A type of computer",
          "A database system",
        ],
        correctAnswer: 1,
        points: 10,
        text: "What is JavaScript?",
        maxPoints: 10,
      },
      {
        id: "q2",
        type: "open-ended",
        question: "Explain the difference between let and var in JavaScript",
        points: 20,
        text: "Explain the difference between let and var in JavaScript",
        maxPoints: 20,
        expectedAnswer: "let has block scope while var has function scope",
      },
    ],

    availableFrom: "2024-01-01T00:00:00Z",
    availableUntil: "2024-12-31T23:59:59Z",
    maxAttempts: 3,
    shuffleQuestions: true,
    showCorrectAnswers: true,
    totalPoints: 100,
    questionCount: 2,
    courseName: "JavaScript Fundamentals",
    createdAt: "2024-01-01T00:00:00Z",
    unitName: "Introduction to JavaScript",
    active: true,
    availableNow: true,
  },
];

const simulateDelay = async (ms: number = 500): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ============================================
// API FUNCTIONS - THE 4 REQUIRED METHODS
// ============================================

/**
 * 1. Create a new quiz with questions
 * Backend: POST /api/quizzes/with-questions
 */

// CURRENTLY WORKS

export async function createQuiz(
  courseId: string,
  unitId: string,
  quizData: Omit<
    Quiz,
    "id" | "courseId" | "courseUnitId" | "createdAt" | "active" | "availableNow"
  >
): Promise<Quiz> {
  if (isMockEnabled) {
    await simulateDelay(800);

    const newQuiz: Quiz = {
      ...quizData,
      courseId,
      courseUnitId: unitId,
      id: `quiz-${Date.now()}`,
      createdAt: new Date().toISOString(),
      active: true,
      availableNow: true,
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
    const command = await mapCreateQuizToBackendCommand(quizData);
    command.courseId = courseId;
    command.unitId = unitId;

    console.log("Sending create quiz request:", command);

    const response = await apiClient.post<SuccessResponseDTO>(
      "/api/quizzes/with-questions",
      command
    );

    // The response should contain the created quiz ID
    const quizId = response.data.data;

    // Fetch the complete quiz details to return
    const quizDetail = await fetchQuizDetail(quizId);

    console.log("Backend: Created new quiz with ID:", quizId);
    return quizDetail;
  } catch (error) {
    console.error("Error creating quiz:", error);
    return await handleApiError(error);
  }
}

/**
 * 2. Update an existing quiz (basic info only, not questions)
 * Backend: PUT /api/quizzes/{quizId}
 */
// CURRENTLY WORKS

export async function updateQuiz(
  quizId: string,
  quizData: Partial<Quiz>
): Promise<Quiz> {
  if (isMockEnabled) {
    await simulateDelay(800);

    const quizIndex = MOCK_QUIZZES.findIndex((q) => q.id === quizId);

    if (quizIndex === -1) {
      throw new Error(`Quiz not found: ${quizId}`);
    }

    MOCK_QUIZZES[quizIndex] = {
      ...MOCK_QUIZZES[quizIndex],
      ...quizData,
    } as Quiz;

    console.log(`MOCK: Updated quiz ${quizId}`);
    return MOCK_QUIZZES[quizIndex];
  }

  try {
    const command = await mapUpdateQuizToBackendCommand(quizId, quizData);

    console.log("Sending update quiz request:", command);

    await apiClient.put<SuccessResponseDTO>(`/api/quizzes/${quizId}`, command);

    // Fetch the updated quiz details
    const updatedQuiz = await fetchQuizDetail(quizId);

    console.log("Backend: Updated quiz:", quizId);
    return updatedQuiz;
  } catch (error) {
    console.error("Error updating quiz:", error);
    return await handleApiError(error);
  }
}

/**
 * 3. Delete a quiz
 * Backend: DELETE /api/quizzes/{quizId}
 */


// CURRENTLY WORKS

export async function deleteQuiz(quizId: string): Promise<void> {
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
    console.log("Deleting quiz:", quizId);

    await apiClient.delete(`/api/quizzes/${quizId}`);

    console.log("Backend: Deleted quiz:", quizId);
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return await handleApiError(error);
  }
}

/**
 * 4. Add a single question to an existing quiz (for edit mode)
 * Backend: POST /api/quizzes/{quizId}/questions
 */

// CURRENTLY WORKS

export async function addQuizQuestion(
  quizId: string,
  question: Omit<Question, "id" | "text" | "maxPoints">
): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(800);

    const quizIndex = MOCK_QUIZZES.findIndex((q) => q.id === quizId);

    if (quizIndex === -1) {
      throw new Error(`Quiz not found: ${quizId}`);
    }

    const newQuestion: Question = {
      ...question,
      id: `question-${Date.now()}`,
      text: question.question,
      maxPoints: question.points,
    };

    MOCK_QUIZZES[quizIndex].questions.push(newQuestion);

    console.log(`MOCK: Added question to quiz ${quizId}`);
    return;
  }

  try {
    const command = await mapAddQuestionToBackendCommand(quizId, question);

    console.log("Adding question to quiz:", command);

    await apiClient.post<SuccessResponseDTO>(
      `/api/quizzes/${quizId}/questions`,
      command
    );

    console.log("Backend: Added question to quiz:", quizId);
  } catch (error) {
    console.error("Error adding question to quiz:", error);
    return await handleApiError(error);
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Fetch quiz detail for teacher view
 * Backend: GET /api/quizzes/{quizId}/complete
 */
// CURRENTLY WORKS

export async function fetchQuizDetail(quizId: string): Promise<Quiz> {
  if (isMockEnabled) {
    await simulateDelay();
    const quiz = MOCK_QUIZZES.find((q) => q.id === quizId);
    if (!quiz) {
      throw new Error(`Quiz not found: ${quizId}`);
    }
    console.log(`MOCK: Fetching quiz detail ${quizId}`);
    return quiz;
  }

  try {
    const response = await apiClient.get<CompleteQuizDTO>(
      `/api/quizzes/${quizId}/complete`
    );

    const quiz = await mapQuizFromBackend(response.data);
    return quiz;
  } catch (error) {
    console.error("Error fetching quiz detail:", error);
    return await handleApiError(error);
  }
}

/**
 * Fetch quizzes by course unit
 */
export async function fetchQuizzesByUnit(
  courseId: string,
  unitId: string
): Promise<Quiz[]> {
  if (isMockEnabled) {
    await simulateDelay();
    const quizzes = MOCK_QUIZZES.filter(
      (q) => q.courseId === courseId && q.courseUnitId === unitId
    );
    console.log(`MOCK: Fetching ${quizzes.length} quizzes for unit ${unitId}`);
    return quizzes;
  }

  try {
    // First get basic quizzes for the course
    const response = await apiClient.get<QuizDTO[]>(
      `/api/quizzes/course/${courseId}/basic`
    );

    // Filter by unit and fetch details for each
    const unitQuizzes = await Promise.all(
      response.data
        .filter((quiz) => {
          // Note: QuizDTO doesn't have unitId, so we need to fetch details
          // This is a limitation - consider adding unitId to QuizDTO
          return true; // Will filter after fetching details
        })
        .map(async (quiz) => {
          try {
            return await fetchQuizDetail(quiz.id);
          } catch {
            return null;
          }
        })
    );

    // Filter by unitId and remove nulls
    return unitQuizzes.filter(
      (quiz): quiz is Quiz => quiz !== null && quiz.courseUnitId === unitId
    );
  } catch (error) {
    console.error("Error fetching quizzes by unit:", error);
    return await handleApiError(error);
  }
}

/**
 * 5. Add multiple questions to a quiz in bulk
 * Backend: POST /api/quizzes/{quizId}/questions/bulk
 */

// CURRENTLY WORKS

export async function addQuizQuestionsBulk(
  quizId: string,
  questions: Omit<Question, "id" | "text" | "maxPoints">[]
): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(800);

    const quizIndex = MOCK_QUIZZES.findIndex((q) => q.id === quizId);

    if (quizIndex === -1) {
      throw new Error(`Quiz not found: ${quizId}`);
    }

    questions.forEach((question) => {
      const newQuestion: Question = {
        ...question,
        id: `question-${Date.now()}-${Math.random()}`,
        text: question.question,
        maxPoints: question.points,
      };

      MOCK_QUIZZES[quizIndex].questions.push(newQuestion);
    });

    console.log(`MOCK: Added ${questions.length} questions to quiz ${quizId}`);
    return;
  }

 try {
    // Map questions to backend format
    const quizQuestions: QuizQuestionData[] = questions.map((q) => {
      // Determine correct answer based on question type
      let correctAnswer: string | undefined;
      
      if (q.type === "multiple-choice") {
        if (q.correctAnswer !== undefined && q.options) {
          const correctOption = q.options[q.correctAnswer];
          correctAnswer = correctOption;
        }
      } else if (q.type === "open-ended") {
        correctAnswer = q.expectedAnswer;
      }

      const questionData: QuizQuestionData = {
        questionText: q.question,
        questionType:
          q.type === "multiple-choice" ? "MULTIPLE_CHOICE" : "OPEN_ENDED",
        points: q.points,
        options: [],
        correctAnswer: correctAnswer, // Set for both types
      };

      // Map multiple-choice options
      if (q.type === "multiple-choice" && q.options) {
        questionData.options = q.options.map((option, index) => ({
          text: option,
          correct: index === q.correctAnswer,
        }));
      }

      return questionData;
    });

    const command: AddQuizQuestionsBulkCommand = {
      quizId,
      questions: quizQuestions,
    };

    console.log(
      `Adding ${questions.length} questions in bulk to quiz:`,
      quizId
    );

    await apiClient.post<SuccessResponseDTO>(
      `/api/quizzes/${quizId}/questions/bulk`,
      command
    );

    console.log(
      `Backend: Added ${questions.length} questions to quiz:`,
      quizId
    );
  } catch (error) {
    console.error("Error adding questions in bulk:", error);
    return await handleApiError(error);
  }
}

/**
 * 6. Delete multiple questions from a quiz in bulk
 * Backend: DELETE /api/quizzes/{quizId}/questions/bulk
 */

// CURRENTLY WORKS

export async function deleteQuizQuestionsBulk(
  quizId: string,
  questionIds: string[]
): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(800);

    const quizIndex = MOCK_QUIZZES.findIndex((q) => q.id === quizId);

    if (quizIndex === -1) {
      throw new Error(`Quiz not found: ${quizId}`);
    }

    // Filter out deleted questions
    MOCK_QUIZZES[quizIndex].questions = MOCK_QUIZZES[
      quizIndex
    ].questions.filter((q) => !questionIds.includes(q.id));

    console.log(
      `MOCK: Deleted ${questionIds.length} questions from quiz ${quizId}`
    );
    return;
  }

  try {
    const command: DeleteQuizQuestionsBulkCommand = {
      quizId,
      questionIds,
    };

    console.log(
      `Deleting ${questionIds.length} questions in bulk from quiz:`,
      quizId
    );

    await apiClient.delete<SuccessResponseDTO>(
      `/api/quizzes/${quizId}/questions/bulk`,
      { data: command }
    );

    console.log(
      `Backend: Deleted ${questionIds.length} questions from quiz:`,
      quizId
    );
  } catch (error) {
    console.error("Error deleting questions in bulk:", error);
    return await handleApiError(error);
  }
}
/**
 * 7. Update multiple questions in bulk
 * Backend: PUT /api/quizzes/{quizId}/questions/bulk
 */


// CURRENTLY WORKS

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
    if (quizIndex === -1) {
      throw new Error(`Quiz not found: ${quizId}`);
    }

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
        if (update.type !== undefined) {
          question.type = update.type;
        }
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
    // 🔥 FIXED: Properly map updates to match backend structure
    const questionUpdates: QuestionUpdateData[] = updates.map((update) => {
      // Determine the correct answer based on question type
      let correctAnswer: string | undefined = undefined;
      
      if (update.type === "multiple-choice" && update.options && update.correctAnswer !== undefined) {
        // For multiple choice, get the text of the correct option
        const correctIndex = typeof update.correctAnswer === 'number' ? update.correctAnswer : 0;
        correctAnswer = update.options[correctIndex];
      } else if (update.type === "open-ended" && update.expectedAnswer) {
        // For open-ended, use the expected answer
        correctAnswer = update.expectedAnswer;
      }

      // Build the update data object
      const updateData: QuestionUpdateData = {
        questionId: update.questionId,
        questionText: update.questionText || null,
        questionType: update.type ? (update.type === "multiple-choice" ? "MULTIPLE_CHOICE" : "OPEN_ENDED") : null,
        points: update.points !== undefined ? update.points : null,
        options: null,
        correctAnswer: correctAnswer || null,
        action: update.action || "UPDATE_ALL" // Default to UPDATE_ALL if not specified
      };

      // Map options for multiple-choice questions
      if (update.type === "multiple-choice" && update.options && update.options.length > 0) {
        updateData.options = update.options.map((option, index) => ({
          text: option,
          correct: index === (typeof update.correctAnswer === 'number' ? update.correctAnswer : 0),
          optionId: null, // We don't track option IDs in the frontend
          action: "UPDATE" as const
        }));
      }

      return updateData;
    });

    const command: UpdateQuizQuestionsBulkCommand = {
      quizId,
      questions: questionUpdates,
    };

    console.log(`Updating ${updates.length} questions in bulk for quiz:`, quizId);
    console.log("Update command:", JSON.stringify(command, null, 2));

    const response = await apiClient.put<SuccessResponseDTO>(
      `/api/quizzes/${quizId}/questions/bulk`,
      command
    );

    console.log(`Backend: Updated ${updates.length} questions in quiz:`, quizId, response.data);
  } catch (error) {
    console.error("Error updating questions in bulk:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("Backend error response:", error.response.data);
    }
    return await handleApiError(error);
  }
}
/**
 * 8. Update points for multiple questions in bulk
 * Backend: PATCH /api/quizzes/{quizId}/questions/points
 */

// CURRENTLY WORKS

export async function updateQuestionsPointsBulk(
  quizId: string,
  questionPoints: Record<string, number>
): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(800);

    const quizIndex = MOCK_QUIZZES.findIndex((q) => q.id === quizId);

    if (quizIndex === -1) {
      throw new Error(`Quiz not found: ${quizId}`);
    }

    Object.entries(questionPoints).forEach(([questionId, points]) => {
      const questionIndex = MOCK_QUIZZES[quizIndex].questions.findIndex(
        (q) => q.id === questionId
      );

      if (questionIndex !== -1) {
        MOCK_QUIZZES[quizIndex].questions[questionIndex].points = points;
        MOCK_QUIZZES[quizIndex].questions[questionIndex].maxPoints = points;
      }
    });

    console.log(
      `MOCK: Updated points for ${Object.keys(questionPoints).length} questions`
    );
    return;
  }

  try {
    const command = {
      quizId,
      questionPoints,
    };

    console.log(
      `Updating points for ${Object.keys(questionPoints).length} questions:`,
      quizId
    );

    await apiClient.patch<SuccessResponseDTO>(
      `/api/quizzes/${quizId}/questions/points`,
      command
    );

    console.log(
      `Backend: Updated points for ${
        Object.keys(questionPoints).length
      } questions`
    );
  } catch (error) {
    console.error("Error updating question points in bulk:", error);
    return await handleApiError(error);
  }
}

/**
 * 9. Update options for multiple questions in bulk
 * Backend: PATCH /api/quizzes/{quizId}/questions/options
 */
// CURRENTLY WORKS

export async function updateQuestionsOptionsBulk(
  quizId: string,
  questionOptions: Record<
    string,
    {
      options: string[];
      correctAnswer: number;
    }
  >
): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(800);

    const quizIndex = MOCK_QUIZZES.findIndex((q) => q.id === quizId);

    if (quizIndex === -1) {
      throw new Error(`Quiz not found: ${quizId}`);
    }

    Object.entries(questionOptions).forEach(([questionId, data]) => {
      const questionIndex = MOCK_QUIZZES[quizIndex].questions.findIndex(
        (q) => q.id === questionId && q.type === "multiple-choice"
      );

      if (questionIndex !== -1) {
        MOCK_QUIZZES[quizIndex].questions[questionIndex].options = data.options;
        MOCK_QUIZZES[quizIndex].questions[questionIndex].correctAnswer =
          data.correctAnswer;
      }
    });

    console.log(
      `MOCK: Updated options for ${
        Object.keys(questionOptions).length
      } questions`
    );
    return;
  }

  try {
    // Map to backend format
    const backendQuestionOptions: Record<string, QuestionOptionData[]> = {};

    Object.entries(questionOptions).forEach(([questionId, data]) => {
      backendQuestionOptions[questionId] = data.options.map(
        (option, index) => ({
          text: option,
          correct: index === data.correctAnswer,
        })
      );
    });

    const command: UpdateQuestionsOptionsCommand = {
      quizId,
      questionOptions: backendQuestionOptions,
    };

    console.log(
      `Updating options for ${Object.keys(questionOptions).length} questions:`,
      quizId
    );

    await apiClient.patch<SuccessResponseDTO>(
      `/api/quizzes/${quizId}/questions/options`,
      command
    );

    console.log(
      `Backend: Updated options for ${
        Object.keys(questionOptions).length
      } questions`
    );
  } catch (error) {
    console.error("Error updating question options in bulk:", error);
    return await handleApiError(error);
  }
}

/**
 * Validate quiz data before creation/update
 */
export async function validateQuizData(quizData: Partial<Quiz>): Promise<{
  isValid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  if (!quizData.title?.trim()) {
    errors.push("Quiz title is required");
  }

  if (quizData.questions && quizData.questions.length === 0) {
    errors.push("At least one question is required");
  }

  if (quizData.questions) {
    quizData.questions.forEach((q, index) => {
      if (!q.question?.trim()) {
        errors.push(`Question ${index + 1}: Question text is required`);
      }
      if (q.points <= 0) {
        errors.push(`Question ${index + 1}: Points must be greater than 0`);
      }
      if (q.type === "multiple-choice") {
        if (!q.options || q.options.length < 2) {
          errors.push(
            `Question ${
              index + 1
            }: At least 2 options are required for multiple choice`
          );
        }
        if (q.options && q.options.some((opt) => !opt.trim())) {
          errors.push(`Question ${index + 1}: All options must have text`);
        }
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}




// ============================================
// UPDATED BACKEND DTO TYPES
// ============================================

export interface GradedQuestionResponseDTO {
  questionId: string;
  questionText: string;
  questionType: string;
  maxPoints: number;
  earnedPoints: number; // Points earned for this specific question
  teacherFeedback: string; // Teacher's feedback (optional)
  isAutoGraded: boolean; // Whether this was auto-graded
  options: QuestionOptionDTO[];
  selectedOptions: number[];
  textAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
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

export interface GradeQuizSubmissionCommand {
  quizSubmissionId: string;
  earnedPoints: number;
  totalPoints: number;
  questionGrades: QuestionGrade[];
}

export interface QuestionGrade {
  questionId: string;
  earnedPoints: number;
  maxPoints: number;
  feedback: string; // Optional teacher feedback
}

// ============================================
// FRONTEND TYPES
// ============================================

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
}

export interface GradedQuestionResponse {
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

// ============================================
// MAPPER - BACKEND TO FRONTEND
// ============================================

async function mapBackendQuizSubmissionDetailToFrontend(
  dto: QuizSubmissionDetailForGradingDTO
): Promise<QuizSubmissionDetail> {
  return {
    id: dto.id,
    quizId: dto.quizId,
    quizTitle: dto.quizTitle,
    studentId: dto.studentId,
    studentName: dto.studentName,
    attemptNumber: dto.attemptNumber,
    startedAt: dto.startedAt,
    submittedAt: dto.submittedAt,
    status: dto.status,
    grade: dto.grade,
    autoGraded: dto.autoGraded,
    questionResponses: dto.questionResponses.map(qr => ({
      questionId: qr.questionId,
      questionText: qr.questionText,
      questionType: qr.questionType,
      maxPoints: qr.maxPoints,
      earnedPoints: qr.earnedPoints,
      teacherFeedback: qr.teacherFeedback || '',
      isAutoGraded: qr.isAutoGraded,
      options: qr.options,
      selectedOptions: qr.selectedOptions,
      textAnswer: qr.textAnswer,
      correctAnswer: qr.correctAnswer,
      isCorrect: qr.isCorrect,
    })),
    timeExpired: dto.timeExpired,
    unitId: dto.unitId,
    unitName: dto.unitName,
  };
}

// ============================================
// UPDATED API FUNCTIONS
// ============================================

/**
 * Fetch quiz submission detail for grading
 */
// CURRENTLY WORKS

export async function fetchQuizSubmissionDetail(
  submissionId: string
): Promise<QuizSubmissionDetail> {
  if (isMockEnabled) {
    await simulateDelay();
    console.log(`MOCK: Returning quiz submission detail for ${submissionId}`);
    // Return mock data matching the new structure
    const mockDetail: QuizSubmissionDetail = {
      id: submissionId,
      quizId: 'quiz-2',
      quizTitle: 'UX Design Fundamentals Quiz',
      studentId: 'student-001',
      studentName: 'Emma Johnson',
      attemptNumber: 1,
      startedAt: '2024-03-21T10:00:00Z',
      submittedAt: '2024-03-21T10:15:00Z',
      status: 'GRADED',
      grade: {
        value: '85',
        maxScore: '100',
        percentage: '85'
      },
      autoGraded: true,
      questionResponses: [
        {
          questionId: 'q-101-1',
          questionText: 'What does UCD stand for in design?',
          questionType: 'MULTIPLE_CHOICE',
          maxPoints: 10,
          earnedPoints: 10,
          teacherFeedback: '',
          isAutoGraded: true,
          options: [
            { text: 'User-Centered Design', correct: true },
            { text: 'User-Created Development', correct: false },
            { text: 'Universal Component Design', correct: false },
            { text: 'User Configuration Document', correct: false },
          ],
          selectedOptions: [0],
          textAnswer: '',
          correctAnswer: '0',
          isCorrect: true,
        },
        {
          questionId: 'q-101-2',
          questionText: 'Which of the following is NOT a key principle of UX design?',
          questionType: 'MULTIPLE_CHOICE',
          maxPoints: 10,
          earnedPoints: 0,
          teacherFeedback: '',
          isAutoGraded: true,
          options: [
            { text: 'Consistency', correct: false },
            { text: 'User Control', correct: false },
            { text: 'Complex Navigation', correct: true },
            { text: 'Accessibility', correct: false },
          ],
          selectedOptions: [1],
          textAnswer: '',
          correctAnswer: '2',
          isCorrect: false,
        },
        {
          questionId: 'q-101-3',
          questionText: 'Explain the importance of user research in the design process.',
          questionType: 'OPEN_ENDED',
          maxPoints: 20,
          earnedPoints: 15,
          teacherFeedback: 'Good answer, but could provide more specific examples.',
          isAutoGraded: false,
          options: [],
          selectedOptions: [],
          textAnswer: 'User research helps understand what users need and want.',
          correctAnswer: 'User research helps designers understand user needs, behaviors, and pain points, ensuring the final product meets real user requirements rather than assumptions.',
          isCorrect: false,
        },
      ],
      timeExpired: false,
      unitId: 'UNIT-1',
      unitName: 'Introduction to UX',
    };
    return mockDetail;
  }

  try {
    const response = await apiClient.get<QuizSubmissionDetailForGradingDTO>(
      `/api/quiz-submissions/${submissionId}/detail`
    );
    const detail = await mapBackendQuizSubmissionDetailToFrontend(response.data);
    return detail;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Grade a quiz submission with individual question grades
 */

// CURRENTLY WORK

export async function gradeQuizSubmission(
  submissionId: string,
  grades: { questionId: string; score: number; feedback?: string }[],
  overallGrade?: string
): Promise<QuizSubmissionDetail> {
  if (isMockEnabled) {
    await simulateDelay(800);
    console.log(`MOCK: Grading submission ${submissionId}`);
    // Return updated submission with grades
    const mockGradedSubmission: QuizSubmissionDetail = {
      id: submissionId,
      quizId: 'quiz-2',
      quizTitle: 'UX Design Fundamentals Quiz',
      studentId: 'student-001',
      studentName: 'Emma Johnson',
      attemptNumber: 1,
      startedAt: '2024-03-21T10:00:00Z',
      submittedAt: '2024-03-21T10:15:00Z',
      status: 'GRADED',
      grade: {
        value: overallGrade || grades.reduce((sum, g) => sum + g.score, 0).toString(),
        maxScore: '100',
        percentage: overallGrade || '85'
      },
      autoGraded: false,
      questionResponses: grades.map(g => ({
        questionId: g.questionId,
        questionText: 'Sample question',
        questionType: 'MULTIPLE_CHOICE',
        maxPoints: 10,
        earnedPoints: g.score,
        teacherFeedback: g.feedback || '',
        isAutoGraded: false,
        options: [],
        selectedOptions: [],
        textAnswer: '',
        correctAnswer: '',
        isCorrect: false,
      })),
      timeExpired: false,
      unitId: 'UNIT-1',
      unitName: 'Introduction to UX',
    };
    return mockGradedSubmission;
  }

  try {
    // Calculate total points from individual grades
    const earnedPoints = grades.reduce((sum, grade) => sum + grade.score, 0);
    const totalPoints = grades.reduce((sum, grade) => {
      // You might want to get max points from the original submission
      return sum + grade.score; // This should be maxPoints, not score
    }, 0);

    // Prepare question grades
    const questionGrades: QuestionGrade[] = grades.map(grade => ({
      questionId: grade.questionId,
      earnedPoints: grade.score,
      maxPoints: grade.score, // This should come from the question data
      feedback: grade.feedback || '',
    }));

    const backendCommand: GradeQuizSubmissionCommand = {
      quizSubmissionId: submissionId,
      earnedPoints: overallGrade ? parseInt(overallGrade) : earnedPoints,
      totalPoints: totalPoints,
      questionGrades: questionGrades,
    };

    const response = await apiClient.post <QuizSubmissionDetailForGradingDTO>(`/api/quiz-submissions/${submissionId}/grade`, backendCommand);
    
    // Fetch the updated graded submission
    const gradedSubmission = await mapBackendQuizSubmissionDetailToFrontend(response.data);
    return gradedSubmission;
  } catch (error) {
    return await handleApiError(error);
  }
}
