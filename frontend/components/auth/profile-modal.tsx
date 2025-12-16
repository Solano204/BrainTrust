// components/profile/profile-modal.tsx
"use client"

import { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
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
  Upload, 
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
      // Validate image
      imageUploadSchema.parse({ file })
      
      setIsUploading(true)
      await updateImageMutation.mutateAsync({
        personId: profile.personId,
        imageFile: file
      })
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
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
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleUpdatePersonalInfo = async () => {
    if (!user?.id) return
    
    setPersonalInfoErrors({})
    
    try {
      // Validate data
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
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message
          }
        })
        setPersonalInfoErrors(errors)
      }
    }
  }

  const handleUpdateAddress = async () => {
    if (!profile?.personId) return
    
    setAddressErrors({})
    
    try {
      // Validate data
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
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message
          }
        })
        setAddressErrors(errors)
      }
    }
  }

  const handleChangePassword = async () => {
    setPasswordErrors({})
    
    try {
      // Validate data
      const validatedData = passwordSchema.parse(password)
      
      await changePasswordMutation.mutateAsync({
        currentPassword: validatedData.currentPassword,
        newPassword: validatedData.newPassword
      })

      setPassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: ValidationErrors = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message
          }
        })
        setPasswordErrors(errors)
      }
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
        {isLoadingProfile ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : profile ? (
          <div className="flex flex-col h-full">
            {/* Header with Cover */}
            <div className="relative h-32 bg-gradient-to-br from-primary via-primary/90 to-primary/70">
              <div className="absolute -bottom-16 left-8 flex items-end gap-6">
                <div className="relative group">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-xl ring-4 ring-background/50">
                    <AvatarImage 
                      src={imagePreview || profile.imagePath || user?.avatar} 
                      alt={profile.fullName}
                    />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                      {profile.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="h-8 w-8 text-white" />
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
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="pb-4 flex-1">
                  <h2 className="text-2xl font-bold text-foreground">{profile.fullName}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge variant="secondary" className="capitalize font-medium">
                      {profile.role}
                    </Badge>
                    {profile.active ? (
                      <Badge className="bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20">
                        <Check className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Image Error Alert */}
            {imageError && (
              <div className="mx-8 mt-20">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{imageError}</AlertDescription>
                </Alert>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto pt-20 px-8 pb-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="personal" className="gap-2">
                    <User className="h-4 w-4" />
                    Personal Info
                  </TabsTrigger>
                  <TabsTrigger value="address" className="gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </TabsTrigger>
                  <TabsTrigger value="security" className="gap-2">
                    <Lock className="h-4 w-4" />
                    Security
                  </TabsTrigger>
                </TabsList>

                {/* Personal Info Tab */}
                <TabsContent value="personal" className="space-y-6">
                  <div className="grid gap-6">
                    <div className="grid grid-cols-3 gap-4 p-6 rounded-lg border bg-card">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Mail className="h-4 w-4" />
                          <span>Email</span>
                        </div>
                        <p className="font-medium">{profile.email}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Phone className="h-4 w-4" />
                          <span>Phone</span>
                        </div>
                        <p className="font-medium">{profile.phone || 'Not provided'}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Calendar className="h-4 w-4" />
                          <span>Member Since</span>
                        </div>
                        <p className="font-medium">{formatDate(profile.createdAt)}</p>
                      </div>
                    </div>

                    <div className="space-y-4 p-6 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Update Personal Details</h3>
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-sm font-medium">
                            First Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="firstName"
                            value={personalInfo.firstName}
                            onChange={(e) => {
                              setPersonalInfo(prev => ({ 
                                ...prev, 
                                firstName: e.target.value 
                              }))
                              if (personalInfoErrors.firstName) {
                                setPersonalInfoErrors(prev => {
                                  const newErrors = { ...prev }
                                  delete newErrors.firstName
                                  return newErrors
                                })
                              }
                            }}
                            disabled={isLoading}
                            className={`h-10 ${personalInfoErrors.firstName ? 'border-destructive' : ''}`}
                          />
                          {personalInfoErrors.firstName && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {personalInfoErrors.firstName}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-sm font-medium">
                            Last Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="lastName"
                            value={personalInfo.lastName}
                            onChange={(e) => {
                              setPersonalInfo(prev => ({ 
                                ...prev, 
                                lastName: e.target.value 
                              }))
                              if (personalInfoErrors.lastName) {
                                setPersonalInfoErrors(prev => {
                                  const newErrors = { ...prev }
                                  delete newErrors.lastName
                                  return newErrors
                                })
                              }
                            }}
                            disabled={isLoading}
                            className={`h-10 ${personalInfoErrors.lastName ? 'border-destructive' : ''}`}
                          />
                          {personalInfoErrors.lastName && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {personalInfoErrors.lastName}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="gender" className="text-sm font-medium">
                            Gender <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={personalInfo.gender}
                            onValueChange={(value) => {
                              setPersonalInfo(prev => ({ 
                                ...prev, 
                                gender: value as "MALE" | "FEMALE" | "OTHER"
                              }))
                              if (personalInfoErrors.gender) {
                                setPersonalInfoErrors(prev => {
                                  const newErrors = { ...prev }
                                  delete newErrors.gender
                                  return newErrors
                                })
                              }
                            }}
                            disabled={isLoading}
                          >
                            <SelectTrigger className={`h-10 ${personalInfoErrors.gender ? 'border-destructive' : ''}`}>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MALE">Male</SelectItem>
                              <SelectItem value="FEMALE">Female</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          {personalInfoErrors.gender && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {personalInfoErrors.gender}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-medium">
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            value={personalInfo.phone}
                            onChange={(e) => {
                              setPersonalInfo(prev => ({ 
                                ...prev, 
                                phone: e.target.value 
                              }))
                              if (personalInfoErrors.phone) {
                                setPersonalInfoErrors(prev => {
                                  const newErrors = { ...prev }
                                  delete newErrors.phone
                                  return newErrors
                                })
                              }
                            }}
                            placeholder="+1 234 567 8900"
                            disabled={isLoading}
                            className={`h-10 ${personalInfoErrors.phone ? 'border-destructive' : ''}`}
                          />
                          {personalInfoErrors.phone && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {personalInfoErrors.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button 
                          onClick={handleUpdatePersonalInfo}
                          disabled={isLoading || updatePersonalInfoMutation.isPending}
                          className="gap-2"
                        >
                          {updatePersonalInfoMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Address Tab */}
                <TabsContent value="address" className="space-y-6">
                  <div className="space-y-4 p-6 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Update Address</h3>
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="street" className="text-sm font-medium">
                        Street Address
                      </Label>
                      <Input
                        id="street"
                        value={address.street}
                        onChange={(e) => {
                          setAddress(prev => ({ 
                            ...prev, 
                            street: e.target.value 
                          }))
                          if (addressErrors.street) {
                            setAddressErrors(prev => {
                              const newErrors = { ...prev }
                              delete newErrors.street
                              return newErrors
                            })
                          }
                        }}
                        disabled={isLoading}
                        className={`h-10 ${addressErrors.street ? 'border-destructive' : ''}`}
                      />
                      {addressErrors.street && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {addressErrors.street}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="colony" className="text-sm font-medium">
                          Colony/Neighborhood
                        </Label>
                        <Input
                          id="colony"
                          value={address.colony}
                          onChange={(e) => {
                            setAddress(prev => ({ 
                              ...prev, 
                              colony: e.target.value 
                            }))
                            if (addressErrors.colony) {
                              setAddressErrors(prev => {
                                const newErrors = { ...prev }
                                delete newErrors.colony
                                return newErrors
                              })
                            }
                          }}
                          disabled={isLoading}
                          className={`h-10 ${addressErrors.colony ? 'border-destructive' : ''}`}
                        />
                        {addressErrors.colony && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {addressErrors.colony}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="municipality" className="text-sm font-medium">
                          Municipality
                        </Label>
                        <Input
                          id="municipality"
                          value={address.municipality}
                          onChange={(e) => {
                            setAddress(prev => ({ 
                              ...prev, 
                              municipality: e.target.value 
                            }))
                            if (addressErrors.municipality) {
                              setAddressErrors(prev => {
                                const newErrors = { ...prev }
                                delete newErrors.municipality
                                return newErrors
                              })
                            }
                          }}
                          disabled={isLoading}
                          className={`h-10 ${addressErrors.municipality ? 'border-destructive' : ''}`}
                        />
                        {addressErrors.municipality && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {addressErrors.municipality}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-sm font-medium">
                          State/Province
                        </Label>
                        <Input
                          id="state"
                          value={address.state}
                          onChange={(e) => {
                            setAddress(prev => ({ 
                              ...prev, 
                              state: e.target.value 
                            }))
                            if (addressErrors.state) {
                              setAddressErrors(prev => {
                                const newErrors = { ...prev }
                                delete newErrors.state
                                return newErrors
                              })
                            }
                          }}
                          disabled={isLoading}
                          className={`h-10 ${addressErrors.state ? 'border-destructive' : ''}`}
                        />
                        {addressErrors.state && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {addressErrors.state}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postalCode" className="text-sm font-medium">
                          Postal Code
                        </Label>
                        <Input
                          id="postalCode"
                          value={address.postalCode}
                          onChange={(e) => {
                            setAddress(prev => ({ 
                              ...prev, 
                              postalCode: e.target.value 
                            }))
                            if (addressErrors.postalCode) {
                              setAddressErrors(prev => {
                                const newErrors = { ...prev }
                                delete newErrors.postalCode
                                return newErrors
                              })
                            }
                          }}
                          disabled={isLoading}
                          className={`h-10 ${addressErrors.postalCode ? 'border-destructive' : ''}`}
                        />
                        {addressErrors.postalCode && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {addressErrors.postalCode}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button 
                        onClick={handleUpdateAddress}
                        disabled={isLoading || updateAddressMutation.isPending}
                        className="gap-2"
                      >
                        {updateAddressMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Address
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-6">
                  <div className="space-y-4 p-6 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Change Password</h3>
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-sm font-medium">
                        Current Password <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={password.currentPassword}
                        onChange={(e) => {
                          setPassword(prev => ({ 
                            ...prev, 
                            currentPassword: e.target.value 
                          }))
                          if (passwordErrors.currentPassword) {
                            setPasswordErrors(prev => {
                              const newErrors = { ...prev }
                              delete newErrors.currentPassword
                              return newErrors
                            })
                          }
                        }}
                        disabled={isLoading}
                        className={`h-10 ${passwordErrors.currentPassword ? 'border-destructive' : ''}`}
                      />
                      {passwordErrors.currentPassword && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {passwordErrors.currentPassword}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm font-medium">
                        New Password <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={password.newPassword}
                        onChange={(e) => {
                          setPassword(prev => ({ 
                            ...prev, 
                            newPassword: e.target.value 
                          }))
                          if (passwordErrors.newPassword) {
                            setPasswordErrors(prev => {
                              const newErrors = { ...prev }
                              delete newErrors.newPassword
                              return newErrors
                            })
                          }
                        }}
                        disabled={isLoading}
                        className={`h-10 ${passwordErrors.newPassword ? 'border-destructive' : ''}`}
                      />
                      {passwordErrors.newPassword && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {passwordErrors.newPassword}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">
                        Confirm New Password <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={password.confirmPassword}
                        onChange={(e) => {
                          setPassword(prev => ({ 
                            ...prev, 
                            confirmPassword: e.target.value 
                          }))
                          if (passwordErrors.confirmPassword) {
                            setPasswordErrors(prev => {
                              const newErrors = { ...prev }
                              delete newErrors.confirmPassword
                              return newErrors
                            })
                          }
                        }}
                        disabled={isLoading}
                        className={`h-10 ${passwordErrors.confirmPassword ? 'border-destructive' : ''}`}
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {passwordErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                    
                    <div className="rounded-lg bg-muted/50 p-4 text-sm">
                      <p className="font-medium mb-2">Password requirements:</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          At least 8 characters
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          One uppercase and one lowercase letter
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          One number and one special character (@$!%*?&)
                        </li>
                      </ul>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button 
                        onClick={handleChangePassword}
                        disabled={isLoading || changePasswordMutation.isPending}
                        className="gap-2"
                      >
                        {changePasswordMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4" />
                            Change Password
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Unable to load profile information
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}