/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Izinkan semua domain eksternal (RSS feed, Unsplash, Kompas, Antara, dll)
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http',  hostname: '**' },
    ],
    // Fallback ke unoptimized jika domain tidak terdaftar
    unoptimized: false,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
