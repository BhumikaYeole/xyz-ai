import Link from 'next/link';
import { FiBookOpen, FiUsers, FiUser, FiGrid, FiArrowRight } from 'react-icons/fi';

const roles = [
  { role: 'student',   title: 'Student Portal',    description: 'View your attendance and chat with your AI academic assistant.', Icon: FiBookOpen, href: '/student-portal' },
  { role: 'parent',    title: 'Parent Portal',      description: "Check your child's attendance and stay connected with the school.", Icon: FiUsers,    href: '/parent-portal' },
  { role: 'teacher',   title: 'Staff Portal',       description: 'Mark attendance and manage your class with AI assistance.', Icon: FiUser,     href: '/staff-portal' },
  { role: 'principal', title: 'Management Portal',  description: 'View school-wide analytics and monitor attendance trends.', Icon: FiGrid,     href: '/management-portal' },
];

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-default)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>School ERP Ecosystem</p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.75rem', lineHeight: 1.1 }}>XYZ AI</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '480px', lineHeight: 1.6 }}>
          Your human-like AI school assistant.<br />Select your role to get started.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', maxWidth: '1000px', width: '100%' }}>
        {roles.map((r, i) => (
          <Link
            key={r.role}
            href={r.href}
            className="card card-hover animate-slide-up"
            style={{
              padding: '1.75rem',
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              animationDelay: `${i * 80}ms`,
              animationFillMode: 'backwards',
            }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <r.Icon size={20} color="var(--accent-default)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>{r.title}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>{r.description}</p>
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-default)', fontSize: '0.85rem', fontWeight: 600 }}>
              Enter Portal <FiArrowRight size={14} />
            </div>
          </Link>
        ))}
      </div>

      <p style={{ marginTop: '2.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
        XYZ AI — Human-Like School Assistant
      </p>
    </main>
  );
}
