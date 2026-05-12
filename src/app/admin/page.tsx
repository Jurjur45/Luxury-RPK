"use client";
import { useEffect, useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { supabase } from '@/lib/supabase';
import BackButton from '@/components/BackButton';

type Product = { id: string; name: string; image_url: string[]; category: string; subcategory: string; price: number };
type Feedback = { id: string; rating: number | null; image_url: string | null; is_approved: boolean; product_id: string | null };

export default function AdminPanel() {
  const [category, setCategory] = useState('ropa');
  const [subcategory, setSubcategory] = useState('poleras');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);

  const [productId, setProductId] = useState('');
  const [rating, setRating] = useState(5);
  const [feedbackImage, setFeedbackImage] = useState('');
  
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [headerBanner, setHeaderBanner] = useState('');

  useEffect(() => { loadAdminData(); }, []);

  const loadAdminData = async () => {
    const [{ data: productsData }, { data: feedbackData }, { data: contentData }] = await Promise.all([
      supabase.from('products').select('id,name,image_url,category,subcategory,price').order('created_at', { ascending: false }),
      supabase.from('feedbacks').select('id,rating,image_url,is_approved,product_id').order('created_at', { ascending: false }),
      supabase.from('site_content').select('key,value').in('key', ['hero_title', 'hero_subtitle', 'header_banner']),
    ]);

    setProducts((productsData || []) as Product[]);
    setFeedbacks((feedbackData || []) as Feedback[]);
    if (productsData?.[0] && !productId) setProductId(productsData[0].id);

    if (contentData) {
      setHeroTitle(contentData.find((c: any) => c.key === 'hero_title')?.value || '');
      setHeroSubtitle(contentData.find((c: any) => c.key === 'hero_subtitle')?.value || '');
      setHeaderBanner(contentData.find((c: any) => c.key === 'header_banner')?.value || '');
    }
  };

  const saveSiteContent = async () => {
    const payload = [
      { key: 'hero_title', value: heroTitle },
      { key: 'hero_subtitle', value: heroSubtitle },
      { key: 'header_banner', value: headerBanner },
    ];
    const { error } = await supabase.from('site_content').upsert(payload, { onConflict: 'key' });
    alert(error ? error.message : 'Configuración guardada');
  };

  const handleUploadSuccess = (result: any) => { if (images.length < 3) setImages((prev) => [...prev, result.info.secure_url]); };
  const handleFeedbackUploadSuccess = (result: any) => { setFeedbackImage(result.info.secure_url); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const slug = name.toLowerCase().trim().replace(/\s+/g, '-');
    const { error } = await supabase.from('products').insert([{ name, price: Number(price), image_url: images, category, subcategory, slug }]);
    if (!error) { setImages([]); setName(''); setPrice(''); loadAdminData(); }
    setLoading(false);
  };

  const addFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackImage) { alert("Sube una captura primero"); return; }
    const feedbackData = { 
      product_id: productId && productId !== "" ? productId : null, 
      rating: Number(rating), 
      image_url: feedbackImage, 
      is_approved: true 
    };
    const { error } = await supabase.from('feedbacks').insert([feedbackData]);
    if (!error) { setFeedbackImage(''); loadAdminData(); alert("Feedback visual guardado"); }
  };

  const deleteFeedback = async (id: string, imageUrl: string | null) => { 
    if(confirm("¿Seguro que quieres borrar este feedback? Se eliminará la imagen de la nube.")) {
      try {
        if (imageUrl) {
          await fetch('/api/delete-images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrls: [imageUrl] }),
          });
        }
        const { error } = await supabase.from('feedbacks').delete().match({ id }); 
        if (!error) {
          setFeedbacks(prev => prev.filter(f => f.id !== id));
        }
      } catch (err) {
        console.error("Error al borrar feedback:", err);
      }
    }
  };

  const deleteProduct = async (product: Product) => {
    if (confirm(`¿Borrar ${product.name}? Esto también eliminará las fotos de la nube.`)) {
      try {
        const res = await fetch('/api/delete-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrls: product.image_url }),
        });

        if (!res.ok) console.warn("No se pudieron borrar algunas imágenes de Cloudinary, pero borraremos el registro.");

        const { error } = await supabase.from('products').delete().eq('id', product.id);
        if (error) throw error;

        loadAdminData();
      } catch (err: any) {
        alert("Error: " + err.message);
      }
    }
  };

  const editFeedbackProduct = async (id: string) => {
    const newProductId = prompt("Nuevo ID del producto (vacío para General):");
    if (newProductId !== null) {
      await supabase.from('feedbacks').update({ product_id: newProductId === "" ? null : newProductId }).eq('id', id);
      loadAdminData();
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-6 space-y-14 bg-zinc-50/50 min-h-screen">
      <BackButton />
      <h1 className="text-4xl font-black uppercase italic tracking-tighter">Luxury Admin Control</h1>
      
      {/* 1. CONFIGURACIÓN VISUAL */}
      <section className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="font-black text-2xl uppercase italic text-black">Diseño Home & Hero</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="w-full p-3 border font-bold text-sm" value={headerBanner} onChange={(e) => setHeaderBanner(e.target.value)} placeholder="Banner superior" />
          <input className="w-full p-3 border font-bold text-sm" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="Título principal (Hero)" />
          <input className="w-full p-3 border font-bold text-sm md:col-span-2" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} placeholder="Subtítulo Hero" />
        </div>
        <button onClick={saveSiteContent} className="bg-black text-white px-8 py-3 font-black uppercase italic text-[10px] tracking-widest hover:bg-zinc-800 transition-all">Actualizar Home</button>
      </section>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* 2. AGREGAR PRODUCTO */}
        <section className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="font-black text-2xl uppercase italic text-black">Nuevo Producto</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Nombre" value={name} className="w-full p-3 border text-sm font-bold" onChange={(e) => setName(e.target.value)} required />
            <input type="number" placeholder="Precio" value={price} className="w-full p-3 border text-sm font-bold" onChange={(e) => setPrice(e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
              <select className="w-full p-3 border uppercase font-bold text-[10px]" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="ropa">Ropa</option>
                <option value="calzado">Zapatillas</option>
              </select>
              <select className="w-full p-3 border uppercase font-bold text-[10px]" value={subcategory} onChange={(e) => setSubcategory(e.target.value)}>
                <option value="poleras">Poleras</option>
                <option value="zapatillas">Zapatillas</option>
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {images.map((url, i) => <img key={i} src={url} className="aspect-square object-cover border rounded" alt="preview" />)}
              {images.length < 3 && (
                <CldUploadWidget uploadPreset="luxuryrpk" onSuccess={handleUploadSuccess}>
                  {({ open }) => <button type="button" onClick={() => open()} className="aspect-square border-2 border-dashed flex items-center justify-center text-zinc-400 font-black text-[10px] hover:border-black hover:text-black transition-all">+ FOTO</button>}
                </CldUploadWidget>
              )}
            </div>
            <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 font-black uppercase italic tracking-widest text-xs disabled:bg-zinc-400">
              {loading ? "Publicando..." : "Publicar Producto"}
            </button>
          </form>
        </section>

        {/* 3. GESTIONAR RESEÑAS */}
        <section className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="font-black text-2xl uppercase italic text-black">Gestionar Reseñas</h2>
          <form onSubmit={addFeedback} className="space-y-4">
            <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Vincular a Producto</label>
            <select className="w-full p-3 border text-[10px] font-black uppercase" value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">Tienda General</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            
            <CldUploadWidget uploadPreset="luxuryrpk" onSuccess={handleFeedbackUploadSuccess}>
              {({ open }) => (
                <button type="button" onClick={() => open()} className={`w-full border-2 border-dashed p-6 text-[10px] font-black uppercase transition-all ${feedbackImage ? "border-green-500 text-green-600 bg-green-50" : "border-zinc-200 text-zinc-400"}`}>
                  {feedbackImage ? "✓ Captura Cargada" : "+ Subir Captura"}
                </button>
              )}
            </CldUploadWidget>
            <button type="submit" className="w-full bg-zinc-900 text-white py-4 font-black uppercase italic tracking-widest text-xs">Guardar Feedback</button>
          </form>

          <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
            {feedbacks.map((f) => (
              <div key={f.id} className="relative group border rounded-xl overflow-hidden bg-zinc-100 shadow-sm">
                {f.image_url && <img src={f.image_url} className="w-full aspect-square object-cover" alt="feedback" />}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                  <button onClick={() => editFeedbackProduct(f.id)} className="bg-white text-black text-[8px] font-black px-4 py-2 uppercase">Editar</button>
                  <button onClick={() => deleteFeedback(f.id, f.image_url)} className="bg-red-600 text-white text-[8px] font-black px-4 py-2 uppercase">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 4. INVENTARIO */}
      <section className="bg-white border rounded-2xl p-6 shadow-sm">
        <h2 className="font-black text-2xl mb-6 uppercase italic text-black">Inventario Actual</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-4">
                <img src={p.image_url[0]} className="w-12 h-12 object-cover rounded-lg" alt="" />
                <div>
                  <p className="font-black text-[10px] uppercase truncate max-w-[150px]">{p.name}</p>
                  <p className="text-[9px] text-zinc-400 uppercase font-bold">${p.price.toLocaleString('es-CL')}</p>
                </div>
              </div>
              {/* CORRECCIÓN AQUÍ: Pasamos el objeto completo 'p' */}
              <button onClick={() => deleteProduct(p)} className="text-[8px] font-black uppercase bg-red-50 text-red-600 px-3 py-2 rounded-lg border border-red-100 hover:bg-red-600 hover:text-white transition-all">Eliminar</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}