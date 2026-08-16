// ─── Auth API: GET /api/auth/me ─────────────────────────────────────────────
// Returns the authenticated user's profile from the JWT token.

import { extractUserFromRequest } from '@/lib/auth';
import { users } from '@/lib/data/seed';

export async function GET(request: Request) {
  const payload = await extractUserFromRequest(request);
  if (!payload) {
    return Response.json(
      { success: false, error: 'Unauthorized. Please log in.' },
      { status: 401 }
    );
  }

  const user = users.find((u) => u.id === payload.userId);
  if (!user) {
    return Response.json(
      { success: false, error: 'User not found.' },
      { status: 404 }
    );
  }

  return Response.json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}
