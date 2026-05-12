"use client";
import { useEffect, useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { supabase } from '@/lib/supabase';
import BackButton from '@/components/BackButton';

type Product = { id: string; name: string; image_url: string[]; category: string; subcategory: string; price: number };
type Feedback = { id: string; rating: number | null; comment: string | null; image_url: string | null; is_approved: boolean; product_id: string | null };

export default function AdminPanel() {
  const [category, setCategory] = useState('ropa');
  const [subcategory, setSubcategory] = useState('poleras');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  const [productId, setProductId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbackImage, setFeedbackImage] = useState('');
  
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [headerBanner, setHeaderBanner] = useState('');
  const [imgCatRopa, setImgCatRopa] = useState('');
  const [imgCatZapatillas, setImgCatZapatillas] = useState('');

  useEffect(() => { loadAdminData(); }, []);

  const loadAdminData = async () => {
    const [{ data: productsData }, { data: feedbackData }, { data: contentData }] = await Promise.all([
      supabase.from('products').select('id,name,image_url,category,subcategory,price').order('created_at', { ascending: false }),
      supabase.from('feedbacks').select('id,rating,comment,image_url,is_approved,product_id').order('created_at', { ascending: false }),
      supabase.from('site_content').select('key,value').in('key', ['hero_title', 'hero_subtitle', 'header_banner', 'img_cat_ropa', 'img_cat_zapatillas']),
    ]);

    setProducts((productsData || []) as Product[]);
    setFeedbacks((feedbackData || []) as Feedback[]);
    if (productsData?.[0] && !productId) setProductId(productsData[0].id);

    if (contentData) {
      setHeroTitle(contentData.find((c: any) => c.key === 'hero_title')?.value || '');
      setHeroSubtitle(contentData.find((c: any) => c.key === 'hero_subtitle')?.value || '');
      setHeaderBanner(contentData.find((c: any) => c.key === 'header_banner')?.value || '');
      setImgCatRopa(contentData.find((c: any) => c.key === 'img_cat_ropa')?.value || '');
      setImgCatZapatillas(contentData.find((c: any) => c.key === 'img_cat_zapatillas')?.value || '');
    }
  };

  const saveSiteContent = async () => {
    const payload = [
      { key: 'hero_title', value: heroTitle },
      { key: 'hero_subtitle', value: heroSubtitle },
      { key: 'header_banner', value: headerBanner },
      { key: 'img_cat_ropa', value: imgCatRopa },
      { key: 'img_cat_zapatillas', value: imgCatZapatillas },
    ];
    const { error } = await supabase.from('site_content').upsert(payload, { onConflict: 'key' });
    alert(error ? error.message : 'Configuración guardada');
  };

  const handleUploadSuccess = (result: any) => { if (images.length < 3) setImages((prev) => [...prev, result.info.secure_url]); };
  const handleFeedbackUploadSuccess = (result: any) => { setFeedbackImage(result.info.secure_url); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = name.toLowerCase().trim().replace(/\s+/g, '-');
    const { error } = await supabase.from('products').insert([{ name, price: Number(price), image_url: images, category, subcategory, slug }]);
    if (!error) { setImages([]); setName(''); setPrice(''); loadAdminData(); }
  };

  const addFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validamos que haya al menos un comentario o una imagen
    if (!comment && !feedbackImage) {
      alert("Debes agregar al menos un comentario o una imagen para el feedback");
      return;
    }

    // Preparamos el objeto asegurando que el ID sea null si es "Tienda General"
    const feedbackData = { 
      product_id: productId && productId !== "" ? productId : null, 
      rating: Number(rating), 
      comment: comment.trim(), 
      image_url: feedbackImage || null, 
      is_approved: true 
    };

    const { error } = await supabase
      .from('feedbacks')
      .insert([feedbackData]);

    if (error) {
      console.error("Error al subir feedback:", error.message);
      alert("Error de Supabase: " + error.message);
    } else {
      alert("¡Feedback subido con éxito!");
      // Limpiamos todo
      setComment('');
      setFeedbackImage('');
      setRating(5);
      loadAdminData(); 
    }
  };

  const deleteFeedback = async (id: string) => { await supabase.from('feedbacks').delete().eq('id', id); loadAdminData(); };
  const toggleApproval = async (id: string, value: boolean) => { await supabase.from('feedbacks').update({ is_approved: !value }).eq('id', id); loadAdminData(); };
  const deleteProduct = async (product: Product) => {
    await supabase.from('products').delete().eq('id', product.id);
    loadAdminData();
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-6 space-y-14 bg-zinc-50/50 min-h-screen">
      <BackButton />
      <h1 className="text-4xl font-black uppercase italic tracking-tighter">Luxury Admin Control</h1>
      
      {/* 1. CONFIGURACIÓN VISUAL */}
      <section className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="font-black text-2xl uppercase italic">Diseño Home & Hero</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="w-full p-3 border font-bold text-sm" value={headerBanner} onChange={(e) => setHeaderBanner(e.target.value)} placeholder="Banner superior" />
          <input className="w-full p-3 border font-bold text-sm" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="Título principal (Hero)" />
          <input className="w-full p-3 border font-bold text-sm md:col-span-2" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} placeholder="Subtítulo Hero" />
        </div>
        <button onClick={saveSiteContent} className="bg-black text-white px-8 py-3 font-black uppercase italic text-[10px] tracking-widest">Actualizar Home</button>
      </section>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* 2. AGREGAR PRODUCTO */}
        <section className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="font-black text-2xl uppercase italic">Nuevo Producto</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Nombre" value={name} className="w-full p-3 border text-sm" onChange={(e) => setName(e.target.value)} required />
            <input type="number" placeholder="Precio" value={price} className="w-full p-3 border text-sm" onChange={(e) => setPrice(e.target.value)} required />
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
              {images.map((url, i) => <img key={i} src={url} className="aspect-square object-cover border rounded" />)}
              {images.length < 3 && (
                <CldUploadWidget uploadPreset="luxuryrpk" onSuccess={handleUploadSuccess}>
                  {({ open }) => <button type="button" onClick={() => open()} className="aspect-square border-2 border-dashed flex items-center justify-center text-zinc-400 font-black text-[10px]">+ FOTO</button>}
                </CldUploadWidget>
              )}
            </div>
            <button type="submit" className="w-full bg-black text-white py-4 font-black uppercase italic tracking-widest text-xs">Publicar Producto</button>
          </form>
        </section>

        {/* 3. TESTIMONIOS (FEEDBACK) */}
        <section className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="font-black text-2xl uppercase italic">Gestionar Reseñas</h2>
          <form onSubmit={addFeedback} className="space-y-4">
            <select className="w-full p-3 border text-[10px] font-black uppercase" value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">Tienda General</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full p-3 border text-sm min-h-[80px]" placeholder="Comentario del cliente..." />
            
            <CldUploadWidget uploadPreset="luxuryrpk" onSuccess={handleFeedbackUploadSuccess}>
              {({ open }) => (
                <button 
                  type="button" 
                  onClick={() => open()} 
                  className={`w-full border-2 border-dashed p-3 text-[10px] font-black uppercase transition-all ${
                    feedbackImage ? "border-green-500 text-green-600 bg-green-50" : "border-zinc-200 text-zinc-500"
                  }`}
                >
                  {feedbackImage ? "✓ Imagen Cargada Correctamente" : "+ Subir Captura (WhatsApp/Instagram)"}
                </button>
              )}
            </CldUploadWidget>
            <button type="submit" className="w-full bg-zinc-900 text-white py-4 font-black uppercase italic tracking-widest text-xs">Guardar Reseña</button>
          </form>

          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
            {feedbacks.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-3 border rounded bg-zinc-50">
                <div className="flex items-center gap-3">
                  {f.image_url && <img src={f.image_url} className="w-8 h-8 object-cover rounded" />}
                  <p className="text-[10px] font-bold italic truncate max-w-[120px]">{f.comment}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleApproval(f.id, f.is_approved)} className="text-[8px] font-black uppercase px-2 py-1 bg-white border">{f.is_approved ? 'Ocultar' : 'Ver'}</button>
                  <button onClick={() => deleteFeedback(f.id)} className="text-[8px] font-black uppercase px-2 py-1 bg-red-50 text-red-600 border border-red-100">X</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 4. LISTA DE PRODUCTOS */}
      <section className="bg-white border rounded-2xl p-6 shadow-sm">
        <h2 className="font-black text-2xl mb-6 uppercase italic">Inventario Actual</h2>
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
              <button onClick={() => deleteProduct(p)} className="text-[8px] font-black uppercase bg-red-50 text-red-600 px-3 py-2 rounded-lg border border-red-100">Eliminar</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}