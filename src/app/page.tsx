'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { CldImage } from 'next-cloudinary';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProducts() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('product_type', 'in_stock')
        .limit(3);
      if (data) setProducts(data);
      setLoading(false);
    }
    getProducts();
  }, []);

  // Definimos las rutas exactas para que no mande a "/todos"
  const categorias = [
    { nombre: 'Ropa', slug: 'ropa', sub: 'poleras' },
    { nombre: 'Calzado', slug: 'calzado', sub: 'zapatillas' },
    { nombre: 'Accesorios', slug: 'accesorios', sub: 'bolsos' }
  ];

  return (
    <div className="bg-white min-h-screen text-black">
      {/* HERO SECTION */}
      <section className="relative h-[80vh] flex items-center justify-center bg-zinc-900">
        <div className="z-10 text-center px-4">
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white italic leading-none">
            LUXURY RPK
          </h1>
          <p className="text-white/70 tracking-[0.6em] uppercase mt-6 text-[10px] font-bold">
            EXCLUSIVE STREETWEAR — VALDIVIA 🇨🇱
          </p>
        </div>
      </section>

      {/* CATEGORÍAS - AQUÍ ESTÁ EL CAMBIO */}
      <main className="max-w-7xl mx-auto py-24 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {categorias.map((cat) => (
            <Link 
              href={`/categoria/${cat.slug}/${cat.sub}`} // Ahora usa la subcategoría específica
              key={cat.nombre} 
              className="group relative h-[500px] bg-zinc-100 overflow-hidden border border-zinc-200"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white group-hover:scale-110 transition-transform duration-500">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter drop-shadow-md">
                  {cat.nombre}
                </h2>
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase mt-2 border-b border-white/40 pb-1">
                  Ver {cat.nombre === 'Calzado' ? 'Sneakers' : 'Colección'}
                </span>
              </div>
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors" />
            </Link>
          ))}
        </div>

        {/* 3. SECCIÓN: ENTREGA INMEDIATA (Página Principal) */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <h2 className="text-5xl font-black uppercase italic tracking-tighter text-black mb-12">
            Entrega Inmediata
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {!loading && products.map((product) => (
              <Link 
                key={product.id} 
                // IMPORTANTE: Construimos la ruta completa usando los datos de la DB
                href={`/categoria/${product.category}/${product.subcategory}/${product.slug}`} 
                className="group"
              >
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
                <p className="text-zinc-500 text-sm font-medium mt-1">
                  ${Number(product.price).toLocaleString('es-CL')}
                </p>
              </Link>
            ))}
            
            {/* ... botón de ver todo ... */}
          </div>
        </section>
      </main>
    </div>
  );
}