// // File: src/app/features/courses/components/CourseTaskInventory.tsx
// "use client"

// import { useState } from "react"
// import { Card } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Search, Settings, Eye, ArrowLeft, Loader2, BarChart3, FileText, HelpCircle } from "lucide-react"
// import { QuizSubmissionsView } from "./"
// import { useTaskInventoryManagement, useTaskInventoryMutations } from "@/app/presentation/hooks/task/task-inventory-hooks" // Add this import
// import { SubmissionId } from "@/app/domain/valueObjects"
// import { TaskType } from "@/app/domain/services/serviceCourse"
// import { SubmissionDetailView } from "./teacher/task-view-submission-teacher"

// interface CourseTaskInventoryProps {
//     courseId: string
//     onViewSubmission?: (submissionId: SubmissionId) => void
// }

// export function CourseTaskInventory({ courseId, onViewSubmission }: CourseTaskInventoryProps) {
//     const {
//         tasks,
//         isLoadingTasks,
//         tasksError,
//         searchTerm,
//         setSearchTerm,
//         filterType,
//         setFilterType,
//         selectedSubmissionId,
//         submissionDetail,
//         isLoadingDetail,
//         detailError,
//         handleViewSubmission,
//         handleBackFromDetail,
//         stats
//     } = useTaskInventoryManagement(courseId);

//     // Add the mutations hook
//     const { 
//         updateGrade, 
//         requestAnalysis, 
//         downloadAttachment 
//     } = useTaskInventoryMutations();

//     const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

//     const handleViewSubmissionWithCallback = (submissionId: SubmissionId) => {
//         handleViewSubmission(submissionId);
//         if (onViewSubmission) {
//             onViewSubmission(submissionId);
//         }
//     };

//     const handleViewQuizSubmissions = (quizId: string) => {
//         setSelectedQuizId(quizId);
//     };

//     const handleBackFromQuiz = () => {
//         setSelectedQuizId(null);
//     };

//     // Show loading state for detail view
//     if (selectedSubmissionId && isLoadingDetail) {
//         return (
//             <div className="p-8 text-center min-h-[40vh] flex items-center justify-center">
//                 <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
//                 <p className="text-xl text-primary">Loading Submission Details...</p>
//             </div>
//         );
//     }

//     // Show error state for detail view
//     if (selectedSubmissionId && detailError) {
//         return (
//             <div className="p-8 text-center min-h-[40vh] flex flex-col items-center justify-center">
//                 <div className="h-8 w-8 mx-auto mb-4">⚠️</div>
//                 <p className="text-xl text-destructive mb-4">Error loading submission details</p>
//                 <Button onClick={handleBackFromDetail} variant="outline">
//                     Back to Inventory
//                 </Button>
//             </div>
//         );
//     }

//     // Show submission detail view - FIXED: Pass all required props
//     if (submissionDetail) {
//         return (
//             <SubmissionDetailView 
//                 data={submissionDetail} 
//                 onBack={handleBackFromDetail}
//                 onUpdateGrade={updateGrade.mutate}
//                 onRequestAnalysis={requestAnalysis.mutate}
//                 onDownloadAttachment={downloadAttachment.mutate}
//                 isUpdatingGrade={updateGrade.isPending}
//                 isRequestingAnalysis={requestAnalysis.isPending}
//                 isDownloadingAttachment={downloadAttachment.isPending}
//             />
//         );
//     }

//     // Show quiz submissions view
//     if (selectedQuizId) {
//         return (
//             <QuizSubmissionsView
//                 quizId={selectedQuizId}
//                 courseId={courseId}
//                 onBack={handleBackFromQuiz}
//             />
//         );
//     }

//     // Rest of your component remains the same...
//     // Show loading state for task inventory
//     if (isLoadingTasks) {
//         return (
//             <div className="p-8 text-center text-muted-foreground">
//                 <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
//                 Loading Task Inventory...
//             </div>
//         );
//     }

