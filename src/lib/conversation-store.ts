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

// Global in-memory store resilient to serverless/Vercel read-only filesystem
const globalStore = globalThis as unknown as {
  __xyzConversationSessions?: Map<string, ConversationSession>;
};

if (!globalStore.__xyzConversationSessions) {
  globalStore.__xyzConversationSessions = new Map<string, ConversationSession>();
}

export function getSessionKey(userId: string, sessionId: string) {
  return `${userId}:${sessionId || 'default'}`;
}

export function getConversationHistory(userId: string, sessionId: string): ChatMessage[] {
  const sessionKey = getSessionKey(userId, sessionId);
  return globalStore.__xyzConversationSessions?.get(sessionKey)?.messages ?? [];
}

export function saveConversationHistory(userId: string, sessionId: string, messages: ChatMessage[]) {
  const sessionKey = getSessionKey(userId, sessionId);
  globalStore.__xyzConversationSessions?.set(sessionKey, {
    userId,
    sessionId: sessionId || 'default',
    messages: messages.slice(-20), // Retain last 20 messages for context
  });
}
