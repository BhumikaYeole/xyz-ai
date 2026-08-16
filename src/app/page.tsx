import Link from 'next/link';
import { FiBookOpen, FiUsers, FiUser, FiGrid } from 'react-icons/fi';

const roles = [
  {
    role: 'student',
    title: 'Student Portal',
    description: 'View your attendance, chat with your AI academic assistant, and get help with school queries.',
    icon: FiBookOpen,
    href: '/student-portal',
    gradient: 'linear-gradient(135deg, #6366f1, #818cf8)',
    accent: '#6366f1',
  },
  {
    role: 'parent',
    title: 'Parent Portal',
    description: "Check your child's attendance, communicate with the school, and stay informed.",
    icon: FiUsers,
    href: '/parent-portal',
    gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    accent: '#8b5cf6',
  },
  {
    role: 'teacher',
    title: 'Staff Portal',
    description: 'Mark attendance, manage your class, and use AI to streamline your teaching workflow.',
    icon: FiUser,
    href: '/staff-portal',
    gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)',
    accent: '#06b6d4',
  },
  {
    role: 'principal',
    title: 'Management Portal',
    description: 'View school-wide analytics, monitor attendance trends, and manage the institution.',
    icon: FiGrid,
    href: '/management-portal',
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    accent: '#f59e0b',
  },
];

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)', top: '-150px', right: '-100px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1), transparent 70%)', bottom: '-100px', left: '-50px', pointerEvents: 'none' }} />

      <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
        <h1 className="gradient-text" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem', lineHeight: 1.1 }}>
          XYZ AI
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(1rem, 2vw, 1.25rem)', maxWidth: '600px', lineHeight: 1.6 }}>
          Your human-like AI school assistant. Select your role to get started.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', maxWidth: '1100px', width: '100%', position: 'relative', zIndex: 1 }}>
        {roles.map((r, index) => {
          const Icon = r.icon;
          return (
            <Link
              key={r.role}
              href={r.href}
              className="glass-card glass-card-hover animate-slide-up"
              style={{ padding: '2rem', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '1rem', animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
            >
              <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', background: r.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={24} color="white" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>{r.title}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>{r.description}</p>
              </div>
              <div style={{ marginTop: 'auto', color: r.accent, fontSize: '0.875rem', fontWeight: 600 }}>Enter Portal →</div>
            </Link>
          );
        })}
      </div>

      <p style={{ marginTop: '3rem', color: 'var(--text-muted)', fontSize: '0.8rem', position: 'relative', zIndex: 1 }}>
        XYZ AI — School ERP Ecosystem
      </p>
    </main>
  );
}