//     // Show error state for task inventory
//     if (tasksError) {
//         return (
//             <div className="p-8 text-center text-destructive">
//                 <div className="h-8 w-8 mx-auto mb-4">⚠️</div>
//                 Error loading task inventory. Please try again.
//             </div>
//         );
//     }

//     const getTaskIcon = (type: TaskType) => {
//         switch (type) {
//             case 'ASSIGNMENT':
//                 return <FileText className="h-4 w-4" />;
//             case 'QUIZ':
//                 return <HelpCircle className="h-4 w-4" />;
//             default:
//                 return <FileText className="h-4 w-4" />;
//         }
//     };

//     const getTaskColor = (type: TaskType) => {
//         switch (type) {
//             case 'ASSIGNMENT':
//                 return "bg-blue-100 text-blue-800";
//             case 'QUIZ':
//                 return "bg-green-100 text-green-800";
//             default:
//                 return "bg-gray-100 text-gray-800";
//         }
//     };

//     return (
//         <div className="p-4 md:p-6 lg:p-8 space-y-6">
//             {/* Header with Statistics */}
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                 <div>
//                     <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Task Inventory</h1>
//                     {stats && (
//                         <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
//                             <span className="flex items-center gap-1">
//                                 <BarChart3 className="h-4 w-4" />
//                                 Total: {stats.totalTasks} tasks
//                             </span>
//                             <span>Overdue: {stats.overdueTasks}</span>
//                             <span>Pending: {stats.pendingSubmissions}</span>
//                             <span>Completion: {stats.averageCompletion}%</span>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Search and Filter */}
//             <Card className="p-6 shadow-md">
//                 <div className="flex flex-col md:flex-row gap-4">
//                     <div className="relative flex-1">
//                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                         <Input
//                             placeholder="Search task by name..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             className="pl-10"
//                         />
//                     </div>
//                     <select
//                         value={filterType}
//                         onChange={(e) => setFilterType(e.target.value)}
//                         className="px-4 py-2 border border-input rounded-md bg-background"
//                     >
//                         <option value="all">Filter by type: All</option>
//                         <option value="assignment">Assignment</option>
//                         <option value="quiz">Quiz</option>
//                     </select>
//                 </div>
//             </Card>
            
//             {/* Empty State */}
//             {tasks.length === 0 ? (
//                 <Card className="p-8 text-center text-muted-foreground">
//                     No tasks found matching criteria.
//                 </Card>
//             ) : (
//                 <>
//                     {/* Desktop Table View */}
//                     <Card className="overflow-hidden hidden lg:block shadow-lg">
//                         <div className="overflow-x-auto">
//                             <table className="w-full">
//                                 <thead>
//                                     <tr className="bg-muted/50 border-b border-border">
//                                         <th className="px-6 py-4 text-left text-sm font-bold uppercase text-muted-foreground">Task Name</th>
//                                         <th className="px-6 py-4 text-left text-sm font-bold uppercase text-muted-foreground">Unit / Module</th>
//                                         <th className="px-6 py-4 text-left text-sm font-bold uppercase text-muted-foreground">Type</th>
//                                         <th className="px-6 py-4 text-left text-sm font-bold uppercase text-muted-foreground">Deadline</th>
//                                         <th className="px-6 py-4 text-left text-sm font-bold uppercase text-muted-foreground">Pending Submissions</th>
//                                         <th className="px-6 py-4 text-center text-sm font-bold uppercase text-muted-foreground">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {tasks.map((task) => (
//                                         <tr key={task.id} className="border-b border-border hover:bg-muted/30 transition-colors">
//                                             <td className="px-6 py-4 font-medium">{task.name}</td>
//                                             <td className="px-6 py-4 text-muted-foreground">{task.unit}</td>
//                                             <td className="px-6 py-4">
//                                                 <Badge variant="secondary" className={`${getTaskColor(task.type)} gap-1`}>
//                                                     {getTaskIcon(task.type)}
//                                                     {task.type}
//                                                 </Badge>
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 <span className={task.isOverdue ? "text-destructive font-semibold" : ""}>
//                                                     {task.deadline}
//                                                     {task.isOverdue && <span className="ml-1 text-xs">(OVERDUE)</span>}
//                                                 </span>
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 <span
//                                                     className={task.pendingSubmissions > 0 ? "font-bold text-yellow-600 dark:text-yellow-400" : "text-green-600"}
//                                                 >
//                                                     {task.pendingSubmissions} / {task.totalStudents}
//                                                 </span>
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 <div className="flex items-center justify-center gap-3">
//                                                     {task.type === 'ASSIGNMENT' ? (
//                                                         <Button
//                                                             onClick={() => handleViewSubmissionWithCallback(task.id)}
//                                                             variant="ghost"
//                                                             size="sm"
//                                                             className="text-primary hover:bg-primary/10 transition-colors"
//                                                             title="View Submissions"
//                                                         >
//                                                             <Eye className="h-5 w-5" />
//                                                         </Button>
//                                                     ) : (
//                                                         <Button
//                                                             onClick={() => handleViewQuizSubmissions(task.id)}
//                                                             variant="ghost"
//                                                             size="sm"
//                                                             className="text-green-600 hover:bg-green-100 transition-colors"
//                                                             title="View Quiz Submissions"
//                                                         >
//                                                             <Eye className="h-5 w-5" />
//                                                         </Button>
//                                                     )}
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </Card>

