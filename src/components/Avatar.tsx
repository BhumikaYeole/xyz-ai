'use client';
import { FiMic, FiVolume2 } from 'react-icons/fi';
import type { VoiceStatus } from '@/lib/use-voice';
import ThreeAvatar from './ThreeAvatar';

const ROLE_CONFIG: Record<string, { label: string; greeting: string; title: string }> = {
  student: {
    label: 'Mentor AI',
    title: 'Academic Assistant',
    greeting: 'Hi there! I am here to help you check your attendance and guide your studies.',
  },
  parent: {
    label: 'Family AI',
    title: 'Parent Support Partner',
    greeting: 'Hello! Ask me anytime about your child’s attendance or request teacher callbacks.',
  },
  teacher: {
    label: 'Staff AI',
    title: 'Teaching Assistant',
    greeting: 'Welcome! I can help you record class attendance and manage student rosters.',
  },
  principal: {
    label: 'Executive AI',
    title: 'Management Assistant',
    greeting: 'Good day. I provide school-wide analytics and verified institutional data.',
  },
};

interface AvatarProps {
  role: string;
  voiceStatus: VoiceStatus;
}

export default function Avatar({ role, voiceStatus }: AvatarProps) {
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.student;
  const isTalking = voiceStatus === 'speaking';
  const isListening = voiceStatus === 'listening';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '1rem 0.5rem',
        width: '100%',
      }}
    >
      {/* 3D Character Canvas */}
      <div
        style={{
          width: '124px',
          height: '124px',
          borderRadius: '50%',
          background: 'var(--bg-card)',
          border: `2px solid ${isTalking || isListening ? 'var(--accent-default)' : 'var(--border-subtle)'}`,
          boxShadow: isTalking ? '0 0 20px rgba(139, 92, 246, 0.25)' : 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transition: 'all var(--transition-fast)',
          position: 'relative',
        }}
      >
        <ThreeAvatar role={role} voiceStatus={voiceStatus} />

        {/* Live Audio indicator badge */}
        {isTalking && (
          <div
            style={{
              position: 'absolute',
              bottom: '6px',
              background: 'var(--accent-default)',
              borderRadius: '999px',
              padding: '2px 6px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: 600,
            }}
          >
            <FiVolume2 size={10} /> Speaking
          </div>
        )}

        {isListening && (
          <div
            style={{
              position: 'absolute',
              bottom: '6px',
              background: '#ef4444',
              borderRadius: '999px',
              padding: '2px 6px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: 600,
            }}
          >
            <FiMic size={10} className="mic-recording" /> Listening
          </div>
        )}
      </div>

      {/* Persona Information */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
          {config.label}
        </p>
        <span
          style={{
            display: 'inline-block',
            fontSize: '0.7rem',
            color: 'var(--accent-default)',
            fontWeight: 600,
            background: 'var(--bg-card)',
            padding: '1px 6px',
            borderRadius: '4px',
            marginTop: '2px',
          }}
        >
          {config.title}
        </span>
        <p
          style={{
            fontSize: '0.72rem',
            color: 'var(--text-secondary)',
            marginTop: '6px',
            lineHeight: 1.4,
            padding: '0 4px',
          }}
        >
          {isListening
            ? 'Listening to your voice...'
            : isTalking
            ? 'Responding with 3D Lip-Sync...'
            : voiceStatus === 'processing'
            ? 'Analyzing request...'
            : config.greeting}
        </p>
      </div>

      {/* Visual Viseme Waveform Bar */}
      {isTalking && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '14px', marginTop: '2px' }}>
          {[0.3, 0.7, 1.0, 0.6, 0.9, 0.4, 0.8, 0.2].map((height, i) => (
            <div
              key={i}
              style={{
                width: '3px',
                height: `${height * 100}%`,
                background: 'var(--accent-default)',
                borderRadius: '2px',
                animation: 'pulse 0.6s ease-in-out infinite alternate',
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
