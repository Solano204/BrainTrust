import { Card } from "@/components/ui/card"
import { Users, BookOpen, CheckCircle2, AlertCircle } from "lucide-react"

const stats = [
  {
    name: "Total Students",
    value: "248",
    icon: Users,
    change: "+12%",
    changeType: "positive",
  },
  {
    name: "Active Courses",
    value: "3",
    icon: BookOpen,
    change: "This semester",
    changeType: "neutral",
  },
  {
    name: "Completed Tasks",
    value: "156",
    icon: CheckCircle2,
    change: "+8 today",
    changeType: "positive",
  },
  {
    name: "Pending Reviews",
    value: "57",
    icon: AlertCircle,
    change: "Needs attention",
    changeType: "warning",
  },
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.name} className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
              <p
                className={`text-xs mt-2 ${
                  stat.changeType === "positive"
                    ? "text-primary"
                    : stat.changeType === "warning"
                      ? "text-destructive"
                      : "text-muted-foreground"
                }`}
              >
                {stat.change}
              </p>
            </div>
            <div
              className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                stat.changeType === "positive"
                  ? "bg-primary/10"
                  : stat.changeType === "warning"
                    ? "bg-destructive/10"
                    : "bg-muted"
              }`}
            >
              <stat.icon
                className={`h-6 w-6 ${
                  stat.changeType === "positive"
                    ? "text-primary"
                    : stat.changeType === "warning"
                      ? "text-destructive"
                      : "text-muted-foreground"
                }`}
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
