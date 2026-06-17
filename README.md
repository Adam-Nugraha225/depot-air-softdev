# Vendor-Hub Backend (MVP)

Backend API untuk aplikasi Vendor-Hub, dibangun menggunakan Express.js, Prisma, dan SQLite untuk kemudahan pengembangan lokal. Ini adalah bagian dari Final Project Software Development.

## Fitur Utama
- **Autentikasi:** JWT & bcrypt (Login/Register Buyer & Vendor).
- **Pengguna:** Manajemen profil, alamat pengiriman, metode pembayaran.
- **Vendor:** Pencarian vendor, manajemen profil vendor, analitik (dashboard).
- **Transaksi:** Pembuatan pesanan air, riwayat transaksi, update status.
- **Armada (Fleet):** Kelola armada truk dan penugasan ke pesanan.
- **Chat:** Sistem pesan berbasis REST API.

## Tech Stack
- **Node.js & Express.js:** Framework backend.
- **Prisma:** ORM (Object-Relational Mapping).
- **SQLite:** Database (Default untuk pengembangan lokal).
- **JWT (JSON Web Token):** Autentikasi.
- **Joi:** Validasi request.

## Persiapan & Menjalankan Aplikasi Lokal

1. **Clone & Install Dependensi:**
   ```bash
   npm install
   ```

2. **Setup Database:**
   Pastikan file `.env` sudah memiliki `DATABASE_URL="file:./dev.db"`.
   Lalu jalankan perintah ini untuk membuat tabel database:
   ```bash
   npx prisma db push
   ```

3. **Jalankan Server:**
   ```bash
   npm run dev
   ```
   Server akan berjalan di `http://localhost:5000`.

## Panduan Deployment (Ke Railway / Render)

SQLite **TIDAK DIREKOMENDASIKAN** untuk deployment serverless/PaaS seperti Render atau Railway karena sistem penyimpanannya *ephemeral* (data hilang saat server restart). Anda harus menggunakan **PostgreSQL**.

### Cara Migrasi ke PostgreSQL untuk Deployment:
1. Buat database PostgreSQL gratis di [Supabase](https://supabase.com/) atau [Neon](https://neon.tech/).
2. Dapatkan *Connection String* PostgreSQL Anda.
3. Ubah file `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql" // Ubah dari "sqlite" ke "postgresql"
   }
   ```
4. Ubah file `.env` dengan connection string PostgreSQL Anda:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
   ```
5. Buat migrasi baru (opsional tapi disarankan jika dari awal):
   ```bash
   npx prisma db push
   ```
6. Commit dan push perubahan ini ke GitHub, lalu hubungkan ke Railway/Render. Jangan lupa set `DATABASE_URL` di *environment variables* Railway/Render.

## Tim (Contoh)
- Frontend Engineer: [Nama Anggota]
- Backend Engineer: [Nama Anggota]
