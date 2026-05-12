'use client'
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
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

            const cat = item.toLowerCase().replace('zapatillas', 'calzado');
            
            // CORRECCIÓN AQUÍ: 
            // Usamos /todas/articulos para que coincida con el Home y la SubcategoryPage
            // La barra "/" al principio es fundamental para que no se duplique la ruta
            const finalHref = `/${cat}/todas/articulos`; 

            return (
              <Link 
                key={item}
                href={finalHref} 
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
  );
}