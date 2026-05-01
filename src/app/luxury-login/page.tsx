'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PrivateLoginPage() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const router = useRouter();

  const handleFakeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Esta es la llave: si el usuario es 1 y la clave 2, entras.
    if (user === '1' && pass === '2') {
      localStorage.setItem('isLuxuryAdmin', 'true');
      router.push('/'); 
    } else {
      alert('Acceso denegado: Usuario o clave incorrectos');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white font-sans">
      <form onSubmit={handleFakeLogin} className="max-w-xs w-full space-y-6">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-black italic tracking-[0.3em] uppercase">Luxury RPK</h1>
          <p className="text-[10px] text-zinc-500 font-bold tracking-widest mt-2">ADMIN PANEL v1.0</p>
        </div>
        
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="USUARIO" 
            className="w-full bg-zinc-900 text-white p-4 text-xs border border-zinc-800 outline-none focus:border-white transition-all"
            onChange={e => setUser(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="CONTRASEÑA" 
            className="w-full bg-zinc-900 text-white p-4 text-xs border border-zinc-800 outline-none focus:border-white transition-all"
            onChange={e => setPass(e.target.value)}
          />
        </div>

        <button type="submit" className="w-full bg-white text-black font-black py-4 text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all">
          AUTENTICAR
        </button>
      </form>
    </div>
  );
}