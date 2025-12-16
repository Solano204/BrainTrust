// // File: src/app/features/gradebook/components/StudentCourseGradebook.tsx
// "use client"

// import * as React from "react"
// import { Card } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Download, Loader2, BarChart3, FileText, Target, User } from "lucide-react"

// import { useAuth } from "@/app/context/AuthContext"
// import { useStudentGradebook } from "@/app/presentation/hooks/course/student/student-gradebook-hooks"

// interface StudentCourseGradebookProps {
//     courseId: string
// }

// export function StudentCourseGradebook({ courseId }: StudentCourseGradebookProps) {
//     const { user } = useAuth()
//     const {
//         studentGradebook,
//         isLoading,
//         error,
//         stats,
//         handleExport,
//         isExporting
//     } = useStudentGradebook(courseId, user?.id  || "");

//     if (isLoading) {
//         return (
//             <div className="p-8 text-center text-muted-foreground">
//                 <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
//                 Loading Your Grades...
//             </div>
//         )
//     }

//     if (error) {
//         return (
//             <div className="p-8 text-center text-destructive">
//                 <div className="h-8 w-8 mx-auto mb-4">⚠️</div>
//                 Error loading your grades. Please try again.
//             </div>
//         )
//     }

//     if (!studentGradebook) {
//         return (
//             <div className="p-8 text-center text-muted-foreground">
//                 No grade data available for this course.
//             </div>
//         )
//     }

//     return (
//         <div className="p-4 md:p-6 lg:p-8 space-y-6">
//             {/* Header with Student Info and Stats */}
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                 <div>
//                     <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Grades</h1>
//                     <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
//                         <span className="flex items-center gap-1">
//                             <User className="h-4 w-4" />
//                             Student: {studentGradebook.studentName}
//                         </span>
//                         {stats && (
//                             <>
//                                 <span className="flex items-center gap-1">
//                                     <FileText className="h-4 w-4" />
//                                     Tasks: {stats.totalTasks}
//                                 </span>
//                                 <span className="flex items-center gap-1">
//                                     <Target className="h-4 w-4" />
//                                     Average: {stats.averageGrade}%
//                                 </span>
//                                 <span className="flex items-center gap-1">
//                                     <BarChart3 className="h-4 w-4" />
//                                     Completed: {stats.completedTasks}/{stats.totalTasks}
//                                 </span>
//                             </>
//                         )}
//                     </div>
//                 </div>
               
//                 <div className="flex gap-3">
//                     <button 
//                         onClick={handleExport} 
//                         className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted/50 transition-colors"
//                         disabled={isExporting}
//                     >
//                         {isExporting ? (
//                             <Loader2 className="h-4 w-4 animate-spin" />
//                         ) : (
//                             <Download className="h-4 w-4" />
//                         )}
//                         Export My Grades
//                     </button>
//                 </div>
//             </div>

//             {/* Overall Grade Summary */}
//             {stats && (
//                 <Card className="p-6 border-l-4 border-blue-500">
//                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                         <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
//                             <p className="text-2xl font-bold text-blue-600">{stats.averageGrade}%</p>
//                             <p className="text-sm text-muted-foreground">Overall Average</p>
//                         </div>
//                         <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
//                             <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
//                             <p className="text-sm text-muted-foreground">Tasks Completed</p>
//                         </div>
//                         <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
//                             <p className="text-2xl font-bold text-purple-600">{stats.totalTasks}</p>
//                             <p className="text-sm text-muted-foreground">Total Tasks</p>
//                         </div>
//                         <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
//                             <p className="text-2xl font-bold text-orange-600">{stats.completionRate}%</p>
//                             <p className="text-sm text-muted-foreground">Completion Rate</p>
//                         </div>
//                     </div>
//                 </Card>
//             )}

//             {/* Grades Table */}
//             <Card className="overflow-hidden border shadow-lg">
//                 <div className="overflow-x-auto">
//                     <table className="w-full border-collapse">
//                         <thead>
//                             <tr className="bg-muted/50">
//                                 <th className="px-6 py-4 text-left font-bold text-sm uppercase text-muted-foreground border-b border-r border-border">
//                                     Assignment
//                                 </th>
//                                 <th className="px-6 py-4 text-left font-bold text-sm uppercase text-muted-foreground border-b border-r border-border">
//                                     Unit
//                                 </th>
//                                 <th className="px-6 py-4 text-center font-bold text-sm uppercase text-muted-foreground border-b border-r border-border">
//                                     Your Score
//                                 </th>
//                                 <th className="px-6 py-4 text-center font-bold text-sm uppercase text-muted-foreground border-b border-r border-border">
//                                     Max Points
//                                 </th>
//                                 <th className="px-6 py-4 text-center font-bold text-sm uppercase text-muted-foreground border-b">
//                                     Percentage
//                                 </th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {studentGradebook.tasks.map((task) => {
//                                 const percentage = task.score !== null ? (task.score / task.maxPoints) * 100 : null
//                                 const status = task.score !== null ? "graded" : "pending"
                                
