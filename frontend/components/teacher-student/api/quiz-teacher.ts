"use server";

import { apiClient } from "@/app/shared/api/http";
import { handleApiError } from "@/app/shared/utils/api-error";
import axios from "axios";

import {
  QuizDTO,
  CompleteQuizDTO,
  SubmissionQuizDTO,
  QuizSubmissionDTO,
  QuizSubmissionDetailDTO,
  QuizSubmissionDetailForStudentDTO,
  QuizSubmissionDetailForGradingDTO,
  QuizSubmissionBasicDTO,
  SuccessResponseDTO,
  QuizSubmissionDetailDTONew,
} from "@/app/shared/dtos/quiz.dto";

import {
  CreateQuizWithQuestionsCommand,
  UpdateQuizCommand,
  AddQuizQuestionCommand,
  AddQuizQuestionsBulkCommand,
  DeleteQuizQuestionsBulkCommand,
  UpdateQuizQuestionsBulkCommand,
  UpdateQuestionsPointsCommand,
  UpdateQuestionsOptionsCommand,
  GradeQuizSubmissionCommand,
  SubmitQuizWithAnswersCommand,
  QuizQuestionData,
  QuestionUpdateData,
  QuestionOptionData,
} from "@/app/shared/dtos/commands/quiz.commands";

import {
  Quiz,
  Question,
  SubmissionQuiz,
  QuizSubmission,
  QuizSubmissionDetail,
  StudentSubmissionQuiz,
} from "@/app/shared/models/quiz.model";

import {
  mapQuizFromBackend,
  mapSubmissionQuizFromBackend,
  mapQuizSubmissionFromBackend,
  mapQuizSubmissionToStudentQuiz,
  mapQuizSubmissionDetailFromBackend,
  mapQuizSubmissionDetailForGradingFromBackend,
  mapQuizAnswersToCommand,
  mapQuizSubmissionDetailFromBackendNew,
} from "@/app/shared/mappers/quiz.mappers";

function mapCreateQuizToBackendCommand(
    quizData: Omit<Quiz, "id" | "courseId" | "courseUnitId" | "createdAt" | "active" | "availableNow">
): CreateQuizWithQuestionsCommand {
  const questions: QuizQuestionData[] = quizData.questions.map((q) => {
    let correctAnswer: string | undefined;

    if (q.type === "multiple-choice" && q.options && q.correctAnswer !== undefined) {
      correctAnswer = q.options[q.correctAnswer];
    } else if (q.type === "open-ended") {
      correctAnswer = q.expectedAnswer;
    }

    const question: QuizQuestionData = {
      questionText: q.question,
      questionType: q.type === "multiple-choice" ? "MULTIPLE_CHOICE" : "OPEN_ENDED",
      points: q.points ?? 0,
      options: [],
      correctAnswer,
    };

    if (q.type === "multiple-choice" && q.options) {
      question.options = q.options.map((option, index) => ({
        text: option,
        correct: index === q.correctAnswer,
      }));
    }

    return question;
  });

  const now = new Date();
  const formatDate = (dateString?: string): string => {
    if (!dateString) return now.toISOString();
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? now.toISOString() : date.toISOString();
  };

  return {
    courseId: "",
    unitId: "",
    title: quizData.title,
    description: quizData.description || "",
    timeLimitMinutes: quizData.timeLimit || 0,
    availableFrom: formatDate(quizData.dueDate),
    availableUntil: formatDate(quizData.dueDate),
    allowSeeResults: (quizData as any).allowSeeResults ?? false,
    totalScore: (quizData as any).totalScore ?? quizData.maxGrade ?? 100,
    questions,
  };
}

