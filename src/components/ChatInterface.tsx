'use client';
import { useState, useRef, useEffect } from 'react';
import { FiSend, FiPhone, FiAlertCircle, FiX, FiCheck } from 'react-icons/fi';
import type { ChatMessage } from '@/lib/conversation-store';

interface EscalationContext {
  type: 'teacher' | 'management';
  shown: boolean;
}

export default function ChatInterface({ userRole }: { userRole: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(`session-${Date.now()}`);
  const [escalation, setEscalation] = useState<EscalationContext>({ type: 'teacher', shown: false });
  const [confirmingEscalation, setConfirmingEscalation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setEscalation({ type: 'teacher', shown: false });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          sessionId,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Error: ${data.error || 'Something went wrong.'}`,
            timestamp: new Date().toISOString(),
          },
        ]);
        return;
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.data.content,
        timestamp: data.data.timestamp,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (
        ['student', 'parent'].includes(userRole) &&
        (data.data.content.toLowerCase().includes('escalat') ||
          data.data.content.toLowerCase().includes('support') ||
          data.data.content.toLowerCase().includes('teacher') ||
          data.data.content.toLowerCase().includes('management'))
      ) {
        setEscalation({
          type: data.data.content.toLowerCase().includes('management') ? 'management' : 'teacher',
          shown: true,
        });
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Failed to connect to the chat service.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEscalation = (type: 'teacher' | 'management') => {
    setConfirmingEscalation(true);
    setEscalation({ type, shown: true });
  };

  const confirmEscalation = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/escalation/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: escalation.type,
          reason: `Escalation request via chat from ${userRole}`,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const confirmMessage: ChatMessage = {
          role: 'assistant',
          content: `Your request to contact ${escalation.type === 'teacher' ? 'the teacher' : 'school management'} has been confirmed. They will be notified shortly.`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, confirmMessage]);
        setConfirmingEscalation(false);
        setEscalation({ type: 'teacher', shown: false });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Failed to submit escalation request.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const cancelEscalation = () => {
    setConfirmingEscalation(false);
    setEscalation({ type: 'teacher', shown: false });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '600px', position: 'relative' }}>
      <div className="chat-scroll" style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', paddingRight: '0.5rem' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
            <p style={{ marginBottom: '0.5rem' }}>Start a conversation with your AI assistant</p>
            <p style={{ fontSize: '0.9rem' }}>Ask about attendance, mark records, or request support</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '1rem',
            }}
          >
            <div
              className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}
              style={{
                maxWidth: '75%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                lineHeight: 1.5,
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
            <div className="chat-bubble-ai" style={{ padding: '0.75rem 1rem' }}>
              <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', animation: 'pulse 1.4s infinite' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', animation: 'pulse 1.4s infinite 0.2s' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', animation: 'pulse 1.4s infinite 0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {escalation.shown && !confirmingEscalation && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', padding: '1rem', background: 'rgba(99,102,241,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <FiAlertCircle size={18} style={{ flexShrink: 0, marginTop: '0.25rem', color: '#818cf8' }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
              Need additional support? You can reach out to {escalation.type === 'teacher' ? 'your teacher' : 'school management'}.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleEscalation('teacher')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(6,182,212,0.1)',
                  border: '1px solid rgba(6,182,212,0.3)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#22d3ee',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                }}
              >
                <FiPhone size={14} />
                Talk to Teacher
              </button>
              <button
                onClick={() => handleEscalation('management')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fbbf24',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                }}
              >
                <FiPhone size={14} />
                Contact Management
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmingEscalation && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', padding: '1rem', background: 'rgba(34,211,238,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(34,211,238,0.2)' }}>
          <FiAlertCircle size={18} style={{ flexShrink: 0, marginTop: '0.25rem', color: '#06b6d4' }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Confirm escalation to {escalation.type === 'teacher' ? 'your teacher' : 'school management'}?
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={confirmEscalation}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1rem',
                  background: '#10b981',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                }}
              >
                <FiCheck size={14} />
                Confirm
              </button>
              <button
                onClick={cancelEscalation}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(107,114,128,0.1)',
                  border: '1px solid rgba(107,114,128,0.3)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                }}
              >
                <FiX size={14} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about attendance, mark records, or request support..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'var(--gradient-button)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontWeight: 500,
            fontSize: '0.9rem',
            opacity: loading || !input.trim() ? 0.6 : 1,
          }}
        >
          <FiSend size={16} />
          Send
        </button>
      </form>
    </div>
  );
}
