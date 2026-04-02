# Angkringan. — Sistem Kasir & Manajemen

Aplikasi web berbasis Next.js yang dimuat oleh aplikasi Android native wrapper melalui WebView.

## Arsitektur aktual
- `web/` = aplikasi web Next.js yang dideploy ke hosting
- `android/` = aplikasi Android native yang memuat URL web remote dan bridge printer/backup file

## Stack yang tervalidasi
- Next.js 15
- React 19
- Supabase JS
- Recharts
- Android native WebView wrapper (Kotlin)

## Menjalankan web secara lokal
```bash
cd web
npm install
npm run build
npm run start
```

## Catatan penting
- Jangan commit `node_modules`, `.next`, `out`, `build`, `.gradle`, `.idea`, atau `local.properties`.
- Jangan simpan kredensial demo di dokumentasi produksi.
- Aplikasi Android saat ini memuat URL yang dikonfigurasi di `android/app/build.gradle.kts` melalui `BuildConfig.WEB_APP_URL`.
- Jika URL web berubah, update `WEB_APP_URL` dan `TRUSTED_HOST`, lalu build ulang APK.

## Build Android
```bash
cd android
./gradlew assembleDebug
./gradlew assembleRelease
```

## Release checklist ringkas
1. Pastikan web berhasil `npm run build`
2. Deploy web ke hosting tujuan
3. Jika domain berubah, update `WEB_APP_URL` dan `TRUSTED_HOST`
4. Build release APK/AAB dari Android Studio atau Gradle
5. Uji login, transaksi, printer, backup, restore, dan tutup sesi


## Environment untuk Vercel
Tambahkan environment variable berikut di Vercel Project Settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Simpan nilai rahasia di Vercel/GitHub Secrets, jangan hardcode ulang di source.

## Realtime multi-device Supabase
Agar sinkron antar device lebih cepat dan stabil:
1. Jalankan `web/supabase_session_date_sessions_level2.sql`
2. Jalankan `web/supabase_realtime_hardening.sql`
3. Pastikan tabel `orders`, `expenses`, `menus`, `kasirs`, `mitras`, `settings`, dan `sessions` masuk ke publication `supabase_realtime`
4. Di Android, pairing printer dulu dari pengaturan Bluetooth HP, baru pilih dari aplikasi