//                                 return (
//                                     <tr key={task.id} className="hover:bg-muted/30 transition-colors">
//                                         <td className="px-6 py-4 font-medium border-b border-r border-border">
//                                             <div className="flex items-center gap-3">
//                                                 <div className={`w-3 h-3 rounded-full ${
//                                                     status === 'graded' ? 'bg-green-500' : 'bg-yellow-500'
//                                                 }`} />
//                                                 {task.name}
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4 text-muted-foreground border-b border-r border-border">
//                                             {task.unitName}
//                                         </td>
//                                         <td className="px-6 py-4 text-center font-semibold border-b border-r border-border">
//                                             <span className={
//                                                 task.score === null 
//                                                     ? "text-muted-foreground"
//                                                     : percentage! >= 90
//                                                         ? "text-green-600 dark:text-green-400"
//                                                         : percentage! < 70
//                                                             ? "text-destructive"
//                                                             : "text-foreground"
//                                             }>
//                                                 {task.score !== null ? task.score : "—"}
//                                             </span>
//                                         </td>
//                                         <td className="px-6 py-4 text-center text-muted-foreground border-b border-r border-border">
//                                             {task.maxPoints}
//                                         </td>
//                                         <td className="px-6 py-4 text-center border-b">
//                                             {percentage !== null ? (
//                                                 <Badge 
//                                                     variant={
//                                                         percentage >= 90 ? "default" :
//                                                         percentage >= 70 ? "secondary" :
//                                                         "destructive"
//                                                     }
//                                                     className={
//                                                         percentage >= 90 ? "bg-green-100 text-green-800 hover:bg-green-100" :
//                                                         percentage >= 70 ? "bg-blue-100 text-blue-800 hover:bg-blue-100" :
//                                                         "bg-red-100 text-red-800 hover:bg-red-100"
//                                                     }
//                                                 >
//                                                     {percentage.toFixed(1)}%
//                                                 </Badge>
//                                             ) : (
//                                                 <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
//                                                     Pending
//                                                 </Badge>
//                                             )}
//                                         </td>
//                                     </tr>
//                                 )
//                             })}
//                         </tbody>
//                     </table>
//                 </div>
//             </Card>

//             {/* Mobile Card View */}
//             <div className="space-y-4 lg:hidden">
//                 <h2 className="text-xl font-bold text-foreground">My Assignment Grades</h2>
                
//                 {studentGradebook.tasks.map((task) => {
//                     const percentage = task.score !== null ? (task.score / task.maxPoints) * 100 : null
//                     const status = task.score !== null ? "graded" : "pending"
                    
//                     return (
//                         <Card key={task.id} className="p-4 border shadow-md">
//                             <div className="space-y-3">
//                                 <div className="flex items-center justify-between">
//                                     <div className="flex items-center gap-2">
//                                         <div className={`w-2 h-2 rounded-full ${
//                                             status === 'graded' ? 'bg-green-500' : 'bg-yellow-500'
//                                         }`} />
//                                         <h3 className="font-bold text-sm">{task.name}</h3>
//                                     </div>
//                                     {percentage !== null ? (
//                                         <Badge 
//                                             variant={
//                                                 percentage >= 90 ? "default" :
//                                                 percentage >= 70 ? "secondary" :
//                                                 "destructive"
//                                             }
//                                             className="text-xs"
//                                         >
//                                             {percentage.toFixed(1)}%
//                                         </Badge>
//                                     ) : (
//                                         <Badge variant="outline" className="text-xs">
//                                             Pending
//                                         </Badge>
//                                     )}
//                                 </div>

//                                 <div className="text-sm text-muted-foreground">
//                                     Unit: {task.unitName}
//                                 </div>

//                                 <div className="flex justify-between items-center pt-2 border-t border-border">
//                                     <div className="text-sm">
//                                         <span className="font-medium">Your Score: </span>
//                                         <span className={
//                                             task.score === null 
//                                                 ? "text-muted-foreground"
//                                                 : percentage! >= 90
//                                                     ? "text-green-600"
//                                                     : percentage! < 70
//                                                         ? "text-destructive"
//                                                         : "text-foreground"
//                                         }>
//                                             {task.score !== null ? task.score : "—"}
//                                         </span>
//                                         <span className="text-muted-foreground"> / {task.maxPoints}</span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </Card>
//                     )
//                 })}
//             </div>

//             {/* Empty State */}
//             {studentGradebook.tasks.length === 0 && (
//                 <Card className="text-center p-8 border-dashed">
//                     <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//                     <h3 className="text-lg font-semibold text-muted-foreground mb-2">
//                         No Grades Yet
//                     </h3>
//                     <p className="text-muted-foreground">
//                         Your grades will appear here once assignments are graded.
//                     </p>
//                 </Card>
//             )}
//         </div>
//     )
// }