"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  Question,
  QuizInventoryItem,
  SubmissionQuiz,
  QuizAnswer,
  Quiz,
} from "@/app/domain/entities/CourseEntities";
import { CourseId, UserId } from "@/app/domain/valueObjects";
import { QuestionId, QuizId, SubmissionStatus } from "@/app/domain/valueObjects/CourseValues";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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
   allowSeeResults: boolean;
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

async function mapQuizFromBackend(dto: QuizDTO): Promise<Quiz> {
  return {
    
    id: dto.id,       
    title: dto.title,
    description: dto.description,
    courseId: dto.courseId,
    courseUnitId: "",
    maxGrade: dto.totalPoints,
    timeLimit: dto.timeLimitMinutes,
    dueDate: dto.availableUntil,
    acceptLateSubmissions: true,    allowSeeResults: dto.showCorrectAnswers,    questions: [],
  };
}

async function mapCompleteQuizFromBackend(dto: CompleteQuizDTO): Promise<Quiz> {
  console.log("Mapping complete quiz data...");
  console.log("Raw questions from backend:", JSON.stringify(dto.questions, null, 2));
  
  return {
    id: dto.id,
    idUser: "",
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
    allowSeeResults: dto.allowSeeResults,
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
      
      const normalizedType = (q.questionType || "").toUpperCase() === "MULTIPLE_CHOICE"
        ? ("multiple-choice" as const)
        : ("open-ended" as const);

      let correctAnswer: number | undefined;
      let expectedAnswer: string | undefined;

      if (normalizedType === "multiple-choice") {
        if (q.options && q.options.length > 0) {
          console.log("Multiple choice options details:");
          q.options.forEach((opt, optIndex) => {
            console.log(`  Option ${optIndex}:`, {
              text: opt.text,
              correct: opt.correct,
              matchesCorrectAnswer: opt.text === q.correctAnswer
            });
          });
          
          const correctIndexByFlag = q.options.findIndex(opt => opt.correct === true);
          
          const correctIndexByText = q.options.findIndex(opt =>
            opt.text === q.correctAnswer
          );
          
          if (correctIndexByFlag >= 0) {
            correctAnswer = correctIndexByFlag;
            console.log(`Using flag-based mapping: option ${correctAnswer} is correct`);
          } else if (correctIndexByText >= 0) {
            correctAnswer = correctIndexByText;
            console.log(`Using text-based mapping: option ${correctAnswer} matches correct answer text`);
          } else {
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
    
    unit: "",
    type: "QUIZ",
    courseId: dto.courseId,
    deadline: dto.availableUntil,
    isOverdue: new Date(dto.availableUntil) < new Date(),
    studentId: "current-student-id",
  };
}

async function mapSubmissionQuizFromBackend(dto: QuizSubmissionDTO): Promise<SubmissionQuiz> {
  return {
    id: dto.id,
    quizId: dto.quizId,
    studentId: dto.studentId,
    courseId: "",
    studentName: dto.studentName,
    content: JSON.stringify(dto.answers),
    submittedAt: dto.submittedAt,
    status: dto.status as SubmissionStatus,
    grade: dto.grade ? {
      value: parseFloat(dto.grade.value),
      maxScore: parseFloat(dto.grade.maxScore)
    } : null,
    teacherFeedback: "",
    quizData: {
      answers: dto.answers.map(a => ({
        questionId: a.questionId,
        questionText: a.questionText,
        questionType: "multiple-choice",
        studentAnswer: a.selectedOptions.length > 0 ? a.selectedOptions[0] : a.textAnswer,
        correctAnswer: "",
        points: a.pointsEarned,
        maxPoints: 0,
        isCorrect: a.correct,
        feedback: "",
      })),
      timeSpent: 0,
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
    courseId: "",
    studentName: dto.studentName,
    content: JSON.stringify(dto.questionResponses),
    submittedAt: dto.submittedAt,
    status: dto.status as SubmissionStatus,
    grade: dto.grade ? {
      value: parseFloat(dto.grade.value),
      maxScore: parseFloat(dto.grade.maxScore)
    } : null,
    teacherFeedback: "",
    quizData: {
      answers: dto.questionResponses.map(qr => ({
        questionId: qr.questionId,
        questionText: qr.questionText,
        questionType: qr.questionType.toLowerCase() === "multiple_choice" ? "multiple-choice" : "open-ended",
        studentAnswer: qr.selectedOptions.length > 0 ? qr.selectedOptions[0] : qr.textAnswer,
        correctAnswer: qr.correctAnswer,
        points: 0,
        maxPoints: qr.points,
        isCorrect: qr.isCorrect,
        feedback: "",
      })),
      timeSpent: 0,
      totalScore: dto.grade ? parseFloat(dto.grade.value) : 0,
      maxScore: dto.grade ? parseFloat(dto.grade.maxScore) : 0,
    },
  };
}

async function mapCreateQuizToBackendCommand(data: Quiz): Promise<CreateQuizWithQuestionsCommand> {
  return {
    courseId: data.courseId,
    unitId: data.courseUnitId,
    title: data.title,
    description: data.description,
    availableFrom: new Date().toISOString(),
    availableUntil: data.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    timeLimitMinutes: data.timeLimit,
    questions: data.questions.map(q => ({
      questionText: q.question || q.text,
      questionType: q.type === 'multiple-choice' ? 'CLOSED_CHOICE' : 'OPEN_ENDED',
      points: q.points || q.maxPoints,
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
    availableFrom: new Date().toISOString(),
    availableUntil: data.dueDate || new Date().toISOString(),
    timeLimitMinutes: data.timeLimit || 60,
    maxAttempts: 3,
    shuffleQuestions: false,
    showCorrectAnswers: true,
  };
}

async function mapSubmitQuizToBackendCommand(quizId: string, studentId: string, answers: Array<{ questionId: string; answer: string | number }>): Promise<SubmitQuizWithAnswersCommand> {
  const answerMap = new Map<string, QuizAnswerData>();
  
  answers.forEach(ans => {
    answerMap.set(ans.questionId, {
      selectedOptions: typeof ans.answer === 'number' ? [ans.answer] : [],
      textAnswer: typeof ans.answer === 'string' ? ans.answer : "",
      timeSpentSeconds: 0
    });
  });

  return {
    quizId,
    studentId,
    answers: answerMap
  };
}

export async function fetchQuizzesByMonth(
  userId: string,
  monthStart: string,
  userType: 'teacher' | 'student'
): Promise<Quiz[]> {
  try {
    const endpoint = userType === 'teacher' ? 'teacher' : 'student';
    const response = await apiClient.get<QuizDTO[]>(`/api/quizzes/calendar/${endpoint}/${userId}/month?monthStart=${monthStart}`);
    const quizzes = await Promise.all(response.data.map(dto => mapQuizFromBackend(dto)));
    return quizzes;
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function fetchThisWeekQuizzes(
  userId: string,
  weekStart: string,
  userType: 'teacher' | 'student'
): Promise<Quiz[]> {
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

export async function fetchQuizDetail(
  quizId: string,
  userType: 'teacher' | 'student'
): Promise<Quiz> {
  try {
    const response = await apiClient.get<CompleteQuizDTO>(`/api/quizzes/${quizId}/complete`);
    
    console.log("RAW BACKEND RESPONSE WITH OPTIONS:", response.data);
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
  try {
    throw new Error("Submit quiz answers backend integration not implemented");
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function fetchQuizzesByUnit(courseId: CourseId, unitId: string): Promise<Quiz[]> {
  try {
    const response = await apiClient.get<QuizDTO[]>(`/api/quizzes/course/${courseId}/unit/${unitId}`);
    const quizzes = await Promise.all(response.data.map(dto => mapQuizFromBackend(dto)));
    return quizzes;
  } catch (error) {
    return await handleApiError(error);
  }
}

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

      if (update.options !== undefined && update.type === "multiple-choice") {
        updateData.options = update.options.map((option, index) => ({
          text: option,
          correct: index === (update.correctAnswer as number),
        }));
      }

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

export async function updateQuestionsPointsBulk(
  quizId: string,
  questionPoints: Record<string, number>
): Promise<void> {
  try {
    console.log(`Updating points for ${Object.keys(questionPoints).length} questions:`, quizId);
    await apiClient.patch(`/api/quizzes/${quizId}/questions/points`, questionPoints);
    console.log(`Backend: Updated points for ${Object.keys(questionPoints).length} questions`);
  } catch (error) {
    console.error("Error updating question points in bulk:", error);
    return await handleApiError(error);
  }
}

export async function updateQuestionsTextBulk(
  quizId: string,
  questionTexts: Record<string, string>
): Promise<void> {
  try {
    console.log(`Updating text for ${Object.keys(questionTexts).length} questions:`, quizId);
    await apiClient.patch(`/api/quizzes/${quizId}/questions/text`, questionTexts);
    console.log(`Backend: Updated text for ${Object.keys(questionTexts).length} questions`);
  } catch (error) {
    console.error("Error updating question text in bulk:", error);
    return await handleApiError(error);
  }
}

export async function updateQuestionsAnswersBulk(
  quizId: string,
  questionAnswers: Record<string, string>
): Promise<void> {
  try {
    console.log(`Updating answers for ${Object.keys(questionAnswers).length} questions:`, quizId);
    await apiClient.patch(`/api/quizzes/${quizId}/questions/answers`, questionAnswers);
    console.log(`Backend: Updated answers for ${Object.keys(questionAnswers).length} questions`);
  } catch (error) {
    console.error("Error updating question answers in bulk:", error);
    return await handleApiError(error);
  }
}

export async function updateQuestionsOptionsBulk(
  quizId: string,
  questionOptions: Record<string, { options: string[]; correctAnswer: number }>
): Promise<void> {
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

export async function updateQuestionsTypesBulk(
  quizId: string,
  questionTypes: Record<string, "multiple-choice" | "open-ended">
): Promise<void> {
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