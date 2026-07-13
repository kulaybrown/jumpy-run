import React from 'react';
import Button from '../components/Button';

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
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/35 backdrop-blur-xs z-50 p-4">
      <div className="text-center p-5 max-w-sm bg-[linear-gradient(0deg,rgba(209,143,105,1)_0%,rgba(240,210,166,1)_100%)] border border-2 border-white rounded-2xl shadow-2xl">
        <h3 className="text-lg font-black font-bungee [-webkit-text-stroke:1px_#000000] uppercase text-white mb-1">Continue Run?</h3>
        <p className="text-xs text-black mb-4">Watch a short ad to revive and keep your score.</p>
        <div className="flex flex-col gap-2.5">
          <Button 
            onClick={onWatchAd} 
            text="🎥 Watch Ad to Revive"
            variant="primary"
            outline={false}
            fontSize="text-[18px]"
          />
          <button 
            onClick={onSkipAd} 
            className="text-white text-[11px] font-semibold py-1 cursor-pointer"
          >
            Skip & End Run
          </button>
        </div>
      </div>
    </div>
  );
}