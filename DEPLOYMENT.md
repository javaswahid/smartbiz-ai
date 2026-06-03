# Panduan Deployment Produksi (SmartBiz AI)

Dokumen ini menjelaskan tata cara deployment platform SmartBiz AI ke server produksi, baik menggunakan VPS (Virtual Private Server) dengan Docker, maupun menggunakan serverless hosting seperti Vercel (untuk Frontend).

---

## 1. Deployment ke VPS Menggunakan Docker Compose (Rekomendasi Backend)

Metode ini membungkus database PostgreSQL, API Backend Express.js, dan Nginx (sebagai SSL/Reverse Proxy) ke dalam container terisolasi.

### Prasyarat VPS
- Linux OS (Ubuntu 20.04 LTS / 22.04 LTS sangat disarankan)
- Docker Engine versi >= 20.10
- Docker Compose versi >= 2.0
- Nama Domain (untuk konfigurasi SSL gratis Let's Encrypt)

### Langkah-langkah Deployment:

1. **Clone Repositori ke VPS**:
   ```bash
   git clone <URL_REPOSI_ANDA> /var/www/smartbiz-ai
   cd /var/www/smartbiz-ai
   ```

2. **Buat file `.env` Produksi**:
   Buat file `.env` di direktori root dengan parameter rahasia:
   ```env
   # Database Environment vars
   POSTGRES_USER=db_smartbiz_prod
   POSTGRES_PASSWORD=KeamananSangatKuatSekali999!
   POSTGRES_DB=smartbiz_ai_prod

   # Backend API Configuration
   PORT=5000
   NODE_ENV=production
   DATABASE_URL="postgresql://db_smartbiz_prod:KeamananSangatKuatSekali999!@db:5432/smartbiz_ai_prod?schema=public"
   JWT_SECRET="JWT_SECRET_RANDOM_LONG_STRING"
   JWT_EXPIRES_IN="2h"
   OPENAI_API_KEY="sk-proj-..."
   WHATSAPP_API_TOKEN="whatsapp-token-key"
   WHATSAPP_SENDER_NUMBER="08123456789"
   ```

3. **Jalankan Docker Compose**:
   Jalankan orkestrasi Docker untuk mem-build dan menjalankan seluruh container secara background (detached):
   ```bash
   docker-compose -f docker-compose.yml up -d --build
   ```

4. **Migrasi Database Produksi**:
   Jalankan perintah prisma migrate untuk menyelaraskan skema tabel PostgreSQL di dalam container:
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

---

## 2. Deployment Frontend ke Vercel

Frontend Next.js dapat di-deploy secara optimal dan otomatis melalui integrasi GitHub ke Vercel.

### Langkah-langkah Deployment:

1. Buat akun di [Vercel](https://vercel.com).
2. Hubungkan akun GitHub Anda ke Vercel dashboard.
3. Impor repositori `smartbiz-ai` dan pilih folder **`frontend`** sebagai root directory project Vercel.
4. Pada tab **Environment Variables**, tambahkan variabel berikut:
   - `NEXT_PUBLIC_API_URL`: Alamat domain API Backend Anda (contoh: `https://api.smartbiz-ai.com/api/v1`)
   - `NEXTAUTH_SECRET`: Kunci enkripsi sesi user (contoh: `NEXTAUTH_SECRET_RANDOM_KEY`)
   - `NEXTAUTH_URL`: Domain utama frontend Anda (contoh: `https://smartbiz-ai.com`)
5. Klik tombol **Deploy**. Vercel akan mem-build secara otomatis dan menyediakan domain HTTPS gratis.

---

## 3. Skrip Backup & Restore Database (PostgreSQL)

Untuk menjamin ketersediaan data dari resiko kegagalan sistem, berikut skrip backup otomatis.

### A. Skrip Backup (`/database/backup.sh`)
Buat berkas penampung backup harian:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/smartbiz"
DATETIME=$(date +'%Y%m%d_%H%M%S')
DATABASE_NAME="smartbiz_ai_prod"
CONTAINER_NAME="smartbiz-db-container"

mkdir -p $BACKUP_DIR
docker exec -t $CONTAINER_NAME pg_dump -U db_smartbiz_prod $DATABASE_NAME > $BACKUP_DIR/backup_$DATETIME.sql

# Hapus backup yang lebih tua dari 30 hari untuk hemat penyimpanan
find $BACKUP_DIR -type f -mtime +30 -name "*.sql" -exec rm -f {} \;
echo "Backup database $DATABASE_NAME selesai pada $DATETIME"
```

### B. Skrip Restore (`/database/restore.sh`)
Gunakan skrip ini untuk memulihkan database dari file `.sql`:
```bash
#!/bin/bash
BACKUP_FILE=$1
DATABASE_NAME="smartbiz_ai_prod"
CONTAINER_NAME="smartbiz-db-container"

if [ -z "$BACKUP_FILE" ]; then
  echo "Gunakan: ./restore.sh /path/ke/file_backup.sql"
  exit 1
fi

cat $BACKUP_FILE | docker exec -i $CONTAINER_NAME psql -U db_smartbiz_prod -d $DATABASE_NAME
echo "Restore database dari file $BACKUP_FILE berhasil dilakukan."
```
