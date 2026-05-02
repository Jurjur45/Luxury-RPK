"use client";
import { useState } from 'react'; 
import { CldUploadWidget } from 'next-cloudinary';
import { supabase } from '@/lib/supabase';
import BackButton from '@/components/BackButton';

export default function AdminPanel() {
  const [category, setCategory] = useState('ropa');
  const [subcategory, setSubcategory] = useState('poleras');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState<string[]>([]); // Array para múltiples fotos

  const handleUploadSuccess = (result: any) => {
    const imageUrl = result.info.secure_url;
    if (images.length < 3) {
      setImages(prev => [...prev, imageUrl]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) return alert("Sube al menos una imagen");

    // Slug automático
    const slug = name.toLowerCase().trim().replace(/\s+/g, '-');

    const { error } = await supabase
      .from('products')
      .insert([{ 
        name, 
        price: Number(price), 
        image_url: images, // Enviamos el array completo
        category, 
        subcategory,
        slug 
      }]);

    if (!error) {
      alert('¡Producto Luxury RPK publicado con éxito!');
      setImages([]); // Limpiamos para el siguiente
      setName('');
      setPrice('');
    } else {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-20 px-6">
      <BackButton />
      <h1 className="text-4xl font-black mb-10 uppercase italic tracking-tighter">
        Luxury Admin Control
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="NOMBRE DEL PRODUCTO" 
            value={name}
            className="w-full p-4 border border-zinc-200 bg-zinc-50 font-bold outline-none focus:border-black transition-all uppercase text-xs tracking-widest"
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input 
            type="number" 
            placeholder="PRECIO (CLP)" 
            value={price}
            className="w-full p-4 border border-zinc-200 bg-zinc-50 font-bold outline-none focus:border-black transition-all uppercase text-xs tracking-widest"
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <select 
              className="w-full p-4 border border-zinc-200 bg-zinc-50 font-black uppercase text-[10px] tracking-widest outline-none"
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="ropa">Ropa</option>
              <option value="Zapatillas">Zapatillas</option>
            </select>

            <select 
              className="w-full p-4 border border-zinc-200 bg-zinc-50 font-black uppercase text-[10px] tracking-widest outline-none"
              onChange={(e) => setSubcategory(e.target.value)}
            >
              <option value="poleras">Poleras</option>
              <option value="polerones">Polerones</option>
              <option value="chaquetas">Chaquetas</option>
              <option value="zapatillas">Zapatillas</option>
            </select>
          </div>
        </div>

        {/* PREVIEW DE IMÁGENES SUBIDAS */}
        <div className="grid grid-cols-3 gap-4">
          {images.map((url, i) => (
            <div key={i} className="aspect-square border border-black relative">
              <img src={url} className="w-full h-full object-cover" alt="Preview" />
              <button 
                type="button"
                onClick={() => setImages(images.filter((_, index) => index !== i))}
                className="absolute top-0 right-0 bg-black text-white p-1 text-[8px]"
              >✕</button>
            </div>
          ))}
          {images.length < 3 && (
            <CldUploadWidget 
              uploadPreset="luxuryrpk" // USA TU PRESET: luxuryrpk
              onSuccess={handleUploadSuccess}
            >
              {({ open }) => (
                <button 
                  type="button"
                  onClick={() => open()}
                  className="aspect-square border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center text-[9px] font-black text-zinc-400 hover:border-black hover:text-black transition-all uppercase"
                >
                  <span>+ Agregar</span>
                  <span>Foto {images.length + 1}</span>
                </button>
              )}
            </CldUploadWidget>
          )}
        </div>

        <button 
          type="submit"
          className="w-full bg-black text-white py-5 font-black uppercase italic tracking-[0.3em] hover:bg-zinc-800 transition-all shadow-xl"
        >
          Publicar en Luxury RPK
        </button>
      </form>
    </div>
  );
}