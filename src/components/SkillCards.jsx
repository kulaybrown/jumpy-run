import React from 'react';

export default function SkillCards({ visibleCards, onSelectSkill }) {
  if (!visibleCards || visibleCards.length === 0) return null;

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fade-in">
      <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase tracking-widest mb-2 animate-pulse">
        Choose a Boost!
      </h2>
      <p className="text-slate-400 text-xs mb-8">Game Paused — Select 1 card to continue running</p>

      {/* 3 Cards Responsive Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl px-4">
        {visibleCards.map((skill) => (
          <button
            key={skill.id}
            onClick={() => onSelectSkill(skill)}
            className="group relative flex flex-col items-center text-center p-5 bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-700 hover:border-cyan-400 rounded-2xl shadow-xl transform hover:-translate-y-2 active:scale-95 transition-all duration-200 cursor-pointer overflow-hidden"
          >
            {/* Glowing inner effect on hover */}
            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            
            <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-200">
              {skill.name.split(' ').pop()}
            </div>
            
            <h3 className="text-lg font-bold text-white tracking-wide group-hover:text-cyan-300">
              {skill.name.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, '')}
            </h3>
            
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              {skill.desc}
            </p>

            <span className="mt-4 px-3 py-1 bg-slate-950/50 rounded-full text-[10px] text-cyan-400 font-semibold uppercase tracking-wider group-hover:bg-cyan-950/50">
              {skill.duration ? `${skill.duration / 1000}s Active` : 'Instant/Passive'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}