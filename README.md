# 🚰 Vendor-Hub — Platform Distribusi Air Digital

> Platform *marketplace* distribusi air yang menghubungkan **Vendor (Distributor Air)** dengan **Pembeli (Buyer)** secara digital, transparan, dan efisien dalam satu sistem terintegrasi.

---

## 👥 Tim Pengembang

| Nama | Role |
|---|---|
| [Nama Anggota 1] | Backend Engineer |
| [Muhammad Arif Billah] | Frontend Engineer |
| [Nama Anggota 3] | UI/UX Designer |

---

## 📌 Deskripsi Produk

Distribusi air bersih dalam skala besar di Indonesia masih dilakukan secara konvensional dan tidak efisien. Pembeli (gudang, industri, perumahan) kesulitan menemukan vendor air terpercaya, membandingkan harga, dan memantau status pengiriman secara real-time. Di sisi vendor, pengelolaan armada truk tangki dan pesanan masih dilakukan secara manual.

**Vendor-Hub** hadir sebagai solusi — platform web yang mempertemukan Vendor dan Buyer dalam satu ekosistem digital yang modern, transparan, dan mudah digunakan.

### Fitur Unggulan
- 🔐 **Autentikasi Aman** — Register & Login untuk Buyer dan Vendor menggunakan JWT
- 🔍 **Pencarian Vendor** — Temukan vendor air berdasarkan nama, harga/liter, dan kapasitas
- 📦 **Pemesanan Digital** — Buat pesanan air dengan perhitungan tagihan otomatis
- 🚛 **Manajemen Armada** — Vendor dapat mengelola truk dan menugaskannya ke pesanan aktif
- 📋 **Riwayat Transaksi** — Lacak status pesanan dari Menunggu Konfirmasi hingga Selesai
- 📊 **Dashboard Analitik** — Ringkasan pendapatan dan pengiriman sukses untuk Vendor
- 💬 **Chat** — Komunikasi langsung antara Buyer dan Vendor

---

## 🛠️ Tech Stack

### Backend
| Teknologi | Kegunaan |
|---|---|
| **Node.js** | Runtime environment |
| **Express.js** | Framework REST API |
| **Prisma ORM** | Pengelolaan & query database |
| **SQLite** | Database (lokal/development) |
| **PostgreSQL** | Database (production/deployment) |
| **JSON Web Token (JWT)** | Autentikasi & keamanan |
| **bcrypt** | Enkripsi password |
| **Joi** | Validasi input request |
| **dotenv** | Manajemen environment variable |
| **nodemon** | Auto-restart server saat development |

### Frontend
| Teknologi | Kegunaan |
|---|---|
| **Next.js** | Framework UI (React) |
| **Vercel** | Deployment Frontend |

### Arsitektur
- **MVC Pattern** — Route → Controller → Database (Prisma)
- **JWT Middleware** — Proteksi endpoint dengan role-based access (BUYER / VENDOR)
- **Global Error Handler** — Penanganan error terpusat dan konsisten

---

## 📁 Struktur Proyek

```
depot-air-softdev/
├── prisma/
│   └── schema.prisma        # Definisi skema & relasi database
├── src/
│   ├── controllers/         # Business logic per fitur
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── vendor.controller.js
│   │   ├── order.controller.js
│   │   ├── fleet.controller.js
│   │   ├── analytics.controller.js
│   │   └── chat.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js    # JWT Auth & role check
│   │   └── error.middleware.js   # Global error handler
│   ├── routes/              # Definisi endpoint REST API
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── vendor.routes.js
│   │   ├── order.routes.js
│   │   ├── fleet.routes.js
│   │   ├── analytics.routes.js
│   │   └── chat.routes.js
│   ├── utils/
│   │   ├── db.js            # Prisma Client instance
│   │   └── response.js      # Standarisasi format response JSON
│   └── index.js             # Entry point & konfigurasi Express
├── .env                     # Environment variables (tidak di-push)
├── .gitignore
├── package.json
└── README.md
```

---

## 📡 Dokumentasi API Endpoint

Base URL (Lokal): `http://localhost:5001`

> Semua endpoint (kecuali `/api/auth/*`) membutuhkan header:
> `Authorization: Bearer <token>`

