"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from 'next/image';
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<'student' | 'teacher'>('student');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);

    const { login, register, isAuthenticated } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    useEffect(() => {
        if (isAuthenticated) {
            router.push(redirect);
        }
    }, [isAuthenticated, router, redirect]);

    if (isAuthenticated) {
        return null;
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const result = await login(email, password);

        if (result.success && result.user) {
            // 🔍 DEBUG: Ver qué rol viene del backend
            console.log('=== LOGIN DEBUG ===');
            console.log('Full user object:', result.user);
            console.log('User role:', result.user.role);
            console.log('User role type:', typeof result.user.role);
            console.log('==================');

            const userRole = result.user.role;
            
            let destination = '/';
            
            // 🔧 MEJORADO: Verificar rol de forma más flexible
            const roleStr = String(userRole).toLowerCase();
            
            if (roleStr === 'admin' || roleStr === 'administrator') {
                destination = '/admin';
            } else if (roleStr === 'teacher') {
                destination = '/teacher';
            } else if (roleStr === 'student') {
                destination = '/student';
            } else {
                // Fallback: si no reconoce el rol, ir a home
                destination = '/';
            }
            
            console.log('🎯 Redirecting to:', destination, 'User role:', userRole);
            router.push(destination);
        } else {
            setError(result.error || 'Login failed');
        }

        setIsLoading(false);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const result = await register({ email, password, name, role });

        if (result.success) {
            router.push(redirect);
        } else {
            setError(result.error || 'Registration failed');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <div className="flex justify-center pt-6 pb-2">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <Image
                            src="/Img/Logo.png"
                            alt="Logo"
                            width={90}
                            height={90}
                            className="rounded-full"
                            priority />
                    </div>
                </div>

                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">BrainTrust</CardTitle>
                    <CardDescription>
                        Welcome to the Educational Learning Management System
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="register">Register</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <div className="space-y-4">
                                {error && (
                                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="login-email">Email</Label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="login-password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="login-password"
                                            type={showLoginPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                        >
                                            {showLoginPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleLogin}
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Signing in...
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </Button>

                                <div className="text-center text-sm text-muted-foreground">
                                    <p>Demo Accounts:</p>
                                    <p>Admin: admin@school.com / admin123</p>
                                    <p>Teacher: teacher@school.com / teacher123</p>
                                    <p>Student: student@school.com / student123</p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="register">
                            <div className="space-y-4">
                                {error && (
                                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="register-name">Full Name</Label>
                                    <Input
                                        id="register-name"
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-email">Email</Label>
                                    <Input
                                        id="register-email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="register-password"
                                            type={showRegisterPassword ? "text" : "password"}
                                            placeholder="Create a password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                        >
                                            {showRegisterPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-role">Role</Label>
                                    <select
                                        id="register-role"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value as 'student' | 'teacher')}
                                        required
                                    >
                                        <option value="student">Student</option>
                                        <option value="teacher">Teacher</option>
                                    </select>
                                </div>

                                <Button
                                    onClick={handleRegister}
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Creating account...
                                        </>
                                    ) : (
                                        'Create Account'
                                    )}
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}