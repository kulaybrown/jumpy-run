import React from 'react';

export default function GameOverScreen({ score, coins, onRestart, onMainMenu }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-rose-950 to-slate-900 w-full h-full max-w-xl max-h-[400px] rounded-2xl shadow-2xl border border-rose-500/30">
      <h1 className="text-4xl font-black text-rose-500 tracking-wide uppercase drop-shadow">
        Game Over
      </h1>

      {/* Stats Display */}
      <div className="flex gap-6 mt-6 bg-black/40 px-6 py-4 rounded-xl border border-white/5">
        <div className="text-center">
          <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Score</div>
          <div className="text-2xl font-bold text-yellow-400">{score}</div>
        </div>
        <div className="w-[1px] bg-slate-700 self-stretch"></div>
        <div className="text-center">
          <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Coins</div>
          <div className="text-2xl font-bold text-amber-400">🪙 {coins}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full max-w-xs">
        <button
          onClick={onRestart}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-950 font-bold text-md rounded-xl shadow-md transition transform hover:scale-102 active:scale-98"
        >
          Play Again
        </button>
        <button
          onClick={onMainMenu}
          className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-md rounded-xl border border-slate-700 transition"
        >
          Main Menu
        </button>
      </div>
    </div>
  );
}