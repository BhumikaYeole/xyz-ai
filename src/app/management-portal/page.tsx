'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { FiGrid } from 'react-icons/fi';
import ChatInterface from '@/components/ChatInterface';

export default function ManagementPortalPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'principal')) router.replace('/login');
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
    <main data-role="principal" style={{ minHeight: '100vh', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.1), transparent 70%)', top: '-150px', left: '-100px', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-principal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiGrid size={20} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Management Portal</p>
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</p>
          </div>
        </div>
        <button id="principal-logout" onClick={handleLogout} className="btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>Sign Out</button>
      </div>

      <div className="glass-card animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', position: 'relative', zIndex: 1, height: '700px', display: 'flex', flexDirection: 'column' }}>
        <ChatInterface userRole="principal" />
      </div>
    </main>
  );
}
