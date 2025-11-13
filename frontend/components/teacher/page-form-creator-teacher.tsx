"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Upload, X, Paperclip, LinkIcon } from "lucide-react"
import { Page } from "@/app/domain/entities/CourseEntities"
import { Document } from "@/app/domain/valueObjects/CourseValues"

interface ForumCreatorProps {
  open: boolean
  onClose: () => void
  onSave: (page: any) => void
  unitId: string
  courseId: string
  editMode?: boolean
  initialData?: Page
}

export function ForumCreator({ open, onClose, onSave, unitId, courseId, editMode = false, initialData }: ForumCreatorProps) {
  // Initialize with proper Page structure
  const [pageData, setPageData] = useState<Omit<Page, 'id' | 'courseId' | 'unitId' | 'createdAt'>>({
    title: "",
    welcomeTitle: "Welcome to Our Platform",
    welcomeSubtitle: "Discover amazing features and unlock your potential with our innovative solutions",
    sectionTitle: "Innovative Solutions for Modern Challenges",
    sectionContent: "Our cutting-edge platform combines advanced technology with user-friendly design to deliver exceptional results. Whether you're a startup or an enterprise, we have the tools and expertise to help you succeed in today's competitive landscape.\n\nJoin thousands of satisfied customers who have transformed their business operations with our comprehensive suite of services. From automation to analytics, we provide everything you need to stay ahead of the curve.",
    attachments: [],
    urlsSupport: []
  })

  const [newUrl, setNewUrl] = useState("")

  // Load initial data when in edit mode
  useEffect(() => {
    if (editMode && initialData) {
      setPageData({
        title: initialData.title,
        welcomeTitle: initialData.welcomeTitle,
        welcomeSubtitle: initialData.welcomeSubtitle,
        sectionTitle: initialData.sectionTitle,
        sectionContent: initialData.sectionContent,
        attachments: initialData.attachments || [],
        urlsSupport: initialData.urlsSupport || []
      })
    }
  }, [editMode, initialData])

  const handleSave = () => {
    const page: Page = {
      ...pageData,
      id: editMode && initialData ? initialData.id : `page-${Date.now()}`,
      courseId: courseId,
      unitId: unitId,
      createdAt: editMode && initialData ? initialData.createdAt : new Date().toISOString(),
    }
    onSave(page) // Execute the save function passed from parent
    handleClose()
  }

  const handleClose = () => {
    if (!editMode) {
      setPageData({
        title: "",
        welcomeTitle: "Welcome to Our Platform",
        welcomeSubtitle: "Discover amazing features and unlock your potential with our innovative solutions",
        sectionTitle: "Innovative Solutions for Modern Challenges",
        sectionContent: "Our cutting-edge platform combines advanced technology with user-friendly design to deliver exceptional results. Whether you're a startup or an enterprise, we have the tools and expertise to help you succeed in today's competitive landscape.\n\nJoin thousands of satisfied customers who have transformed their business operations with our comprehensive suite of services. From automation to analytics, we provide everything you need to stay ahead of the curve.",
        attachments: [],
        urlsSupport: []
      })
    }
    setNewUrl("")
    onClose()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newDocuments: Document[] = Array.from(files).map((file) => ({
        name: file.name,
        storagePath: URL.createObjectURL(file), // In real app, this would be the uploaded file path
        createdAt: new Date().toISOString()
      }))
      
      setPageData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newDocuments]
      }))
    }
  }

  const removeFile = (index: number) => {
    setPageData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const addUrl = () => {
    if (newUrl.trim()) {
      setPageData(prev => ({
        ...prev,
        urlsSupport: [...prev.urlsSupport, newUrl.trim()]
      }))
      setNewUrl("")
    }
  }

  const removeUrl = (index: number) => {
    setPageData(prev => ({
      ...prev,
      urlsSupport: prev.urlsSupport.filter((_, i) => i !== index)
    }))
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto sm:max-w-[95vw] md:max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            {editMode ? "Edit Information Page" : "Create Information Page"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Page Title */}
          <div className="space-y-2">
            <Label htmlFor="page-title">Page Title</Label>
            <Input
              id="page-title"
              value={pageData.title}
              onChange={(e) => setPageData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter page title"
            />
          </div>

          {/* Preview Card */}
          <Card className="p-4 sm:p-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 sm:p-12 mb-6 sm:mb-8 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-balance">
                {pageData.welcomeTitle || "Welcome Title"}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg max-w-2xl mx-auto text-balance">
                {pageData.welcomeSubtitle || "Welcome subtitle"}
              </p>
            </div>

            {/* Content Section */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                {pageData.sectionTitle || "Section Title"}
              </h3>
              <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {pageData.sectionContent || "Section content"}
              </div>
            </div>
          </Card>

          {/* Welcome Section Inputs */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold">Welcome Section</h3>
            <div className="space-y-2">
              <Label htmlFor="welcome-title">Welcome Title</Label>
              <Input
                id="welcome-title"
                value={pageData.welcomeTitle}
                onChange={(e) => setPageData(prev => ({ ...prev, welcomeTitle: e.target.value }))}
                placeholder="Enter welcome title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="welcome-subtitle">Welcome Subtitle</Label>
              <Textarea
                id="welcome-subtitle"
                value={pageData.welcomeSubtitle}
                onChange={(e) => setPageData(prev => ({ ...prev, welcomeSubtitle: e.target.value }))}
                placeholder="Enter welcome subtitle"
                rows={2}
              />
            </div>
          </div>

          {/* Content Section Inputs */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold">Content Section</h3>
            <div className="space-y-2">
              <Label htmlFor="section-title">Section Title</Label>
              <Input
                id="section-title"
                value={pageData.sectionTitle}
                onChange={(e) => setPageData(prev => ({ ...prev, sectionTitle: e.target.value }))}
                placeholder="Enter section title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="section-content">Section Content</Label>
              <Textarea
                id="section-content"
                value={pageData.sectionContent}
                onChange={(e) => setPageData(prev => ({ ...prev, sectionContent: e.target.value }))}
                placeholder="Enter section content"
                rows={8}
              />
            </div>
          </div>

          {/* Support Materials */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-base sm:text-lg font-semibold text-blue-600 dark:text-blue-400">Support Materials</h3>

            {/* Uploaded Files List */}
            {pageData.attachments.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Files</Label>
                <div className="space-y-2">
                  {pageData.attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{file.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* URLs List */}
            {pageData.urlsSupport.length > 0 && (
              <div className="space-y-2">
                <Label>URLs</Label>
                <div className="space-y-2">
                  {pageData.urlsSupport.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate">{url}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUrl(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Upload Area */}
            <div className="space-y-2">
              <Label>Upload Documents</Label>
              <label className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 sm:p-8 text-center cursor-pointer hover:border-blue-500 transition-colors block">
                <Upload className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs sm:text-sm text-muted-foreground">Drag or click here to add page documents</p>
                <input type="file" multiple onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="new-url">Add URL</Label>
              <div className="flex gap-2">
                <Input
                  id="new-url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addUrl()
                    }
                  }}
                />
                <Button type="button" onClick={addUrl} variant="outline">
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSave} className="w-full sm:w-auto">
            {editMode ? "Save Changes" : "Create Page"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}