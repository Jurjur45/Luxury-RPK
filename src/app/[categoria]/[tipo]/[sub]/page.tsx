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
  product_type: string;
  description?: string;
}

export default function SubcategoryPage({ params: paramsPromise }: { params: Promise<{ tipo: string; sub: string }> }) {
  const params = use(paramsPromise);
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    price: 0, 
    image_url: [] as string[], 
    slug: '',
    description: '',
    product_type: 'in_stock'
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

  async function deleteProduct(id: string) {
    if (confirm('¿Seguro que quieres borrar este producto de Luxury RPK?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) fetchProducts();
      else alert("Error al borrar: " + error.message);
    }
  }

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setNewProduct({
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      slug: product.slug,
      description: product.description || '',
      product_type: product.product_type
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUploadSuccess = (result: any) => {
    const secureUrl = result.info.secure_url;
    setNewProduct(prev => ({ ...prev, image_url: [...prev.image_url, secureUrl] }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const productData = { ...newProduct, category: params.tipo.toLowerCase(), subcategory: params.sub.toLowerCase() };
    let error;
    if (editingId) {
      const { error: updateError } = await supabase.from('products').update(productData).eq('id', editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('products').insert([productData]);
      error = insertError;
    }
    if (!error) {
      setNewProduct({ name: '', price: 0, image_url: [], slug: '', description: '', product_type: 'in_stock' });
      setEditingId(null);
      setShowAddForm(false);
      fetchProducts();
    } else { alert("Error: " + error.message); }
  }

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const groupedProducts = filteredProducts.reduce((acc: { [key: string]: Product[] }, product: Product) => {
    if (!acc[product.name]) acc[product.name] = [];
    acc[product.name].push(product);
    return acc;
  }, {});

  if (loading) return <div className="py-40 text-center font-black uppercase italic tracking-[0.5em] animate-pulse">Cargando Luxury RPK...</div>;

  return (
    <div className="bg-white min-h-screen pt-32 pb-20 px-6">
      <main className="max-w-7xl mx-auto">
        <BackButton />

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
          <div>
            <h1 className="text-7xl md:text-8xl font-black uppercase italic tracking-tighter leading-none text-black">{params.sub}</h1>
            <p className="text-zinc-400 text-[10px] font-black tracking-[0.6em] uppercase mt-6 border-l-2 border-black pl-4">Luxury Selection — {params.tipo}</p>
          </div>
          <div className="relative w-full md:w-96">
            <input type="text" placeholder="BUSCAR MODELO..." className="bg-zinc-50 border border-zinc-200 px-6 py-5 w-full text-[10px] font-black tracking-[0.2em] outline-none uppercase focus:border-black transition-all" onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {isAdmin && (
          <div className="mb-20 border-y border-zinc-100 py-12 bg-zinc-50/50 px-6">
            <button onClick={() => { setShowAddForm(!showAddForm); if(editingId) setEditingId(null); }} className="bg-black text-white text-[10px] font-black px-10 py-5 uppercase tracking-[0.3em]">
              {showAddForm ? '✕ CERRAR' : editingId ? 'EDITANDO PIEZA' : '+ NUEVA PIEZA'}
            </button>
            {showAddForm && (
              <form onSubmit={handleSubmit} className="mt-12 space-y-10 max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black uppercase text-zinc-400">Modelo (Ej: Jordan 4 Retro)</label>
                    <input type="text" placeholder="MODELO" className="p-5 border text-xs font-bold uppercase italic outline-none focus:border-black" required onChange={e => setNewProduct({...newProduct, name: e.target.value})} value={newProduct.name} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black uppercase text-zinc-400">Nombre Específico (Ej: Military Black)</label>
                    <input type="text" placeholder="NOMBRE DEL PRODUCTO" className="p-5 border text-xs font-bold outline-none focus:border-black" required onChange={e => setNewProduct({...newProduct, slug: e.target.value})} value={newProduct.slug} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black uppercase text-zinc-400">Precio (CLP)</label>
                    <input type="number" placeholder="PRECIO" className="p-5 border text-xs font-bold outline-none focus:border-black" required onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} value={newProduct.price} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black uppercase text-zinc-400">Disponibilidad</label>
                    <select className="p-5 border text-xs font-bold uppercase italic outline-none focus:border-black" value={newProduct.product_type} onChange={e => setNewProduct({...newProduct, product_type: e.target.value})}>
                      <option value="in_stock">Entrega Inmediata</option>
                      <option value="pre_order">Bajo Pedido</option>
                    </select>
                  </div>
                </div>

                <textarea placeholder="DESCRIPCIÓN" className="w-full p-5 border text-xs font-bold min-h-[100px] outline-none focus:border-black" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Galería</label>
                  <div className="grid grid-cols-4 lg:grid-cols-6 gap-4">
                    {newProduct.image_url.map((url, index) => (
                      <div key={index} className="relative aspect-square border group overflow-hidden">
                        <img src={url} alt="preview" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                        <button type="button" onClick={() => { const up = newProduct.image_url.filter((_, i) => i !== index); setNewProduct({...newProduct, image_url: up}); }} className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 text-white text-[8px] font-black transition-all">QUITAR</button>
                      </div>
                    ))}
                    <CldUploadWidget uploadPreset="luxuryrpk" onSuccess={handleUploadSuccess}>
                      {({ open }) => ( <button type="button" onClick={() => open()} className="aspect-square border-2 border-dashed flex flex-col items-center justify-center text-zinc-300 hover:text-black hover:border-black transition-all"> <span className="text-xl">+</span> <span className="text-[8px] font-black uppercase">Subir</span> </button> )}
                    </CldUploadWidget>
                  </div>
                </div>
                <button type="submit" className="w-full bg-black text-white font-black py-6 text-[11px] uppercase tracking-[0.4em] hover:bg-zinc-800 transition-all">{editingId ? 'GUARDAR CAMBIOS' : 'PUBLICAR EN CATÁLOGO'}</button>
              </form>
            )}
          </div>
        )}

        <div className="space-y-32">
          {Object.keys(groupedProducts).map((modelName) => (
            <div key={modelName} className="group/section">
              <div className="flex items-center gap-6 mb-12">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter shrink-0">{modelName}</h2>
                <div className="h-[1px] w-full bg-zinc-100 group-hover/section:bg-black transition-all duration-700" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                {groupedProducts[modelName].map((product) => (
                  <div key={product.id} className="relative group">
                    <Link href={`/categoria/${product.category}/${product.subcategory}/${product.slug}`}>
                      <div className="aspect-[4/5] bg-zinc-50 overflow-hidden mb-6 border border-zinc-100 relative">
                        {product.product_type !== 'in_stock' && (
                          <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur px-3 py-1 border border-zinc-200">
                            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Bajo Pedido</p>
                          </div>
                        )}
                        {product.image_url && product.image_url.length > 0 ? (
                          <CldImage 
                            width="600" 
                            height="750" 
                            src={product.image_url[0]} 
                            alt={product.slug} 
                            className="object-cover w-full h-full grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
                          />
                        ) : ( 
                          <div className="w-full h-full flex items-center justify-center text-zinc-300 text-[8px] font-black uppercase">Sin Imagen</div> 
                        )}
                      </div>

                      <div className="space-y-1">
                        {/* AHORA: Solo el Slug formateado como nombre principal */}
                        <h3 className="text-[13px] font-black uppercase tracking-tight group-hover:italic transition-all leading-tight">
                          {product.slug.replace(/-/g, ' ')}
                        </h3>
                        
                        {/* El precio directamente debajo */}
                        <p className="text-[12px] font-medium text-zinc-900 mt-1">
                          ${Number(product.price).toLocaleString('es-CL')}
                        </p>
                      </div>
                    </Link>
                    {isAdmin && (
                      <div className="absolute top-4 right-4 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={(e) => { e.preventDefault(); startEdit(product); }} className="bg-white/90 backdrop-blur text-black text-[8px] font-black px-3 py-2 border border-zinc-200 hover:bg-black hover:text-white transition-all">EDITAR</button>
                        <button onClick={(e) => { e.preventDefault(); deleteProduct(product.id); }} className="bg-red-600/90 backdrop-blur text-white text-[8px] font-black px-3 py-2 border border-red-600 hover:bg-black hover:border-black transition-all">BORRAR</button>
                      </div>
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