function mapUpdateQuizToBackendCommand(
    quizId: string,
    quizData: Partial<Quiz>
): UpdateQuizCommand {
  const command: UpdateQuizCommand = { quizId };

  if (quizData.title) command.title = quizData.title;
  if (quizData.description) command.description = quizData.description;
  if (quizData.timeLimit !== undefined) command.timeLimitMinutes = quizData.timeLimit;
  if (quizData.dueDate) {
    command.availableFrom = new Date().toISOString();
    command.availableUntil = quizData.dueDate;
  }

  command.maxAttempts = quizData.maxAttempts || 1;
  command.shuffleQuestions = quizData.shuffleQuestions || false;
  command.showCorrectAnswers = quizData.showCorrectAnswers || false;
  command.allowSeeResults = (quizData as any).allowSeeResults ?? false;  // ✅ NEW
  command.totalScore = (quizData as any).totalScore ?? quizData.maxGrade ?? 100; // ✅ NEW

  return command;
}

function mapAddQuestionToBackendCommand(
    quizId: string,
    question: Omit<Question, "id" | "text" | "maxPoints">
): AddQuizQuestionCommand {
  let correctAnswer: string | undefined;

  if (question.type === "multiple-choice" && question.correctAnswer !== undefined && question.options) {
    correctAnswer = question.options[question.correctAnswer];
  } else if (question.type === "open-ended") {
    correctAnswer = question.expectedAnswer;
  }

  const command: AddQuizQuestionCommand = {
    quizId,
    questionText: question.question,
    questionType: question.type === "multiple-choice" ? "MULTIPLE_CHOICE" : "OPEN_ENDED",
    points: question.points,
    options: [],
    correctAnswer,
  };

  if (question.type === "multiple-choice" && question.options) {
    command.options = question.options.map((option, index) => ({
      text: option,
      correct: index === question.correctAnswer,
    }));
  }

  return command;
}

export async function createQuiz(
    courseId: string,
    unitId: string,
    quizData: Omit<Quiz, "id" | "courseId" | "courseUnitId" | "createdAt" | "active" | "availableNow">
): Promise<Quiz> {
  try {
    console.log("🚀 Creating quiz with data:", quizData);

    const command = mapCreateQuizToBackendCommand(quizData);
    command.courseId = courseId;
    command.unitId = unitId;

    console.log("📤 Sending command to backend:", command);

   const { data } = await apiClient.post<SuccessResponseDTO>(
       "/api/quizzes/with-questions",
       command
    );

    console.log("✅ Quiz created, response:", data);

    const quiz = data.data;





    console.log("✨ Quiz fetched successfully:", quiz);

    return quiz;
  } catch (error) {
    console.error("❌ Error creating quiz:", error);
    return handleApiError(error);
  }
}



export async function updateQuiz(
    quizId: string,
    quizData: Partial<Quiz>
): Promise<Quiz> {
  try {
    console.log("🔄 Updating quiz:", quizId);

    const command = mapUpdateQuizToBackendCommand(quizId, quizData);

    await apiClient.put(`/api/quizzes/${quizId}`, command);

    await new Promise(resolve => setTimeout(resolve, 300));

    const quiz = await fetchQuizDetail(quizId);

    console.log("✅ Quiz updated successfully");

    return quiz;
  } catch (error) {
    console.error("❌ Error updating quiz:", error);
    return handleApiError(error);
  }
}

export async function deleteQuiz(quizId: string): Promise<void> {
  try {
    console.log("🗑️ Deleting quiz:", quizId);
    await apiClient.delete(`/api/quizzes/${quizId}`);
    console.log("✅ Quiz deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting quiz:", error);
    return handleApiError(error);
  }
}

export async function fetchQuizDetail(quizId: string): Promise<Quiz> {
  try {
    console.log("📥 Fetching quiz detail:", quizId);

    const { data } = await apiClient.get<CompleteQuizDTO>(
        `/api/quizzes/${quizId}/complete`
    );

    const quiz = mapQuizFromBackend(data);

    console.log("✅ Quiz detail fetched:", quiz.title);

    return quiz;
  } catch (error) {
    console.error("❌ Error fetching quiz detail:", error);
    return handleApiError(error);
  }
}

