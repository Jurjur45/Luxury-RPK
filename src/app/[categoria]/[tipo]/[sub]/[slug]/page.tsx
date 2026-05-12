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
    <div className="bg-white min-h-screen pt-20 md:pt-32 pb-10 md:pb-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-12">
          <BackButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 lg:gap-24">
          
          {/* GALERÍA DE IMÁGENES - AJUSTADA PARA MÓVIL */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 h-fit order-1 md:order-1">
            {product.image_url && product.image_url.length > 0 ? (
              product.image_url.map((url: string, index: number) => {
                const isFullUrl = url.startsWith('http');
                return (
                  <div key={index} className="aspect-[4/5] bg-zinc-50 border border-zinc-100 overflow-hidden">
                    {isFullUrl ? (
                      <img 
                        src={url} 
                        alt={`${product.name} - ${index}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <CldImage
                        width="600"
                        height="750"
                        src={url}
                        alt={`${product.name} - ${index}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 aspect-square bg-zinc-50 flex items-center justify-center text-zinc-300 text-[10px] font-black uppercase">
                Sin Imágenes
              </div>
            )}
          </div>

          {/* INFO DEL PRODUCTO */}
          <div className="flex flex-col justify-start md:sticky md:top-32 h-fit order-2 md:order-2">
            <div className="border-b border-zinc-100 pb-8 md:pb-10 mb-8 md:mb-10">
              
              <div className="mb-6 md:mb-8">
                {product.product_type === 'in_stock' ? (
                  <span className="bg-black text-white text-[8px] md:text-[9px] font-black px-3 py-1.5 md:px-4 md:py-2 uppercase italic tracking-[0.2em]">
                    ✓ Stock en Valdivia
                  </span>
                ) : (
                  <span className="bg-zinc-100 text-zinc-500 text-[8px] md:text-[9px] font-black px-3 py-1.5 md:px-4 md:py-2 uppercase italic tracking-[0.2em] border border-zinc-200">
                    ✈ Bajo Pedido
                  </span>
                )}
              </div>

              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-zinc-400 mb-2 md:mb-4 block">
                {product.slug.replace(/-/g, ' ')}
              </span>

              <p className="text-2xl md:text-3xl font-medium italic text-zinc-900 mb-8 md:mb-10">
                ${Number(product.price).toLocaleString('es-CL')}
              </p>

              {/* BOTÓN DE INSTAGRAM - AJUSTADO PARA MÓVIL */}
              <a 
                href="https://www.instagram.com/luxuryrpk" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 md:gap-3 w-full bg-black text-white py-4 md:py-6 rounded-full font-black text-[10px] md:text-sm uppercase italic tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" stroke="currentColor" 
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="md:w-5 md:h-5"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                Instagram Shop
              </a>
              
              <p className="text-[8px] md:text-[10px] text-zinc-400 font-bold uppercase tracking-widest text-center mt-4 italic">
                Envío a todo Chile · Entrega en Valdivia
              </p>
            </div>
            
            <div className="space-y-4">
              <p className="text-xs md:text-sm leading-relaxed text-zinc-500">
                Producto seleccionado de nuestra línea exclusiva. Consulta disponibilidad de tallas vía DM antes de realizar tu pedido.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}