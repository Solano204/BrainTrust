"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, Paperclip, Link as LinkIcon, FileText } from "lucide-react";
import { Page } from "@/app/domain/entities/CourseEntities";

interface PageViewProps {
  page: Page;
  onClose: () => void;
}

export function PageView({ page, onClose }: PageViewProps) {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <Badge className="mb-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              INFORMATION PAGE
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">{page.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created: {new Date(page.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
           
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {/* Welcome Section */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950">
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-balance">
              {page.welcomeTitle || "Welcome to Our Platform"}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto text-balance">
              {page.welcomeSubtitle || "Discover amazing features and unlock your potential with our innovative solutions"}
            </p>
          </div>
        </Card>

        {/* Content Section */}
        <Card className="p-6 mb-6">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">
              {page.sectionTitle || "Innovative Solutions for Modern Challenges"}
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {page.sectionContent || "Our cutting-edge platform combines advanced technology with user-friendly design to deliver exceptional results. Whether you're a startup or an enterprise, we have the tools and expertise to help you succeed in today's competitive landscape.\n\nJoin thousands of satisfied customers who have transformed their business operations with our comprehensive suite of services. From automation to analytics, we provide everything you need to stay ahead of the curve."}
              </p>
            </div>
          </div>
        </Card>

        {/* Support Materials */}
        {(page.attachments?.length > 0 || page.urlsSupport?.length > 0) && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Support Materials</h3>
            
            {/* Files */}
            {page.attachments?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Files
                </h4>
                <div className="space-y-2">
                  {page.attachments.map((file: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{file.name}</span>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* URLs */}
            {page.urlsSupport.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Links
                </h4>
                <div className="space-y-2">
                  {page.urlsSupport.map((url: string, index: number) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        {url}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Additional Information */}
        <Card className="p-6 mt-6 bg-muted/30">
          <h3 className="text-lg font-semibold mb-3">About This Information</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• This page contains important information and resources for your learning</p>
            <p>• All support materials are available for download</p>
            <p>• Contact your instructor if you have any questions</p>
          </div>
        </Card>
      </div>
    </div>
  );
}