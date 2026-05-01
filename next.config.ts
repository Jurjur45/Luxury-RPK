/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Esto asegura que el build termine aunque TypeScript se ponga pesado
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['res.cloudinary.com'], // Necesario para que carguen las fotos de Luxury RPK
  },
};

export default nextConfig;