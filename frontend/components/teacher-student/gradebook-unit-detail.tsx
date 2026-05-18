"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, FileText, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { useUnitGrades } from './hooks/gradebooks-hooks';
import { useAuth } from '@/app/context/AuthContext';

interface GradebookUnitDetailProps {
  courseId: string;
  unitId: string;
  onBack: () => void;
  isTeacher: boolean;
  onAssignUnitFinalGrade?: (unitId: string, studentId: string, gradeValue: string, courseId: string, feedback?: string) => Promise<void>;
}

interface GradeItem {
  id: string;
  name: string;
  type: 'ASSIGNMENT' | 'QUIZ';
  score: number;
  maxPoints: number;
  graded: boolean;
  percentage: string;
}

interface StudentGradeDisplay {
  id: string;
  name: string;
  assignments: GradeItem[];
  unitGrade: string;
  feedback?: string;
  lastCalculated?: string;
}

export function GradebookUnitDetail({
  unitId,
  onBack,
  isTeacher,
  onAssignUnitFinalGrade
}: GradebookUnitDetailProps) {
  const { user } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [gradeValue, setGradeValue] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isAssigningGrade, setIsAssigningGrade] = useState(false);

  const { 
    unitGrades, 
    loading, 
    error, 
    refresh 
  } = useUnitGrades(unitId);

  const transformUnitGradesToStudents = (): StudentGradeDisplay[] => {
    const filteredGrades = isTeacher
      ? unitGrades 
      : unitGrades.filter(grade => grade.studentId === user?.id);

    return filteredGrades.map(unitGrade => {
      const assignmentGrades: GradeItem[] = [];
      const quizGrades: GradeItem[] = [];

      if (unitGrade.assignmentGrades && typeof unitGrade.assignmentGrades === 'object') {
        assignmentGrades.push(
          ...Object.entries(unitGrade.assignmentGrades).map(([id, grade]) => ({
            id,
            name: `Assignment ${id.split('_').pop() || id.split('-').pop() || id}`,
            type: 'ASSIGNMENT' as const,
            score: grade?.value ? parseFloat(grade.value.toString()) : 0,
            maxPoints: grade?.maxScore ? parseFloat(grade.maxScore.toString()) : 100,
            graded: true,
            percentage: grade?.percentage || '0%'
          }))
        );
      }

      if (unitGrade.quizGrades && typeof unitGrade.quizGrades === 'object') {
        quizGrades.push(
          ...Object.entries(unitGrade.quizGrades).map(([id, grade]) => ({
            id,
            name: `Quiz ${id.split('_').pop() || id.split('-').pop() || id}`,
            type: 'QUIZ' as const,
            score: grade?.value ? parseFloat(grade.value.toString()) : 0,
            maxPoints: grade?.maxScore ? parseFloat(grade.maxScore.toString()) : 100,
            graded: true,
            percentage: grade?.percentage || '0%'
          }))
        );
      }

      return {
        id: unitGrade.studentId,
        name: unitGrade.studentName || `Student ${unitGrade.studentId}`,
        assignments: [...assignmentGrades, ...quizGrades],
        unitGrade: unitGrade.finalGrade || unitGrade.calculatedTotal || 'N/A',
        feedback: unitGrade.feedback,
        lastCalculated: unitGrade.lastCalculated
      };
    });
  };

  const students = transformUnitGradesToStudents();

  const handleAssignGrade = async (student: any) => {
    if (!onAssignUnitFinalGrade || !gradeValue.trim()) return;
    
    try {
      setIsAssigningGrade(true);
      await onAssignUnitFinalGrade(unitId, student.id, gradeValue, feedback);
      setSelectedStudent(null);
      setGradeValue('');
      setFeedback('');
      refresh();
    } catch (error) {
      console.error('Failed to assign unit grade:', error);
    } finally {
      setIsAssigningGrade(false);
    }
  };

  const getGradeColor = (grade: string): string => {
    if (grade === 'N/A') return 'text-gray-600';
    
    const percentage = parseFloat(grade);
    if (isNaN(percentage)) return 'text-gray-600';
    
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading unit details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Units
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Unit Details</h2>
            <p className="text-muted-foreground">Student grades for this unit</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>Error loading unit grades: {error}</p>
              <Button onClick={refresh} variant="outline" className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Units
          </Button>
          <div>
            <h2 className="text-2xl font-bold">
              {unitGrades.length > 0 ? unitGrades[0].unitName : 'Unit Details'}
            </h2>
            <p className="text-muted-foreground">
              {isTeacher ? 'Student grades and assignments for this unit' : 'Your grades and assignments for this unit'}
            </p>
          </div>
        </div>
        
        <Button onClick={refresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isTeacher ? 'Student Grades' : 'Your Grades'}</CardTitle>
          <CardDescription>
            {isTeacher ? 'View and manage student grades for this unit' : 'View your assignments and grades for this unit'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No grades available for this unit.</p>
              <p className="text-sm">Grades will appear here once assignments are submitted and graded.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {isTeacher && <TableHead>Student Name</TableHead>}
                  <TableHead>Assignments & Quizzes</TableHead>
                  <TableHead>Unit Grade</TableHead>
                  <TableHead>Last Updated</TableHead>
                  {isTeacher && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    {isTeacher && <TableCell className="font-medium">{student.name}</TableCell>}
                    <TableCell>
                      <div className="space-y-2 max-w-md">
                        {student.assignments.map((task) => (
                          <div key={task.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              {task.type === 'ASSIGNMENT' ? (
                                <FileText className="h-3 w-3 text-blue-500" />
                              ) : (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              )}
                              <span className="truncate">{task.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="default">
                                {task.score}/{task.maxPoints}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        
                        {student.assignments.length === 0 && (
                          <div className="text-sm text-muted-foreground text-center py-2">
                            No assignments submitted
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={`text-lg font-semibold ${getGradeColor(student.unitGrade)}`}
                      >
                        {student.unitGrade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {student.lastCalculated ? 
                        new Date(student.lastCalculated).toLocaleDateString() : 
                        'Never'
                      }
                    </TableCell>
                    {isTeacher && (
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedStudent(student)}
                            >
                              Set Final Grade
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Set Unit Final Grade</DialogTitle>
                              <DialogDescription>
                                Set the final unit grade for {student.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="unit-grade">Unit Final Grade</Label>
                                <Input
                                  id="unit-grade"
                                  value={gradeValue}
                                  onChange={(e) => setGradeValue(e.target.value)}
                                  placeholder="e.g., 95% or A"
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="unit-feedback">Unit Feedback</Label>
                                <Textarea
                                  id="unit-feedback"
                                  value={feedback}
                                  onChange={(e) => setFeedback(e.target.value)}
                                  placeholder="Feedback for this unit (optional)"
                                  rows={3}
                                />
                              </div>
                              
                              <div className="border rounded-lg p-3">
                                <Label className="text-sm font-medium">Current Assignments</Label>
                                <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                                  {student.assignments.map((task) => (
                                    <div key={task.id} className="flex justify-between text-xs">
                                      <span>{task.name}</span>
                                      <span>{task.score}/{task.maxPoints} ({task.percentage})</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setSelectedStudent(null);
                                  setGradeValue('');
                                  setFeedback('');
                                }}
                                disabled={isAssigningGrade}
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={() => handleAssignGrade(student)}
                                disabled={!gradeValue.trim() || isAssigningGrade}
                              >
                                {isAssigningGrade ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Assigning...
                                  </>
                                ) : (
                                  'Set Unit Grade'
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {isTeacher && students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unit Statistics</CardTitle>
            <CardDescription>
              Overview of student performance in this unit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{students.length}</div>
                <div className="text-sm text-muted-foreground">Total Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(() => {
                    const grades = students
                      .filter(s => s.unitGrade !== 'N/A')
                      .map(s => parseFloat(s.unitGrade));
                    return grades.length > 0 ? 
                      `${(grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(1)}%` : 
                      'N/A';
                  })()}
                </div>
                <div className="text-sm text-muted-foreground">Average Grade</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {(() => {
                    const grades = students
                      .filter(s => s.unitGrade !== 'N/A')
                      .map(s => parseFloat(s.unitGrade));
                    return grades.length > 0 ? 
                      `${Math.max(...grades).toFixed(1)}%` : 
                      'N/A';
                  })()}
                </div>
                <div className="text-sm text-muted-foreground">Highest Grade</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {(() => {
                    const grades = students
                      .filter(s => s.unitGrade !== 'N/A')
                      .map(s => parseFloat(s.unitGrade));
                    return grades.length > 0 ? 
                      `${Math.min(...grades).toFixed(1)}%` : 
                      'N/A';
                  })()}
                </div>
                <div className="text-sm text-muted-foreground">Lowest Grade</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}