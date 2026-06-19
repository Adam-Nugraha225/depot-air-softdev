'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Droplets, Mail, Lock, Eye, EyeOff, User, ArrowRight, Loader2, ShieldCheck, Truck, ShoppingCart } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'BUYER' | 'VENDOR'>('BUYER');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password harus minimal 6 karakter.');
      showToast('Password harus minimal 6 karakter.', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      showToast('Password dan konfirmasi password tidak cocok.', 'warning');
      return;
    }
    setIsLoading(true);
    try {
      await register(name, email, password, role);
      showToast('Registrasi berhasil! Mengarahkan ke dashboard...', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Form Section */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md animate-fade-in bg-[#F4F8FC] rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 mb-1">Silakan masukkan detail Anda</h2>
            <p className="text-sm text-slate-500">untuk mendaftar</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-slide-up">
              {error}
            </div>
          )}

          {/* Pill Tabs Selector */}
          <div className="flex bg-[#E8EFF7] p-1 rounded-xl mb-6">
            <Link
              href="/login"
              className="flex-1 py-2 text-center text-sm font-semibold rounded-lg text-slate-400 hover:text-slate-600"
            >
              Masuk
            </Link>
            <button
              type="button"
              className="flex-1 py-2 text-center text-sm font-semibold rounded-lg bg-white text-primary-600 shadow-sm"
            >
              Daftar
            </button>
          </div>

          {/* Role Selector */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('BUYER')}
              className={`flex-1 p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                role === 'BUYER'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-350'
              }`}
            >
              <ShoppingCart className="w-5 h-5 mx-auto mb-1 text-primary-500" />
              <p className="font-bold text-xs">Pembeli</p>
              <p className="text-[10px] mt-0.5 opacity-70">Pesan air bersih</p>
            </button>
            <button
              type="button"
              onClick={() => setRole('VENDOR')}
              className={`flex-1 p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                role === 'VENDOR'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-350'
              }`}
            >
              <Truck className="w-5 h-5 mx-auto mb-1 text-primary-500" />
              <p className="font-bold text-xs">Vendor</p>
              <p className="text-[10px] mt-0.5 opacity-70">Jual & kirim air</p>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500" />
                <input
                  id="register-name"
                  type="text"
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-850 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                  placeholder=""
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500" />
                <input
                  id="register-email"
                  type="email"
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-850 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                  placeholder=""
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-12 pr-12 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-850 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Konfirmasi Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500" />
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full pl-12 pr-12 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-850 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                  placeholder=""
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-md transition-all text-sm mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Daftar <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="my-5 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">atau</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <button
            id="register-google-login"
            type="button"
            className="w-full flex items-center justify-center gap-3 px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-all duration-200 text-sm shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Login with Google
          </button>
        </div>
      </div>

      {/* Right Hero Section - Pure background image as in PDF */}
      <div 
        className="hidden lg:block lg:w-1/2 bg-cover bg-center" 
        style={{ backgroundImage: "url('/images/bg.png')" }}
      />
    </div>
  );
}
