import {
    QuizDTO,
    CompleteQuizDTO,
    SubmissionQuizDTO,
    QuizSubmissionDTO,
    QuizSubmissionDetailDTO,
    QuizSubmissionDetailForStudentDTO,
    QuizSubmissionDetailForGradingDTO,
    GradeDTO,
    QuizSubmissionDetailDTONew,
} from "@/app/shared/dtos/quiz.dto";

import {
    SubmitQuizWithAnswersCommand,
    QuizAnswerData,
} from "@/app/shared/dtos/commands/quiz.commands";

import {
    Quiz,
    Question,
    SubmissionQuiz,
    QuizSubmission,
    QuizSubmissionDetail,
    StudentSubmissionQuiz,
    ExtendedQuizAnswer,
    QuestionType,
} from "@/app/shared/models/quiz.model";

/* =========================
   QUIZ MAPPERS
========================= */

export function mapQuizFromBackend(dto: CompleteQuizDTO): Quiz {
    const questions: Question[] = dto.questions.map((q, index) => {
        const question: Question = {
            id: q.id || `question-${index}`,
            type: q.questionType === "MULTIPLE_CHOICE" ? "multiple-choice" : "open-ended",
            question: q.questionText,
            points: q.points,
            text: q.questionText,
            maxPoints: q.points,
        };

        if (q.questionType === "MULTIPLE_CHOICE" && q.options) {
            question.options = q.options.map((opt) => opt.text);
            const correctIndex = q.options.findIndex((opt) => opt.correct);
            question.correctAnswer = correctIndex >= 0 ? correctIndex : 0;
        }

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
        acceptLateSubmissions: true,
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
        allowSeeResults: dto.allowSeeResults,
        totalScore: dto.totalScore
    };
}



export function mapQuizSubmissionDetailFromBackendNew(
  dto: QuizSubmissionDetailDTONew
): QuizSubmissionDetail {
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
    timeExpired: dto.timeExpired,
    unitId: dto.unitId ?? "",
    unitName: dto.unitName ?? "",
    questionResponses: dto.questionResponses.map((qr) => ({
      questionId: qr.questionId,
      questionText: qr.questionText,
      questionType: qr.questionType,
      maxPoints: qr.maxPoints,        // ✅ FIXED: was qr.points (wrong field)
      earnedPoints: qr.earnedPoints,  // ✅ FIXED: was qr.points (always same)
      teacherFeedback: qr.teacherFeedback ?? "",
      isAutoGraded: qr.isAutoGraded,
      options: qr.options ?? [],
      selectedOptions: qr.selectedOptions ?? [],
      textAnswer: qr.textAnswer ?? "",
      correctAnswer: qr.correctAnswer ?? "",
      isCorrect: qr.isCorrect,
    })),
  };
}


/* =========================
   SIMPLE SUBMISSION MAPPERS
========================= */

export function mapSubmissionQuizFromBackend(dto: SubmissionQuizDTO): SubmissionQuiz {
    return {
        id: dto.id,
        quizId: dto.quizId,
        studentId: dto.studentId,
        courseId: dto.courseId,
        submittedAt: dto.submittedAt,
        score: dto.score,
        maxScore: dto.maxScore,
        passed: dto.passed,
        answers: dto.answers.map(answer => ({
            questionId: answer.questionId,
            selectedAnswer: answer.selectedAnswer,
            isCorrect: answer.isCorrect,
            points: answer.points,
        })),
        feedback: dto.feedback,
    };
}

export function mapQuizSubmissionToStudentQuiz(
    submission: QuizSubmissionDTO
): StudentSubmissionQuiz {
    const isOverdue = submission.status !== "GRADED";

    return {
        id: submission.quizId,
        title: submission.quizTitle,
        maxGrade: submission.grade ? parseInt(submission.grade.maxScore) : 100,
        isOverdue,
        studentId: submission.studentId,
        unitId: "",
        studentName: submission.studentName,
        submission: {
            id: submission.id,
            status: submission.status,
            submittedAt: submission.submittedAt,
            grade: submission.grade ? {
                value: parseInt(submission.grade.value),
                maxScore: parseInt(submission.grade.maxScore),
            } : undefined,
        },
    };
}

/* =========================
   DETAILED SUBMISSION MAPPERS
========================= */

export function mapQuizSubmissionDetailFromBackend(
    dto: QuizSubmissionDetailDTO
): QuizSubmissionDetail {
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
        timeExpired: dto.timeExpired,
        questionResponses: dto.questionResponses.map(qr => ({
            questionId: qr.questionId,
            questionText: qr.questionText,
            questionType: qr.questionType,
            maxPoints: qr.points,
            earnedPoints: qr.points,
            teacherFeedback: '',
            isAutoGraded: true,
            options: qr.options,
            selectedOptions: qr.selectedOptions,
            textAnswer: qr.textAnswer,
            correctAnswer: qr.correctAnswer,
            isCorrect: qr.isCorrect,
        })),
        unitId: '',
        unitName: '',
    };
}

export function mapQuizSubmissionDetailForGradingFromBackend(
    dto: QuizSubmissionDetailForGradingDTO
): QuizSubmissionDetail {
    let timeSpent = 0;
    if (dto.startedAt && dto.submittedAt) {
        const started = new Date(dto.startedAt).getTime();
        const submitted = new Date(dto.submittedAt).getTime();
        timeSpent = Math.max(0, submitted - started) / 1000;
    }

    const earnedPoints = dto.questionResponses.reduce((sum, qr) => sum + qr.earnedPoints, 0);
    const totalPoints = dto.questionResponses.reduce((sum, qr) => sum + qr.maxPoints, 0);

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
        earnedPoints,
        totalPoints,
        timeSpentSeconds: Math.round(timeSpent),
    };
}

