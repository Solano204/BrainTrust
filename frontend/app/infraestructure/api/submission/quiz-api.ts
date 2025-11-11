// File: src/app/features/courses/api/quiz-api.ts
"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Quiz, Question} from "@/app/domain/entities/CourseEntities";
import { CourseId, UserId } from "@/app/domain/valueObjects";
import { QuestionId, QuizId } from "@/app/domain/valueObjects/CourseValues";

// File: src/app/features/courses/api/quiz-api.ts
const isMockEnabled = true;

// Mock quiz data (existing)
const MOCK_QUIZZES: Quiz[] = [
  {
    id: "SUB-TASK-104-001",
    title: "UX Design Fundamentals Quiz",
    description: "Test your knowledge of basic UX design principles and methodologies",
    courseUnitId: "UNIT-1",
    courseId: "COURSE-DES-401",
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
  // ... other existing quizzes
];
// Mock submission data
const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: "SUB-TASK-104-001",
    assignmentId: "SUB-TASK-104-001",
    studentId: "student-1",
    content: "Answers: 1. User-Centered Design, 2. Complex Navigation, 3. User research is crucial because it helps understand real user needs and behaviors.",
    attachments: [],
    submittedAt: "2024-03-20T14:30:00Z",
    status: "SUBMITTED",
    grade: { value: "85", maxScore: "100" },
    teacherFeedback: "Good understanding of basic concepts. Consider providing more detail in your explanation of user research importance."
  },
  {
    id: "sub-quiz-101-2",
    assignmentId: "SUB-TASK-104-001",
    studentId: "student-2",
    content: "Answers: 1. User-Centered Design, 2. User Control, 3. User research helps design better products.",
    attachments: [],
    submittedAt: "2024-03-21T10:15:00Z",
    status: "SUBMITTED",
    grade: { value: "70", maxScore: "100" },
    teacherFeedback: "Check question 2 - the correct answer was Complex Navigation. Your explanation could be more detailed."
  },
  {
    id: "sub-quiz-102-1",
    assignmentId: "SUB-TASK-104-001",
    studentId: "student-1",
    content: "Answers: 1. Contextual Inquiry, 2. Qualitative research focuses on understanding why users behave certain ways through methods like interviews and observations, while quantitative research measures what users do through metrics and statistics.",
    attachments: [],
    submittedAt: "2024-03-25T16:45:00Z",
    status: "SUBMITTED",
    grade: null,
    teacherFeedback: null
  }
];

// Utility to simulate network delay for mock data
const simulateDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// --- API CLIENT CONFIGURATION (ONLY USED WHEN MOCKING IS DISABLED) ---

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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

/**
 * Error handling wrapper for API calls
 */
const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
    redirect("/courses");
    throw new Error(errorMessage);
  }
  throw error;
};

// --- API FUNCTIONS WITH MOCKING LOGIC ---

/**
 * Fetch quizzes by course
 */
