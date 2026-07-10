import React from 'react';

export default function RankingIconSetting({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="absolute top-4 right-16 z-50 bg-slate-900/80 border border-slate-700 text-amber-400 p-2 rounded-xl cursor-pointer hover:bg-slate-800 hover:border-amber-500 transition-all shadow-lg flex items-center justify-center group"
      title="Global Leaderboards"
    >
      <span className="text-base group-hover:scale-110 transition-transform">🏆</span>
    </button>
  );
}