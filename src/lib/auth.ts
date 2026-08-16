import { SignJWT, jwtVerify } from 'jose';
import { AuthPayload, UserRole, User } from './types';
import { users } from './data/seed';

export const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'xyz-ai'
);
const EXPIRY = '24h';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  student: ['view_own_attendance'],
  parent: ['view_child_attendance'],
  teacher: ['view_class_attendance', 'mark_attendance'],
  principal: ['view_overall_attendance', 'view_any_attendance'],
};

export function hasPermission(role: UserRole, action: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(action) ?? false;
}

export async function generateToken(user: User): Promise<string> {
  return new SignJWT({ userId: user.id, role: user.role, name: user.name } as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const validRoles: UserRole[] = ['student', 'parent', 'teacher', 'principal'];
    if (!validRoles.includes(payload.role as UserRole)) return null;
    return payload as unknown as AuthPayload;
  } catch {
    return null;
  }
}

export function authenticateUser(email: string, password: string): User | null {
  return users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  ) ?? null;
}

export async function extractUserFromRequest(request: Request): Promise<AuthPayload | null> {
  // Check Authorization header first, then cookie
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return verifyToken(authHeader.slice(7));
  }
  const cookie = request.headers.get('cookie') ?? '';
  const match = cookie.match(/xyz-ai-token=([^;]+)/);
  if (match) return verifyToken(decodeURIComponent(match[1]));
  return null;
}

// Role → default portal path mapping
export const ROLE_PORTAL: Record<UserRole, string> = {
  student: '/student-portal',
  parent: '/parent-portal',
  teacher: '/staff-portal',
  principal: '/management-portal',
};
