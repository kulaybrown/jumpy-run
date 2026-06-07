import React from 'react';

export default function SkillCards({ visibleCards, onSelectSkill }) {
  // Fun, high-energy arcade color themes for kids!
  const themeStyles = [
    {
      border: 'hover:border-pink-500 hover:shadow-pink-500/30',
      glow: 'bg-pink-500/10 group-hover:bg-pink-500/20',
      text: 'group-hover:text-pink-400',
      badge: 'text-pink-400 bg-pink-500/10 border-pink-500/20'
    },
    {
      border: 'hover:border-cyan-400 hover:shadow-cyan-400/30',
      glow: 'bg-cyan-500/10 group-hover:bg-cyan-500/20',
      text: 'group-hover:text-cyan-400',
      badge: 'text-cyan-400 bg-cyan-500/10 border-cyan-400/20'
    },
    {
      border: 'hover:border-amber-400 hover:shadow-amber-400/30',
      glow: 'bg-amber-500/10 group-hover:bg-amber-500/20',
      text: 'group-hover:text-amber-400',
      badge: 'text-amber-400 bg-amber-500/10 border-amber-400/20'
    }
  ];

  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center z-50 rounded-2xl p-6 border-4 border-yellow-400/80 shadow-[inset_0_0_50px_rgba(234,179,8,0.3)] animate-fade-in overflow-hidden">
      
      {/* 🎪 Fun Backdrop Party Lighting Rings */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-75" />

      {/* Modern Card Matrix Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-2xl mb-8 relative z-10">
        {visibleCards.map((skill, index) => {
          // Format duration string cleanly (e.g. 5000ms -> "5.0s")
          const durationSeconds = skill.duration ? `${(skill.duration / 1000).toFixed(1)}s` : null;
          // Rotate colors so each of the 3 cards looks uniquely colorful
          const theme = themeStyles[index % themeStyles.length];

          return (
            <div
              key={skill.id}
              onClick={() => onSelectSkill(skill)}
              className={`group relative flex flex-col justify-between bg-slate-900 border-2 border-slate-800 ${theme.border} rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(0,0,0,0.6)] active:scale-95 cursor-pointer overflow-hidden min-h-[240px] shadow-[0_8px_0_#0f172a]`}
            >
              {/* Dynamic Neon Corner Burst */}
              <div className={`absolute -top-10 -right-10 w-24 h-24 ${theme.glow} rounded-full blur-xl transition-colors duration-300`} />

              <div className="flex flex-col items-start w-full relative z-10">
                {/* 1. GIANT EMOJI ICON (Pops on Hover!) */}
                <div className="text-6xl mb-4 transform group-hover:scale-125 group-hover:rotate-6 transition-transform duration-300 select-none drop-shadow-[0_4px_12px_rgba(255,255,255,0.2)]">
                  {skill.icon || '⚡'}
                </div>

                {/* 2. BOLD ARCADE TEXT NAME */}
                <div className="mb-2">
                  <h3 className={`text-base font-black text-white tracking-wide uppercase ${theme.text} transition-colors font-mono`}>
                    {skill.name}
                  </h3>
                </div>

                {/* 3. CARD DESCRIPTION */}
                <p className="text-xs text-slate-300 group-hover:text-white transition-colors leading-relaxed pr-1 mb-4 font-medium">
                  {skill.description}
                </p>
              </div>

              {/* Footer Row: Cool Status Pill Badge */}
              <div className="pt-2 border-t border-slate-800/80 w-full flex items-center justify-between text-[10px] font-black tracking-widest relative z-10">
                {durationSeconds ? (
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${theme.badge}`}>
                    <span className="text-xs animate-bounce">⏱️</span> 
                    <span>TIME: {durationSeconds}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-full border border-yellow-500/20">
                    💥 INSTANT BLAST
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Clean Skip Action Button - Redesigned as a clear "No Thanks" option */}
      <button
        onClick={() => onSelectSkill(null)}
        className="px-6 py-2.5 relative z-10 rounded-xl border-2 border-slate-700 bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-slate-800 hover:border-rose-500/50 font-black text-xs tracking-widest uppercase transition-all duration-200 active:scale-95 cursor-pointer shadow-[0_4px_0_#020617]"
      >
        Keep Running 🏃‍♂️💨
      </button>

    </div>
  );
}