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
            
            // Count how many players have a strictly higher score to find exact rank
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
    <div className="absolute inset-0 bg-black/85 z-[110] flex items-center justify-center p-4 backdrop-blur-xs font-mono">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl w-full max-w-md shadow-2xl relative flex flex-col h-[85vh]">
        
        {/* Close Anchor */}
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold cursor-pointer text-xs z-10">✖</button>

        {/* Header Title Context */}
        <div className="mb-3">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">🏆 Global Hall of Fame</h3>
          <p className="text-[10px] text-slate-400 font-sans">The grid of the top 100 absolute highest scores across the grid network.</p>
        </div>

        {/* Current User Rank Panel Banner */}
        <div className="bg-slate-950 p-2.5 border border-indigo-950/60 rounded-xl flex items-center justify-between mb-3 text-xs">
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Your Standing</span>
            <span className="text-white font-bold">Rank #{myRank || '---'}</span>
          </div>
          <div className="text-right flex flex-col">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Personal Best</span>
            <span className="text-emerald-400 font-black">⭐ {myScore} pts</span>
          </div>
        </div>

        {/* Scrollable Leaderboard Area Container */}
        <div className="flex-1 overflow-y-auto border border-slate-950 bg-slate-950 rounded-xl p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 uppercase tracking-widest animate-pulse">Syncing Rankings Grid...</div>
          ) : leaderboard.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 uppercase">No runner logs found.</div>
          ) : (
            leaderboard.map((player, index) => {
              const rank = index + 1;
              const flag = FLAG_MAP[player.country] || "🏳️‍🌈";
              
              return (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-2 rounded-lg text-xs border ${
                    rank === 1 ? 'bg-amber-950/30 border-amber-500/40 text-amber-200' :
                    rank === 2 ? 'bg-slate-800/40 border-slate-600/40 text-slate-300' :
                    rank === 3 ? 'bg-orange-950/20 border-orange-700/30 text-orange-300' :
                    'bg-slate-900/40 border-slate-800/40 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate max-w-[70%]">
                    <span className={`font-black w-6 text-center ${rank <= 3 ? 'text-sm' : 'text-[11px]'}`}>
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                    </span>
                    <span className="text-lg" title={player.country || 'Unknown Location'}>{flag}</span>
                    <span className="font-bold text-white truncate">{player.name || 'Anonymous'}</span>
                  </div>
                  <span className="font-black text-right text-amber-400 font-mono tracking-wide">{player.score || 0}</span>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}