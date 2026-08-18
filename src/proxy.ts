import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'xyz-ai'
);


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


  const portalBase = Object.keys(PORTAL_ROLES).find((p) => pathname.startsWith(p));
  if (!portalBase) return NextResponse.next();


  const token = request.cookies.get('xyz-ai-token')?.value;

  if (!token) {

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const userRole = payload.role as string;
    const requiredRole = PORTAL_ROLES[portalBase];

    if (userRole !== requiredRole) {

      const correctPortal = ROLE_PORTAL[userRole] ?? '/login';
      return NextResponse.redirect(new URL(correctPortal, request.url));
    }

    return NextResponse.next();
  } catch {

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
