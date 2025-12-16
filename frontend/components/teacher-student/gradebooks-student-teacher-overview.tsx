// File: src/components/teacher-student/gradebooks-overview-student-teacher.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download, RefreshCw } from 'lucide-react';
import { useGradebook } from './hooks/gradebooks-hooks';

interface CourseGradebookProps {
  courseId: string;
}

export function CourseGradebook({ courseId }: CourseGradebookProps) {
  const {
    gradebook,
    courseGradebooks,
    loading,
    error,
    isStudent,
    isTeacher,
    exportGrades,
    refresh
  } = useGradebook(courseId);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading gradebook...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <p>Error loading gradebook: {error}</p>
            <Button onClick={refresh} variant="outline" className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if user has permission to view gradebook
  if (!isStudent && !isTeacher) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>You don't have permission to view the gradebook.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gradebook</h1>
          <p className="text-muted-foreground">
            {isStudent ? 'View your unit grades and progress' : 'Manage student unit grades'}
          </p>
        </div>
        
        <div className="flex gap-2">
          {isStudent && gradebook && (
            <Button 
              onClick={async () => {
                try {
                  const blob = await exportGrades(gradebook.studentId);
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `grades-${courseId}.csv`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                } catch (err) {
                  console.error('Export failed:', err);
                }
              }}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Grades
            </Button>
          )}
          
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Gradebook content will be rendered by parent component */}
      <div className="text-center text-muted-foreground py-8">
        <p>Please use the navigation above to switch between Units view and Course Overview.</p>
      </div>
    </div>
  );
}