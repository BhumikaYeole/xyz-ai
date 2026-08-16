import { User, Student, AttendanceRecord, EscalationRequest } from '../types';

// ─── Demo Users (one per role) ──────────────────────────────────────────────
// Passwords are plaintext for demo purposes ONLY.

export const users: User[] = [
  {
    id: 'user-student-1',
    name: 'Rahul Sharma',
    email: 'rahul@school.xyz',
    password: 'student123',
    role: 'student',
    linkedStudentIds: ['student-1'], // student IS the student
  },
  {
    id: 'user-parent-1',
    name: 'Priya Sharma',
    email: 'priya@parent.xyz',
    password: 'parent123',
    role: 'parent',
    linkedStudentIds: ['student-1'], // Rahul's parent
  },
  {
    id: 'user-teacher-1',
    name: 'Anita Desai',
    email: 'anita@school.xyz',
    password: 'teacher123',
    role: 'teacher',
    classStudentIds: ['student-1', 'student-2', 'student-3', 'student-4', 'student-5'],
  },
  {
    id: 'user-principal-1',
    name: 'Dr. Vikram Singh',
    email: 'vikram@school.xyz',
    password: 'principal123',
    role: 'principal',
  },
];

// ─── Students ───────────────────────────────────────────────────────────────

export const students: Student[] = [
  {
    id: 'student-1',
    name: 'Rahul Sharma',
    grade: '10',
    section: 'A',
    parentId: 'user-parent-1',
    teacherId: 'user-teacher-1',
  },
  {
    id: 'student-2',
    name: 'Sneha Patel',
    grade: '10',
    section: 'A',
    parentId: 'user-parent-2', // parent not in demo accounts
    teacherId: 'user-teacher-1',
  },
  {
    id: 'student-3',
    name: 'Arjun Kumar',
    grade: '10',
    section: 'A',
    parentId: 'user-parent-3',
    teacherId: 'user-teacher-1',
  },
  {
    id: 'student-4',
    name: 'Meera Nair',
    grade: '9',
    section: 'B',
    parentId: 'user-parent-4',
    teacherId: 'user-teacher-1',
  },
  {
    id: 'student-5',
    name: 'Kabir Reddy',
    grade: '9',
    section: 'B',
    parentId: 'user-parent-5',
    teacherId: 'user-teacher-1',
  },
];

// ─── Attendance Records ─────────────────────────────────────────────────────
// Generate recent attendance for all students

function generateAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const statuses: Array<'present' | 'absent' | 'late'> = ['present', 'absent', 'late'];
  let recordId = 1;

  // Generate 20 days of attendance for each student
  for (const student of students) {
    for (let dayOffset = 0; dayOffset < 20; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      // Weighted random: 85% present, 10% absent, 5% late
      const rand = Math.random();
      let status: 'present' | 'absent' | 'late';
      if (rand < 0.85) status = 'present';
      else if (rand < 0.95) status = 'absent';
      else status = 'late';

      records.push({
        id: `att-${recordId++}`,
        studentId: student.id,
        date: date.toISOString().split('T')[0],
        status,
        markedBy: 'user-teacher-1',
      });
    }
  }

  return records;
}

export const attendanceRecords: AttendanceRecord[] = generateAttendance();

// ─── Escalation Requests ────────────────────────────────────────────────────

export const escalationRequests: EscalationRequest[] = [];
