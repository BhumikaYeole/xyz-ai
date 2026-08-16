'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function StudentPortalPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'student')) router.replace('/login');
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading || !user) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: '200px', height: '40px' }} />
      </main>
    );
  }

  return (
    <main data-role="student" style={{ minHeight: '100vh', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%)', top: '-150px', right: '-100px', pointerEvents: 'none' }} />

      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-student)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🎓</div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student Portal</p>
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</p>
          </div>
        </div>
        <button id="student-logout" onClick={handleLogout} className="btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>Sign Out</button>
      </div>

      {/* Coming-soon chat area placeholder */}
      <div className="glass-card animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Chat with XYZ AI</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Hi <strong>{user.name}</strong>! Your AI academic assistant is ready. You can ask things like:<br />
          <em style={{ color: '#6366f1' }}>"What is my attendance?"</em>
        </p>
        <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1.5rem', color: '#818cf8', fontSize: '0.9rem' }}>
          Chat interface coming in Phase 5
        </div>
      </div>
    </main>
  );
}
