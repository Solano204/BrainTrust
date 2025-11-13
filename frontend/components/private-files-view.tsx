// "use client"

// import { FolderClosed, File, Download, Trash2, Upload } from "lucide-react"
// import { Card } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"

// const files = [
//   { id: 1, name: "Lecture Notes - Week 1.pdf", size: "2.4 MB", date: "Jan 2, 2025", type: "pdf" },
//   { id: 2, name: "Assignment Template.docx", size: "156 KB", date: "Jan 3, 2025", type: "doc" },
//   { id: 3, name: "Course Syllabus.pdf", size: "890 KB", date: "Jan 1, 2025", type: "pdf" },
//   { id: 4, name: "Student Roster.xlsx", size: "45 KB", date: "Jan 4, 2025", type: "excel" },
// ]

// export function PrivateFilesView() {
//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div className="flex items-center gap-3">
//           <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
//             <FolderClosed className="h-5 w-5 text-primary" />
//           </div>
//           <div>
//             <h2 className="text-2xl font-bold text-foreground">Private Files</h2>
//             <p className="text-sm text-muted-foreground">Your personal document storage</p>
//           </div>
//         </div>
//         <Button>
//           <Upload className="h-4 w-4 mr-2" />
//           Upload File
//         </Button>
//       </div>

//       {/* Files Grid - Desktop */}
//       <div className="hidden md:block">
//         <Card className="overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-muted/50">
//                 <tr>
//                   <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
//                   <th className="text-left p-4 text-sm font-medium text-muted-foreground">Size</th>
//                   <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
//                   <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
//                   <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {files.map((file) => (
//                   <tr key={file.id} className="border-t hover:bg-muted/30 transition-colors">
//                     <td className="p-4">
//                       <div className="flex items-center gap-3">
//                         <File className="h-5 w-5 text-primary" />
//                         <span className="font-medium text-foreground">{file.name}</span>
//                       </div>
//                     </td>
//                     <td className="p-4 text-sm text-muted-foreground">{file.size}</td>
//                     <td className="p-4 text-sm text-muted-foreground">{file.date}</td>
//                     <td className="p-4">
//                       <Badge variant="outline">{file.type}</Badge>
//                     </td>
//                     <td className="p-4">
//                       <div className="flex items-center justify-end gap-2">
//                         <Button variant="ghost" size="icon">
//                           <Download className="h-4 w-4" />
//                         </Button>
//                         <Button variant="ghost" size="icon">
//                           <Trash2 className="h-4 w-4 text-destructive" />
//                         </Button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </Card>
//       </div>

//       {/* Files Cards - Mobile */}
//       <div className="md:hidden space-y-4">
//         {files.map((file) => (
//           <Card key={file.id} className="p-4">
//             <div className="flex items-start gap-3">
//               <File className="h-5 w-5 text-primary mt-1" />
//               <div className="flex-1 min-w-0">
//                 <p className="font-medium text-foreground truncate">{file.name}</p>
//                 <div className="flex items-center gap-2 mt-2">
//                   <Badge variant="outline" className="text-xs">
//                     {file.type}
//                   </Badge>
//                   <span className="text-xs text-muted-foreground">{file.size}</span>
//                   <span className="text-xs text-muted-foreground">{file.date}</span>
//                 </div>
//               </div>
//             </div>
//             <div className="flex items-center gap-2 mt-4">
//               <Button variant="outline" size="sm" className="flex-1 bg-transparent">
//                 <Download className="h-4 w-4 mr-2" />
//                 Download
//               </Button>
//               <Button variant="outline" size="sm">
//                 <Trash2 className="h-4 w-4 text-destructive" />
//               </Button>
//             </div>
//           </Card>
//         ))}
//       </div>
//     </div>
//   )
// }
