'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { FiBookOpen, FiUsers, FiUser, FiGrid, FiLogOut, FiGlobe } from 'react-icons/fi';
import { LANGUAGES } from '@/lib/languages';

const ROLE_ICONS: Record<string, React.ElementType> = {
  student: FiBookOpen,
  parent: FiUsers,
  teacher: FiUser,
  principal: FiGrid,
};

const PORTAL_LABELS: Record<string, string> = {
  student: 'Student Portal',
  parent: 'Parent Portal',
  teacher: 'Staff Portal',
  principal: 'Management Portal',
};

interface NavbarProps {
  language: string;
  onLanguageChange: (lang: string) => void;
}

export default function Navbar({ language, onLanguageChange }: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user) return null;

  const Icon = ROLE_ICONS[user.role];

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--accent-default)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color="white" />
        </div>
        <div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>{PORTAL_LABELS[user.role]}</p>
          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>{user.name}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FiGlobe size={14} color="var(--text-muted)" />
          <select
            className="lang-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            aria-label="Select language"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.nativeName}</option>
            ))}
          </select>
        </div>

        <button id="navbar-logout" onClick={handleLogout} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
          <FiLogOut size={14} /> Sign Out
        </button>
      </div>
    </nav>
  );
}
