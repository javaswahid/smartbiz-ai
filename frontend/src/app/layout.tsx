import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SmartBiz AI - Manajemen UMKM Cerdas & Penasihat AI',
  description: 'Kelola kasir/POS, inventori barang, database pelanggan CRM, laporan keuangan, dan perkiraan prediksi penjualan UMKM Anda secara otomatis dengan bantuan AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
