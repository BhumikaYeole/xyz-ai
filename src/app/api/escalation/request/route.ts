// ─── Escalation API: POST /api/escalation/request ───────────────────────────
// Creates a mock call/support request to a teacher or school management.
// Available to: students, parents (not teachers/principal — they ARE the target)
// Returns a confirmation object; never claims success unless confirmed.

import { extractUserFromRequest } from '@/lib/auth';
import { escalationRequests, users } from '@/lib/data/seed';
import { EscalationRequest } from '@/lib/types';

export async function POST(request: Request) {
  const payload = await extractUserFromRequest(request);
  if (!payload) {
    return Response.json(
      { success: false, error: 'Unauthorized.' },
      { status: 401 }
    );
  }

  // Only students and parents can escalate
  if (!['student', 'parent'].includes(payload.role)) {
    return Response.json(
      {
        success: false,
        error: 'Escalation is only available for students and parents.',
      },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { targetType, reason, studentId } = body;

  if (!targetType || !['teacher', 'management'].includes(targetType)) {
    return Response.json(
      {
        success: false,
        error: 'targetType must be "teacher" or "management".',
      },
      { status: 400 }
    );
  }

  if (!reason) {
    return Response.json(
      { success: false, error: 'A reason for escalation is required.' },
      { status: 400 }
    );
  }

  const user = users.find((u) => u.id === payload.userId);
  if (!user) {
    return Response.json(
      { success: false, error: 'User not found.' },
      { status: 403 }
    );
  }

  if (studentId) {
    const linkedIds = user.linkedStudentIds ?? [];
    const classIds = user.classStudentIds ?? [];
    const allowedStudentIds = [...linkedIds, ...classIds];

    if (payload.role === 'student' && !user.linkedStudentIds?.includes(studentId)) {
      return Response.json(
        { success: false, error: 'Access denied. You can only escalate for your own student profile.' },
        { status: 403 }
      );
    }

    if (payload.role === 'parent' && !user.linkedStudentIds?.includes(studentId)) {
      return Response.json(
        { success: false, error: 'Access denied. You can only escalate for your linked child.' },
        { status: 403 }
      );
    }

    if (allowedStudentIds.length > 0 && !allowedStudentIds.includes(studentId) && !['teacher', 'principal'].includes(payload.role)) {
      return Response.json(
        { success: false, error: 'Access denied. This student is not associated with your account.' },
        { status: 403 }
      );
    }
  }

  // Create the escalation request
  const escalation: EscalationRequest = {
    id: `esc-${Date.now()}`,
    requestedBy: payload.userId,
    requestedByRole: payload.role,
    targetType,
    studentId: studentId || undefined,
    reason,
    status: 'confirmed', // Mock service "confirms" immediately
    createdAt: new Date().toISOString(),
    confirmedAt: new Date().toISOString(),
  };

  escalationRequests.push(escalation);

  // Return the confirmation object — the AI layer should only claim success
  // because this object contains status: 'confirmed'
  return Response.json({
    success: true,
    message: `Your ${targetType === 'teacher' ? 'call request has been submitted to the teacher' : 'support request has been submitted to school management'}.`,
    data: escalation,
  });
}
