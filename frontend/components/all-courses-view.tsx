// "use client"

// import { BookOpen, Users, Calendar } from "lucide-react"
// import { Card } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"

// const allCourses = [
//   {
//     id: 1,
//     name: "Modern UX Design",
//     code: "UXD-301",
//     students: 45,
//     semester: "Spring 2025",
//     status: "active",
//     image: "/modern-ux-design-course.jpg",
//   },
//   {
//     id: 2,
//     name: "Web Development",
//     code: "WEB-201",
//     students: 38,
//     semester: "Spring 2025",
//     status: "active",
//     image: "/modern-ux-design-course.jpg",
//   },
//   {
//     id: 3,
//     name: "Data Science",
//     code: "DS-401",
//     students: 32,
//     semester: "Spring 2025",
//     status: "active",
//     image: "/modern-ux-design-course.jpg",
//   },
// ]

// export function AllCoursesView() {
//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div className="flex items-center gap-3">
//           <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
//             <BookOpen className="h-5 w-5 text-primary" />
//           </div>
//           <div>
//             <h2 className="text-2xl font-bold text-foreground">All Courses</h2>
//             <p className="text-sm text-muted-foreground">Manage your courses</p>
//           </div>
//         </div>
//         <Button>Create New Course</Button>
//       </div>

//       {/* Courses Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {allCourses.map((course) => (
//           <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
//             <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
//               <img
//                 src={course.image || "/placeholder.svg"}
//                 alt={course.name}
//                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//               />
//             </div>
//             <div className="p-6 space-y-4">
//               <div>
//                 <div className="flex items-start justify-between mb-2">
//                   <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
//                     {course.name}
//                   </h3>
//                   <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
//                     {course.status}
//                   </Badge>
//                 </div>
//                 <p className="text-sm text-muted-foreground">{course.code}</p>
//               </div>

//               <div className="flex items-center gap-4 text-sm text-muted-foreground">
//                 <div className="flex items-center gap-1">
//                   <Users className="h-4 w-4" />
//                   <span>{course.students}</span>
//                 </div>
//                 <div className="flex items-center gap-1">
//                   <Calendar className="h-4 w-4" />
//                   <span>{course.semester}</span>
//                 </div>
//               </div>

//               <Button variant="outline" className="w-full bg-transparent">
//                 View Course
//               </Button>
//             </div>
//           </Card>
//         ))}
//       </div>
//     </div>
//   )
// }
