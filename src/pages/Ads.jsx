import React from 'react';


function Ads() {
  return (
    <div className="absolute inset-0 bg-black z-[60] flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4 bg-white/10 text-white text-[10px] md:text-xs font-mono px-2.5 py-1 rounded-full">
        {adCountdown > 0 ? `Reward in ${adCountdown}s` : 'Reward Granted!'}
      </div>
      <div className="text-slate-500 text-xs md:text-sm mb-3 border border-slate-800 px-3 py-1.5 rounded-lg bg-slate-900">
        [ Sponsor Advertisement Simulation ]
      </div>
      <div className="w-full max-w-xs h-36 md:h-44 bg-slate-800 animate-pulse rounded-xl flex items-center justify-center">
        <span className="text-slate-600 font-bold text-xs md:text-sm tracking-widest uppercase">Video Ad</span>
      </div>
    </div>
  );
}