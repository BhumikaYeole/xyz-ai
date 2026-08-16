import { extractUserFromRequest } from '@/lib/auth';
import { students, attendanceRecords } from '@/lib/data/seed';
import { users } from '@/lib/data/seed';
import { AttendanceSummary } from '@/lib/types';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/attendance/[studentId]'>
) {
  const payload = await extractUserFromRequest(request);
  if (!payload) {
    return Response.json(
      { success: false, error: 'Unauthorized.' },
      { status: 401 }
    );
  }

  const { studentId } = await ctx.params;
  const student = students.find((s) => s.id === studentId);

  if (!student) {
    return Response.json(
      { success: false, error: 'Student not found.' },
      { status: 404 }
    );
  }

  const user = users.find((u) => u.id === payload.userId);
  if (!user) {
    return Response.json(
      { success: false, error: 'User not found.' },
      { status: 403 }
    );
  }

  switch (payload.role) {
    case 'student':
      // Students can ONLY view their own attendance
      if (!user.linkedStudentIds?.includes(studentId)) {
        return Response.json(
          { success: false, error: 'Access denied. You can only view your own attendance.' },
          { status: 403 }
        );
      }
      break;

    case 'parent':
      // Parents can ONLY view their linked child's attendance
      if (!user.linkedStudentIds?.includes(studentId)) {
        return Response.json(
          { success: false, error: 'Access denied. You can only view your child\'s attendance.' },
          { status: 403 }
        );
      }
      break;

    case 'teacher':
      // Teachers can view attendance for students in their class
      if (!user.classStudentIds?.includes(studentId)) {
        return Response.json(
          { success: false, error: 'Access denied. This student is not in your class.' },
          { status: 403 }
        );
      }
      break;

    case 'principal':
      // Principal can view any student's attendance
      break;

    default:
      return Response.json(
        { success: false, error: 'Unknown role.' },
        { status: 403 }
      );
  }

  const records = attendanceRecords.filter((r) => r.studentId === studentId);
  const totalDays = records.length;
  const presentDays = records.filter((r) => r.status === 'present').length;
  const absentDays = records.filter((r) => r.status === 'absent').length;
  const lateDays = records.filter((r) => r.status === 'late').length;

  const summary: AttendanceSummary = {
    studentId,
    studentName: student.name,
    totalDays,
    presentDays,
    absentDays,
    lateDays,
    attendancePercentage: totalDays > 0
      ? Math.round((presentDays / totalDays) * 1000) / 10
      : 0,
  };

  return Response.json({
    success: true,
    data: summary,
    recentRecords: records.slice(0, 10),
  });
}
