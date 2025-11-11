"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, FileText, Link as LinkIcon, Download, Clock } from "lucide-react";

// 💡 PLACEHOLDER TYPES (Replace with actual imports from your domain files)
type AssignmentId = string;
type CourseId = string;
type Document = { name: string; storagePath: string; createdAt: string };
type Score = { value: number, maxPoints: number };
type Submission = {}; // Placeholder

// 1. DEFINE deliveryMode TYPE
export type DeliveryMode = 'INDIVIDUAL' | 'GROUP';

// 2. UPDATED ASSIGNMENT INTERFACE (Reflecting the structure you provided)
export interface Assignment {
  id: AssignmentId;
  title: string;
  courseId: CourseId;
  unitId: CourseId;
  description: string;
  /** Java: LocalDateTime, serialized to ISO 8601 string */
  createdAt: string;
  attachments: Document[];
  urls: string[]; // <-- NEW
  deliveryMode: DeliveryMode; // <-- NEW
  /** Java: LocalDateTime, serialized to ISO 8601 string */
  dueDate: string | null;
  maxScore: Score;
  instructions: string; // Detailed instructions
  submissions: Submission[];
  allowLateSubmissions: boolean; // <-- NEW
}

interface TaskViewProps {
  task: Assignment;
  onClose: () => void;
}

export function TaskView({ task, onClose }: TaskViewProps) {
  const dateFormatter = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    // Format date for better readability (e.g., Nov 5, 2025, 10:30 AM)
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };
  
  const isPastDue = task.dueDate ? new Date(task.dueDate) < new Date() : false;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 border-b pb-4 border-border">
          <div>
            <Badge className={`mb-2 text-xs ${isPastDue ? 'bg-red-500 text-white' : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'}`}>
              {isPastDue ? 'OVERDUE' : 'ASSIGNMENT'}
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">{task.title}</h1>
            <p className="text-muted-foreground text-base mb-3">{task.description}</p>
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {/* Due Date */}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Due: {dateFormatter(task.dueDate)}</span>
              </div>
              
              {/* Max Score */}
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>Max Score: {task.maxScore.maxPoints} points</span>
              </div>
              
              {/* Delivery Mode */}
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Delivery: {task.deliveryMode === 'INDIVIDUAL' ? 'Individual' : 'Group'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 shrink-0">
            
            <Button onClick={onClose}>
              Close View
            </Button>
          </div>
        </div>

        {/* Instructions (Using the detailed instructions field) */}
        <Card className="p-6 mb-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-primary-foreground">Detailed Instructions</h2>
          <div className="prose dark:prose-invert max-w-none">
            {/* Display instructions. Use <pre> or similar if content is raw text/markdown/HTML */}
            <p className="text-foreground whitespace-pre-wrap">{task.instructions}</p>
          </div>
        </Card>

        {/* Submission Details & Grading */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Submission Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Mode:</span>
                <span className="font-medium">{task.deliveryMode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Late Submissions:</span>
                {/* 💡 Displaying allowLateSubmissions boolean */}
                <span className={`font-medium ${task.allowLateSubmissions ? 'text-green-600' : 'text-red-600'}`}>
                  {task.allowLateSubmissions ? 'Allowed' : 'Not Allowed'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created Date:</span>
                <span className="font-medium">
                  {dateFormatter(task.createdAt)}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Grading Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Score:</span>
                <span className="font-medium text-lg text-primary">{task.maxScore.maxPoints} points</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submissions Count:</span>
                <span className="font-medium">{task.submissions.length} received</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="outline" className={`font-medium ${task.allowLateSubmissions ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}`}>
                    {task.allowLateSubmissions ? 'Active' : 'Closed'}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Support Materials (Attachments & URLs) */}
        {(task.attachments?.length > 0 || task.urls?.length > 0) && (
          <Card className="p-6 shadow-md">
            <h3 className="text-xl font-semibold mb-4">Support Materials</h3>
            
            {/* Files (Attachments) */}
            {task.attachments.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium mb-3 flex items-center gap-2 text-sm text-foreground/80">
                  <FileText className="h-4 w-4" />
                  Files ({task.attachments.length})
                </h4>
                <div className="space-y-2">
                  {task.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="font-medium truncate">{file.name}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-2 shrink-0">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* URLs */}
            {task.urls?.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2 text-sm text-foreground/80">
                  <LinkIcon className="h-4 w-4" />
                  External Links ({task.urls.length})
                </h4>
                <div className="space-y-2">
                  {/* 💡 Rendering task.urls array */}
                  {task.urls.map((url, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg border border-border flex justify-between items-center">
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium truncate max-w-[80%]"
                        title={url}
                      >
                        {url}
                      </a>
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}