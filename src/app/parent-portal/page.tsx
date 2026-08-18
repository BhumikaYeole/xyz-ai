'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import ChatInterface from '@/components/ChatInterface';

export default function ParentPortalPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'parent')) router.replace('/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="skeleton" style={{ position: 'fixed', inset: 0 }} />;
  }

  return (
    <div data-role="parent" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar language={language} onLanguageChange={setLanguage} />
      <div className="page-content" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div className="card" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <ChatInterface userRole="parent" language={language} />
        </div>
      </div>
    </div>
  );
}
