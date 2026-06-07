import React from 'react';

const CHARACTERS = [
  { id: 'red', name: 'Crimson Dash 🟥', color: '#ef4444', desc: 'Fast looks, fierce runs.' },
  { id: 'blue', name: 'Neon Glide 🟦', color: '#38bdf8', desc: 'Smooth, cool, and collected.' },
  { id: 'green', name: 'Emerald Leap 🟩', color: '#10b981', desc: 'Lucky vibes, high jumps.' },
  { id: 'black', name: 'Shadow Runner ⬛', color: '#1e293b', desc: 'Stealth mode activated.' },
];

export default function CharacterSelect({ onSelectCharacter, onBack }) {
  return (
    <div className="relative flex flex-col items-center justify-center text-center w-full h-full min-h-[500px] max-w-2xl p-8 bg-slate-950 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.15)] border border-purple-500/20 overflow-hidden select-none animate-fade-in">
      
      <h2 className="text-4xl font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 mb-2">
        Select Your Runner
      </h2>
      <p className="text-slate-400 text-xs mb-8">Choose a color shape to hit the track</p>

      {/* Characters Grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {CHARACTERS.map((char) => (
          <button
            key={char.id}
            onClick={() => onSelectCharacter(char.color)}
            className="group relative flex flex-col items-center p-5 bg-slate-900/60 border border-slate-800 hover:border-purple-500 rounded-2xl transition-all duration-150 hover:-translate-y-1 cursor-pointer active:scale-95"
          >
            {/* The Shape Preview */}
            <div 
              style={{ backgroundColor: char.color }} 
              className="w-16 h-16 rounded-xl shadow-md mb-4 group-hover:scale-110 transition-transform duration-200 border border-white/10"
            />
            
            <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
              {char.name}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 max-w-[140px]">
              {char.desc}
            </p>
          </button>
        ))}
      </div>

      <button
        onClick={onBack}
        className="mt-8 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider cursor-pointer"
      >
        ⬅️ Back to Main Menu
      </button>
    </div>
  );
}