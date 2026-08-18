'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FiActivity,
  FiArrowRight,
  FiBookOpen,
  FiCheckCircle,
  FiGlobe,
  FiGrid,
  FiShield,
  FiUser,
  FiUsers,
  FiVolume2,
  FiVolumeX,
} from 'react-icons/fi';
import ThreeAvatar from '@/components/ThreeAvatar';
import type { VoiceStatus } from '@/lib/use-voice';
import { useVoice } from '@/lib/use-voice';

const PORTALS = [
  {
    role: 'student',
    title: 'Student Portal',
    badge: 'Students & Learners',
    description: 'Check attendance, review academic records, and access guided support from your AI assistant.',
    icon: FiBookOpen,
    href: '/student-portal',
    demoEmail: 'rahul@school.xyz',
  },
  {
    role: 'parent',
    title: 'Parent Portal',
    badge: 'Parents & Guardians',
    description: 'Follow attendance in real time and request teacher callbacks when a conversation is needed.',
    icon: FiUsers,
    href: '/parent-portal',
    demoEmail: 'priya@parent.xyz',
  },
  {
    role: 'teacher',
    title: 'Staff Portal',
    badge: 'Teachers & Faculty',
    description: 'Record daily attendance, manage classroom rosters, and verify student records by voice.',
    icon: FiUser,
    href: '/staff-portal',
    demoEmail: 'anita@school.xyz',
  },
  {
    role: 'principal',
    title: 'Management Portal',
    badge: 'School Leadership',
    description: 'Read school-wide attendance metrics, grade-level analytics, and verified institutional reports.',
    icon: FiGrid,
    href: '/management-portal',
    demoEmail: 'vikram@school.xyz',
  },
];

const FEATURES = [
  {
    index: '01',
    icon: FiVolume2,
    title: 'Natural voice interaction',
    desc: 'Speak naturally through microphone input and receive clear spoken answers with voice playback.',
  },
  {
    index: '02',
    icon: FiGlobe,
    title: 'Eleven Indian languages',
    desc: 'Understand requests and return natural responses in Hindi, Tamil, Telugu, Marathi, Bengali, and more.',
  },
  {
    index: '03',
    icon: FiActivity,
    title: 'Expressive 3D presence',
    desc: 'A real-time avatar with lip-sync, blinking, and attentive listening states makes interaction feel immediate.',
  },
  {
    index: '04',
    icon: FiShield,
    title: 'Role-aware security',
    desc: 'JWT validation and server-side authorization keep every record within its permitted school role.',
  },
];

const sectionLabelStyle = {
  color: 'var(--accent-default)',
  fontSize: '0.72rem',
  fontWeight: 800,
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
};

