// ─── Role & Auth Types ───────────────────────────────────────────────────────

export type UserRole = 'student' | 'parent' | 'teacher' | 'principal';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // plaintext for demo only — never do this in production
  role: UserRole;
  // For parent: IDs of children they're linked to
  linkedStudentIds?: string[];
  // For teacher: IDs of students in their class
  classStudentIds?: string[];
}

export interface AuthPayload {
  userId: string;
  role: UserRole;
  name: string;
  iat?: number;
  exp?: number;
}

// ─── Domain Types ────────────────────────────────────────────────────────────

export interface Student {
  id: string;
  name: string;
  grade: string;
  section: string;
  parentId: string;
  teacherId: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;      // ISO date string YYYY-MM-DD
  status: 'present' | 'absent' | 'late';
  markedBy: string;  // userId of who marked it
}

export interface EscalationRequest {
  id: string;
  requestedBy: string;     // userId
  requestedByRole: UserRole;
  targetType: 'teacher' | 'management';
  targetId?: string;       // specific teacher/management member ID
  studentId?: string;      // related student if applicable
  reason: string;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: string;
  confirmedAt?: string;
}

// ─── API Response Types ──────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AttendanceSummary {
  studentId: string;
  studentName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercentage: number;
}

export interface OverallAttendanceSummary {
  totalStudents: number;
  averageAttendance: number;
  byGrade: {
    grade: string;
    averageAttendance: number;
    totalStudents: number;
  }[];
  byDate: {
    date: string;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    totalStudents: number;
  }[];
}
