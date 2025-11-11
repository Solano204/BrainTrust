// File: src/app/features/courses/components/QuizSubmissionsView.tsx
"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
    ArrowLeft, 
    CheckCircle, 
    XCircle, 
    HelpCircle, 
    BarChart3, 
    Users, 
    Clock,
    Download,
    FileText,
    ChevronDown,
    ChevronUp,
    Calculator
} from "lucide-react";
import { useQuiz, useQuizSubmissions, useQuizStats, useQuizMutations } from "@/app/presentation/hooks/submission/quiz-hooks";
import { Question, Submission } from "@/app/domain/entities/CourseEntities";
import { UserId } from "@/app/domain/valueObjects";

interface QuizSubmissionsViewProps {
    quizId: string;
    courseId: string;
    onBack: () => void;
}

interface StudentAnswer {
    questionId: string;
    answer: string | number;
    isCorrect?: boolean;
    score?: number;
}

interface ExpandedQuestions {
    [studentId: string]: boolean;
}

export function QuizSubmissionsView({ quizId, courseId, onBack }: QuizSubmissionsViewProps) {
    const { data: quiz, isLoading: isLoadingQuiz } = useQuiz(quizId);
    console.log("QUIIZ ID :", quizId);
    const { data: submissions, isLoading: isLoadingSubmissions } = useQuizSubmissions(quizId);
    const { data: stats } = useQuizStats(quizId);
    const { gradeSubmission, autoGrade } = useQuizMutations();

    const [selectedStudent, setSelectedStudent] = React.useState<UserId | null>(null);
    const [grades, setGrades] = React.useState<{ [key: string]: number }>({});
    const [expandedQuestions, setExpandedQuestions] = React.useState<ExpandedQuestions>({});
    const [viewMode, setViewMode] = React.useState<'detailed' | 'overview'>('overview');

    // Get selected student's submission
    const selectedSubmission = submissions?.find(sub => sub.studentId === selectedStudent);

    // Parse student answers from submission content
    const getStudentAnswers = (submission: Submission): StudentAnswer[] => {
        try {
            // Try to parse as JSON first
            const parsed = JSON.parse(submission.content);
            if (Array.isArray(parsed)) {
                return parsed;
            }
            
            // If it's a string with answers, parse it
            if (typeof submission.content === 'string' && submission.content.includes('Answers:')) {
                const lines = submission.content.split('\n').filter(line => line.trim());
                const answers: StudentAnswer[] = [];
                
                lines.forEach((line, index) => {
                    if (line.startsWith('Answers:')) return;
                    
                    const match = line.match(/(\d+)\.\s*(.+)/);
                    if (match) {
                        const questionIndex = parseInt(match[1]) - 1;
                        const answer = match[2].trim();
                        
                        if (quiz?.questions[questionIndex]) {
                            answers.push({
                                questionId: quiz.questions[questionIndex].id,
                                answer: answer
                            });
                        }
                    }
                });
                
                return answers;
            }
            
            return [];
        } catch {
            // If parsing fails, try to extract answers from plain text
            if (typeof submission.content === 'string') {
                const answers: StudentAnswer[] = [];
                const lines = submission.content.split('\n').filter(line => line.trim());
                
                lines.forEach((line, index) => {
                    if (quiz?.questions[index]) {
                        answers.push({
                            questionId: quiz.questions[index].id,
                            answer: line.trim()
                        });
                    }
                });
                
                return answers;
            }
            
            return [];
        }
    };

    // Calculate score for a student
    const calculateScore = (answers: StudentAnswer[]) => {
        const totalPoints = quiz?.questions.reduce((sum, q) => sum + q.points, 0) || 0;
        const earnedPoints = answers.reduce((sum, answer) => sum + (answer.score || 0), 0);
        return totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    };

    // Auto-grade multiple choice questions
    const handleAutoGrade = (submissionId: string) => {
        autoGrade.mutate(submissionId);
    };

    // Manual grading
    const handleGradeChange = (questionId: string, score: number) => {
        setGrades(prev => ({
            ...prev,
            [questionId]: score
        }));
    };

    const handleSubmitGrades = (submissionId: string) => {
        const gradeUpdates = Object.entries(grades).map(([questionId, score]) => ({
            questionId,
            score
        }));
        
        gradeSubmission.mutate({
            submissionId,
            grades: gradeUpdates
        });
    };

    // Toggle question expansion for a student
    const toggleQuestionExpansion = (studentId: UserId) => {
        setExpandedQuestions(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));
    };

    // Get correct answer text for multiple choice
    const getCorrectAnswerText = (question: Question): string => {
        if (question.type === 'multiple-choice' && question.options && question.correctAnswer !== undefined) {
            return question.options[question.correctAnswer];
        }
        return question.expectedAnswer || 'No expected answer provided';
    };

    // Check if answer is correct
    const isAnswerCorrect = (question: Question, studentAnswer: StudentAnswer): boolean => {
        if (question.type === 'multiple-choice') {
            return studentAnswer.answer === question.correctAnswer;
        }
        return false; // For open-ended, we can't auto-determine correctness
    };

    // Export submissions to CSV
    const exportToCSV = () => {
        if (!submissions || !quiz) return;

        const headers = ['Student ID', 'Submitted At', 'Total Score', ...quiz.questions.map((q, i) => [`Q${i + 1} Answer`, `Q${i + 1} Score`]).flat()];
        const csvData = submissions.map(submission => {
            const answers = getStudentAnswers(submission);
            const score = calculateScore(answers);
            
            const row = [
                submission.studentId,
                new Date(submission.submittedAt).toLocaleString(),
                `${score}%`,
                ...quiz.questions.flatMap((question, index) => {
                    const answer = answers.find(a => a.questionId === question.id);
                    return [
                        answer?.answer?.toString() || 'No answer',
                        answer?.score?.toString() || '0'
                    ];
                })
            ];
            
            return row;
        });

        const csvContent = [headers, ...csvData].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quiz-submissions-${quiz.title}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (isLoadingQuiz || isLoadingSubmissions) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading quiz submissions...</p>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="p-8 text-center text-destructive">
                <p>Quiz not found</p>
                <Button onClick={onBack} className="mt-4">Back to Inventory</Button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <Button onClick={onBack} variant="outline" className="gap-2 mb-4">
                        <ArrowLeft className="h-4 w-4" /> Back to Inventory
                    </Button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{quiz.title} - Submissions</h1>
                    <p className="text-muted-foreground mt-2">{quiz.description}</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-3">
                    {stats && (
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{stats.totalSubmissions} submissions</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                <span>Avg: {stats.averageScore}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{stats.completionRate}% completed</span>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex gap-2">
                        <Button
                            onClick={exportToCSV}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </Button>
                        <Button
                            onClick={() => setViewMode(viewMode === 'overview' ? 'detailed' : 'overview')}
                            variant="outline"
                            size="sm"
                        >
                            {viewMode === 'overview' ? 'Detailed View' : 'Overview'}
                        </Button>
                    </div>
                </div>
            </div>

            {viewMode === 'overview' ? (
                /* OVERVIEW MODE - Show all submissions with expandable questions */
                <div className="space-y-4">
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-4">All Submissions Overview</h2>
                        <div className="space-y-4">
                            {submissions?.map((submission) => {
                                const answers = getStudentAnswers(submission);
                                const score = calculateScore(answers);
                                const isExpanded = expandedQuestions[submission.studentId];
                                
                                return (
                                    <Card key={submission.studentId + submission.submittedAt}  className="p-4 border-l-4 border-blue-500">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-semibold text-lg">Student {submission.studentId}</h3>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                    <span>Submitted: {new Date(submission.submittedAt).toLocaleString()}</span>
                                                    <Badge variant={score >= quiz.passingScore ? "default" : "secondary"}>
                                                        Score: {score}%
                                                    </Badge>
                                                    <span>Status: {submission.status}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => toggleQuestionExpansion(submission.studentId)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-2"
                                                >
                                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                    {isExpanded ? 'Collapse' : 'Expand'}
                                                </Button>
                                                <Button
                                                    onClick={() => setSelectedStudent(submission.studentId)}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    Grade
                                                </Button>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="space-y-4 mt-4 pt-4 border-t">
                                                {quiz.questions.map((question, index) => {
                                                    const studentAnswer = answers.find(a => a.questionId === question.id);
                                                    const isMultipleChoice = question.type === 'multiple-choice';
                                                    const isCorrect = studentAnswer ? isAnswerCorrect(question, studentAnswer) : false;
                                                    
                                                    return (
                                                        <div key={question.id} className="p-4 bg-muted/30 rounded-lg">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <h4 className="font-medium">
                                                                    Question {index + 1} - {question.points} points
                                                                </h4>
                                                                <Badge variant={isCorrect ? "default" : "secondary"}>
                                                                    {question.type}
                                                                </Badge>
                                                            </div>
                                                            
                                                            <p className="mb-3 font-medium">{question.text}</p>

                                                            {/* Student Answer */}
                                                            <div className="mb-3">
                                                                <strong className="text-sm">Student's Answer:</strong>
                                                                {isMultipleChoice ? (
                                                                    <div className="mt-2 space-y-2">
                                                                        {question.options?.map((option, optIndex) => (
                                                                            <div
                                                                                key={optIndex}
                                                                                className={`p-2 rounded border ${
                                                                                    studentAnswer?.answer === optIndex
                                                                                        ? isCorrect
                                                                                            ? "bg-green-100 border-green-500"
                                                                                            : "bg-red-100 border-red-500"
                                                                                        : "bg-gray-50"
                                                                                }`}
                                                                            >
                                                                                <div className="flex items-center gap-2">
                                                                                    {studentAnswer?.answer === optIndex && (
                                                                                        isCorrect ? (
                                                                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                                                                        ) : (
                                                                                            <XCircle className="h-4 w-4 text-red-600" />
                                                                                        )
                                                                                    )}
                                                                                    {option}
                                                                                    {optIndex === question.correctAnswer && (
                                                                                        <Badge variant="outline" className="ml-auto">
                                                                                            Correct Answer
                                                                                        </Badge>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <div className="mt-2">
                                                                        <Textarea
                                                                            value={studentAnswer?.answer?.toString() || "No answer provided"}
                                                                            readOnly
                                                                            className="min-h-[100px] bg-white"
                                                                        />
                                                                        {question.expectedAnswer && (
                                                                            <div className="mt-2 p-2 bg-blue-50 rounded border">
                                                                                <strong className="text-sm">Expected Answer:</strong>
                                                                                <p className="text-sm mt-1">{question.expectedAnswer}</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Current Score */}
                                                            <div className="flex items-center gap-3">
                                                                <label className="text-sm font-medium">Score:</label>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    max={question.points}
                                                                    value={studentAnswer?.score || 0}
                                                                    onChange={(e) => handleGradeChange(question.id, parseInt(e.target.value) || 0)}
                                                                    className="w-20"
                                                                />
                                                                <span className="text-sm text-muted-foreground">
                                                                    / {question.points}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                
                                                <div className="flex justify-end gap-3 pt-4 border-t">
                                                    <Button
                                                        onClick={() => handleAutoGrade(submission.id)}
                                                        disabled={autoGrade.isPending}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        {autoGrade.isPending ? "Grading..." : "Auto-Grade"}
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleSubmitGrades(submission.id)}
                                                        disabled={gradeSubmission.isPending}
                                                        size="sm"
                                                    >
                                                        {gradeSubmission.isPending ? "Saving..." : "Save Grades"}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            ) : (
                /* DETAILED MODE - Original side-by-side view */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Students List */}
                    <Card className="lg:col-span-1 p-6">
                        <h2 className="text-lg font-semibold mb-4">Students</h2>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {submissions?.map((submission) => {
                                const answers = getStudentAnswers(submission);
                                const score = calculateScore(answers);
                                
                                return (
                                    <Button
                                        key={submission.studentId}
                                        variant={selectedStudent === submission.studentId ? "default" : "outline"}
                                        className="w-full justify-start h-auto p-3"
                                        onClick={() => setSelectedStudent(submission.studentId)}
                                    >
                                        <div className="text-left w-full">
                                            <div className="font-medium">Student {submission.studentId}</div>
                                            <div className="flex justify-between items-center mt-1">
                                                <Badge variant={score >= quiz.passingScore ? "default" : "secondary"}>
                                                    {score}%
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(submission.submittedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </Button>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Submission Details */}
                    <Card className="lg:col-span-2 p-6">
                        {selectedSubmission ? (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold">
                                        Submission - Student {selectedSubmission.studentId}
                                    </h2>
                                    <Button
                                        onClick={() => handleAutoGrade(selectedSubmission.id)}
                                        disabled={autoGrade.isPending}
                                        variant="outline"
                                        size="sm"
                                    >
                                        {autoGrade.isPending ? "Grading..." : "Auto-Grade"}
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {quiz.questions.map((question, index) => {
                                        const answers = getStudentAnswers(selectedSubmission);
                                        const studentAnswer = answers.find(a => a.questionId === question.id);
                                        const isMultipleChoice = question.type === 'multiple-choice';
                                        const isCorrect = studentAnswer ? isAnswerCorrect(question, studentAnswer) : false;
                                        
                                        return (
                                            <Card key={question.id} className="p-4 border-l-4 border-blue-500">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h3 className="font-semibold">
                                                        Question {index + 1} - {question.points} points
                                                    </h3>
                                                    <div className="flex gap-2">
                                                        <Badge variant={isCorrect ? "default" : "secondary"}>
                                                            {question.type}
                                                        </Badge>
                                                        {isMultipleChoice && (
                                                            <Badge variant={isCorrect ? "default" : "destructive"}>
                                                                {isCorrect ? 'Correct' : 'Incorrect'}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <p className="mb-4 font-medium">{question.text}</p>

                                                {/* Student Answer */}
                                                <div className="mb-3">
                                                    <strong>Student's Answer:</strong>
                                                    {isMultipleChoice ? (
                                                        <div className="mt-2 space-y-2">
                                                            {question.options?.map((option, optIndex) => (
                                                                <div
                                                                    key={optIndex}
                                                                    className={`p-2 rounded border ${
                                                                        studentAnswer?.answer === optIndex
                                                                            ? isCorrect
                                                                                ? "bg-green-100 border-green-500"
                                                                                : "bg-red-100 border-red-500"
                                                                            : "bg-gray-50"
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        {studentAnswer?.answer === optIndex && (
                                                                            isCorrect ? (
                                                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                                            ) : (
                                                                                <XCircle className="h-4 w-4 text-red-600" />
                                                                            )
                                                                        )}
                                                                        {option}
                                                                        {optIndex === question.correctAnswer && (
                                                                            <Badge variant="outline" className="ml-auto">
                                                                                Correct Answer
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="mt-2">
                                                            <Textarea
                                                                value={studentAnswer?.answer?.toString() || "No answer provided"}
                                                                readOnly
                                                                className="min-h-[100px] bg-white"
                                                            />
                                                            {question.expectedAnswer && (
                                                                <div className="mt-2 p-2 bg-blue-50 rounded border">
                                                                    <strong>Expected Answer:</strong>
                                                                    <p className="mt-1">{question.expectedAnswer}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Grading */}
                                                <div className="flex items-center gap-3">
                                                    <label className="text-sm font-medium">Score:</label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max={question.points}
                                                        value={grades[question.id] ?? studentAnswer?.score ?? 0}
                                                        onChange={(e) => handleGradeChange(question.id, parseInt(e.target.value) || 0)}
                                                        className="w-20"
                                                    />
                                                    <span className="text-sm text-muted-foreground">
                                                        / {question.points}
                                                    </span>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button
                                        onClick={() => handleSubmitGrades(selectedSubmission.id)}
                                        disabled={gradeSubmission.isPending}
                                    >
                                        {gradeSubmission.isPending ? "Saving..." : "Save Grades"}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Select a student to view their submission</p>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
}