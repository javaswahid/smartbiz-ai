'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../lib/api';

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; sources?: string[] }[]>([
    { role: 'assistant', content: 'Halo! Saya SmartBiz AI, asisten virtual dan penasihat keuangan toko Anda. Tanyakan data penjualan, stok menipis, strategi omset, atau konten pemasaran WhatsApp Anda!' }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Document uploader states
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docLoading, setDocLoading] = useState(false);
  const [docSuccess, setDocSuccess] = useState('');
  const [docError, setDocError] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const user = api.getUser();
    if (user) {
      setUserRole(user.role);
    }
  }, []);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || chatLoading) return;

    const userMessage = inputMsg.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInputMsg('');
    setChatLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: userMessage });
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: res.reply,
        sources: res.sources || []
      }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Maaf, terjadi gangguan koneksi dengan server AI. Periksa kembali API Key OpenAI Anda.'
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setDocSuccess('');
    setDocError('');
    setDocLoading(true);

    try {
      await api.post('/ai/knowledge', {
        title: docTitle,
        content: docContent,
      });

      setDocSuccess('Dokumen baru berhasil disimpan ke basis pengetahuan RAG AI!');
      setDocTitle('');
      setDocContent('');
    } catch (err: any) {
      setDocError(err.message || 'Gagal menyimpan dokumen RAG');
    } finally {
      docLoading && setDocLoading(false);
      // Ensure local state toggles off
      setDocLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6 text-left">
        <div>
          <h1 className="text-2xl font-black text-white">SmartBiz AI Assistant</h1>
          <p className="text-slate-400 text-xs mt-1">Interaksi chatbot pintar dengan basis pengetahuan manual & pencatatan database toko Anda</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 max-h-[calc(100vh-160px)]">
          
          {/* Chat Window panel */}
          <div className="lg:col-span-2 glass rounded-2xl flex flex-col justify-between overflow-hidden h-[550px]">
            
            {/* Header info */}
            <div className="bg-slate-900/60 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-300">Asisten Virtual Terkoneksi (RAG Engine)</span>
              </div>
              <button 
                onClick={() => setMessages([{ role: 'assistant', content: 'Riwayat obrolan dibersihkan. Bagaimana saya bisa membantu Anda hari ini?' }])}
                className="text-[10px] text-slate-500 hover:text-slate-300"
              >
                Clear Chat
              </button>
            </div>

            {/* Bubble list */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-slate-950/20">
              {messages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col max-w-[80%] ${m.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
                >
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-slate-900 border border-slate-800/80 text-slate-200 rounded-bl-none'
                  }`}>
                    {m.content}
                  </div>
                  
                  {/* Sources tag indicator */}
                  {m.sources && m.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5 self-start">
                      <span className="text-[9px] text-slate-500 font-semibold mr-1">Rujukan Dokumen:</span>
                      {m.sources.map((s, sIdx) => (
                        <span key={sIdx} className="bg-slate-900 border border-slate-800 text-slate-400 text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                          📖 {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {chatLoading && (
                <div className="self-start flex items-center gap-2 bg-slate-900 border border-slate-800/80 p-3 rounded-2xl rounded-bl-none text-xs text-slate-500">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>

            {/* Input Form footer */}
            <form onSubmit={handleSendChat} className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center gap-3">
              <input
                type="text"
                required
                placeholder="Tanyakan omset laris, stok kopi aren, atau ketik instruksi promosi..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={chatLoading}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold px-4 py-3 rounded-xl text-xs transition-colors shrink-0"
              >
                Kirim
              </button>
            </form>
          </div>

          {/* Context uploader card */}
          <div className="flex flex-col gap-4">
            {userRole !== 'STAFF' ? (
              <div className="glass p-6 rounded-2xl flex flex-col gap-4 text-left">
                <div>
                  <h3 className="font-extrabold text-sm text-white">Suplai Basis Pengetahuan RAG</h3>
                  <p className="text-[10px] text-slate-500">Unggah SOP manual toko atau racikan menu agar AI mengetahuinya</p>
                </div>

                {docSuccess && (
                  <div className="bg-emerald-950/60 border border-emerald-500/20 text-emerald-300 text-xs px-3 py-2 rounded-lg">
                    ✅ {docSuccess}
                  </div>
                )}
                {docError && (
                  <div className="bg-red-950/60 border border-red-500/20 text-red-300 text-xs px-3 py-2 rounded-lg">
                    ⚠️ {docError}
                  </div>
                )}

                <form onSubmit={handleUploadDoc} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400">Judul Dokumen Context</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Prosedur Refund Pelanggan"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400">Isi Konten Dokumen</label>
                    <textarea
                      required
                      rows={6}
                      placeholder="Tuliskan petunjuk operasional lengkap..."
                      value={docContent}
                      onChange={(e) => setDocContent(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={docLoading}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-lg text-xs transition-colors mt-1"
                  >
                    {docLoading ? 'Mengupload...' : 'UNGGAH DOKUMEN CONTEXT'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="glass p-6 rounded-2xl text-slate-400 text-xs text-center py-12">
                Akun Staff tidak memiliki izin untuk mengunggah dokumen referensi ke AI Knowledge base.
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
