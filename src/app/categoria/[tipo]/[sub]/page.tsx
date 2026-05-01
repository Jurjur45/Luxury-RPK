'use client'
import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import { CldUploadWidget, CldImage } from 'next-cloudinary'; // Importamos las herramientas de Cloudinary

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string[];
  slug: string;
  category: string;
  subcategory: string;
}

export default function SubcategoryPage({ params: paramsPromise }: { params: Promise<{ tipo: string; sub: string }> }) {
  const params = use(paramsPromise);
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    price: 0, 
    image_url: ['', '', ''], 
    slug: '' 
  });

  useEffect(() => {
    checkUser();
    fetchProducts();
  }, [params.tipo, params.sub]);

  async function checkUser() {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('isLuxuryAdmin');
      if (session === 'true') {
        setIsAdmin(true);
      }
    }
  }

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', params.tipo.toLowerCase().trim())
      .eq('subcategory', params.sub.toLowerCase().trim());
    
    if (error) console.error(error);
    else setProducts(data || []);
    setLoading(false);
  }

  const filteredProducts = products.filter((p: Product) => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const groupedProducts = filteredProducts.reduce((acc: { [key: string]: Product[] }, product: Product) => {
    if (!acc[product.name]) acc[product.name] = [];
    acc[product.name].push(product);
    return acc;
  }, {});

  // Función para manejar la subida de Cloudinary
  const handleUploadSuccess = (result: any) => {
    const secureUrl = result.info.secure_url;
    setNewProduct(prev => {
      const firstEmptyIndex = prev.image_url.findIndex(url => url === '');
      if (firstEmptyIndex !== -1) {
        const updatedImages = [...prev.image_url];
        updatedImages[firstEmptyIndex] = secureUrl;
        return { ...prev, image_url: updatedImages };
      }
      return prev;
    });
  };

  const removeImage = (index: number) => {
    const updatedImages = [...newProduct.image_url];
    updatedImages[index] = '';
    setNewProduct({ ...newProduct, image_url: updatedImages });
  };

  async function deleteProduct(id: string) {
    if (confirm('¿Seguro que quieres borrar este producto de Luxury RPK?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) fetchProducts();
      else alert("Error al borrar: " + error.message);
    }
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    const finalImages = newProduct.image_url.filter(url => url.trim() !== '');

    const { error } = await supabase.from('products').insert([{
      ...newProduct,
      image_url: finalImages,
      category: params.tipo.toLowerCase(),
      subcategory: params.sub.toLowerCase(),
      product_type: 'in_stock'
    }]);
    
    if (!error) {
      setNewProduct({ name: '', price: 0, image_url: ['', '', ''], slug: '' });
      setShowAddForm(false);
      fetchProducts();
    } else {
      alert("Error al guardar: " + error.message);
    }
  }

  if (loading) return <div className="py-40 text-center font-black uppercase italic tracking-widest">Cargando Luxury RPK...</div>;

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <main className="max-w-7xl mx-auto px-6">
        
        <BackButton />

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none">
              {params.sub}
            </h1>
            <p className="text-zinc-400 text-[11px] font-bold tracking-[0.5em] uppercase mt-4">
              Luxury Selection — {params.tipo}
            </p>
          </div>
          <input 
            type="text" 
            placeholder="BUSCAR MODELO..." 
            className="bg-zinc-100 border-none px-6 py-4 w-full md:w-80 text-xs font-bold tracking-widest outline-none uppercase focus:ring-2 focus:ring-black transition-all"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* PANEL ADMIN CON CLOUDINARY */}
        {isAdmin && (
          <div className="mb-12 border-t border-zinc-100 pt-8">
            <button 
              onClick={() => setShowAddForm(!showAddForm)} 
              className="bg-black text-white text-[10px] font-black px-8 py-4 uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all"
            >
              {showAddForm ? '✕ CERRAR PANEL' : '+ AGREGAR PRODUCTO'}
            </button>
            
            {showAddForm && (
              <form onSubmit={addProduct} className="mt-8 p-8 border border-black grid grid-cols-1 gap-8 bg-zinc-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest">Nombre Modelo</label>
                        <input type="text" placeholder="Jordan 4" className="w-full p-4 text-xs border border-zinc-200 outline-none focus:border-black" required 
                            onChange={e => setNewProduct({...newProduct, name: e.target.value})} value={newProduct.name} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest">Precio (CLP)</label>
                        <input type="number" placeholder="120000" className="w-full p-4 text-xs border border-zinc-200 outline-none focus:border-black" required 
                            onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} value={newProduct.price} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest">Slug (Único)</label>
                        <input type="text" placeholder="jordan-4-midnight" className="w-full p-4 text-xs border border-zinc-200 outline-none focus:border-black" required 
                            onChange={e => setNewProduct({...newProduct, slug: e.target.value})} value={newProduct.slug} />
                    </div>
                </div>

                {/* ÁREA DE SUBIDA DE IMÁGENES */}
                <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em]">Imágenes del Producto (Max 3)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {newProduct.image_url.map((url, index) => (
                      <div key={index} className="relative aspect-square border-2 border-dashed border-zinc-300 bg-white flex items-center justify-center overflow-hidden group">
                        {url ? (
                          <>
                            <img src={url} alt="preview" className="w-full h-full object-cover" />
                            <button 
                              type="button" 
                              onClick={() => removeImage(index)}
                              className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity font-black text-[10px] uppercase italic"
                            >
                              Eliminar Foto
                            </button>
                          </>
                        ) : (
                          <CldUploadWidget uploadPreset="luxuryrpk" onSuccess={handleUploadSuccess}>
                            {({ open }) => (
                              <button 
                                type="button" 
                                onClick={() => open()}
                                className="w-full h-full flex flex-col items-center justify-center space-y-2 text-zinc-400 hover:text-black transition-colors"
                              >
                                <span className="text-2xl">+</span>
                                <span className="text-[9px] font-black uppercase tracking-widest">Subir Foto</span>
                              </button>
                            )}
                          </CldUploadWidget>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="w-full bg-black text-white font-black py-5 text-[10px] uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all">
                  Guardar Producto en Luxury RPK
                </button>
              </form>
            )}
          </div>
        )}

        {/* GRILLA DE PRODUCTOS */}
        <div className="space-y-20">
          {Object.keys(groupedProducts).map((modelName) => (
            <div key={modelName}>
              <h2 className="text-2xl font-black uppercase italic mb-8 border-b-2 border-black inline-block">
                {modelName}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                {groupedProducts[modelName].map((product: Product) => (
                  <div key={product.id} className="relative group">
                    <Link href={`/categoria/${product.category}/${product.subcategory}/${product.slug}`}>
                      <div className="aspect-square bg-zinc-50 overflow-hidden">
                        {(() => {
                          // 1. Extraemos a una variable local para facilitar la inferencia
                          const imgs = product.image_url;
                          
                          // 2. Verificamos si es un array con contenido o un string con contenido
                          const hasValidContent = Array.isArray(imgs) 
                            ? (imgs.length > 0 && typeof imgs[0] === 'string' && imgs[0].trim() !== "")
                            : (typeof imgs === 'string' && (imgs as string).trim() !== "");

                          if (hasValidContent) {
                            // 3. Obtenemos el valor final forzando el tipo para evitar el error de 'never'
                            const displaySrc = Array.isArray(imgs) ? imgs[0] : (imgs as string);

                            return (
                              <CldImage
                                width="400"
                                height="400"
                                src={displaySrc}
                                alt={product.name}
                                className="object-cover w-full h-full"
                              />
                            );
                          }

                          // 4. Fallback si no hay imagen válida
                          return (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-100 text-zinc-400">
                              <span className="text-xl mb-1">✕</span>
                              <span className="text-[9px] font-black uppercase tracking-widest">Sin Foto</span>
                            </div>
                          );
                        })()}
                      </div>
                      <h3 className="text-sm font-bold uppercase tracking-tight">{product.name}</h3>
                      <p className="text-sm font-medium italic text-zinc-500 mt-1">
                        ${Number(product.price).toLocaleString('es-CL')}
                      </p>
                    </Link>
                    {isAdmin && (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          deleteProduct(product.id);
                        }} 
                        className="absolute top-2 left-2 bg-black text-white text-[9px] font-black px-3 py-2 z-20 border border-zinc-700 hover:bg-red-600 transition-all"
                      >
                        BORRAR
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}