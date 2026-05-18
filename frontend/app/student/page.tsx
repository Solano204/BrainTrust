
"use client";

import { QuizView } from '@/components/student/quiz-view-submission-student';
import { TaskSubmissionView } from '@/components/student/quiz-view-tasks-student';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function StudentAssignmentPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'task' | 'quiz'>('task');
  
  const mockAssignment = {
    id: '1',
    title: 'Research Paper on Machine Learning',
    courseId: 'course1',
    unitId: 'unit1',
    description: 'Write a comprehensive research paper on machine learning applications',
    instructions: `Write a 5-page research paper discussing the impact of machine learning on modern technology.

Requirements:
- Minimum 5 pages
- Include at least 5 academic references
- Follow APA formatting
- Submit as PDF document

Topics to cover:
1. History of machine learning
2. Current applications
3. Future implications
4. Ethical considerations`,
    dueDate: '2024-12-31T23:59:59',
    maxScore: { value: 100 },
    deliveryMode: 'INDIVIDUAL',
    allowLateSubmissions: true,
    attachments: [
      {
        name: 'Research Paper Guidelines.pdf',
        storagePath: 'guidelines.pdf'
      }
    ]
  };

  const mockQuiz = {
    id: '1',
    title: 'Machine Learning Fundamentals Quiz',
    description: 'Test your knowledge of basic machine learning concepts',
    courseUnitId: 'unit1',
    courseId: 'course1',
    maxGrade: 100,
    timeLimit: 30,
    passingScore: 70,
    dueDate: '2024-12-31T23:59:59',
    acceptLateSubmissions: true,
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice' as const,
        text: 'What is machine learning?',
        question: 'What is machine learning?',
        options: [
          'A type of computer programming',
          'A subset of artificial intelligence',
          'A database management system',
          'A networking protocol'
        ],
        correctAnswer: 1,
        points: 10,
        maxPoints: 10
      },
      {
        id: 'q2',
        type: 'open-ended' as const,
        text: 'Explain the difference between supervised and unsupervised learning.',
        question: 'Explain the difference between supervised and unsupervised learning.',
        points: 20,
        maxPoints: 20,
        expectedAnswer: 'Supervised learning uses labeled data while unsupervised learning finds patterns in unlabeled data.'
      }
    ]
  };

  const handleTaskSubmit = async (submission: { content: string; attachments: File[] }) => {
    console.log('Submitting task:', submission);
  };

  const handleQuizSubmit = async (answers: any) => {
    console.log('Submitting quiz answers:', answers);
  };

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <Button 
          onClick={() => setActiveView('task')}
          variant={activeView === 'task' ? 'default' : 'outline'}
        >
          Assignment Submission
        </Button>
        <Button 
          onClick={() => setActiveView('quiz')}
          variant={activeView === 'quiz' ? 'default' : 'outline'}
        >
          Take Quiz
        </Button>
      </div>

      {activeView === 'task' ? (
        <TaskSubmissionView
          assignment={mockAssignment}
          onSubmit={handleTaskSubmit}
          onDownloadAttachment={(attachment) => {
            console.log('Downloading:', attachment);
          }}
        />
      ) : (
        <QuizView
          quiz={mockQuiz}
          onSubmit={handleQuizSubmit}
          onExit={() => setActiveView('task')}
        />
      )}
    </div>
  );
}