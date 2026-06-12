import React from 'react';

export default function MainMenu({ onStartGame }) {
  return (
    <div className="relative inset-0 flex flex-col items-center justify-between w-full max-w-[1400px] aspect-[2/1] bg-gradient-to-b from-[#4facfe] via-[#7ae0ff] via-[#b3f5ff] via-[#b4f6b2] to-[#44b051] overflow-hidden select-none font-sans p-4 border-[12px] border-amber-700 md:border-[16px] shadow-[inset_0_0_0_4px_#f59e0b]">
      
      {/* 🖼️ PIXEL ART FRAME CORNERS */}
      <div className="absolute top-0 left-0 w-4 h-4 bg-yellow-400 border-b-4 border-r-4 border-amber-900 z-50"></div>
      <div className="absolute top-0 right-0 w-4 h-4 bg-yellow-400 border-b-4 border-l-4 border-amber-900 z-50"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 bg-yellow-400 border-t-4 border-r-4 border-amber-900 z-50"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 bg-yellow-400 border-t-4 border-l-4 border-amber-900 z-50"></div>

      {/* ☀️ BACKGROUND ENVIRONMENT ELEMENTS */}
      {/* Bright Pixel Sun */}
      <div className="absolute top-[8%] left-[15%] flex flex-col items-center justify-center animate-pulse">
        <div className="text-6xl filter drop-shadow-[0_0_15px_rgba(253,224,71,0.8)]">☀️</div>
      </div>
      
      {/* Pixel Clouds */}
      <div className="absolute top-[6%] left-[4%] text-3xl opacity-80 hidden md:block">☁️</div>
      <div className="absolute top-[12%] right-[10%] text-4xl opacity-80 hidden md:block">☁️</div>
      <div className="absolute bottom-[8%] left-[4%] text-4xl opacity-90 animate-bounce duration-[3000ms]">☁️</div>
      <div className="absolute bottom-[5%] right-[12%] text-5xl opacity-90">☁️</div>

      {/* Background Mountains & Castle */}
      <div className="absolute bottom-[35%] left-[5%] text-6xl opacity-30 hidden lg:block">🏔️</div>
      <div className="absolute bottom-[38%] right-[15%] text-6xl opacity-40 hidden md:block">🏰</div>

      {/* Trees & Flowers Decorating the Grass Hills */}
      <div className="absolute bottom-[25%] left-[2%] text-5xl hidden sm:block">🌳</div>
      <div className="absolute bottom-[18%] left-[8%] text-4xl">🌲</div>
      <div className="absolute bottom-[28%] right-[2%] text-5xl hidden sm:block">🌳</div>
      <div className="absolute bottom-[15%] left-[16%] text-xl">🌷</div>
      <div className="absolute bottom-[12%] left-[22%] text-xl">🌻</div>
      <div className="absolute bottom-[14%] right-[25%] text-xl">🌹</div>

      {/* 👾 SPRITES & GAMEPLAY OBJECTS (Scattered along the pathway layout) */}
      {/* Obstacles & Monsters */}
      <div className="absolute bottom-[42%] left-[20%] text-3xl animate-bounce duration-[1500ms]">🐷</div>
      <div className="absolute bottom-[32%] left-[23%] text-4xl animate-bounce duration-[900ms]">😈</div>
      <div className="absolute bottom-[40%] left-[15%] text-3xl animate-pulse">🐙</div>
      <div className="absolute bottom-[35%] left-[35%] text-3xl animate-spin duration-[3000ms]">👾</div>
      <div className="absolute bottom-[30%] right-[38%] text-4xl filter drop-shadow-md">🦔</div>
      <div className="absolute bottom-[45%] right-[18%] text-4xl animate-pulse">🍄</div>
      <div className="absolute bottom-[22%] right-[8%] text-3xl">🍄</div>

      {/* Collectible Coins & Stars */}
      <div className="absolute bottom-[48%] left-[28%] text-3xl text-yellow-400 drop-shadow-[0_2px_0_rgba(0,0,0,0.4)] animate-bounce duration-[1100ms]">🪙</div>
      <div className="absolute bottom-[54%] left-[34%] text-3xl text-yellow-400 drop-shadow-[0_2px_0_rgba(0,0,0,0.4)] animate-bounce duration-[1300ms]">🪙</div>
      <div className="absolute bottom-[58%] left-[40%] text-4xl text-yellow-300 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] animate-pulse">⭐</div>
      <div className="absolute bottom-[48%] right-[32%] text-3xl text-yellow-400 drop-shadow-[0_2px_0_rgba(0,0,0,0.4)] animate-bounce duration-[1000ms]">🪙</div>
      <div className="absolute bottom-[42%] right-[25%] text-3xl text-yellow-400 drop-shadow-[0_2px_0_rgba(0,0,0,0.4)] animate-bounce duration-[1200ms]">🪙</div>
      <div className="absolute bottom-[36%] right-[20%] text-3xl text-yellow-400 drop-shadow-[0_2px_0_rgba(0,0,0,0.4)] animate-bounce duration-[1400ms]">🪙</div>

      {/* 🏃 HERO CHARACTER (Center Stage) */}
      <div className="absolute bottom-[40%] left-[1/2] -translate-x-1/2 flex flex-col items-center animate-bounce duration-[600ms]">
        <div className="text-6xl filter drop-shadow-[0_4px_0_rgba(0,0,0,0.3)]">🏃‍♂️</div>
      </div>


      {/* 👑 MAIN MENU UI LAYER */}
      <div className="flex flex-col items-center justify-between h-full w-full z-10 pt-6 pb-2">
        
        {/* Title & Description Sub-container */}
        <div className="w-full flex flex-col items-center space-y-4">
          {/* Game Title */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black uppercase tracking-wider filter drop-shadow-[0_6px_0px_#1e3a8a] select-none text-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-300 via-cyan-400 to-indigo-600">
              JUMPY
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-orange-400 to-red-500 ml-3">
              RUN!
            </span>
          </h1>

          {/* Description Text Box */}
          <div className="bg-black/60 border-2 border-white/20 rounded-xl px-6 py-3 max-w-2xl backdrop-blur-xs shadow-lg text-center">
            <p className="text-yellow-300 text-sm sm:text-base font-extrabold tracking-wide uppercase">
              A SUPER FUN jumping adventure!
            </p>
            <p className="text-white text-xs sm:text-sm font-semibold mt-1">
              Dodge obstacles, grab shiny coins, and unlock magical power-ups!
            </p>
          </div>
        </div>

        {/* 🕹️ START TO PLAY ACTION BUTTON */}
        <div className="mb-4 transform transition-all active:scale-95">
          <button
            onClick={onStartGame}
            className="relative px-12 py-4 bg-gradient-to-r from-orange-400 via-yellow-400 to-green-400 hover:from-orange-300 hover:to-green-300 text-white font-black text-2xl sm:text-4xl rounded-2xl border-4 border-white shadow-[0_8px_0px_#15803d,0_12px_15px_rgba(0,0,0,0.4)] active:shadow-[0_0px_0px_transparent] active:translate-y-[8px] transition-all cursor-pointer tracking-wide uppercase flex items-center gap-3 group"
          >
            <span>START TO PLAY</span>
            <span className="text-xl sm:text-2xl group-hover:translate-x-1 transition-transform">▶</span>
          </button>
        </div>

        {/* 🗺️ FOOTER CONTROLS HUD */}
        <div className="w-full max-w-xl bg-black/40 border border-white/10 rounded-xl py-2 px-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-white font-bold text-xs sm:text-sm shadow-inner backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <kbd className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md border-b-4 border-slate-400 text-[10px] font-mono font-black uppercase">
              Spacebar
            </kbd>
            <span className="text-slate-200">to JUMP,</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-cyan-500 text-white px-2 py-0.5 rounded-md border-b-4 border-cyan-700 text-[10px] font-black uppercase tracking-tight">
              TAP SCREEN
            </span>
            <span className="text-slate-200">to JUMP</span>
          </div>
          
          <div className="text-base animate-pulse hidden sm:inline-block">👆</div>
        </div>

      </div>
    </div>
  );
}