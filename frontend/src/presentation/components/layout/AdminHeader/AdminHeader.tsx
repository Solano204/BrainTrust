"use client"

import Link from "next/link"
import { GraduationCap, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Image from "next/image"

export function AdminHeader() {
    const pathname = usePathname()

    const navItems = [
        { href: "/dashboard", label: "INICIO" },
        { href: "/gestion-usuarios", label: "GESTION DE USUARIOS" },
        { href: "/gestion-academica", label: "GESTION ACADEMICA" },
    ]

    return (
        <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">

                    {/* Logo */}
                    {/* Logo Section */}
                    <div className="flex justify-center mb-2">
                        <div className="bg-primary/10 border-2 border-primary rounded-lg p-4 w-22 h-22 flex items-center justify-center">
                            <Image
                                src="/Img/Logo.png"
                                alt="BrainTrust Academy Logo"
                                width={100}
                                height={100}
                                className="mx-auto rounded-lg"
                                priority
                            />
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex items-center gap-2">
                        {navItems.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "font-semibold text-xs px-6 h-10",
                                        pathname === item.href ? "bg-secondary text-secondary-foreground" : "hover:bg-secondary/50",
                                    )}
                                >
                                    {item.label}
                                </Button>
                            </Link>
                        ))}
                    </nav>

                    {/* Profile Button */}
                    <Link href="/perfil">
                        <Button
                            variant="default"
                            className="bg-foreground text-background hover:bg-foreground/90 font-semibold px-6"
                        >
                            <User className="w-4 h-4 mr-2" />
                            PERFIL
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    )
}
