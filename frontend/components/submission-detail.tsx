// "use client"

// import { useState, useEffect } from "react"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { HelpCircle, MessageSquare, ClipboardList, FileText, Component } from "lucide-react" 
// import { CourseResourceType, ResourceItem } from "@/app/domain/entities/CourseEntities"
// import { fetchResourceTypesMock } from "@/app/domain/services/serviceCourse"

// // Helper function to map the resource type to a Lucide icon component (unchanged)
// const getIconComponent = (type: CourseResourceType) => {
//     switch (type) {
//         case 'ASSIGNMENT':
//             return ClipboardList;
//         case 'QUIZ':
//             return HelpCircle;
//         case 'PAGE':
//             return FileText;
//         default:
//             return Component; 
//     }
// }

// interface ResourceTypeSelectorProps {
//     open: boolean
//     onClose: () => void
//     onSelect: (type: string) => void
// }


// export function ResourceTypeSelector({ open, onClose, onSelect }: ResourceTypeSelectorProps) {
//     const [availableResources, setAvailableResources] = useState<ResourceItem[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [searchQuery, setSearchQuery] = useState("");
//     const [filter, setFilter] = useState("all");

//     // Fetch data on component mount
//     useEffect(() => {
//         const loadResources = async () => {
//             setIsLoading(true);
//             const data = await fetchResourceTypesMock();
//             setAvailableResources(data);
//             setIsLoading(false);
//         };
//         loadResources();
//     }, []);

//     const filteredResources = availableResources.filter((resource) => {
//         const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase());
//         const matchesFilter = filter === "all" || resource.type.toLowerCase() === filter; 
//         return matchesSearch && matchesFilter;
//     });

//     // 💡 CALCULATION FOR CENTERING: Check if the number of items is odd
//     const isOddCount = filteredResources.length % 2 !== 0;

//     return (
//         <Dialog open={open} onOpenChange={onClose} >
//             <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col ">
//                 <DialogHeader>
//                     <DialogTitle className="text-2xl">Add an Activity or Resource</DialogTitle>
                    
//                     {/* Search and Filter Bar (unchanged) */}
//                     <div className="flex gap-4 pt-4">
//                         <Input
//                             placeholder="Search resources..."
//                             value={searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                             className="flex-1"
//                         />
//                         <Select value={filter} onValueChange={setFilter}>
//                             <SelectTrigger className="w-[180px]">
//                                 <SelectValue placeholder="Filter by type" />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 <SelectItem value="all">All Types</SelectItem>
//                                 <SelectItem value="assignment">Assignment</SelectItem>
//                                 <SelectItem value="quiz">Quiz</SelectItem>
//                                 <SelectItem value="forum">Forum</SelectItem>
//                                 <SelectItem value="page">Content Page</SelectItem>
//                             </SelectContent>
//                         </Select>
//                     </div>
//                 </DialogHeader>

//                 {/* 💡 Grid container is 'grid-cols-1 sm:grid-cols-2' */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto flex-1 pb-4">
//                     {isLoading ? (
//                         <div className="col-span-full text-center py-8 text-muted-foreground">Loading resource types...</div>
//                     ) : filteredResources.length === 0 ? (
//                         <div className="col-span-full text-center py-8 text-muted-foreground">No resources match your search/filter.</div>
//                     ) : (
//                         filteredResources.map((resource, index) => {
//                             const Icon = getIconComponent(resource.type); 
                            
//                             // 💡 CONDITIONAL STYLING LOGIC:
//                             // If the count is odd AND this is the last item, center it.
//                             const isLastOddItem = isOddCount && (index === filteredResources.length - 1);
                            
//                             const itemClassName = `
//                                 border border-border rounded-lg p-6 text-center 
//                                 hover:shadow-lg hover:border-primary transition-all bg-card group
//                                 ${isLastOddItem ? 'sm:col-span-2 sm:max-w-md sm:justify-self-center' : ''}
//                             `;
                            
//                             return (
//                                 <button
//                                     key={resource.id}
//                                     onClick={() => onSelect(resource.type)}
//                                     className={itemClassName}
//                                 >
//                                     <div className="flex justify-center mb-4">
//                                         <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
//                                             <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:text-white" />
//                                         </div>
//                                     </div>
//                                     <h3 className="font-bold text-lg mb-2 text-foreground">{resource.name}</h3>
//                                     <p className="text-sm text-muted-foreground">{resource.description}</p>
//                                 </button>
//                             );
//                         })
//                     )}
//                 </div>
//             </DialogContent>
//         </Dialog>
//     );
// }

// export { fetchResourceTypesMock };