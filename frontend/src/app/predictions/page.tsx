'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../lib/api';

export default function PredictionsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Forecast states
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [predictionsData, setPredictionsData] = useState<any[]>([]);
  const [growthRate, setGrowthRate] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [forecastLoading, setForecastLoading] = useState(false);

  // Copywriting generator states
  const [selectedProductId, setSelectedProductId] = useState('');
  const [channel, setChannel] = useState('Instagram');
  const [tone, setTone] = useState('Friendly / Casual');
  const [generatedCopy, setGeneratedCopy] = useState('');
  const [copyLoading, setCopyLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchForecast();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchForecast = async () => {
    setForecastLoading(true);
    try {
      const res = await api.get('/ai/predict-sales');
      setHistoricalData(res.data.historical || []);
      setPredictionsData(res.data.predictions || []);
      setGrowthRate(res.data.growthRate || 0);
      setExplanation(res.data.explanation || '');
    } catch (err) {
      console.error(err);
    } finally {
      setForecastLoading(false);
      setLoading(false);
    }
  };

  const handleGenerateCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;
    setGeneratedCopy('');
    setCopyLoading(true);
    setCopied(false);

    try {
      const res = await api.post('/ai/marketing-content', {
        productId: selectedProductId,
        channel,
        tone,
      });
      setGeneratedCopy(res.content);
    } catch (err: any) {
      alert(err.message || 'Gagal merancang materi iklan');
    } finally {
      setCopyLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!generatedCopy) return;
    navigator.clipboard.writeText(generatedCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6 text-left">
        <div>
          <h1 className="text-2xl font-black text-white">AI Prediksi & Marketing</h1>
          <p className="text-slate-400 text-xs mt-1">Perkiraan omset deret waktu linear serta perancangan materi pemasaran digital sekali klik</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sales forecast graph representation panel */}
          <div className="lg:col-span-2 glass p-6 rounded-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-white">AI Peramalan Penjualan (30 Hari Ke Depan)</h3>
                <p className="text-[10px] text-slate-500">Estimasi model regresi deret waktu historis</p>
              </div>
              <span className="text-xs font-black text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                Pertumbuhan: +{growthRate}%
              </span>
            </div>

            {/* Simulated bar forecast chart visual */}
            <div className="h-56 flex items-end justify-between gap-2.5 pt-8 pb-2 border-b border-slate-800">
              {historicalData.slice(-4).map((h, idx) => {
                const height = Math.min(150, Math.max(20, (h.amount / 1500000) * 150));
                return (
                  <div key={`hist-${idx}`} className="flex-1 flex flex-col items-center gap-1.5">
                    <div 
                      className="w-full bg-slate-800 hover:bg-slate-700 rounded-md transition-all shadow-md"
                      style={{ height: `${height}px` }}
                    />
                    <span className="text-[8px] text-slate-500 truncate max-w-[50px]">{h.date}</span>
                    <span className="text-[7px] text-slate-600 font-extrabold uppercase">Historis</span>
                  </div>
                );
              })}
              {predictionsData.map((p, idx) => {
                const height = Math.min(150, Math.max(20, (p.amount / 1500000) * 150));
                return (
                  <div key={`pred-${idx}`} className="flex-1 flex flex-col items-center gap-1.5">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 hover:brightness-110 rounded-md transition-all shadow-lg"
                      style={{ height: `${height}px` }}
                    />
                    <span className="text-[8px] text-slate-400 truncate max-w-[50px]">{p.date}</span>
                    <span className="text-[7px] text-blue-500 font-extrabold uppercase">Proyeksi</span>
                  </div>
                );
              })}
            </div>

            <div className="text-xs text-slate-400 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
              📖 <strong>Catatan Penasihat AI:</strong> {explanation || 'Memuat analisis pola deret waktu...'}
            </div>
          </div>

          {/* Copywriting generator Form panel */}
          <div className="glass p-6 rounded-2xl flex flex-col gap-4 text-left">
            <div>
              <h3 className="font-extrabold text-sm text-white">AI Copywriter Iklan</h3>
              <p className="text-[10px] text-slate-500">Buat materi promosi penjualan instan dengan tone khusus</p>
            </div>

            <form onSubmit={handleGenerateCopy} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400">Pilih Produk Promosi</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                >
                  <option value="">-- Pilih SKU Produk --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400">Saluran Iklan</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="WhatsApp Broadcast">WhatsApp</option>
                    <option value="Facebook Ads">Facebook</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400">Gaya Bahasa (Tone)</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="Friendly / Casual">Friendly/Santai</option>
                    <option value="Informative / Professional">Profesional</option>
                    <option value="Hype / Bold Sales">Persuasif/Heboh</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={copyLoading || !selectedProductId}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-xs transition-colors mt-2"
              >
                {copyLoading ? 'Menyusun Iklan...' : 'GENERATE MATERI IKLAN'}
              </button>
            </form>

            {/* Generated results rendering window */}
            {generatedCopy && (
              <div className="flex-grow flex flex-col justify-between border border-slate-800 rounded-xl p-3 bg-slate-950/60 mt-2 min-h-[160px]">
                <pre className="text-[10px] leading-relaxed text-slate-300 font-sans whitespace-pre-wrap select-all max-h-[150px] overflow-y-auto pr-1 text-left">
                  {generatedCopy}
                </pre>
                <button
                  onClick={handleCopyToClipboard}
                  className="w-full mt-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[10px] font-bold py-1.5 rounded text-slate-300 transition-colors"
                >
                  {copied ? '✅ Disalin ke Clipboard' : '📋 Salin Teks Iklan'}
                </button>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
