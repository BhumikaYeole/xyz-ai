'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { FiBookOpen, FiUsers, FiUser, FiGrid, FiMail, FiLock, FiLogIn } from 'react-icons/fi';

const ROLE_META = {
  student:   { label: 'Student',   Icon: FiBookOpen, accent: '#6366f1' },
  parent:    { label: 'Parent',    Icon: FiUsers,    accent: '#8b5cf6' },
  teacher:   { label: 'Teacher',   Icon: FiUser,     accent: '#06b6d4' },
  principal: { label: 'Principal', Icon: FiGrid,     accent: '#f59e0b' },
};

const DEMO_CREDS = {
  student:   { email: 'rahul@school.xyz',  password: 'student123' },
  parent:    { email: 'priya@parent.xyz',   password: 'parent123' },
  teacher:   { email: 'anita@school.xyz',   password: 'teacher123' },
  principal: { email: 'vikram@school.xyz',  password: 'principal123' },
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<keyof typeof ROLE_META | null>(null);

  useEffect(() => {
    if (!loading && user) {
      const portal = { student: '/student-portal', parent: '/parent-portal', teacher: '/staff-portal', principal: '/management-portal' }[user.role];
      router.replace(portal);
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);
    if (!result.success) { setError(result.error ?? 'Login failed'); return; }
    router.push(searchParams.get('from') ?? result.redirectTo ?? '/');
  };

  const fillDemo = (role: keyof typeof ROLE_META) => {
    setEmail(DEMO_CREDS[role].email);
    setPassword(DEMO_CREDS[role].password);
    setActiveRole(role);
    setError('');
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)', top: '-100px', right: '-100px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)', bottom: '-80px', left: '-80px', pointerEvents: 'none' }} />

      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="gradient-text" style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>XYZ AI</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sign in to your school portal</p>
        </div>

        {/* Quick demo buttons */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Quick demo login</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {(Object.entries(ROLE_META) as [keyof typeof ROLE_META, typeof ROLE_META[keyof typeof ROLE_META]][]).map(([role, meta]) => {
              const Icon = meta.Icon;
              return (
                <button
                  key={role}
                  id={`demo-${role}`}
                  type="button"
                  onClick={() => fillDemo(role)}
                  style={{
                    background: activeRole === role ? `${meta.accent}22` : 'var(--bg-card)',
                    border: `1px solid ${activeRole === role ? meta.accent : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '0.6rem 0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: activeRole === role ? meta.accent : 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Icon size={15} /> {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label htmlFor="email" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem' }}>
                <FiMail size={13} /> Email
              </label>
              <input id="email" type="email" className="input-field" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>

            <div>
              <label htmlFor="password" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem' }}>
                <FiLock size={13} /> Password
              </label>
              <input id="password" type="password" className="input-field" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', color: '#fca5a5', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <button id="login-submit" type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '0.25rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <FiLogIn size={16} /> {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <a href="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>← Back to home</a>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
