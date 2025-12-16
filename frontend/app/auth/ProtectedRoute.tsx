// components/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'teacher' | 'student';
  requiredPermissions?: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredPermissions = [],
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasPermission, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Redirect if not authenticated
      if (!isAuthenticated) {
        const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(window.location.pathname)}`;
        router.push(redirectUrl);
        return;
      }

      // Check role requirement
      if (requiredRole && user && !hasRole(requiredRole)) {
        router.push('/unauthorized');
        return;
      }

      // Check permission requirements
      if (requiredPermissions.length > 0 && user) {
        const hasAllPermissions = requiredPermissions.every(permission => 
          hasPermission(permission)
        );
        
        if (!hasAllPermissions) {
          router.push('/unauthorized');
          return;
        }
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, requiredPermissions, router, redirectTo, hasRole, hasPermission]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render children if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Check permissions if user exists
  if (user) {
    if (requiredRole && !hasRole(requiredRole)) {
      return null; // Will redirect in useEffect
    }

    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission => 
        hasPermission(permission)
      );
      
      if (!hasAllPermissions) {
        return null; // Will redirect in useEffect
      }
    }
  }

  return <>{children}</>;
}