"use client"

import { useState, useEffect } from "react" // 💡 Added useEffect
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClipboardList, HelpCircle, MessageSquare } from "lucide-react"
import { CourseResourceType, ResourceItem } from "@/app/domain/entities/CourseEntities"
import { fetchResourceTypesMock } from "@/app/domain/service/serviceCourse"

// 💡 IMPORT THE INTERFACE AND MOCK FUNCTION

interface ResourceTypeSelectorProps {
  open: boolean
  onClose: () => void
  onSelect: (type: CourseResourceType) => void
}


export function ResourceTypeSelector({ open, onClose, onSelect }: ResourceTypeSelectorProps) {
  const [resourceItems, setResourceItems] = useState<ResourceItem[]>([]); // State for fetched data
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  // 🚀 Fetch data on mount
  useEffect(() => {
    const loadResourceTypes = async () => {
      setIsLoading(true);
      // NOTE: Using the statically defined resourceTypes in the mock for now.
      // In a real app, this would be an API call.
      const data = await fetchResourceTypesMock(); 
      setResourceItems(data);
      setIsLoading(false);
    };
    loadResourceTypes();
  }, []);


  const filteredResources = resourceItems.filter((resource) => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || resource.id === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <Dialog open={open} onOpenChange={onClose} >
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col ">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add an Activity or Resource</DialogTitle>
        </DialogHeader>

     
      
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-primary">
            Loading resource options...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto flex-1 pb-4">
            {filteredResources.map((resource) => {
              const Icon = resource.icon;
              return (
                <button
                  key={resource.id}
                  onClick={() => onSelect(resource.type)}
                  className="border border-border rounded-lg p-6 text-center hover:shadow-lg hover:border-primary transition-all bg-card group"
                >
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <Icon />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">{resource.name}</h3>
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                </button>
              );
            })}
            {filteredResources.length === 0 && (
                 <div className="sm:col-span-2 text-center text-muted-foreground pt-8">
                    No resources match your criteria.
                </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}