/* =========================
   EXTENDED SUBMISSION MAPPER (para compatibilidad)
========================= */

export function mapQuizSubmissionFromBackendNew(
  dto: QuizSubmissionDetailForStudentDTO
): QuizSubmission {
  let timeSpent = 0;
  if (dto.startedAt && dto.submittedAt) {
    const started = new Date(dto.startedAt).getTime();
    const submitted = new Date(dto.submittedAt).getTime();
    timeSpent = Math.max(0, submitted - started) / 1000;
  }

  const answers: ExtendedQuizAnswer[] = dto.questionResponses.map((qr) => ({
    questionId: qr.questionId,
    questionText: qr.questionText,
    questionType: qr.questionType.toLowerCase() as QuestionType,
    studentAnswer:
      qr.questionType === "MULTIPLE_CHOICE"
        ? (qr.selectedOptions?.[0] ?? -1)
        : qr.textAnswer || "",
    // ✅ correctAnswer from submission — used for open-ended expected answer
    correctAnswer: qr.correctAnswer,
    points: qr.earnedPoints,
    maxPoints: qr.maxPoints,
    isCorrect: qr.isCorrect,
    feedback: qr.teacherFeedback || "",
  }));

  const totalScore = answers.reduce((sum, ans) => sum + ans.points, 0);
  const maxScore = answers.reduce((sum, ans) => sum + ans.maxPoints, 0);

  return {
    id: dto.id,
    quizId: dto.quizId,
    studentId: dto.studentId,
    courseId: dto.unitId || dto.quizId,
    studentName: dto.studentName,
    content: JSON.stringify(answers),
    
    submittedAt: dto.submittedAt,
    status: dto.status,
    // ✅ canViewResults carried from backend into the model
    canViewResults: dto.canViewResults ?? false,
    grade: dto.grade
      ? {
          value: parseFloat(dto.grade.value),
          maxScore: parseFloat(dto.grade.maxScore),
        }
      : { value: totalScore, maxScore },
    teacherFeedback: "",
    quizData: {
      answers,
      timeSpent: Math.round(timeSpent),
      totalScore,
      maxScore,
    },
  };
}

export function mapQuizSubmissionFromBackend(
    dto: QuizSubmissionDetailForStudentDTO
): QuizSubmission {
    let timeSpent = 0;
    if (dto.startedAt && dto.submittedAt) {
        const started = new Date(dto.startedAt).getTime();
        const submitted = new Date(dto.submittedAt).getTime();
        timeSpent = Math.max(0, submitted - started) / 1000;
    }

    const answers: ExtendedQuizAnswer[] = dto.questionResponses.map(qr => ({
        questionId: qr.questionId,
        questionText: qr.questionText,
        questionType: qr.questionType.toLowerCase() as QuestionType,
        studentAnswer: qr.questionType === 'MULTIPLE_CHOICE'
            ? (qr.selectedOptions?.[0] ?? -1)
            : qr.textAnswer || '',
        correctAnswer: qr.correctAnswer,
        points: qr.earnedPoints,
        maxPoints: qr.maxPoints,
        isCorrect: qr.isCorrect,
        feedback: qr.teacherFeedback || '',
    }));

    const totalScore = answers.reduce((sum, ans) => sum + ans.points, 0);
    const maxScore = answers.reduce((sum, ans) => sum + ans.maxPoints, 0);

    return {
        canViewResults: dto.canViewResults ?? false,
        id: dto.id,
        quizId: dto.quizId,
        studentId: dto.studentId,
        courseId: dto.unitId || dto.quizId,
        studentName: dto.studentName,
        content: JSON.stringify(answers),
        submittedAt: dto.submittedAt,
        status: dto.status,
        grade: dto.grade ? {
            value: parseFloat(dto.grade.value),
            maxScore: parseFloat(dto.grade.maxScore),
        } : {
            value: totalScore,
            maxScore: maxScore,
        },
        teacherFeedback: '',
        quizData: {
            answers: answers,
            timeSpent: Math.round(timeSpent),
            totalScore: totalScore,
            maxScore: maxScore,
        },
    };
}

/* =========================
   COMMAND MAPPERS
========================= */

export function mapQuizAnswersToCommand(
    quizId: string,
    studentId: string,
    answers: Record<string, any>,
    timeSpent?: number
): SubmitQuizWithAnswersCommand {
    const backendAnswers: { [questionId: string]: QuizAnswerData } = {};

    Object.entries(answers).forEach(([questionId, answerData]) => {
        let selectedOptions: number[] = [];
        let textAnswer = '';
        const questionType = answerData.questionType || answerData.type;

        if (questionType === "multiple-choice") {
            const answer = answerData.studentAnswer !== undefined
                ? answerData.studentAnswer
                : answerData.answer;
            selectedOptions = [Number(answer)];
        } else if (questionType === "open-ended") {
            const answer = answerData.studentAnswer !== undefined
                ? answerData.studentAnswer
                : answerData.answer;
            textAnswer = String(answer || '');
        }

        backendAnswers[questionId] = {
            selectedOptions,
            textAnswer,
            timeSpentSeconds: answerData.timeSpent || timeSpent || 0,
        };
    });

    return {
        quizId,
        studentId,
        answers: backendAnswers,
    };
}