// src/app/page.tsx

import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  slug: string;
  category: string;
  subcategory: string;
}

export default async function Home() {
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="bg-white min-h-screen">
      
      {/* 1. HERO SECTION CON VIDEO */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <video 
          autoPlay loop muted playsInline 
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
        >
          <source src="TU_URL_DE_CLOUDINARY_AQUÍ.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50 z-1" />
        <div className="text-center z-10 px-4">
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white italic">
            LUXURY RPK
          </h1>
          <p className="text-white/80 tracking-[0.6em] uppercase mt-6 text-xs md:text-sm font-bold">
            EXCLUSIVE STREETWEAR SELECTION
          </p>
          <Link href="#categorias" className="inline-block mt-12 bg-white text-black text-[10px] font-black uppercase tracking-widest px-8 py-4 rounded-sm hover:bg-zinc-200 transition-all">
            Descubrir Selección
          </Link>
        </div>
      </section>

      {/* 2. CONTENIDO PRINCIPAL (Solo un <main>) */}
      <main id="categorias" className="py-24">
        
        {/* SECCIÓN DE CATEGORÍAS (Banners) */}
        <section className="max-w-7xl mx-auto mb-32 px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ropa */}
            <Link href="/categoria/ropa/poleras" className="group relative h-[500px] overflow-hidden bg-zinc-100">
              <img src="URL_IMAGEN_ROPA" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Ropa</h2>
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase mt-2 border-b border-white/40 pb-1">Ver Colección</span>
              </div>
            </Link>
            {/* Calzado */}
            <Link href="/categoria/calzado/zapatillas" className="group relative h-[500px] overflow-hidden bg-zinc-100">
              <img src="URL_IMAGEN_ZAPATILLAS" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Calzado</h2>
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase mt-2 border-b border-white/40 pb-1">Ver Sneakers</span>
              </div>
            </Link>
            {/* Accesorios */}
            <Link href="/categoria/accesorios/bolsos" className="group relative h-[500px] overflow-hidden bg-zinc-100">
              <img src="URL_IMAGEN_ACCESORIOS" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Accesorios</h2>
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase mt-2 border-b border-white/40 pb-1">Complementos</span>
              </div>
            </Link>
          </div>
        </section>

        {/* 3. SECCIÓN CONFIABLES (Fondo gris para destacar) */}
        <section className="py-24 bg-zinc-50 border-y border-zinc-100 mb-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">Confiables</h2>
              <p className="text-zinc-400 text-[10px] font-bold tracking-[0.4em] uppercase mt-2">Nuestra comunidad Luxury RPK</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {/* Aquí van tus fotos de clientes */}
               <div className="aspect-square bg-zinc-200 overflow-hidden relative group">
                 <img src="URL_CLIENTE_1" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                 <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-1">
                   <p className="text-[8px] font-black uppercase italic">@cliente_1</p>
                 </div>
               </div>
               {/* ... Repite bloques para más clientes */}
            </div>
          </div>
        </section>

        {/* SECCIÓN: ENTREGA INMEDIATA */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">Entrega Inmediata</h2>
            <p className="text-zinc-400 text-[10px] font-bold tracking-[0.4em] uppercase mt-2">Stock disponible en Valdivia 🇨🇱</p>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Producto 1 */}
            <div className="group cursor-pointer">
            <div className="aspect-[3/4] bg-zinc-100 overflow-hidden mb-4 relative">
                <div className="absolute top-4 left-4 z-10 bg-black text-white text-[8px] font-bold px-2 py-1 uppercase tracking-widest">
                Stock Listo
                </div>
                <img src="URL_IMAGEN_1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <h3 className="font-bold uppercase text-sm italic">Producto Exclusivo 01</h3>
            <p className="text-zinc-500 text-sm">$XX.XXX</p>
            </div>

            {/* Producto 2 */}
            <div className="group cursor-pointer">
            <div className="aspect-[3/4] bg-zinc-100 overflow-hidden mb-4 relative">
                <img src="URL_IMAGEN_2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <h3 className="font-bold uppercase text-sm italic">Producto Exclusivo 02</h3>
            <p className="text-zinc-500 text-sm">$XX.XXX</p>
            </div>

            {/* Producto 3 */}
            <div className="group cursor-pointer">
            <div className="aspect-[3/4] bg-zinc-100 overflow-hidden mb-4 relative">
                <img src="URL_IMAGEN_3" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <h3 className="font-bold uppercase text-sm italic">Producto Exclusivo 03</h3>
            <p className="text-zinc-500 text-sm">$XX.XXX</p>
            </div>

            {/* CUADRADO "VER MÁS" */}
            <Link href="/categoria/entrega-inmediata/todos" className="group">
            <div className="aspect-[3/4] bg-black flex flex-col items-center justify-center p-8 transition-colors group-hover:bg-zinc-900 border border-black">
                <div className="border-2 border-white/20 w-full h-full flex flex-col items-center justify-center">
                <h3 className="text-white text-2xl font-black uppercase italic tracking-tighter text-center leading-none">
                    Ver<br />Todo
                </h3>
                <div className="mt-4 w-8 h-[2px] bg-white group-hover:w-16 transition-all duration-500" />
                <p className="text-white/50 text-[8px] font-bold uppercase tracking-[0.3em] mt-4">
                    Full Stock
                </p>
                </div>
            </div>
            </Link>

        </div>
        </section>

      </main>

      {/* 5. FOOTER */}
      <footer className="py-20 border-t border-zinc-100 text-center bg-zinc-50">
        <p className="text-[10px] text-zinc-400 uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} Luxury RPK - Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}