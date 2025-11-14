"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FileText, Calculator, Download, Paperclip, Link as LinkIcon } from "lucide-react";
import type { Quiz } from "@/app/domain/entities/CourseEntities";

interface QuizViewProps {
  quiz: Quiz;
  onClose: () => void;
}

export function QuizView({ quiz, onClose }: QuizViewProps) {
  const totalPoints = quiz.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <Badge className="mb-2 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              QUIZ
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">{quiz.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {quiz.timeLimit && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Time Limit: {quiz.timeLimit} minutes</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calculator className="h-4 w-4" />
                <span>Total Points: {totalPoints}</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>Questions: {quiz.questions?.length || 0}</span>
              </div>
              {quiz.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {new Date(quiz.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
          
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {/* Quiz Description */}
        {quiz.description && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-foreground">{quiz.description}</p>
          </Card>
        )}

        {/* Quiz Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quiz Settings</h3>
            <div className="space-y-3">
              {quiz.timeLimit && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Limit:</span>
                  <span className="font-medium">{quiz.timeLimit} minutes</span>
                </div>
              )}
             
              {quiz.dueDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span className="font-medium">
                    {new Date(quiz.dueDate).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Grading</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Points:</span>
                <span className="font-medium">{totalPoints}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Grade:</span>
                <span className="font-medium">{quiz.maxGrade || 100}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Late Submissions:</span>
                <span className="font-medium">{quiz.acceptLateSubmissions ? 'Allowed' : 'Not allowed'}</span>
              </div>
            </div>
          </Card>
        </div>

        

        {/* Questions */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6">Questions ({quiz.questions?.length || 0})</h3>
          <div className="space-y-8">
            {quiz.questions?.map((question, index) => (
              <div key={question.id} className="border-l-4 border-primary pl-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="font-semibold text-lg">Question {index + 1}</span>
                    <Badge variant="outline" className="ml-2">
                      {question.points || 0} points
                    </Badge>
                    <Badge variant="secondary" className="ml-2">
                      {question.type === 'multiple-choice' ? 'Multiple Choice' : 'Open Answer'}
                    </Badge>
                  </div>
                </div>

                <p className="text-foreground mb-4 text-lg">{question.question}</p>

                {question.type === 'multiple-choice' && question.options && (
                  <div className="space-y-2 ml-4">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          question.correctAnswer === optIndex 
                            ? 'border-green-500 bg-green-500 text-white' 
                            : 'border-border'
                        }`}>
                          {String.fromCharCode(65 + optIndex)}
                        </div>
                        <span className={question.correctAnswer === optIndex ? 'font-semibold text-green-600' : ''}>
                          {option}
                        </span>
                        {question.correctAnswer === optIndex && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Correct
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {question.type === 'open-ended' && (
                  <div className="ml-4 p-4 bg-muted/30 rounded-lg border border-dashed border-border">
                    <p className="text-muted-foreground italic">Open answer - Students will write their response here</p>
                  </div>
                )}
              </div>
            ))}

            {(!quiz.questions || quiz.questions.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No questions added to this quiz yet.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}