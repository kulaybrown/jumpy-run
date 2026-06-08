import React from 'react';

export default function MainMenu({ onStartGame }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center text-center w-screen h-screen bg-slate-950 overflow-hidden select-none p-6">
      
      {/* Decorative Full-Screen Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Sparkles/Particles (Spread out across the wider viewport) */}
      <div className="absolute top-1/4 left-1/6 text-cyan-500/30 text-2xl animate-pulse hidden md:block">✨</div>
      <div className="absolute top-1/3 right-1/4 text-cyan-500/20 text-xl animate-pulse">✨</div>
      <div className="absolute bottom-1/3 left-1/4 text-yellow-500/20 text-3xl animate-bounce duration-1000">🪙</div>
      <div className="absolute bottom-1/4 right-1/5 text-indigo-500/30 text-2xl hidden md:block">⚡</div>

      {/* Main UI Wrapper: Restricts content vertical sprawl on massive screens */}
      <div className="flex flex-col items-center justify-between h-full max-h-[650px] w-full max-w-2xl z-10 py-6">
        
        {/* Game Title Layer */}
        <div className="space-y-4 adaptive-title">
          <h1 className="text-7xl sm:text-8xl font-black tracking-wider uppercase drop-shadow-[0_8px_8px_rgba(0,0,0,0.8)] animate-bounce duration-700">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">Jumpy</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-[0_2px_15px_rgba(251,191,36,0.4)]">Run!</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-sm mx-auto font-medium leading-relaxed px-4">
            An endless jumping adventure. Dodge the hazards, grab the coins, and unleash powerful skill boosts!
          </p>
        </div>

        {/* Centerpiece Interactive Button */}
        <div className="my-auto sm:my-0 flex items-center justify-center">
          <button
            onClick={onStartGame}
            className="group relative px-12 py-6 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-extrabold text-2xl sm:text-3xl rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.45)] transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer overflow-hidden tracking-wide"
          >
            {/* Subtle button reflection hover overlay effect */}
            <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-12 -translate-x-full group-hover:animate-shine pointer-events-none" />
            
            <span className="flex items-center gap-4">
              PLAY NOW <span className="text-2xl group-hover:translate-x-1 transition-transform">▶</span>
            </span>
          </button>
        </div>

        {/* Controls / Info Footer Layout */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-500 border-t border-slate-900 pt-6 w-full justify-center">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-md text-slate-300 font-mono shadow-sm">Spacebar</span>
            <span>to Jump</span>
          </div>
          <div className="hidden sm:block w-1 h-1 bg-slate-800 rounded-full" />
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-md text-slate-300 font-mono shadow-sm">Tap Screen</span>
            <span>to Jump</span>
          </div>
        </div>

      </div>
    </div>
  );
}