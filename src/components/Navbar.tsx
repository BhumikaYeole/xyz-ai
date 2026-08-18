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

  const Icon = ROLE_ICONS[user.role] || FiUser;

  return (
    <nav className="navbar">
      {/* Left: Role Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
        <div
          style={{
            width: '50px',
            height: '50px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={17} color="white" />
        </div>
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <p
            style={{
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              lineHeight: 1,
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
          >
            {PORTAL_LABELS[user.role]}
          </p>
          <p
            style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
          >
            {user.name}
          </p>
        </div>
      </div>

      {/* Right: Language Selector & Sign Out */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <FiGlobe size={14} color="var(--accent-default)" />
          <select
            className="lang-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            aria-label="Select language"
            style={{ maxWidth: '115px' }}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeName}
              </option>
            ))}
          </select>
        </div>

        <button
          id="navbar-logout"
          onClick={handleLogout}
          className="btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          title="Sign out of current portal"
        >
          <FiLogOut size={13} />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
