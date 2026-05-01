import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  // Si Next 16 se queja de 'typescript' o 'eslint' dentro del objeto,
  // los manejaremos a través de banderas de compilación si es necesario,
  // pero prueba primero con el objeto limpio:
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;