'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('F&B');
  const [businessScale, setBusinessScale] = useState<'Mikro' | 'Kecil' | 'Menengah'>('Mikro');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        businessName,
        businessCategory,
        businessScale,
        address,
        phone,
      });

      api.setToken(res.token);
      api.setUser(res.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Gagal melakukan pendaftaran. Silakan periksa data input Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center px-4 py-12 font-sans relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="glass p-8 rounded-2xl w-full max-w-xl border border-slate-800 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md mx-auto mb-3">
            S
          </div>
          <h2 className="text-2xl font-black text-white">Daftarkan Bisnis UMKM Anda</h2>
          <p className="text-slate-400 text-xs mt-1">Langkah awal mendominasi pasar lokal dengan kecerdasan AI</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-950/50 border border-red-500/20 text-red-300 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
            ⚠️ <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <h3 className="text-xs font-extrabold uppercase text-blue-400 md:col-span-2 tracking-wider border-b border-slate-800 pb-1.5 mt-2">
            Informasi Pemilik (Owner Account)
          </h3>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[11px] font-semibold text-slate-400">Nama Lengkap</label>
            <input
              type="text"
              required
              placeholder="Budi Santoso"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[11px] font-semibold text-slate-400">Email Bisnis</label>
            <input
              type="email"
              required
              placeholder="budi@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left md:col-span-2">
            <label className="text-[11px] font-semibold text-slate-400">Kata Sandi Akun</label>
            <input
              type="password"
              required
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <h3 className="text-xs font-extrabold uppercase text-blue-400 md:col-span-2 tracking-wider border-b border-slate-800 pb-1.5 mt-4">
            Profil Usaha (Tenant Business)
          </h3>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[11px] font-semibold text-slate-400">Nama Toko/Bisnis</label>
            <input
              type="text"
              required
              placeholder="Toko Makmur Jaya"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[11px] font-semibold text-slate-400">No. WhatsApp Bisnis</label>
            <input
              type="text"
              required
              placeholder="0812xxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[11px] font-semibold text-slate-400">Kategori Bisnis</label>
            <select
              value={businessCategory}
              onChange={(e) => setBusinessCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="F&B">F&B (Makanan & Minuman)</option>
              <option value="Retail">Retail Toko Kelontong</option>
              <option value="Jasa">Jasa Salon/Laundry</option>
              <option value="Fashion">Fashion & Pakaian</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[11px] font-semibold text-slate-400">Skala Usaha</label>
            <select
              value={businessScale}
              onChange={(e) => setBusinessScale(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Mikro">Mikro (Omset &lt; Rp 2M/th)</option>
              <option value="Kecil">Kecil (Omset &lt; Rp 15M/th)</option>
              <option value="Menengah">Menengah (Omset &gt; Rp 15M/th)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 text-left md:col-span-2">
            <label className="text-[11px] font-semibold text-slate-400">Alamat Fisik Toko</label>
            <textarea
              placeholder="Jl. Raya Kebon Jeruk No. 12, Jakarta Barat"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full md:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:bg-slate-800 text-white font-bold py-3 rounded-lg text-sm mt-4 transition-all"
          >
            {loading ? 'Mendaftarkan Bisnis...' : 'Buat Akun & Mulai Bisnis'}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-400">
          Sudah memiliki akun?{' '}
          <Link href="/login" className="text-blue-400 hover:underline">
            Masuk Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
