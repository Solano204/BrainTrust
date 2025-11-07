"use client"

import { AdminHeader } from "@components/layout/AdminHeader/AdminHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@components/common/ui/card"
import { Button } from "@components/common/ui/button"
import { Input } from "@components/common/ui/input"
import { Label } from "@components/common/ui/label"
import { User, Mail, Phone, Building, Calendar, Shield, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PerfilPage() {
    const router = useRouter()

    const handleLogout = () => {
        router.push("/login")
    }

    return (
        <div className="min-h-screen bg-background">
            <AdminHeader />

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-foreground mb-2">Perfil del Director</h1>
                            <p className="text-muted-foreground">Gestiona tu información personal y configuración</p>
                        </div>
                        <Button variant="destructive" onClick={handleLogout} className="gap-2">
                            <LogOut className="w-4 h-4" />
                            Cerrar Sesión
                        </Button>
                    </div>

                    {/* Profile Card */}
                    <Card className="border-2">
                        <CardHeader className="bg-primary/5 border-b">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                                    <User className="w-10 h-10 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">Dr. Juan Carlos Rodríguez</CardTitle>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Shield className="w-4 h-4 text-primary" />
                                        <span className="text-sm text-muted-foreground font-semibold">Director / Administrador</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Personal Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                        <User className="w-5 h-5 text-primary" />
                                        Información Personal
                                    </h3>

                                    <div className="space-y-2">
                                        <Label htmlFor="nombre">Nombre Completo</Label>
                                        <Input id="nombre" defaultValue="Juan Carlos Rodríguez" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Correo Electrónico</Label>
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                            <Input id="email" type="email" defaultValue="director@universidad.edu" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="telefono">Teléfono</Label>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-muted-foreground" />
                                            <Input id="telefono" type="tel" defaultValue="+52 555 123 4567" />
                                        </div>
                                    </div>
                                </div>

                                {/* Professional Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                        <Building className="w-5 h-5 text-primary" />
                                        Información Profesional
                                    </h3>

                                    <div className="space-y-2">
                                        <Label htmlFor="institucion">Institución</Label>
                                        <Input id="institucion" defaultValue="Universidad Nacional de Educación" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="departamento">Departamento</Label>
                                        <Input id="departamento" defaultValue="Dirección Académica" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="fecha-ingreso">Fecha de Ingreso</Label>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <Input id="fecha-ingreso" type="date" defaultValue="2020-01-15" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 mt-8 pt-6 border-t">
                                <Button className="flex-1 bg-primary hover:bg-primary/90">Guardar Cambios</Button>
                                <Button variant="outline" className="flex-1 bg-transparent">
                                    Cancelar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Card */}
                    <Card className="border-2">
                        <CardHeader className="bg-primary/5 border-b">
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                Seguridad
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password-actual">Contraseña Actual</Label>
                                    <Input id="password-actual" type="password" placeholder="••••••••" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password-nueva">Nueva Contraseña</Label>
                                    <Input id="password-nueva" type="password" placeholder="••••••••" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password-confirmar">Confirmar Nueva Contraseña</Label>
                                    <Input id="password-confirmar" type="password" placeholder="••••••••" />
                                </div>

                                <Button className="w-full bg-primary hover:bg-primary/90 mt-4">Cambiar Contraseña</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
