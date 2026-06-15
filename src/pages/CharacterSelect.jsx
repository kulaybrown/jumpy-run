import React, { useState, useEffect } from 'react';

const CHARACTERS = [
  { 
    id: 'jumpy_hero', 
    name: 'JUMPY HERO', 
    desc: 'The classic runner', 
    sprite: '🏃‍♂️', 
    folder: 'jumpy',     // 📁 Animation folder route
    idleFrames: 38,       // 🎞️ Total animation frames inside /idle/
    speed: 3, 
    jump: 3, 
    boost: null 
  },
  { 
    id: 'alien_ace', 
    name: 'ALIEN ACE', 
    desc: 'Out of this world jump!', 
    sprite: '👽', 
    folder: 'ace',       // 🚀 Updated folder identifier to match your path
    idleFrames: 121,
    speed: 2, 
    jump: 5, 
    boost: 'jump' 
  },
  { 
    id: 'explorer_ava', 
    name: 'EXPLORER AVA', 
    desc: 'Quick and agile!', 
    sprite: '🤠', 
    folder: 'ava',
    idleFrames: 121,
    speed: 5, 
    jump: 2, 
    boost: 'speed' 
  },
  { 
    id: 'pixel_pixie', 
    name: 'PIXEL PIXIE', 
    desc: 'Floats on air!', 
    sprite: '🧚‍♀️', 
    folder: 'pixie',
    idleFrames: 88,
    speed: 2, 
    jump: 4, 
    boost: 'jump' 
  },
];

// 🎞️ Dynamic Frame Sequencer Component with Emoji Fallback Fall-back Protection
// Replace the top AnimatedIdleSprite component in CharacterSelect.jsx with this:
function AnimatedIdleSprite({ folder, fallbackSprite, frameCount = 6 }) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (loadFailed) return;
    
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frameCount);
    }, 50);
    
    return () => clearInterval(interval);
  }, [frameCount, loadFailed]);

  const imagePath = `/assets/animations/${folder}/idle/${currentFrame}.png`;

  if (loadFailed) {
    return (
      <div className="text-5xl sm:text-6xl filter drop-shadow-[0_4px_0_rgba(0,0,0,0.15)] animate-bounce [animation-duration:5000ms]">
        {fallbackSprite}
      </div>
    );
  }

  return (
    <img 
      src={imagePath} 
      alt={`${folder} idle animation`}
      className="w-16 h-16 sm:w-20 sm:h-20 object-contain filter drop-shadow-[0_4px_0_rgba(0,0,0,0.2)]"
      onError={(e) => {
        // 🚨 This will print the exact missing path to your browser console!
        console.error(`🔴 Animation frame failed to load at path: ${imagePath}`);
        setLoadFailed(true);
      }}
    />
  );
}

