"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar,
  FileText, 
  LinkIcon, 
  Paperclip, 
  ArrowLeft,
  ExternalLink,
  Plus,
  Trash2,
  X,
  Loader2,
  Download,
  Upload,
  BookOpen,
  Edit,
  Save,
  XCircle,
  Link2
} from "lucide-react";
import { Page } from "@/app/domain/entities/CourseEntities";
import { Document } from "@/app/domain/valueObjects/CourseValues";
import { 
  usePageLinkMutations, 
  usePageMutations, 
  usePageAttachmentMutations,
  usePage  // ✅ ADD THIS
} from "./hooks/page-hooks";
import { useAuth } from "@/app/context/AuthContext";

interface PageViewProps {
  page: Page;
  onClose: () => void;
}

export function PageView({ page: initialPage, onClose }: PageViewProps) {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";
  
  const { data: livePageData, isLoading: isLoadingPage } = usePage(initialPage.id);
  
  const page = livePageData || initialPage;
  
  const linkMutations = usePageLinkMutations();
  const attachmentMutations = usePageAttachmentMutations();
  const { updatePage } = usePageMutations();
  
  const [isEditMode, setIsEditMode] = React.useState(false);
  
  const [editData, setEditData] = React.useState({
    title: page.title,
    sectionContent: page.sectionContent
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
      title: page.title,
      sectionContent: page.sectionContent
    });
  }, [page.title, page.sectionContent]);

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
    if (!isTeacher || selectedUrls.length === 0) return;

    try {
      await linkMutations.addMultipleLinks.mutateAsync({
        pageId: page.id,
        links: selectedUrls
      });
      setSelectedUrls([]);
      setUrlInput("");
      setIsAddingMultipleUrls(false);
    } catch (error) {
      console.error("Failed to upload URLs:", error);
    }
  };

  const handleSaveEdits = async () => {
    if (!isTeacher) return;

    try {
      await updatePage.mutateAsync({
        pageId: page.id,
        pageData: {
          title: editData.title,
          sectionContent: editData.sectionContent
        }
      });
      setIsEditMode(false);
    } catch (error) {
      console.error("Failed to update page:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      title: page.title,
      sectionContent: page.sectionContent
    });
    setIsEditMode(false);
  };

  const handleSingleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isTeacher) return;
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await attachmentMutations.addAttachment.mutateAsync({
        pageId: page.id,
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
    if (!isTeacher || selectedFiles.length === 0) return;

    try {
      await attachmentMutations.addMultipleAttachments.mutateAsync({
        pageId: page.id,
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

  const handleRemoveAttachment = async (documentName: string) => {
    if (!isTeacher) return;

    try {
      await attachmentMutations.removeAttachment.mutateAsync({
        pageId: page.id,
        documentName: documentName
      });
    } catch (error) {
      console.error("Failed to remove attachment:", error);
    }
  };

  const handleAddUrl = async () => {
    if (!newUrl.trim() || !isTeacher) return;

    if (!isValidUrl(newUrl.trim())) {
      alert("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    try {
      await linkMutations.addLink.mutateAsync({
        pageId: page.id,
        linkUrl: newUrl.trim()
      });
      setNewUrl("");
      setIsAddingUrl(false);
    } catch (error) {
      console.error("Failed to add URL:", error);
    }
  };

  const handleRemoveUrl = async (url: string) => {
    if (!isTeacher) return;

    try {
      await linkMutations.removeLink.mutateAsync({
        pageId: page.id,
        linkUrl: url
      });
    } catch (error) {
      console.error("Failed to remove URL:", error);
    }
  };

  const handleClearAllUrls = async () => {
    if (!isTeacher) return;
    if (!confirm("Are you sure you want to remove all URLs?")) return;

    try {
      await linkMutations.clearLinks.mutateAsync(page.id);
    } catch (error) {
      console.error("Failed to clear URLs:", error);
    }
  };

  const isLoading = 
    isLoadingPage ||
    linkMutations.addLink.isPending ||
    linkMutations.addMultipleLinks.isPending ||
    linkMutations.removeLink.isPending ||
    linkMutations.clearLinks.isPending ||
    attachmentMutations.addAttachment.isPending ||
    attachmentMutations.addMultipleAttachments.isPending ||
    attachmentMutations.removeAttachment.isPending ||
    updatePage.isPending;

  const formatCreatedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      <p key={index} className="mb-3 last:mb-0">
        {line}
      </p>
    ));
  };

  if (isLoadingPage && !livePageData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-6">
      {/* Rest of your JSX stays the same */}
      <div className="max-w-6xl mx-auto">
        {/* ... all your existing JSX ... */}
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
                  {page.title}
                </h1>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="secondary">
                  <BookOpen className="h-3 w-3 mr-1" />
                  Information Page
                </Badge>
                
                <Badge variant="outline">
                  {page.attachments?.length || 0} files • {page.urlsSupport?.length || 0} links
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Created on</p>
                <p className="font-medium">{formatCreatedDate(page.createdAt)}</p>
              </div>
              {isTeacher && (
                isEditMode ? (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveEdits}
                      disabled={isLoading}
                      size="sm"
                      className="gap-2"
                    >
                      {updatePage.isPending ? (
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
                )
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Content Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditMode ? (
                  <Textarea
                    value={editData.sectionContent}
                    onChange={(e) => setEditData(prev => ({ ...prev, sectionContent: e.target.value }))}
                    rows={12}
                    className="w-full font-mono text-sm"
                  />
                ) : (
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="text-foreground whitespace-pre-wrap leading-relaxed">
                      {formatContent(page.sectionContent)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ATTACHMENTS - WITH FULL MANAGEMENT */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Paperclip className="h-5 w-5" />
                    Attachments ({page.attachments?.length || 0})
                  </CardTitle>
                  {isTeacher && (
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
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Multiple Files Upload Interface - Teacher Only */}
                {isTeacher && isAddingFiles && (
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

                {!page.attachments || page.attachments.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <Paperclip className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No attachments yet</p>
                    {isTeacher && (
                      <p className="text-xs text-muted-foreground mt-1">Click "Add File" to upload</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {page.attachments.map((file: Document, index: number) => (
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
                          {isTeacher && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAttachment(file.name)}
                              disabled={isLoading}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {attachmentMutations.removeAttachment.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-destructive" />
                              )}
                            </Button>
                          )}
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
                    Reference Links ({page.urlsSupport?.length || 0})
                  </CardTitle>
                  {isTeacher && (
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
                      {page.urlsSupport && page.urlsSupport.length > 0 && (
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
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Single URL Interface - Teacher Only */}
                {isTeacher && isAddingUrl && (
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

                {/* Multiple URLs Interface - Teacher Only */}
                {isTeacher && isAddingMultipleUrls && (
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

                {/* URLs List */}
                {!page.urlsSupport || page.urlsSupport.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <LinkIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No reference links available</p>
                    {isTeacher && (
                      <p className="text-xs text-muted-foreground mt-1">Click "Add Link" to include resources</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {page.urlsSupport.map((url: string, index: number) => (
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
                          >
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                          {isTeacher && (
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
                          )}
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
                <CardTitle>Page Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    <Calendar className="inline h-3 w-3 mr-1" />
                    Created Date
                  </h4>
                  <p className="font-medium">
                    {new Date(page.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    <BookOpen className="inline h-3 w-3 mr-1" />
                    Page Type
                  </h4>
                  <p className="font-medium">Information Page</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Reference material for students
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Content Statistics
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Attachments:</span>
                      <span className="font-medium">{page.attachments?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Reference Links:</span>
                      <span className="font-medium">{page.urlsSupport?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Word Count:</span>
                      <span className="font-medium">
                        {page.sectionContent.split(/\s+/).filter(w => w.length > 0).length}
                      </span>
                    </div>
                  </div>
                </div>

                {isTeacher && (
                  <>
                    <Separator />
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        <strong>Teacher View:</strong> You can edit content, manage attachments and links. Students can only view.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">About This Page</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• This page contains important information and resources</p>
                  <p>• All materials are available for download</p>
                  <p>• Reference links provide additional learning resources</p>
                  {isTeacher && (
                    <p>• Teachers can add/remove attachments and links</p>
                  )}
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
                Last updated: {formatCreatedDate(page.createdAt)}
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