import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function LeaderboardOverlay({ isGameOverScreen }) {
  const [topScores, setTopScores] = useState([]);

  useEffect(() => {
    const fetchLiveTopScores = async () => {
      try {
        const { data, error } = await supabase
          .from('players')
          .select('score')
          .order('score', { ascending: false })
          .limit(3);

        if (!error && data) {
          // Extract score values into a flat array match matrix
          setTopScores(data.map(row => row.score || 0));
        }
      } catch (err) {
        console.error("Failed fetching live overlay top scores:", err);
      }
    };

    fetchLiveTopScores();
  }, [isGameOverScreen]); // 🔄 Re-fetches automatically whenever a run ends or restarts

  if (isGameOverScreen || topScores.length === 0) return null;

  return (
    <div className="absolute right-4 top-16 bg-slate-950/80 border border-white/10 backdrop-blur-md text-white p-2.5 rounded-xl pointer-events-none text-[10px] md:text-xs z-10 w-28 sm:w-32 md:w-36 shadow-xl">
      <div className="text-amber-400 font-extrabold mb-1 tracking-wider border-b border-white/10 pb-0.5 text-right">🏆 TOP RUNS</div>
      <ol className="list-decimal list-inside space-y-0.5 font-mono opacity-90 text-right">
        {topScores.map((scoreValue, i) => (
          <li key={i} className={i === 0 ? "text-yellow-300 font-bold" : ""}>
            <span className="text-slate-400 mr-1">#{i + 1}</span>
            {scoreValue}
          </li>
        ))}
      </ol>
    </div>
  );
}