import React from 'react';

const lightenColor = (hex, amount) => {
  const h = hex.replace('#', '');
  const num = parseInt(h, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 255) + amount;
  let b = (num & 255) + amount;
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

export default function SkillSelectionOverlay({ showCards, randomCards, onSelectSkill }) {
  if (!showCards) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md z-30 p-4 animate-fade-in">
      <div className="w-full max-w-xl md:max-w-1xl flex flex-col items-center relative">
        
        {/* 📋 CHOPPED MIXEL-ART MILESTONE BANNER OVERLAY */}
        <div className="flex items-center h-14 sm:h-20 max-w-full drop-shadow-[0_4px_0_rgba(0,0,0,0.35)] image-render-pixelated z-50 -mb-6 sm:-mb-9 translate-y-1 transform">
          <img src="/assets/banner/milestone-banner-left.png" alt="" className="h-full object-contain select-none pointer-events-none" />
          <div className="h-full flex items-center justify-center px-6 bg-[url('/assets/banner/milestone-banner-center.png')] bg-repeat-x bg-[length:auto_100%]">
            <h2 className="text-xl sm:text-3xl font-black text-white uppercase tracking-wide drop-shadow-[0_2px_0_rgba(0,0,0,0.85)] text-center whitespace-nowrap font-bungee [-webkit-text-stroke:2px_#000000]">
              MILESTONE REACHED!
            </h2>
          </div>
          <img src="/assets/banner/milestone-banner-right.png" alt="" className="h-full object-contain select-none pointer-events-none" />
        </div>

        {/* 📋 SCOREBOARD PANEL PIXEL-ART SANDWICH LAYOUT HOUSING */}
        <div className="w-full flex flex-col drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] image-render-pixelated relative">
          <img src="/assets/milestone-board-top.png" alt="" className="w-full object-contain select-none pointer-events-none" />
          <div className="w-full bg-[url('/assets/milestone-board-center.png')] bg-repeat-y bg-[length:100%_auto] px-5 sm:px-8 md:px-10 pt-7 flex flex-col items-center">
            
            {/* 📊 SKILLS LIST SELECTION GRID */}
            <div className="grid grid-cols-3 gap-2.5 md:gap-4 w-full px-1 max-h-[220px] sm:max-h-[260px] overflow-y-auto">
              {randomCards.map((skill) => {
                const bgCol = skill.backgroundColor || '#475569';
                const lightBorderColor = lightenColor(bgCol, 40);
                const darkenColor = lightenColor(bgCol, -20);
                const isImageIcon = skill.icon.startsWith('assets/') || skill.icon.includes('/');

                return (
                  <div className="p-1 rounded-xl border-2" style={{ backgroundColor: lightBorderColor, borderColor: darkenColor }} key={skill.id}>
                    <button
                      onClick={() => onSelectSkill(skill)}
                      style={{ backgroundColor: bgCol }}
                      className="group relative flex flex-col items-center text-center border-2 border-black/15 rounded-xl p-2 sm:p-1 hover:brightness-110 transition-all transform hover:-translate-y-0.5 active:scale-95 shadow-md overflow-hidden"
                    >
                      <div
                        style={{ borderColor: lightBorderColor }}
                        className="w-11 h-11 sm:w-8 sm:h-8 mb-1.5 border-2 bg-slate-950/20 rounded-md flex items-center justify-center transition-transform group-hover:scale-105 shadow-inner overflow-hidden select-none pointer-events-none"
                      >
                        {isImageIcon ? (
                          <img
                            src={`/${skill.icon}`}
                            alt={skill.name}
                            className="w-full h-full object-cover image-render-pixelated"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <span className="text-xl sm:text-2xl filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                            {skill.icon}
                          </span>
                        )}
                      </div>
                      <h4 className="text-[9px] sm:text-[11px] md:text-xs font-black tracking-tight text-white uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] line-clamp-1 mb-0.5 w-full">
                        {skill.name}
                      </h4>
                      <p className="text-[8px] sm:text-[9px] md:text-[10px] leading-tight text-black font-bold opacity-85 line-clamp-3 h-8 sm:h-9 md:h-10 px-0.5 overflow-hidden">
                        {skill.description}
                      </p>
                      <div className="mt-1 w-full flex justify-center">
                        {skill.duration ? (
                          <span className="text-[10px] font-mono tracking-wider font-extrabold text-white bg-black/25 px-1.5 py-0.5 rounded uppercase">
                            ⏱️ {skill.duration / 1000}s
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono tracking-wider font-extrabold text-white bg-black/25 px-1.5 py-0.5 rounded uppercase">
                            ⚡ INSTANT
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <img src="/assets/milestone-board-bottom.png" alt="" className="w-full object-contain select-none pointer-events-none" />
        </div>

      </div>
    </div>
  );
}