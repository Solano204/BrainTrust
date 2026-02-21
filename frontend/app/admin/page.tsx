
"use client"

import { useAuth } from "@/app/context/AuthContext"
import { PERMISSIONS } from "@/app/types/authentication"
import { redirect } from "next/navigation"
import Link from "next/link"
import { 
    Users, 
    BookOpen, 
    BarChart3, 
    Settings,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect } from "react"


function normalizeRole(role: string | undefined): string {
    if (!role) return 'student';
    
    const roleStr = String(role).toLowerCase().trim();
    
    const roleMap: { [key: string]: string } = {
        'admin': 'admin',
        'ADMIN': 'ADMIN',
        'administrator': 'admin',
        'administrador': 'admin',
        'teacher': 'teacher',
        'profesor': 'teacher',
        'student': 'student',
        'estudiante': 'student',
        'alumno': 'student'
    };
    
    return roleMap[roleStr] || 'student';
}

export default function AdminDashboardPage() {
    const { user, hasPermission, isLoading } = useAuth()


    useEffect(() => {
        console.log('=== ADMIN PAGE MOUNTED ===');
        console.log('User:', user);
        console.log('Is Loading:', isLoading);
        if (user) {
            console.log('User role (raw):', user.role);
            console.log('User role (normalized):', normalizeRole(user.role));
            console.log('User permissions:', user.permissions);
        }
        console.log('=========================');
    }, [user, isLoading]);


    if (isLoading) {
        console.log('⏳ Still loading...');
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    const normalizedRole = normalizeRole(user?.role);

    if (!user || normalizedRole !== 'admin') {
        console.log('❌ Access denied. Redirecting to home.');
        console.log('User exists:', !!user);
        console.log('Normalized role:', normalizedRole);
        redirect("/")
    }

    console.log('✅ Admin access granted! Rendering dashboard...');

    const adminModules = [
        {
            title: "User Management",
            description: "Manage users, roles and permissions",
            icon: Users,
            href: "/admin/users",
            permission: PERMISSIONS.USER_MANAGEMENT,
            color: "text-blue-500"
        },
        {
            title: "Courses Management",
            description: "Create and manage courses",
            icon: BookOpen,
            href: "/admin/courses",
            permission: PERMISSIONS.SYSTEM_SETTINGS,
            color: "text-green-500"
        },
        {
            title: "Reports & Analytics",
            description: "View system reports and analytics",
            icon: BarChart3,
            href: "/admin/reports",
            permission: PERMISSIONS.VIEW_REPORTS,
            color: "text-purple-500"
        }
    ]

    return (
        <div className="container mx-auto py-8 px-4">

            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, {user.name}! Manage your system from here.
                </p>


                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg text-sm space-y-2">
                    <p className="font-semibold text-blue-900 dark:text-blue-100">🔍 Debug Info:</p>
                    <p><strong>Raw role:</strong> <span className="font-mono">{user.role}</span></p>
                    <p><strong>Normalized role:</strong> <span className="font-mono">{normalizedRole}</span></p>
                    <p><strong>Permissions:</strong> <span className="font-mono text-xs">{user.permissions?.join(', ')}</span></p>
                    <p><strong>Has USER_MANAGEMENT:</strong> {hasPermission(PERMISSIONS.USER_MANAGEMENT) ? '✅ Yes' : '❌ No'}</p>
                    <p><strong>Has SYSTEM_SETTINGS:</strong> {hasPermission(PERMISSIONS.SYSTEM_SETTINGS) ? '✅ Yes' : '❌ No'}</p>
                    <p><strong>Has VIEW_REPORTS:</strong> {hasPermission(PERMISSIONS.VIEW_REPORTS) ? '✅ Yes' : '❌ No'}</p>
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Users
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,248</div>
                        <p className="text-xs text-muted-foreground">
                            System users
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Courses
                        </CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">42</div>
                        <p className="text-xs text-muted-foreground">
                            Active courses
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            System Health
                        </CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Online</div>
                        <p className="text-xs text-muted-foreground">
                            All systems operational
                        </p>
                    </CardContent>
                </Card>
            </div>


            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Admin Modules</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {adminModules.map((module) => {
                        const Icon = module.icon
                        const hasAccess = hasPermission(module.permission)

                        console.log(`Module: ${module.title}, Has Access: ${hasAccess}`);

                        return (
                            <Link 
                                key={module.href} 
                                href={hasAccess ? module.href : "#"}
                                className={!hasAccess ? "pointer-events-none opacity-50" : ""}
                            >
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 ${module.color}`}>
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">
                                                    {module.title}
                                                </CardTitle>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription>
                                            {module.description}
                                        </CardDescription>
                                        {!hasAccess && (
                                            <p className="text-xs text-destructive mt-2">
                                                ⚠️ No permission
                                            </p>
                                        )}
                                        {hasAccess && (
                                            <p className="text-xs text-green-600 mt-2">
                                                ✅ Access granted
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            </div>


            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                        Common administrative tasks
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        {hasPermission(PERMISSIONS.USER_MANAGEMENT) && (
                            <Link href="/admin/users">
                                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                                    Add New User
                                </button>
                            </Link>
                        )}
                        {hasPermission(PERMISSIONS.SYSTEM_SETTINGS) && (
                            <Link href="/admin/courses">
                                <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors">
                                    Create Course
                                </button>
                            </Link>
                        )}
                        {hasPermission(PERMISSIONS.VIEW_REPORTS) && (
                            <Link href="/admin/reports">
                                <button className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors">
                                    View Reports
                                </button>
                            </Link>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}