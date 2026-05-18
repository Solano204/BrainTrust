
"use client"

 
 
import { useAuth } from "@/app/context/AuthContext"
 
 
import { PERMISSIONS } from "@/app/types/authentication"
 
 
import PersonalDataView from "@/components/admin/AdminPersonalData"
 
 
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