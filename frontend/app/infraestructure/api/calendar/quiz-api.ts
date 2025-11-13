// File: src/app/features/quizzes/api/quiz-api.ts
"use server";

import axios from "axios";
import { cookies } from "next/headers";
import {  Question } from "@/app/domain/entities/CourseEntities";
import { CourseId, QuizId, UnitId } from "@/app/domain/valueObjects/CourseValues";
import { UserId } from "@/app/domain/valueObjects";
// --- MOCKING CONFIGURATION AND DATA ---
export interface Quiz {
  /** Unique identifier for the quiz. */
  id: QuizId;
  description: string;
  /** Link back to the parent course unit. */
  courseUnitId: UnitId;
  courseId: CourseId; 

  idUser: UserId;
  /** Name of the quiz (e.g., "UCD Fundamentals Quiz"). */
  title: string;
  /** Maximum number of times a student can take the quiz. */
  maxGrade: number;
  /** Time limit in minutes (or seconds). */
  timeLimit: number;
  /** Percentage required to pass (e.g., 70). */
  passingScore: number;

  dueDate: string | null;
  /** Array of Question objects. */
  questions: Question[];
  acceptLateSubmissions: boolean;
}
const isMockEnabled = true;
const MOCK_QUIZZES: Quiz[] = [
  {
    id: "sub-quiz-1",
    title: "UX Design Fundamentals Quiz",
    description: "Test your knowledge of basic UX design principles and methodologies",
    courseUnitId: "UNIT-1",
    courseId: "COURSE-DES-401",
    maxGrade: 100,
    timeLimit: 30,
    passingScore: 70,
    dueDate: "2025-11-24T23:59:00Z",
    acceptLateSubmissions: true,
    idUser: "user-001",
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
          "User Configuration Document"
        ],
        correctAnswer: 0,
        points: 10,
        expectedAnswer: ""
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
          "Accessibility"
        ],
        correctAnswer: 2,
        points: 10,
        expectedAnswer: ""
      },
      {
        id: "q-101-3",
        type: "open-ended",
        text: "Explain the importance of user research in the design process.",
        maxPoints: 20,
       
        question: "Explain the importance of user research in the design process.",
        points: 20,
        expectedAnswer: "User research helps designers understand user needs, behaviors, and pain points, ensuring the final product meets real user requirements rather than assumptions."
      }
    
    ]
  },
  {
    id: "quiz-102",
    idUser: "user-001",

    title: "User Research Methods Assessment",
    description: "Evaluate your understanding of various user research techniques and when to apply them",
    courseUnitId: "UNIT-2",
    courseId: "COURSE-DES-401",
    maxGrade: 100,
    timeLimit: 45,
    passingScore: 75,
    dueDate: "2025-11-27T23:59:00Z",
    acceptLateSubmissions: false,
    questions: [
      {
        id: "q-102-1",
        type: "multiple-choice",
        text: "Which research method is best for understanding user behaviors in their natural environment?",
        maxPoints: 15,
     
        question: "Which research method is best for understanding user behaviors in their natural environment?",
        options: [
          "Contextual Inquiry",
          "Online Survey",
          "A/B Testing",
          "Focus Groups"
        ],
        correctAnswer: 0,
        points: 15,
        expectedAnswer: ""
      },
      {
        id: "q-102-2",
        type: "open-ended",
        text: "Compare and contrast qualitative vs quantitative research methods.",
        maxPoints: 25,
       
        question: "Compare and contrast qualitative vs quantitative research methods.",
        points: 25,
        expectedAnswer: "Qualitative research focuses on understanding why users behave certain ways through methods like interviews and observations, while quantitative research measures what users do through metrics and statistics."
      }
    ]
  },
  {
    id: "quiz-201",
    idUser: "user-001",

    title: "Linear Algebra Basics",
    description: "Fundamental concepts of linear algebra including vectors and matrices",
    courseUnitId: "UNIT-2-1",
    courseId: "crs-202",
    maxGrade: 100,
    timeLimit: 60,
    passingScore: 65,
    dueDate: "2025-11-21T23:59:00Z",
    acceptLateSubmissions: true,
    questions: [
      {
        id: "q-201-1",
        type: "multiple-choice",
        text: "What is the determinant of a 2x2 identity matrix?",
        maxPoints: 10,
        question: "What is the determinant of a 2x2 identity matrix?",
        options: ["0", "1", "2", "-1"],
        correctAnswer: 1,
        points: 10,
        expectedAnswer: ""
      },
      {
        id: "q-201-2",
        type: "open-ended",
        text: "Explain the concept of linear independence in vector spaces.",
        maxPoints: 30,
        question: "Explain the concept of linear independence in vector spaces.",
        points: 30,
        expectedAnswer: "Vectors are linearly independent if no vector in the set can be written as a linear combination of the others. This means the only solution to the equation c1v1 + c2v2 + ... + cnvn = 0 is when all coefficients c1, c2, ..., cn are zero."
      }
    ]
  },
  {
    id: "quiz-103",
    title: "Prototyping Techniques Quiz",
    description: "Test your knowledge of different prototyping methods and tools",
    courseUnitId: "UNIT-3",
    courseId: "COURSE-DES-401",
    idUser: "user-001",

    maxGrade: 100,
    timeLimit: 25,
    passingScore: 70,
    dueDate: "2025-11-30T23:59:00Z",
    acceptLateSubmissions: true,
    questions: [
      {
        id: "q-103-1",
        type: "multiple-choice",
        text: "Which prototyping method is most suitable for testing complex interactions?",
        maxPoints: 15,
        question: "Which prototyping method is most suitable for testing complex interactions?",
        options: [
          "Paper Prototyping",
          "High-Fidelity Digital Prototyping",
          "Wireframing",
          "Storyboarding"
        ],
        correctAnswer: 1,
        points: 15,
        expectedAnswer: ""
      }
    ]
  }
];
// Utility to simulate network delay for mock data
const simulateDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// --- API CLIENT CONFIGURATION (ONLY USED WHEN MOCKING IS DISABLED) ---

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
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

