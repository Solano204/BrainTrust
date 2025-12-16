// File: src/components/teacher-student/gradebook-units-view.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Loader2, FileText, CheckCircle, Clock } from 'lucide-react';
import { StudentGradebook } from '../student/api/student-gradebooks';
import { useCourseAllUnits } from '../teacher/hooks/courses-hooks';

interface GradebookUnitsViewProps {
  courseId: string;
  onSelectUnit: (unitId: string) => void;
  isTeacher: boolean;
  studentGradebook?: StudentGradebook | null;
  courseGradebooks?: any[];
  onAssignFinalGrade?: (studentId: string, gradeValue: string, feedback?: string) => Promise<void>;
}

export function GradebookUnitsView({
  courseId,
  onSelectUnit,
  isTeacher,
  studentGradebook,
  courseGradebooks,
  onAssignFinalGrade
}: GradebookUnitsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [gradeValue, setGradeValue] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isAssigningGrade, setIsAssigningGrade] = useState(false);
  const [unitTasks, setUnitTasks] = useState<Record<string, any[]>>({}); // Store unit tasks separately

  // Use the units hook
  const { 
    units: courseUnits, 
    isLoading: isLoadingUnits, 
    error: unitsError 
  } = useCourseAllUnits(courseId);

  // Filter units by search term
  const filteredUnits = courseUnits.filter(unit =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Initialize unit tasks when student gradebook loads
  useEffect(() => {
    if (studentGradebook && studentGradebook.tasks) {
      const groupedTasks: Record<string, any[]> = {};
      
      // Group tasks by unit name
      studentGradebook.tasks.forEach(task => {
        if (!groupedTasks[task.unitName]) {
          groupedTasks[task.unitName] = [];
        }
        groupedTasks[task.unitName].push(task);
      });
      
      setUnitTasks(groupedTasks);
    }
  }, [studentGradebook]);

  // Calculate unit grades for student view
  const getUnitGrade = (unitName: string): { 
    grade: string; 
    color: string; 
    completed: number; 
    total: number;
    tasks: any[];
  } => {
    const tasks = unitTasks[unitName] || [];
    const gradedTasks = tasks.filter(task => task.score !== null);
    
    if (gradedTasks.length === 0) {
      return { 
        grade: 'N/A', 
        color: 'gray', 
        completed: 0, 
        total: tasks.length,
        tasks 
      };
    }

    const totalScore = gradedTasks.reduce((sum, task) => sum + (task.score || 0), 0);
    const totalMaxPoints = gradedTasks.reduce((sum, task) => sum + task.maxPoints, 0);
    const percentage = (totalScore / totalMaxPoints) * 100;

    let color = 'red';
    if (percentage >= 90) color = 'green';
    else if (percentage >= 80) color = 'blue';
    else if (percentage >= 70) color = 'yellow';

    return {
      grade: `${percentage.toFixed(1)}%`,
      color,
      completed: gradedTasks.length,
      total: tasks.length,
      tasks
    };
  };

  const getGradeColorClass = (color: string): string => {
    switch (color) {
      case 'green': return 'text-green-600';
      case 'blue': return 'text-blue-600';
      case 'yellow': return 'text-yellow-600';
      case 'red': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'ASSIGNMENT': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'QUIZ': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleAssignGrade = async (student: any) => {
    if (!onAssignFinalGrade || !gradeValue.trim()) return;
    
    try {
      setIsAssigningGrade(true);
      await onAssignFinalGrade(student.studentId, gradeValue, feedback);
      setSelectedStudent(null);
      setGradeValue('');
      setFeedback('');
    } catch (error) {
      console.error('Failed to assign grade:', error);
    } finally {
      setIsAssigningGrade(false);
    }
  };

  if (isLoadingUnits) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading units...</span>
      </div>
    );
  }

  if (unitsError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <p>Error loading units: {unitsError.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search units..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Student View - Show grades in unit cards */}
      {!isTeacher && studentGradebook && (
        <div className="space-y-6">
          {/* Overall Grade Summary */}
        

          {/* Units Grid with Grades */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredUnits.map((unit) => {
              const unitGrade = getUnitGrade(unit.name);
              return (
                <Card 
                  key={unit.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                  onClick={() => onSelectUnit(unit.id)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {unit.name}
                      <Badge variant="secondary">
                        Unit {unit.numUnity}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{unit.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                   
             
                      <div className="text-xs text-primary text-center pt-2 border-t">
                        Click to view detailed grade breakdown
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Teacher View - No grades shown, just navigation */}
      {isTeacher && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Student Grades</CardTitle>
              <CardDescription>
                Click on a unit to view and manage student grades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredUnits.map((unit) => (
                  <Card 
                    key={unit.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onSelectUnit(unit.id)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        {unit.name}
                        <Badge variant="secondary">
                          Unit {unit.numUnity}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{unit.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span>View student grades</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4" />
                          <span>Assign final grades</span>
                        </div>
                        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                          Click to manage grades for this unit
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Teacher's Student List */}
          {courseGradebooks && courseGradebooks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Student Overall Grades</CardTitle>
                <CardDescription>
                  Final grades for all students in this course
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Final Grade</TableHead>
                      <TableHead>Calculated Total</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courseGradebooks.map((gradebook) => (
                      <TableRow key={gradebook.studentId}>
                        <TableCell className="font-medium">{gradebook.studentName}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-lg">
                            {gradebook.finalGrade || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">
                            {gradebook.calculatedTotal || 'Not calculated'}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {gradebook.lastCalculated ? new Date(gradebook.lastCalculated).toLocaleDateString() : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedStudent(gradebook)}
                              >
                                Assign Final Grade
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Assign Final Course Grade</DialogTitle>
                                <DialogDescription>
                                  Set the final course grade for {gradebook.studentName}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="grade">Final Grade</Label>
                                  <Input
                                    id="grade"
                                    value={gradeValue}
                                    onChange={(e) => setGradeValue(e.target.value)}
                                    placeholder="e.g., 95% or A"
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="feedback">Feedback</Label>
                                  <Textarea
                                    id="feedback"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Optional feedback for the student"
                                    rows={3}
                                  />
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
                                  onClick={() => handleAssignGrade(gradebook)}
                                  disabled={!gradeValue.trim() || isAssigningGrade}
                                >
                                  {isAssigningGrade ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Assigning...
                                    </>
                                  ) : (
                                    'Assign Final Grade'
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {filteredUnits.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-8">
              <p>No units found matching your search.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student View - No Gradebook Data */}
      {!isTeacher && !studentGradebook && filteredUnits.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-8">
              <p>No grade information available yet.</p>
              <p className="text-sm">Your grades will appear here once assignments are graded.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}