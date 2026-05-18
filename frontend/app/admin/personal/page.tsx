
"use client"

export const dynamic = 'force-dynamic';
export const dynamic = 'force-dynamic';
import { useAuth } from "@/app/context/AuthContext"
export const dynamic = 'force-dynamic';
export const dynamic = 'force-dynamic';
import { PERMISSIONS } from "@/app/types/authentication"
export const dynamic = 'force-dynamic';
export const dynamic = 'force-dynamic';
import PersonalDataView from "@/components/admin/AdminPersonalData"
export const dynamic = 'force-dynamic';
export const dynamic = 'force-dynamic';
import { redirect } from "next/navigation"

export default function AdminUsersPage() {
    const { hasPermission, isLoading } = useAuth()

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

    return <PersonalDataView />
}