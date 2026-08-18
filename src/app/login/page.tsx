'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { FiBookOpen, FiUsers, FiUser, FiGrid, FiMail, FiLock, FiLogIn } from 'react-icons/fi';

const ROLE_META = {
  student:   { label: 'Student',   Icon: FiBookOpen },
  parent:    { label: 'Parent',    Icon: FiUsers },
  teacher:   { label: 'Teacher',   Icon: FiUser },
  principal: { label: 'Principal', Icon: FiGrid },
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
      const portals: Record<string, string> = { student: '/student-portal', parent: '/parent-portal', teacher: '/staff-portal', principal: '/management-portal' };
      router.replace(portals[user.role] ?? '/');
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
    <main style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>XYZ AI</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Sign in to your school portal</p>
        </div>

        {/* Demo role quick-fill */}
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Quick demo login</p>
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
                    background: activeRole === role ? 'var(--bg-card)' : '#fff',
                    border: `1px solid ${activeRole === role ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '0.55rem 0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    color: activeRole === role ? 'var(--accent-default)' : 'var(--text-secondary)',
                    fontSize: '0.83rem',
                    fontWeight: 500,
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Icon size={14} /> {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ padding: '1.75rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label htmlFor="email" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                <FiMail size={12} /> Email
              </label>
              <input id="email" type="email" className="input-field" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>

            <div>
              <label htmlFor="password" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                <FiLock size={12} /> Password
              </label>
              <input id="password" type="password" className="input-field" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.9rem', color: '#dc2626', fontSize: '0.83rem' }}>
                {error}
              </div>
            )}

            <button id="login-submit" type="submit" className="btn-primary" disabled={isLoading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem' }}>
              <FiLogIn size={15} /> {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <a href="/" style={{ color: 'var(--text-muted)', fontSize: '0.83rem', textDecoration: 'none' }}>← Back to home</a>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
