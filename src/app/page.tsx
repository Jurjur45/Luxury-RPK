'use client'
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { CldImage } from 'next-cloudinary';
import ProductCard from '@/components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [heroTitle, setHeroTitle] = useState('LUXURY RPK');
  const [imgHero, setImgHero] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollToCategories = () => sectionRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    const session = localStorage.getItem('isLuxuryAdmin');
    setIsAdmin(session === 'true');

    async function loadData() {
      const { data: contentData } = await supabase.from('site_content').select('*');
      if (contentData) {
        const map = Object.fromEntries(contentData.map(c => [c.key, c.value]));
        setHeroTitle(map.hero_title || 'LUXURY RPK');
        setImgHero(map.img_hero_bg || ''); 
      }

      const { data: productsData } = await supabase.from('products').select('*');
      if (productsData) setProducts(productsData);

      const { data: fbData } = await supabase.from('feedbacks').select('*, products(name)').eq('is_approved', true);
      if (fbData) setFeedbacks(fbData);
    }

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    loadData();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-white text-black antialiased">
      
      {/* HEADER */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md border-b border-zinc-100 py-2 md:py-3 shadow-sm' 
          : 'bg-black/10 backdrop-blur-sm py-4 md:py-5 border-b border-white/5'
      }`}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 flex justify-between items-center">
          
          <Link href="/" className={`text-base md:text-xl font-black uppercase italic tracking-tighter transition-colors duration-500 ${
            isScrolled ? 'text-black' : 'text-white'
          }`}>
            LUXURY RPK
          </Link>

          <nav className="flex gap-4 md:gap-12">
            {['Ropa', 'Zapatillas', 'Instagram'].map((item) => {
              if (item === 'Instagram') {
                return (
                  <a 
                    key={item}
                    href="https://www.instagram.com/luxuryrpk.cl/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${
                      isScrolled ? 'text-black hover:text-zinc-500' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {item}
                  </a>
                );
              }

              const categoryPath = item.toLowerCase().replace('zapatillas', 'calzado');
              // IMPORTANTE: Esta ruta debe coincidir con la lógica de tu SubcategoryPage
              return (
                <Link 
                  key={item}
                  href={`/${categoryPath}/todas/articulos`} 
                  className={`text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${
                    isScrolled ? 'text-black hover:text-zinc-500' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {item}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* 1. HERO */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0 opacity-70">
          {imgHero && <CldImage src={imgHero} alt="Hero" fill className="object-cover" priority />}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 z-10" />
        <div className="relative z-20 text-center px-6">
          <h1 className="text-[15vw] md:text-[12vw] leading-none font-black uppercase italic text-white">{heroTitle}</h1>
          <button onClick={scrollToCategories} className="mt-8 border-2 border-white text-white px-12 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
            Explorar Selección
          </button>
        </div>
      </section>

      <main className="max-w-[1440px] mx-auto px-6">
        
        {/* 2. CATEGORÍAS */}
        <section ref={sectionRef} className="py-20 space-y-24">
          {['ropa', 'calzado'].map((cat) => (
            <div key={cat}>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-8">
                {cat === 'calzado' ? 'Zapatillas' : 'Ropa'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {products.filter(p => p.category === cat).slice(0, 4).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
                
                {/* BOTÓN VER TODO: Sincronizado con el Header */}
                <Link 
                  href={`/${cat}/todas/articulos`} 
                  className="aspect-[4/5] border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center hover:border-black transition-all group bg-zinc-50/30"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-center px-2">
                    Ver Todo {cat === 'calzado' ? 'Zapatillas' : 'Ropa'}
                  </span>
                  <span className="text-xl mt-2 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          ))}
        </section>

        {/* 3. COMMUNITY FEEDBACK - Versión Alargada y Proporcional */}
        <section className="py-20 border-t border-zinc-100 overflow-hidden bg-white">
          <div className="text-center mb-12 px-6">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">Feedback</h2>
            <p className="text-zinc-400 mt-2 uppercase text-[9px] font-black tracking-[0.3em]">Envíos a todo Chile y presencial Valdivia</p>
          </div>

          {/* Contenedor del Scroll Horizontal */}
          <div className="flex gap-4 overflow-x-auto pb-10 px-6 no-scrollbar snap-x snap-mandatory">
            {feedbacks.map((item) => (
              <article key={item.id} className="flex-none w-[180px] md:w-[240px] snap-center group">
                <div className="aspect-[9/16] mb-4 overflow-hidden bg-zinc-50 relative border border-zinc-100 shadow-sm transition-all duration-500 group-hover:shadow-xl">
                  {/* Estrellas minimalistas */}
                  <div className="absolute top-3 right-3 flex gap-0.5 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full z-10">
                    {[...Array(5)].map((_, i) => <span key={i} className="text-amber-400 text-[8px]">★</span>)}
                  </div>
                  
                  {item.image_url && (
                    <CldImage 
                      src={item.image_url} 
                      alt="Review" 
                      fill 
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                    />
                  )}
                </div>
                
                <div className="px-1">
                   <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest border-l border-zinc-200 pl-2">
                    {item.products?.name || 'Verified Client'}
                  </p>
                </div>
              </article>
            ))}

            {/* BOTÓN ADMIN: Más pequeño también */}
            {isAdmin && (
              <Link 
                href="/admin" 
                className="flex-none w-[180px] md:w-[240px] snap-center aspect-[9/16] border border-dashed border-zinc-200 flex flex-col items-center justify-center group hover:border-black transition-all bg-zinc-50/50"
              >
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-black">
                  + Gestionar
                </span>
              </Link>
            )}
            
            <div className="flex-none w-10" />
          </div>
        </section>
      </main>

      <footer className="bg-black text-white py-20 px-6 mt-20">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <span className="text-4xl font-black italic tracking-tighter uppercase">LUXURY RPK</span>
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">© 2026 Crafted in Valdivia</p>
        </div>
      </footer>
    </div>
  );
}