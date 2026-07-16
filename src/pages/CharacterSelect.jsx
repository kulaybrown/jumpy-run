import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import UserIconSetting from '../components/UserIconSetting';
import UserProfileModal from '../components/UserProfileModal';
import RankingIconSetting from '../components/RankingIconSetting'; 
import RankingBoardModal from '../components/RankingBoardModal';   
import SettingsIconSetting from '../components/SettingsIconSetting'; // ✅ Imported Settings Icon
import SettingsModal from '../components/SettingsModal';             // ✅ Imported Settings Modal
import { SKILLS_REGISTRY } from '../skillsData';
import { supabase } from '../supabaseClient';
import { playSFX } from '../utils/SoundManager'; 
import { assetPath } from '../utils/assetPath';

const CHARACTERS = [
  { id: 'jumpy_hero', name: 'JUMPY HERO', desc: 'The classic runner', sprite: '🏃‍♂️', folder: 'jumpy', idleFrames: 6, speed: 3, jump: 3, boost: null, startSkills: ['revive', 'shield'] },
  { id: 'alien_ace', name: 'ALIEN ACE', desc: 'Out of this world jump!', sprite: '👽', folder: 'ace', idleFrames: 6, speed: 2, jump: 5, boost: 'jump', startSkills: ['invisible'] },
  { id: 'explorer_ava', name: 'EXPLORER AVA', desc: 'Quick and agile!', sprite: '🤠', folder: 'ava', idleFrames: 6, speed: 5, jump: 2, boost: 'speed', startSkills: ['sonic'] },
  { id: 'pixel_pixie', name: 'PIXEL PIXIE', desc: 'Floats on air!', sprite: '🧚‍♀️', folder: 'pixie', idleFrames: 6, speed: 2, jump: 4, boost: 'jump', startSkills: ['spring'] },
];

function AnimatedIdleSprite({ folder, fallbackSprite, frameCount = 6 }) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (loadFailed) return;
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frameCount);
    }, 120);
    return () => clearInterval(interval);
  }, [frameCount, loadFailed]);

  const imagePath = assetPath(`assets/animations/${folder}/idle/${currentFrame}.png`);

  if (loadFailed) {
    return <div className="text-5xl sm:text-6xl filter drop-shadow-[0_4px_0_rgba(0,0,0,0.15)] animate-bounce [animation-duration:5000ms]">{fallbackSprite}</div>;
  }

  return (
    <img 
      src={imagePath} 
      alt={`${folder} idle animation`}
      className="w-16 h-16 sm:w-20 sm:h-20 object-contain filter drop-shadow-[0_4px_0_rgba(0,0,0,0.2)]"
      onError={() => setLoadFailed(true)}
    />
  );
}

