# Panduan Kontribusi (SmartBiz AI)

Kami sangat senang Anda tertarik berkontribusi pada pengembangan platform SmartBiz AI! Untuk menjaga kualitas basis kode tetap bersih, aman, dan mudah dipelihara, mohon ikuti panduan berikut ini.

---

## 1. Aturan Commit Git

Kami menggunakan format commit pesan terstruktur (Conventional Commits). Setiap pesan commit harus diawali dengan salah satu awalan berikut:

- `feat:` Untuk penambahan fitur baru (misal: `feat: add WhatsApp stock notification`)
- `fix:` Untuk perbaikan bug atau error (misal: `fix: resolve JWT expiration crash`)
- `docs:` Untuk perubahan pada berkas dokumentasi (misal: `docs: update installation steps`)
- `refactor:` Untuk penulisan ulang kode tanpa mengubah perilakunya (misal: `refactor: simplify sales query handler`)
- `test:` Untuk penambahan atau perbaikan unit/integration tests (misal: `test: add user login API test`)

*Contoh Commit yang Baik:*
`feat: implement multi-tenant dashboard KPI metrics`

---

## 2. Alur Branching Git

1. Lakukan Fork repositori ini atau buat branch baru dari branch `main`:
   `git checkout -b feature/nama-fitur-anda`
2. Tulis kode Anda sesuai standar arsitektur bersih.
3. Jalankan unit test lokal terlebih dahulu:
   - Backend: `npm run test` (di `/backend`)
   - Frontend: `npm run build` (di `/frontend` untuk verifikasi build TypeScript)
4. Buat Pull Request (PR) ke branch `main` dengan deskripsi jelas mengenai apa yang ditambahkan atau diperbaiki.

---

## 3. Standar Koding & Clean Architecture

Setiap kontributor diharapkan mematuhi aturan penulisan kode berikut:

- **SOLID Principles**:
  - *Single Responsibility*: Pisahkan router, controller, validator, dan business logic (service). Jangan campur adukkan query Prisma langsung di dalam router.
  - *Dependency Inversion*: Gunakan dependency injection atau modular class untuk mempermudah mocking saat pembuatan unit test.
- **Security Best Practices**:
  - Jangan pernah menyimpan secrets (API Keys, DB password, JWT secret) di dalam file kode. Selalu gunakan environment variables (`process.env`).
  - Lakukan validasi skema input menggunakan `Zod` di controller sebelum memproses data.
  - Pastikan semua API response menyembunyikan field sensitif seperti `passwordHash` milik user.
- **TypeScript Strict Mode**:
  - Hindari penggunaan tipe data `any`. Tulis interface atau type secara eksplisit untuk menjamin keamanan static-typing compiler.
