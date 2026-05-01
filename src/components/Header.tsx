// src/components/Header.tsx
'use client'
import Link from 'next/link'
import Logo from './Logo'

const categories = [
  { name: 'Poleras', href: '/categoria/ropa/poleras' },
  { name: 'Polerones', href: '/categoria/ropa/polerones' },
  { name: 'Chaquetas', href: '/categoria/ropa/chaquetas' },
  { name: 'Zapatillas', href: '/categoria/calzado/zapatillas' },
]

export default function Header() {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo />
          </Link>

          {/* Menú de Categorías */}
          <div className="hidden md:flex space-x-8 items-center">
            {categories.map((cat) => (
              <Link 
                key={cat.name} 
                href={cat.href} 
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}