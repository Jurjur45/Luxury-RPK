'use client'
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { CldImage } from 'next-cloudinary';
import ProductCard from '@/components/ProductCard';

const MARQUEE_TEXT = '— LUXURY RPK — NUEVA COLECCIÓN — ENVÍOS A TODO CHILE — VALDIVIA — ROPA & CALZADO — STOCK LIMITADO ';
const marqueeContent = Array(8).fill(MARQUEE_TEXT).join('');

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [heroTitle, setHeroTitle] = useState('LUXURY RPK');
  const [imgHero, setImgHero] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

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

    loadData();
  }, []);

  return (
    <div className="bg-white text-black antialiased">

      {/* ── HERO ── */}
      <section className="relative h-screen w-full flex items-end overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          {imgHero && <CldImage src={imgHero} alt="Hero" fill className="object-cover opacity-55" loading="eager" />}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/30 z-10" />

        {/* grain texture */}
        <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.15]"
          style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")",backgroundSize:'200px'}} />

        <div className="relative z-20 w-full max-w-[1440px] mx-auto px-6 md:px-10 pb-14 md:pb-20">
          <p className="animate-fade-up text-[9px] font-black uppercase tracking-[0.45em] text-amber-400 mb-5">
            Colección Exclusiva · Valdivia, Chile
          </p>
          <h1 className="animate-fade-up-delay text-[18vw] md:text-[13vw] leading-[0.82] font-black uppercase italic text-white mb-10">
            {heroTitle}
          </h1>
          <div className="animate-fade-up-delay-2 flex items-center gap-8 flex-wrap">
            <button onClick={scrollToCategories}
              className="border-2 border-white text-white px-10 py-4 text-[9px] font-black uppercase tracking-[0.25em] hover:bg-white hover:text-black transition-all duration-300">
              Explorar Selección
            </button>
            <a href="https://www.instagram.com/luxuryrpk.cl/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-[9px] font-black uppercase tracking-[0.25em] text-white/50 hover:text-white/90 transition-colors">
              <span className="w-8 h-px bg-current inline-block" />
              Ver en Instagram
            </a>
          </div>
        </div>

        {/* scroll indicator */}
        <div className="absolute bottom-8 right-8 z-20 flex flex-col items-center gap-2.5 opacity-40">
          <span className="text-[7px] text-white font-black uppercase tracking-[0.3em]"
            style={{writingMode:'vertical-rl', letterSpacing:'0.3em'}}>Scroll</span>
          <div className="w-px h-12 bg-white animate-scroll-pulse origin-top" />
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="bg-black border-y border-zinc-800 py-3.5 overflow-hidden select-none">
        <div className="flex whitespace-nowrap animate-marquee">
          <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 flex-none">
            {marqueeContent}
          </span>
          <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 flex-none" aria-hidden="true">
            {marqueeContent}
          </span>
        </div>
      </div>

      <main className="max-w-[1440px] mx-auto px-6 md:px-10">

        {/* ── CATEGORÍAS ── */}
        <section ref={sectionRef} className="py-24 space-y-28">
          {(['ropa', 'calzado'] as const).map((cat, idx) => (
            <div key={cat}>
              <div className="flex items-end justify-between mb-10 pb-6 border-b border-zinc-100">
                <div>
                  <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.45em]">
                    0{idx + 1}
                  </span>
                  <h2 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mt-1">
                    {cat === 'calzado' ? 'Zapatillas' : 'Ropa'}
                  </h2>
                </div>
                <Link href={`/${cat}/todas/articulos`}
                  className="hidden md:flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-black transition-colors group">
                  Ver Todo
                  <span className="group-hover:translate-x-1.5 transition-transform inline-block">→</span>
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {products.filter(p => p.category === cat).slice(0, 4).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              <Link href={`/${cat}/todas/articulos`}
                className="mt-5 flex md:hidden items-center justify-center gap-3 border border-zinc-200 py-4 text-[9px] font-black uppercase tracking-[0.3em] hover:border-black transition-colors group">
                Ver Todo {cat === 'calzado' ? 'Zapatillas' : 'Ropa'}
                <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
              </Link>
            </div>
          ))}
        </section>

        {/* ── STATS STRIP ── */}
        <div className="border-y border-zinc-100 py-10 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
          {[
            { val: '100%', label: 'Stock Verificado' },
            { val: 'Chile', label: 'Envíos a Todo el País' },
            { val: 'VLD', label: 'Atención Presencial · Valdivia' },
          ].map(({ val, label }) => (
            <div key={label} className="flex flex-col items-center justify-center gap-1.5 py-8 md:py-0">
              <span className="text-3xl md:text-4xl font-black italic uppercase">{val}</span>
              <span className="text-[8px] font-black uppercase tracking-[0.35em] text-zinc-400">{label}</span>
            </div>
          ))}
        </div>

        {/* ── FEEDBACK ── */}
        <section className="py-24">
          <div className="flex items-end justify-between mb-12 pb-6 border-b border-zinc-100">
            <div>
              <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.45em]">03</span>
              <h2 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mt-1">Feedback</h2>
            </div>
            <div className="hidden md:flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-amber-400 text-sm">★</span>
              ))}
              <span className="ml-2 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">Clientes verificados</span>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar snap-x snap-mandatory -mx-6 px-6 md:-mx-10 md:px-10">
            {feedbacks.map((item) => (
              <article key={item.id} className="flex-none w-[155px] md:w-[210px] snap-center group cursor-default">
                <div className="aspect-[9/16] mb-3 overflow-hidden bg-zinc-50 relative">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-amber-400 z-10 scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
                  <div className="absolute top-3 right-3 flex gap-0.5 bg-black/30 backdrop-blur-sm px-1.5 py-1 z-10">
                    {[...Array(5)].map((_, i) => <span key={i} className="text-amber-400 text-[7px]">★</span>)}
                  </div>
                  {item.image_url && (
                    <CldImage
                      src={item.image_url}
                      alt="Review"
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-[1.04]"
                    />
                  )}
                </div>
                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest border-l-2 border-amber-400 pl-2 leading-tight">
                  {item.products?.name || 'Verified Client'}
                </p>
              </article>
            ))}

            {isAdmin && (
              <Link href="/admin"
                className="flex-none w-[155px] md:w-[210px] snap-center aspect-[9/16] border border-dashed border-zinc-200 flex flex-col items-center justify-center group hover:border-black transition-all">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-black transition-colors">
                  + Gestionar
                </span>
              </Link>
            )}
            <div className="flex-none w-4" />
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-black text-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 pt-16 md:pt-20 pb-10">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
            <div className="max-w-xs">
              <span className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase block mb-4 leading-none">
                LUXURY RPK
              </span>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.3em] leading-relaxed">
                Ropa & Calzado Premium<br/>Valdivia, Chile
              </p>
            </div>

            <div className="flex gap-16 md:gap-20">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.35em] text-zinc-600 mb-5">Colecciones</p>
                <div className="flex flex-col gap-3">
                  <Link href="/ropa/todas/articulos"
                    className="text-[10px] font-black uppercase tracking-wider text-zinc-400 hover:text-white transition-colors">
                    Ropa
                  </Link>
                  <Link href="/calzado/todas/articulos"
                    className="text-[10px] font-black uppercase tracking-wider text-zinc-400 hover:text-white transition-colors">
                    Zapatillas
                  </Link>
                </div>
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.35em] text-zinc-600 mb-5">Contacto</p>
                <div className="flex flex-col gap-3">
                  <a href="https://www.instagram.com/luxuryrpk.cl/" target="_blank" rel="noopener noreferrer"
                    className="text-[10px] font-black uppercase tracking-wider text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
                    Instagram
                    <span className="text-zinc-700">↗</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">
              © 2026 Luxury RPK · Todos los derechos reservados
            </p>
            <p className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest">
              Crafted in Valdivia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
