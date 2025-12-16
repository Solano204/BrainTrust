// // File: src/app/features/courses/components/team-edit-modal.tsx
// "use client";

// import * as React from "react";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { X, Save, Users, Loader2, Crown } from "lucide-react";
// import { Team } from "@/app/domain/entities/CourseEntities";
// import { UserId } from "@/app/domain/valueObjects";

// interface TeamEditModalProps {
//   open: boolean;
//   onClose: () => void;
//   team: Team;
//   availableUsers: any[];
//   onSave: (
//     teamName: string,
//     updates: {
//       name?: string;
//       description?: string;
//       maxMembers?: number;
//       active?: boolean;
//       leaderId?: UserId | null;
//     }
//   ) => void;
//   isSaving?: boolean;
// }

// export function TeamEditModal({
//   open,
//   onClose,
//   team,
//   availableUsers,
//   onSave,
//   isSaving = false,
// }: TeamEditModalProps) {
//   const [formData, setFormData] = React.useState({
//     name: team.name,
//     description: team.description,
//     maxMembers: team.maxMembers,
//     active: team.active,
//     leaderId: team.leaderId,
//   });

//   React.useEffect(() => {
//     setFormData({
//       name: team.name,
//       description: team.description,
//       maxMembers: team.maxMembers,
//       active: team.active,
//       leaderId: team.leaderId,
//     });
//   }, [team]);

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { id, value, type } = e.target;
//     setFormData((prev) => ({ 
//       ...prev, 
//       [id]: type === 'number' ? parseInt(value) || 1 : value 
//     }));
//   };

//   const handleFormSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSave(team.name, formData);
//   };

//   // Get current team members for leader selection
//   const teamMembers = Array.from(team.members);

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
//       <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl dark:bg-gray-900">
//         <form onSubmit={handleFormSubmit}>
//           {/* Header */}
//           <div className="flex justify-between items-center p-6 border-b border-border">
//             <h2 className="text-2xl font-bold flex items-center gap-3 text-primary">
//               <Users className="h-6 w-6" /> Edit Team: {team.name}
//             </h2>
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={onClose}
//               disabled={isSaving}
//             >
//               <X className="h-5 w-5" />
//             </Button>
//           </div>

//           {/* Form Body */}
//           <div className="p-6 space-y-6">
//             {/* Team Name */}
//             <div className="space-y-2">
//               <Label htmlFor="name" className="font-semibold">
//                 Team Name *
//               </Label>
//               <Input
//                 id="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 required
//                 disabled={isSaving}
//                 placeholder="Enter team name"
//               />
//             </div>

//             {/* Description */}
//             <div className="space-y-2">
//               <Label htmlFor="description" className="font-semibold">
//                 Description
//               </Label>
//               <Textarea
//                 id="description"
//                 rows={3}
//                 value={formData.description}
//                 onChange={handleChange}
//                 placeholder="Describe the team's purpose or focus..."
//                 disabled={isSaving}
//               />
//             </div>

//             {/* Max Members */}
//             <div className="space-y-2">
//               <Label htmlFor="maxMembers" className="font-semibold">
//                 Maximum Members
//               </Label>
//               <Input
//                 id="maxMembers"
//                 type="number"
//                 min="1"
//                 max="20"
//                 value={formData.maxMembers}
//                 onChange={handleChange}
//                 disabled={isSaving}
//               />
//               <p className="text-sm text-muted-foreground">
//                 Current members: {team.members.size} / {formData.maxMembers}
//                 {team.members.size > formData.maxMembers && (
//                   <span className="text-red-500 ml-2">
//                     Warning: Current members exceed new limit!
//                   </span>
//                 )}
//               </p>
//             </div>

           

           

//           </div>

//           {/* Footer / Save Button */}
//           <div className="flex justify-end p-6 border-t border-border bg-gray-50 dark:bg-gray-800">
//             <Button
//               type="submit"
//               disabled={isSaving || !formData.name.trim()}
//               className="gap-2"
//             >
//               {isSaving ? (
//                 <Loader2 className="h-4 w-4 animate-spin" />
//               ) : (
//                 <Save className="h-4 w-4" />
//               )}
//               {isSaving ? "Saving..." : "Save Changes"}
//             </Button>
//           </div>
//         </form>
//       </Card>
//     </div>
//   );
// }