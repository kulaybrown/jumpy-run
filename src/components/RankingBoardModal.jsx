import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const FLAG_MAP = {
  "Australia": "🇦🇺", "Canada": "🇨🇦", "China": "🇨🇳", "France": "🇫🇷", 
  "Germany": "🇩🇪", "India": "🇮🇳", "Indonesia": "🇮🇩", "Japan": "🇯🇵", 
  "Malaysia": "🇲🇾", "New Zealand": "🇳🇿", "Philippines": "🇵🇭", "Singapore": "🇸🇬", 
  "South Korea": "🇰🇷", "Spain": "🇪🇸", "Taiwan": "🇹🇼", "Thailand": "🇹🇭", 
  "United Kingdom": "🇬🇧", "United States": "🇺🇸", "Vietnam": "🇻🇳"
};

export default function RankingBoardModal({ isOpen, onClose }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [myScore, setMyScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchRankings = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch Top 100 Players
        const { data: topPlayers } = await supabase
          .from('players')
          .select('name, country, score')
          .order('score', { ascending: false })
          .limit(100);

        setLeaderboard(topPlayers || []);

        // 2. Fetch Active Session to Determine Current Player's Rank
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: currentPlayer } = await supabase
            .from('players')
            .select('score')
            .eq('id', session.user.id)
            .maybeSingle();

          if (currentPlayer) {
            setMyScore(currentPlayer.score || 0);
            
            const { count } = await supabase
              .from('players')
              .select('*', { count: 'exact', head: true })
              .gt('score', currentPlayer.score || 0);

            setMyRank((count || 0) + 1);
          }
        }
      } catch (err) {
        console.error("Error fetching leaderboard data matrix:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankings();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/85 z-[110] flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs font-mono">
      {/* Container scales cleanly using percentages and max pixel constraints to stay bound inside game wrapper */}
      <div className="bg-[linear-gradient(0deg,rgba(209,143,105,1)_0%,rgba(240,210,166,1)_100%)] border border-2 border-white p-4 sm:p-5 rounded-2xl w-full max-w-[92%] sm:max-w-md shadow-2xl relative flex flex-col h-[88%] max-h-[440px] lg:max-h-[520px]">
        
        {/* Close Anchor Button */}
        <button 
          onClick={onClose} 
          className="absolute top-3.5 right-3.5 font-bold cursor-pointer text-lg p-1 z-10 hover:scale-110 transition-transform"
        >
          ✖
        </button>

        {/* Header Title Section */}
        <div className="mb-2 sm:mb-3 pr-6">
          <h3 className="text-xs sm:text-lg font-bungee font-black text-white [-webkit-text-stroke:1px_#000000] uppercase tracking-wide flex items-center gap-1.5">
            🏆 Global Hall of Fame
          </h3>
          <p className="text-[9px] sm:text-[10px] text-black font-sans leading-tight mt-0.5">
            Top 100 highest scoring runs across the global network grid.
          </p>
        </div>

        {/* Current User Standing Subpanel */}
        <div className="bg-slate-950 p-2 border border-indigo-950/60 rounded-xl flex items-center justify-between mb-2.5 text-[10px] sm:text-xs shrink-0">
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase tracking-wider">Your Standing</span>
            <span className="text-white font-extrabold">Rank #{myRank || '---'}</span>
          </div>
          <div className="text-right flex flex-col gap-0.5">
            <span className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase tracking-wider">Personal Best</span>
            <span className="text-emerald-400 font-black tracking-wide">⭐ {myScore} pts</span>
          </div>
        </div>

        {/* Scrollable Leaderboard Feed Wrapper */}
        <div className="flex-1 overflow-y-auto border border-[#000] bg-[#795845] rounded-xl p-1.5 space-y-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest animate-pulse">
              Syncing Rankings Grid...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[10px] sm:text-xs text-slate-500 uppercase">
              No runner logs discovered.
            </div>
          ) : (
            leaderboard.map((player, index) => {
              const rank = index + 1;
              const flag = FLAG_MAP[player.country] || "🏳️";
              
              return (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-1.5 sm:p-2 rounded-lg text-[10px] sm:text-xs border transition-colors ${
                    rank === 1 ? 'bg-yellow-600/60 border-yellow-600/80 text-amber-200' :
                    rank === 2 ? 'bg-zinc-300/30 border-zinc-300/50 text-slate-300' :
                    rank === 3 ? 'bg-amber-800/30 border-amber-800/50 text-orange-300' :
                    'bg-slate-900/40 border-slate-800/40 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 truncate max-w-[72%]">
                    <span className={`font-black w-5 text-center shrink-0 ${rank <= 3 ? 'text-xs sm:text-sm' : 'text-[9px] sm:text-[11px]'}`}>
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                    </span>
                    <span className="text-sm sm:text-base shrink-0 select-none" title={player.country || 'Unknown Location'}>
                      {flag}
                    </span>
                    <span className="font-bold text-white truncate text-[11px] sm:text-xs">
                      {player.name || 'Anonymous'}
                    </span>
                  </div>
                  <span className="font-black text-right text-amber-400 font-mono tracking-wide shrink-0 pl-1">
                    {player.score || 0}
                  </span>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}