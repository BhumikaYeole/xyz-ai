import test from 'node:test';
import assert from 'node:assert/strict';

import { generateToken } from '@/lib/auth';
import { users, students } from '@/lib/data/seed';
import { GET as getAttendanceByStudent } from '@/app/api/attendance/[studentId]/route';
import { POST as markAttendance } from '@/app/api/attendance/mark/route';

test('parent cannot fetch another parent\'s child data', async () => {
  const parent = users.find((user) => user.role === 'parent');
  const otherStudent = students.find((student) => !parent?.linkedStudentIds?.includes(student.id));

  assert.ok(parent, 'parent user should exist');
  assert.ok(otherStudent, 'another student should exist');

  const token = await generateToken(parent);
  const request = new Request(`http://localhost/api/attendance/${otherStudent.id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const response = await getAttendanceByStudent(request as never, { params: Promise.resolve({ studentId: otherStudent.id }) } as any);
  const json = await response.json();

  assert.equal(response.status, 403);
  assert.equal(json.success, false);
  assert.match(json.error, /child|own/i);
});

test('student cannot call attendance/mark', async () => {
  const student = users.find((user) => user.role === 'student');
  assert.ok(student, 'student user should exist');

  const token = await generateToken(student);
  const request = new Request('http://localhost/api/attendance/mark', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      studentId: student.linkedStudentIds?.[0],
      date: '2026-08-16',
      status: 'present',
    }),
  });

  const response = await markAttendance(request as any);
  const json = await response.json();

  assert.equal(response.status, 403);
  assert.equal(json.success, false);
  assert.match(json.error, /teacher/i);
});
