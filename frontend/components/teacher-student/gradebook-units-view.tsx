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
import { Search, Loader2, FileText, CheckCircle } from 'lucide-react';
import { StudentGradebook } from '../student/api/student-gradebooks';
import { useCourseAllUnits } from '../teacher/hooks/courses-hooks';

interface GradebookUnitsViewProps {
  courseId: string;
  onSelectUnit: (unitId: string) => void;
  isTeacher: boolean;
  studentGradebook?: StudentGradebook | null;
  courseGradebooks?: any[];
  // ✅ Signature now matches assignUnitFinalGrade: (unitId, studentId, gradeValue, feedback)
  onAssignFinalGrade?: (unitId: string, studentId: string, gradeValue: string, feedback?: string) => Promise<void>;
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
  const [gradeValue, setGradeValue] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isAssigningGrade, setIsAssigningGrade] = useState(false);

  // ✅ Track which dialog is open per student row using studentId
  const [openDialogStudentId, setOpenDialogStudentId] = useState<string | null>(null);

  // ✅ Track the unitId selected for the current grade assignment
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const [unitTasks, setUnitTasks] = useState<Record<string, any[]>>({});

  const {
    units: courseUnits,
    isLoading: isLoadingUnits,
    error: unitsError
  } = useCourseAllUnits(courseId);

  const filteredUnits = courseUnits.filter(unit =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (studentGradebook?.tasks) {
      const groupedTasks: Record<string, any[]> = {};
      studentGradebook.tasks.forEach(task => {
        if (!groupedTasks[task.unitName]) {
          groupedTasks[task.unitName] = [];
        }
        groupedTasks[task.unitName].push(task);
      });
      setUnitTasks(groupedTasks);
    }
  }, [studentGradebook]);

  const getUnitGrade = (unitName: string) => {
    const tasks = unitTasks[unitName] || [];
    const gradedTasks = tasks.filter(task => task.score !== null);

    if (gradedTasks.length === 0) {
      return { grade: 'N/A', color: 'gray', completed: 0, total: tasks.length, tasks };
    }

    const totalScore = gradedTasks.reduce((sum, task) => sum + (task.score || 0), 0);
    const totalMaxPoints = gradedTasks.reduce((sum, task) => sum + task.maxPoints, 0);
    const percentage = (totalScore / totalMaxPoints) * 100;

    let color = 'red';
    if (percentage >= 90) color = 'green';
    else if (percentage >= 80) color = 'blue';
    else if (percentage >= 70) color = 'yellow';

    return { grade: `${percentage.toFixed(1)}%`, color, completed: gradedTasks.length, total: tasks.length, tasks };
  };

  // ✅ Now receives unitId explicitly and passes it as first arg to onAssignFinalGrade
  const handleAssignGrade = async (gradebook: any, unitId: string) => {
    if (!onAssignFinalGrade || !gradeValue.trim() || !unitId) return;

    try {
      setIsAssigningGrade(true);
      await onAssignFinalGrade(unitId, gradebook.studentId, gradeValue, feedback);
      // Reset dialog state
      setOpenDialogStudentId(null);
      setSelectedUnitId(null);
      setGradeValue('');
      setFeedback('');
    } catch (error) {
      console.error('Failed to assign grade:', error);
    } finally {
      setIsAssigningGrade(false);
    }
  };

  const handleOpenDialog = (studentId: string) => {
    setOpenDialogStudentId(studentId);
    setGradeValue('');
    setFeedback('');
  };

  const handleCloseDialog = () => {
    setOpenDialogStudentId(null);
    setSelectedUnitId(null);
    setGradeValue('');
    setFeedback('');
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

      {/* ── STUDENT VIEW ── */}
      {!isTeacher && studentGradebook && (
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
                    <Badge variant="secondary">Unit {unit.numUnity}</Badge>
                  </CardTitle>
                  <CardDescription>{unit.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-primary text-center pt-2 border-t">
                    Click to view detailed grade breakdown
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── TEACHER VIEW ── */}
      {isTeacher && (
        <div className="space-y-6">
          {/* Unit cards */}
          <Card>
            <CardHeader>
              <CardTitle>Manage Student Grades</CardTitle>
              <CardDescription>Click on a unit to view and manage student grades</CardDescription>
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
                        <Badge variant="secondary">Unit {unit.numUnity}</Badge>
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

          {/* Student overall grades table */}
          {courseGradebooks && courseGradebooks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Student Overall Grades</CardTitle>
                <CardDescription>Final grades for all students in this course</CardDescription>
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
                          {gradebook.lastCalculated
                            ? new Date(gradebook.lastCalculated).toLocaleDateString()
                            : 'Never'}
                        </TableCell>
                        <TableCell>
                          {/* ✅ Dialog is controlled per-row via openDialogStudentId */}
                          <Dialog
                            open={openDialogStudentId === gradebook.studentId}
                            onOpenChange={(open) => {
                              if (!open) handleCloseDialog();
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDialog(gradebook.studentId)}
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
                                {/* ✅ Unit selector — teacher picks which unit this grade belongs to */}
                                <div>
                                  <Label htmlFor="unit">Unit</Label>
                                  <select
                                    id="unit"
                                    className="w-full border rounded-md px-3 py-2 text-sm mt-1"
                                    value={selectedUnitId || ''}
                                    onChange={(e) => setSelectedUnitId(e.target.value)}
                                  >
                                    <option value="" disabled>Select a unit</option>
                                    {filteredUnits.map((unit) => (
                                      <option key={unit.id} value={unit.id}>
                                        {unit.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

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
                                  onClick={handleCloseDialog}
                                  disabled={isAssigningGrade}
                                >
                                  Cancel
                                </Button>

                                {/* ✅ Passes selectedUnitId to handleAssignGrade */}
                                <Button
                                  onClick={() => {
                                    if (selectedUnitId) {
                                      handleAssignGrade(gradebook, selectedUnitId);
                                    }
                                  }}
                                  disabled={!gradeValue.trim() || !selectedUnitId || isAssigningGrade}
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

      {/* Empty States */}
      {filteredUnits.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-8">
              <p>No units found matching your search.</p>
            </div>
          </CardContent>
        </Card>
      )}

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