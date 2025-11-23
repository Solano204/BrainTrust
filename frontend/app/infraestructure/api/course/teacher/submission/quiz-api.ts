"use server";
import { Quiz, Submission, SubmissionQuiz } from "@/app/domain/entities/CourseEntities";
import { CourseId, UserId } from "@/app/domain/valueObjects";
import { QuizId } from "@/app/domain/valueObjects/CourseValues";
import axios from "axios";
import { cookies } from "next/headers";

const MOCK_TASK_SUBMISSIONS: Submission[] = [
  {
    id: "sub-task-1",
    courseID: "crs-101",
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
// Mock quiz data (existing)
const MOCK_QUIZZES: Quiz[] = [
  {
    id: "quiz-2",
    title: "UX Design Fundamentals Quiz",
    description:
      "Test your knowledge of basic UX design principles and methodologies",
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
        question:
          "Explain the importance of user research in the design process.",
        points: 20,
        expectedAnswer:
          "User research helps designers understand user needs, behaviors, and pain points, ensuring the final product meets real user requirements rather than assumptions.",
      },
    ],
  },
  // ... other existing quizzes
]; 
const MOCK_QUIZ_SUBMISSIONS: SubmissionQuiz[] = [
  {
    id: "sub-quiz-2-emma",
    quizId: "quiz-2",
    studentId: "student-001", 
    courseId: "crs-101",
    studentName: "Emma Johnson",
    content: JSON.stringify([
      {
        questionId: "q-101-1",
        answer: 0, // Correct: User-Centered Design
        type: "multiple-choice",
      },
      {
        questionId: "q-101-2",
        answer: 2, // Correct: Complex Navigation (NOT a principle)
        type: "multiple-choice", 
      },
      {
        questionId: "q-101-3",
        answer: "User research helps designers understand user needs, behaviors, and pain points, ensuring the final product meets real user requirements rather than assumptions.",
        type: "open-ended",
      },
    ]),
    submittedAt: "2024-03-21T10:15:00Z",
    status: "GRADED",
    grade: { value: 95, maxScore: 100 },
    teacherFeedback: "Excellent work! Perfect score on multiple choice and great open-ended response.",
    quizData: {
      answers: [
        {
          questionId: "q-101-1",
          questionText: "What does UCD stand for in design?",
          questionType: "multiple-choice",
          studentAnswer:2, //
          correctAnswer: 0,
          points: 9,
          maxPoints: 10,
          isCorrect: false,
          feedback: "Correct!",
        },
        {
          questionId: "q-101-2",
          questionText: "Which of the following is NOT a key principle of UX design?",
          questionType: "multiple-choice",
          studentAnswer: 2,
          correctAnswer: 2,
          points: 10,
          maxPoints: 10,
          isCorrect: true,
          feedback: "Correct! Complex Navigation is not a UX principle.",
        },
        {
          questionId: "q-101-3",
          questionText: "Explain the importance of user research in the design process.",
          questionType: "open-ended",
          studentAnswer: "User research helps designers understand user needs, behaviors, and pain points, ensuring the final product meets real user requirements rather than assumptions.",
          correctAnswer: "User research helps designers understand user needs, behaviors, and pain points, ensuring the final product meets real user requirements rather than assumptions.",
          points: 18,
          maxPoints: 20,
          isCorrect: true,
          feedback: "Perfect answer! Comprehensive and accurate.",
        },
      ],
      timeSpent: 1200,
      totalScore: 38, // 10 + 10 + 18 = 38
      maxScore: 40, // 10 + 10 + 20 = 40
    },
  },
  {
    id: "sub-quiz-2-john", 
    quizId: "quiz-2",
    studentId: "student-002",
    courseId: "crs-101",
    studentName: "John Smith",
    content: JSON.stringify([
      {
        questionId: "q-101-1",
        answer: 1, // Incorrect: User-Created Development
        type: "multiple-choice",
      },
      {
        questionId: "q-101-2",
        answer: 0, // Incorrect: Consistency (IS a principle)
        type: "multiple-choice",
      },
      {
        questionId: "q-101-3", 
        answer: "It helps make products better for users.",
        type: "open-ended",
      },
    ]),
    submittedAt: "2024-03-20T14:30:00Z",
    status: "GRADED", 
    grade: { value: 55, maxScore: 100 },
    teacherFeedback: "Please review UX principles and provide more detailed explanations.",
    quizData: {
      answers: [
        {
          questionId: "q-101-1",
          questionText: "What does UCD stand for in design?",
          questionType: "multiple-choice",
          studentAnswer: 1,
          correctAnswer: 0,
          points: 0,
          maxPoints: 10,
          isCorrect: false,
          feedback: "Incorrect. UCD stands for User-Centered Design.",
        },
        {
          questionId: "q-101-2",
          questionText: "Which of the following is NOT a key principle of UX design?",
          questionType: "multiple-choice", 
          studentAnswer: 0,
          correctAnswer: 2,
          points: 0,
          maxPoints: 10,
          isCorrect: false,
          feedback: "Incorrect. Consistency IS a UX principle. Complex Navigation is NOT.",
        },
        {
          questionId: "q-101-3",
          questionText: "Explain the importance of user research in the design process.",
          questionType: "open-ended",
          studentAnswer: "It helps make products better for users.",
          correctAnswer: "User research helps designers understand user needs, behaviors, and pain points, ensuring the final product meets real user requirements rather than assumptions.",
          points: 12,
          maxPoints: 20,
          isCorrect: undefined,
          feedback: "Too vague. Be more specific about what user research accomplishes.",
        },
      ],
      timeSpent: 900,
      totalScore: 12, // 0 + 0 + 12 = 12
      maxScore: 40, // 10 + 10 + 20 = 40
    },
  },
  {
    id: "sub-quiz-2-sarah",
    quizId: "quiz-2", 
    studentId: "student-003",
    courseId: "crs-101",
    studentName: "Sarah Wilson",
    content: JSON.stringify([
      {
        questionId: "q-101-1",
        answer: 0, // Correct
        type: "multiple-choice",
      },
      {
        questionId: "q-101-2", 
        answer: 2, // Correct
        type: "multiple-choice",
      },
      {
        questionId: "q-101-3",
        answer: "User research identifies what users need and their problems so we can design solutions that work for them.",
        type: "open-ended", 
      },
    ]),
    submittedAt: "2024-03-22T09:45:00Z",
    status: "SUBMITTED", // Not graded yet
    grade: null,
    teacherFeedback: null,
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
          feedback: "",
        },
        {
          questionId: "q-101-2",
          questionText: "Which of the following is NOT a key principle of UX design?",
          questionType: "multiple-choice",
          studentAnswer: 2,
          correctAnswer: 2,
          points: 10, 
          maxPoints: 10,
          isCorrect: true,
          feedback: "",
        },
        {
          questionId: "q-101-3",
          questionText: "Explain the importance of user research in the design process.",
          questionType: "open-ended",
          studentAnswer: "User research identifies what users need and their problems so we can design solutions that work for them.",
          correctAnswer: "User research helps designers understand user needs, behaviors, and pain points, ensuring the final product meets real user requirements rather than assumptions.",
          points: 0, // Not graded yet
          maxPoints: 20,
          isCorrect: undefined,
          feedback: "",
        },
      ],
      timeSpent: 1100,
      totalScore: 20, // Only multiple choice graded so far
      maxScore: 40,
    },
  },
];

