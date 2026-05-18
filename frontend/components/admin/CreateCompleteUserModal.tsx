'use client';

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
import { Loader2, MapPin, UserPlus } from "lucide-react";
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
    
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    
    if (formData.password.length < 8) {
      alert("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    
    if (!isValidEmail(formData.email)) {
      alert("Por favor ingresa un correo válido");
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
    <DialogContent className="rounded-3xl border-border bg-card p-0 overflow-hidden max-w-2xl max-h-[90vh]">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border sticky top-0 bg-card z-10 rounded-t-3xl">
        <span className="w-9 h-9 rounded-2xl flex items-center justify-center bg-primary/10 flex-shrink-0">
          <UserPlus className="h-4 w-4 text-primary" />
        </span>
        <div>
          <h2 className="text-base font-bold text-foreground tracking-tight">
            Crear Usuario Completo
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Crea un nuevo usuario con toda la información personal
          </p>
        </div>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 overflow-y-auto max-h-[calc(90vh-80px)]">

        {/* Personal info */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Información Personal
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-semibold text-foreground">Nombre *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  required
                  placeholder="Juan"
                  className="rounded-xl border-border bg-background focus:ring-ring/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-semibold text-foreground">Apellido *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  required
                  placeholder="Pérez"
                  className="rounded-xl border-border bg-background focus:ring-ring/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="gender" className="text-xs font-semibold text-foreground">Género</Label>
                <Select value={formData.gender} onValueChange={(v) => handleChange("gender", v)}>
                  <SelectTrigger className="rounded-xl border-border bg-background focus:ring-ring/50">
                    <SelectValue placeholder="Seleccionar género" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border bg-card">
                    <SelectItem value="MALE">Masculino</SelectItem>
                    <SelectItem value="FEMALE">Femenino</SelectItem>
                    <SelectItem value="OTHER">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-foreground">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+1234567890"
                  className="rounded-xl border-border bg-background focus:ring-ring/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Account info */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Información de la Cuenta
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-foreground">Correo *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  placeholder="usuario@ejemplo.com"
                  className="rounded-xl border-border bg-background focus:ring-ring/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-xs font-semibold text-foreground">Rol *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(v: "STUDENT" | "TEACHER" | "ADMIN") => handleChange("role", v)}
                >
                  <SelectTrigger className="rounded-xl border-border bg-background focus:ring-ring/50">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border bg-card">
                    <SelectItem value="STUDENT">Estudiante</SelectItem>
                    <SelectItem value="TEACHER">Profesor</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.role === 'STUDENT' && (
              <div className="space-y-1.5">
                <Label htmlFor="studentId" className="text-xs font-semibold text-foreground">ID de Estudiante (Opcional)</Label>
                <Input
                  id="studentId"
                  value={formData.studentId}
                  onChange={(e) => handleChange("studentId", e.target.value)}
                  placeholder="ej. E123456"
                  className="rounded-xl border-border bg-background focus:ring-ring/50"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-foreground">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                  className="rounded-xl border-border bg-background focus:ring-ring/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground">Confirmar Contraseña *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  required
                  placeholder="Confirmar contraseña"
                  className="rounded-xl border-border bg-background focus:ring-ring/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" />
            Información de Dirección
            <span className="normal-case font-normal text-muted-foreground/60">(Opcional)</span>
          </h3>
          <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="addressStreet" className="text-xs font-semibold text-foreground">Calle</Label>
              <Input
                id="addressStreet"
                value={formData.addressStreet}
                onChange={(e) => handleChange("addressStreet", e.target.value)}
                placeholder="Av. Principal 123"
                className="rounded-xl border-border bg-background focus:ring-ring/50"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="addressColony" className="text-xs font-semibold text-foreground">Colonia / Barrio</Label>
                <Input
                  id="addressColony"
                  value={formData.addressColony}
                  onChange={(e) => handleChange("addressColony", e.target.value)}
                  placeholder="Centro"
                  className="rounded-xl border-border bg-background focus:ring-ring/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="addressMunicipality" className="text-xs font-semibold text-foreground">Municipio</Label>
                <Input
                  id="addressMunicipality"
                  value={formData.addressMunicipality}
                  onChange={(e) => handleChange("addressMunicipality", e.target.value)}
                  placeholder="Ciudad"
                  className="rounded-xl border-border bg-background focus:ring-ring/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="addressState" className="text-xs font-semibold text-foreground">Estado / Provincia</Label>
                <Input
                  id="addressState"
                  value={formData.addressState}
                  onChange={(e) => handleChange("addressState", e.target.value)}
                  placeholder="Estado"
                  className="rounded-xl border-border bg-background focus:ring-ring/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="addressPostalCode" className="text-xs font-semibold text-foreground">Código Postal</Label>
                <Input
                  id="addressPostalCode"
                  value={formData.addressPostalCode}
                  onChange={(e) => handleChange("addressPostalCode", e.target.value)}
                  placeholder="12345"
                  className="rounded-xl border-border bg-background focus:ring-ring/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={createCompleteUser.isPending}
            className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-40 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={createCompleteUser.isPending}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {createCompleteUser.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Creando...</>
            ) : (
              "Crear Usuario"
            )}
          </button>
        </div>

      </form>
    </DialogContent>
  </Dialog>
);
}