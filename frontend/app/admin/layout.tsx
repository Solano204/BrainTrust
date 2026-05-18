
"use client"

import { useState } from "react"
import { useAuth } from "@/app/context/AuthContext"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";

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

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [activeView, setActiveView] = useState("Dashboard")
    const { user, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    const normalizedRole = normalizeRole(user?.role);
    
    console.log('=== ADMIN LAYOUT DEBUG ===');
    console.log('User role (raw):', user?.role);
    console.log('User role (normalized):', normalizedRole);
    console.log('========================');

    if (normalizedRole !== 'admin') {
        console.log('❌ Admin layout access denied. Redirecting...');
        redirect("/")
    }

    return (
        <div className="min-h-screen bg-background">

            <DashboardSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                activeView={activeView}
                onNavigate={setActiveView}
                userRole={user?.role || 'admin'}
            />

            <div className="lg:pl-64">

                <DashboardHeader
                    onMenuClick={() => setSidebarOpen(true)}

                />


                <main className="py-6">
                    {children}
                </main>
            </div>
        </div>
    )
}