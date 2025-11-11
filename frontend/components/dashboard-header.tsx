"use client"

import { Bell, MessageSquare, Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface DashboardHeaderProps {
  onMenuClick: () => void
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 ">
      <div className="flex lg:h-28 xl:h-20 items-center gap-4 px-4 md:px-6 lg:px-8">
        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>

        {/* Welcome Message */}
        <div className="flex-1">
          <h1 className="text-lg md:text-xl font-semibold text-foreground">
            Welcome back, <span className="text-primary">Professor Sam Green</span>
          </h1>
          <p className="text-sm text-muted-foreground hidden md:block">
            Here's what's happening with your courses today
          </p>
        </div>

        {/* Search Bar - Hidden on mobile */}
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search courses, students..." className="pl-10 bg-muted/50" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs">
              3
            </Badge>
          </Button>

          {/* Messages */}
          <Button variant="ghost" size="icon" className="relative">
            <MessageSquare className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs">
              1
            </Badge>
          </Button>

          {/* Profile */}
          <Avatar className="h-9 w-9 border-2 border-primary/20">
            <AvatarImage src="/diverse-professor-lecturing.png" alt="Professor" />
            <AvatarFallback className="bg-primary text-primary-foreground">SG</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
