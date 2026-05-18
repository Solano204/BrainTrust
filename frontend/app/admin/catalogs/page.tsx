
"use client"

import { useAuth } from "@/app/context/AuthContext"
import { PERMISSIONS } from "@/app/types/authentication"
import { redirect } from "next/navigation"
import AdminUsersModule from "@/components/admin/AdminUsersModule"
import CatalogManager from "@/components/admin/CatalogManager"

export default function AdminCatalogsPage() {
    const { hasPermission, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!hasPermission(PERMISSIONS.CATALOG_MANAGEMENT)) {
        redirect("/")
    }

    return <CatalogManager />
}