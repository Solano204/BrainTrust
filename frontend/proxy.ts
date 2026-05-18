// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Role-based route configuration
const roleBasedRoutes = {
  admin: [
    '/admin',
    '/admin/dashboard',
    '/admin/users',
    '/admin/courses',
    '/admin/catalogs',
    '/admin/analytics',
    '/admin/settings',
    '/admin/personal',
    '/admin/activities'
  ],
  teacher: [
    "/",
    "/calendar",
    '/teacher',
    '/teacher/dashboard',
    '/courses',
    '/teacher/students',
    '/teacher/grades',
    '/teacher/assignments'
  ],
  student: [
    "/",
    '/courses',
    '/calendar',
    '/student/dashboard',
    '/student/courses',
    '/student/grades',
    '/student/assignments',
    '/student/profile'
  ],
  public: [
    '/auth/login',  // ⚠️ Cambié de '/login' a '/auth/login'
    '/auth/register',  // ⚠️ Cambié de '/register' a '/auth/register'
  ]
} as const;

// Routes accessible by multiple roles
const sharedRoutes = [
  '/profile',
  '/settings',
  '/messages',
  '/notifications',
  '/calendar'
];

// ⚠️ CAMBIO PRINCIPAL: Renombré de 'proxy' a 'middleware'
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if it's a public route (EXACT MATCH)
  if (roleBasedRoutes.public.includes(pathname as any)) {
    return NextResponse.next();
  }

  // Get user data from cookies
  const userDataCookie = request.cookies.get('user_data');
  let userRole = 'guest';
  let userId = '';

  if (userDataCookie) {
    try {
      const userData = JSON.parse(userDataCookie.value);
      userRole = userData.role?.toLowerCase() || 'guest';
      userId = userData.id || '';
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }

  // If no user data, redirect to login
  if (!userDataCookie) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  console.log(`User role: ${userRole}, User ID: ${userId}`);
  
  // Check if route requires specific role
  const checkRouteAccess = () => {
    // Check if it's a shared route (EXACT MATCH)
    if (sharedRoutes.includes(pathname)) {
      console.log('Access granted to shared route:', pathname);
      return userRole !== 'guest'; // Any authenticated user can access
    }

    // Check admin routes (EXACT MATCH)
    if (roleBasedRoutes.admin.includes(pathname as any) && userRole === 'admin') {
      console.log('Access granted to admin route:', pathname);
      return true;
    }

    // Check teacher routes (EXACT MATCH)
    if ((pathname.includes("/courses") ||  roleBasedRoutes.teacher.includes(pathname as any)) && (userRole === 'teacher')) {
      console.log('Access granted to teacher route:', pathname);
      return true;
    }


     if ((pathname.includes("/courses") ||  roleBasedRoutes.teacher.includes(pathname as any)) && (userRole === 'student')) {
      console.log('Access granted to student route:', pathname);
      return true;
    }
    
    console.warn(`Access denied for role: ${userRole} on path: ${pathname}`);
    return false;
  };

  const hasAccess = checkRouteAccess();

  if (!hasAccess) {
    console.warn(`Access denied for role: ${userRole} on path: ${pathname}`);
    // Redirect to appropriate dashboard based on role
    // if (userRole === 'teacher') {
    //   return NextResponse.redirect(new URL('/', request.url));
    // } else if (userRole === 'student') {
    //   return NextResponse.redirect(new URL('/', request.url));
    // } else if (userRole === 'admin') {
    //   return NextResponse.redirect(new URL('/admin/users', request.url));
    // }

    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};