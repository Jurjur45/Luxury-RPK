// src/components/Logo.tsx
export default function Logo() {
  return (
    <div className="flex items-center text-xl md:text-2xl font-black italic tracking-tighter select-none">
      {/* Parte: LUXURY */}
      <span className="bg-black text-white px-2 py-1 leading-none flex items-center h-full">
        LUXURY
      </span>
      
      {/* Parte: RPK */}
      <span className="bg-white text-black px-2 py-1 border-y border-r border-black leading-none flex items-center h-full">
        RPK
      </span>
    </div>
  )
}