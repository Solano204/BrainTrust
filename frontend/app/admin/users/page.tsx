// ==========================================
// ✅ ARCHIVO 1: src/app/admin/users/page.tsx
// ==========================================

"use client"

import { useAuth } from "@/app/context/AuthContext"
import { PERMISSIONS } from "@/app/types/authentication"
import { redirect } from "next/navigation"
import AdminUsersModule from "@/app/features/admin/components/users/UsersManagement"

export default function AdminUsersPage() {
    const { hasPermission, isLoading } = useAuth()

    // Verificar permisos
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!hasPermission(PERMISSIONS.USER_MANAGEMENT)) {
        redirect("/")
    }

    return <AdminUsersModule />
}