export async function fetchQuizzesByUnit(
    courseId: string,
    unitId: string
): Promise<Quiz[]> {
  try {
    console.log("📥 Fetching quizzes for unit:", { courseId, unitId });

    const { data } = await apiClient.get<QuizDTO[]>(
        `/api/quizzes/course/${courseId}/basic`
    );

    console.log(`📚 Found ${data.length} quizzes in course`);

    const unitQuizzes = await Promise.all(
        data.map(async (quiz) => {
          try {
            return await fetchQuizDetail(quiz.id);
          } catch (error) {
            console.warn(`⚠️ Failed to fetch quiz ${quiz.id}:`, error);
            return null;
          }
        })
    );

    const filteredQuizzes = unitQuizzes.filter(
        (quiz): quiz is Quiz => quiz !== null && quiz.courseUnitId === unitId
    );

    console.log(`✅ Found ${filteredQuizzes.length} quizzes for unit ${unitId}`);

    return filteredQuizzes;
  } catch (error) {
    console.error("❌ Error fetching quizzes by unit:", error);
    return handleApiError(error);
  }
}

export async function fetchQuizzesByCourse(
    courseId: string
): Promise<Quiz[]> {
  try {
    console.log("📥 Fetching all quizzes for course:", courseId);

    const { data } = await apiClient.get<QuizDTO[]>(
        `/api/quizzes/course/${courseId}/basic`
    );

    const quizzes = await Promise.all(
        data.map(async (quiz) => {
          try {
            return await fetchQuizDetail(quiz.id);
          } catch {
            return null;
          }
        })
    );

    const filteredQuizzes = quizzes.filter((quiz): quiz is Quiz => quiz !== null);

    console.log(`✅ Found ${filteredQuizzes.length} quizzes in course`);

    return filteredQuizzes;
  } catch (error) {
    console.error("❌ Error fetching quizzes by course:", error);
    return handleApiError(error);
  }
}

export async function addQuizQuestion(
    quizId: string,
    question: Omit<Question, "id" | "text" | "maxPoints">
): Promise<void> {
  try {
    console.log("➕ Adding question to quiz:", quizId);

    const command = mapAddQuestionToBackendCommand(quizId, question);

    await apiClient.post(`/api/quizzes/${quizId}/questions`, command);

    console.log("✅ Question added successfully");
  } catch (error) {
    console.error("❌ Error adding question:", error);
    return handleApiError(error);
  }
}

