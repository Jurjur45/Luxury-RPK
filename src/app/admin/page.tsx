"use client";
// ESTA ES LA LÍNEA QUE FALTA:
import { useState } from 'react'; 
import { CldUploadWidget } from 'next-cloudinary';
import { supabase } from '@/lib/supabase';

export default function AdminPanel() {
  // Ahora estos estados funcionarán correctamente
  const [category, setCategory] = useState('ropa');
  const [subcategory, setSubcategory] = useState('poleras');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleUploadSuccess = async (result: any) => {
    const imageUrl = result.info.secure_url;
    // Creamos un slug amigable para la URL (ej: "Polera Jordan" -> "polera-jordan")
    const slug = name.toLowerCase().trim().replace(/\s+/g, '-');

    const { error } = await supabase
      .from('products')
      .insert([{ 
        name, 
        price: Number(price), 
        image_url: imageUrl, 
        category, 
        subcategory,
        slug 
      }]);

    if (!error) {
      alert('¡Producto Luxury RPK publicado con éxito!');
    } else {
      console.error("Error al guardar:", error);
      alert('Error al guardar en la base de datos.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-20 px-6">
      <h1 className="text-3xl font-black mb-10 uppercase italic">Panel de Control Luxury RPK</h1>
      
      <div className="space-y-4 mb-8">
        <input 
          type="text" 
          placeholder="Nombre del producto" 
          className="w-full p-4 border-2 border-black rounded-xl focus:ring-2 focus:ring-gray-200 outline-none transition-all"
          onChange={(e) => setName(e.target.value)}
        />
        <input 
          type="number" 
          placeholder="Precio (ej: 89990)" 
          className="w-full p-4 border-2 border-black rounded-xl focus:ring-2 focus:ring-gray-200 outline-none transition-all"
          onChange={(e) => setPrice(e.target.value)}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <select 
            className="w-full p-4 border-2 border-black rounded-xl bg-white"
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="ropa">Ropa</option>
            <option value="calzado">Calzado</option>
          </select>

          <select 
            className="w-full p-4 border-2 border-black rounded-xl bg-white"
            onChange={(e) => setSubcategory(e.target.value)}
          >
            <option value="poleras">Poleras</option>
            <option value="polerones">Polerones</option>
            <option value="chaquetas">Chaquetas</option>
            <option value="zapatillas">Zapatillas</option>
          </select>
        </div>
      </div>

      <CldUploadWidget 
        uploadPreset="luxury_rpk_preset" 
        onSuccess={handleUploadSuccess}
      >
        {({ open }) => (
          <button 
            onClick={() => open()}
            className="w-full bg-black text-white py-5 rounded-2xl font-bold hover:bg-zinc-800 transition-colors shadow-lg"
          >
            Subir Imagen y Publicar
          </button>
        )}
      </CldUploadWidget>
    </div>
  );
}