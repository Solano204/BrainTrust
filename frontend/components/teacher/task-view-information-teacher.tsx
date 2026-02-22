"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Calendar, 
  Clock, 
  Users, 
  User, 
  FileText, 
  LinkIcon, 
  Paperclip, 
  Award,
  ArrowLeft,
  ExternalLink,
  Plus,
  Trash2,
  X,
  Loader2,
  Upload,
  Download,
  Edit,
  Save,
  XCircle,
  Link2,
  Monitor,
  BookOpen
} from "lucide-react";
import { Assignment } from "@/app/domain/entities/CourseEntities";
import { Document } from "@/app/domain/valueObjects/CourseValues";
import { useAssignmentAttachmentMutations, useAssignmentLinkMutations, useAssignmentMutations } from "../teacher-student/hooks/assignment-hooks";

interface AssignmentInfoViewProps {
  assignment: Assignment;
  onClose: () => void;
}

export function AssignmentInfoView({ assignment, onClose }: AssignmentInfoViewProps) {
  const attachmentMutations = useAssignmentAttachmentMutations();
  const linkMutations = useAssignmentLinkMutations();
  const { updateAssignment } = useAssignmentMutations();
  const [isEditMode, setIsEditMode] = React.useState(false);
  
 const [editData, setEditData] = React.useState({
    title: assignment.title,
    description: assignment.description,
    instructions: assignment.instructions || "",
    maxPoints: assignment.maxScore.maxPoints.toString(),
    dueDate: assignment.dueDate || "",
    allowLateSubmissions: assignment.allowLateSubmissions,
    deliveryMode: assignment.deliveryMode,
    submissionFormat: assignment.submissionFormat || "DIGITAL" // NEW
  });
  
  const [newUrl, setNewUrl] = React.useState("");
  const [isAddingUrl, setIsAddingUrl] = React.useState(false);
  
  const [isAddingMultipleUrls, setIsAddingMultipleUrls] = React.useState(false);
  const [urlInput, setUrlInput] = React.useState("");
  const [selectedUrls, setSelectedUrls] = React.useState<string[]>([]);
  
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [isAddingFiles, setIsAddingFiles] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setEditData({
      title: assignment.title,
      description: assignment.description,
      instructions: assignment.instructions || "",
      maxPoints: assignment.maxScore.maxPoints.toString(),
      dueDate: assignment.dueDate || "",
      allowLateSubmissions: assignment.allowLateSubmissions,
      deliveryMode: assignment.deliveryMode,
      submissionFormat: assignment.submissionFormat
    });
  }, [assignment]);

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddUrlToList = () => {
    const trimmedUrl = urlInput.trim();
    if (!trimmedUrl) return;
    
    if (!isValidUrl(trimmedUrl)) {
      alert("Please enter a valid URL (e.g., https://example.com)");
      return;
    }
    
    if (selectedUrls.includes(trimmedUrl)) {
      alert("This URL is already in the list");
      return;
    }
    
    setSelectedUrls(prev => [...prev, trimmedUrl]);
    setUrlInput("");
  };

  const removeSelectedUrl = (index: number) => {
    setSelectedUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleMultipleUrlsUpload = async () => {
    if (selectedUrls.length === 0) return;

    try {
      await linkMutations.addMultipleLinks.mutateAsync({
        assignmentId: assignment.id,
        urls: selectedUrls
      });
      setSelectedUrls([]);
      setUrlInput("");
      setIsAddingMultipleUrls(false);
    } catch (error) {
      console.error("Failed to upload URLs:", error);
    }
  };

  const handleSaveEdits = async () => {
    try {
      await updateAssignment.mutateAsync({
        assignmentId: assignment.id,
        assignmentData: {
          title: editData.title,
          description: editData.description,
          instructions: editData.instructions,
          maxScore: {
            value: 0,
            maxPoints: parseFloat(editData.maxPoints)
          },
          dueDate: editData.dueDate || null,
          allowLateSubmissions: editData.allowLateSubmissions,
          deliveryMode: editData.deliveryMode,
          submissionFormat: editData.submissionFormat
        }
      });
      setIsEditMode(false);
    } catch (error) {
      console.error("Failed to update assignment:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      title: assignment.title,
      description: assignment.description,
      instructions: assignment.instructions || "",
      maxPoints: assignment.maxScore.maxPoints.toString(),
      dueDate: assignment.dueDate || "",
      allowLateSubmissions: assignment.allowLateSubmissions,
      deliveryMode: assignment.deliveryMode,
      submissionFormat: assignment.submissionFormat
    });
    setIsEditMode(false);
  };

  const handleSingleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await attachmentMutations.addAttachment.mutateAsync({
        assignmentId: assignment.id,
        file: file
      });
    } catch (error) {
      console.error("Failed to upload file:", error);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleMultipleFilesUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      await attachmentMutations.addMultipleAttachments.mutateAsync({
        assignmentId: assignment.id,
        files: selectedFiles
      });
      setSelectedFiles([]);
      setIsAddingFiles(false);
    } catch (error) {
      console.error("Failed to upload files:", error);
    }
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddUrl = async () => {
    if (!newUrl.trim()) return;

    if (!isValidUrl(newUrl.trim())) {
      alert("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    try {
      await linkMutations.addLink.mutateAsync({
        assignmentId: assignment.id,
        url: newUrl.trim()
      });
      setNewUrl("");
      setIsAddingUrl(false);
    } catch (error) {
      console.error("Failed to add URL:", error);
    }
  };

  const handleRemoveUrl = async (url: string) => {
    try {
      await linkMutations.removeLink.mutateAsync({
        assignmentId: assignment.id,
        url: url
      });
    } catch (error) {
      console.error("Failed to remove URL:", error);
    }
  };

  const handleRemoveAttachment = async (documentName: string, storagePath: string) => {

    console.log("Removing attachment:", documentName, storagePath);
    try {
      await attachmentMutations.removeAttachment.mutateAsync({
        assignmentId: assignment.id,
        documentName: documentName,
        storagePath:  storagePath
      });
    } catch (error) {
      console.error("Failed to remove attachment:", error);
    }
  };

  

  const handleClearAllUrls = async () => {
    if (!confirm("Are you sure you want to remove all URLs?")) return;

    try {
      await linkMutations.clearLinks.mutateAsync(assignment.id);
    } catch (error) {
      console.error("Failed to clear URLs:", error);
    }
  };

  const isLoading = 
    attachmentMutations.addAttachment.isPending ||
    attachmentMutations.addMultipleAttachments.isPending ||
    attachmentMutations.removeAttachment.isPending ||
    attachmentMutations.clearAttachments.isPending ||
    linkMutations.addLink.isPending ||
    linkMutations.addMultipleLinks.isPending ||
    linkMutations.removeLink.isPending ||
    linkMutations.clearLinks.isPending ||
    updateAssignment.isPending;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCreatedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeRemaining = (dueDate: string | null) => {
    if (!dueDate) return { text: "No due date", color: "gray" };
    
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMs < 0) {
      return { text: "Overdue", color: "destructive" };
    } else if (diffDays === 0) {
      return { text: "Due today", color: "warning" };
    } else if (diffDays === 1) {
      return { text: "Due tomorrow", color: "warning" };
    } else if (diffDays <= 7) {
      return { text: `Due in ${diffDays} days`, color: "warning" };
    } else {
      return { text: `Due in ${diffDays} days`, color: "success" };
    }
  };

  const timeRemaining = getTimeRemaining(assignment.dueDate);


  console.log("attachments", assignment.attachments);
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onClose}
            className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Resources
          </Button>
          
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {isEditMode ? (
                <Input
                  value={editData.title}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  className="text-3xl md:text-4xl font-bold mb-2"
                />
              ) : (
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {assignment.title}
                </h1>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant={assignment.deliveryMode === "TEAM" ? "default" : "secondary"}>
                  {assignment.deliveryMode === "TEAM" ? (
                    <Users className="h-3 w-3 mr-1" />
                  ) : (
                    <User className="h-3 w-3 mr-1" />
                  )}
                  {assignment.deliveryMode === "TEAM" ? "Group Assignment" : "Individual Assignment"}
                </Badge>
                <Badge variant="outline">
                  {(assignment.submissionFormat || "DIGITAL") === "DIGITAL" ? (
                    <Monitor className="h-3 w-3 mr-1" />
                  ) : (
                    <BookOpen className="h-3 w-3 mr-1" />
                  )}
                  {assignment.submissionFormat || "DIGITAL"}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Award className="h-3 w-3" />
                  {assignment.maxScore.maxPoints} points
                </Badge>
                
                <Badge variant={timeRemaining.color as "default"}>
                  <Clock className="h-3 w-3 mr-1" />
                  {timeRemaining.text}
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Created on</p>
                <p className="font-medium">{formatCreatedDate(assignment.createdAt)}</p>
              </div>
              {isEditMode ? (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveEdits}
                    disabled={isLoading}
                    size="sm"
                    className="gap-2"
                  >
                    {updateAssignment.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsEditMode(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Assignment Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditMode ? (
                  <Textarea
                    value={editData.description}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full"
                  />
                ) : (
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                      {assignment.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditMode ? (
                  <Textarea
                    value={editData.instructions}
                    onChange={(e) => setEditData(prev => ({ ...prev, instructions: e.target.value }))}
                    rows={6}
                    className="w-full"
                  />
                ) : (
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="text-foreground whitespace-pre-wrap leading-relaxed p-4 bg-muted/30 rounded-lg">
                      {assignment.instructions}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Paperclip className="h-5 w-5" />
                    Attachments ({assignment.attachments.length})
                  </CardTitle>
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleSingleFileUpload}
                      className="hidden"
                      id="single-file-upload"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      {attachmentMutations.addAttachment.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Add File
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingFiles(!isAddingFiles)}
                      disabled={isLoading}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Multiple
                    </Button>
                  
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Multiple Files Upload Interface */}
                {isAddingFiles && (
                  <div className="border-2 border-dashed border-border rounded-lg p-4 space-y-4 bg-muted/20">
                    <div>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileSelection}
                        className="hidden"
                        id="multiple-files-upload"
                      />
                      <label
                        htmlFor="multiple-files-upload"
                        className="flex items-center justify-center gap-2 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <Upload className="h-5 w-5" />
                        <span>Click to select files</span>
                      </label>
                    </div>

                    {selectedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          {selectedFiles.length} file(s) selected
                        </p>
                        {selectedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-background rounded"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="text-sm truncate block">{file.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(1)} KB
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSelectedFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={handleMultipleFilesUpload}
                        disabled={selectedFiles.length === 0 || isLoading}
                        className="flex-1"
                      >
                        {attachmentMutations.addMultipleAttachments.isPending ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
                        ) : (
                          <><Upload className="h-4 w-4 mr-2" /> Upload {selectedFiles.length} file(s)</>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddingFiles(false);
                          setSelectedFiles([]);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {assignment.attachments.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <Paperclip className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No attachments yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Click "Add File" to upload</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignment.attachments.map((file: Document, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Paperclip className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Added {formatCreatedDate(file.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {file.storagePath && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(file.storagePath, '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAttachment(file.name, file.storagePath)}
                            disabled={isLoading}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {attachmentMutations.removeAttachment.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" />
                    Reference Links ({assignment.urls.length})
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingUrl(!isAddingUrl)}
                      disabled={isLoading}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingMultipleUrls(!isAddingMultipleUrls)}
                      disabled={isLoading}
                    >
                      <Link2 className="h-4 w-4 mr-2" />
                      Add Multiple
                    </Button>
                    {assignment.urls.length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleClearAllUrls}
                        disabled={isLoading}
                      >
                        {linkMutations.clearLinks.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Clear All
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isAddingUrl && (
                  <div className="flex gap-2 p-4 bg-muted/20 rounded-lg border">
                    <Input
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="https://example.com"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddUrl();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleAddUrl} 
                      disabled={!newUrl.trim() || isLoading}
                    >
                      {linkMutations.addLink.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <LinkIcon className="h-4 w-4 mr-2" />
                      )}
                      Add
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddingUrl(false);
                        setNewUrl("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {isAddingMultipleUrls && (
                  <div className="border-2 border-dashed border-border rounded-lg p-4 space-y-4 bg-muted/20">
                    <div className="flex gap-2">
                      <Input
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://example.com"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddUrlToList();
                          }
                        }}
                      />
                      <Button 
                        onClick={handleAddUrlToList}
                        disabled={!urlInput.trim()}
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add to List
                      </Button>
                    </div>

                    {selectedUrls.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          {selectedUrls.length} URL(s) ready to upload
                        </p>
                        {selectedUrls.map((url, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-background rounded"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="text-sm truncate block">{url}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSelectedUrl(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={handleMultipleUrlsUpload}
                        disabled={selectedUrls.length === 0 || isLoading}
                        className="flex-1"
                      >
                        {linkMutations.addMultipleLinks.isPending ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Adding...</>
                        ) : (
                          <><Link2 className="h-4 w-4 mr-2" /> Add {selectedUrls.length} URL(s)</>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddingMultipleUrls(false);
                          setSelectedUrls([]);
                          setUrlInput("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {assignment.urls.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <LinkIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No links added yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Click "Add Link" to include resources</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignment.urls.map((url: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <LinkIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-primary hover:underline truncate block"
                            >
                              {url.replace(/^https?:\/\//, '')}
                            </a>
                            <p className="text-xs text-muted-foreground">External resource</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                          >
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveUrl(url)}
                            disabled={isLoading}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {linkMutations.removeLink.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assignment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    <Calendar className="inline h-3 w-3 mr-1" />
                    Due Date
                  </h4>
                  {isEditMode ? (
                    <Input
                      type="datetime-local"
                      value={editData.dueDate}
                      onChange={(e) => setEditData(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="font-medium">
                      {formatDate(assignment.dueDate)}
                    </p>
                  )}
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    <Clock className="inline h-3 w-3 mr-1" />
                    Status
                  </h4>
                  <div className="flex flex-col gap-2">
                    <Badge variant={timeRemaining.color as "default"} className="w-fit">
                      {timeRemaining.text}
                    </Badge>
                    {isEditMode ? (
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={editData.allowLateSubmissions}
                          onCheckedChange={(checked) => setEditData(prev => ({ ...prev, allowLateSubmissions: checked }))}
                        />
                        <Label className="text-sm">Allow late submissions</Label>
                      </div>
                    ) : (
                      <Badge variant={assignment.allowLateSubmissions ? "outline" : "secondary"} className="w-fit">
                        {assignment.allowLateSubmissions ? "Late submissions allowed" : "No late submissions"}
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    <Award className="inline h-3 w-3 mr-1" />
                    Maximum Points
                  </h4>
                  {isEditMode ? (
                    <Input
                      type="number"
                      value={editData.maxPoints}
                      onChange={(e) => setEditData(prev => ({ ...prev, maxPoints: e.target.value }))}
                      min="1"
                      className="mt-1"
                    />
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-primary">
                        {assignment.maxScore.maxPoints} points
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {assignment.deliveryMode === "TEAM" 
                          ? "Points awarded to the entire group"
                          : "Points awarded to each student"}
                      </p>
                    </>
                  )}
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Delivery Mode
                  </h4>
                  {isEditMode ? (
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant={editData.deliveryMode === "INDIVIDUAL" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEditData(prev => ({ ...prev, deliveryMode: "INDIVIDUAL" }))}
                      >
                        <User className="h-4 w-4 mr-1" />
                        Individual
                      </Button>
                      <Button
                        variant={editData.deliveryMode === "TEAM" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEditData(prev => ({ ...prev, deliveryMode: "TEAM" }))}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Team
                      </Button>

                      <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Submission Format</h4>
                  {isEditMode ? (
                    <div className="flex gap-2">
                      <Button
                        variant={editData.submissionFormat === "DIGITAL" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEditData(prev => ({ ...prev, submissionFormat: "DIGITAL" }))}
                      >
                        <Monitor className="h-4 w-4 mr-1" />
                        Digital
                      </Button>
                      <Button
                        variant={editData.submissionFormat === "NOTEBOOK" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEditData(prev => ({ ...prev, submissionFormat: "NOTEBOOK" }))}
                      >
                        <BookOpen className="h-4 w-4 mr-1" />
                        Notebook
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="outline">
                      {assignment.submissionFormat === "DIGITAL" ? (
                        <><Monitor className="h-3 w-3 mr-1" /> Digital</>
                      ) : (
                        <><BookOpen className="h-3 w-3 mr-1" /> Notebook</>
                      )}
                    </Badge>
                  )}
                </div>

                    </div>

                    
                  ) : (
                    <div className="flex items-center gap-2 mt-2">
                      {assignment.deliveryMode === "TEAM" ? (
                        <>
                          <Users className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">Group Assignment</p>
                            <p className="text-xs text-muted-foreground">
                              Students work in teams
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <User className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="font-medium">Individual Assignment</p>
                            <p className="text-xs text-muted-foreground">
                              Each student submits individually
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Submission Statistics
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Submissions:</span>
                      <span className="font-medium">{assignment.submissions?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Last updated: {formatCreatedDate(assignment.createdAt)}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}