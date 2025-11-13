// components/Auth/RouteGuard.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { PERMISSIONS, UserRole } from '@/app/types/authentication';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: UserRole;
  fallbackPath?: string;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requiredPermission,
  requiredRole,
  fallbackPath = '/unauthorized',
}) => {
  const { isAuthenticated, isLoading, user, hasPermission, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (requiredRole && user && !hasRole(requiredRole)) {
      router.push(fallbackPath);
      return;
    }

    if (requiredPermission && user && !hasPermission(requiredPermission)) {
      router.push(fallbackPath);
      return;
    }
  }, [
    isAuthenticated, 
    isLoading, 
    user, 
    requiredPermission, 
    requiredRole, 
    router, 
    pathname, 
    fallbackPath,
    hasPermission,
    hasRole
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || 
      (requiredRole && user && !hasRole(requiredRole)) ||
      (requiredPermission && user && !hasPermission(requiredPermission))) {
    return null;
  }

  return <>{children}</>;
};

// Convenience components
export const AdminOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteGuard requiredRole="admin">
    {children}
  </RouteGuard>
);

export const TeacherOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteGuard requiredRole="teacher">
    {children}
  </RouteGuard>
);

export const StudentOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteGuard requiredRole="student">
    {children}
  </RouteGuard>
);

export const WithPermission: React.FC<{ 
  children: React.ReactNode;
  permission: string;
}> = ({ children, permission }) => (
  <RouteGuard requiredPermission={permission}>
    {children}
  </RouteGuard>
);