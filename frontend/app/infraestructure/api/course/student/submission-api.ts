// File: src/app/infraestructure/api/student/submission-api.ts
"use server";

import { Submission, QuizAnswers, SubmissionQuiz, QuizAnswer } from "@/app/domain/entities/CourseEntities";
import axios from "axios";
import { cookies } from "next/headers";

const MOCK_TASK_SUBMISSIONS: Submission[] = [
  {
    id: "sub-task-1",
    assignmentId: "task-1",
    studentId: "student-001",
    content:
      "This is my completed assignment submission with detailed explanations.",
    attachments: [
      {
        name: "assignment.pdf",
        storagePath: "/assignments/sub-task-1/assignment.pdf",
        createdAt: "2024-01-15T10:30:00Z",
      },
    ],
    submittedAt: "2024-01-15T10:30:00Z",
    status: "SUBMITTED",
    grade: { value: 85, maxScore: 100 },
    teacherFeedback: "Good work! Well structured and detailed.",
  },
];

// Enhanced mock data for quiz submissions with detailed quiz data
const MOCK_QUIZ_SUBMISSIONS: SubmissionQuiz[] = [
  {
    id: "sub-quiz-2",
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
          studentAnswer:
            "Gravity is the force that attracts objects with mass towards each other.",
          correctAnswer:
            "Gravity is a fundamental force that causes mutual attraction between all things that have mass.",
          points: 8,
          maxPoints: 10,
          isCorrect: true,
          feedback:
            "Good explanation, but could be more detailed about how it relates to mass and distance.",
        },
      ],
      timeSpent: 1200, // seconds
      totalScore: 18,
      maxScore: 20,
    },
    studentName: "dsfdsfsd",
  },
  {
    id: "sub-quiz-1",
    courseId: "course-1",
    quizId: "quiz-1",
    studentId: "student-001",
    studentName: "Emma Johnson",
    content: "Quiz submission for UX Design Fundamentals",
    status: "GRADED",
    submittedAt: "2024-01-16T14:20:00Z",

    grade: { value: 70, maxScore: 100 },
    teacherFeedback:
      "Check question 2 - the correct answer was Complex Navigation. Your explanation could be more detailed.",
    quizData: {
      answers: [
        {
          questionId: "q-101-1",
          questionText: "What does UCD stand for in design?",
          questionType: "multiple-choice",
          studentAnswer: 0,
          correctAnswer: 0,
          points: 10,
          maxPoints: 10,
          isCorrect: true,
          feedback: "Correct!",
        },
        {
          questionId: "q-101-2",
          questionText:
            "Which of the following is NOT a key principle of UX design?",
          questionType: "multiple-choice",
          studentAnswer: "WHi",
          correctAnswer: 2,
          points: 0,
          maxPoints: 10,
          isCorrect: false,
          feedback: "Incorrect. User Control is actually a key UX principle.",
        },
        {
          questionId: "q-101-3",
          questionText:
            "Explain the importance of user research in the design process.",
          questionType: "open-ended",
          studentAnswer: "User research helps design better products.",
          correctAnswer:
            "User research helps designers understand user needs, behaviors, and pain points, ensuring the final product meets real user requirements rather than assumptions.",
          points: 10,
          maxPoints: 20,
          isCorrect: undefined,
          feedback:
            "Too brief. Please provide more specific details about what user research accomplishes.",
        },
      ],
      timeSpent: 28,
      totalScore: 70,
      maxScore: 100,
    },
  },
];

