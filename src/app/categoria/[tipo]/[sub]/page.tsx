'use client'
import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import { CldUploadWidget, CldImage } from 'next-cloudinary';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string[];
  slug: string;
  category: string;
  subcategory: string;
  product_type: string; // Añadido para manejar el stock
}

export default function SubcategoryPage({ params: paramsPromise }: { params: Promise<{ tipo: string; sub: string }> }) {
  const params = use(paramsPromise);
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // ESTADO INICIAL ACTUALIZADO: image_url ahora es un array vacío y dinámico
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    price: 0, 
    image_url: [] as string[], 
    slug: '',
    product_type: 'in_stock' // Valor por defecto
  });

  useEffect(() => {
    checkUser();
    fetchProducts();
  }, [params.tipo, params.sub]);

  async function checkUser() {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('isLuxuryAdmin');
      setIsAdmin(session === 'true');
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

  // Lógica de subida ILIMITADA
  const handleUploadSuccess = (result: any) => {
    const secureUrl = result.info.secure_url;
    setNewProduct(prev => ({
      ...prev,
      image_url: [...prev.image_url, secureUrl] // Agregamos la nueva URL al array existente
    }));
  };

  const removeImage = (index: number) => {
    const updatedImages = newProduct.image_url.filter((_, i) => i !== index);
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
    const { error } = await supabase.from('products').insert([{
      ...newProduct,
      category: params.tipo.toLowerCase(),
      subcategory: params.sub.toLowerCase(),
    }]);
    
    if (!error) {
      setNewProduct({ name: '', price: 0, image_url: [], slug: '', product_type: 'in_stock' });
      setShowAddForm(false);
      fetchProducts();
    } else {
      alert("Error al guardar: " + error.message);
    }
  }

  if (loading) return <div className="py-40 text-center font-black uppercase italic tracking-[0.5em] animate-pulse">Cargando Luxury RPK...</div>;

  return (
    <div className="bg-white min-h-screen pt-32 pb-20">
      <main className="max-w-7xl mx-auto px-6">
        
        <BackButton />

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
          <div>
            <h1 className="text-7xl md:text-8xl font-black uppercase italic tracking-tighter leading-none text-black">
              {params.sub}
            </h1>
            <p className="text-zinc-400 text-[10px] font-black tracking-[0.6em] uppercase mt-6 border-l-2 border-black pl-4">
              Luxury Selection — {params.tipo}
            </p>
          </div>
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="BUSCAR MODELO..." 
              className="bg-zinc-50 border border-zinc-200 px-6 py-5 w-full text-[10px] font-black tracking-[0.2em] outline-none uppercase focus:border-black transition-all"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isAdmin && (
          <div className="mb-20 border-y border-zinc-100 py-12 bg-zinc-50/50 px-6">
            <button 
              onClick={() => setShowAddForm(!showAddForm)} 
              className="bg-black text-white text-[10px] font-black px-10 py-5 uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all border border-black"
            >
              {showAddForm ? '✕ CERRAR PANEL' : '+ NUEVO LANZAMIENTO'}
            </button>
            
            {showAddForm && (
              <form onSubmit={addProduct} className="mt-12 grid grid-cols-1 gap-12 max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nombre</label>
                        <input type="text" placeholder="JORDAN 4 RETRO" className="w-full bg-white p-5 text-xs font-bold border border-zinc-200 outline-none focus:border-black uppercase italic" required 
                            onChange={e => setNewProduct({...newProduct, name: e.target.value})} value={newProduct.name} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Precio (CLP)</label>
                        <input type="number" placeholder="120000" className="w-full bg-white p-5 text-xs font-bold border border-zinc-200 outline-none focus:border-black" required 
                            onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} value={newProduct.price} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Slug</label>
                        <input type="text" placeholder="j4-retro-black" className="w-full bg-white p-5 text-xs font-bold border border-zinc-200 outline-none focus:border-black" required 
                            onChange={e => setNewProduct({...newProduct, slug: e.target.value})} value={newProduct.slug} />
                    </div>
                    
                    {/* SELECTOR DE DISPONIBILIDAD */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Disponibilidad</label>
                      <select 
                        className="w-full bg-white p-5 text-xs font-bold border border-zinc-200 outline-none focus:border-black uppercase italic"
                        value={newProduct.product_type}
                        onChange={e => setNewProduct({...newProduct, product_type: e.target.value})}
                      >
                        <option value="in_stock">Entrega Inmediata (Valdivia)</option>
                        <option value="pre_order">Bajo Pedido (Encargo)</option>
                        <option value="sold_out">Agotado</option>
                      </select>
                    </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Galería de Imágenes</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                    {newProduct.image_url.map((url, index) => (
                      <div key={index} className="relative aspect-square border border-zinc-200 bg-white group overflow-hidden">
                        <img src={url} alt="preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => removeImage(index)}
                          className="absolute inset-0 bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-all font-black text-[8px] uppercase"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                    
                    {/* Botón de subida siempre disponible */}
                    <CldUploadWidget uploadPreset="luxuryrpk" onSuccess={handleUploadSuccess}>
                      {({ open }) => (
                        <button 
                          type="button" 
                          onClick={() => open()}
                          className="aspect-square border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center space-y-2 text-zinc-300 hover:text-black hover:border-black transition-all"
                        >
                          <span className="text-2xl font-light">+</span>
                          <span className="text-[8px] font-black uppercase tracking-widest">Subir</span>
                        </button>
                      )}
                    </CldUploadWidget>
                  </div>
                </div>

                <button type="submit" className="w-full bg-black text-white font-black py-6 text-[11px] uppercase tracking-[0.4em] hover:invert transition-all">
                  Publicar en Catálogo
                </button>
              </form>
            )}
          </div>
        )}

        <div className="space-y-32">
          {Object.keys(groupedProducts).map((modelName) => (
            <div key={modelName} className="group/section">
              <div className="flex items-center gap-6 mb-12">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter shrink-0">
                  {modelName}
                </h2>
                <div className="h-[1px] w-full bg-zinc-100 group-hover/section:bg-black transition-colors duration-700" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                {groupedProducts[modelName].map((product: Product) => (
                  <div key={product.id} className="relative group">
                    <Link href={`/categoria/${product.category}/${product.subcategory}/${product.slug}`}>
                      <div className="aspect-[4/5] bg-zinc-50 overflow-hidden mb-6 border border-zinc-100 relative">
                        {/* ETIQUETA DE STOCK EN LA MINIATURA */}
                        {product.product_type !== 'in_stock' && (
                          <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur px-3 py-1 border border-zinc-200">
                             <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Bajo Pedido</p>
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10" />
                        
                        {(() => {
                          const imgs = product.image_url;
                          const hasValidContent = Array.isArray(imgs) && imgs.length > 0;

                          if (hasValidContent) {
                            return (
                              <CldImage
                                width="600"
                                height="750"
                                src={imgs[0]}
                                alt={product.name}
                                className="object-cover w-full h-full grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                              />
                            );
                          }

                          return (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-100 text-zinc-300">
                              <span className="text-2xl mb-2 font-light">✕</span>
                              <span className="text-[8px] font-black uppercase tracking-[0.4em]">Sin Foto</span>
                            </div>
                          );
                        })()}
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-[13px] font-black uppercase tracking-tight group-hover:italic transition-all">
                          {product.name}
                        </h3>
                        <p className="text-[12px] font-medium text-zinc-400">
                          ${Number(product.price).toLocaleString('es-CL')}
                        </p>
                      </div>
                    </Link>

                    {isAdmin && (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          deleteProduct(product.id);
                        }} 
                        className="absolute top-4 right-4 bg-white/90 backdrop-blur text-black text-[8px] font-black px-4 py-2 z-20 border border-zinc-200 hover:bg-black hover:text-white transition-all opacity-0 group-hover:opacity-100"
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