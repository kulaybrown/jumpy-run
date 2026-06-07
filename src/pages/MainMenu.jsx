import React from 'react';

export default function MainMenu({ onStartGame }) {
  return (
    <div className="relative flex flex-col items-center justify-center text-center w-full h-full min-h-[450px] max-w-xl p-8 bg-slate-950 rounded-3xl shadow-[0_0_50px_rgba(34,211,238,0.15)] border border-cyan-500/20 overflow-hidden select-none">
      
      {/* Decorative Background Glows */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Sparkles/Particles (Pure CSS Decoration) */}
      <div className="absolute top-12 left-16 text-cyan-500/30 text-xl animate-pulse">✨</div>
      <div className="absolute bottom-16 right-16 text-yellow-500/20 text-2xl animate-bounce duration-1000">🪙</div>
      <div className="absolute bottom-24 left-20 text-indigo-500/30 text-lg">⚡</div>

      {/* Game Title Layer */}
      <div className="space-y-3 z-10">
        <h1 className="text-6xl font-black tracking-wider uppercase drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] animate-bounce duration-700">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">Jumpy</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-[0_2px_10px_rgba(251,191,36,0.3)]">Run!</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium leading-relaxed">
          An endless jumping adventure. Dodge the hazards, grab the coins, and unleash powerful skill boosts!
        </p>
      </div>

      {/* Centerpiece Interactive Button */}
      <div className="mt-10 z-10">
        <button
          onClick={onStartGame}
          className="group relative px-10 py-5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-extrabold text-2xl rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer overflow-hidden tracking-wide"
        >
          {/* Subtle button reflection hover overlay effect */}
          <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-12 -translate-x-full group-hover:animate-shine pointer-events-none" />
          
          <span className="flex items-center gap-3">
            PLAY NOW <span className="text-xl group-hover:translate-x-1 transition-transform">▶</span>
          </span>
        </button>
      </div>

      {/* Controls / Info Layout */}
      <div className="mt-12 flex items-center gap-6 text-xs text-slate-500 border-t border-slate-900 pt-6 w-full justify-center z-10">
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-md text-slate-300 font-mono shadow-sm">Spacebar</span>
          <span>to Jump</span>
        </div>
        <div className="w-1 h-1 bg-slate-800 rounded-full" />
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-md text-slate-300 font-mono shadow-sm">Tap Screen</span>
          <span>to Jump</span>
        </div>
      </div>
    </div>
  );
}