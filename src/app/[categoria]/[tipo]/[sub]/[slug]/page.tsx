'use client'
import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import BackButton from '@/components/BackButton';
import { CldImage } from 'next-cloudinary';

export default function ProductDetailPage({ 
  params: paramsPromise 
}: { 
  params: Promise<{ tipo: string; sub: string; slug: string }> 
}) {
  const params = use(paramsPromise);
  const [product, setProduct] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    fetchProduct();
  }, [params.slug, params.tipo, params.sub]);

  async function checkUser() {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('isLuxuryAdmin');
      setIsAdmin(session === 'true');
    }
  }

  async function fetchProduct() {
    setLoading(true);
    
    // Decodificamos el slug por si trae espacios (%20)
    const decodedSlug = decodeURIComponent(params.slug);

    // Buscamos coincidencia exacta por slug, categoría y subcategoría
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', decodedSlug)
      .eq('category', params.tipo)
      .eq('subcategory', params.sub)
      .maybeSingle();

    if (error) {
      console.error("Error de Supabase:", error.message);
      setProduct(null);
    } else if (!data) {
      // Intento de rescate: si no lo encuentra, probamos con guiones por si se guardó así
      const backupSlug = decodedSlug.toLowerCase().replace(/ /g, '-');
      const { data: retryData } = await supabase
        .from('products')
        .select('*')
        .eq('slug', backupSlug)
        .eq('category', params.tipo)
        .eq('subcategory', params.sub)
        .maybeSingle();
      
      setProduct(retryData);
    } else {
      setProduct(data);
    }
    
    setLoading(false);
  }

  if (loading) return <div className="py-40 text-center font-black italic tracking-[0.5em] uppercase text-black animate-pulse">Cargando Luxury RPK...</div>;
  
  if (!product) return (
    <div className="py-40 text-center space-y-6">
      <h2 className="font-black uppercase text-black tracking-tighter text-2xl italic">Producto no encontrado</h2>
      <BackButton />
    </div>
  );

  return (
    <div className="bg-white min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <BackButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
          {/* GALERÍA DE IMÁGENES */}
          <div className="space-y-6">
            {/* ... (lógica de renderizado de imágenes igual) */}
          </div>

          {/* INFO DEL PRODUCTO */}
          <div className="flex flex-col justify-start md:sticky md:top-32 h-fit">
            <div className="border-b border-zinc-100 pb-10 mb-10">
              
              <div className="mb-8">
                {product.product_type === 'in_stock' ? (
                  <span className="bg-black text-white text-[9px] font-black px-4 py-2 uppercase italic tracking-[0.2em]">✓ Stock en Valdivia</span>
                ) : (
                  <span className="bg-zinc-100 text-zinc-500 text-[9px] font-black px-4 py-2 uppercase italic tracking-[0.2em] border border-zinc-200">✈ Bajo Pedido</span>
                )}
              </div>

              {/* CAMBIO: Ahora aquí mostramos el SLUG (Nombre del producto) como detalle superior */}
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-400 mb-4 block">
                {product.slug.replace(/-/g, ' ')} {/* Reemplazamos guiones por espacios para que se vea limpio */}
              </span>

              {/* CAMBIO: El título principal ahora es el NAME (que actúa como el Modelo) */}
              <h1 className="text-6xl lg:text-7xl font-black uppercase italic leading-[0.9] mb-6 tracking-tighter text-black">
                {product.name}
              </h1>

              <p className="text-3xl font-medium italic text-zinc-900">
                ${Number(product.price).toLocaleString('es-CL')}
              </p>
            </div>
            
            {/* ... (Resto del componente: descripción, botón de Instagram, etc.) */}
          </div>
        </div>
      </div>
    </div>
  );
}