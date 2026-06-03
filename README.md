# SmartBiz AI - Platform SaaS UMKM Masa Depan

SmartBiz AI adalah platform Software-as-a-Service (SaaS) terpadu berbasis AI yang didesain khusus untuk membantu pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) di Indonesia dalam mengelola operasional bisnis secara digital, modern, dan cerdas.

**Repository GitHub**: [https://github.com/javaswahid/smartbiz-ai](https://github.com/javaswahid/smartbiz-ai)

---

## Fitur Utama

- **Multi-Tenant Architecture**: Pemisahan data bisnis yang aman untuk setiap UMKM dengan Role-Based Access Control (RBAC: Owner, Admin, Staff).
- **Dashboard KPI Analitik**: Visualisasi penjualan, margin profit, barang paling laku, dan performa keuangan secara real-time.
- **Manajemen Inventori & Stock Alert**: Monitor produk dan pengiriman pesan WhatsApp otomatis saat persediaan menipis.
- **Loyalty Program CRM**: Pencatatan data pelanggan otomatis disertai perhitungan poin loyalty untuk meningkatkan retensi.
- **AI Chat Assistant (RAG)**: Chatbot interaktif yang terhubung langsung dengan basis data toko untuk menjawab pertanyaan operasional dan analisis data.
- **AI Business Insights & Marketing Generator**: Rekomendasi strategi penjualan bulanan otomatis dan generator materi promosi media sosial sekali klik.
- **Prediksi Penjualan AI**: Model analisis deret waktu untuk meramal angka penjualan 30 hari ke depan.
- **Laporan Keuangan**: Buku kas otomatis yang dapat di-ekspor langsung ke format PDF dan Excel.

---

## Teknologi

### Frontend
- **Framework**: Next.js 14+ (App Router, Server Components)
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS
- **Komponen**: Shadcn UI / Radix primitives
- **Visualisasi**: Recharts untuk grafik performa

### Backend
- **Platform**: Node.js & Express.js
- **Bahasa**: TypeScript
- **Database ORM**: Prisma ORM
- **Database**: PostgreSQL (mendukung ekstensi `pgvector` untuk pencarian semantik AI)
- **Autentikasi**: JWT (JSON Web Tokens) dengan NextAuth terintegrasi

### AI & Integrasi
- **LLM**: OpenAI API (GPT-4o / GPT-3.5)
- **Embeddings**: OpenAI Text Embedding Ada-002
- **Notification**: WhatsApp Notification API integration (Fonnte/Twilio wrapper)

---

## Struktur Folder

```
/smartbiz-ai
├── frontend/             # Next.js App Router Client
├── backend/              # Node.js Express REST API
├── database/             # Skema Prisma, file migrasi, dan seed script
├── docs/                 # SRS, ERD, WIREFRAMES, dan Spesifikasi API
├── tests/                # Integrasi E2E menggunakan Playwright
├── docker/               # Konfigurasi Dockerfile backend dan frontend
├── docker-compose.yml    # Orkestrasi Docker untuk PostgreSQL, Backend, & Frontend
├── .github/workflows/    # CI/CD pipeline GitHub Actions
└── README.md             # Dokumentasi utama proyek
```

---

## Panduan Instalasi Lokal (Ringkasan)

1. **Persiapan berkas lingkungan**:
   - Salin file `.env` ke `/backend/.env` dan isi variabel seperti `DATABASE_URL`, `JWT_SECRET`, dan `OPENAI_API_KEY`.
   - Salin file `.env.local` ke `/frontend/.env.local` dan isi `NEXT_PUBLIC_API_URL`.

2. **Jalankan Database**:
   ```bash
   docker-compose up -d db
   ```

3. **Inisialisasi Backend**:
   ```bash
   cd backend
   npm install
   npx prisma migrate dev --name init
   npm run db:seed
   npm run dev
   ```

4. **Jalankan Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

*Untuk panduan instalasi lengkap beserta akun uji coba demo, silakan lihat [INSTALLATION.md](file:///C:/Users/DELL/.gemini/antigravity/scratch/smartbiz-ai/INSTALLATION.md).*

---

## Panduan Deployment (Ringkasan)

1. **Deployment Backend & DB ke VPS (Docker Compose)**:
   - Clone repository ke VPS Anda.
   - Buat file `.env` di root direktori VPS Anda.
   - Jalankan `docker-compose -f docker-compose.yml up -d --build`.
   - Lakukan migrasi database: `docker-compose exec backend npx prisma migrate deploy`.

2. **Deployment Frontend ke Vercel**:
   - Hubungkan repo GitHub ke akun Vercel.
   - Set folder `/frontend` sebagai root directory.
   - Tambahkan Environment Variables (`NEXT_PUBLIC_API_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`).
   - Jalankan Deploy.

*Untuk panduan deployment lengkap dan skrip backup database, silakan lihat [DEPLOYMENT.md](file:///C:/Users/DELL/.gemini/antigravity/scratch/smartbiz-ai/DEPLOYMENT.md).*

---

## Dokumentasi Proyek Lengkap

Semua dokumentasi spesifikasi teknis dan panduan dapat diakses di tautan berikut:
- **[Panduan Instalasi Lokal (INSTALLATION.md)](file:///C:/Users/DELL/.gemini/antigravity/scratch/smartbiz-ai/INSTALLATION.md)**
- **[Panduan Deployment Produksi (DEPLOYMENT.md)](file:///C:/Users/DELL/.gemini/antigravity/scratch/smartbiz-ai/DEPLOYMENT.md)**
- **[Panduan Kontribusi & Git Workflow (CONTRIBUTING.md)](file:///C:/Users/DELL/.gemini/antigravity/scratch/smartbiz-ai/CONTRIBUTING.md)**
- **[Software Requirement Specification (docs/SRS.md)](file:///C:/Users/DELL/.gemini/antigravity/scratch/smartbiz-ai/docs/SRS.md)**
- **[Entity Relationship Diagram (docs/ERD.md)](file:///C:/Users/DELL/.gemini/antigravity/scratch/smartbiz-ai/docs/ERD.md)**
- **[Dokumentasi API Detail (docs/API.md)](file:///C:/Users/DELL/.gemini/antigravity/scratch/smartbiz-ai/docs/API.md)**
- **[Desain Wireframe ASCII (docs/WIREFRAMES.md)](file:///C:/Users/DELL/.gemini/antigravity/scratch/smartbiz-ai/docs/WIREFRAMES.md)**

---

## Roadmap Pengembangan

### Fase 1: MVP (Minimum Viable Product) - *Selesai*
- [x] Manajemen tenant & multi-tenant onboarding.
- [x] Manajemen produk & inventori dengan notifikasi stok menipis.
- [x] CRM Pelanggan & loyalty points tracking.
- [x] Modul POS (Point of Sale) kasir sederhana & kalkulasi poin.
- [x] Laporan keuangan & buku kas sederhana.

### Fase 2: Integrasi AI & Komunikasi - *Selesai*
- [x] AI Chat Assistant bisnis menggunakan RAG berbasis database produk & transaksi.
- [x] Prediksi tren penjualan 30 hari ke depan dengan Linear Regression.
- [x] WhatsApp notification engine (Fonnte mock/prod) untuk pengiriman invoice dan alert stok.
- [x] Generator copy marketing media sosial berbasis data produk.

### Fase 3: Skalabilitas & Fitur Lanjutan - *Mendatang*
- [ ] Fitur multi-outlet untuk satu tenant bisnis.
- [ ] Integrasi payment gateway (Midtrans / Xendit) untuk pembayaran digital di kasir.
- [ ] AI Chatbot otomatis yang bertindak sebagai CS Toko di WhatsApp secara langsung (Omnichannel).
- [ ] Laporan pajak otomatis (PPH Final UMKM 0.5%).
- [ ] Sinkronisasi produk & stok ke Marketplace (Tokopedia, Shopee).
