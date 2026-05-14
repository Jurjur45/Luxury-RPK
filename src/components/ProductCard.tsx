'use client'
// AGREGA ESTA LÍNEA AQUÍ ABAJO:
import Link from 'next/link'; 

export default function ProductCard({ product }: { product: any }) {
  const productLink = `/categoria/${product.category}/${product.subcategory}/${product.slug}`;
  
  return (
    <div className="group relative bg-white border border-zinc-100 overflow-hidden">
      <div className="relative aspect-[4/5] bg-zinc-50 overflow-hidden">
        <Link href={productLink}>
          <img 
            src={product.image_url[0]} 
            alt={product.name} 
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" 
          />
        </Link>
      </div>
      <Link href={productLink} className="p-4 block text-center">
        <h3 className="text-[11px] font-black uppercase italic tracking-tighter text-zinc-900">
          {product.slug}
        </h3>
        <p className="text-[10px] font-medium text-zinc-500 mt-1 italic">
          ${Number(product.price).toLocaleString('es-CL')}
        </p>
      </Link>
    </div>
  );
}