export default function CharacterSelect({ onSelectCharacter, onBack, onStartGame }) {
  const [selectedId, setSelectedId] = useState('jumpy_hero');

  // Auto-sync Jumpy Hero to the parent component immediately on mount
  useEffect(() => {
    if (onSelectCharacter) {
      onSelectCharacter(CHARACTERS[0]);
    }
  }, []);

  const handleSelect = (char) => {
    setSelectedId(char.id);
    if (onSelectCharacter) onSelectCharacter(char);
  };

  return (
    <div className="relative inset-0 flex flex-col items-center justify-between w-full max-w-[1400px] aspect-[2/1] bg-gradient-to-b from-[#4facfe] via-[#7ae0ff] via-[#b3f5ff] via-[#b4f6b2] to-[#44b051] overflow-hidden select-none p-4 border-[12px] border-amber-700 md:border-[16px] shadow-[inset_0_0_0_4px_#f59e0b]">
      
      {/* 🖼️ PIXEL ART FRAME CORNERS */}
      <div className="absolute top-0 left-0 w-4 h-4 bg-yellow-400 border-b-4 border-r-4 border-amber-900 z-50"></div>
      <div className="absolute top-0 right-0 w-4 h-4 bg-yellow-400 border-b-4 border-l-4 border-amber-900 z-50"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 bg-yellow-400 border-t-4 border-r-4 border-amber-900 z-50"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 bg-yellow-400 border-t-4 border-l-4 border-amber-900 z-50"></div>

      {/* ☀️ BACKGROUND DECORATIONS */}
      <div className="absolute top-[8%] left-[18%] text-5xl opacity-90 animate-pulse">☀️</div>
      <div className="absolute top-[5%] left-[5%] text-3xl opacity-40 hidden md:block">☁️</div>
      <div className="absolute top-[10%] right-[8%] text-4xl opacity-40 hidden md:block">☁️</div>
      <div className="absolute bottom-[20%] left-[2%] text-5xl hidden sm:block">🌳</div>
      <div className="absolute bottom-[25%] right-[2%] text-5xl hidden sm:block">🌳</div>
      <div className="absolute bottom-[12%] right-[8%] text-3xl">🍄</div>
      <div className="absolute bottom-[40%] right-[3%] text-3xl text-yellow-400 drop-shadow-md animate-bounce">🪙</div>
      <div className="absolute top-[25%] right-[4%] text-3xl text-yellow-300 animate-pulse">⭐</div>

      {/* 👑 MAIN CONTAINER */}
      <div className="flex flex-col items-center justify-between h-full w-full z-10 pt-2 pb-1">
        
        {/* 📋 TITLE RIBBON */}
        <div className="relative bg-gradient-to-b from-[#3a7bd5] to-[#3a6073] border-4 border-amber-900 rounded-lg px-8 py-2 shadow-[0_4px_0_rgba(0,0,0,0.3)] transform -skew-x-2">
          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-wide drop-shadow-[0_2px_0_rgba(0,0,0,0.7)] text-center">
            Select your runner
          </h2>
          <div className="absolute top-1 -left-4 w-4 h-full bg-[#2a4d6c] border-y-4 border-l-4 border-amber-900 -z-10"></div>
          <div className="absolute top-1 -right-4 w-4 h-full bg-[#2a4d6c] border-y-4 border-r-4 border-amber-900 -z-10"></div>
        </div>

        {/* 📜 CHARACTER LIST SELECTION SCROLL */}
        <div className="w-full max-w-5xl bg-[#fcf5e3] border-4 border-[#c2b280] rounded-2xl p-4 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 shadow-[0_8px_16px_rgba(0,0,0,0.25),inset_0_0_40px_rgba(139,94,26,0.15)] my-auto max-h-[70%] overflow-y-auto">
          {CHARACTERS.map((char) => {
            const isSelected = selectedId === char.id;
            return (
              <div
                key={char.id}
                onClick={() => handleSelect(char)}
                className={`relative flex flex-col items-center justify-between p-3 rounded-xl border-2 transition-all duration-150 cursor-pointer select-none bg-amber-50/20 ${
                  isSelected 
                    ? 'border-amber-600 bg-amber-100/50 shadow-md scale-102' 
                    : 'border-transparent hover:border-amber-300 hover:bg-amber-100/20'
                }`}
              >
                {/* Header Text */}
                <div className="text-center">
                  <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight leading-tight">
                    {char.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs font-bold text-amber-900/80 mt-0.5 min-h-[32px]">
                    {char.desc}
                  </p>
                </div>

                {/* 🏃‍♂️ LIVE ANIMATED IDLE SPRITE PREVIEW */}
                <div className="my-2 h-16 sm:h-20 flex items-center justify-center transition-transform duration-200 hover:scale-110">
                  <AnimatedIdleSprite 
                    folder={char.folder} 
                    fallbackSprite={char.sprite} 
                    frameCount={char.idleFrames} 
                  />
                </div>

                {/* Dynamic Stat Display Bars */}
                <div className="w-full space-y-2 pt-2 border-t border-amber-900/10">
                  {/* Speed Parameter */}
                  <div className="flex items-center justify-center gap-2">
                    <div className={`p-1 rounded-md text-sm border-2 border-amber-900/20 ${char.boost === 'speed' ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-amber-200'}`}>
                      🥾
                    </div>
                    <span className="text-xs sm:text-sm font-black text-slate-700">
                      Speed: {char.speed}
                    </span>
                  </div>

                  {/* Jump Parameter */}
                  <div className="flex items-center justify-center gap-2">
                    <div className={`p-1 rounded-md text-sm border-2 border-amber-900/20 ${char.boost === 'jump' ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-red-400'}`}>
                      ❤️
                    </div>
                    <span className="text-xs sm:text-sm font-black text-slate-700">
                      Jump: {char.jump}
                    </span>
                  </div>
                </div>

                {/* Selected Frame Overlay Border Check */}
                {isSelected && (
                  <div className="absolute inset-0 border-2 border-amber-500 rounded-xl pointer-events-none animate-pulse" />
                )}
              </div>
            );
          })}
        </div>

        {/* 🎮 LOWER INTERACTIVE CONTROL HUD FOOTER */}
        <div className="w-full max-w-3xl flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 px-4 pb-2">
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-b from-orange-400 to-red-500 hover:from-orange-300 hover:to-red-400 text-white font-black text-lg sm:text-xl rounded-xl border-4 border-white shadow-[0_6px_0px_#991b1b] active:shadow-none active:translate-y-[6px] transition-all cursor-pointer tracking-tight uppercase"
          >
            Back To Main Menu
          </button>

          <button
            onClick={onStartGame}
            className="w-full sm:w-auto px-10 py-3 bg-gradient-to-b from-yellow-400 via-orange-400 to-green-500 hover:from-yellow-300 hover:to-green-400 text-white font-black text-xl sm:text-2xl rounded-xl border-4 border-white shadow-[0_6px_0px_#166534] active:shadow-none active:translate-y-[6px] transition-all cursor-pointer tracking-tight uppercase flex items-center justify-center gap-2"
          >
            <span>START</span>
            <span className="text-lg">▶</span>
          </button>
        </div>

      </div>
    </div>
  );
}