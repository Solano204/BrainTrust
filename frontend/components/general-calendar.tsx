"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Sample data - all tasks from all courses
const allCourseTasks = [
  {
    id: 1,
    title: "UX Design Assignment",
    course: "Modern UX Design",
    courseColor: "bg-blue-500",
    date: new Date(2025, 0, 6),
    type: "assignment",
    dueTime: "11:59 PM",
  },
  {
    id: 2,
    title: "Midterm Exam",
    course: "Web Development",
    courseColor: "bg-purple-500",
    date: new Date(2025, 0, 8),
    type: "quiz",
    dueTime: "2:00 PM",
  },
  {
    id: 3,
    title: "Discussion Forum",
    course: "Modern UX Design",
    courseColor: "bg-blue-500",
    date: new Date(2025, 0, 9),
    type: "forum",
    dueTime: "5:00 PM",
  },
  {
    id: 4,
    title: "Final Project",
    course: "Data Science",
    courseColor: "bg-green-500",
    date: new Date(2025, 0, 10),
    type: "assignment",
    dueTime: "11:59 PM",
  },
  {
    id: 5,
    title: "Quiz 3",
    course: "Web Development",
    courseColor: "bg-purple-500",
    date: new Date(2025, 0, 11),
    type: "quiz",
    dueTime: "3:00 PM",
  },
]

export function GeneralCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Get start of week (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  const weekStart = getWeekStart(currentDate)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    return date
  })

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() - 7)
    setCurrentDate(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + 7)
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getTasksForDate = (date: Date) => {
    return allCourseTasks.filter(
      (task) =>
        task.date.getDate() === date.getDate() &&
        task.date.getMonth() === date.getMonth() &&
        task.date.getFullYear() === date.getFullYear(),
    )
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CalendarIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Calendar</h2>
            <p className="text-sm text-muted-foreground">All tasks from all courses</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Month/Year Display */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground">{formatMonthYear(weekStart)}</h3>
      </div>

      {/* Calendar Grid - Desktop */}
      <div className="hidden md:grid md:grid-cols-7 gap-4">
        {weekDays.map((date, index) => {
          const tasks = getTasksForDate(date)
          const today = isToday(date)

          return (
            <Card
              key={index}
              className={cn("p-4 min-h-[200px] transition-all hover:shadow-md", today && "ring-2 ring-primary")}
            >
              <div className="space-y-3">
                {/* Day Header */}
                <div className="text-center">
                  <p className="text-xs font-medium text-muted-foreground">{dayNames[index]}</p>
                  <p className={cn("text-2xl font-bold mt-1", today ? "text-primary" : "text-foreground")}>
                    {date.getDate()}
                  </p>
                </div>

                {/* Tasks */}
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start gap-2">
                        <div className={cn("w-1 h-full rounded-full mt-1", task.courseColor)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {task.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{task.course}</p>
                          <p className="text-xs text-muted-foreground mt-1">{task.dueTime}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {tasks.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No tasks</p>}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Calendar List - Mobile */}
      <div className="md:hidden space-y-4">
        {weekDays.map((date, index) => {
          const tasks = getTasksForDate(date)
          const today = isToday(date)

          return (
            <Card key={index} className={cn("p-4", today && "ring-2 ring-primary")}>
              <div className="space-y-3">
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{dayNames[index]}</p>
                    <p className={cn("text-xl font-bold", today ? "text-primary" : "text-foreground")}>
                      {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  {today && (
                    <Badge variant="default" className="bg-primary">
                      Today
                    </Badge>
                  )}
                </div>

                {/* Tasks */}
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div key={task.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={cn("w-1 h-full rounded-full", task.courseColor)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{task.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{task.course}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {task.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{task.dueTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No tasks scheduled</p>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