export async function fetchQuizzesByCourse(courseId: CourseId): Promise<Quiz[]> {
  if (isMockEnabled) {
    await simulateDelay();
    
    const quizzes = MOCK_QUIZZES.filter(quiz => quiz.courseId === courseId);
    
    console.log(`MOCK: Returning ${quizzes.length} quizzes for course ${courseId}`);
    console.log("QUIZZES DATA:", quizzes);
    console.log("QUIZ IDs:", quizzes.map(q => q.id));
    console.log("QUIZ TITLES:", quizzes.map(q => q.title));
    
    return quizzes;
  }

  try {
    if (!courseId) throw new Error("Course ID is required");
    const response = await apiClient.get(`/courses/${courseId}/quizzes`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch quiz by ID
 */
export async function fetchQuizById(quizId: QuizId): Promise<Quiz> {
  if (isMockEnabled) {
    
    const quiz = MOCK_QUIZZES.find(q => q.id === quizId);
    
    if (!quiz) {
      console.error(`MOCK: Quiz with ID ${quizId} not found`);
      throw new Error(`Quiz not found: ${quizId}`);
    }

    console.log(`MOCK: Returning quiz ${quizId}`);
    console.log("QUIZ DATA:", quiz);
    console.log("QUIZ ID:", quiz.id);
    console.log("QUIZ TITLE:", quiz.title);
    console.log("QUESTIONS COUNT:", quiz.questions.length);
    console.log("QUESTION IDs:", quiz.questions.map(q => q.id));
    
    return quiz;
  }

  try {
    if (!quizId) throw new Error("Quiz ID is required");
    const response = await apiClient.get(`/quizzes/${quizId}`);
    return response.data;
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
      id: `quiz-${Date.now()}`
    };
    
    MOCK_QUIZZES.push(newQuiz);
    
    console.log("MOCK: Created new quiz");
    console.log("QUIZ DATA PROVIDED:", quizData);
    console.log("CREATED QUIZ DATA:", newQuiz);
    console.log("NEW QUIZ ID:", newQuiz.id);
    console.log("COURSE ID:", newQuiz.courseId);
    console.log("UNIT ID:", newQuiz.courseUnitId);
    
    return newQuiz;
  }

  try {
    const response = await apiClient.post("/quizzes", quizData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Update an existing quiz
 */
export async function updateQuiz(
  quizId: QuizId,
  quizData: Partial<Omit<Quiz, "id">>
): Promise<Quiz> {
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
    console.log("UPDATED FIELDS:", Object.keys(quizData));
    
    return MOCK_QUIZZES[quizIndex];
  }

  try {
    const response = await apiClient.put(`/quizzes/${quizId}`, quizData);
    return response.data;
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
    
    const quizIndex = MOCK_QUIZZES.findIndex(q => q.id === quizId);
    
    if (quizIndex === -1) {
      console.error(`MOCK: Quiz with ID ${quizId} not found for deletion`);
      throw new Error(`Quiz not found: ${quizId}`);
    }
    
    const deletedQuiz = MOCK_QUIZZES[quizIndex];
    MOCK_QUIZZES.splice(quizIndex, 1);
    
    // Also remove related submissions
    const submissionIndices = MOCK_SUBMISSIONS
      .map((sub, index) => sub.assignmentId === quizId ? index : -1)
      .filter(index => index !== -1);
    
    // Remove from highest index to lowest to avoid index issues
    submissionIndices
      .sort((a, b) => b - a)
      .forEach(index => MOCK_SUBMISSIONS.splice(index, 1));
    
    console.log(`MOCK: Deleted quiz ${quizId}`);
    console.log("DELETED QUIZ DATA:", deletedQuiz);
    console.log("REMOVED SUBMISSIONS COUNT:", submissionIndices.length);
    console.log("REMAINING QUIZZES COUNT:", MOCK_QUIZZES.length);
    console.log("REMAINING QUIZ IDs:", MOCK_QUIZZES.map(q => q.id));
    
    return;
  }

  try {
    await apiClient.delete(`/quizzes/${quizId}`);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch student submissions for a quiz
 */
export async function fetchQuizSubmissions(quizId: QuizId): Promise<Submission[]> {
  if (isMockEnabled) {
    await simulateDelay();
    
    const submissions = MOCK_SUBMISSIONS.filter(sub => sub.assignmentId === quizId);
    
    console.log(`MOCK: Returning ${submissions.length} submissions for quiz ${quizId}`);
    console.log("SUBMISSIONS DATA:", submissions);
    console.log("SUBMISSION IDs:", submissions.map(s => s.id));
    console.log("STUDENT IDs:", submissions.map(s => s.studentId));
    
    return submissions;
  }

  try {
    const response = await apiClient.get(`/quizzes/${quizId}/submissions`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch specific student submission for a quiz
 */
export async function fetchStudentQuizSubmission(
  quizId: QuizId,
  studentId: UserId
): Promise<Submission> {
  if (isMockEnabled) {
    await simulateDelay(600);
    
    const submission = MOCK_SUBMISSIONS.find(
      sub => sub.assignmentId === quizId && sub.studentId === studentId
    );
    
    if (!submission) {
      console.error(`MOCK: Submission not found for quiz ${quizId} and student ${studentId}`);
      throw new Error(`Submission not found for student ${studentId}`);
    }

    console.log(`MOCK: Returning submission for quiz ${quizId} and student ${studentId}`);
    console.log("SUBMISSION DATA:", submission);
    console.log("SUBMISSION ID:", submission.id);
    console.log("STUDENT ID:", submission.studentId);
    console.log("GRADE:", submission.grade);
    
    return submission;
  }

  try {
    const response = await apiClient.get(`/quizzes/${quizId}/submissions/${studentId}`);
    return response.data;
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
): Promise<Submission> {
  if (isMockEnabled) {
    await simulateDelay(800);
    
    const submissionIndex = MOCK_SUBMISSIONS.findIndex(sub => sub.id === submissionId);
    
    if (submissionIndex === -1) {
      console.error(`MOCK: Submission with ID ${submissionId} not found for grading`);
      throw new Error(`Submission not found: ${submissionId}`);
    }
    
    const submission = MOCK_SUBMISSIONS[submissionIndex];
    const originalGrade = submission.grade;
    
    // Calculate total score
    const totalScore = grades.reduce((sum, grade) => sum + grade.score, 0);
    submission.grade = { 
      value: totalScore.toString(), 
      maxScore: "100" 
    };
    submission.status = "GRADED";
    
    console.log(`MOCK: Graded submission ${submissionId}`);
    console.log("GRADES PROVIDED:", grades);
    console.log("ORIGINAL GRADE:", originalGrade);
    console.log("NEW GRADE:", submission.grade);
    console.log("TOTAL SCORE:", totalScore);
    console.log("UPDATED SUBMISSION:", submission);
    
    return submission;
  }

  try {
    const response = await apiClient.put(`/submissions/${submissionId}/grade`, { grades });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Auto-grade multiple choice questions
 */
export async function autoGradeQuiz(submissionId: string): Promise<Submission> {
  if (isMockEnabled) {
    await simulateDelay(1200);
    
    const submissionIndex = MOCK_SUBMISSIONS.findIndex(sub => sub.id === submissionId);
    
    if (submissionIndex === -1) {
      console.error(`MOCK: Submission with ID ${submissionId} not found for auto-grading`);
      throw new Error(`Submission not found: ${submissionId}`);
    }
    
    const submission = MOCK_SUBMISSIONS[submissionIndex];
    const originalGrade = submission.grade;
    
    // Simulate auto-grading logic
    const autoGradeScore = Math.floor(Math.random() * 30) + 70; // Random score between 70-100
    submission.grade = { 
      value: autoGradeScore.toString(), 
      maxScore: "100" 
    };
    submission.status = "GRADED";
    submission.teacherFeedback = "Automatically graded by system. Please review for open-ended questions.";
    
    console.log(`MOCK: Auto-graded submission ${submissionId}`);
    console.log("ORIGINAL GRADE:", originalGrade);
    console.log("AUTO-GRADED SCORE:", autoGradeScore);
    console.log("NEW GRADE:", submission.grade);
    console.log("AUTO-GENERATED FEEDBACK:", submission.teacherFeedback);
    console.log("UPDATED SUBMISSION:", submission);
    
    return submission;
  }

  try {
    const response = await apiClient.post(`/submissions/${submissionId}/auto-grade`);
    return response.data;
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
    
    const submissions = MOCK_SUBMISSIONS.filter(sub => sub.assignmentId === quizId);
    const gradedSubmissions = submissions.filter(sub => sub.grade !== null);
    
    const scores = gradedSubmissions.map(sub => {
      const gradeValue = sub.grade ? parseInt(sub.grade.value) : 0;
      return gradeValue;
    });
    
    const stats = {
      totalSubmissions: submissions.length,
      averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      highestScore: scores.length > 0 ? Math.max(...scores) : 0,
      lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
      completionRate: Math.round((submissions.length / 25) * 100) // Assuming 25 students total
    };
    
    console.log(`MOCK: Returning stats for quiz ${quizId}`);
    console.log("QUIZ STATS DATA:", stats);
    console.log("CALCULATION DETAILS:", {
      submissionsCount: submissions.length,
      gradedSubmissionsCount: gradedSubmissions.length,
      scores: scores,
      totalStudents: 25
    });
    
    return stats;
  }

  try {
    const response = await apiClient.get(`/quizzes/${quizId}/stats`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}





// --- MOCKING CONFIGURATION AND DATA ---
// File: src/app/domain/entities/CourseEntities.ts

export interface SubmissionQuiz {
  id: string;
  quizId: string;
  studentId: string;
  studentName?: string;
  submittedAt: string;
  status: 'SUBMITTED' | 'GRADED' | 'PENDING';
  totalScore: number;
  maxScore: number;
  percentage: number;
  timeSpent?: number; // in minutes
  lateSubmission: boolean;
  answers: QuizAnswer[];
  teacherFeedback?: string;
  gradedAt?: string;
}

export interface QuizAnswer {
  questionId: string;
  questionText: string;
  questionType: 'multiple-choice' | 'open-ended';
  studentAnswer: string | number;
  correctAnswer?: string | number;
  points: number;
  maxPoints: number;
  isCorrect?: boolean;
  feedback?: string;
}

// Keep the existing Submission interface for general assignments
export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  attachments: string[];
  submittedAt: string;
  status: 'SUBMITTED' | 'GRADED' | 'PENDING';
  grade: { value: string; maxScore: string } | null;
  teacherFeedback: string | null;
} 




// Mock SubmissionQuiz data
const MOCK_SUBMISSION_QUIZZES: SubmissionQuiz[] = [
  {
    id: "sub-quiz-001",
    quizId: "SUB-TASK-104-001",
    studentId: "student-1",
    studentName: "John Smith",
    submittedAt: "2024-03-20T14:30:00Z",
    status: "GRADED",
    totalScore: 85,
    maxScore: 100,
    percentage: 85,
    timeSpent: 25,
    lateSubmission: false,
    teacherFeedback: "Good understanding of basic concepts. Consider providing more detail in your explanation of user research importance.",
    gradedAt: "2024-03-21T09:15:00Z",
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
        feedback: "Correct!"
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
        feedback: "Correct! Complex navigation is indeed not a UX principle."
      },
      {
        questionId: "q-101-3",
        questionText: "Explain the importance of user research in the design process.",
        questionType: "open-ended",
        studentAnswer: "User research is crucial because it helps understand real user needs and behaviors, ensuring we design products that people actually want to use.",
        correctAnswer: "User research helps designers understand user needs, behaviors, and pain points, ensuring the final product meets real user requirements rather than assumptions.",
        points: 15,
        maxPoints: 20,
        isCorrect: undefined,
        feedback: "Good answer! You captured the main idea. Consider mentioning how it helps avoid assumptions."
      }
    ]
  },
  {
    id: "sub-quiz-002",
    quizId: "SUB-TASK-104-001",
    studentId: "student-2",
    studentName: "Emma Johnson",
    submittedAt: "2024-03-21T10:15:00Z",
    status: "GRADED",
    totalScore: 70,
    maxScore: 100,
    percentage: 70,
    timeSpent: 28,
    lateSubmission: false,
    teacherFeedback: "Check question 2 - the correct answer was Complex Navigation. Your explanation could be more detailed.",
    gradedAt: "2024-03-21T14:20:00Z",
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
        feedback: "Correct!"
      },
      {
        questionId: "q-101-2",
        questionText: "Which of the following is NOT a key principle of UX design?",
        questionType: "multiple-choice",
        studentAnswer: 1,
        correctAnswer: 2,
        points: 0,
        maxPoints: 10,
        isCorrect: false,
        feedback: "Incorrect. User Control is actually a key UX principle."
      },
      {
        questionId: "q-101-3",
        questionText: "Explain the importance of user research in the design process.",
        questionType: "open-ended",
        studentAnswer: "User research helps design better products.",
        correctAnswer: "User research helps designers understand user needs, behaviors, and pain points, ensuring the final product meets real user requirements rather than assumptions.",
        points: 10,
        maxPoints: 20,
        isCorrect: undefined,
        feedback: "Too brief. Please provide more specific details about what user research accomplishes."
      }
    ]
  },
  {
    id: "sub-quiz-003",
    quizId: "SUB-TASK-104-001",
    studentId: "student-3",
    studentName: "Michael Chen",
    submittedAt: "2024-03-24T22:30:00Z",
    status: "SUBMITTED",
    totalScore: 0,
    maxScore: 100,
    percentage: 0,
    timeSpent: 32,
    lateSubmission: true,
    teacherFeedback: undefined,
    gradedAt: undefined,
    answers: [
      {
        questionId: "q-101-1",
        questionText: "What does UCD stand for in design?",
        questionType: "multiple-choice",
        studentAnswer: 1,
        correctAnswer: 0,
        points: 0,
        maxPoints: 10,
        isCorrect: false
      },
      {
        questionId: "q-101-2",
        questionText: "Which of the following is NOT a key principle of UX design?",
        questionType: "multiple-choice",
        studentAnswer: 2,
        correctAnswer: 2,
        points: 0,
        maxPoints: 10,
        isCorrect: true
      },
      {
        questionId: "q-101-3",
        questionText: "Explain the importance of user research in the design process.",
        questionType: "open-ended",
        studentAnswer: "It helps understand what users want and need before designing.",
        correctAnswer: "User research helps designers understand user needs, behaviors, and pain points, ensuring the final product meets real user requirements rather than assumptions.",
        points: 0,
        maxPoints: 20,
        isCorrect: undefined
      }
    ]
  }
];


/**
 * Fetch all SubmissionQuiz entries for a specific quiz
 */
export async function fetchSubmissionQuizzes(quizId: QuizId): Promise<SubmissionQuiz[]> {
  if (isMockEnabled) {
    await simulateDelay();
    
    const submissionQuizzes = MOCK_SUBMISSION_QUIZZES.filter(sub => sub.quizId === quizId);
    
    console.log(`MOCK: Returning ${submissionQuizzes.length} SubmissionQuiz entries for quiz ${quizId}`);
    console.log("SUBMISSION QUIZZES DATA:", submissionQuizzes);
    console.log("SUBMISSION IDs:", submissionQuizzes.map(s => s.id));
    console.log("STUDENT IDs:", submissionQuizzes.map(s => s.studentId));
    
    return submissionQuizzes;
  }

  try {
    const response = await apiClient.get(`/quizzes/${quizId}/submission-quizzes`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch specific SubmissionQuiz by ID
 */
export async function fetchSubmissionQuizById(submissionId: string): Promise<SubmissionQuiz> {
  if (isMockEnabled) {
    await simulateDelay(600);
    
    const submissionQuiz = MOCK_SUBMISSION_QUIZZES.find(sub => sub.id === submissionId);
    
    if (!submissionQuiz) {
      console.error(`MOCK: SubmissionQuiz with ID ${submissionId} not found`);
      throw new Error(`SubmissionQuiz not found: ${submissionId}`);
    }

    console.log(`MOCK: Returning SubmissionQuiz ${submissionId}`);
    console.log("SUBMISSION QUIZ DATA:", submissionQuiz);
    console.log("STUDENT ID:", submissionQuiz.studentId);
    console.log("QUIZ ID:", submissionQuiz.quizId);
    console.log("TOTAL SCORE:", submissionQuiz.totalScore);
    console.log("ANSWERS COUNT:", submissionQuiz.answers.length);
    
    return submissionQuiz;
  }

  try {
    const response = await apiClient.get(`/submission-quizzes/${submissionId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Create or update a SubmissionQuiz
 */
export async function submitQuizAnswers(
  quizId: QuizId,
  studentId: UserId,
  answers: Array<{
    questionId: QuestionId;
    answer: string | number;
  }>,
  timeSpent?: number
): Promise<SubmissionQuiz> {
  if (isMockEnabled) {
    await simulateDelay(1000);
    
    // Find the quiz to calculate scores
    const quiz = MOCK_QUIZZES.find(q => q.id === quizId);
    if (!quiz) {
      throw new Error(`Quiz not found: ${quizId}`);
    }

    // Calculate scores
    let totalScore = 0;
    const quizAnswers: QuizAnswer[] = answers.map(submittedAnswer => {
      const question = quiz.questions.find(q => q.id === submittedAnswer.questionId);
      if (!question) {
        throw new Error(`Question not found: ${submittedAnswer.questionId}`);
      }

      let points = 0;
      let isCorrect: boolean | undefined = undefined;

      if (question.type === 'multiple-choice') {
        isCorrect = submittedAnswer.answer === question.correctAnswer;
        points = isCorrect ? question.points : 0;
      } else {
        // For open-ended, default to 0 points until graded
        points = 0;
        isCorrect = undefined;
      }

      totalScore += points;

      return {
        questionId: question.id,
        questionText: question.text,
        questionType: question.type,
        studentAnswer: submittedAnswer.answer,
        correctAnswer: question.type === 'multiple-choice' ? question.correctAnswer : question.expectedAnswer,
        points: points,
        maxPoints: question.points,
        isCorrect: isCorrect
      };
    });

    const percentage = Math.round((totalScore / quiz.maxGrade) * 100);
    const submittedAt = new Date();
    const dueDate = quiz.dueDate ? new Date(quiz.dueDate) : null;
    const lateSubmission = dueDate ? submittedAt > dueDate : false;

    const submissionQuiz: SubmissionQuiz = {
      id: `sub-quiz-${quizId}-${studentId}-${Date.now()}`,
      quizId: quizId,
      studentId: studentId,
      studentName: `Student ${studentId}`, // In real app, fetch from user service
      submittedAt: submittedAt.toISOString(),
      status: 'SUBMITTED',
      totalScore: totalScore,
      maxScore: quiz.maxGrade,
      percentage: percentage,
      timeSpent: timeSpent,
      lateSubmission: lateSubmission,
      answers: quizAnswers,
      teacherFeedback: undefined,
      gradedAt: undefined
    };

    MOCK_SUBMISSION_QUIZZES.push(submissionQuiz);
    
    console.log(`MOCK: Created new SubmissionQuiz for quiz ${quizId} and student ${studentId}`);
    console.log("SUBMISSION QUIZ DATA:", submissionQuiz);
    console.log("TOTAL SCORE:", totalScore);
    console.log("PERCENTAGE:", percentage);
    console.log("LATE SUBMISSION:", lateSubmission);
    
    return submissionQuiz;
  }

  try {
    const response = await apiClient.post(`/quizzes/${quizId}/submit`, {
      studentId,
      answers,
      timeSpent
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Grade a SubmissionQuiz
 */
export async function gradeSubmissionQuiz(
  submissionId: string,
  grades: { questionId: QuestionId; score: number; feedback?: string }[]
): Promise<SubmissionQuiz> {
  if (isMockEnabled) {
    await simulateDelay(800);
    
    const submissionIndex = MOCK_SUBMISSION_QUIZZES.findIndex(sub => sub.id === submissionId);
    
    if (submissionIndex === -1) {
      console.error(`MOCK: SubmissionQuiz with ID ${submissionId} not found for grading`);
      throw new Error(`SubmissionQuiz not found: ${submissionId}`);
    }
    
    const submission = MOCK_SUBMISSION_QUIZZES[submissionIndex];
    
    // Update answers with new scores and feedback
    grades.forEach(grade => {
      const answerIndex = submission.answers.findIndex(ans => ans.questionId === grade.questionId);
      if (answerIndex !== -1) {
        submission.answers[answerIndex].points = grade.score;
        if (grade.feedback) {
          submission.answers[answerIndex].feedback = grade.feedback;
        }
      }
    });

    // Recalculate total score
    const totalScore = submission.answers.reduce((sum, answer) => sum + answer.points, 0);
    submission.totalScore = totalScore;
    submission.percentage = Math.round((totalScore / submission.maxScore) * 100);
    submission.status = 'GRADED';
    submission.gradedAt = new Date().toISOString();
    
    console.log(`MOCK: Graded SubmissionQuiz ${submissionId}`);
    console.log("GRADES PROVIDED:", grades);
    console.log("NEW TOTAL SCORE:", totalScore);
    console.log("NEW PERCENTAGE:", submission.percentage);
    console.log("UPDATED SUBMISSION:", submission);
    
    return submission;
  }

  try {
    const response = await apiClient.put(`/submission-quizzes/${submissionId}/grade`, { grades });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Auto-grade SubmissionQuiz (multiple choice only)
 */
export async function autoGradeSubmissionQuiz(submissionId: string): Promise<SubmissionQuiz> {
  if (isMockEnabled) {
    await simulateDelay(1200);
    
    const submissionIndex = MOCK_SUBMISSION_QUIZZES.findIndex(sub => sub.id === submissionId);
    
    if (submissionIndex === -1) {
      console.error(`MOCK: SubmissionQuiz with ID ${submissionId} not found for auto-grading`);
      throw new Error(`SubmissionQuiz not found: ${submissionId}`);
    }
    
    const submission = MOCK_SUBMISSION_QUIZZES[submissionIndex];
    
    // Auto-grade only multiple choice questions
    submission.answers.forEach(answer => {
      if (answer.questionType === 'multiple-choice') {
        const isCorrect = answer.studentAnswer === answer.correctAnswer;
        answer.points = isCorrect ? answer.maxPoints : 0;
        answer.isCorrect = isCorrect;
        answer.feedback = isCorrect ? "Correct!" : "Incorrect answer";
      }
    });

    // Recalculate total score
    const totalScore = submission.answers.reduce((sum, answer) => sum + answer.points, 0);
    submission.totalScore = totalScore;
    submission.percentage = Math.round((totalScore / submission.maxScore) * 100);
    submission.status = 'GRADED';
    submission.gradedAt = new Date().toISOString();
    submission.teacherFeedback = "Automatically graded by system. Please review open-ended questions manually.";
    
    console.log(`MOCK: Auto-graded SubmissionQuiz ${submissionId}`);
    console.log("NEW TOTAL SCORE:", totalScore);
    console.log("NEW PERCENTAGE:", submission.percentage);
    console.log("AUTO-GENERATED FEEDBACK:", submission.teacherFeedback);
    console.log("UPDATED SUBMISSION:", submission);
    
    return submission;
  }

  try {
    const response = await apiClient.post(`/submission-quizzes/${submissionId}/auto-grade`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

