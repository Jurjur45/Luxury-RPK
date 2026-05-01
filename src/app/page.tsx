'use client'
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { CldImage } from 'next-cloudinary';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string[];
  slug: string;
  category: string;
  subcategory: string;
}

export default async function Home() {
  // Traemos solo los últimos 3 productos para la sección de "Entrega Inmediata"
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('product_type', 'in_stock') // Filtramos por stock disponible
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <div className="bg-white min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Reemplaza esta URL por el ID de tu video en Cloudinary */}
        <video 
          autoPlay loop muted playsInline 
          className="absolute inset-0 w-full h-full object-cover z-0 grayscale"
        >
          <source src="https://res.cloudinary.com/luxuryrpk/video/upload/v1/tu-video-hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60 z-1" />
        <div className="text-center z-10 px-4">
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white italic animate-pulse">
            LUXURY RPK
          </h1>
          <p className="text-white/80 tracking-[0.6em] uppercase mt-6 text-[10px] md:text-xs font-bold">
            EXCLUSIVE STREETWEAR SELECTION — VALDIVIA 🇨🇱
          </p>
          <Link href="#categorias" className="inline-block mt-12 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] px-10 py-5 hover:bg-black hover:text-white transition-all duration-500 border border-white">
            EXPLORAR CATÁLOGO
          </Link>
        </div>
      </section>

      {/* 2. CONTENIDO PRINCIPAL */}
      <main id="categorias" className="py-24">
        
        {/* CATEGORÍAS PRINCIPALES */}
        <section className="max-w-7xl mx-auto mb-32 px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Ropa", sub: "Ver Colección", path: "/categoria/ropa/poleras", img: "v1714594246/ropa-banner" },
              { title: "Calzado", sub: "Ver Sneakers", path: "/categoria/calzado/zapatillas", img: "v1714594246/sneakers-banner" },
              { title: "Accesorios", sub: "Complementos", path: "/categoria/accesorios/bolsos", img: "v1714594246/acc-banner" }
            ].map((cat) => (
              <Link key={cat.title} href={cat.path} className="group relative h-[600px] overflow-hidden bg-zinc-900 border border-zinc-200">
                <CldImage
                  src={cat.img}
                  alt={cat.title}
                  width={600}
                  height={800}
                  className="w-full h-full object-cover opacity-70 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter">{cat.title}</h2>
                  <span className="text-[9px] font-bold tracking-[0.4em] uppercase mt-3 border-b border-white/20 pb-2 group-hover:border-white transition-all">{cat.sub}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. SECCIÓN: ENTREGA INMEDIATA (DINÁMICA) */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <h2 className="text-5xl font-black uppercase italic tracking-tighter text-black">Entrega Inmediata</h2>
              <p className="text-zinc-400 text-[10px] font-black tracking-[0.5em] uppercase mt-4">Stock físico en Valdivia para envío hoy</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products?.map((product: Product) => (
              <Link key={product.id} href={`/categoria/${product.category}/${product.subcategory}/${product.slug}`} className="group">
                <div className="aspect-[3/4] bg-zinc-100 overflow-hidden mb-6 relative border border-zinc-100">
                  <div className="absolute top-4 left-4 z-10 bg-black text-white text-[8px] font-black px-3 py-1.5 uppercase tracking-widest italic">
                    Ready to Ship
                  </div>
                  {product.image_url?.[0] && (
                    <CldImage 
                      src={product.image_url[0]} 
                      width={500} 
                      height={667} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                  )}
                </div>
                <h3 className="font-black uppercase text-sm italic tracking-tight">{product.name}</h3>
                <p className="text-zinc-500 text-sm font-medium mt-1">${Number(product.price).toLocaleString('es-CL')}</p>
              </Link>
            ))}

            {/* CUADRADO "VER TODO" - Mantiene la estética del grid */}
            <Link href="/categoria/entrega-inmediata/todos" className="group">
              <div className="aspect-[3/4] bg-black flex flex-col items-center justify-center p-8 transition-all group-hover:bg-zinc-900">
                <div className="border border-white/10 w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <h3 className="text-white text-3xl font-black uppercase italic tracking-tighter text-center leading-none z-10">
                    Ver<br />Stock
                  </h3>
                  <div className="mt-6 w-12 h-[1px] bg-white group-hover:w-20 transition-all duration-500 z-10" />
                </div>
              </div>
            </Link>
          </div>
        </section>

      </main>

      <footer className="py-20 border-t border-zinc-100 text-center bg-white">
        <div className="mb-8 flex justify-center space-x-8">
            <Link href="https://instagram.com/luxuryrpk.cl" className="text-[10px] font-black uppercase tracking-widest hover:line-through">Instagram</Link>
            <Link href="#" className="text-[10px] font-black uppercase tracking-widest hover:line-through">Telegram</Link>
        </div>
        <p className="text-[9px] text-zinc-300 uppercase tracking-[0.5em]">
          Luxury RPK Selection © {new Date().getFullYear()} — High End Streetwear
        </p>
      </footer>
    </div>
  );
}