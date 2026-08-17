import test from 'node:test';
import assert from 'node:assert/strict';

import { orchestrateChat } from './ai-orchestrator';

test('parent attendance reply does not include persona prompt', async () => {
  const result = await orchestrateChat({
    userId: 'user-parent-1',
    role: 'parent',
    message: 'what is my attendance?',
    sessionId: 'test-parent-attendance',
  });

  assert.ok(!result.content.includes('You are a family support assistant'));
  assert.ok(result.content.includes('Rahul Sharma'));
  assert.ok(!result.content.toLowerCase().includes('school management'));
});

test('student request to mark attendance returns teacher-only guidance', async () => {
  const result = await orchestrateChat({
    userId: 'user-student-1',
    role: 'student',
    message: 'mark my attendance',
    sessionId: 'test-student-mark',
  });

  assert.ok(result.content.toLowerCase().includes('teacher'));
  assert.ok(!result.content.toLowerCase().includes('access denied'));
});

test('parent attendance lookup returns linked child data', async () => {
  const result = await orchestrateChat({
    userId: 'user-parent-1',
    role: 'parent',
    message: 'what is rahul\'s attendance',
    sessionId: 'test-parent-child',
  });

  assert.ok(result.content.includes('Rahul Sharma'));
  assert.ok(!result.content.toLowerCase().includes('access denied'));
});
