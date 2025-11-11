"use client"

import { Settings, User, Bell, Lock, Palette } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function SettingsView() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-0">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Settings</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Manage your account preferences</p>
        </div>
      </div>

      {/* Profile Settings */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-5 w-5 text-primary" />
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Profile Settings</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" defaultValue="Sam" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" defaultValue="Green" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="sam.green@university.edu" />
          </div>
          <Button className="w-full sm:w-auto">Save Changes</Button>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Notifications</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm sm:text-base">Email Notifications</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Receive email updates about your courses</p>
            </div>
            <Switch defaultChecked className="flex-shrink-0" />
          </div>
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm sm:text-base">Assignment Reminders</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Get notified about upcoming deadlines</p>
            </div>
            <Switch defaultChecked className="flex-shrink-0" />
          </div>
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm sm:text-base">Student Messages</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Notifications for new student messages</p>
            </div>
            <Switch defaultChecked className="flex-shrink-0" />
          </div>
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="h-5 w-5 text-primary" />
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Security</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" type="password" />
          </div>
          <Button className="w-full sm:w-auto">Update Password</Button>
        </div>
      </Card>

      {/* Appearance Settings */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="h-5 w-5 text-primary" />
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Appearance</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm sm:text-base">Dark Mode</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Toggle dark mode theme</p>
            </div>
            <Switch className="flex-shrink-0" />
          </div>
        </div>
      </Card>
    </div>
  )
}
