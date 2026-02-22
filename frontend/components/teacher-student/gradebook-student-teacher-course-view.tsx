"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StudentGradebook } from '../student/api/student-gradebooks';

interface GradebookCourseViewProps {
  courseId: string;
  isTeacher: boolean;
  studentGradebook?: StudentGradebook | null;
  courseGradebooks?: any[];
}

export function GradebookCourseView({
  isTeacher,
  studentGradebook,
  courseGradebooks
}: GradebookCourseViewProps) {

  const calculateOverallGrade = (): { percentage: number; grade: string; completed: number; total: number } => {
    if (!studentGradebook) return { percentage: 0, grade: 'N/A', completed: 0, total: 0 };

    const gradedTasks = studentGradebook.tasks.filter(task => task.score !== null);
    const totalTasks = studentGradebook.tasks.length;
    
    if (gradedTasks.length === 0) {
      return { percentage: 0, grade: 'N/A', completed: 0, total: totalTasks };
    }

    const totalScore = gradedTasks.reduce((sum, task) => sum + (task.score || 0), 0);
    const totalMaxPoints = gradedTasks.reduce((sum, task) => sum + task.maxPoints, 0);
    const percentage = totalMaxPoints > 0 ? (totalScore / totalMaxPoints) * 100 : 0;

    return {
      percentage,
      grade: `${percentage.toFixed(1)}%`,
      completed: gradedTasks.length,
      total: totalTasks
    };
  };

  const getGradeColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const { percentage, grade, completed, total } = calculateOverallGrade();

  const calculateCourseStats = () => {
    if (!courseGradebooks || courseGradebooks.length === 0) {
      return { average: 'N/A', highest: 'N/A', lowest: 'N/A', totalStudents: 0 };
    }

    const grades = courseGradebooks
      .filter(gb => gb.finalGrade && gb.finalGrade !== 'N/A')
      .map(gb => {
        const gradeValue = parseFloat(gb.finalGrade);
        return isNaN(gradeValue) ? 0 : gradeValue;
      });

    if (grades.length === 0) {
      return { average: 'N/A', highest: 'N/A', lowest: 'N/A', totalStudents: courseGradebooks.length };
    }

    const average = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
    const highest = Math.max(...grades);
    const lowest = Math.min(...grades);

    return {
      average: `${average.toFixed(1)}%`,
      highest: `${highest.toFixed(1)}%`,
      lowest: `${lowest.toFixed(1)}%`,
      totalStudents: courseGradebooks.length
    };
  };

  const courseStats = calculateCourseStats();

  const getUnitGrades = () => {
    if (!studentGradebook) return [];

    const unitMap = new Map<string, {
      name: string;
      tasks: any[];
      gradedTasks: any[];
      totalScore: number;
      totalMaxPoints: number;
    }>();

    studentGradebook.tasks.forEach(task => {
      const unitName = task.unitName;
      if (!unitMap.has(unitName)) {
        unitMap.set(unitName, {
          name: unitName,
          tasks: [],
          gradedTasks: [],
          totalScore: 0,
          totalMaxPoints: 0
        });
      }
      
      const unit = unitMap.get(unitName)!;
      unit.tasks.push(task);
      
      if (task.score !== null) {
        unit.gradedTasks.push(task);
        unit.totalScore += task.score;
        unit.totalMaxPoints += task.maxPoints;
      }
    });

    return Array.from(unitMap.values()).map(unit => ({
      name: unit.name,
      percentage: unit.totalMaxPoints > 0 ? (unit.totalScore / unit.totalMaxPoints) * 100 : 0,
      grade: unit.totalMaxPoints > 0 ? `${((unit.totalScore / unit.totalMaxPoints) * 100).toFixed(1)}%` : 'N/A',
      completed: unit.gradedTasks.length,
      total: unit.tasks.length,
      isComplete: unit.gradedTasks.length === unit.tasks.length
    }));
  };

  const unitGrades = getUnitGrades();

  return (
    <div className="space-y-6">
      {!isTeacher && studentGradebook && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Course Overview</CardTitle>
              <CardDescription>
                Your overall progress and final grade summary
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Final Course Grade</span>
                <span className={`text-3xl font-bold ${getGradeColor(percentage)}`}>
                  {studentGradebook.finalGrade}
                </span>
              </div>
              
              
              
             
              {studentGradebook.finalGrade && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                 
                  {studentGradebook.finalFeedback && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p className="font-medium">Feedback:</p>
                      <p className="mt-1">{studentGradebook.finalFeedback}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {isTeacher && courseGradebooks && courseGradebooks.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Course Statistics</CardTitle>
              <CardDescription>
                Overview of student performance in this course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{courseStats.totalStudents}</div>
                  <div className="text-sm text-muted-foreground">Total Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{courseStats.average}</div>
                  <div className="text-sm text-muted-foreground">Average Grade</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{courseStats.highest}</div>
                  <div className="text-sm text-muted-foreground">Highest Grade</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{courseStats.lowest}</div>
                  <div className="text-sm text-muted-foreground">Lowest Grade</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Student Final Grades</CardTitle>
              <CardDescription>
                Final course grades for all students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Final Grade</TableHead>
                    <TableHead>Calculated Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
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
                      <TableCell>
                        <Badge variant={gradebook.finalGrade && gradebook.finalGrade !== 'N/A' ? "default" : "outline"}>
                          {gradebook.finalGrade && gradebook.finalGrade !== 'N/A' ? 'Graded' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {gradebook.lastCalculated ? new Date(gradebook.lastCalculated).toLocaleDateString() : 'Never'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {isTeacher && (!courseGradebooks || courseGradebooks.length === 0) && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>No student data available.</p>
              <p className="text-sm mt-2">Students will appear here once they are enrolled in the course.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isTeacher && !studentGradebook && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>No gradebook data available.</p>
              <p className="text-sm mt-2">Your grades will appear here once assignments are graded.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}