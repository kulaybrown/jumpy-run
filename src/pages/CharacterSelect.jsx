import React from 'react';

const CHARACTERS = [
  { id: 'red', name: 'Crimson Dash 🟥', color: '#ef4444', desc: 'Fast looks, fierce runs.' },
  { id: 'blue', name: 'Neon Glide 🟦', color: '#38bdf8', desc: 'Smooth, cool, and collected.' },
  { id: 'green', name: 'Emerald Leap 🟩', color: '#10b981', desc: 'Lucky vibes, high jumps.' },
  { id: 'black', name: 'Shadow Runner ⬛', color: '#1e293b', desc: 'Stealth mode activated.' },
];

export default function CharacterSelect({ onSelectCharacter, onBack }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center text-center w-screen h-screen bg-slate-950 overflow-hidden select-none p-4 animate-fade-in">
      
      {/* Decorative Full-Screen Purple & Pink Background Glows */}
      <div className="absolute top-1/4 right-1/4 translate-x-1/4 -translate-y-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 -translate-x-1/4 translate-y-1/4 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Core UI Wrapper */}
      <div className="flex flex-col items-center justify-between h-full max-h-[600px] w-full max-w-4xl z-10">
        
        {/* Header Block */}
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]">
            Select Your Runner
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium">Choose a color identity profile to hit the track</p>
        </div>

        {/* Characters Grid Matrix (Adaptive: 2x2 on small profiles, 1x4 on standard setups) */}
        <div className="grid grid-cols-4 gap-4">
          {CHARACTERS.map((char) => (
            <button
              key={char.id}
              onClick={() => onSelectCharacter(char.color)}
              className="group relative flex flex-col items-center justify-center p-5 bg-slate-900/60 border border-slate-800 hover:border-purple-500/80 rounded-2xl transition-all duration-200 hover:-translate-y-1.5 cursor-pointer active:scale-95 shadow-xl hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] w-[150px] overflow-hidden"
            >
              {/* Highlight backdrop accent block flare */}
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              {/* Dynamic Interactive Shape Preview Box */}
              <div 
                style={{ backgroundColor: char.color }} 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform duration-200 border border-white/15 relative"
              >
                {/* Embedded inner glow rim */}
                <div className="absolute inset-0 border border-black/20 rounded-2xl pointer-events-none" />
              </div>
              
              <h3 className="text-sm sm:text-base font-extrabold text-white group-hover:text-purple-400 transition-colors tracking-wide">
                {char.name}
              </h3>
              <p className="text-[11px] leading-snug text-slate-500 group-hover:text-slate-400 transition-colors mt-1.5 max-w-[150px] font-medium">
                {char.desc}
              </p>
            </button>
          ))}
        </div>

        {/* Navigation Utilities Footer Area */}
        <div className="w-full border-t border-slate-900 pt-5">
          <button
            onClick={onBack}
            className="group inline-flex items-center gap-2 text-xs font-black text-slate-500 hover:text-slate-300 tracking-wider uppercase transition-colors cursor-pointer"
          >
            <span className="group-hover:-translate-x-1 transition-transform">⬅️</span> Back to Main Menu
          </button>
        </div>

      </div>
    </div>
  );
}