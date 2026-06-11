import React from 'react';

export default function MainMenu({ onStartGame }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center text-center w-screen h-screen bg-gradient-to-b from-indigo-900 via-sky-800 to-indigo-900 overflow-hidden select-none p-6">
      
      {/* 🔮 SUPER VIBRANT & ACTIVE Full-Screen Background Glows & Mesh */}
      {/* This animated color mesh layer creates a deep, dynamic, shifting background effect */}
      <div className="absolute inset-0 bg-[length:200%_auto] animate-sweepGlow mix-blend-screen opacity-70 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(210deg, #22d3ee 0%, #a855f7 30%, #4f46e5 60%, #ec4899 90%, #22d3ee 100%)' }}/>
      
      {/* Enhanced and added more blur glows for a deeper, more dimensional backdrop */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-[110px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-yellow-300/15 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 w-[350px] h-[350px] bg-cyan-400/20 rounded-full blur-[130px] pointer-events-none animate-bounce duration-[6000ms]" />
      {/* New glows */}
      <div className="absolute top-[10%] left-[60%] w-[300px] h-[300px] bg-emerald-400/15 rounded-full blur-[100px] pointer-events-none animate-pulseGlow" />
      <div className="absolute bottom-[5%] left-[5%] w-[250px] h-[250px] bg-magenta-500/15 rounded-full blur-[90px] pointer-events-none animate-pulseGlowDelay" />

      {/* 🚀 PACKED WITH FUN! Increased quantity and diversity of floating cartoon elements */}
      {/* Section: Power-ups & Magical Effects */}
      <div className="absolute top-[15%] left-[12%] text-5xl animate-bounce hidden md:block duration-[600ms]">🎈</div>
      <div className="absolute top-[20%] right-[15%] text-4xl animate-pulse text-yellow-300 duration-500">⭐</div>
      <div className="absolute top-[45%] left-[8%] text-3xl animate-spin text-cyan-400 duration-[4000ms] hidden lg:block">✨</div>
      <div className="absolute bottom-[40%] right-[12%] text-3xl animate-pulse text-yellow-400">⚡</div>
      <div className="absolute top-[35%] left-[2%] text-2xl animate-spin text-magenta-500 duration-[5000ms]">🪄</div>
      <div className="absolute top-[2%] left-[45%] text-2xl animate-spin text-yellow-300 duration-[3000ms]">✨</div>

      {/* Section: Rewards & Treasures (with more variety and trailing effects) */}
      <div className="absolute bottom-[30%] left-[15%] text-4xl animate-bounce duration-[1200ms]">🪙</div>
      <div className="absolute bottom-[45%] right-[2%] text-2xl animate-bounce text-cyan-500">💎</div>
      <div className="absolute bottom-[10%] left-[40%] text-3xl animate-bounce">🎁</div>
      <div className="absolute bottom-[50%] left-[60%] text-3xl animate-spinGlow duration-[2500ms]">💰</div>
      <div className="absolute bottom-[60%] left-[3%] text-2xl animate-spin">💎</div>
      
      {/* Trailing sparkles for coins */}
      <div className="absolute bottom-[30%] left-[15.5%] text-[10px] animate-pulse">✨</div>
      <div className="absolute bottom-[28%] left-[14.5%] text-[10px] animate-pulse">✨</div>

      {/* Section: Movement & Hazards (expanded types) */}
      <div className="absolute bottom-[20%] right-[10%] text-5xl animate-bounce duration-1000 hidden md:block">🚀</div>
      <div className="absolute top-[40%] right-[8%] text-4xl animate-bounce duration-700 hidden lg:block">🏃‍♂️</div>
      <div className="absolute bottom-[65%] left-[20%] text-3xl animate-bounce duration-[800ms] text-sky-400">👟</div>
      <div className="absolute bottom-[70%] left-[5%] text-2xl animate-bounce text-lime-400">👟</div>
      
      {/* New Hazards */}
      <div className="absolute top-[2%] left-[2%] text-2xl animate-spin">🧱</div>
      <div className="absolute bottom-[2%] left-[2%] text-2xl animate-bounce">🌵</div>
      <div className="absolute top-[2%] right-[2%] text-2xl animate-spin">🧱</div>
      <div className="absolute bottom-[2%] right-[2%] text-2xl animate-bounce">🛑</div>
      <div className="absolute top-[30%] left-[25%] text-[10px] animate-spin">🧱🧱</div>
      <div className="absolute bottom-[35%] left-[70%] text-[10px] animate-spin">🧱</div>
      
      {/* Mini characters around */}
      <div className="absolute bottom-[60%] left-[5%] text-lg animate-bounce duration-[500ms]">🏃‍♀️</div>
      <div className="absolute top-[10%] left-[70%] text-lg animate-bounce duration-[1100ms]">🏃</div>


      {/* Main UI Container (Preserved and raised to the top z-index) */}
      <div className="flex flex-col items-center justify-between h-full max-h-[620px] w-full max-w-2xl z-10 py-4">
        
        {/* 👑 Game Title Layer */}
        <div className="space-y-3 pt-4 adaptive-title">
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter uppercase drop-shadow-[0_8px_0px_rgba(0,0,0,0.6)] animate-bounce duration-[800ms]">
            <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 via-cyan-400 to-blue-500 drop-shadow-[0_2px_10px_rgba(34,211,238,0.4)]">
              Jumpy{" "}
            </span>
            <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-orange-400 to-pink-500 drop-shadow-[0_2px_15px_rgba(251,191,36,0.5)]">
              Run!
            </span>
          </h1>
          <p className="text-purple-200 text-sm sm:text-base md:text-lg max-w-md mx-auto font-black tracking-wide leading-relaxed px-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            🌟 A SUPER FUN jumping adventure! 🌟
            <span className="block text-slate-400 font-bold text-xs sm:text-sm mt-1 normal-case">
              Dodge obstacles, grab shiny coins, and unlock magical power-ups!
            </span>
          </p>
        </div>

        {/* 🕹️ Centerpiece Chunky 3D Toy Play Button */}
        <div className="my-auto sm:my-0 flex items-center justify-center pt-4">
          <button
            onClick={onStartGame}
            className="group relative px-14 py-6 sm:px-16 sm:py-7 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-300 hover:to-emerald-400 text-white font-black text-3xl sm:text-4xl md:text-5xl rounded-3xl border-4 border-green-200/40 shadow-[0_10px_0px_#047857] hover:shadow-[0_8px_0px_#047857] active:shadow-[0_0px_0px_transparent] transition-all transform hover:-translate-y-1 active:translate-y-2 cursor-pointer overflow-hidden tracking-wider uppercase"
          >
            {/* Glossy Button Reflection Effect */}
            <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:animate-shine pointer-events-none" />
            
            <span className="flex items-center justify-center gap-4 drop-shadow-[0_3px_2px_rgba(0,0,0,0.3)]">
              LET'S PLAY! <span className="text-2xl sm:text-3xl md:text-4xl group-hover:scale-120 group-hover:translate-x-1 transition-transform inline-block">▶</span>
            </span>
          </button>
        </div>

        {/* 🗺️ Colorful Dashboard Style Controls Footer */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-400 font-bold border-t-2 border-purple-900/40 pt-6 w-full justify-center px-4">
          
          <div className="flex items-center gap-2 bg-pink-500/20 border-2 border-pink-400/30 px-4 py-2 rounded-2xl shadow-[0_4px_0px_rgba(219,39,119,0.3)]">
            <span className="px-2 py-0.5 bg-pink-500 text-white font-black rounded-lg text-xs font-mono shadow-sm border border-white/20 uppercase tracking-tighter">
              Spacebar
            </span>
            <span className="text-pink-200 text-xs sm:text-sm">to JUMP! 🚀</span>
          </div>
          
          <div className="hidden sm:block text-purple-700 font-black text-xl">✨</div>
          
          <div className="flex items-center gap-2 bg-cyan-500/20 border-2 border-cyan-400/30 px-4 py-2 rounded-2xl shadow-[0_4px_0px_rgba(8,145,178,0.3)]">
            <span className="px-2 py-0.5 bg-cyan-500 text-white font-black rounded-lg text-xs font-sans shadow-sm border border-white/20 uppercase tracking-tighter">
              Tap Screen
            </span>
            <span className="text-cyan-200 text-xs sm:text-sm">to JUMP! ⭐</span>
          </div>
          
        </div>

      </div>
    </div>
  );
}