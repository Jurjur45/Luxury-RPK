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
  
  // ESTADO PARA EL ZOOM
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
    const decodedSlug = decodeURIComponent(params.slug);
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', decodedSlug) // El slug es la clave real
      // Eliminamos los filtros de categoría y subcategoría para evitar conflictos
      .maybeSingle();

    if (error) {
      console.error("Error de Supabase:", error.message);
      setProduct(null);
    } else {
      setProduct(data);
    }
    setLoading(false);
  }

  if (loading) return <div className="py-40 text-center font-black italic tracking-[0.5em] uppercase text-black animate-pulse">Cargando Luxury RPK...</div>;
  
  if (!product) return <div className="py-40 text-center"><h2 className="font-black uppercase text-2xl italic">Producto no encontrado</h2><BackButton /></div>;

  return (
    <div className="bg-white min-h-screen pt-20 md:pt-32 pb-10 md:pb-20 px-4 md:px-6">
      
      {/* MODAL DE ZOOM (Se activa al hacer click en una imagen) */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-6 right-6 text-white text-3xl font-light z-[110]">&times;</button>
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src={selectedImage} 
              alt="Zoomed product" 
              className="max-w-full max-h-full object-contain cursor-zoom-out shadow-2xl"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-12"><BackButton /></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 lg:gap-24">
          
          {/* GALERÍA DE IMÁGENES */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 h-fit order-1 md:order-1">
            {product.image_url?.map((url: string, index: number) => (
              <div 
                key={index} 
                className="aspect-[4/5] bg-zinc-50 border border-zinc-100 overflow-hidden cursor-zoom-in group relative"
                onClick={() => setSelectedImage(url.startsWith('http') ? url : `https://res.cloudinary.com/luxuryrpk/image/upload/${url}`)}
              >
                {url.startsWith('http') ? (
                  <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <CldImage width="600" height="750" src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
                {/* Indicador visual de zoom */}
                <div className="absolute bottom-2 right-2 bg-white/80 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                </div>
              </div>
            ))}
          </div>

          {/* INFO DEL PRODUCTO */}
          <div className="flex flex-col justify-start md:sticky md:top-32 h-fit order-2 md:order-2">
            <div className="border-b border-zinc-100 pb-10 mb-10">
              <div className="mb-8">
                <span className={product.product_type === 'in_stock' ? "bg-black text-white text-[9px] font-black px-4 py-2 uppercase italic tracking-widest" : "bg-zinc-100 text-zinc-500 text-[9px] font-black px-4 py-2 uppercase italic tracking-widest border border-zinc-200"}>
                  {product.product_type === 'in_stock' ? '✓ Stock en Valdivia' : '✈ Bajo Pedido'}
                </span>
              </div>

              <h1 className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-400 mb-4 block">
                {product.slug.replace(/-/g, ' ')}
              </h1>

              <p className="text-3xl font-medium italic text-zinc-900 mb-10">
                ${Number(product.price).toLocaleString('es-CL')}
              </p>

              <a href="https://www.instagram.com/luxuryrpk.cl/" target="_blank" className="flex items-center justify-center gap-3 w-full bg-black text-white py-6 rounded-full font-black text-sm uppercase italic tracking-widest hover:bg-zinc-800 transition-all shadow-xl">
                Instagram Shop
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}