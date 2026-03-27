"use client";

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <title>Angkringan.</title>
        <meta name="description" content="Sistem Kasir & Manajemen Angkringan" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#FDF8F2" />
      </head>
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
