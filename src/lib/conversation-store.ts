import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

type ConversationSession = {
  userId: string;
  sessionId: string;
  messages: ChatMessage[];
};

const DATA_DIR = path.join(process.cwd(), 'src', 'lib', 'data');
const DATA_FILE = path.join(DATA_DIR, 'conversation-history.json');

function ensureStore() {
  mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DATA_FILE)) {
    writeFileSync(DATA_FILE, JSON.stringify({ sessions: {} }, null, 2));
  }
}

export function readSessions(): Record<string, ConversationSession> {
  ensureStore();
  try {
    const raw = readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed.sessions ?? {};
  } catch {
    return {};
  }
}

export function writeSessions(sessions: Record<string, ConversationSession>) {
  ensureStore();
  writeFileSync(DATA_FILE, JSON.stringify({ sessions }, null, 2));
}

export function getSessionKey(userId: string, sessionId: string) {
  return `${userId}:${sessionId || 'default'}`;
}

export function getConversationHistory(userId: string, sessionId: string) {
  const sessions = readSessions();
  const sessionKey = getSessionKey(userId, sessionId);
  return sessions[sessionKey]?.messages ?? [];
}

export function saveConversationHistory(userId: string, sessionId: string, messages: ChatMessage[]) {
  const sessions = readSessions();
  const sessionKey = getSessionKey(userId, sessionId);
  sessions[sessionKey] = {
    userId,
    sessionId: sessionId || 'default',
    messages,
  };
  writeSessions(sessions);
}
