import React from 'react';

export default function AdPromptOverlay({
  showAdPrompt,
  adOverlay,
  hasUsedAdRevive,
  dailyAdsUsed,
  maxDailyAds,
  isGameOverScreen,
  onWatchAd,
  onSkipAd
}) {
  // Enforce validation matching your internal tracking loop criteria natively
  if (!showAdPrompt || adOverlay || hasUsedAdRevive || dailyAdsUsed >= maxDailyAds || isGameOverScreen) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-xs z-50 p-4">
      <div className="text-center p-5 max-w-sm bg-slate-900 border border-white/10 rounded-2xl shadow-2xl">
        <h3 className="text-base font-bold text-white mb-1">Continue Run?</h3>
        <p className="text-xs text-slate-400 mb-4">Watch a short ad to revive and keep your score.</p>
        <div className="flex flex-col gap-2.5">
          <button 
            onClick={onWatchAd} 
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-lg cursor-pointer"
          >
            🎥 Watch Ad to Revive
          </button>
          <button 
            onClick={onSkipAd} 
            className="text-slate-500 hover:text-slate-300 text-[11px] font-semibold py-1 cursor-pointer"
          >
            Skip & End Run
          </button>
        </div>
      </div>
    </div>
  );
}