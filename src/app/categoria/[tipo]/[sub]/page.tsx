'use client'
import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import BackButton from '@/components/BackButton'; // 1. Importación

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

  const updateImage = (index: number, value: string) => {
    const newImages = [...newProduct.image_url];
    newImages[index] = value;
    setNewProduct({ ...newProduct, image_url: newImages });
  };

  if (loading) return <div className="py-40 text-center font-black uppercase italic tracking-widest">Cargando Luxury RPK...</div>;

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <main className="max-w-7xl mx-auto px-6">
        
        {/* 2. AGREGAMOS EL BOTÓN AQUÍ */}
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

        {/* ... resto del código del panel admin y grilla ... */}
        {isAdmin && (
          <div className="mb-12 border-t border-zinc-100 pt-8">
            <button 
              onClick={() => setShowAddForm(!showAddForm)} 
              className="bg-black text-white text-[10px] font-black px-8 py-4 uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all"
            >
              {showAddForm ? '✕ CERRAR PANEL' : '+ AGREGAR PRODUCTO'}
            </button>
            
            {showAddForm && (
              <form onSubmit={addProduct} className="mt-8 p-8 border border-black grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-zinc-50">
                {/* Inputs del formulario */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase">Nombre Modelo</label>
                  <input type="text" placeholder="Jordan 4" className="w-full p-3 text-xs border border-zinc-200 outline-none" required 
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase">Precio (CLP)</label>
                  <input type="number" placeholder="120000" className="w-full p-3 text-xs border border-zinc-200 outline-none" required 
                    onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase">Slug (Único)</label>
                  <input type="text" placeholder="jordan-4-midnight" className="w-full p-3 text-xs border border-zinc-200 outline-none" required 
                    onChange={e => setNewProduct({...newProduct, slug: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase">Imagen 1</label>
                  <input type="text" placeholder="URL Foto 1" className="w-full p-3 text-xs border border-zinc-200" required 
                    onChange={e => updateImage(0, e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase">Imagen 2</label>
                  <input type="text" placeholder="URL Foto 2" className="w-full p-3 text-xs border border-zinc-200"
                    onChange={e => updateImage(1, e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase">Imagen 3</label>
                  <input type="text" placeholder="URL Foto 3" className="w-full p-3 text-xs border border-zinc-200"
                    onChange={e => updateImage(2, e.target.value)} />
                </div>
                <div className="lg:col-span-3">
                  <button type="submit" className="w-full bg-black text-white font-black py-4 text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all">
                    GUARDAR PRODUCTO
                  </button>
                </div>
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
                      <div className="aspect-square bg-zinc-50 overflow-hidden mb-4 border border-zinc-100">
                        <img 
                          src={Array.isArray(product.image_url) ? product.image_url[0] : product.image_url} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" 
                        />
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