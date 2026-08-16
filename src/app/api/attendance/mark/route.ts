import { extractUserFromRequest } from '@/lib/auth';
import { users, students, attendanceRecords } from '@/lib/data/seed';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const payload = await extractUserFromRequest(request);
  if (!payload) {
    return Response.json(
      { success: false, error: 'Unauthorized.' },
      { status: 401 }
    );
  }


  if (payload.role !== 'teacher') {
    return Response.json(
      {
        success: false,
        error: 'Access denied. Only teachers can mark attendance.',
      },
      { status: 403 }
    );
  }

  const user = users.find((u) => u.id === payload.userId);
  if (!user) {
    return Response.json(
      { success: false, error: 'User not found.' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { studentId, date, status } = body;

  if (!studentId || !date || !status) {
    return Response.json(
      {
        success: false,
        error: 'Missing required fields: studentId, date, status.',
      },
      { status: 400 }
    );
  }

  // Validate status
  if (!['present', 'absent', 'late'].includes(status)) {
    return Response.json(
      { success: false, error: 'Status must be "present", "absent", or "late".' },
      { status: 400 }
    );
  }

  // Verify this student is in the teacher's class
  if (!user.classStudentIds?.includes(studentId)) {
    return Response.json(
      {
        success: false,
        error: 'Access denied. This student is not in your class.',
      },
      { status: 403 }
    );
  }

  // Verify student exists
  const student = students.find((s) => s.id === studentId);
  if (!student) {
    return Response.json(
      { success: false, error: 'Student not found.' },
      { status: 404 }
    );
  }

  // Check if attendance already exists for this date
  const existingIndex = attendanceRecords.findIndex(
    (r) => r.studentId === studentId && r.date === date
  );

  const record = {
    id: `att-${Date.now()}`,
    studentId,
    date,
    status,
    markedBy: payload.userId,
  };

  if (existingIndex >= 0) {
    // Update existing record
    attendanceRecords[existingIndex] = record;
  } else {
    // Add new record
    attendanceRecords.push(record);
  }

  return Response.json({
    success: true,
    message: `Attendance marked: ${student.name} is ${status} on ${date}.`,
    data: record,
  });
}
