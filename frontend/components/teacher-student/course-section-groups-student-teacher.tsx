// File: src/app/features/courses/components/CourseGroups.tsx
"use client";

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Users, Plus, Trash2, UserPlus, X, Search, Crown, Edit, MoreVertical, Loader2, Shield, Settings, Users2, Eye } from "lucide-react"
import { useAuth } from "@/app/context/AuthContext"

// Import your interfaces and types
import type { UserId, CourseId } from "@/app/domain/valueObjects/CourseValues"
import { Team } from "@/app/domain/entities/CourseEntities"
import { useTeamsByCourse, useAvailableUsers, useTeamMutations } from "@/components/teacher-student/hooks/team-hooks"
import { TeamFormModal } from "../teacher/team-form-modal-teacher"
import { TeamEditModal } from "../teacher/team-edit-modal-teacher"
import { Label } from "@radix-ui/react-label";

interface CourseGroupsProps {
  courseId: CourseId
}

interface User {
  id: UserId
  name: string
  role: string
  email?: string
}

export function CourseGroups({ courseId }: CourseGroupsProps) {
  const { user: currentUser } = useAuth();
  const isTeacher = currentUser?.role === 'teacher';
  
  // React Query for data fetching
  const { 
    data: teams = [], 
    isLoading: isLoadingTeams,
    error: teamsError,
    refetch: refetchTeams 
  } = useTeamsByCourse(courseId);
  
  const { 
    data: availableUsers = [], 
    isLoading: isLoadingUsers,
    error: usersError 
  } = useAvailableUsers(courseId);

  // Team mutations - only for teachers
  const { 
    createTeam, 
    updateTeam, 
    deleteTeam,
    addMembers,
    removeMember,
    setLeader,
    autoGenerateTeams,
    updateTeamInfo,
    updateTeamMemberLimit,
    updateTeamProperties 
  } = useTeamMutations();

  // Local state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showMemberLimitModal, setShowMemberLimitModal] = useState(false)
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [showAutoGenerateModal, setShowAutoGenerateModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [selectedTeamForLimit, setSelectedTeamForLimit] = useState<Team | null>(null)
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamDescription, setNewTeamDescription] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<UserId[]>([])
  const [creationMethod, setCreationMethod] = useState<"manual" | "automatic">("manual")
  const [memberSearchQuery, setMemberSearchQuery] = useState("")
  const [teamSize, setTeamSize] = useState(4)
  const [deleteConfirmTeam, setDeleteConfirmTeam] = useState<string | null>(null)
  const [showTeamDetail, setShowTeamDetail] = useState(false)

  // Event handlers - only for teachers
  const handleCreateTeam = async (teamData: any, teamName?: string) => {
    if (!isTeacher) return;
    
    const newTeamData = {
      courseId,
      name: teamData.name,
      description: teamData.description,
      leaderId: null,
      members: new Set<UserId>([]),
      maxMembers: teamData.maxMembers,
      active: teamData.active
    };

    createTeam.mutate(newTeamData, {
      onSuccess: () => {
        setShowCreateModal(false);
        setNewTeamName("");
        setNewTeamDescription("");
        setSelectedMembers([]);
      }
    });
  };

  const handleUpdateTeam = async (teamName: string, updates: any) => {
    if (!isTeacher) return;
    
    updateTeamProperties.mutate({
      courseId,
      teamName,
      updates
    }, {
      onSuccess: () => {
        setShowEditModal(false);
        setSelectedTeam(null);
      }
    });
  };

  const handleUpdateMemberLimit = async (teamName: string, maxMembers: number) => {
    if (!isTeacher) return;
    
    updateTeamMemberLimit.mutate({
      courseId,
      teamName,
      maxMembers
    }, {
      onSuccess: () => {
        setShowMemberLimitModal(false);
        setSelectedTeamForLimit(null);
      }
    });
  };

  const handleDeleteTeam = async (teamName: string) => {
    if (!isTeacher) return;
    
    deleteTeam.mutate({ courseId, teamName }, {
      onSuccess: () => {
        setDeleteConfirmTeam(null);
      }
    });
  };

  const handleAddMember = async () => {
    if (!isTeacher) return;
    
    if (selectedTeam && selectedMembers.length > 0) {
      addMembers.mutate({ 
        courseId, 
        teamName: selectedTeam.name, 
        memberIds: selectedMembers 
      }, {
        onSuccess: () => {
          setShowAddMemberModal(false);
          setSelectedMembers([]);
          setSelectedTeam(null);
        }
      });
    }
  };

  const handleRemoveMember = async (teamName: string, memberId: UserId) => {
    if (!isTeacher) return;
    removeMember.mutate({ courseId, teamName, memberId });
  };

  const handleSetLeader = async (teamName: string, leaderId: UserId) => {
    if (!isTeacher) return;
    setLeader.mutate({ courseId, teamName, leaderId });
  };

  const handleAutoGenerateTeams = async () => {
    if (!isTeacher) return;
    
    autoGenerateTeams.mutate({ 
      courseId, 
      teamSize, 
      method: "random" 
    }, {
      onSuccess: () => {
        setShowAutoGenerateModal(false);
        setTeamSize(4);
      }
    });
  };

  // Helper function to get user details by ID
  const getUserById = (userId: UserId): User | undefined => {
    return availableUsers.find(user => user.id === userId)
  }

  // Get available users for adding to teams (users not in any team)
  const getAvailableUsersForTeam = (currentTeam?: Team): User[] => {
    const usersInTeams = new Set<UserId>()
    teams.forEach(team => {
      if (team.name !== currentTeam?.name) {
        team.members.forEach(member => usersInTeams.add(member))
      }
    });
    
    return availableUsers.filter(user => 
      !usersInTeams.has(user.id) && 
      user.name.toLowerCase().includes(memberSearchQuery.toLowerCase())
    )
  }

  const filteredAvailableUsers = getAvailableUsersForTeam()

  // STUDENT VIEW - Read Only
  if (!isTeacher) {
    return (
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Class Groups</h1>
        </div>

        {/* Teams Grid - Read Only */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {teams.map((team) => (
            <TeamCardReadOnly
              key={team.name}
              team={team}
              availableUsers={availableUsers}
              getUserById={getUserById}
              onViewDetails={(team) => {
                setSelectedTeam(team);
                setShowTeamDetail(true);
              }}
            />
          ))}
        </div>

        {/* Empty State */}
        {teams.length === 0 && !isLoadingTeams && (
          <Card className="text-center p-12 border-2 border-dashed">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No groups yet</h3>
            <p className="text-muted-foreground mb-4">No groups have been created for this course.</p>
          </Card>
        )}

        {/* Team Detail Modal */}
        <Dialog open={showTeamDetail} onOpenChange={setShowTeamDetail}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Group Details</DialogTitle>
            </DialogHeader>
            {selectedTeam && (
              <TeamDetailView 
                team={selectedTeam} 
                getUserById={getUserById} 
              />
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTeamDetail(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // TEACHER VIEW - Full Access
  if (isLoadingTeams) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        Loading teams...
      </div>
    )
  }

  if (teamsError) {
    return (
      <div className="p-8 text-center text-destructive">
        <div className="h-8 w-8 mx-auto mb-4">⚠️</div>
        Error loading teams. Please try again.
        <Button onClick={() => refetchTeams()} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Team Management</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            onClick={() => setShowAutoGenerateModal(true)}
            variant="outline"
            className="gap-2 w-full sm:w-auto"
            disabled={autoGenerateTeams.isPending}
          >
            <Shield className="h-4 w-4" />
            {autoGenerateTeams.isPending ? "Generating..." : "Auto Generate"}
          </Button>
          <Button 
            onClick={() => setShowCreateModal(true)} 
            className="gap-2 w-full sm:w-auto"
            disabled={createTeam.isPending}
          >
            <Plus className="h-4 w-4" />
            {createTeam.isPending ? "Creating..." : "Create Team"}
          </Button>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {teams.map((team) => (
          <TeamCard
            key={team.name}
            team={team}
            availableUsers={availableUsers}
            getUserById={getUserById}
            onEdit={(team) => {
              setSelectedTeam(team);
              setShowEditModal(true);
            }}
            onUpdateMemberLimit={(team) => {
              setSelectedTeamForLimit(team);
              setShowMemberLimitModal(true);
            }}
            onAddMember={(team) => {
              setSelectedTeam(team);
              setShowAddMemberModal(true);
            }}
            onRemoveMember={handleRemoveMember}
            onSetLeader={handleSetLeader}
            onDeleteTeam={handleDeleteTeam}
            deleteConfirmTeam={deleteConfirmTeam}
            setDeleteConfirmTeam={setDeleteConfirmTeam}
            isDeleting={deleteTeam.isPending}
            isUpdating={removeMember.isPending || setLeader.isPending || updateTeamProperties.isPending}
            isTeacher={isTeacher}
          />
        ))}
      </div>

      {/* Empty State */}
      {teams.length === 0 && !isLoadingTeams && (
        <Card className="text-center p-12 border-2 border-dashed">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">No teams yet</h3>
          <p className="text-muted-foreground mb-4">Create your first team or generate teams automatically</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={() => setShowCreateModal(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Create Team
            </Button>
            <Button onClick={() => setShowAutoGenerateModal(true)} variant="outline" className="gap-2">
              <Shield className="h-4 w-4" /> Auto Generate
            </Button>
          </div>
        </Card>
      )}

      {/* Create Team Modal */}
      <TeamFormModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateTeam}
        isSaving={createTeam.isPending}
      />

      {/* Edit Team Modal */}
      {selectedTeam && (
        <TeamEditModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTeam(null);
          }}
          team={selectedTeam}
          availableUsers={availableUsers}
          onSave={handleUpdateTeam}
          isSaving={updateTeamProperties.isPending}
        />
      )}

      {/* Add Member Modal */}
      <Dialog open={showAddMemberModal} onOpenChange={setShowAddMemberModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Members to {selectedTeam?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name..."
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredAvailableUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No students found</p>
              ) : (
                filteredAvailableUsers.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMembers([...selectedMembers, user.id])
                        } else {
                          setSelectedMembers(selectedMembers.filter((id) => id !== user.id))
                        }
                      }}
                    />
                    <span>
                      {user.name} ({user.role})
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMemberModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddMember} 
              disabled={selectedMembers.length === 0 || addMembers.isPending}
            >
              {addMembers.isPending ? "Adding..." : "Add Members"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auto Generate Teams Modal */}
      <Dialog open={showAutoGenerateModal} onOpenChange={setShowAutoGenerateModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Auto Generate Teams</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="teamSize" className="font-semibold mb-2 block">
                Team Size
              </Label>
              <Input
                id="teamSize"
                type="number"
                min="2"
                max="10"
                value={teamSize}
                onChange={(e) => setTeamSize(parseInt(e.target.value) || 2)}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Number of students per team
              </p>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                This will create teams automatically by randomly distributing available students. 
                Existing teams will be preserved.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAutoGenerateModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAutoGenerateTeams}
              disabled={autoGenerateTeams.isPending}
            >
              {autoGenerateTeams.isPending ? "Generating..." : "Generate Teams"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Enhanced Team Card Component with Update Options (Teacher)
interface TeamCardProps {
  team: Team;
  availableUsers: any[];
  getUserById: (userId: UserId) => any;
  onEdit: (team: Team) => void;
  onUpdateMemberLimit: (team: Team) => void;
  onAddMember: (team: Team) => void;
  onRemoveMember: (teamName: string, memberId: UserId) => void;
  onSetLeader: (teamName: string, leaderId: UserId) => void;
  onDeleteTeam: (teamName: string) => void;
  deleteConfirmTeam: string | null;
  setDeleteConfirmTeam: (teamName: string | null) => void;
  isDeleting: boolean;
  isUpdating: boolean;
  isTeacher: boolean;
}

const TeamCard: React.FC<TeamCardProps> = ({
  team,
  availableUsers,
  getUserById,
  onEdit,
  onUpdateMemberLimit,
  onAddMember,
  onRemoveMember,
  onSetLeader,
  onDeleteTeam,
  deleteConfirmTeam,
  setDeleteConfirmTeam,
  isDeleting,
  isUpdating,
  isTeacher
}) => {
  const isPendingDelete = deleteConfirmTeam === team.name;

  return (
    <Card key={team.name} className="hover:shadow-xl transition-all duration-300">
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{team.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">
                  {team.members.size}/{team.maxMembers} members
                </Badge>
                {!team.active && (
                  <Badge variant="outline" className="text-xs">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {isTeacher && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(team)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Team
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => onAddMember(team)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Members
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setDeleteConfirmTeam(team.name)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Team
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {team.description && <p className="text-sm text-muted-foreground">{team.description}</p>}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Team Members:</span>
            {isTeacher && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onAddMember(team)}
                className="gap-1 h-7 text-xs"
                disabled={team.members.size >= team.maxMembers || isUpdating}
              >
                <UserPlus className="h-3 w-3" />
                Add
              </Button>
            )}
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {Array.from(team.members).map((memberId) => {
              const member = getUserById(memberId)
              return member ? (
                <div
                  key={memberId}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span>{member.name}</span>
                    {team.leaderId === memberId && (
                      <Crown className="h-3 w-3 text-yellow-500" />
                    )}
                  </div>
                  {isTeacher && (
                    <div className="flex items-center gap-1">
                      {team.leaderId !== memberId && (
                        <button
                          onClick={() => onSetLeader(team.name, memberId)}
                          className="text-muted-foreground hover:text-yellow-500 transition-colors"
                          title="Set as Leader"
                          disabled={isUpdating}
                        >
                          <Crown className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        onClick={() => onRemoveMember(team.name, memberId)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        title="Remove Member"
                        disabled={isUpdating}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              ) : null
            })}
          </div>
        </div>

        {/* Quick Actions - Only for Teachers */}
        {isTeacher && (
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(team)}
              className="flex-1 gap-1 text-xs"
              disabled={isUpdating}
            >
              <Settings className="h-3 w-3" />
              Edit
            </Button>
          </div>
        )}

        {/* Delete Confirmation - Only for Teachers */}
        {isTeacher && isPendingDelete && (
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button 
              variant="destructive" 
              size="sm" 
              className="flex-1 gap-2"
              onClick={() => onDeleteTeam(team.name)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
              {isDeleting ? "Deleting..." : "Confirm"}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setDeleteConfirmTeam(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Created: {team.createdAt.toLocaleDateString()}
        </div>
      </div>
    </Card>
  );
};

// Team Card for Students (Read Only)
const TeamCardReadOnly: React.FC<{
  team: Team;
  availableUsers: any[];
  getUserById: (userId: UserId) => any;
  onViewDetails: (team: Team) => void;
}> = ({ team, availableUsers, getUserById, onViewDetails }) => {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={() => onViewDetails(team)}>
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{team.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">
                  {team.members.size}/{team.maxMembers} members
                </Badge>
                {!team.active && (
                  <Badge variant="outline" className="text-xs">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </div>

        {team.description && <p className="text-sm text-muted-foreground">{team.description}</p>}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Team Members:</span>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {Array.from(team.members).slice(0, 5).map((memberId) => {
              const member = getUserById(memberId)
              return member ? (
                <div
                  key={memberId}
                  className="flex items-center gap-2 p-2 bg-muted/50 rounded-md text-sm"
                >
                  <span>{member.name}</span>
                  {team.leaderId === memberId && (
                    <Crown className="h-3 w-3 text-yellow-500" />
                  )}
                </div>
              ) : null
            })}
            {team.members.size > 5 && (
              <div className="text-xs text-muted-foreground text-center">
                +{team.members.size - 5} more members
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Click to view details
        </div>
      </div>
    </Card>
  );
};

// Team Detail View (Shared)
const TeamDetailView: React.FC<{
  team: Team;
  getUserById: (userId: UserId) => any;
}> = ({ team, getUserById }) => {
  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <Users className="h-8 w-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{team.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">
              {team.members.size}/{team.maxMembers} members
            </Badge>
            {!team.active && (
              <Badge variant="outline" className="text-xs">
                Inactive
              </Badge>
            )}
          </div>
        </div>
      </div>

      {team.description && (
        <div>
          <h3 className="font-semibold text-lg mb-2">Description</h3>
          <p className="text-muted-foreground">{team.description}</p>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-lg mb-3">Team Members</h3>
        <div className="space-y-2">
          {Array.from(team.members).map((memberId) => {
            const member = getUserById(memberId)
            return member ? (
              <div
                key={memberId}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground">{member.email}</div>
                  </div>
                </div>
                {team.leaderId === memberId && (
                  <Badge variant="default" className="bg-yellow-600">
                    <Crown className="h-3 w-3 mr-1" />
                    Leader
                  </Badge>
                )}
              </div>
            ) : null
          })}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Created: {team.createdAt.toLocaleDateString()}
      </div>
    </div>
  );
};