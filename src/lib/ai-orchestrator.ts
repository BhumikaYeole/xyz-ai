import { attendanceRecords, escalationRequests, students, users } from './data/seed';
import { getConversationHistory, saveConversationHistory, type ChatMessage } from './conversation-store';
import { AttendanceRecord, EscalationRequest, UserRole } from './types';

export type ToolName = 'getAttendance' | 'markAttendance' | 'getOverallAttendance' | 'requestEscalation';

export type ToolDefinition = {
  name: ToolName;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, { type: string; description: string; }>; 
    required?: string[];
  };
};

export const PERSONAS: Record<UserRole, string> = {
  student: 'You are a helpful student support assistant. Answer using only the student\'s own records and ask for clarification before making assumptions.',
  parent: 'You are a family support assistant. Keep answers calm and concise, and only discuss the parent\'s linked child\'s data.',
  teacher: 'You are a classroom operations assistant. Use the teacher\'s class records and ask which student/date/status when details are missing.',
  principal: 'You are a school leadership assistant. Use aggregate attendance data and never claim a status change unless the tool confirms it.',
};

export const ROLE_TOOLS: Record<UserRole, ToolDefinition[]> = {
  student: [
    {
      name: 'getAttendance',
      description: 'Get attendance summary for the student\'s own record.',
      parameters: {
        type: 'object',
        properties: {
          studentId: { type: 'string', description: 'Student ID to inspect.' },
        },
      },
    },
  ],
  parent: [
    {
      name: 'getAttendance',
      description: 'Get attendance summary for the parent\'s linked child.',
      parameters: {
        type: 'object',
        properties: {
          studentId: { type: 'string', description: 'Linked child student ID.' },
        },
      },
    },
    {
      name: 'requestEscalation',
      description: 'Create a support request for a linked child.',
      parameters: {
        type: 'object',
        properties: {
          targetType: { type: 'string', description: 'teacher or management.' },
          reason: { type: 'string', description: 'Why the escalation is needed.' },
          studentId: { type: 'string', description: 'Linked child student ID.' },
        },
        required: ['targetType', 'reason'],
      },
    },
  ],
  teacher: [
    {
      name: 'getAttendance',
      description: 'Get attendance for a student in the teacher\'s class.',
      parameters: {
        type: 'object',
        properties: {
          studentId: { type: 'string', description: 'Student ID in the class roster.' },
        },
      },
    },
    {
      name: 'markAttendance',
      description: 'Mark a student attendance record for a specific date.',
      parameters: {
        type: 'object',
        properties: {
          studentId: { type: 'string', description: 'Student ID in the class rosters.' },
          date: { type: 'string', description: 'Attendance date in YYYY-MM-DD format.' },
          status: { type: 'string', description: 'present, absent, or late.' },
        },
        required: ['studentId', 'date', 'status'],
      },
    },
  ],
  principal: [
    {
      name: 'getOverallAttendance',
      description: 'Get school-wide attendance summary.',
      parameters: { type: 'object', properties: {} },
    },
    {
      name: 'getAttendance',
      description: 'Inspect attendance for any student.',
      parameters: {
        type: 'object',
        properties: {
          studentId: { type: 'string', description: 'Student ID to inspect.' },
        },
      },
    },
  ],
};

function getUserById(userId: string) {
  return users.find((user) => user.id === userId) ?? null;
}

function getStudentById(studentId: string) {
  return students.find((student) => student.id === studentId) ?? null;
}

function normalizeStatus(value: string) {
  const lower = value.toLowerCase();
  if (['present', 'p', 'attended'].includes(lower)) return 'present';
  if (['absent', 'a', 'missed'].includes(lower)) return 'absent';
  if (['late', 'l', 'tardy'].includes(lower)) return 'late';
  return null;
}

function resolveStudentId(role: UserRole, userId: string, message: string) {
  const user = getUserById(userId);
  if (!user) return null;

  const matchName = students.find((student) => message.toLowerCase().includes(student.name.toLowerCase()));
  if (matchName) return matchName.id;

  if (role === 'student') return user.linkedStudentIds?.[0] ?? null;
  if (role === 'parent') return user.linkedStudentIds?.[0] ?? null;
  if (role === 'teacher') return user.classStudentIds?.[0] ?? null;
  return null;
}

