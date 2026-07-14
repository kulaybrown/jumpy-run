import React from 'react';
import Button from '../components/Button';

export default function RunCompletedOverlay({
  isGameOverScreen,
  score,
  distance,
  coins,
  highScores,
  rank, // ✅ Added live global database rank prop mapping[cite: 8]
  onRestart,
  onSelectCharacter,
  onMainMenu
}) {
  if (!isGameOverScreen) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md z-40 p-4 animate-fade-in">
      <div className="relative flex flex-col items-center scale-[0.8] lg:scale-[1] will-change-transform">
        
        {/* 📋 CHOPPED PIXEL-ART ASSET BANNER OVERLAY */}
        <div className="flex items-center justify-center h-14 sm:h-20 max-w-full drop-shadow-[0_4px_0_rgba(0,0,0,0.35)] image-render-pixelated z-50 md:-mb-6 -mb-15 translate-y-1 transform">
          <img src="/assets/banner/left-bg.png" alt="" className="h-full object-contain select-none pointer-events-none" />
          <div className="h-full flex items-center justify-center px-6 sm:px-12 bg-[url('/assets/banner/fill-bg.png')] bg-repeat-x bg-[length:auto_100%]">
            <h2 className="text-xl sm:text-4xl font-black text-white uppercase tracking-wide drop-shadow-[0_2px_0_rgba(0,0,0,0.85)] text-center whitespace-nowrap mb-2 font-bungee [-webkit-text-stroke:2px_#000000]">
              AWESOME RUN!
            </h2>
          </div>
          <img src="/assets/banner/right-bg.png" alt="" className="h-full object-contain select-none pointer-events-none" />
        </div>

        {/* 📋 SCOREBOARD BASE PANEL */}
        <div className="w-full md:max-w-xl flex flex-col drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] image-render-pixelated relative">
          <img src="/assets/scoreboard-top.png" alt="" className="w-full object-contain select-none pointer-events-none" />
          <div className="w-full bg-[url('/assets/scoreboard-center.png')] bg-repeat-y bg-[length:100%_auto] px-6 py-1 flex flex-col items-center text-center">
            <p className="text-amber-950 text-xs sm:text-sm font-black tracking-wider uppercase mb-5 drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">
              Check out your spectacular score report!
            </p>

            {/* 📊 SCORE REPORT BOXES */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-4 w-full max-w-[480px] mx-auto">
              
              {/* Stars Box Column Bundle */}
              <div className="flex flex-col items-center select-none w-full">
                <div className="w-full h-[12px] sm:h-[15px] border-2 border-[#b68263] rounded-xl bg-[linear-gradient(180deg,rgba(250,231,194,1)_0%,rgba(240,210,166,1)_100%)] shadow-[0_-2px_4px_rgba(0,0,0,0.15)]" />
                <div className="w-[92%] relative flex flex-col items-center justify-between z-20 border-2 border-[#b68263] rounded-t-none rounded-md p-2 bg-[#f9e7c3] shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
                  <div className="w-full absolute top-0 left-0 h-[5px] bg-[#f0d2a6]"></div>
                  <div className="my-1.5 p-1.5 sm:p-2 rounded-lg bg-[#cfa174] border border-[#b68263]/30 flex items-center justify-center shadow-inner">
                    <img src="/assets/status-star.png" alt="Stars" className="w-[20px] h-[20px] lg:w-[32px] lg:h-[32px] object-contain image-render-pixelated select-none pointer-events-none" />
                  </div>
                  <p className="text-sm sm:text-xl font-black text-slate-900 font-sans tracking-tight">
                    {score}
                  </p>
                </div>
                <div className="z-10 mt-[-6px] w-full h-[10px] sm:h-[12px] border-2 border-[#b68263] rounded-xl bg-[#b68263] shadow-[0_3px_5px_rgba(0,0,0,0.15)]" />
              </div>

              {/* Steps Box Column Bundle */}
              <div className="flex flex-col items-center select-none w-full">
                <div className="w-full h-[12px] sm:h-[15px] border-2 border-[#b68263] rounded-xl bg-[linear-gradient(180deg,rgba(250,231,194,1)_0%,rgba(240,210,166,1)_100%)] shadow-[0_-2px_4px_rgba(0,0,0,0.15)]" />
                <div className="w-[92%] relative flex flex-col items-center justify-between z-20 border-2 border-[#b68263] rounded-t-none rounded-md p-2 bg-[#f9e7c3] shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
                  <div className="w-full absolute top-0 left-0 h-[5px] bg-[#f0d2a6]"></div>
                  <div className="my-1.5 p-1.5 sm:p-2 rounded-lg bg-[#cfa174] border border-[#b68263]/30 flex items-center justify-center shadow-inner">
                    <img src="/assets/status-run.png" alt="Steps" className="w-[20px] h-[20px] lg:w-[32px] lg:h-[32px] object-contain image-render-pixelated select-none pointer-events-none" />
                  </div>
                  <p className="text-sm sm:text-xl font-black text-slate-900 font-sans tracking-tight whitespace-nowrap">
                    {distance}m
                  </p>
                </div>
                <div className="z-10 mt-[-6px] w-full h-[10px] sm:h-[12px] border-2 border-[#b68263] rounded-xl bg-[#b68263] shadow-[0_3px_5px_rgba(0,0,0,0.15)]" />
              </div>

              {/* Coins Box Column Bundle */}
              <div className="flex flex-col items-center select-none w-full">
                <div className="w-full h-[12px] sm:h-[15px] border-2 border-[#b68263] rounded-xl bg-[linear-gradient(180deg,rgba(250,231,194,1)_0%,rgba(240,210,166,1)_100%)] shadow-[0_-2px_4px_rgba(0,0,0,0.15)]" />
                <div className="w-[92%] relative flex flex-col items-center justify-between z-20 border-2 border-[#b68263] rounded-t-none rounded-md p-2 bg-[#f9e7c3] shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
                  <div className="w-full absolute top-0 left-0 h-[5px] bg-[#f0d2a6]"></div>
                  <div className="my-1.5 p-1.5 sm:p-2 rounded-lg bg-[#cfa174] border border-[#b68263]/30 flex items-center justify-center shadow-inner">
                    <img src="/assets/status-coins.png" alt="Coins" className="w-[20px] h-[20px] lg:w-[32px] lg:h-[32px] object-contain image-render-pixelated select-none pointer-events-none" />
                  </div>
                  <p className="text-sm sm:text-xl font-black text-slate-900 font-sans tracking-tight">
                    {coins}
                  </p>
                </div>
                <div className="z-10 mt-[-6px] w-full h-[10px] sm:h-[12px] border-2 border-[#b68263] rounded-xl bg-[#b68263] shadow-[0_3px_5px_rgba(0,0,0,0.15)]" />
              </div>

            </div>

            {/* 🏅 LEADERBOARD PLACEMENT BADGE */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-amber-950 font-black tracking-wide text-xs sm:text-sm -mb-[20px] uppercase drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">
              <img src="/assets/trophy.png" alt="Trophy" className="h-6 sm:h-8 object-contain select-none pointer-events-none image-render-pixelated" />
              <span>Your rank:</span>
              {(() => {
                if (!rank) {
                  return <span className="text-xs sm:text-sm font-black font-mono bg-slate-950/20 text-slate-800 border border-slate-700/30 px-2.5 py-0.5 rounded-md shadow-inner ml-1 animate-pulse">Calculating...</span>;
                }
                if (rank === 1) return <img src="/assets/rank-gold.png" alt="Gold" className="h-8 sm:h-10 object-contain select-none pointer-events-none image-render-pixelated" />;
                if (rank === 2) return <img src="/assets/rank-silver.png" alt="Silver" className="h-8 sm:h-10 object-contain select-none pointer-events-none image-render-pixelated" />;
                if (rank === 3) return <img src="/assets/rank-bronze.png" alt="Bronze" className="h-8 sm:h-10 object-contain select-none pointer-events-none image-render-pixelated" />;
                return <span className="text-xs sm:text-sm font-black font-mono bg-slate-950/20 text-slate-800 border border-slate-700/30 px-2.5 py-0.5 rounded-md shadow-inner ml-1">#{rank}</span>;
              })()}
            </div>
          </div>
          <img src="/assets/scoreboard-bot.png" alt="" className="w-full object-contain select-none pointer-events-none" />
        </div>

        {/* ACTION CONTROLLER HUD BUTTONS */}
        {/* 🔊 Variant-based button styling natively hooks up 'press-forward' and 'press-back'! */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 px-4 pb-2 mt-4 z-10">
          <Button
            onClick={onRestart}
            text="↺"
            variant="primary"       // 🔊 Automatically triggers 'press-forward' SFX on click[cite: 8]
            outline={false}
          />
          <Button
            onClick={onSelectCharacter}
            text="🦸 Select"
            variant="primary"     // 🔊 Automatically triggers 'press-back' SFX on click[cite: 8]
          />
          <Button 
            onClick={onMainMenu} 
            text="✖" 
            variant="secondary"     // 🔊 Automatically triggers 'press-back' SFX on click[cite: 8]
            outline={false} 
          />
        </div>

      </div>
    </div>
  );
}