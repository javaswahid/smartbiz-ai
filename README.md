# SmartBiz AI - Platform SaaS UMKM Masa Depan

SmartBiz AI adalah platform Software-as-a-Service (SaaS) terpadu berbasis AI yang didesain khusus untuk membantu pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) di Indonesia dalam mengelola operasional bisnis secara digital, modern, dan cerdas.

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

## Panduan Cepat

Untuk memulai proyek di komputer lokal Anda atau men-deploy ke cloud, silakan baca dokumentasi berikut:

1. **[Panduan Instalasi Lokal (INSTALLATION.md)](file:///C:/Users/DELL/.gemini/antigravity/scratch/smartbiz-ai/INSTALLATION.md)**
2. **[Panduan Deployment Produksi (DEPLOYMENT.md)](file:///C:/Users/DELL/.gemini/antigravity/scratch/smartbiz-ai/DEPLOYMENT.md)**
3. **[Panduan Kontribusi & Git Workflow (CONTRIBUTING.md)](file:///C:/Users/DELL/.gemini/antigravity/scratch/smartbiz-ai/CONTRIBUTING.md)**
4. **[Dokumentasi API Detail (API.md)](file:///C:/Users/DELL/.gemini/antigravity/scratch/smartbiz-ai/docs/API.md)**
