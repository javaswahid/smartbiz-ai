import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
            S
          </div>
          <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            SmartBiz <span className="text-blue-500 font-medium text-lg">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold hover:text-blue-400 transition-colors">
            Masuk
          </Link>
          <Link href="/register" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-md shadow-blue-900/20">
            Coba Gratis
          </Link>
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden">
        {/* Background ambient light */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-indigo-600/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 relative z-10">
          <span className="px-3 py-1 text-xs font-semibold text-blue-400 bg-blue-900/30 border border-blue-500/20 rounded-full">
            🚀 Platform Cerdas UMKM Siap Produksi
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-100 to-slate-400">
            Kembangkan Bisnis UMKM Anda <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              Dengan Kecerdasan AI Terpadu
            </span>
          </h1>
          <p className="text-slate-400 max-w-2xl text-base md:text-lg leading-relaxed">
            SmartBiz AI membantu Anda mengelola POS Kasir, memonitor stok barang dengan notifikasi WhatsApp otomatis, mencatat loyalty points pelanggan, dan menganalisis omset penjualan secara prediktif dalam satu dashboard modern.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
            <Link href="/register" className="w-full sm:w-auto text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 transition-all text-base">
              Mulai Uji Coba Gratis
            </Link>
            <Link href="/login" className="w-full sm:w-auto text-center border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold px-8 py-3.5 rounded-xl transition-all">
              Login ke Akun
            </Link>
          </div>
        </div>

        {/* 3. Core Features Section */}
        <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-28 px-4 relative z-10">
          <div className="glass p-8 rounded-2xl flex flex-col items-start gap-3 hover:translate-y-[-4px] transition-all">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xl font-bold">
              📊
            </div>
            <h3 className="font-bold text-lg text-white">Analitik & KPI Dashboard</h3>
            <p className="text-slate-400 text-sm leading-relaxed text-left">
              Monitor ringkasan omset penjualan harian, margin keuntungan kotor, dan total member CRM secara real-time disertai grafis area chart trend interaktif.
            </p>
          </div>

          <div className="glass p-8 rounded-2xl flex flex-col items-start gap-3 hover:translate-y-[-4px] transition-all">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xl font-bold">
              💬
            </div>
            <h3 className="font-bold text-lg text-white">Asisten AI Bisnis (RAG)</h3>
            <p className="text-slate-400 text-sm leading-relaxed text-left">
              Tanyakan kebijakan refund toko, resep racikan menu rahasia, atau performa barang paling laku pada chatbot AI pintar yang terintegrasi dengan database manual Anda.
            </p>
          </div>

          <div className="glass p-8 rounded-2xl flex flex-col items-start gap-3 hover:translate-y-[-4px] transition-all">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl font-bold">
              💡
            </div>
            <h3 className="font-bold text-lg text-white">Prediksi & AI Marketing</h3>
            <p className="text-slate-400 text-sm leading-relaxed text-left">
              Dapatkan prediksi deret waktu angka penjualan 30 hari ke depan secara otomatis dan racik materi copywriting promosi Instagram serta broadcast WA instan.
            </p>
          </div>
        </section>

        {/* 4. Mini Pricing Tier Grid */}
        <section className="max-w-4xl mx-auto mt-28">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-white">Pilih Paket Cerdas Bisnis Anda</h2>
          <p className="text-slate-400 text-sm md:text-base max-w-md mx-auto mb-10">Didesain ramah di kantong pelaku UMKM Indonesia demi mempercepat akselerasi digitalisasi bisnis.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
            <div className="glass p-8 rounded-2xl border border-slate-800 text-left flex flex-col gap-6">
              <div>
                <h4 className="font-bold text-lg text-slate-300">Paket UMKM Pemula</h4>
                <div className="text-3xl font-extrabold text-white mt-2">Rp 0 <span className="text-xs text-slate-400 font-normal">/ selamanya</span></div>
                <p className="text-xs text-slate-400 mt-2">Untuk mencoba fitur POS kasir dasar dan loyalty member gratis.</p>
              </div>
              <ul className="text-xs text-slate-300 flex flex-col gap-2 flex-grow">
                <li>✓ POS Kasir Dasar & 1 Staff</li>
                <li>✓ Katalog Produk (Maks 50 item)</li>
                <li>✓ CRM Pelanggan & Loyalty</li>
                <li>✗ Fitur AI Chat & Insights</li>
              </ul>
              <Link href="/register" className="w-full text-center bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors">
                Mulai Gratis
              </Link>
            </div>

            <div className="glass p-8 rounded-2xl border border-blue-500/30 text-left flex flex-col gap-6 relative">
              <span className="absolute -top-3 right-4 bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">Paling Populer</span>
              <div>
                <h4 className="font-bold text-lg text-blue-400">SmartBiz AI Pro</h4>
                <div className="text-3xl font-extrabold text-white mt-2">Rp 149.000 <span className="text-xs text-slate-400 font-normal">/ bulan</span></div>
                <p className="text-xs text-slate-400 mt-2">Semua yang Anda butuhkan untuk memaksimalkan omset dengan AI.</p>
              </div>
              <ul className="text-xs text-slate-300 flex flex-col gap-2 flex-grow">
                <li>✓ Unlimited Products & Staff</li>
                <li>✓ POS Transaksi Kasir & Notif WA</li>
                <li>✓ Ekspor Laporan Keuangan Excel/PDF</li>
                <li>✓ AI Assistant (RAG) & Insights</li>
                <li>✓ AI Prediksi Penjualan 30 Hari</li>
              </ul>
              <Link href="/register" className="w-full text-center bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-lg transition-colors">
                Daftar Paket Pro
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 5. Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 SmartBiz AI. All rights reserved. Hubungkan bisnis Anda dengan teknologi digital termutakhir.</p>
      </footer>
    </div>
  );
}
