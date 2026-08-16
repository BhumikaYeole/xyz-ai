import { authenticateUser, generateToken, ROLE_PORTAL } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
    }

    const user = authenticateUser(email, password);
    if (!user) {
      return Response.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
    }

    const token = await generateToken(user);
    const redirectTo = ROLE_PORTAL[user.role];

    const response = Response.json({
      success: true,
      data: { token, redirectTo, user: { id: user.id, name: user.name, email: user.email, role: user.role } },
    });

    // Set httpOnly cookie so the proxy can read it for route protection
    (response.headers as Headers).append(
      'Set-Cookie',
      `xyz-ai-token=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400`
    );

    return response;
  } catch {
    return Response.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}
