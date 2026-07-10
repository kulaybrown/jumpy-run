import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import UserIconSetting from '../components/UserIconSetting';
import UserProfileModal from '../components/UserProfileModal';
import RankingIconSetting from '../components/RankingIconSetting'; // ✅ Imported
import RankingBoardModal from '../components/RankingBoardModal';   // ✅ Imported
import { supabase } from '../supabaseClient';

function FrameAnimation({ basePath, frameCount = 4, frameDuration = 150, extension = 'png', alt = '', className = '' }) {
  const [frame, setFrame] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setFrame((f) => (f % frameCount) + 1);
    }, frameDuration);
    return () => clearInterval(id);
  }, [frameCount, frameDuration]);

  return <img src={`${basePath}/${frame}.${extension}`} alt={alt} className={className} />;
}

function BounceShadow({ duration = '1000ms', className = '' }) {
  return (
    <div
      className={`absolute left-1/2 bg-black/40 rounded-full blur-[2px] ${className}`}
      style={{
        transform: 'translateX(-50%)',
        animation: `shadowPulse ${duration} ease-in-out infinite`,
      }}
    />
  );
}

export default function MainMenu({ onStartGame, onTriggerAuth }) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false); // ✅ Added state
  const [liveEmail, setLiveEmail] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setLiveEmail(session.user.email || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLiveEmail(session?.user?.email || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="relative w-full max-w-[1400px] h-full lg:h-auto lg:aspect-[2/1] overflow-hidden select-none font-sans bg-[url('/assets/main-menu-bg.jpg')] bg-cover bg-center">
      <style>{`
        @keyframes shadowPulse {
          0%, 100% { transform: translateX(-50%) scale(0.55); opacity: 0.25; }
          50% { transform: translateX(-50%) scale(1); opacity: 0.55; }
        }
      `}</style>

      {/* 👤 USER PROFILE TRIGGERS & MODALS */}
      <UserIconSetting 
        userEmail={liveEmail} 
        onClick={() => setShowProfileModal(true)} 
      />
      
      {/* 🏆 LEADERBOARD RANKING TRIGGER */}
      <RankingIconSetting onClick={() => setShowRankingModal(true)} /> {/* ✅ Added */}

      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onTriggerAuth={onTriggerAuth}
      />
      
      {/* 🏆 LEADERBOARD RANKING OVERLAY DASHBOARD */}
      <RankingBoardModal 
        isOpen={showRankingModal} 
        onClose={() => setShowRankingModal(false)} 
      /> {/* ✅ Added */}

      {/* 🖼️ PIXEL ART BORDER FRAME */}
      <div className="absolute inset-0 z-50 pointer-events-none">
        <div className="absolute top-0 left-0 w-11 h-11 bg-[url('/assets/border/top-left.png')] bg-no-repeat bg-contain" />
        <div className="absolute top-0 right-0 w-11 h-11 bg-[url('/assets/border/top-right.png')] bg-no-repeat bg-contain" />
        <div className="absolute bottom-0 left-0 w-11 h-11 bg-[url('/assets/border/bot-left.png')] bg-no-repeat bg-contain" />
        <div className="absolute bottom-0 right-0 w-11 h-11 bg-[url('/assets/border/bot-right.png')] bg-no-repeat bg-contain" />

        <div className="absolute top-0 left-11 right-11 h-[10px] bg-[url('/assets/border/line-top.png')] bg-repeat-x bg-[length:1.5px]" />
        <div className="absolute bottom-0 left-11 right-11 h-[10px] bg-[url('/assets/border/line-bot.png')] bg-repeat-x bg-[length:1.5px]" />
        <div className="absolute left-0 top-11 bottom-11 w-[11px] bg-[url('/assets/border/line-left.png')] bg-repeat-y bg-[length:11px]" />
        <div className="absolute right-0 top-11 bottom-11 w-[11px] bg-[url('/assets/border/line-right.png')] bg-repeat-y bg-[length:11px]" />
      </div>

      <div className="relative w-full h-full flex flex-col items-center justify-between p-5">

        {/* ☀️ BACKGROUND ENVIRONMENT ELEMENTS */}
        <div className="absolute top-[8%] left-[15%] flex flex-col items-center justify-center animate-pulse">
          <img src="/assets/sun.png" alt="Sun" className="w-20 h-20 lg:w-25 lg:h-25 filter drop-shadow-[0_0_15px_rgba(253,224,71,0.8)]" />
        </div>

        <div className="absolute top-[17%] left-[4%] flex flex-col items-center justify-center">
          <FrameAnimation
            basePath="/assets/animations/bird/idle"
            alt="Bird"
            className="w-16 h-16 lg:w-20 lg:h-20 filter drop-shadow-[0_0_15px_rgba(253,224,71,0.8)]"
          />
        </div>

        {/* 👾 SPRITES & GAMEPLAY OBJECTS */}
        <div className="absolute bottom-[28%] left-[26%] w-15 h-15 lg:w-20 lg:h-20">
          <FrameAnimation basePath="/assets/animations/monster1/idle" alt="Monster" className="w-full h-full" />
          <div className="absolute left-1/2 bottom-[3px] w-3/5 h-2 bg-black/40 rounded-full blur-[2px]" style={{ transform: 'translateX(-50%)' }} />
        </div>
        <div className="absolute bottom-[32%] left-[38%] w-15 h-15 lg:w-20 lg:h-20">
          <FrameAnimation basePath="/assets/animations/monster2/idle" alt="Monster" className="w-full h-full" />
          <div className="absolute left-1/2 bottom-[3px] w-3/5 h-2 bg-black/40 rounded-full blur-[2px]" style={{ transform: 'translateX(-50%)' }} />
        </div>

        <div className="absolute bottom-[30%] right-[35%] w-15 h-15 lg:w-20 lg:h-20">
          <div className="relative w-full h-full animate-bounce [animation-duration:2000ms]">
            <img src="/assets/spike-ball.png" alt="Spike ball" className="w-full h-full" />
          </div>
          <BounceShadow duration="2000ms" className="bottom-[-6px] w-3/5 h-2" />
        </div>
        <div className="absolute bottom-[40%] right-[15%] w-15 h-15 lg:w-20 lg:h-20">
          <div className="relative w-full h-full animate-bounce [animation-duration:800ms]">
            <img src="/assets/mushroom.png" alt="Mushroom" className="w-full h-full" />
          </div>
          <BounceShadow duration="800ms" className="bottom-[-6px] w-3/5 h-2" />
        </div>
        <div className="absolute bottom-[15%] right-[6%] w-15 h-15 lg:w-20 lg:h-20">
          <div className="relative w-full h-full animate-bounce [animation-duration:1000ms]">
            <img src="/assets/mushroom.png" alt="Mushroom" className="w-full h-full" />
          </div>
          <BounceShadow duration="1000ms" className="bottom-[-6px] w-3/5 h-2" />
        </div>

        <div className="absolute bottom-[46%] lg:bottom-[42%] left-[30%] text-5xl text-yellow-400 drop-shadow-[0_2px_0_rgba(0,0,0,0.4)] animate-bounce [animation-duration:1100ms]"><div className="animate-spin transform-3d rotate-y-180">🪙</div></div>
        <div className="absolute bottom-[48%] lg:bottom-[44%] left-[36%] text-5xl text-yellow-400 drop-shadow-[0_2px_0_rgba(0,0,0,0.4)] animate-bounce [animation-duration:1300ms]"><div className="animate-spin transform-3d rotate-y-180">🪙</div></div>
        <div className="absolute bottom-[50%] lg:bottom-[46%] left-[44%] text-5xl text-yellow-300 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] animate-bounce [animation-duration:1700ms]">⭐</div>
        <div className="absolute bottom-[48%] lg:bottom-[44%] right-[30%] text-5xl text-yellow-400 drop-shadow-[0_2px_0_rgba(0,0,0,0.4)] animate-bounce [animation-duration:1000ms]"><div className="animate-spin transform-3d rotate-y-180">🪙</div></div>
        <div className="absolute bottom-[44%] lg:bottom-[40%] right-[24%] text-5xl text-yellow-400 drop-shadow-[0_2px_0_rgba(0,0,0,0.4)] animate-bounce [animation-duration:1200ms]"><div className="animate-spin transform-3d rotate-y-180">🪙</div></div>

        {/* 🏃 HERO CHARACTER */}
        <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2 w-25 h-25 lg:w-35 lg:h-35">
          <FrameAnimation
            basePath="/assets/animations/jumpy/idle"
            alt="Hero"
            className="w-full h-full filter drop-shadow-[0_4px_0_rgba(0,0,0,0.3)]"
          />
          <div className="absolute left-1/2 bottom-[4px] w-3/7 h-3 bg-black/40 rounded-full blur-[2px]" style={{ transform: 'translateX(-50%)' }} />
        </div>

        {/* 👑 MAIN MENU UI LAYER */}
        <div className="flex flex-col items-center justify-between h-full w-full z-10">
          <div className="w-full flex flex-col items-center space-y-4">
            <h1 className="w-full max-w-4xl select-none text-center mb-0" aria-label="Jumpy Run!">
              <svg viewBox="0 50 1000 240" className="w-full sm:h-25 lg:h-50" style={{ fontFamily: 'var(--font-fredoka)' }} aria-hidden="true">
                <defs>
                  <linearGradient id="yellowGrad" x1="0" y1="120" x2="0" y2="290" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#fffb00" /><stop offset="100%" stopColor="#ffb700" />
                  </linearGradient>
                  <linearGradient id="blueGrad" x1="0" y1="120" x2="0" y2="290" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#00e5ff" /><stop offset="100%" stopColor="#0033ff" />
                  </linearGradient>
                  <linearGradient id="orangeGrad" x1="0" y1="120" x2="0" y2="290" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ff9100" /><stop offset="100%" stopColor="#ff2d00" />
                  </linearGradient>
                  <path id="titleArc" d="M 40,260 Q 500,120 960,260" fill="none" />
                </defs>
                <text fontSize="120" fontWeight="900" textAnchor="middle" fill="yellow" stroke="yellow" strokeWidth="30" strokeLinejoin="round" style={{ textTransform: 'uppercase', filter: 'drop-shadow(0 0 14px rgba(255,255,255,0.55)) drop-shadow(0 0 26px rgba(255,255,255,0.35))' }}>
                  <textPath href="#titleArc" startOffset="50%" xlinkHref="#titleArc">
                    <tspan style={{ filter: 'drop-shadow(0 6px 0px yellow)' }}>J</tspan><tspan style={{ filter: 'drop-shadow(0 6px 0px yellow)' }}>U</tspan><tspan style={{ filter: 'drop-shadow(0 6px 0px yellow)' }}>M</tspan><tspan style={{ filter: 'drop-shadow(0 6px 0px yellow)' }}>P</tspan><tspan style={{ filter: 'drop-shadow(0 6px 0px yellow)' }}>Y</tspan><tspan dx="30"> </tspan><tspan style={{ filter: 'drop-shadow(0 6px 0px yellow)' }}>R</tspan><tspan style={{ filter: 'drop-shadow(0 6px 0px yellow)' }}>U</tspan><tspan style={{ filter: 'drop-shadow(0 6px 0px yellow)' }}>N</tspan><tspan style={{ filter: 'drop-shadow(0 6px 0px yellow)' }}>!</tspan>
                  </textPath>
                </text>
                <text fontSize="120" fontWeight="900" textAnchor="middle" fill="black" stroke="black" strokeWidth="20" strokeLinejoin="round" style={{ textTransform: 'uppercase', filter: 'drop-shadow(0 0 14px rgba(255,255,255,0.55)) drop-shadow(0 0 26px rgba(255,255,255,0.35))' }}>
                  <textPath href="#titleArc" startOffset="50%" xlinkHref="#titleArc">
                    <tspan style={{ filter: 'drop-shadow(0 6px 0px #000)' }}>J</tspan><tspan style={{ filter: 'drop-shadow(0 6px 0px #000)' }}>U</tspan><tspan style={{ filter: 'drop-shadow(0 6px 0px #000)' }}>M</tspan><tspan style={{ filter: 'drop-shadow(0 6px 0px #000)' }}>P</tspan><tspan style={{ filter: 'drop-shadow(0 6px 0px #000)' }}>Y</tspan><tspan dx="30"> </tspan><tspan style={{ filter: 'drop-shadow(0 6px 0px #000)' }}>R</tspan><tspan style={{ filter: 'drop-shadow(0 6px 0px #000)' }}>U</tspan><tspan style={{ filter: 'drop-shadow(0 6px 0px #000)' }}>N</tspan><tspan style={{ filter: 'drop-shadow(0 6px 0px #000)' }}>!</tspan>
                  </textPath>
                </text>
                <text fontSize="120" fontWeight="900" textAnchor="middle" style={{ textTransform: 'uppercase' }}>
                  <textPath href="#titleArc" startOffset="50%" xlinkHref="#titleArc">
                    <tspan fill="url(#yellowGrad)" style={{ filter: 'drop-shadow(0 6px 0px #7a4a00)' }}>J</tspan><tspan fill="url(#blueGrad)" style={{ filter: 'drop-shadow(0 6px 0px #1c428a)' }}>U</tspan><tspan fill="url(#yellowGrad)" style={{ filter: 'drop-shadow(0 6px 0px #7a4a00)' }}>M</tspan><tspan fill="url(#yellowGrad)" style={{ filter: 'drop-shadow(0 6px 0px #7a4a00)' }}>P</tspan><tspan fill="url(#blueGrad)" style={{ filter: 'drop-shadow(0 6px 0px #1c428a)' }}>Y</tspan><tspan dx="30"> </tspan><tspan fill="url(#orangeGrad)" style={{ filter: 'drop-shadow(0 6px 0px #7a1200)' }}>R</tspan><tspan fill="url(#orangeGrad)" style={{ filter: 'drop-shadow(0 6px 0px #7a1200)' }}>U</tspan><tspan fill="url(#orangeGrad)" style={{ filter: 'drop-shadow(0 6px 0px #7a1200)' }}>N</tspan><tspan fill="url(#blueGrad)" style={{ filter: 'drop-shadow(0 6px 0px #1c428a)' }}>!</tspan>
                  </textPath>
                </text>
              </svg>
            </h1>

            <div className="bg-black/60 rounded-xl px-6 py-2 max-w-2xl backdrop-blur-xs shadow-lg text-center">
              <p className="text-yellow-300 text-sm sm:text-base font-extrabold tracking-wide uppercase">A SUPER FUN jumping adventure!</p>
              <p className="text-white text-xs sm:text-sm font-semibold mt-1">Dodge obstacles, grab shiny coins, and unlock magical power-ups!</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-end md:gap-2 lg:gap-5 h-full w-full">
            <Button onClick={onStartGame} text="START TO PLAY" variant="primary" />
            <div className="w-full max-w-xl bg-black/40 border border-white/10 rounded-xl py-2 px-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-white font-bold text-xs sm:text-sm shadow-inner backdrop-blur-xs">
              <div className="flex items-center gap-2">
                <kbd className="border-2 bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md border-b-4 border-slate-950 text-[10px] font-mono font-black uppercase">Spacebar</kbd>
                <span className="text-slate-200">to JUMP,</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="border-2 bg-cyan-500 text-white px-2 py-0.5 rounded-md border-b-4 border-slate-950 text-[10px] font-black uppercase tracking-tight">TAP SCREEN</span>
                <span className="text-slate-200">to JUMP</span>
              </div>
              <div className="text-base animate-pulse hidden sm:inline-block">👆</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}