function extractDate(message: string) {
  const match = message.match(/(\d{4}-\d{2}-\d{2})|((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-zA-Z]*\s+\d{1,2},?\s+\d{4})/i);
  if (!match) return null;
  return match[1] ?? new Date(match[0]).toISOString().split('T')[0];
}

function extractStatus(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes('present')) return 'present';
  if (lower.includes('absent')) return 'absent';
  if (lower.includes('late')) return 'late';
  return null;
}

function ensureAllowed(role: UserRole, toolName: ToolName) {
  return ROLE_TOOLS[role].some((tool) => tool.name === toolName);
}

function buildAttendanceSummary(studentId: string) {
  const student = getStudentById(studentId);
  if (!student) return { ok: false, message: 'Student not found.' };
  const records = attendanceRecords.filter((record) => record.studentId === studentId);
  const totalDays = records.length;
  const presentDays = records.filter((record) => record.status === 'present').length;
  const absentDays = records.filter((record) => record.status === 'absent').length;
  const lateDays = records.filter((record) => record.status === 'late').length;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 1000) / 10 : 0;

  return {
    ok: true,
    data: {
      studentId: student.id,
      studentName: student.name,
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      attendancePercentage,
    },
  };
}

async function executeTool(role: UserRole, userId: string, toolName: ToolName, params: Record<string, string> = {}) {
  const user = getUserById(userId);
  if (!user) return { ok: false, message: 'User not found.' };

  if (toolName === 'getAttendance') {
    const studentId = params.studentId ?? resolveStudentId(role, userId, params.message ?? '');
    if (!studentId) {
      return { ok: false, message: 'Which student do you want me to check?' };
    }

    if (role === 'student' && !user.linkedStudentIds?.includes(studentId)) {
      return { ok: false, message: 'Access denied. You can only view your own attendance.' };
    }
    if (role === 'parent' && !user.linkedStudentIds?.includes(studentId)) {
      return { ok: false, message: 'Access denied. You can only view your linked child\'s attendance.' };
    }
    if (role === 'teacher' && !user.classStudentIds?.includes(studentId)) {
      return { ok: false, message: 'Access denied. That student is not in your class.' };
    }
    return buildAttendanceSummary(studentId);
  }

  if (toolName === 'markAttendance') {
    if (role !== 'teacher') {
      return { ok: false, message: 'Access denied. Only teachers can mark attendance.' };
    }
    const studentId = params.studentId;
    const date = params.date;
    const status = normalizeStatus(params.status ?? '');
    if (!studentId || !date || !status) {
      return { ok: false, message: 'I need the student, date, and status to mark attendance.' };
    }
    if (!user.classStudentIds?.includes(studentId)) {
      return { ok: false, message: 'Access denied. This student is not in your class.' };
    }
    const student = getStudentById(studentId);
    if (!student) return { ok: false, message: 'Student not found.' };
      const existing = attendanceRecords.findIndex((record) => record.studentId === studentId && record.date === date);
    const payload: AttendanceRecord = {
      id: `att-${Date.now()}`,
      studentId,
      date,
      status: status as 'present' | 'absent' | 'late',
      markedBy: userId,
    };
    if (existing >= 0) attendanceRecords[existing] = payload;
    else attendanceRecords.push(payload);
    return { ok: true, data: payload, message: `Attendance for ${student.name} on ${date} is now ${status}.` };
  }

  if (toolName === 'getOverallAttendance') {
    if (role !== 'principal') {
      return { ok: false, message: 'Access denied. Only the principal can view the overall summary.' };
    }
    const studentStats = students.map((student) => {
      const records = attendanceRecords.filter((record) => record.studentId === student.id);
      const total = records.length;
      const present = records.filter((record) => record.status === 'present').length;
      return {
        studentId: student.id,
        studentName: student.name,
        grade: student.grade,
        attendancePercentage: total > 0 ? (present / total) * 100 : 0,
      };
    });
    const average = studentStats.length
      ? studentStats.reduce((sum, item) => sum + item.attendancePercentage, 0) / studentStats.length
      : 0;
    return {
      ok: true,
      data: {
        totalStudents: students.length,
        averageAttendance: Math.round(average * 10) / 10,
        byGrade: [...new Set(students.map((student) => student.grade))].map((grade) => {
          const items = studentStats.filter((item) => getStudentById(item.studentId)?.grade === grade);
          const avg = items.length ? items.reduce((sum, item) => sum + item.attendancePercentage, 0) / items.length : 0;
          return { grade, averageAttendance: Math.round(avg * 10) / 10, totalStudents: items.length };
        }),
      },
    };
  }

  if (toolName === 'requestEscalation') {
    if (!['student', 'parent'].includes(role)) {
      return { ok: false, message: 'Escalation is only available for students and parents.' };
    }
    const studentId = params.studentId ?? resolveStudentId(role, userId, params.message ?? '');
    const targetType = params.targetType ?? 'teacher';
    const reason = params.reason ?? '';
    if (!['teacher', 'management'].includes(targetType)) {
      return { ok: false, message: 'Escalation target type must be teacher or management.' };
    }
    if (!reason.trim()) {
      return { ok: false, message: 'I need a reason for the escalation request.' };
    }
    if (studentId && role === 'student' && !user.linkedStudentIds?.includes(studentId)) {
      return { ok: false, message: 'Access denied. You can only raise a request for your own profile.' };
    }
    if (studentId && role === 'parent' && !user.linkedStudentIds?.includes(studentId)) {
      return { ok: false, message: 'Access denied. You can only raise a request for your linked child.' };
    }

    const escalation: EscalationRequest = {
      id: `esc-${Date.now()}`,
      requestedBy: userId,
      requestedByRole: role,
      targetType: targetType as 'teacher' | 'management',
      studentId: studentId ?? undefined,
      reason,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
    };
    escalationRequests.push(escalation);
    return { ok: true, data: escalation, message: `Your ${targetType === 'teacher' ? 'teacher call request' : 'support request'} has been confirmed.` };
  }

  return { ok: false, message: 'No valid tool was found for that request.' };
}

