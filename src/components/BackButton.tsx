'use client'
import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()

  return (
    <button 
      onClick={() => router.back()}
      className="group flex items-center bg-zinc-100 hover:bg-black text-black hover:text-white px-5 py-2.5 rounded-full border border-zinc-200 transition-all duration-300 mb-8"
    >
      <svg 
        className="w-3.5 h-3.5 mr-2 group-hover:-translate-x-1 transition-transform" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="3" 
          d="M15 19l-7-7 7-7" 
        />
      </svg>
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">
        Back
      </span>
    </button>
  )
}