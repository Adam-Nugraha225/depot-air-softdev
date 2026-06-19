'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Droplets, Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push(user.role === 'VENDOR' ? '/seller/dashboard' : '/buyer/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
      <div className="text-center animate-pulse-soft">
        <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mx-auto mb-6">
          <Droplets className="w-10 h-10 text-accent-300" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">AquaLink</h1>
        <p className="text-slate-400 mb-6">Water Distribution Platform</p>
        <Loader2 className="w-6 h-6 text-white animate-spin mx-auto" />
      </div>
    </main>
  );
}
