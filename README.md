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
