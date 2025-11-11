"use client"

import { Star, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const coursesWithGrades = [
  {
    id: 1,
    name: "Modern UX Design",
    students: 45,
    avgGrade: 87.5,
    trend: "+3.2%",
    color: "bg-blue-500",
  },
  {
    id: 2,
    name: "Web Development",
    students: 38,
    avgGrade: 91.2,
    trend: "+5.1%",
    color: "bg-purple-500",
  },
  {
    id: 3,
    name: "Data Science",
    students: 32,
    avgGrade: 84.8,
    trend: "+2.8%",
    color: "bg-green-500",
  },
]

export function GradesView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Star className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Grades Overview</h2>
          <p className="text-sm text-muted-foreground">Average grades across all courses</p>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coursesWithGrades.map((course) => (
          <Card key={course.id} className="p-6 hover:shadow-lg transition-all cursor-pointer">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className={`h-12 w-12 rounded-lg ${course.color} flex items-center justify-center`}>
                  <Star className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {course.trend}
                </Badge>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-foreground">{course.name}</h3>
                <p className="text-sm text-muted-foreground">{course.students} students</p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">Average Grade</p>
                <p className="text-3xl font-bold text-primary">{course.avgGrade}%</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
