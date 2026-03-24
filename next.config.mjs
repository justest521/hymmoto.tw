/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'imgs2.58moto.com' },
      { protocol: 'https', hostname: 'autos.yahoo.com.tw' },
      { protocol: 'https', hostname: 'kzxunbohppykfkaqioqd.supabase.co' },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig
