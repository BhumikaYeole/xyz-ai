import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { JWT_SECRET } from '@/lib/auth';

// Routes that require auth and the role that owns them
const PORTAL_ROLES: Record<string, string> = {
  '/student-portal': 'student',
  '/parent-portal': 'parent',
  '/staff-portal': 'teacher',
  '/management-portal': 'principal',
};

const ROLE_PORTAL: Record<string, string> = {
  student: '/student-portal',
  parent: '/parent-portal',
  teacher: '/staff-portal',
  principal: '/management-portal',
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Find which portal this path belongs to
  const portalBase = Object.keys(PORTAL_ROLES).find((p) => pathname.startsWith(p));
  if (!portalBase) return NextResponse.next();

  // Extract token from cookie
  const token = request.cookies.get('xyz-ai-token')?.value;

  if (!token) {
    // Not logged in → redirect to login with return destination
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userRole = payload.role as string;
    const requiredRole = PORTAL_ROLES[portalBase];

    if (userRole !== requiredRole) {
      // Wrong role → redirect to their own portal
      const correctPortal = ROLE_PORTAL[userRole] ?? '/login';
      return NextResponse.redirect(new URL(correctPortal, request.url));
    }

    return NextResponse.next();
  } catch {
    // Invalid/expired token → redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/student-portal/:path*',
    '/parent-portal/:path*',
    '/staff-portal/:path*',
    '/management-portal/:path*',
  ],
};
