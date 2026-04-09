/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // safety-agent → @daytonaio/sdk → @aws-sdk/client-s3 (not installed, not needed)
    config.resolve.alias['@aws-sdk/client-s3'] = false;
    config.resolve.alias['@aws-sdk/lib-storage'] = false;
    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
             key: 'Content-Security-Policy',
             value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://api.github.com https://*.supabase.co wss://*.supabase.co https://vercel.live; frame-src https://vercel.live; frame-ancestors 'none';"
          }
        ],
      },
    ];
  },
}

export default nextConfig