export default function CharacterSelect({ onSelectCharacter, onBack, onStartGame, onTriggerAuth }) {
  const [selectedId, setSelectedId] = useState('jumpy_hero');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false); 
  const [showSettingsModal, setShowSettingsModal] = useState(false); // ✅ Added settings state hook
  const [liveEmail, setLiveEmail] = useState(null);

  useEffect(() => {
    if (onSelectCharacter) onSelectCharacter(CHARACTERS[0]);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setLiveEmail(session.user.email || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLiveEmail(session?.user?.email || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSelect = (char) => {
    setSelectedId(char.id);
    playSFX('select');
    if (onSelectCharacter) onSelectCharacter(char);
  };

  return (
    <div
      className="relative w-full h-full lg:h-auto lg:aspect-[2/1] overflow-hidden select-none bg-cover bg-center"
      style={{ backgroundImage: `url(${assetPath('assets/main-menu-bg.jpg')})` }}
    >

      {/* 👤 USER PROFILE TRIGGERS & MODALS */}
      <UserIconSetting 
        userEmail={liveEmail} 
        onClick={() => setShowProfileModal(true)} 
      />
      
      {/* 🏆 LEADERBOARD RANKING TRIGGER */}
      <RankingIconSetting onClick={() => setShowRankingModal(true)} />

      {/* ⚙️ GAME CONFIGURATION SETTINGS TRIGGER */}
      <SettingsIconSetting onClick={() => setShowSettingsModal(true)} /> {/* ✅ Added */}

      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onTriggerAuth={onTriggerAuth}
      />

      {/* 🏆 LEADERBOARD RANKING OVERLAY DASHBOARD */}
      <RankingBoardModal 
        isOpen={showRankingModal} 
        onClose={() => setShowRankingModal(false)} 
      />

      {/* ⚙️ GAME CONFIGURATION SETTINGS MODAL OVERLAY */}
      <SettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)} 
      /> {/* ✅ Added */}

      {/* 🖼️ PIXEL ART BORDER FRAME */}
      <div className="absolute inset-0 z-50 pointer-events-none">
        <div className="absolute top-0 left-0 w-11 h-11 bg-no-repeat bg-contain" style={{ backgroundImage: `url(${assetPath('assets/border/top-left.png')})` }} />
        <div className="absolute top-0 right-0 w-11 h-11 bg-no-repeat bg-contain" style={{ backgroundImage: `url(${assetPath('assets/border/top-right.png')})` }} />
        <div className="absolute bottom-0 left-0 w-11 h-11 bg-no-repeat bg-contain" style={{ backgroundImage: `url(${assetPath('assets/border/bot-left.png')})` }} />
        <div className="absolute bottom-0 right-0 w-11 h-11 bg-no-repeat bg-contain" style={{ backgroundImage: `url(${assetPath('assets/border/bot-right.png')})` }} />

        <div className="absolute top-0 left-11 right-11 h-[10px] bg-repeat-x bg-[length:1.5px]" style={{ backgroundImage: `url(${assetPath('assets/border/line-top.png')})` }} />
        <div className="absolute bottom-0 left-11 right-11 h-[10px] bg-repeat-x bg-[length:1.5px]" style={{ backgroundImage: `url(${assetPath('assets/border/line-bot.png')})` }} />
        <div className="absolute left-0 top-11 bottom-11 w-[11px] bg-repeat-y bg-[length:11px]" style={{ backgroundImage: `url(${assetPath('assets/border/line-left.png')})` }} />
        <div className="absolute right-0 top-11 bottom-11 w-[11px] bg-repeat-y bg-[length:11px]" style={{ backgroundImage: `url(${assetPath('assets/border/line-right.png')})` }} />
      </div>

      <div className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-5">
        <div className="w-full max-w-3xl flex flex-col items-center relative my-auto scale-[0.8] lg:scale-[1] will-change-transform">
          
          {/* 📋 BANNER OVERLAY */}
          <div className="flex items-center h-14 sm:h-20 max-w-full drop-shadow-[0_4px_0_rgba(0,0,0,0.35)] image-render-pixelated z-50 -mb-5 translate-y-1 transform">
            <img src={assetPath('assets/banner/left-bg.png')} alt="" className="h-full object-contain select-none pointer-events-none" />
            <div
              className="h-full flex items-center justify-center px-6 sm:px-12 bg-repeat-x bg-[length:auto_100%]"
              style={{ backgroundImage: `url(${assetPath('assets/banner/fill-bg.png')})` }}
            >
              <h2 className="text-xl sm:text-4xl font-black text-white uppercase tracking-wide drop-shadow-[0_2px_0_rgba(0,0,0,0.85)] text-center whitespace-nowrap mb-2 font-bungee [-webkit-text-stroke:2px_#000000]">
                Select your runner
              </h2>
            </div>
            <img src={assetPath('assets/banner/right-bg.png')} alt="" className="h-full object-contain select-none pointer-events-none" />
          </div>

          {/* 📋 SCOREBOARD PANEL */}
          <div className="flex flex-col drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] relative">
            <div className="flex flex-col items-center rounded-md border border-2 border-black p-5 bg-[#f7e3ba]">
              
              {/* 📜 CHARACTER SELECTION GRID */}
              <div className="w-full max-w-2xl grid grid-cols-4 gap-2 md:gap-4 justify-items-center max-h-[220px] sm:max-h-[280px] overflow-y-auto pr-1 pb-1">
                {CHARACTERS.map((char) => {
                  const isSelected = selectedId === char.id;
                  return (
                    <div onClick={() => handleSelect(char)} className="group flex flex-col items-center justify-center w-[120px] sm:w-[145px] md:w-[155px] cursor-pointer select-none" key={char.id}>
                      <div className={`w-full h-[12px] sm:h-[14px] border-2 rounded-xl transition-all duration-150 ${isSelected ? 'border-[#b68263] shadow-[0_-4px_12px_rgba(255,255,255,0.7)] bg-[linear-gradient(0deg,rgba(209,143,105,1)_0%,rgba(240,210,166,1)_100%)]' : 'border-[#b68263] group-hover:shadow-[0_-4px_10px_rgba(255,255,255,0.4)] bg-[linear-gradient(180deg,rgba(250,231,194,1)_0%,rgba(240,210,166,1)_100%)]'}`} />
                      <div className={`w-[92%] relative flex flex-col items-center justify-between z-20 border-2 rounded-t-none rounded-md p-2 bg-[#f9e7c3] ${isSelected ? 'border-[#b68263] shadow-[0_-4px_12px_rgba(255,255,255,0.7)] bg-[linear-gradient(0deg,rgba(209,143,105,1)_0%,rgba(240,210,166,1)_100%)]' : 'border-[#b68263] shadow-[0_8px_16px_rgba(0,0,0,0.25),inset_0_0_40px_rgba(139,94,26,0.15)] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] hover:scale-[1.01]'}`}>
                        <div className="w-full absolute top-0 left-0 h-[5px] bg-[#f0d2a6]"></div>
                        <div className="text-center">
                          <h3 className="text-xs sm:text-sm font-black tracking-tight leading-tight text-slate-800 uppercase" style={{ fontFamily: 'var(--font-fredoka)' }}>{char.name}</h3>
                        </div>
                        <div className="my-1.5 h-12 sm:h-16 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                          <AnimatedIdleSprite folder={char.folder} fallbackSprite={char.sprite} frameCount={char.idleFrames} />
                        </div>
                        <div className="w-full space-y-2 pt-1.5">
                          <div className="flex flex-row items-center justify-center gap-1">
                            {(char.startSkills || []).map((skillId) => {
                              const skillDef = SKILLS_REGISTRY.find((s) => s.id === skillId);
                              if (!skillDef) return null;
                              return (
                                <div key={skillId} className={`flex items-center gap-1.5 rounded-md overflow-hidden shadow-[0_0_6px_rgba(168,85,247,0.3)] transition-all duration-200 border ${isSelected ? 'border-[#fff]' : 'border-[#d5a37a]'}`}>
                                  <img src={skillDef.icon} alt={skillDef.name} className="w-5 h-5 sm:w-8 sm:h-8 object-contain" />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className={`z-10 mt-[-5px] w-full h-[10px] sm:h-[12px] border-2 rounded-xl transition-all duration-150 bg-[#b68263] ${isSelected ? 'border-[#b68263] shadow-[0_4px_12px_rgba(255,255,255,0.7)] bg-[#b68263]' : 'border-[#b68263] group-hover:shadow-[0_4px_10px_rgba(255,255,255,0.4)] bg-[linear-gradient(180deg,rgba(250,231,194,1)_0%,rgba(240,210,166,1)_100%)]'}`} />
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          {/* 🎮 CONTROLS FOOTER */}
          <div className="w-full max-w-xl flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 px-4 mt-5 z-10">
            <Button onClick={onBack} text="❮" variant="secondary" outline={false} />
            <Button onClick={onStartGame} text="START" variant="primary" />
          </div>

        </div>
      </div>
    </div>
  );
}