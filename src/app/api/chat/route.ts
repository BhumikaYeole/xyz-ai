import { extractUserFromRequest } from '@/lib/auth';
import { orchestrateChat } from '@/lib/ai-orchestrator';

export async function POST(request: Request) {
  try {
    const payload = await extractUserFromRequest(request);
    if (!payload) {
      return Response.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const { message, sessionId, language = 'en' } = body;

    if (!message || typeof message !== 'string') {
      return Response.json({ success: false, error: 'Message is required.' }, { status: 400 });
    }

    const result = await orchestrateChat({
      userId: payload.userId,
      role: payload.role,
      sessionId,
      message,
      language,
    });

    return Response.json({
      success: true,
      data: {
        role: 'assistant',
        content: result.content,
        sessionId: result.sessionId,
        requiresInput: result.requiresInput,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[Chat API Error]:', error);
    return Response.json({
      success: false,
      error: error?.message || 'An unexpected internal error occurred.',
    }, { status: 500 });
  }
}