const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(errorMessage);
  }
  throw error;
};

export async function fetchQuizzesByMonth(
  userId: string,
  monthStart: string,
  userType: 'teacher' | 'student'
): Promise<Quiz[]> {
  if (isMockEnabled) {
    await simulateDelay();
    
    // Filter quizzes based on user type and date range
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
    console.log("FILTERED QUIZZES DATA:", filteredQuizzes);
    console.log("QUIZ IDs:", filteredQuizzes.map(q => q.id));
    
    return filteredQuizzes;
  }

  try {
    const response = await apiClient.get(`/${userType}s/${userId}/quizzes`, {
      params: { 
        monthStart,
        view: 'monthly'
      }
    });
    return response.data;
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
      console.error(`MOCK: Quiz with ID ${quizId} not found`);
      throw new Error(`Quiz not found: ${quizId}`);
    }

    // For students, we might want to hide correct answers until after submission
    const quizForUser = userType === 'student' 
      ? {
          ...quiz,
          questions: quiz.questions.map(q => ({
            ...q,
            correctAnswer: undefined, // Hide correct answers from students
            expectedAnswer: undefined // Hide expected answers
          }))
        }
      : quiz;

    console.log(`MOCK: Returning quiz detail for ${quizId} for ${userType}`);
    console.log("QUIZ DETAIL DATA:", quizForUser);
    console.log("QUIZ ID:", quizForUser.id);
    console.log("QUESTIONS COUNT:", quizForUser.questions.length);
    console.log("QUESTION IDs:", quizForUser.questions.map(q => q.id));
    
    return quizForUser;
  }

  try {
    const response = await apiClient.get(`/quizzes/${quizId}`, {
      params: { userType }
    });
    return response.data;
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
    console.log("THIS WEEK QUIZZES DATA:", thisWeekQuizzes);
    console.log("QUIZ IDs FOR THIS WEEK:", thisWeekQuizzes.map(q => q.id));
    console.log("WEEK RANGE:", {
      start: weekStartDate.toISOString(),
      end: weekEndDate.toISOString()
    });
    
    return thisWeekQuizzes;
  }

  try {
    const response = await apiClient.get(`/${userType}s/${userId}/quizzes/week`, {
      params: { weekStart }
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

// Additional mock functions for quiz management
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
    const response = await apiClient.post("/quizzes", quizData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateQuiz(quizId: string, quizData: Partial<Quiz>): Promise<Quiz> {
  if (isMockEnabled) {
    await simulateDelay(800);
    
    const quizIndex = MOCK_QUIZZES.findIndex(q => q.id === quizId);
    
    if (quizIndex === -1) {
      console.error(`MOCK: Quiz with ID ${quizId} not found for update`);
      throw new Error(`Quiz not found: ${quizId}`);
    }
    
    const originalQuiz = MOCK_QUIZZES[quizIndex];
    MOCK_QUIZZES[quizIndex] = {
      ...originalQuiz,
      ...quizData
    } as Quiz;
    
    console.log(`MOCK: Updated quiz ${quizId}`);
    console.log("ORIGINAL QUIZ DATA:", originalQuiz);
    console.log("UPDATE DATA PROVIDED:", quizData);
    console.log("UPDATED QUIZ DATA:", MOCK_QUIZZES[quizIndex]);
    console.log("UPDATED QUIZ ID:", MOCK_QUIZZES[quizIndex].id);
    
    return MOCK_QUIZZES[quizIndex];
  }

  try {
    const response = await apiClient.put(`/quizzes/${quizId}`, quizData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteQuiz(quizId: string): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(800);
    
    const quizIndex = MOCK_QUIZZES.findIndex(q => q.id === quizId);
    
    if (quizIndex === -1) {
      console.error(`MOCK: Quiz with ID ${quizId} not found for deletion`);
      throw new Error(`Quiz not found: ${quizId}`);
    }
    
    const deletedQuiz = MOCK_QUIZZES[quizIndex];
    MOCK_QUIZZES.splice(quizIndex, 1);
    
    console.log(`MOCK: Deleted quiz ${quizId}`);
    console.log("DELETED QUIZ DATA:", deletedQuiz);
    console.log("REMAINING QUIZZES COUNT:", MOCK_QUIZZES.length);
    
    return;
  }

  try {
    await apiClient.delete(`/quizzes/${quizId}`);
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
      console.error(`MOCK: Quiz with ID ${quizId} not found for submission`);
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
    console.log("ANSWERS SUBMITTED:", answers);
    console.log("QUIZ RESULT:", result);
    console.log("QUIZ ID:", quizId);
    
    return result;
  }

  try {
    const response = await apiClient.post(`/quizzes/${quizId}/submit`, { answers });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}