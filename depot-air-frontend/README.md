# Frontend Project — Next.js

Proyek front end menggunakan **Next.js 15**, **TypeScript**, dan **Tailwind CSS**.

## 🚀 Cara memulai

```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📁 Struktur Folder

```
src/
├── app/              # App Router (halaman & layout)
├── components/
│   ├── ui/           # Komponen UI dasar (Button, Input, dll)
│   ├── layout/       # Header, Footer, Sidebar
│   └── common/       # Komponen yang dipakai bersama
├── hooks/            # Custom React hooks
├── lib/              # Konfigurasi library eksternal
├── utils/            # Fungsi helper/utilitas
├── styles/           # Global CSS
├── types/            # TypeScript type definitions
└── context/          # React Context providers
public/
├── images/           # Gambar statis
├── icons/            # Icon SVG
└── fonts/            # Font lokal
tests/
├── unit/             # Unit tests (Jest)
├── integration/      # Integration tests
└── e2e/              # End-to-end tests (Playwright)
```

## 🛠 Scripts

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Development server |
| `npm run build` | Build produksi |
| `npm run start` | Jalankan hasil build |
| `npm run lint` | Cek linting |
| `npm run test` | Jalankan unit test |
| `npm run test:e2e` | Jalankan e2e test |

## 🔧 Tech Stack

- **Next.js 15** — Framework React
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling
- **Jest + Testing Library** — Unit testing
- **Playwright** — E2E testing
