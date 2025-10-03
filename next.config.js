/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // localhost por si seguís probando en dev con imágenes locales
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
      // cloudinary (si llegás a seguir usándolo)
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      // supabase bucket "productos"
      {
        protocol: "https",
        hostname: "okhvjishzlennulkzhek.supabase.co",
        pathname: "/storage/v1/object/public/productos/**",
      },
    ],
  },
};

module.exports = nextConfig;