// Mock configuration
const isMockEnabled = true;
const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Real API client (for when mocking is disabled)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(async (config) => {
  const token = (await cookies()).get("session")?.value;
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

/**
 * Get student's existing task submission
 */
export async function getStudentTaskSubmission(assignmentId: string, studentId: string): Promise<Submission | null> {
  if (isMockEnabled) {
    await simulateDelay();
    
    const submission = MOCK_TASK_SUBMISSIONS.find(
      sub => sub.assignmentId === assignmentId && sub.studentId === studentId
    );
    
    console.log(`MOCK: Getting task submission for assignment ${assignmentId}, student ${studentId}`);
    return submission || null;
  }

  try {
    const response = await apiClient.get(`/assignments/${assignmentId}/submissions/${studentId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null; // No submission exists yet
    }
    throw error;
  }
}

/**
 * Get student's existing quiz submission  
 */
export async function getStudentQuizSubmission(quizId: string, studentId: string): Promise<SubmissionQuiz | null> {
  if (isMockEnabled) {
    await simulateDelay();
    
    const submission = MOCK_QUIZ_SUBMISSIONS.find(
      sub => sub.quizId === quizId && sub.studentId === studentId
    );
    
    console.log(`MOCK: Getting quiz submission for quiz ${quizId}, student ${studentId}`);
    return submission || null;
  }

  try {
    const response = await apiClient.get(`/quizzes/${quizId}/submissions/${studentId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Submit a task
 */
export async function submitTask(params: {
  assignmentId: string;
  studentId: string;
  content: string;
  attachments: File[];
}): Promise<Submission> {
  if (isMockEnabled) {
    await simulateDelay(800);
    
    const newSubmission: Submission = {
      id: `sub-task-${Date.now()}`,
      assignmentId: params.assignmentId,
      studentId: params.studentId,
      content: params.content,
      attachments: params.attachments.map((file, index) => ({
        id: `att-${Date.now()}-${index}`,
        name: file.name,
        storagePath: `/assignments/${params.assignmentId}/${file.name}`,
        createdAt: new Date().toISOString()
      })),
      submittedAt: new Date().toISOString(),
      status: "SUBMITTED",
      grade: null,
      teacherFeedback: null
    };
    
    // Add to mock data (replace if exists)
    const existingIndex = MOCK_TASK_SUBMISSIONS.findIndex(
      sub => sub.assignmentId === params.assignmentId && sub.studentId === params.studentId
    );
    
    if (existingIndex >= 0) {
      MOCK_TASK_SUBMISSIONS[existingIndex] = newSubmission;
    } else {
      MOCK_TASK_SUBMISSIONS.push(newSubmission);
    }
    
    console.log("MOCK: Task submitted successfully", newSubmission);
    return newSubmission;
  }

  try {
    const formData = new FormData();
    formData.append("content", params.content);
    formData.append("studentId", params.studentId);
    params.attachments.forEach(file => formData.append("attachments", file));

    const response = await apiClient.post(`/assignments/${params.assignmentId}/submit`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Submit a quiz with enhanced quiz data
 */
export async function submitQuiz(params: {
  quizId: string;
  studentId: string;
  answers: QuizAnswers;
  timeSpent?: number;
}): Promise<SubmissionQuiz> {
  if (isMockEnabled) {
    await simulateDelay(800);
    
    // Calculate quiz results
    const quizAnswers: QuizAnswer[] = Object.entries(params.answers).map(([questionId, answerData]) => {
      // Mock calculation of correctness and points
      const isCorrect = Math.random() > 0.3; // 70% chance of being correct for demo
      const points = isCorrect ? 10 : 0; // Simple scoring for demo
      
      return {
        questionId,
        questionText: `Question about ${questionId}`,
        questionType: answerData.type,
        studentAnswer: answerData.answer,
        correctAnswer: answerData.type === 'multiple-choice' ? 1 : "Expected answer",
        points,
        maxPoints: 10,
        isCorrect,
        feedback: isCorrect ? "Good job!" : "Review this concept"
      };
    });

    const totalScore = quizAnswers.reduce((sum, answer) => sum + answer.points, 0);
    const maxScore = quizAnswers.reduce((sum, answer) => sum + answer.maxPoints, 0);
    
    const newSubmission: SubmissionQuiz = {
      id: `sub-quiz-${Date.now()}`,
      quizId: params.quizId,
      studentId: params.studentId,
      courseId: "course-1",
      content: JSON.stringify(params.answers),
      submittedAt: new Date().toISOString(),
      status: "SUBMITTED",
      grade: { value: totalScore, maxScore: maxScore },
      teacherFeedback: null,
      quizData: {
        answers: quizAnswers,
        timeSpent: params.timeSpent || 0,
        totalScore,
        maxScore
      },
      studentName: "dfsdfsfdfdss"
    };
    
    // Add to mock data (replace if exists)
    const existingIndex = MOCK_QUIZ_SUBMISSIONS.findIndex(
      sub => sub.quizId === params.quizId && sub.studentId === params.studentId
    );
    
    if (existingIndex >= 0) {
      MOCK_QUIZ_SUBMISSIONS[existingIndex] = newSubmission;
    } else {
      MOCK_QUIZ_SUBMISSIONS.push(newSubmission);
    }
    
    console.log("MOCK: Quiz submitted successfully with detailed data", newSubmission);
    return newSubmission;
  }

  try {
    const response = await apiClient.post(`/quizzes/${params.quizId}/submit`, {
      studentId: params.studentId,
      answers: params.answers,
      timeSpent: params.timeSpent
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}