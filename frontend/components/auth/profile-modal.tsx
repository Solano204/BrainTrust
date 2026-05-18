"use client"

import { useState, useEffect, type ReactNode } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Loader2, 
  User, 
  MapPin, 
  Lock, 
  Check, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  Edit2,
  Save,
  Camera,
  AlertCircle
} from "lucide-react"
import { 
  useProfile, 
  useUpdatePersonalInfo, 
  useUpdateAddress, 
  useUpdateImage, 
  useChangePassword 
} from "@/components/auth/hooks/useProfile"
import { useAuth } from "@/app/context/AuthContext"
import { 
  personalInfoSchema, 
  addressSchema, 
  passwordSchema, 
  imageUploadSchema,
  type PersonalInfoFormData,
  type AddressFormData,
  type PasswordFormData
} from "@/components/auth/types/profile-validation"
import { ZodError } from "zod"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ValidationErrors {
  [key: string]: string
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth()
  const { data: profile, isLoading: isLoadingProfile } = useProfile()
  
  const [activeTab, setActiveTab] = useState("personal")
  const [isUploading, setIsUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoFormData>({
    firstName: "",
    lastName: "",
    gender: "OTHER",
    phone: "",
  })
  
  const [address, setAddress] = useState<AddressFormData>({
    street: "",
    colony: "",
    municipality: "",
    state: "",
    postalCode: "",
  })
  
  const [password, setPassword] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [personalInfoErrors, setPersonalInfoErrors] = useState<ValidationErrors>({})
  const [addressErrors, setAddressErrors] = useState<ValidationErrors>({})
  const [passwordErrors, setPasswordErrors] = useState<ValidationErrors>({})
  const [imageError, setImageError] = useState<string>("")

  useEffect(() => {
    if (profile) {
      setPersonalInfo({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        gender: profile.gender || "OTHER",
        phone: profile.phone || "",
      })
      setAddress({
        street: profile.address?.street || "",
        colony: profile.address?.colony || "",
        municipality: profile.address?.municipality || "",
        state: profile.address?.state || "",
        postalCode: profile.address?.postalCode || "",
      })
      if (profile.imagePath) {
        setImagePreview(profile.imagePath)
      }
    }
  }, [profile])

  const updatePersonalInfoMutation = useUpdatePersonalInfo()
  const updateAddressMutation = useUpdateAddress()
  const updateImageMutation = useUpdateImage()
  const changePasswordMutation = useChangePassword()

  const isLoading = 
    isLoadingProfile || 
    updatePersonalInfoMutation.isPending || 
    updateAddressMutation.isPending || 
    changePasswordMutation.isPending

  const handleImageUpload = async (file: File) => {
    if (!profile?.personId) return
    setImageError("")
    try {
      imageUploadSchema.parse({ file })
      setIsUploading(true)
      await updateImageMutation.mutateAsync({ personId: profile.personId, imageFile: file })
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    } catch (error) {
      if (error instanceof ZodError) {
        setImageError(error.errors[0]?.message || "Invalid image file")
      } else {
        setImageError("Failed to upload image")
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleImageUpload(file)
  }

  const handleUpdatePersonalInfo = async () => {
    if (!user?.id) return
    setPersonalInfoErrors({})
    try {
      const validatedData = personalInfoSchema.parse(personalInfo)
      await updatePersonalInfoMutation.mutateAsync({
        userId: user.id,
        ...validatedData,
        phone: validatedData.phone || ""
      })
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: ValidationErrors = {}
        error.errors.forEach((err) => {
          if (err.path[0]) errors[err.path[0].toString()] = err.message
        })
        setPersonalInfoErrors(errors)
      }
    }
  }

  const handleUpdateAddress = async () => {
    if (!profile?.personId) return
    setAddressErrors({})
    try {
      const validatedData = addressSchema.parse(address)
      await updateAddressMutation.mutateAsync({
        personId: profile.personId,
        street: validatedData.street || "",
        colony: validatedData.colony || "",
        municipality: validatedData.municipality || "",
        state: validatedData.state || "",
        postalCode: validatedData.postalCode || ""
      })
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: ValidationErrors = {}
        error.errors.forEach((err) => {
          if (err.path[0]) errors[err.path[0].toString()] = err.message
        })
        setAddressErrors(errors)
      }
    }
  }

  const handleChangePassword = async () => {
    setPasswordErrors({})
    try {
      const validatedData = passwordSchema.parse(password)
      await changePasswordMutation.mutateAsync({
        currentPassword: validatedData.currentPassword,
        newPassword: validatedData.newPassword
      })
      setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: ValidationErrors = {}
        error.errors.forEach((err) => {
          if (err.path[0]) errors[err.path[0].toString()] = err.message
        })
        setPasswordErrors(errors)
      }
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    } catch { return dateString }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
            <DialogTitle>User Profile</DialogTitle>

        {isLoadingProfile ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : profile ? (
          <>
            {/* ── Header ── */}
            <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/70 px-6 pt-6 pb-4 shrink-0">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative group shrink-0">
                  <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                    <AvatarImage
                      src={imagePreview || profile.imagePath || user?.avatar}
                      alt={profile.fullName}
                    />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                      {profile.fullName?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="h-5 w-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    </div>
                  )}
                </div>

                {/* Name + badges */}
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-white truncate">{profile.fullName}</h2>
                  <p className="text-white/70 text-sm truncate mb-2">{profile.email}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="capitalize font-medium text-xs">
                      {profile.role}
                    </Badge>
                    {profile.active ? (
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30 text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">Inactive</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Image upload error */}
              {imageError && (
                <Alert variant="destructive" className="mt-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{imageError}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* ── Scrollable body ── */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-5">
                  <TabsTrigger value="personal" className="gap-2 text-sm">
                    <User className="h-4 w-4" />
                    Personal Info
                  </TabsTrigger>
                  <TabsTrigger value="address" className="gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    Address
                  </TabsTrigger>
                  <TabsTrigger value="security" className="gap-2 text-sm">
                    <Lock className="h-4 w-4" />
                    Security
                  </TabsTrigger>
                </TabsList>

                {/* ── Personal Info Tab ── */}
                <TabsContent value="personal" className="space-y-4 mt-0">
                  {/* Quick info row */}
                  <div className="grid grid-cols-3 gap-3 p-4 rounded-lg border bg-card">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                        <Mail className="h-3.5 w-3.5" />
                        <span>Email</span>
                      </div>
                      <p className="font-medium text-sm truncate">{profile.email}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                        <Phone className="h-3.5 w-3.5" />
                        <span>Phone</span>
                      </div>
                      <p className="font-medium text-sm">{profile.phone || 'Not provided'}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Member Since</span>
                      </div>
                      <p className="font-medium text-sm">{formatDate(profile.createdAt)}</p>
                    </div>
                  </div>

                  {/* Edit form */}
                  <div className="space-y-4 p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold">Update Personal Details</h3>
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="firstName" className="text-sm font-medium">
                          First Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          value={personalInfo.firstName}
                          onChange={(e) => {
                            setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))
                            if (personalInfoErrors.firstName) {
                              setPersonalInfoErrors(prev => { const n = { ...prev }; delete n.firstName; return n })
                            }
                          }}
                          disabled={isLoading}
                          className={`h-9 ${personalInfoErrors.firstName ? 'border-destructive' : ''}`}
                        />
                        {personalInfoErrors.firstName && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />{personalInfoErrors.firstName}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="lastName" className="text-sm font-medium">
                          Last Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          value={personalInfo.lastName}
                          onChange={(e) => {
                            setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))
                            if (personalInfoErrors.lastName) {
                              setPersonalInfoErrors(prev => { const n = { ...prev }; delete n.lastName; return n })
                            }
                          }}
                          disabled={isLoading}
                          className={`h-9 ${personalInfoErrors.lastName ? 'border-destructive' : ''}`}
                        />
                        {personalInfoErrors.lastName && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />{personalInfoErrors.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="gender" className="text-sm font-medium">
                          Gender <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={personalInfo.gender}
                          onValueChange={(value) => {
                            setPersonalInfo(prev => ({ ...prev, gender: value as "MALE" | "FEMALE" | "OTHER" }))
                            if (personalInfoErrors.gender) {
                              setPersonalInfoErrors(prev => { const n = { ...prev }; delete n.gender; return n })
                            }
                          }}
                          disabled={isLoading}
                        >
                          <SelectTrigger className={`h-9 ${personalInfoErrors.gender ? 'border-destructive' : ''}`}>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {personalInfoErrors.gender && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />{personalInfoErrors.gender}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                        <Input
                          id="phone"
                          value={personalInfo.phone}
                          onChange={(e) => {
                            setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))
                            if (personalInfoErrors.phone) {
                              setPersonalInfoErrors(prev => { const n = { ...prev }; delete n.phone; return n })
                            }
                          }}
                          placeholder="+1 234 567 8900"
                          disabled={isLoading}
                          className={`h-9 ${personalInfoErrors.phone ? 'border-destructive' : ''}`}
                        />
                        {personalInfoErrors.phone && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />{personalInfoErrors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={handleUpdatePersonalInfo}
                        disabled={isLoading || updatePersonalInfoMutation.isPending}
                        className="gap-2"
                        size="sm"
                      >
                        {updatePersonalInfoMutation.isPending ? (
                          <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>
                        ) : (
                          <><Save className="h-4 w-4" />Save Changes</>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* ── Address Tab ── */}
                <TabsContent value="address" className="mt-0">
                  <div className="space-y-4 p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold">Update Address</h3>
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="street" className="text-sm font-medium">Street Address</Label>
                      <Input
                        id="street"
                        value={address.street}
                        onChange={(e) => {
                          setAddress(prev => ({ ...prev, street: e.target.value }))
                          if (addressErrors.street) {
                            setAddressErrors(prev => { const n = { ...prev }; delete n.street; return n })
                          }
                        }}
                        disabled={isLoading}
                        className={`h-9 ${addressErrors.street ? 'border-destructive' : ''}`}
                      />
                      {addressErrors.street && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />{addressErrors.street}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="colony" className="text-sm font-medium">Colony / Neighborhood</Label>
                        <Input
                          id="colony"
                          value={address.colony}
                          onChange={(e) => {
                            setAddress(prev => ({ ...prev, colony: e.target.value }))
                            if (addressErrors.colony) {
                              setAddressErrors(prev => { const n = { ...prev }; delete n.colony; return n })
                            }
                          }}
                          disabled={isLoading}
                          className={`h-9 ${addressErrors.colony ? 'border-destructive' : ''}`}
                        />
                        {addressErrors.colony && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />{addressErrors.colony}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="municipality" className="text-sm font-medium">Municipality</Label>
                        <Input
                          id="municipality"
                          value={address.municipality}
                          onChange={(e) => {
                            setAddress(prev => ({ ...prev, municipality: e.target.value }))
                            if (addressErrors.municipality) {
                              setAddressErrors(prev => { const n = { ...prev }; delete n.municipality; return n })
                            }
                          }}
                          disabled={isLoading}
                          className={`h-9 ${addressErrors.municipality ? 'border-destructive' : ''}`}
                        />
                        {addressErrors.municipality && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />{addressErrors.municipality}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="state" className="text-sm font-medium">State / Province</Label>
                        <Input
                          id="state"
                          value={address.state}
                          onChange={(e) => {
                            setAddress(prev => ({ ...prev, state: e.target.value }))
                            if (addressErrors.state) {
                              setAddressErrors(prev => { const n = { ...prev }; delete n.state; return n })
                            }
                          }}
                          disabled={isLoading}
                          className={`h-9 ${addressErrors.state ? 'border-destructive' : ''}`}
                        />
                        {addressErrors.state && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />{addressErrors.state}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="postalCode" className="text-sm font-medium">Postal Code</Label>
                        <Input
                          id="postalCode"
                          value={address.postalCode}
                          onChange={(e) => {
                            setAddress(prev => ({ ...prev, postalCode: e.target.value }))
                            if (addressErrors.postalCode) {
                              setAddressErrors(prev => { const n = { ...prev }; delete n.postalCode; return n })
                            }
                          }}
                          disabled={isLoading}
                          className={`h-9 ${addressErrors.postalCode ? 'border-destructive' : ''}`}
                        />
                        {addressErrors.postalCode && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />{addressErrors.postalCode}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={handleUpdateAddress}
                        disabled={isLoading || updateAddressMutation.isPending}
                        className="gap-2"
                        size="sm"
                      >
                        {updateAddressMutation.isPending ? (
                          <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>
                        ) : (
                          <><Save className="h-4 w-4" />Save Address</>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* ── Security Tab ── */}
                <TabsContent value="security" className="mt-0">
                  <div className="space-y-4 p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold">Change Password</h3>
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="currentPassword" className="text-sm font-medium">
                        Current Password <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={password.currentPassword}
                        onChange={(e) => {
                          setPassword(prev => ({ ...prev, currentPassword: e.target.value }))
                          if (passwordErrors.currentPassword) {
                            setPasswordErrors(prev => { const n = { ...prev }; delete n.currentPassword; return n })
                          }
                        }}
                        disabled={isLoading}
                        className={`h-9 ${passwordErrors.currentPassword ? 'border-destructive' : ''}`}
                      />
                      {passwordErrors.currentPassword && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />{passwordErrors.currentPassword}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="newPassword" className="text-sm font-medium">
                        New Password <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={password.newPassword}
                        onChange={(e) => {
                          setPassword(prev => ({ ...prev, newPassword: e.target.value }))
                          if (passwordErrors.newPassword) {
                            setPasswordErrors(prev => { const n = { ...prev }; delete n.newPassword; return n })
                          }
                        }}
                        disabled={isLoading}
                        className={`h-9 ${passwordErrors.newPassword ? 'border-destructive' : ''}`}
                      />
                      {passwordErrors.newPassword && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />{passwordErrors.newPassword}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">
                        Confirm New Password <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={password.confirmPassword}
                        onChange={(e) => {
                          setPassword(prev => ({ ...prev, confirmPassword: e.target.value }))
                          if (passwordErrors.confirmPassword) {
                            setPasswordErrors(prev => { const n = { ...prev }; delete n.confirmPassword; return n })
                          }
                        }}
                        disabled={isLoading}
                        className={`h-9 ${passwordErrors.confirmPassword ? 'border-destructive' : ''}`}
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />{passwordErrors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <div className="rounded-lg bg-muted/50 p-3 text-sm">
                      <p className="font-medium mb-1.5 text-sm">Password requirements:</p>
                      <ul className="space-y-1 text-muted-foreground text-xs">
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          At least 8 characters
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          One uppercase and one lowercase letter
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          One number and one special character (@$!%*?&)
                        </li>
                      </ul>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={handleChangePassword}
                        disabled={isLoading || changePasswordMutation.isPending}
                        className="gap-2"
                        size="sm"
                      >
                        {changePasswordMutation.isPending ? (
                          <><Loader2 className="h-4 w-4 animate-spin" />Updating...</>
                        ) : (
                          <><Lock className="h-4 w-4" />Change Password</>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Unable to load profile information
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}