function detectIntent(role: UserRole, message: string) {
  const lower = message.toLowerCase();
  if (role === 'principal' && /(overall|school|all|summary)/.test(lower)) return 'getOverallAttendance';
  if (role === 'teacher' && /(mark|present|absent|late)/.test(lower)) return 'markAttendance';
  if (['student', 'parent'].includes(role) && /(escalat|call|support|management|teacher)/.test(lower)) return 'requestEscalation';
  return 'getAttendance';
}

export async function orchestrateChat({
  userId,
  role,
  message,
  sessionId = 'default',
  history = [],
}: {
  userId: string;
  role: UserRole;
  message: string;
  sessionId?: string;
  history?: ChatMessage[];
}) {
  const sessionHistory: ChatMessage[] = history.length > 0 ? history : getConversationHistory(userId, sessionId);
  const nextHistory: ChatMessage[] = [...sessionHistory, { role: 'user', content: message, timestamp: new Date().toISOString() }];

  const toolName: ToolName = detectIntent(role, message) as ToolName;
  if (!ensureAllowed(role, toolName)) {
    return {
      sessionId,
      requiresInput: false,
      content: 'I can only help with the tools available to your role. Please ask about your own attendance, a class update, or a support request.',
      history: nextHistory,
    };
  }

  const params: Record<string, string> = { message };
  const user = getUserById(userId);
  if (user && role === 'student') params.studentId = resolveStudentId(role, userId, message) ?? '';
  if (user && role === 'parent') params.studentId = resolveStudentId(role, userId, message) ?? '';
  if (role === 'teacher') {
    const extractedStudent = resolveStudentId(role, userId, message);
    if (extractedStudent) params.studentId = extractedStudent;
    const date = extractDate(message);
    if (date) params.date = date;
    const status = extractStatus(message);
    if (status) params.status = status;
  }
  if (role === 'principal' && toolName === 'getAttendance') {
    const studentId = resolveStudentId(role, userId, message);
    if (studentId) params.studentId = studentId;
  }
  if (['student', 'parent'].includes(role) && toolName === 'requestEscalation') {
    const studentId = resolveStudentId(role, userId, message);
    if (studentId) params.studentId = studentId;
    const targetType = /management|principal/.test(message.toLowerCase()) ? 'management' : 'teacher';
    params.targetType = targetType;
    params.reason = message.trim();
  }

  if (toolName === 'getAttendance' && !params.studentId && role !== 'principal') {
    const question = role === 'teacher'
      ? 'Which student would you like me to check?'
      : 'Which student should I review for you?';
    const reply = `${PERSONAS[role]} ${question}`;
    const responseHistory: ChatMessage[] = [...nextHistory, { role: 'assistant', content: reply, timestamp: new Date().toISOString() }];
    saveConversationHistory(userId, sessionId, responseHistory);
    return { sessionId, requiresInput: true, content: reply, history: responseHistory };
  }

  if (toolName === 'markAttendance' && (!params.studentId || !params.date || !params.status)) {
    const reply = `${PERSONAS[role]} I need the student, the date, and the status before I can mark attendance.`;
    const responseHistory: ChatMessage[] = [...nextHistory, { role: 'assistant', content: reply, timestamp: new Date().toISOString() }];
    saveConversationHistory(userId, sessionId, responseHistory);
    return { sessionId, requiresInput: true, content: reply, history: responseHistory };
  }

  if (toolName === 'requestEscalation' && (!params.reason || !params.reason.trim())) {
    const reply = `${PERSONAS[role]} Please tell me the reason for the escalation and whether it should go to the teacher or management.`;
    const responseHistory: ChatMessage[] = [...nextHistory, { role: 'assistant', content: reply, timestamp: new Date().toISOString() }];
    saveConversationHistory(userId, sessionId, responseHistory);
    return { sessionId, requiresInput: true, content: reply, history: responseHistory };
  }

  const toolResult = await executeTool(role, userId, toolName, params);
  let reply = 'I can help with attendance and support requests.';

  if (!toolResult.ok) {
    reply = toolResult.message ?? 'I could not complete that request.';
  } else if (toolName === 'getAttendance') {
    const summary = toolResult.data as {
      studentName: string;
      attendancePercentage: number;
      presentDays: number;
      absentDays: number;
      lateDays: number;
      totalDays: number;
    };
    reply = `Your attendance for ${summary.studentName} is ${summary.attendancePercentage}% with ${summary.presentDays} present, ${summary.absentDays} absent, and ${summary.lateDays} late across ${summary.totalDays} recorded days.`;
  } else if (toolName === 'markAttendance') {
    reply = toolResult.message ?? 'Attendance was updated.';
  } else if (toolName === 'getOverallAttendance') {
    const data = toolResult.data as {
      averageAttendance: number;
      totalStudents: number;
      byGrade: Array<{ grade: string; averageAttendance: number; totalStudents: number }>;
    };
    const strongestGrade = data.byGrade.reduce(
      (best, item) => (item.averageAttendance > best.averageAttendance ? item : best),
      data.byGrade[0] ?? { grade: 'N/A', averageAttendance: 0, totalStudents: 0 }
    );
    reply = `School-wide attendance is ${data.averageAttendance}% across ${data.totalStudents} students. The strongest grade is ${strongestGrade.grade}.`;
  } else if (toolName === 'requestEscalation') {
    reply = toolResult.message ?? 'Your request was sent.';
  }

  const responseHistory: ChatMessage[] = [...nextHistory, { role: 'assistant', content: reply, timestamp: new Date().toISOString() }];
  saveConversationHistory(userId, sessionId, responseHistory);

  return {
    sessionId,
    requiresInput: false,
    content: `${PERSONAS[role]} ${reply}`,
    history: responseHistory,
  };
}

export function getPermittedTools(role: UserRole) {
  return ROLE_TOOLS[role];
}