export async function addQuizQuestionsBulk(
    quizId: string,
    questions: Omit<Question, "id" | "text" | "maxPoints">[]
): Promise<void> {
  try {
    console.log(`➕ Adding ${questions.length} questions to quiz:`, quizId);

    const quizQuestions: QuizQuestionData[] = questions.map((q) => {
      let correctAnswer: string | undefined;

      if (q.type === "multiple-choice" && q.correctAnswer !== undefined && q.options) {
        correctAnswer = q.options[q.correctAnswer];
      } else if (q.type === "open-ended") {
        correctAnswer = q.expectedAnswer;
      }

      const questionData: QuizQuestionData = {
        questionText: q.question,
        questionType: q.type === "multiple-choice" ? "MULTIPLE_CHOICE" : "OPEN_ENDED",
        points: q.points,
        options: [],
        correctAnswer,
      };

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

    await apiClient.post(`/api/quizzes/${quizId}/questions/bulk`, command);

    console.log("✅ Questions added successfully");
  } catch (error) {
    console.error("❌ Error adding questions bulk:", error);
    return handleApiError(error);
  }
}

export async function deleteQuizQuestionsBulk(
    quizId: string,
    questionIds: string[]
): Promise<void> {
  try {
    console.log(`🗑️ Deleting ${questionIds.length} questions from quiz:`, quizId);

    const command: DeleteQuizQuestionsBulkCommand = {
      quizId,
      questionIds,
    };

    await apiClient.delete(`/api/quizzes/${quizId}/questions/bulk`, {
      data: command,
    });

    console.log("✅ Questions deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting questions bulk:", error);
    return handleApiError(error);
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
    console.log(`🔄 Updating ${updates.length} questions in quiz:`, quizId);

    const questionUpdates: QuestionUpdateData[] = updates.map((update) => {
      let correctAnswer: string | undefined;

      if (update.type === "multiple-choice" && update.options && update.correctAnswer !== undefined) {
        const correctIndex = typeof update.correctAnswer === "number" ? update.correctAnswer : 0;
        correctAnswer = update.options[correctIndex];
      } else if (update.type === "open-ended" && update.expectedAnswer) {
        correctAnswer = update.expectedAnswer;
      }

      const updateData: QuestionUpdateData = {
        questionId: update.questionId,
        questionText: update.questionText || null,
        questionType: update.type ? (update.type === "multiple-choice" ? "MULTIPLE_CHOICE" : "OPEN_ENDED") : null,
        points: update.points !== undefined ? update.points : null,
        options: null,
        correctAnswer: correctAnswer || null,
        action: update.action || "UPDATE_ALL",
      };

      if (update.type === "multiple-choice" && update.options && update.options.length > 0) {
        updateData.options = update.options.map((option, index) => ({
          text: option,
          correct: index === (typeof update.correctAnswer === "number" ? update.correctAnswer : 0),
          optionId: null,
          action: "UPDATE" as const,
        }));
      }

      return updateData;
    });

    const command: UpdateQuizQuestionsBulkCommand = {
      quizId,
      questions: questionUpdates,
    };

    await apiClient.put(`/api/quizzes/${quizId}/questions/bulk`, command);

    console.log("✅ Questions updated successfully");
  } catch (error) {
    console.error("❌ Error updating questions bulk:", error);
    return handleApiError(error);
  }
}

export async function updateQuestionsPointsBulk(
    quizId: string,
    questionPoints: Record<string, number>
): Promise<void> {
  try {
    console.log("🔄 Updating question points:", quizId);

    const command: UpdateQuestionsPointsCommand = {
      quizId,
      questionPoints,
    };

    await apiClient.patch(`/api/quizzes/${quizId}/questions/points`, command);

    console.log("✅ Question points updated successfully");
  } catch (error) {
    console.error("❌ Error updating question points:", error);
    return handleApiError(error);
  }
}

export async function updateQuestionsOptionsBulk(
    quizId: string,
    questionOptions: Record<string, { options: string[]; correctAnswer: number }>
): Promise<void> {
  try {
    console.log("🔄 Updating question options:", quizId);

    const backendQuestionOptions: Record<string, QuestionOptionData[]> = {};

    Object.entries(questionOptions).forEach(([questionId, data]) => {
      backendQuestionOptions[questionId] = data.options.map((option, index) => ({
        text: option,
        correct: index === data.correctAnswer,
      }));
    });

    const command: UpdateQuestionsOptionsCommand = {
      quizId,
      questionOptions: backendQuestionOptions,
    };

    await apiClient.patch(`/api/quizzes/${quizId}/questions/options`, command);

    console.log("✅ Question options updated successfully");
  } catch (error) {
    console.error("❌ Error updating question options:", error);
    return handleApiError(error);
  }
}

export async function fetchStudentQuizSubmissions(
    courseId: string,
    studentId: string,
    unitId: string
): Promise<StudentSubmissionQuiz[]> {
  try {
    const { data } = await apiClient.get<QuizSubmissionDTO[]>(
        `/api/quiz-submissions/student/${studentId}/course/${courseId}/unit/${unitId}/basic`
    );
    return data.map(mapQuizSubmissionToStudentQuiz);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchTeacherQuizSubmissions(
    courseId: string,
    unitId: string
): Promise<StudentSubmissionQuiz[]> {
  try {
    const { data } = await apiClient.get<QuizSubmissionDTO[]>(
        `/api/quiz-submissions/course/${courseId}/unit/${unitId}/basic`
    );
    return data.map(mapQuizSubmissionToStudentQuiz);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchQuizSubmissionsByCourseBasic(
    courseId: string
): Promise<QuizSubmissionBasicDTO[]> {
  try {
    const { data } = await apiClient.get<QuizSubmissionBasicDTO[]>(
        `/api/quiz-submissions/course/${courseId}/basic`
    );
    return data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getStudentQuizSubmission(
    quizId: string,
    studentId: string
): Promise<QuizSubmission | null> {
  try {
    const { data } = await apiClient.get<QuizSubmissionDetailForStudentDTO>(
        `/api/quiz-submissions/quiz/${quizId}/student/${studentId}/detail`
    );
    return mapQuizSubmissionFromBackend(data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    return handleApiError(error);
  }
}

export async function fetchQuizSubmissionDetail(
    submissionId: string
): Promise<QuizSubmissionDetail> {
  try {
    const { data } = await apiClient.get<QuizSubmissionDetailDTONew>(
        `/api/quiz-submissions/${submissionId}/detail`
    );
    console.log("Raw quiz submission detail from backend:", data);
    return mapQuizSubmissionDetailFromBackendNew(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchQuizSubmissionDetailForGrading(
    submissionId: string
): Promise<QuizSubmissionDetail> {
  try {
    const { data } = await apiClient.get<QuizSubmissionDetailForGradingDTO>(
        `/api/quiz-submissions/${submissionId}/detail`
    );
    return mapQuizSubmissionDetailForGradingFromBackend(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function submitQuiz(params: {
  quizId: string;
  studentId: string;
  answers: Record<string, any>;
  timeSpent?: number;
}): Promise<QuizSubmission> {
  try {
    const backendCommand = mapQuizAnswersToCommand(
        params.quizId,
        params.studentId,
        params.answers,
        params.timeSpent
    );

    await apiClient.post<SuccessResponseDTO>(
        `/api/quiz-submissions/submit-with-answers`,
        backendCommand
    );

    const submission = await getStudentQuizSubmission(
        params.quizId,
        params.studentId
    );

    if (!submission) {
      throw new Error("Failed to retrieve quiz submission after submit");
    }

    return submission;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function gradeQuizSubmission(
  submissionId: string,
  grades: {
    questionId: string;
    earnedPoints: number;  // raw points earned for this question
    maxPoints: number;     // max points for this question
    feedback?: string;
  }[],
  overallGrade?: {
    earnedPoints: number;
    totalPoints: number;   // this should be the quiz totalScore (e.g. 22)
  }
): Promise<QuizSubmissionDetail> {
  try {
    const rawEarned = grades.reduce((sum, g) => sum + g.earnedPoints, 0);
    const rawMax = grades.reduce((sum, g) => sum + g.maxPoints, 0);

    const finalEarned = overallGrade?.earnedPoints ?? rawEarned;
    const finalTotal  = overallGrade?.totalPoints  ?? rawMax;

    const command: GradeQuizSubmissionCommand = {
      quizSubmissionId: submissionId,
      earnedPoints: Math.round(finalEarned * 100) / 100,  // 2 decimal precision
      totalPoints: finalTotal,
      questionGrades: grades.map((grade) => ({
        questionId: grade.questionId,
        earnedPoints: grade.earnedPoints,
        maxPoints: grade.maxPoints,
        feedback: grade.feedback ?? "",
      })),
    };

    await apiClient.post(
      `/api/quiz-submissions/${submissionId}/grade`,
      command
    );

    return await fetchQuizSubmissionDetail(submissionId);
  } catch (error) {
    return handleApiError(error);
  }
}
export async function deleteQuizSubmission(submissionId: string): Promise<void> {
  try {
    await apiClient.delete(`/api/quiz-submissions/${submissionId}`);
  } catch (error) {
    return handleApiError(error);
  }
}

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
          errors.push(`Question ${index + 1}: At least 2 options are required for multiple choice`);
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
