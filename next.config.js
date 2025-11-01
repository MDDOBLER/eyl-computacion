/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      // localhost (dev)
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
      // Cloudinary (opcional)
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      // Supabase bucket "productos"
      {
        protocol: "https",
        hostname: "okhvjishzlennulkzhek.supabase.co",
        pathname: "/storage/v1/object/public/productos/**",
      },
    ],
  },

  // 👇 Mejora la carga inicial y evita errores de caché
  async headers() {
    return [
      {
        // ✅ Patrón compatible con Next 16 (sin grupos no-capturantes)
        source: "/:all*(png|jpg|jpeg|webp|svg|gif|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

module.exports = nextConfig;
