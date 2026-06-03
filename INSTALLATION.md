# Panduan Instalasi Lokal (SmartBiz AI)

Ikuti langkah-langkah di bawah ini untuk menjalankan SmartBiz AI di lingkungan lokal Anda.

---

## 1. Prasyarat

Pastikan perangkat Anda telah terinstal:
- **Node.js** (versi v18 atau v20 LTS)
- **NPM** (bawaan Node.js) atau **Yarn**
- **Docker & Docker Compose** (jika ingin menjalankan PostgreSQL menggunakan kontainer)
- **PostgreSQL** (jika menggunakan database lokal tanpa Docker)

---

## 2. Salin Repositori & Persiapan Environtment Variables

### A. Konfigurasi Backend (`/backend/.env`)

Buat berkas `.env` di dalam folder `/backend` dengan konfigurasi sebagai berikut:

```env
PORT=5000
NODE_ENV=development

# Database Connection URL (Sesuaikan kredensial PostgreSQL Anda)
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/smartbiz_ai?schema=public"

# JWT Secret untuk Autentikasi Keamanan
JWT_SECRET="ganti_dengan_secret_kunci_jwt_anda_yang_sangat_panjang_dan_aman"
JWT_EXPIRES_IN="2h"

# OpenAI API Key untuk Fitur AI (RAG, Marketing Content, Predictions)
OPENAI_API_KEY="sk-proj-..."

# Integrasi Notifikasi WhatsApp (Fonnte / Twilio Mock API Credentials)
WHATSAPP_API_TOKEN="token_api_whatsapp_anda"
WHATSAPP_SENDER_NUMBER="08123456789"
```

### B. Konfigurasi Frontend (`/frontend/.env.local`)

Buat berkas `.env.local` di dalam folder `/frontend` dengan konfigurasi berikut:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"
NEXTAUTH_SECRET="ganti_dengan_secret_kunci_nextauth_anda"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 3. Instalasi Dependensi & Setup Database

Jalankan perintah ini secara berurutan:

### Langkah 1: Jalankan PostgreSQL dengan Docker
Jika Anda tidak memiliki PostgreSQL lokal, Anda dapat menyalakan container database menggunakan docker-compose yang disediakan di root:
```bash
docker-compose up -d db
```

### Langkah 2: Setup Database & Generate Prisma Client (pada `/backend`)
Buka terminal baru pada direktori `/backend`:
```bash
# Masuk ke direktori backend
cd backend

# Install package dependensi
npm install

# Jalankan migrasi schema database
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Jalankan seed data untuk data uji UMKM awal
npm run db:seed
```

### Langkah 3: Jalankan Backend Development Server (pada `/backend`)
```bash
npm run dev
```
Backend API akan berjalan pada: `http://localhost:5000`

---

## 4. Setup Frontend Client (pada `/frontend`)

Buka terminal baru pada direktori `/frontend`:
```bash
# Masuk ke direktori frontend
cd frontend

# Install package dependensi
npm install

# Jalankan frontend development server
npm run dev
```
Frontend Web App akan berjalan pada: `http://localhost:3000`

---

## 5. Akun Demo untuk Pengujian

Setelah menjalankan script seeding database, Anda dapat login menggunakan akun berikut untuk menguji fitur multi-tenancy & RBAC:

1. **Owner Account** (Akses semua fitur, analitik, dan pengaturan)
   - Email: `owner@tokosejahtera.com`
   - Password: `Password123`
2. **Admin Account** (Mengelola stok barang dan CRUD CRM pelanggan)
   - Email: `admin@tokosejahtera.com`
   - Password: `Password123`
3. **Staff Account** (Akses kasir/POS transaksi penjualan)
   - Email: `staff@tokosejahtera.com`
   - Password: `Password123`
