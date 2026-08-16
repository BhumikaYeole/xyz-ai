
import { extractUserFromRequest } from '@/lib/auth';
import { students, attendanceRecords } from '@/lib/data/seed';
import { OverallAttendanceSummary } from '@/lib/types';

export async function GET(request: Request) {
  const payload = await extractUserFromRequest(request);
  if (!payload) {
    return Response.json(
      { success: false, error: 'Unauthorized.' },
      { status: 401 }
    );
  }

  if (payload.role !== 'principal') {
    return Response.json(
      {
        success: false,
        error: 'Access denied. Only the principal can view school-wide analytics.',
      },
      { status: 403 }
    );
  }

  const studentStats = students.map((student) => {
    const records = attendanceRecords.filter((r) => r.studentId === student.id);
    const total = records.length;
    const present = records.filter((r) => r.status === 'present').length;
    return {
      studentId: student.id,
      studentName: student.name,
      grade: student.grade,
      attendancePercentage: total > 0 ? (present / total) * 100 : 0,
    };
  });

  // By grade
  const grades = [...new Set(students.map((s) => s.grade))];
  const byGrade = grades.map((grade) => {
    const gradeStudents = studentStats.filter(
      (s) => students.find((st) => st.id === s.studentId)?.grade === grade
    );
    const avgAttendance =
      gradeStudents.length > 0
        ? gradeStudents.reduce((sum, s) => sum + s.attendancePercentage, 0) / gradeStudents.length
        : 0;
    return {
      grade,
      averageAttendance: Math.round(avgAttendance * 10) / 10,
      totalStudents: gradeStudents.length,
    };
  });

  // By date (last 10 unique dates)
  const uniqueDates = [...new Set(attendanceRecords.map((r) => r.date))].sort().reverse().slice(0, 10);
  const byDate = uniqueDates.map((date) => {
    const dayRecords = attendanceRecords.filter((r) => r.date === date);
    return {
      date,
      presentCount: dayRecords.filter((r) => r.status === 'present').length,
      absentCount: dayRecords.filter((r) => r.status === 'absent').length,
      lateCount: dayRecords.filter((r) => r.status === 'late').length,
      totalStudents: dayRecords.length,
    };
  });

  const overallAvg =
    studentStats.length > 0
      ? studentStats.reduce((sum, s) => sum + s.attendancePercentage, 0) / studentStats.length
      : 0;

  const summary: OverallAttendanceSummary = {
    totalStudents: students.length,
    averageAttendance: Math.round(overallAvg * 10) / 10,
    byGrade,
    byDate,
  };

  return Response.json({
    success: true,
    data: summary,
  });
}
