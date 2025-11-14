// File: src/app/features/courses/api/quiz-api.ts
"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Quiz } from "@/app/domain/entities/CourseEntities";
import { CourseId, UnitId } from "@/app/domain/valueObjects";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const isMockEnabled = true; // Enable mock data

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

const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
    redirect("/courses");
    throw new Error(errorMessage);
  }
  throw error;
};

// Mock data for quizzes
const MOCK_QUIZZES: Quiz[] = [
  {
    id: "quiz-11",
    title: "JavaScript Basics Quiz",
    description: "Test your knowledge of JavaScript fundamentals",
    courseUnitId: "unit-1-1",
    courseId: "crs-101",
    maxGrade: 100,
    timeLimit: 30,
    passingScore: 70,
    dueDate: "2024-02-05T23:59:00Z",
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        text: "What does 'let' keyword do in JavaScript?",
        maxPoints: 10,
        question: "What does 'let' keyword do in JavaScript?",
        options: [
          "Declares a block-scoped variable",
          "Declares a global variable",
          "Declares a constant variable",
          "Imports a module"
        ],
        correctAnswer: 0,
        points: 10,
      },
      {
        id: "q2",
        type: "open-ended",
        text: "Explain the difference between 'let' and 'const'",
        maxPoints: 20,
        question: "Explain the difference between 'let' and 'const'",
        points: 20,
        expectedAnswer: "'let' allows reassignment while 'const' does not"
      }
    ],
    acceptLateSubmissions: true
  },
  {
    id: "quiz-2", 
    title: "Control Flow Quiz",
    description: "Test your understanding of conditional statements and loops",
    courseUnitId: "unit-1-2",
    courseId: "crs-101",
    maxGrade: 100,
    timeLimit: 45,
    passingScore: 75,
    dueDate: "2024-02-15T23:59:00Z",
    questions: [
      {
        id: "q3",
        type: "multiple-choice",
        text: "Which loop is guaranteed to execute at least once?",
        maxPoints: 15,
        question: "Which loop is guaranteed to execute at least once?",
        options: [
          "for loop",
          "while loop",
          "do...while loop", 
          "forEach loop"
        ],
        correctAnswer: 2,
        points: 15
      }
    ],
    acceptLateSubmissions: false
  }
];

const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchQuizzesByUnit(courseId: CourseId, unitId: UnitId): Promise<Quiz[]> {
  if (isMockEnabled) {
    await simulateDelay();
    console.log(`MOCK: Fetching quizzes for course ${courseId}, unit ${unitId}`);
    return MOCK_QUIZZES.filter(quiz => quiz.courseId === courseId && quiz.courseUnitId === unitId);
  }

  try {
    const response = await apiClient.get(`/courses/${courseId}/units/${unitId}/quizzes`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchQuizById(quizId: string): Promise<Quiz> {
  if (isMockEnabled) {
    await simulateDelay();
    const quiz = MOCK_QUIZZES.find(q => q.id === quizId);
    if (!quiz) {
      throw new Error(`Quiz not found: ${quizId}`);
    }
    console.log(`MOCK: Fetching quiz ${quizId}`);
    return quiz;
  }

  try {
    const response = await apiClient.get(`/quizzes/${quizId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function createQuiz(
  courseId: CourseId,
  unitId: UnitId,
  quizData: Omit<Quiz, "id" | "courseId" | "unitId" | "createdAt">
): Promise<Quiz> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const newQuiz: Quiz = {
      ...quizData,
      id: `quiz-${Date.now()}`,
      courseId,
      courseUnitId: unitId
    };
    MOCK_QUIZZES.push(newQuiz);
    console.log("MOCK: Created new quiz", newQuiz);
    return newQuiz;
  }

  try {
    const response = await apiClient.post(`/courses/${courseId}/units/${unitId}/quizzes`, quizData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateQuiz(
  quizId: string,
  quizData: Partial<Omit<Quiz, "id" | "courseId" | "unitId" | "createdAt">> = {}
): Promise<Quiz> {
   console.log("Updating quiz:", quizId, quizData);
    if (isMockEnabled) {
    // await simulateDelay(600);
    // const index = MOCK_QUIZZES.findIndex(quiz => quiz.id === quizId);
    // if (index !== -1) {
    //   MOCK_QUIZZES[index] = { ...MOCK_QUIZZES[index], ...quizData };
    //   console.log(`MOCK: Updated quiz ${quizId}`, quizData);
    //   return MOCK_QUIZZES[index];
    // }
    // throw new Error(`Quiz not found: ${quizId}`);
  }

  try {
    // const response = await apiClient.put(`/quizzes/${quizId}`, quizData);
    // return response.data;
    return quizData as Quiz;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteQuiz(quizId: string): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(400);
    const index = MOCK_QUIZZES.findIndex(quiz => quiz.id === quizId);
    if (index !== -1) {
      MOCK_QUIZZES.splice(index, 1);
      console.log(`MOCK: Deleted quiz ${quizId}`);
      return;
    }
    throw new Error(`Quiz not found: ${quizId}`);
  }

  try {
    await apiClient.delete(`/quizzes/${quizId}`);
  } catch (error) {
    return handleApiError(error);
  }
}