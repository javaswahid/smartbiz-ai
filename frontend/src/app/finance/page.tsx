'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../lib/api';

export default function FinancePage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Date filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      let endpoint = '/transactions';
      const params = [];
      if (startDate) params.push(`startDate=${startDate}`);
      if (endDate) params.push(`endDate=${endDate}`);
      if (params.length > 0) endpoint += `?${params.join('&')}`;

      const res = await api.get(endpoint);
      setTransactions(res.data || []);
    } catch (error) {
      console.error('Failed to load transaction ledger:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    try {
      const token = api.getToken();
      let exportUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/transactions/export?format=${format}`;
      
      if (startDate) exportUrl += `&startDate=${startDate}`;
      if (endDate) exportUrl += `&endDate=${endDate}`;
      if (token) exportUrl += `&token=${token}`; // Query authorization attachment helper if needed, or trigger client-side download:

      // Create a hidden anchor to fetch and download with bearer headers
      fetch(exportUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = format === 'excel' ? 'Laporan_Keuangan.csv' : 'Laporan_Keuangan.txt';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(err => console.error('Export download failed:', err));

    } catch (err) {
      console.error('Export trigger failed:', err);
    }
  };

  // Calculations
  const grossSales = transactions.reduce((sum, t) => sum + Number(t.totalAmount), 0);
  const totalTax = transactions.reduce((sum, t) => sum + Number(t.tax), 0);
  const totalDiscount = transactions.reduce((sum, t) => sum + Number(t.discount), 0);
  const netEarnings = transactions.reduce((sum, t) => sum + Number(t.netAmount), 0);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6 text-left">
        <div>
          <h1 className="text-2xl font-black text-white">Laporan Keuangan & Buku Kas</h1>
          <p className="text-slate-400 text-xs mt-1">Audit jurnal pengeluaran dan omset masuk disertai generator ekspor dokumen</p>
        </div>

        {/* Date Filter & Export panel */}
        <div className="glass p-5 rounded-2xl flex flex-col sm:flex-row items-end justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex flex-col gap-1 text-left">
              <label className="text-[10px] font-bold text-slate-500">Tanggal Mulai</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1 text-left">
              <label className="text-[10px] font-bold text-slate-500">Tanggal Selesai</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={fetchLedger}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg transition-colors mt-4 sm:mt-0"
            >
              Filter Jurnal
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('excel')}
              className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              📥 Ekspor Excel (CSV)
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              📄 Ekspor PDF (TXT)
            </button>
          </div>
        </div>

        {/* Aggregate metric cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass p-5 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Omset Kotor (Subtotal)</span>
            <div className="text-lg font-black text-white mt-1">Rp {grossSales.toLocaleString('id-ID')}</div>
          </div>
          <div className="glass p-5 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Pajak PPN Terkumpul</span>
            <div className="text-lg font-black text-amber-500 mt-1">Rp {totalTax.toLocaleString('id-ID')}</div>
          </div>
          <div className="glass p-5 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Promosi Potongan Diskon</span>
            <div className="text-lg font-black text-red-400 mt-1">- Rp {totalDiscount.toLocaleString('id-ID')}</div>
          </div>
          <div className="glass p-5 rounded-2xl border border-blue-500/20">
            <span className="text-[10px] font-bold text-blue-400 uppercase">Pendapatan Bersih</span>
            <div className="text-lg font-black text-blue-400 mt-1">Rp {netEarnings.toLocaleString('id-ID')}</div>
          </div>
        </div>

        {/* Detailed ledger table */}
        <div className="glass p-6 rounded-2xl flex flex-col gap-4">
          <h3 className="font-extrabold text-sm text-white">Jurnal Kas Transaksi Penjualan</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-bold text-left">
                  <th className="pb-3">Nomor Invoice</th>
                  <th className="pb-3">Tanggal Jurnal</th>
                  <th className="pb-3">Kasir / Operator</th>
                  <th className="pb-3">Nama Pelanggan</th>
                  <th className="pb-3 text-right">Potongan Diskon</th>
                  <th className="pb-3 text-right">Nilai Bersih (IDR)</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-slate-900/60 hover:bg-slate-900/20">
                    <td className="py-3 font-bold text-white">{t.invoiceNumber}</td>
                    <td className="py-3 text-slate-400">{new Date(t.createdAt).toLocaleDateString('id-ID')}</td>
                    <td className="py-3 text-slate-400">{t.user?.name || 'Kasir'}</td>
                    <td className="py-3 text-slate-400">{t.customer?.name || 'Walk-in Customer'}</td>
                    <td className="py-3 text-right text-red-400">- Rp {Number(t.discount).toLocaleString('id-ID')}</td>
                    <td className="py-3 text-right font-black text-blue-400">Rp {Number(t.netAmount).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Tidak ada data kas transaksi tercatat dalam rentang tanggal ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
