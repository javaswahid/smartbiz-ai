'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../lib/api';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Loyalty adjust states
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [adjustPoints, setAdjustPoints] = useState(10);
  const [adjustAction, setAdjustAction] = useState<'ADD' | 'REDEEM'>('ADD');
  const [adjustSuccess, setAdjustSuccess] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers');
      setCustomers(res.data || []);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setSubmitLoading(true);

    try {
      await api.post('/customers', { name, phone, email });
      setSuccessMsg('Pelanggan CRM baru berhasil terdaftar!');
      setName('');
      setPhone('');
      setEmail('');
      fetchCustomers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mendaftarkan pelanggan');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAdjustPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdjustSuccess('');
    if (!selectedCustomerId) return;

    try {
      await api.post(`/customers/${selectedCustomerId}/loyalty`, {
        points: adjustPoints,
        action: adjustAction,
      });

      setAdjustSuccess(`Berhasil memproses poin loyalty ${adjustAction === 'ADD' ? '+' : '-'}${adjustPoints}!`);
      setAdjustPoints(10);
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'Gagal memproses penyesuaian poin');
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6 text-left">
        <div>
          <h1 className="text-2xl font-black text-white">CRM & Loyalty Program</h1>
          <p className="text-slate-400 text-xs mt-1">Kelola data interaksi member pelanggan serta program penukaran poin promo toko</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CRM table list */}
          <div className="lg:col-span-2 glass p-6 rounded-2xl flex flex-col gap-4">
            <h3 className="font-extrabold text-sm text-white">Database Pelanggan Toko</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-bold text-left">
                    <th className="pb-3">Nama Pelanggan</th>
                    <th className="pb-3">Nomor WhatsApp</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3 text-right">Poin Loyalty</th>
                    <th className="pb-3 text-center">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="border-b border-slate-900/60 hover:bg-slate-900/20">
                      <td className="py-3 font-bold text-white">{c.name}</td>
                      <td className="py-3 text-slate-400">{c.phone}</td>
                      <td className="py-3 text-slate-400">{c.email}</td>
                      <td className="py-3 text-right font-black text-blue-400">{c.points} Poin</td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedCustomerId(c.id);
                            setAdjustAction('REDEEM');
                            setAdjustPoints(50);
                          }}
                          className="px-2.5 py-1 bg-blue-900/30 border border-blue-500/20 text-[10px] text-blue-400 rounded-md hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          Tukar 50 Poin
                        </button>
                      </td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        Belum ada pelanggan CRM terdaftar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form controls panel */}
          <div className="flex flex-col gap-6">
            
            {/* Register customer card */}
            <div className="glass p-6 rounded-2xl flex flex-col gap-4">
              <div>
                <h3 className="font-extrabold text-sm text-white">Daftarkan Member Baru</h3>
                <p className="text-[10px] text-slate-500">Buat profil pelanggan dan inisialisasi akun loyalty</p>
              </div>

              {successMsg && (
                <div className="bg-emerald-950/60 border border-emerald-500/20 text-emerald-300 text-xs px-3 py-2 rounded-lg">
                  ✅ {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="bg-red-950/60 border border-red-500/20 text-red-300 text-xs px-3 py-2 rounded-lg">
                  ⚠️ {errorMsg}
                </div>
              )}

              <form onSubmit={handleRegisterCustomer} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400">Nama Pelanggan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rian Pratama"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    required
                    placeholder="0812345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400">Email (Opsional)</label>
                  <input
                    type="email"
                    placeholder="rian@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-xs transition-colors mt-2"
                >
                  {submitLoading ? 'Mendaftarkan...' : 'DAFTARKAN MEMBER'}
                </button>
              </form>
            </div>

            {/* Quick point adjustment module */}
            <div className="glass p-6 rounded-2xl flex flex-col gap-4">
              <div>
                <h3 className="font-extrabold text-sm text-white">Penyesuaian Manual Poin</h3>
                <p className="text-[10px] text-slate-500">Lakukan penambahan atau penukaran poin loyalty member</p>
              </div>

              {adjustSuccess && (
                <div className="bg-emerald-950/60 border border-emerald-500/20 text-emerald-300 text-xs px-3 py-2 rounded-lg">
                  ✅ {adjustSuccess}
                </div>
              )}

              <form onSubmit={handleAdjustPoints} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400">Pilih Member</label>
                  <select
                    required
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="">-- Hubungkan Pelanggan --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.points} Pts)</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400">Tindakan</label>
                    <select
                      value={adjustAction}
                      onChange={(e) => setAdjustAction(e.target.value as any)}
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    >
                      <option value="ADD">Tambah (+)</option>
                      <option value="REDEEM">Tukar (-)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400">Nominal Poin</label>
                    <input
                      type="number"
                      required
                      value={adjustPoints}
                      onChange={(e) => setAdjustPoints(Math.max(1, Number(e.target.value)))}
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!selectedCustomerId}
                  className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-white font-bold py-2.5 rounded-lg text-xs transition-colors mt-2"
                >
                  PROSES POIN LOYALTY
                </button>
              </form>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
