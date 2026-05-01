/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! ADVERTENCIA !!
    // Esto permite que los builds de producción finalicen con éxito 
    // incluso si tu proyecto tiene errores de TypeScript.
    ignoreBuildErrors: true,
  },
  eslint: {
    // También ignoramos ESLint para evitar que se detenga por advertencias de formato
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;