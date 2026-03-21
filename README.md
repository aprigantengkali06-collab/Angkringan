appapapapapap
# Angkringan. — Sistem Kasir & Manajemen

PWA berbasis Next.js untuk manajemen kasir angkringan.

## Stack
- **Next.js 14** (App Router)
- **Recharts** (grafik)
- **Vercel** (hosting)

## Struktur Project

```
angkringan/
├── app/
│   ├── layout.js       → Root layout + metadata PWA
│   ├── page.js         → Entry point
│   └── globals.css     → CSS reset minimal
├── components/
│   └── AngkringanApp.jsx  → Seluruh aplikasi
├── public/
│   └── manifest.json   → PWA manifest
├── next.config.mjs
└── package.json
```

## Deploy ke Vercel

1. Push repo ini ke GitHub
2. Buka [vercel.com](https://vercel.com) → Import repo
3. Deploy otomatis — tidak perlu setting apapun

## Login Demo

| Role  | Username | Password  |
|-------|----------|-----------|
| Owner | —        | owner123  |
| Kasir | Adi      | adi123    |
| Kasir | Dina     | dina123   |
