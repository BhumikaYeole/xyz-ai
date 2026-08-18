'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { FiSend, FiMic, FiMicOff, FiPhone, FiAlertCircle, FiX, FiCheck, FiVolume2, FiVolumeX, FiInfo } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '@/lib/conversation-store';
import { useVoice } from '@/lib/use-voice';
import Avatar from './Avatar';

interface ChatInterfaceProps {
  userRole: string;
  language: string;
}

interface EscalationCtx {
  type: 'teacher' | 'management';
  shown: boolean;
}

const MarkdownContent = ({ content }: { content: string }) => (
  <ReactMarkdown
    components={{
      h1: ({ children }) => <h1 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.4rem 0', color: 'var(--text-primary)' }}>{children}</h1>,
      h2: ({ children }) => <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0.35rem 0', color: 'var(--text-primary)' }}>{children}</h2>,
      p: ({ children }) => <p style={{ marginBottom: '0.35rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{children}</p>,
      strong: ({ children }) => <strong style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{children}</strong>,
      ul: ({ children }) => <ul style={{ marginLeft: '1.2rem', marginBottom: '0.35rem', listStyleType: 'disc' }}>{children}</ul>,
      ol: ({ children }) => <ol style={{ marginLeft: '1.2rem', marginBottom: '0.35rem' }}>{children}</ol>,
      li: ({ children }) => <li style={{ marginBottom: '0.2rem', color: 'var(--text-primary)' }}>{children}</li>,
    }}
  >
    {content}
  </ReactMarkdown>
);

export default function ChatInterface({ userRole, language }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [sessionId] = useState(`session-${Date.now()}`);
  const [escalation, setEscalation] = useState<EscalationCtx>({ type: 'teacher', shown: false });
  const [confirmingEscalation, setConfirmingEscalation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleTranscript = useCallback((transcript: string) => {
    if (!transcript) return;
    setInput(transcript);
    sendMessage(transcript);
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  const voice = useVoice({ language, onTranscript: handleTranscript });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setEscalation({ type: 'teacher', shown: false });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, sessionId, language }),
      });

      const data = await res.json();

      if (!data.success) {
        const errMsg: ChatMessage = {
          role: 'assistant',
          content: `Note: ${data.error || 'I could not process that request right now.'}`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errMsg]);
        return;
      }

      const aiContent = data.data.content;
      const aiMsg: ChatMessage = { role: 'assistant', content: aiContent, timestamp: data.data.timestamp };
      setMessages((prev) => [...prev, aiMsg]);

      // Speak response using Web Speech Synthesis in selected language
      if (ttsEnabled) {
        voice.speak(aiContent);
      }

      // Check if escalation prompt is relevant
      const lower = aiContent.toLowerCase() + ' ' + trimmed.toLowerCase();
      if (
        ['student', 'parent'].includes(userRole) &&
        (lower.includes('escalat') ||
          lower.includes('support') ||
          lower.includes('teacher') ||
          lower.includes('management') ||
          lower.includes('principal') ||
          lower.includes('call') ||
          lower.includes('contact'))
      ) {
        setEscalation({
          type: lower.includes('management') || lower.includes('principal') ? 'management' : 'teacher',
          shown: true,
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I experienced a brief connection hiccup. Please try asking again.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleMicToggle = () => {
    if (voice.status === 'listening') {
      voice.stopListening();
    } else if (voice.status === 'speaking') {
      voice.stopSpeaking();
    } else {
      voice.startListening();
    }
  };

  const handleEscalation = (type: 'teacher' | 'management') => {
    setConfirmingEscalation(true);
    setEscalation({ type, shown: true });
  };

  const confirmEscalation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/escalation/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: escalation.type,
          reason: `Direct escalation request from ${userRole} via chat interface`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const msg = `Your request to connect with ${escalation.type === 'teacher' ? 'your classroom teacher' : 'school management'} has been officially logged. A staff member will reach out to you shortly.`;
        setMessages((prev) => [...prev, { role: 'assistant', content: msg, timestamp: new Date().toISOString() }]);
        if (ttsEnabled) voice.speak(msg);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Unable to register escalation request at this moment.', timestamp: new Date().toISOString() },
      ]);
    } finally {
      setConfirmingEscalation(false);
      setEscalation({ type: 'teacher', shown: false });
      setLoading(false);
    }
  };

  const isMicActive = voice.status === 'listening';

  return (
    <div style={{ display: 'flex', height: '100%', gap: '1.25rem', minHeight: 0, width: '100%' }}>
      {/* 3D Avatar Column */}
      <div
        style={{
          width: '180px',
          flexShrink: 0,
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingRight: '1rem',
        }}
      >
        <Avatar role={userRole} voiceStatus={voice.status} />

        {/* Quick Voice Mode indicator */}
        <div
          style={{
            marginTop: 'auto',
            padding: '0.6rem',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Voice Interaction</p>
          <button
            onClick={() => {
              setTtsEnabled(!ttsEnabled);
              if (ttsEnabled) voice.stopSpeaking();
            }}
            className="btn-ghost"
            style={{ fontSize: '0.75rem', width: '100%', justifyContent: 'center' }}
          >
            {ttsEnabled ? <FiVolume2 size={13} color="var(--accent-default)" /> : <FiVolumeX size={13} />}
            {ttsEnabled ? 'Voice: On' : 'Voice: Muted'}
          </button>
        </div>
      </div>

      {/* Main Chat Flow */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* Messages Scroll Area */}
        <div className="chat-scroll" style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '0.75rem' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--bg-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem auto',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <FiInfo size={22} color="var(--accent-default)" />
              </div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                How can I assist you today?
              </p>
              <p style={{ fontSize: '0.85rem' }}>
                Ask attendance questions, request authority escalation, or tap the purple microphone to talk.
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '0.85rem',
              }}
            >
              <div
                className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}
                style={{
                  maxWidth: '78%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {msg.role === 'assistant' ? <MarkdownContent content={msg.content} /> : msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.75rem' }}>
              <div className="chat-bubble-ai" style={{ padding: '0.75rem 1rem' }}>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  {[0, 0.2, 0.4].map((delay) => (
                    <div
                      key={delay}
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--accent-default)',
                        animation: 'pulse 1.2s infinite',
                        animationDelay: `${delay}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Voice Note or Error Banner */}
        {voice.errorMsg && (
          <div
            className="notice-strip"
            style={{
              marginBottom: '0.5rem',
              color: '#dc2626',
              background: '#fef2f2',
              borderColor: '#fecaca',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <FiAlertCircle size={15} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: '0.8rem' }}>{voice.errorMsg}</span>
            <button onClick={voice.clearError} className="btn-ghost" style={{ padding: '0 4px' }}>
              <FiX size={14} />
            </button>
          </div>
        )}

        {/* Active Listening Indicator */}
        {voice.status === 'listening' && (
          <div
            className="notice-strip"
            style={{
              marginBottom: '0.5rem',
              background: '#f5f3ff',
              borderColor: 'var(--border-accent)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <div
              className="mic-recording"
              style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-default)', flexShrink: 0 }}
            />
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-default)', fontWeight: 500 }}>
              Listening... speak naturally in your chosen language
            </span>
          </div>
        )}

        {/* Escalation Prompt Card */}
        {escalation.shown && !confirmingEscalation && (
          <div className="notice-strip" style={{ marginBottom: '0.6rem', border: '1px solid var(--border-accent)' }}>
            <FiAlertCircle size={16} style={{ flexShrink: 0, color: 'var(--accent-default)', marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                Would you like to connect with school authorities directly?
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleEscalation('teacher')}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '5px 12px' }}
                >
                  <FiPhone size={13} /> Contact Teacher
                </button>
                <button
                  onClick={() => handleEscalation('management')}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '5px 12px' }}
                >
                  <FiPhone size={13} /> Contact Management
                </button>
                <button
                  onClick={() => setEscalation({ type: 'teacher', shown: false })}
                  className="btn-ghost"
                  style={{ fontSize: '0.8rem' }}
                >
                  <FiX size={13} /> Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Escalation Confirmation Card */}
        {confirmingEscalation && (
          <div className="notice-strip" style={{ marginBottom: '0.6rem', border: '1px solid var(--border-accent)' }}>
            <FiAlertCircle size={16} style={{ flexShrink: 0, color: 'var(--accent-default)' }} />
            <div style={{ flex: 1 }}>
              <p style={{ marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>
                Confirm submission of support request to {escalation.type === 'teacher' ? 'class teacher' : 'school management'}?
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={confirmEscalation}
                  disabled={loading}
                  className="btn-primary"
                  style={{ fontSize: '0.8rem', padding: '5px 14px' }}
                >
                  <FiCheck size={13} /> Yes, Submit Request
                </button>
                <button
                  onClick={() => {
                    setConfirmingEscalation(false);
                    setEscalation({ type: 'teacher', shown: false });
                  }}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '5px 12px' }}
                >
                  <FiX size={13} /> Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Input & Mic Actions */}
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={voice.status === 'listening' ? 'Listening to your speech...' : 'Type a message or tap the mic to speak...'}
            disabled={loading || voice.status === 'listening'}
            className="input-field"
            style={{ flex: 1 }}
          />

          {/* Prominent Microphone Button */}
          <button
            type="button"
            onClick={handleMicToggle}
            disabled={loading}
            className={`btn-icon ${isMicActive ? 'active' : ''}`}
            title={isMicActive ? 'Stop listening' : 'Start voice input (Speak now)'}
            style={{
              flexShrink: 0,
              width: '42px',
              height: '42px',
              background: isMicActive ? 'var(--accent-default)' : 'var(--bg-card)',
              color: isMicActive ? '#ffffff' : 'var(--accent-default)',
              border: `1px solid ${isMicActive ? 'var(--accent-default)' : 'var(--border-accent)'}`,
              cursor: 'pointer',
            }}
          >
            {isMicActive ? <FiMicOff size={18} /> : <FiMic size={18} />}
          </button>

          {/* Send Action */}
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary"
            style={{ flexShrink: 0, height: '42px', padding: '0 18px' }}
          >
            <FiSend size={15} /> Send
          </button>
        </form>
      </div>
    </div>
  );
}
