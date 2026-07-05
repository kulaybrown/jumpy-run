import React from 'react';
import Button from '../components/Button';

export default function MainMenu({ onStartGame }) {
  return (
    <div className="relative w-full max-w-[1400px] h-full lg:h-auto lg:aspect-[2/1] overflow-hidden select-none font-sans bg-[url('/assets/main-menu-bg.jpg')] bg-cover bg-center">

      {/* 🖼️ PIXEL ART BORDER FRAME (repeating edge tiles + corner images) */}
      {/* Using the small-screen asset set (44x44 corners) at every breakpoint. */}
      <div className="absolute inset-0 z-50 pointer-events-none">
        {/* Corners: 44px */}
        <div className="absolute top-0 left-0 w-11 h-11 bg-[url('/assets/border/top-left.png')] bg-no-repeat bg-contain" />
        <div className="absolute top-0 right-0 w-11 h-11 bg-[url('/assets/border/top-right.png')] bg-no-repeat bg-contain" />
        <div className="absolute bottom-0 left-0 w-11 h-11 bg-[url('/assets/border/bot-left.png')] bg-no-repeat bg-contain" />
        <div className="absolute bottom-0 right-0 w-11 h-11 bg-[url('/assets/border/bot-right.png')] bg-no-repeat bg-contain" />

        {/* line-top: 10px thick / 1.5px tile */}
        <div className="absolute top-0 left-11 right-11 h-[10px] bg-[url('/assets/border/line-top.png')] bg-repeat-x bg-[length:1.5px]" />
        {/* line-bot: 10px thick / 1.5px tile */}
        <div className="absolute bottom-0 left-11 right-11 h-[10px] bg-[url('/assets/border/line-bot.png')] bg-repeat-x bg-[length:1.5px]" />
        {/* line-left: 11px thick / 11px tile */}
        <div className="absolute left-0 top-11 bottom-11 w-[11px] bg-[url('/assets/border/line-left.png')] bg-repeat-y bg-[length:11px]" />
        {/* line-right: 11px thick / 11px tile */}
        <div className="absolute right-0 top-11 bottom-11 w-[11px] bg-[url('/assets/border/line-right.png')] bg-repeat-y bg-[length:11px]" />
      </div>

      {/* Inner padded content area, padding matches the corner size */}
      <div className="relative w-full h-full flex flex-col items-center justify-between p-11">

      {/* ☀️ BACKGROUND ENVIRONMENT ELEMENTS */}
      {/* Bright Pixel Sun */}
      <div className="absolute top-[8%] left-[15%] flex flex-col items-center justify-center animate-pulse">
        <div className="text-6xl filter drop-shadow-[0_0_15px_rgba(253,224,71,0.8)]">☀️</div>
      </div>
      
      {/* Pixel Clouds */}
      <div className="absolute top-[6%] left-[4%] text-3xl opacity-80 hidden md:block">☁️</div>
      <div className="absolute top-[10%] right-[10%] text-4xl opacity-80 hidden md:block">☁️</div>
      <div className="absolute bottom-[6%] left-[3%] text-5xl opacity-90">☁️</div>

      {/* Background Mountains & Castle */}
      <div className="absolute bottom-[35%] left-[5%] text-6xl opacity-30 hidden lg:block">🏔️</div>
      <div className="absolute bottom-[38%] right-[12%] text-6xl opacity-40 hidden md:block">🏰</div>

      {/* Trees Decorating the Grass Hills */}
      <div className="absolute bottom-[25%] left-[2%] text-5xl hidden sm:block">🌳</div>
      <div className="absolute bottom-[18%] left-[8%] text-4xl">🌲</div>
      <div className="absolute bottom-[28%] right-[2%] text-5xl hidden sm:block">🌳</div>
      <div className="absolute bottom-[14%] right-[8%] text-xl">🌷</div>

      {/* 👾 SPRITES & GAMEPLAY OBJECTS (matched to reference layout) */}
      {/* Left side: blob + pig */}
      <div className="absolute bottom-[38%] left-[16%] text-4xl animate-pulse">🫧</div>
      <div className="absolute bottom-[34%] left-[22%] text-3xl animate-bounce duration-[1500ms]">🐷</div>

      {/* Flanking the hero: orange monster (left) + green monster (right) */}
      <div className="absolute bottom-[32%] left-[28%] text-4xl animate-bounce duration-[1000ms]">👹</div>
      <div className="absolute bottom-[32%] left-[38%] text-4xl animate-bounce duration-[1100ms]">👾</div>

      {/* Right side: spike ball obstacle + mushrooms */}
      <div className="absolute bottom-[30%] right-[22%] text-4xl">🦔</div>
      <div className="absolute bottom-[42%] right-[12%] text-4xl">🍄</div>
      <div className="absolute bottom-[22%] right-[6%] text-3xl">🍄</div>

      {/* Collectible Coins & Star, arcing over the hero */}
      <div className="absolute bottom-[46%] left-[30%] text-3xl text-yellow-400 drop-shadow-[0_2px_0_rgba(0,0,0,0.4)] animate-bounce duration-[1100ms]">🪙</div>
      <div className="absolute bottom-[52%] left-[36%] text-3xl text-yellow-400 drop-shadow-[0_2px_0_rgba(0,0,0,0.4)] animate-bounce duration-[1300ms]">🪙</div>
      <div className="absolute bottom-[56%] left-[42%] text-4xl text-yellow-300 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] animate-pulse">⭐</div>
      <div className="absolute bottom-[52%] right-[30%] text-3xl text-yellow-400 drop-shadow-[0_2px_0_rgba(0,0,0,0.4)] animate-bounce duration-[1000ms]">🪙</div>
      <div className="absolute bottom-[46%] right-[24%] text-3xl text-yellow-400 drop-shadow-[0_2px_0_rgba(0,0,0,0.4)] animate-bounce duration-[1200ms]">🪙</div>

      {/* 🏃 HERO CHARACTER (Center Stage) */}
      <div className="absolute bottom-[40%] left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce duration-[600ms]">
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
        <Button onClick={onStartGame} />


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
    </div>
  );
}