//                     {/* Mobile Card View */}
//                     <div className="space-y-4 lg:hidden">
//                         {tasks.map((task) => (
//                             <Card key={task.id} className="p-4 shadow-md">
//                                 <div className="space-y-3">
//                                     <div className="flex items-start justify-between gap-3">
//                                         <div className="flex-1">
//                                             <h3 className="font-bold text-lg mb-1">{task.name}</h3>
//                                             <p className="text-sm text-muted-foreground">{task.unit}</p>
//                                         </div>
//                                         <Badge variant="secondary" className={`${getTaskColor(task.type)} gap-1`}>
//                                             {getTaskIcon(task.type)}
//                                             {task.type}
//                                         </Badge>
//                                     </div>

//                                     <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
//                                         <div>
//                                             <div className="text-xs text-muted-foreground mb-1">Deadline</div>
//                                             <div className={`text-sm font-medium ${task.isOverdue ? "text-destructive" : ""}`}>
//                                                 {task.deadline}
//                                                 {task.isOverdue && <div className="text-xs">(OVERDUE)</div>}
//                                             </div>
//                                         </div>
//                                         <div>
//                                             <div className="text-xs text-muted-foreground mb-1">Pending</div>
//                                             <div
//                                                 className={`text-sm font-medium ${task.pendingSubmissions > 0 ? "text-yellow-600 dark:text-yellow-400" : "text-green-600"}`}
//                                             >
//                                                 {task.pendingSubmissions} / {task.totalStudents}
//                                             </div>
//                                         </div>
//                                     </div>

//                                     <div className="flex gap-2 pt-2">
//                                         {task.type === 'ASSIGNMENT' ? (
//                                             <Button 
//                                                 onClick={() => handleViewSubmissionWithCallback(task.id)} 
//                                                 size="sm" 
//                                                 className="flex-1 gap-2"
//                                             >
//                                                 <Eye className="h-4 w-4" />
//                                                 View Submissions
//                                             </Button>
//                                         ) : (
//                                             <Button 
//                                                 onClick={() => handleViewQuizSubmissions(task.id)} 
//                                                 size="sm" 
//                                                 className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
//                                             >
//                                                 <Eye className="h-4 w-4" />
//                                                 View Quiz Results
//                                             </Button>
//                                         )}
//                                     </div>
//                                 </div>
//                             </Card>
//                         ))}
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// }