### 🔐 Auth (`/api/auth`)
| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Daftar akun baru (BUYER/VENDOR) | ❌ |
| POST | `/api/auth/login` | Login & dapatkan JWT token | ❌ |
| POST | `/api/auth/google-login` | Login via Google (Mock) | ❌ |

### 👤 Users (`/api/users`)
| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| GET | `/api/users/profile` | Lihat profil sendiri | ✅ |
| PUT | `/api/users/profile` | Update profil | ✅ |
| GET | `/api/users/addresses` | Daftar alamat pengiriman | ✅ |
| POST | `/api/users/addresses` | Tambah alamat baru | ✅ |
| GET | `/api/users/payment-methods` | Daftar metode pembayaran | ✅ |
| POST | `/api/users/payment-methods` | Tambah metode pembayaran | ✅ |

### 🏪 Vendors (`/api/vendors`)
| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| GET | `/api/vendors` | Cari semua vendor (`?search=nama`) | ✅ |
| GET | `/api/vendors/:id` | Detail vendor beserta armada | ✅ |
| PUT | `/api/vendors/profile` | Update profil vendor (harga/kapasitas) | ✅ VENDOR |

### 📦 Orders (`/api/orders`)
| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| POST | `/api/orders` | Buat pesanan baru (tagihan dihitung otomatis) | ✅ BUYER |
| GET | `/api/orders` | Riwayat pesanan (`?status=SELESAI`) | ✅ |
| GET | `/api/orders/:id` | Detail pesanan | ✅ |
| PUT | `/api/orders/:id/status` | Update status pesanan | ✅ VENDOR |

**Siklus Status Pesanan:**
`MENUNGGU_KONFIRMASI` → `DIKONFIRMASI` → `DISIAPKAN` → `DALAM_PERJALANAN` → `SELESAI` (atau `DITOLAK`)

### 🚛 Fleets (`/api/fleets`)
| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| GET | `/api/fleets` | Daftar armada truk milik vendor | ✅ VENDOR |
| POST | `/api/fleets` | Tambah truk baru | ✅ VENDOR |
| PUT | `/api/fleets/:id/status` | Update status truk | ✅ VENDOR |
| POST | `/api/fleets/assign` | Assign truk ke pesanan | ✅ VENDOR |

### 📊 Analytics (`/api/analytics`)
| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| GET | `/api/analytics/dashboard` | Pendapatan & pengiriman sukses | ✅ VENDOR |

### 💬 Chats (`/api/chats`)
| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| GET | `/api/chats/:userId` | Riwayat percakapan dengan user | ✅ |
| POST | `/api/chats` | Kirim pesan | ✅ |

---

## 🚀 Cara Menjalankan Aplikasi Lokal

### Prasyarat
- Node.js v18+ sudah terinstall
- Git sudah terinstall

### Langkah-langkah

**1. Clone Repository**
```bash
git clone https://github.com/[username]/[repo-name].git
cd [repo-name]
```

**2. Install Dependensi**
```bash
npm install
```

**3. Buat File Environment**
Buat file `.env` di root project:
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-secret-key-here"
PORT=5001
```

**4. Buat Tabel Database**
```bash
npx prisma db push
npx prisma generate
```

**5. Jalankan Server**
```bash
npm run dev
```
Server berjalan di `http://localhost:5001`

**6. (Opsional) Lihat Database via GUI**
```bash
npx prisma studio
```
Buka `http://localhost:5555` di browser.

---

## ☁️ Deployment

### Backend — Railway / Render

1. Buat database **PostgreSQL gratis** di [Neon.tech](https://neon.tech) atau [Supabase](https://supabase.com)
2. Ubah `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Set Environment Variables di Railway/Render:
   ```
   DATABASE_URL = postgresql://...
   JWT_SECRET   = your-secret-key
   PORT         = 8080
   ```
4. Deploy & jalankan build command: `npx prisma db push && node src/index.js`

### Frontend — Vercel
- Hubungkan GitHub repo ke Vercel
- Set environment variable `NEXT_PUBLIC_API_URL` ke URL backend yang sudah di-deploy

---

## 📄 Lisensi
MIT License — Final Project Software Development 2026
