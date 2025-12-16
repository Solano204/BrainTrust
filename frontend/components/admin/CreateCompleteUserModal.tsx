// components/admin/CreateCompleteUserModal.tsx
"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Loader2, UserPlus } from "lucide-react";
import { useUserMutations } from "./hooks/useUsers";

interface CreateCompleteUserModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateCompleteUserModal({ open, onClose }: CreateCompleteUserModalProps) {
  const { createCompleteUser } = useUserMutations();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "OTHER",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT" as "STUDENT" | "TEACHER" | "ADMIN",
    studentId: "",
    addressStreet: "",
    addressColony: "",
    addressMunicipality: "",
    addressState: "",
    addressPostalCode: "",
  });
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    
    if (!isValidEmail(formData.email)) {
      alert("Please enter a valid email");
      return;
    }
    
    const requestData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      gender: formData.gender,
      phone: formData.phone,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      ...(formData.role === 'STUDENT' && formData.studentId && { 
        userId: formData.studentId 
      }),
      ...(formData.addressStreet && { addressStreet: formData.addressStreet }),
      ...(formData.addressColony && { addressColony: formData.addressColony }),
      ...(formData.addressMunicipality && { addressMunicipality: formData.addressMunicipality }),
      ...(formData.addressState && { addressState: formData.addressState }),
      ...(formData.addressPostalCode && { addressPostalCode: formData.addressPostalCode }),
    };
    
    await createCompleteUser.mutateAsync(requestData);
    
    // Reset form and close
    setFormData({
      firstName: "",
      lastName: "",
      gender: "OTHER",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "STUDENT",
      studentId: "",
      addressStreet: "",
      addressColony: "",
      addressMunicipality: "",
      addressState: "",
      addressPostalCode: "",
    });
    
    onClose();
  };
  
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  if (!open) return null;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create Complete User
          </DialogTitle>
          <DialogDescription>
            Create a new user with all personal information
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                required
                placeholder="John"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                required
                placeholder="Doe"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleChange("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+1234567890"
              />
            </div>
          </div>
          
          {/* Account Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
                placeholder="user@example.com"
              />
            </div>
            <div>
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "STUDENT" | "TEACHER" | "ADMIN") => 
                  handleChange("role", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {formData.role === 'STUDENT' && (
            <div>
              <Label htmlFor="studentId">Student ID (Optional)</Label>
              <Input
                id="studentId"
                value={formData.studentId}
                onChange={(e) => handleChange("studentId", e.target.value)}
                placeholder="e.g., S123456"
              />
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
                minLength={8}
                placeholder="Minimum 8 characters"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                required
                placeholder="Confirm password"
              />
            </div>
          </div>
          
          {/* Address Information (Optional) */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">Address Information (Optional)</h3>
            
            <div>
              <Label htmlFor="addressStreet">Street</Label>
              <Input
                id="addressStreet"
                value={formData.addressStreet}
                onChange={(e) => handleChange("addressStreet", e.target.value)}
                placeholder="123 Main St"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="addressColony">Colony/Neighborhood</Label>
                <Input
                  id="addressColony"
                  value={formData.addressColony}
                  onChange={(e) => handleChange("addressColony", e.target.value)}
                  placeholder="Downtown"
                />
              </div>
              <div>
                <Label htmlFor="addressMunicipality">Municipality</Label>
                <Input
                  id="addressMunicipality"
                  value={formData.addressMunicipality}
                  onChange={(e) => handleChange("addressMunicipality", e.target.value)}
                  placeholder="Cityville"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="addressState">State/Province</Label>
                <Input
                  id="addressState"
                  value={formData.addressState}
                  onChange={(e) => handleChange("addressState", e.target.value)}
                  placeholder="California"
                />
              </div>
              <div>
                <Label htmlFor="addressPostalCode">Postal Code</Label>
                <Input
                  id="addressPostalCode"
                  value={formData.addressPostalCode}
                  onChange={(e) => handleChange("addressPostalCode", e.target.value)}
                  placeholder="12345"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createCompleteUser.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createCompleteUser.isPending}
            >
              {createCompleteUser.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}