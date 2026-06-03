'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (api.getToken()) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      api.setToken(res.token);
      api.setUser(res.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center px-4 font-sans relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="glass p-8 rounded-2xl w-full max-w-md border border-slate-800 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md mx-auto mb-3">
            S
          </div>
          <h2 className="text-2xl font-black text-white">Selamat Datang Kembali</h2>
          <p className="text-slate-400 text-xs mt-1">Masuk untuk mengelola dashboard SmartBiz AI</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-950/50 border border-red-500/20 text-red-300 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
            ⚠️ <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold text-slate-400">Alamat Email</label>
            <input
              type="email"
              required
              placeholder="nama@bisnis.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold text-slate-400">Kata Sandi</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-2.5 rounded-lg text-sm mt-2 transition-all shadow-md shadow-blue-900/10"
          >
            {loading ? 'Menghubungkan...' : 'Masuk ke Dashboard'}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-400">
          Belum memiliki akun bisnis?{' '}
          <Link href="/register" className="text-blue-400 hover:underline">
            Daftar Gratis
          </Link>
        </div>
      </div>
    </div>
  );
}