export default function HomePage() {
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [isPlayingIntro, setIsPlayingIntro] = useState(false);

  const voice = useVoice({
    language: 'en',
    onTranscript: () => { },
  });

  const introText =
    'Hello and welcome to XYZ AI. I am your school assistant for students, parents, teachers, and school management. Choose your portal below to begin.';

  const handlePlayIntro = () => {
    if (isPlayingIntro) {
      voice.stopSpeaking();
      setIsPlayingIntro(false);
      setVoiceStatus('idle');
      return;
    }

    setIsPlayingIntro(true);
    setVoiceStatus('speaking');
    voice.speak(
      introText,
      () => {
        setIsPlayingIntro(true);
        setVoiceStatus('speaking');
      },
      () => {
        setIsPlayingIntro(false);
        setVoiceStatus('idle');
      },
    );
  };

  useEffect(() => {
    return () => voice.stopSpeaking();
  }, []);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          height: '68px',
          background: '#ffffff',
          borderBottom: '1px solid var(--border-subtle)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            height: '100%',
            margin: '0 auto',
            padding: '0 clamp(1rem, 4vw, 2.75rem)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            href="/"
            style={{
              color: 'inherit',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <span
              style={{
                width: '36px',
                height: '36px',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '10px',
                background: 'var(--accent-default)',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 900,
                letterSpacing: '-0.04em',
              }}
            >
              XYZ
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <strong style={{ fontSize: '1rem', letterSpacing: '-0.025em' }}>XYZ AI</strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.66rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                School assistant
              </span>
            </span>
          </Link>

          <Link
            href="/login"
            className="btn-primary"
            style={{ padding: '9px 17px', fontSize: '0.82rem', textDecoration: 'none' }}
          >
            Sign in to portal
          </Link>
        </div>
      </header>

      <section
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: 'clamp(3.5rem, 8vw, 7rem) clamp(1rem, 5vw, 3rem) clamp(3.5rem, 7vw, 6rem)',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.04fr) minmax(360px, 0.96fr)',
            gap: 'clamp(3rem, 7vw, 7rem)',
            alignItems: 'center',
          }}
        >
          <div className="animate-fade-in" style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.4rem' }}>
              <span style={{ width: '28px', height: '1px', background: 'var(--accent-default)' }} />
              <span style={sectionLabelStyle}>Applied intelligence for schools</span>
            </div>

            <h1
              style={{
                margin: 0,
                maxWidth: '700px',
                fontSize: 'clamp(2.7rem, 5.7vw, 5.15rem)',
                lineHeight: 0.98,
                letterSpacing: '-0.065em',
                fontWeight: 850,
                color: 'var(--text-primary)',
              }}
            >
              A clearer way to run the school day.
            </h1>

            <p
              style={{
                maxWidth: '590px',
                margin: '1.7rem 0 0',
                color: 'var(--text-secondary)',
                fontSize: 'clamp(1rem, 1.6vw, 1.16rem)',
                lineHeight: 1.65,
              }}
            >
              XYZ AI gives students, parents, teachers, and school leaders one dependable place to ask, act, and stay informed—with natural voice interaction, role-aware intelligence, and a human-like 3D presence.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem', marginTop: '1.6rem' }}>
              {['Voice-first', '11 languages', 'Role-aware', 'Live 3D presence'].map((pill) => (
                <span
                  key={pill}
                  style={{
                    padding: '7px 11px',
                    border: '1px solid var(--border-accent)',
                    borderRadius: '999px',
                    color: 'var(--accent-default)',
                    background: 'rgba(255,255,255,0.52)',
                    fontSize: '0.75rem',
                    fontWeight: 750,
                  }}
                >
                  {pill}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '2rem' }}>
              <button
                onClick={handlePlayIntro}
                className="btn-primary"
                style={{
                  padding: '12px 18px',
                  fontSize: '0.86rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {isPlayingIntro ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
                {isPlayingIntro ? 'Stop introduction' : 'Hear the introduction'}
              </button>
              <a
                href="#portals"
                className="btn-secondary"
                style={{
                  padding: '12px 18px',
                  fontSize: '0.86rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: 'transparent',
                }}
              >
                Choose a portal <FiArrowRight size={15} />
              </a>
            </div>
          </div>

          <div className="animate-slide-up" style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                width: '100%',
                maxWidth: '440px',
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: '18px',
                padding: '1.25rem',
                boxShadow: '0 18px 45px rgba(43, 36, 91, 0.12)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.15rem 0.2rem 1rem',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <span style={sectionLabelStyle}>Assistant preview</span>
                  <p style={{ margin: '0.3rem 0 0', fontSize: '0.9rem', fontWeight: 750 }}>Meet XYZ AI</p>
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: isPlayingIntro ? 'var(--accent-default)' : 'var(--text-muted)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: isPlayingIntro ? 'var(--accent-default)' : 'var(--border-accent)',
                    }}
                  />
                  {isPlayingIntro ? 'Speaking' : 'Ready'}
                </span>
              </div>

              <div
                style={{
                  minHeight: '275px',
                  marginTop: '1.2rem',
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '14px',
                  background: 'var(--bg-card)',
                  border: `1px solid ${isPlayingIntro ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
                  boxShadow: isPlayingIntro ? 'var(--shadow-accent)' : 'none',
                  transition: 'all var(--transition-normal)',
                }}
              >
                <ThreeAvatar role="student" voiceStatus={voiceStatus} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', gap: '1rem' }}>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: 1.45 }}>
                  Ask about attendance, records, or the next action for your role.
                </p>
                <button
                  onClick={handlePlayIntro}
                  className="btn-ghost"
                  style={{ flexShrink: 0, padding: '7px 0', fontSize: '0.76rem', color: 'var(--accent-default)', fontWeight: 750 }}
                >
                  {isPlayingIntro ? 'Pause' : 'Test voice'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="portals"
        style={{
          background: '#ffffff',
          padding: 'clamp(4rem, 8vw, 7rem) clamp(1rem, 5vw, 3rem)',
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'end',
              justifyContent: 'space-between',
              gap: '1.5rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <span style={sectionLabelStyle}>Role selection</span>
              <h2 style={{ margin: '0.55rem 0 0', fontSize: 'clamp(1.9rem, 3.4vw, 3rem)', lineHeight: 1.05, letterSpacing: '-0.045em', fontWeight: 820 }}>
                One system. Four perspectives.
              </h2>
            </div>
            <p style={{ maxWidth: '420px', margin: 0, color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Start with the workspace that matches your responsibility. Each portal presents only the tools and records that belong to that role.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1px',
              marginTop: '2.2rem',
              background: 'var(--border-subtle)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {PORTALS.map((portal) => {
              const Icon = portal.icon;
              return (
                <Link
                  key={portal.role}
                  href={portal.href}
                  style={{
                    minHeight: '255px',
                    padding: '1.55rem',
                    background: '#ffffff',
                    color: 'inherit',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'background var(--transition-normal), transform var(--transition-normal)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                      <span
                        style={{
                          width: '40px',
                          height: '40px',
                          display: 'grid',
                          placeItems: 'center',
                          borderRadius: '10px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <Icon size={19} color="var(--accent-default)" />
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.64rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        {portal.badge}
                      </span>
                    </div>
                    <h3 style={{ margin: '1.45rem 0 0.55rem', fontSize: '1.05rem', fontWeight: 800 }}>{portal.title}</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.58 }}>{portal.description}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: '1rem', paddingTop: '1.25rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', lineHeight: 1.35 }}>
                      Demo access<br />
                      <strong style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>{portal.demoEmail}</strong>
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-default)', fontSize: '0.78rem', fontWeight: 800 }}>
                      Enter <FiArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section
        style={{
          background: '#ffffff',
          borderTop: '1px solid var(--border-subtle)',
          padding: 'clamp(4rem, 8vw, 7rem) clamp(1rem, 5vw, 3rem)',
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(230px, 0.72fr) minmax(0, 1.28fr)', gap: 'clamp(2rem, 8vw, 8rem)', alignItems: 'start' }}>
            <div>
              <span style={sectionLabelStyle}>System architecture</span>
              <h2 style={{ margin: '0.65rem 0 0', maxWidth: '330px', fontSize: 'clamp(1.9rem, 3.2vw, 2.8rem)', lineHeight: 1.06, letterSpacing: '-0.045em', fontWeight: 820 }}>
                Designed for trust at school scale.
              </h2>
              <p style={{ margin: '1rem 0 0', maxWidth: '320px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65 }}>
                Voice is the interface. Authorization is the foundation. Every response is shaped around the role and record being requested.
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
              {FEATURES.map((feature) => {
                const FeatureIcon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '42px minmax(0, 0.8fr) minmax(0, 1.2fr)',
                      gap: '1.25rem',
                      alignItems: 'start',
                      padding: '1.3rem 0',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    <span style={{ color: 'var(--accent-default)', fontSize: '0.7rem', fontWeight: 850, letterSpacing: '0.08em' }}>{feature.index}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <FeatureIcon size={17} color="var(--accent-default)" />
                      <h3 style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.3, fontWeight: 800 }}>{feature.title}</h3>
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.55 }}>{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <footer
        style={{
          marginTop: 'auto',
          background: '#ffffff',
          borderTop: '1px solid var(--border-subtle)',
          padding: '1.35rem clamp(1rem, 4vw, 2.75rem)',
          color: 'var(--text-muted)',
          fontSize: '0.76rem',
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <span><strong style={{ color: 'var(--text-primary)' }}>XYZ AI</strong> · Human-like AI school assistant</span>
          <span>School ERP ecosystem · Standalone applied AI</span>
        </div>
      </footer>
    </main>
  );
}
