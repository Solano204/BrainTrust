// File: src/app/infraestructure/api/task/student-task-api.ts
"use server";

import {
  Submission,
  SubmissionQuiz,
} from "@/app/domain/entities/CourseEntities";
import { CourseId, UserId } from "@/app/domain/valueObjects";
import axios from "axios";
import { cookies } from "next/headers";

// Mock data for student assignments
const MOCK_TASK_SUBMISSIONS: Submission[] = [
  {
    id: "sub-task-1",
    assignmentId: "task-1",
    studentId: "student-001",
    courseID: "crs-101",
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

// Utility to simulate network delay


// Flag to enable/disable mocking
const isMockEnabled = true;

// API client configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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

/**
 * Fetch student assignments with their submissions
 */
export async function fetchStudentAssignments(
  courseId: string,
  studentId: string
): Promise<Submission[]> {
  if (isMockEnabled) {
    await simulateDelay();

    console.log(
      `MOCK: Returning student assignments for course ${courseId} and student ${studentId}`
    );
    console.log("STUDENT ASSIGNMENTS DATA:", MOCK_TASK_SUBMISSIONS);

    return MOCK_TASK_SUBMISSIONS;
  }

  try {
    const response = await apiClient.get(
      `/courses/${courseId}/students/${studentId}/assignments`
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch student quizzes with their submissions
 */
export async function fetchStudentQuizzes(
  courseId: string,
  studentId: string
): Promise<SubmissionQuiz[]> {
  if (isMockEnabled) {
    await simulateDelay();

    console.log(
      `MOCK: Returning student quizzes for course ${courseId} and student ${studentId}`
    );
    console.log("STUDENT QUIZZES DATA:", MOCK_QUIZ_SUBMISSIONS);

    return MOCK_QUIZ_SUBMISSIONS;
  }

  try {
    const response = await apiClient.get(
      `/courses/${courseId}/students/${studentId}/quizzes`
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Get student task statistics
 */
export async function getStudentTaskStats(
  courseId: string,
  studentId: string
): Promise<any> {
  if (isMockEnabled) {
    await simulateDelay(400);

    const assignments = MOCK_TASK_SUBMISSIONS;
    const quizzes = MOCK_QUIZ_SUBMISSIONS;

    const allTasks = [...assignments, ...quizzes];
    const completedTasks = allTasks.filter(
      (task) => task.status === "GRADED" || task.status === "SUBMITTED"
    ).length;
    const pendingTasks = allTasks.filter((task) => !task).length;
    const overdueTasks = allTasks.filter((task) => task).length;

    // Calculate average grade from graded tasks
    // Calculate average grade from graded tasks
    const gradedTasks = allTasks.filter((task) => task.grade);
    const averageGrade =
      gradedTasks.length > 0
        ? Math.round(
            gradedTasks.reduce((sum: number, task) => {
              const grade = task.grade;
              // Add type checking and ensure we're working with numbers
              if (
                !grade ||
                typeof grade.value !== "number" ||
                typeof grade.maxScore !== "number"
              ) {
                return sum;
              }
              return sum + (grade.value / grade.maxScore) * 100;
            }, 0) / gradedTasks.length
          )
        : 0;

    const stats = {
      totalTasks: allTasks.length,
      completedTasks,
      pendingTasks,
      averageGrade,
      overdueTasks,
    };

    console.log(
      `MOCK: Returning student task stats for course ${courseId} and student ${studentId}`
    );
    console.log("STUDENT TASK STATS:", stats);

    return stats;
  }

  try {
    const response = await apiClient.get(
      `/courses/${courseId}/students/${studentId}/task-stats`
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}


const MOCK_STUDENT_ASSIGNMENTS = [
  {
    id: "TASK-101",
    name: "Assignment 2: Wireframe Final",
    unit: "Unit 3: Prototyping & Testing",
    instructions: "Create high-fidelity wireframes for a mobile banking app...",
    maxPoints: 100,
    deadline: "2024-03-15",
    isOverdue: true,
    submission: {
      id: "SUB-TASK-101-001",
      content: "I've created wireframes for a mobile banking app focusing on three key user flows...",
      submittedAt: "2024-03-14T23:45:00Z",
      status: "LATE_SUBMITTED",
      grade: { value: "85", maxScore: 100 },
      teacherFeedback: "Good attention to accessibility. Consider adding more micro-interactions...",
      attachments: [
        {
          name: "wireframes.fig",
          storagePath: "/submissions/TASK-101/wireframes.fig",
          createdAt: "2024-03-14T23:45:00Z",
        }
      ]
    }
  },
  {
    id: "TASK-102",
    name: "Critical Thinking Essay",
    unit: "Unit 4: Design Systems",
    instructions: "Write a 1500-word essay analyzing the impact of design systems...",
    maxPoints: 50,
    deadline: "2024-03-20",
    isOverdue: false,
    submission: null
  }
];

// Mock data for student quizzes
const MOCK_STUDENT_QUIZZES = [
  {
    id: "quiz-2",
    title: "UX Design Fundamentals Quiz",
    description: "Test your knowledge of basic UX design principles and methodologies",
    timeLimit: 30,
    maxGrade: 100,
    dueDate: "2024-03-25T23:59:00Z",
    isOverdue: false,
    questions: [
      {
        id: "q-101-1",
        type: "multiple-choice",
        text: "What does UCD stand for in design?",
        options: [
          "User-Centered Design",
          "User-Created Development",
          "Universal Component Design",
          "User Configuration Document",
        ],
        correctAnswer: 0,
        points: 10,
      }
    ],
    submission: {
      id: "sub-quiz-2-emma",
      status: "GRADED",
      submittedAt: "2024-03-21T10:15:00Z",
      grade: { value: 90, maxScore: 100 },
      teacherFeedback: "Excellent understanding of the concepts.",
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
          }
        ],
        timeSpent: 1200,
        totalScore: 90,
        maxScore: 100,
      }
    }
  }
];

const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchStudentAssignmentsItem(courseId: CourseId, studentId: UserId) {
  if (isMockEnabled) {
    await simulateDelay();
    
    // Filter assignments for the specific student
    const studentAssignments = MOCK_STUDENT_ASSIGNMENTS.map(assignment => ({
      ...assignment,
      // In a real app, you'd filter by studentId and courseId
    }));

    return studentAssignments;
  }

  try {
    const response = await apiClient.get(`/courses/${courseId}/students/${studentId}/assignments`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchStudentQuizzesItem(courseId: CourseId, studentId: UserId) {
  if (isMockEnabled) {
    await simulateDelay();
    
    // Filter quizzes for the specific student
    const studentQuizzes = MOCK_STUDENT_QUIZZES.map(quiz => ({
      ...quiz,
      // In a real app, you'd filter by studentId and courseId
    }));

    return studentQuizzes;
  }

  try {
    const response = await apiClient.get(`/courses/${courseId}/students/${studentId}/quizzes`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchStudentTaskStats(courseId: CourseId, studentId: UserId) {
  if (isMockEnabled) {
    await simulateDelay();
    
    const assignments = MOCK_STUDENT_ASSIGNMENTS;
    const quizzes = MOCK_STUDENT_QUIZZES;
    
    const totalTasks = assignments.length + quizzes.length;
    const completedTasks = [
      ...assignments.filter(a => a.submission),
      ...quizzes.filter(q => q.submission)
    ].length;
    const overdueTasks = [
      ...assignments.filter(a => a.isOverdue && !a.submission),
      ...quizzes.filter(q => q.isOverdue && !q.submission)
    ].length;

    // Calculate average grade from graded submissions
    const gradedSubmissions = [
      ...assignments.filter(a => a.submission?.grade),
      ...quizzes.filter(q => q.submission?.grade)
    ];
    
    const averageGrade = gradedSubmissions.length > 0 
      ? Math.round(gradedSubmissions.reduce((sum, item) => {
          const grade = item.submission!.grade!;
          const percentage = (Number(grade.value) / grade.maxScore) * 100;
          return sum + percentage;
        }, 0) / gradedSubmissions.length)
      : 0;

    return {
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
      averageGrade,
      overdueTasks,
    };
  }

  try {
    const response = await apiClient.get(`/courses/${courseId}/students/${studentId}/task-stats`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}