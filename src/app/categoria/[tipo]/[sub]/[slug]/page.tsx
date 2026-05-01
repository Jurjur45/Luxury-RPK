'use client'
import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import BackButton from '@/components/BackButton';
import { CldImage } from 'next-cloudinary'; // Importamos Cloudinary

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

  if (loading) return <div className="py-40 text-center font-black italic tracking-widest uppercase text-black">Cargando Luxury RPK...</div>;
  if (!product) return <div className="py-40 text-center font-black uppercase text-black">Producto no encontrado</div>;

  return (
    <div className="bg-white min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <BackButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* GALERÍA DE IMÁGENES OPTIMIZADA */}
          <div className="space-y-4">
            {Array.isArray(product.image_url) ? (
              product.image_url.map((img: string, idx: number) => (
                <CldImage 
                  key={idx}
                  width="800" // Definimos un tamaño base para optimización
                  height="1000"
                  src={img} 
                  alt={product.name}
                  crop="fill"
                  gravity="center"
                  className="w-full bg-zinc-50 border border-zinc-100 object-cover"
                />
              ))
            ) : (
              <CldImage 
                width="800"
                height="1000"
                src={product.image_url} 
                alt={product.name}
                crop="fill"
                gravity="center"
                className="w-full bg-zinc-50 border border-zinc-100 object-cover"
              />
            )}
          </div>

          {/* INFO DEL PRODUCTO */}
          <div className="flex flex-col justify-start md:pt-10">
            <h1 className="text-5xl font-black uppercase italic leading-none mb-4 tracking-tighter text-black">
              {product.name}
            </h1>
            <p className="text-2xl font-medium italic text-zinc-500 mb-10">
              ${Number(product.price).toLocaleString('es-CL')}
            </p>
            
            <a 
              href="https://www.instagram.com/luxuryrpk.cl/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-black text-white font-black py-5 text-xs uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all text-center block"
            >
              Consultar disponibilidad vía Instagram
            </a>

            {isAdmin && (
              <div className="mt-16 p-6 bg-zinc-50 border border-black border-dashed">
                <p className="text-[10px] font-black uppercase mb-4 tracking-widest text-black">Modo Administrador</p>
                <button 
                  className="text-[9px] bg-red-600 text-white px-4 py-2 font-black uppercase hover:bg-black transition-all"
                  onClick={async () => {
                     if(confirm('¿Borrar definitivamente?')) {
                       await supabase.from('products').delete().eq('id', product.id);
                       window.location.href = '/';
                     }
                  }}
                >
                  Eliminar este producto
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}