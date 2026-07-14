// src/components/RankingIconSetting.jsx
import React from 'react';

export default function RankingIconSetting({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="absolute top-4 right-28 z-50 p-1 rounded-xl bg-slate-900/90 border border-slate-700/50 hover:border-indigo-500 shadow-lg text-xs transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center w-9 h-9 select-none"
      title="Global Leaderboard"
    >
      <span className="text-lg filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">🏆</span>
    </button>
  );
}