const isMockEnabled = true;

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



export async function fetchSubmissionQuizzesByCourse(courseId: CourseId): Promise<SubmissionQuiz[]> {
  if (isMockEnabled) {

    console.log(`MOCK: Fetching SubmissionQuizzes for course ${courseId}`);
    // Filter mock data by courseId
    const submissionQuizzes = MOCK_QUIZ_SUBMISSIONS.filter(
      (sub) => sub.courseId === courseId
    );

    console.log(
      `MOCK: Returning ${submissionQuizzes.length} SubmissionQuiz entries for course ${courseId}`
    );
    console.log("SUBMISSION QUIZZES DATA:", submissionQuizzes);
    console.log(
      "QUIZ IDs:",
      submissionQuizzes.map((s) => s.quizId)
    );
    console.log(
      "STUDENT IDs:",
      submissionQuizzes.map((s) => s.studentId)
    );

    return submissionQuizzes;
  }

  try {
    const response = await apiClient.get(`/courses/${courseId}/submission-quizzes`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}




export async function fetchSubmissionQuizByStudentAndQuiz(
  quizId: QuizId,
  studentId: UserId
): Promise<SubmissionQuiz | null> {
  if (isMockEnabled) {

    // Find the specific submission for this student and quiz
    const submissionQuiz = MOCK_QUIZ_SUBMISSIONS.find(
      (sub) => sub.quizId === quizId && sub.studentId === studentId
    );

    console.log(
      `MOCK: Returning SubmissionQuiz for quiz ${quizId} and student ${studentId}`
    );
    console.log("SUBMISSION QUIZ DATA:", submissionQuiz);
    
    return submissionQuiz || null;
  }

  try {
    const response = await apiClient.get(`/quizzes/${quizId}/submissions/${studentId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null; // No submission found
    }
    return handleApiError(error);
  }
}