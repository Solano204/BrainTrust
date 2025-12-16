// File: src/app/features/courses/components/CourseGroups.tsx
"use client";

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Users, Plus, Trash2, UserPlus, X, Search, Edit, MoreVertical, Loader2, Eye } from "lucide-react"
import { useAuth } from "@/app/context/AuthContext"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Import types and interfaces
import type { UserId, CourseId } from "@/app/domain/valueObjects/CourseValues"
import { 
  Team,
  TeamWithIds,
} from "@/app/domain/entities/CourseEntities"
import { 
  useAvailableUsers, 
  useTeamMutations, 
  useTeamsByCourse 
} from "./hooks/team-hooks"

interface CourseGroupsProps {
  courseId: CourseId
}

// User interface for local use
interface User {
  id: UserId
  name: string
  email: string
}

export function CourseGroups({ courseId }: CourseGroupsProps) {
  const { user: currentUser } = useAuth();
  const isTeacher = currentUser?.role === 'teacher';
  
  // React Query for data fetching
  const { 
    data: teamsData, 
    isLoading: isLoadingTeams,
    error: teamsError,
    refetch: refetchTeams 
  } = useTeamsByCourse(courseId);
  
  const teams = teamsData?.teams || [];
  
  const { 
    data: availableUsersData, 
    isLoading: isLoadingUsers,
    error: usersError 
  } = useAvailableUsers(courseId);

  const availableUsers = availableUsersData?.users || [];

  // Team mutations
  const { 
    createTeam, 
    deleteTeam,
    addMembers,
    removeMember,
    updateTeamInfo
  } = useTeamMutations();

  // Local state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamDescription, setNewTeamDescription] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<UserId[]>([])
  const [memberSearchQuery, setMemberSearchQuery] = useState("")
  const [deleteConfirmTeam, setDeleteConfirmTeam] = useState<string | null>(null)
  const [showTeamDetail, setShowTeamDetail] = useState(false)

  // Event handlers
  const handleCreateTeam = async () => {
    if (!isTeacher) return;
    
const newTeamData: TeamWithIds = {
  courseId,
  createdAt: new Date(),
  teamId: "",
  name: newTeamName,
  description: newTeamDescription,
  members: new Set(selectedMembers),
  active: true,
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

  const handleUpdateTeam = async () => {
    if (!isTeacher || !selectedTeam) return;
    
    updateTeamInfo.mutate({
      courseId,
      teamId: selectedTeam.teamId,
      updates: {
        name: newTeamName,
        description: newTeamDescription
      }
    }, {
      onSuccess: () => {
        setShowEditModal(false);
        setSelectedTeam(null);
        setNewTeamName("");
        setNewTeamDescription("");
      }
    });
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!isTeacher) return;
    
    deleteTeam.mutate({ courseId, teamId }, {
      onSuccess: () => {
        setDeleteConfirmTeam(null);
      }
    });
  };

  const handleAddMember = async () => {
    if (!isTeacher || !selectedTeam) return;
    
    if (selectedMembers.length > 0) {
      addMembers.mutate({ 
        courseId, 
        teamId: selectedTeam.teamId, 
        memberIds: selectedMembers 
      }, {
        onSuccess: () => {
          setShowAddMemberModal(false);
          setSelectedMembers([]);
          setSelectedTeam(null);
          setMemberSearchQuery("");
        }
      });
    }
  };

  const handleRemoveMember = async (teamId: string, memberId: UserId) => {
    if (!isTeacher) return;
    removeMember.mutate({ courseId, teamId, memberId });
  };

  // Helper function to get user details by ID
  const getUserById = (userId: UserId): User | undefined => {
    return availableUsers.find(user => user.id === userId)
  }

  // Get member user IDs from team members
  const getTeamMemberIds = (team: Team): UserId[] => {
    return Array.from(team.members).map(member => member.userId)
  }

  // Get available users for adding to teams (excluding users already in the selected team)
  const filteredAvailableUsers = useMemo(() => {
    // Get all users already in teams (except current selected team)
    const usersInOtherTeams = new Set<UserId>();
    teams.forEach(team => {
      if (!selectedTeam || team.teamId !== selectedTeam.teamId) {
        team.members.forEach(member => usersInOtherTeams.add(member.userId));
      }
    });
    
    // Filter available users by search query and exclude those in other teams
    return availableUsers.filter(user => 
      !usersInOtherTeams.has(user.id) && 
      user.name.toLowerCase().includes(memberSearchQuery.toLowerCase())
    );
  }, [availableUsers, teams, selectedTeam, memberSearchQuery]);

  // STUDENT VIEW - Read Only
  if (!isTeacher) {
    return (
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Class Groups</h1>
        </div>

        {/* Teams Grid - Read Only */}
        {isLoadingTeams ? (
          <div className="text-center text-muted-foreground py-12">
            <Loader2 className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            Loading groups...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {teams.map((team) => (
              <TeamCardReadOnly
                key={team.teamId}
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
        )}

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
        <Loader2 className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
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
        <Button 
          onClick={() => setShowCreateModal(true)} 
          className="gap-2 w-full sm:w-auto"
          disabled={createTeam.isPending}
        >
          <Plus className="h-4 w-4" />
          {createTeam.isPending ? "Creating..." : "Create Team"}
        </Button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {teams.map((team) => (
          <TeamCard
            key={team.teamId}
            team={team}
            availableUsers={availableUsers}
            getUserById={getUserById}
            getTeamMemberIds={getTeamMemberIds}
            onEdit={(team) => {
              setSelectedTeam(team);
              setNewTeamName(team.name);
              setNewTeamDescription(team.description);
              setShowEditModal(true);
            }}
            onAddMember={(team) => {
              setSelectedTeam(team);
              setShowAddMemberModal(true);
            }}
            onRemoveMember={handleRemoveMember}
            onDeleteTeam={handleDeleteTeam}
            deleteConfirmTeam={deleteConfirmTeam}
            setDeleteConfirmTeam={setDeleteConfirmTeam}
            isDeleting={deleteTeam.isPending}
            isUpdating={removeMember.isPending}
            isTeacher={isTeacher}
          />
        ))}
      </div>

      {/* Empty State */}
      {teams.length === 0 && !isLoadingTeams && (
        <Card className="text-center p-12 border-2 border-dashed">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">No teams yet</h3>
          <p className="text-muted-foreground mb-4">Create your first team to get started</p>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Create Team
          </Button>
        </Card>
      )}

      {/* Create Team Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Enter team name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTeamDescription}
                onChange={(e) => setNewTeamDescription(e.target.value)}
                placeholder="Enter team description"
              />
            </div>
            <div>
              <Label>Members (Optional)</Label>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {availableUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No available users
                  </p>
                ) : (
                  availableUsers.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center gap-3 p-2 bg-muted/30 rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
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
                      <span className="text-sm">
                        {user.name} ({user.email})
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCreateModal(false);
                setNewTeamName("");
                setNewTeamDescription("");
                setSelectedMembers([]);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTeam}
              disabled={!newTeamName || createTeam.isPending}
            >
              {createTeam.isPending ? "Creating..." : "Create Team"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Team Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Team Name</Label>
              <Input
                id="edit-name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Enter team name"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={newTeamDescription}
                onChange={(e) => setNewTeamDescription(e.target.value)}
                placeholder="Enter team description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowEditModal(false);
                setSelectedTeam(null);
                setNewTeamName("");
                setNewTeamDescription("");
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateTeam}
              disabled={!newTeamName || updateTeamInfo.isPending}
            >
              {updateTeamInfo.isPending ? "Updating..." : "Update Team"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                      {user.name} ({user.email})
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddMemberModal(false);
                setSelectedMembers([]);
                setSelectedTeam(null);
                setMemberSearchQuery("");
              }}
            >
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
    </div>
  )
}

// Enhanced Team Card Component (Teacher)
interface TeamCardProps {
  team: Team;
  availableUsers: User[];
  getUserById: (userId: UserId) => User | undefined;
  getTeamMemberIds: (team: Team) => UserId[];
  onEdit: (team: Team) => void;
  onAddMember: (team: Team) => void;
  onRemoveMember: (teamId: string, memberId: UserId) => void;
  onDeleteTeam: (teamId: string) => void;
  deleteConfirmTeam: string | null;
  setDeleteConfirmTeam: (teamId: string | null) => void;
  isDeleting: boolean;
  isUpdating: boolean;
  isTeacher: boolean;
}

const TeamCard: React.FC<TeamCardProps> = ({
  team,
  availableUsers,
  getUserById,
  getTeamMemberIds,
  onEdit,
  onAddMember,
  onRemoveMember,
  onDeleteTeam,
  deleteConfirmTeam,
  setDeleteConfirmTeam,
  isDeleting,
  isUpdating,
  isTeacher
}) => {
  const isPendingDelete = deleteConfirmTeam === team.teamId;

  return (
    <Card className="hover:shadow-xl transition-all duration-300">
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{team.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {team.members.size} members
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
                  onClick={() => setDeleteConfirmTeam(team.teamId)}
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
              >
                <UserPlus className="h-3 w-3" />
                Add
              </Button>
            )}
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {team.members.size === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">No members yet</p>
            ) : (
              Array.from(team.members).map((member) => {
                const user = getUserById(member.userId)
                return user ? (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span>{user.name}</span>
                    </div>
                    {isTeacher && (
                      <button
                        onClick={() => onRemoveMember(team.teamId, member.userId)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        title="Remove Member"
                        disabled={isUpdating}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span>{member.fullName}</span>
                    </div>
                    {isTeacher && (
                      <button
                        onClick={() => onRemoveMember(team.teamId, member.userId)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        title="Remove Member"
                        disabled={isUpdating}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Delete Confirmation */}
        {isTeacher && isPendingDelete && (
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button 
              variant="destructive" 
              size="sm" 
              className="flex-1 gap-2"
              onClick={() => onDeleteTeam(team.teamId)}
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

        {team.createdAt && (
          <div className="text-xs text-muted-foreground">
            Created: {team.createdAt.toLocaleDateString()}
          </div>
        )}
      </div>
    </Card>
  );
};

// Team Card for Students (Read Only)
const TeamCardReadOnly: React.FC<{
  team: Team;
  availableUsers: User[];
  getUserById: (userId: UserId) => User | undefined;
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
                <Badge variant="secondary" className="text-xs">
                  {team.members.size} members
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
            {Array.from(team.members).slice(0, 5).map((member) => {
              const user = getUserById(member.userId)
              return user ? (
                <div
                  key={member.userId}
                  className="flex items-center gap-2 p-2 bg-muted/50 rounded-md text-sm"
                >
                  <span>{user.name}</span>
                </div>
              ) : (
                <div
                  key={member.userId}
                  className="flex items-center gap-2 p-2 bg-muted/50 rounded-md text-sm"
                >
                  <span>{member.fullName}</span>
                </div>
              )
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
  getUserById: (userId: UserId) => User | undefined;
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
              {team.members.size} members
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
          {team.members.size === 0 ? (
            <p className="text-muted-foreground text-center py-4">No members yet</p>
          ) : (
            Array.from(team.members).map((member) => {
              const user = getUserById(member.userId)
              return (
                <div
                  key={member.userId}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      {member.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{member.fullName}</div>
                      {user && (
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {team.createdAt && (
        <div className="text-sm text-muted-foreground">
          Created: {team.createdAt.toLocaleDateString()}
        </div>
      )}
    </div>
  );
};