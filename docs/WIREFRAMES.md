# SmartBiz AI UI Wireframes & Layout Specs

This document defines the interface mockups and page structures for the responsive Next.js frontend application.

---

## 1. Global Page Layout (Grid System)

```
+------------------------------------------------------------------------------------+
|  [Logo] SmartBiz AI   | Business: Toko Makmur Jaya   | Notification (Bell) | User  |
+------------------------------------------------------------------------------------+
| Sidebar Navigation    | Main Workspace Area                                        |
|                       |                                                            |
| - Dashboard [Active]  | +--------------------------------------------------------+ |
| - Produk & Stok       | | Welcome back, Budi!                                    | |
| - CRM Pelanggan       | +--------------------------------------------------------+ |
| - Transaksi Kasir     | | [ KPI Card 1 ]   [ KPI Card 2 ]   [ KPI Card 3 ]       | |
| - Laporan Keuangan    | | Revenue: IDR 12M  Profit: IDR 5M   Low Stock: 4 Items   | |
| - AI Assistant (Chat) | +--------------------------------------------------------+ |
| - AI Prediksi         | |                                                        | |
| - AI Marketing        | |  [Sales Trend Area Chart]                              | |
| - Pengaturan          | |                                                        | |
|                       | +--------------------------------------------------------+ |
|                       | | Recent Sales Logs | Low Stock Alert Bulletins          | |
|                       | +--------------------------------------------------------+ |
+------------------------------------------------------------------------------------+
```

---

## 2. Point of Sales (POS) / Kasir Interface

```
+--------------------------------------------------------+---------------------------+
| Item Catalog Search                                    | Billing Cart / Ringkasan  |
| [ Search SKU / Product Name...                       ] |                           |
+--------------------------------------------------------+ Customer: [ Walk-in     v] |
| +-------------------+  +-------------------+           | +-----------------------+ |
| | Kopi Gula Aren    |  | Kopi Cappuccino   |           | | Kopi Gula Aren x2     | |
| | SKU: KS-GA-01     |  | SKU: KP-CP-02     |           | | Subtotal: 36,000      | |
| | Rp 18.000         |  | Rp 22.000         |           | |                       | |
| | Stock: 5 [LOW]    |  | Stock: 50         |           | | Kopi Cappuccino x1    | |
| | [ + Tambah ]      |  | [ + Tambah ]      |           | | Subtotal: 22,000      | |
| +-------------------+  +-------------------+           | +-----------------------+ |
| +-------------------+  +-------------------+           | Diskon: [ Rp 5.000    ] |
| | Roti Bakar Coklat |  | Kentang Goreng    |           | Pajak:  [ 10%         ] |
| | SKU: RT-BC-03     |  | SKU: KT-GR-04     |           |                         | |
| | Rp 15.000         |  | Rp 12.000         |           | Total Bayar: Rp 58,000  | |
| | Stock: 20         |  | Stock: 15         |           +-------------------------+ |
| | [ + Tambah ]      |  | [ + Tambah ]      |           | [ PROSES PEMBAYARAN ]   | |
| +-------------------+  +-------------------+           +---------------------------+
```

---

## 3. AI Chat Assistant & RAG Interface

```
+------------------------------------------------------------------------------------+
| AI Chat Assistant - Tanya AI Bisnis Anda                                           |
+------------------------------------------------------------------------------------+
| [System] SmartBiz AI Chatbot connected to database. Ask about sales, CRM, etc.     |
|                                                                                    |
| User: Berapa revenue bersih kita dari penjualan kategori 'Minuman' di bulan Mei?   |
|                                                                                    |
| AI: Revenue bersih Anda untuk kategori 'Minuman' di bulan Mei adalah Rp 4.520.000.  |
|     Ini disumbangkan oleh penjualan Kopi Susu Gula Aren sebanyak 210 cup dan       |
|     Kopi Cappuccino sebanyak 85 cup.                                               |
|     [Rekomendasi]: Tingkatkan stok Kopi Susu Gula Aren karena trennya naik 12%.    |
|                                                                                    |
| User: Tulis draf SMS promosi loyalty points untuk pelanggan 'Agus'                 |
|                                                                                    |
| AI: [Salin ke Papan Klip]                                                          |
|     "Halo Kak Agus! Terima kasih telah setia berbelanja di Toko Makmur Jaya.       |
|     Poin Loyalty Kakak sekarang adalah 120 poin. Dapatkan gratis 1 Kopi Cappuccino |
|     dengan menukarkan 50 poin pada kunjungan berikutnya!"                          |
+------------------------------------------------------------------------------------+
| [ Tulis pertanyaan atau instruksi pemasaran di sini...                  ] [ Kirim ] |
+------------------------------------------------------------------------------------+
```
