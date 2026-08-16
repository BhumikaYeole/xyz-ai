// ─── Chat API stub: POST /api/chat ──────────────────────────────────────────
// Placeholder for Phase 4 — the AI orchestration layer.
// For now returns a stub response acknowledging the message.

import { extractUserFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
  const payload = await extractUserFromRequest(request);
  if (!payload) {
    return Response.json(
      { success: false, error: 'Unauthorized.' },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { message } = body;

  if (!message) {
    return Response.json(
      { success: false, error: 'Message is required.' },
      { status: 400 }
    );
  }

  // Stub response — will be replaced by LLM orchestration in Phase 4
  return Response.json({
    success: true,
    data: {
      role: 'assistant',
      content: `[Phase 4 placeholder] I received your message as a ${payload.role}: "${message}". The AI orchestration layer will be built in Phase 4.`,
      timestamp: new Date().toISOString(),
    },
  });
}
