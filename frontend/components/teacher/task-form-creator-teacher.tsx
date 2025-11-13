"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Upload, LinkIcon, X } from "lucide-react"
import type { Assignment } from "@/app/domain/entities/CourseEntities"

interface TaskCreatorProps {
  open: boolean
  onClose: () => void
  onSave: (task: any) => void
  idCourse: string
  idUnit: string
  editMode?: boolean
  initialData?: Assignment
}

export function TaskCreator({ open, onClose, onSave, editMode = false, initialData }: TaskCreatorProps) {
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    deliveryMode: "INDIVIDUAL" as "INDIVIDUAL" | "GROUP",
    maxGrade: "100",
    submissionDate: "",
    allowLateSubmissions: false,
    uploadedFiles: [] as string[],
    urls: [] as string[],
  })

  const [newUrl, setNewUrl] = useState("")

  // Load initial data when in edit mode
  useEffect(() => {
    if (editMode && initialData) {
      setTaskData({
        title: initialData.title,
        description: initialData.description,
        deliveryMode: initialData.deliveryMode,
        maxGrade: initialData.maxScore.maxPoints.toString(),
        submissionDate: initialData.dueDate || "",
        allowLateSubmissions: initialData.allowLateSubmissions,
        uploadedFiles: initialData.attachments?.map(a => a.name) || [],
        urls: initialData.urls || [],
      })
    }
  }, [editMode, initialData])

  const handleSave = () => {
    const task = {
      title: taskData.title,
      description: taskData.description,
      deliveryMode: taskData.deliveryMode,
      maxScore: { maxPoints: Number.parseFloat(taskData.maxGrade) },
      dueDate: taskData.submissionDate || null,
      allowLateSubmissions: taskData.allowLateSubmissions,
      attachments: taskData.uploadedFiles.map(name => ({ name, type: "file" })),
      urls: taskData.urls,
      ...(editMode && initialData && { id: initialData.id })
    }
    onSave(task) // Execute the save function passed from parent
    handleClose()
  }

  const handleClose = () => {
    if (!editMode) {
      setTaskData({
        title: "",
        description: "",
        deliveryMode: "INDIVIDUAL",
        maxGrade: "100",
        submissionDate: "",
        allowLateSubmissions: false,
        uploadedFiles: [],
        urls: [],
      })
    }
    setNewUrl("")
    onClose()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setTaskData(prev => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, ...files.map((f) => f.name)]
    }))
  }

  const handleAddUrl = () => {
    if (newUrl.trim()) {
      setTaskData(prev => ({
        ...prev,
        urls: [...prev.urls, newUrl.trim()]
      }))
      setNewUrl("")
    }
  }

  const removeFile = (index: number) => {
    setTaskData(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index)
    }))
  }

  const removeUrl = (index: number) => {
    setTaskData(prev => ({
      ...prev,
      urls: prev.urls.filter((_, i) => i !== index)
    }))
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {editMode ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <Label className="font-bold mb-2 block">Task Name *</Label>
            <Input
              value={taskData.title}
              onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex. Assignment 1: Research Paper"
            />
          </div>

          <div>
            <Label className="font-bold mb-2 block">Description</Label>
            <Textarea
              value={taskData.description}
              onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Provide detailed instructions for the task..."
              rows={4}
            />
          </div>

          <div className="border border-border rounded-lg p-4 space-y-4">
            <Label className="font-bold">Delivery Mode</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="deliveryMode"
                  checked={taskData.deliveryMode === "INDIVIDUAL"}
                  onChange={() => setTaskData(prev => ({ ...prev, deliveryMode: "INDIVIDUAL" }))}
                />
                <span>Individual Mode</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="deliveryMode"
                  checked={taskData.deliveryMode === "GROUP"}
                  onChange={() => setTaskData(prev => ({ ...prev, deliveryMode: "GROUP" }))}
                />
                <span>Group Mode</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-bold mb-2 block">Maximum Grade</Label>
              <Input 
                type="number" 
                value={taskData.maxGrade} 
                onChange={(e) => setTaskData(prev => ({ ...prev, maxGrade: e.target.value }))} 
                min="0" 
              />
            </div>
            <div>
              <Label className="font-bold mb-2 block">Submission Date</Label>
              <Input 
                type="datetime-local" 
                value={taskData.submissionDate} 
                onChange={(e) => setTaskData(prev => ({ ...prev, submissionDate: e.target.value }))} 
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <Label className="font-bold">Allow Late Submissions</Label>
              <p className="text-sm text-muted-foreground">Students can submit after the deadline</p>
            </div>
            <Switch 
              checked={taskData.allowLateSubmissions} 
              onCheckedChange={(checked) => setTaskData(prev => ({ ...prev, allowLateSubmissions: checked }))} 
            />
          </div>

          {/* Support Materials Section */}
          <div className="border border-border rounded-lg p-4 space-y-4">
            <Label className="font-bold">Support Materials</Label>

            {/* Files */}
            <div>
              <Label className="text-sm mb-2 block">Upload Files</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <input type="file" multiple onChange={handleFileUpload} className="hidden" id="file-upload-task" />
                <label htmlFor="file-upload-task" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload files or drag and drop</p>
                </label>
              </div>
              {taskData.uploadedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {taskData.uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm">{file}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* URLs */}
            <div>
              <Label className="text-sm mb-2 block">Add URLs</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddUrl()
                    }
                  }}
                />
                <Button type="button" onClick={handleAddUrl} variant="outline">
                  Add
                </Button>
              </div>
              {taskData.urls.length > 0 && (
                <div className="space-y-2">
                  {taskData.urls.map((url, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {url}
                      </a>
                      <button
                        onClick={() => removeUrl(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!taskData.title.trim()}>
            {editMode ? "Save Changes" : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}