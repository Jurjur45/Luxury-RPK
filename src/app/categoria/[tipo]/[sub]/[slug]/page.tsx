'use client'
import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import BackButton from '@/components/BackButton';
import { CldImage } from 'next-cloudinary';

export default function ProductDetailPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
  const params = use(paramsPromise);
  const [product, setProduct] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    fetchProduct();
  }, [params.slug]);

  async function checkUser() {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('isLuxuryAdmin');
      setIsAdmin(session === 'true');
    }
  }

  async function fetchProduct() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', params.slug)
      .single();

    if (error) {
      console.error("Error cargando producto:", error);
    } else {
      setProduct(data);
    }
    setLoading(false);
  }

  if (loading) return <div className="py-40 text-center font-black italic tracking-[0.5em] uppercase text-black animate-pulse">Cargando Luxury RPK...</div>;
  if (!product) return <div className="py-40 text-center font-black uppercase text-black tracking-tighter text-2xl italic">Producto no encontrado</div>;

  return (
    <div className="bg-white min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-12">
          <BackButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
          
          {/* GALERÍA DE IMÁGENES (Ahora soporta N cantidad de fotos) */}
          <div className="space-y-6">
            {(() => {
              const imagesArray: string[] = Array.isArray(product.image_url) 
                ? product.image_url 
                : [product.image_url];

              const validImages = imagesArray.filter((img: string) => 
                typeof img === 'string' && img.trim() !== ""
              );

              if (validImages.length > 0) {
                return validImages.map((img: string, idx: number) => (
                  <div key={idx} className="bg-zinc-50 border border-zinc-100 overflow-hidden">
                    <CldImage 
                      width="1000"
                      height="1250"
                      src={img} 
                      alt={`${product.name} - Vista ${idx + 1}`}
                      crop="fill"
                      gravity="center"
                      className="w-full object-cover hover:scale-105 transition-transform duration-1000"
                    />
                  </div>
                ));
              }

              return (
                <div className="w-full aspect-[4/5] bg-zinc-50 flex flex-col items-center justify-center text-zinc-300 border border-dashed border-zinc-200">
                  <span className="text-5xl mb-4 font-light text-zinc-200">✕</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.5em]">Sin imágenes</span>
                </div>
              );
            })()}
          </div>

          {/* INFO DEL PRODUCTO */}
          <div className="flex flex-col justify-start md:sticky md:top-32 h-fit">
            <div className="border-b border-zinc-100 pb-10 mb-10">
              
              {/* BADGE DINÁMICO SEGÚN PRODUCT_TYPE */}
              <div className="mb-8">
                {product.product_type === 'in_stock' ? (
                  <span className="bg-black text-white text-[9px] font-black px-4 py-2 uppercase italic tracking-[0.2em]">
                    ✓ Stock en Valdivia (Entrega Inmediata)
                  </span>
                ) : product.product_type === 'pre_order' ? (
                  <span className="bg-zinc-100 text-zinc-500 text-[9px] font-black px-4 py-2 uppercase italic tracking-[0.2em] border border-zinc-200">
                    ✈ Bajo Pedido (Envío Internacional)
                  </span>
                ) : (
                  <span className="bg-red-50 text-red-600 text-[9px] font-black px-4 py-2 uppercase italic tracking-[0.2em] border border-red-100">
                    ✕ Agotado Temporalmente
                  </span>
                )}
              </div>

              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-400 mb-4 block">
                {product.category} / {product.subcategory}
              </span>
              <h1 className="text-6xl lg:text-7xl font-black uppercase italic leading-[0.9] mb-6 tracking-tighter text-black">
                {product.name}
              </h1>
              <p className="text-3xl font-medium italic text-zinc-900">
                ${Number(product.price).toLocaleString('es-CL')}
              </p>
            </div>
            
            <div className="space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-6 leading-relaxed">
                {product.product_type === 'in_stock' 
                  ? "Pieza disponible para retiro hoy mismo en Valdivia o envío flash a regiones."
                  : "Esta pieza se gestiona por encargo. Tiempo estimado de llegada: 10-15 días hábiles."}
              </p>
              
              <a 
                href="https://www.instagram.com/luxuryrpk.cl/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-black text-white font-black py-6 text-[10px] uppercase tracking-[0.4em] hover:bg-zinc-800 transition-all text-center block border border-black"
              >
                {product.product_type === 'in_stock' ? 'Consultar Disponibilidad' : 'Hacer Pedido vía Instagram'}
              </a>
              
              <button className="w-full bg-transparent text-black font-black py-6 text-[10px] uppercase tracking-[0.4em] hover:bg-zinc-50 transition-all text-center block border border-black/10">
                Guía de tallas
              </button>
            </div>

            {isAdmin && (
              <div className="mt-20 p-8 bg-zinc-50 border border-black border-dashed">
                <p className="text-[10px] font-black uppercase mb-6 tracking-widest text-black flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                  Modo Editor
                </p>
                <button 
                  className="w-full text-[10px] bg-red-600 text-white px-4 py-4 font-black uppercase tracking-[0.2em] hover:bg-black transition-all"
                  onClick={async () => {
                     if(confirm('¿Eliminar esta pieza de la base de datos?')) {
                       await supabase.from('products').delete().eq('id', product.id);
                       window.location.href = '/';
                     }
                  }}
                >
                  Eliminar del Catálogo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}