import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import { SKILLS_REGISTRY } from '../skillsData';

const CHARACTERS = [
  { 
    id: 'jumpy_hero', 
    name: 'JUMPY HERO', 
    desc: 'The classic runner', 
    sprite: '🏃‍♂️', 
    folder: 'jumpy',     
    idleFrames: 6,       
    speed: 3, 
    jump: 3, 
    boost: null,
    startSkills: ['revive', 'shield']   
  },
  { 
    id: 'alien_ace', 
    name: 'ALIEN ACE', 
    desc: 'Out of this world jump!', 
    sprite: '👽', 
    folder: 'ace',       
    idleFrames: 6,
    speed: 2, 
    jump: 5, 
    boost: 'jump',
    startSkills: ['invisible']          
  },
  { 
    id: 'explorer_ava', 
    name: 'EXPLORER AVA', 
    desc: 'Quick and agile!', 
    sprite: '🤠', 
    folder: 'ava',
    idleFrames: 6,
    speed: 5, 
    jump: 2, 
    boost: 'speed',
    startSkills: ['sonic']               
  },
  { 
    id: 'pixel_pixie', 
    name: 'PIXEL PIXIE', 
    desc: 'Floats on air!', 
    sprite: '🧚‍♀️', 
    folder: 'pixie',
    idleFrames: 6,
    speed: 2, 
    jump: 4, 
    boost: 'jump',
    startSkills: ['spring']              
  },
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

  const imagePath = `/assets/animations/${folder}/idle/${currentFrame}.png`;

  if (loadFailed) {
    return (
      <div className="text-5xl sm:text-6xl filter drop-shadow-[0_4px_0_rgba(0,0,0,0.15)] animate-bounce [animation-duration:5000ms]">
        {fallbackSprite}
      </div>
    );
  }

  return (
    <img 
      src={imagePath} 
      alt={`${folder} idle animation`}
      className="w-16 h-16 sm:w-20 sm:h-20 object-contain filter drop-shadow-[0_4px_0_rgba(0,0,0,0.2)]"
      onError={(e) => {
        console.error(`🔴 Animation frame failed to load at path: ${imagePath}`);
        setLoadFailed(true);
      }}
    />
  );
}

export default function CharacterSelect({ onSelectCharacter, onBack, onStartGame }) {
  const [selectedId, setSelectedId] = useState('jumpy_hero');

  useEffect(() => {
    if (onSelectCharacter) {
      onSelectCharacter(CHARACTERS[0]);
    }
  }, []);

  const handleSelect = (char) => {
    setSelectedId(char.id);
    if (onSelectCharacter) onSelectCharacter(char);
  };

  return (
    <div className="relative w-full max-w-[1400px] h-full lg:h-auto lg:aspect-[2/1] overflow-hidden select-none bg-[url('/assets/main-menu-bg.jpg')] bg-cover bg-center">

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

      <div className="relative w-full h-full flex flex-col items-center justify-between p-4 md:p-5">
        <div className="flex flex-col items-center justify-between h-full w-full z-10">
          
          {/* 📋 CHOPPED PIXEL-ART ASSET BANNER OVERLAY */}
          <div className="flex items-center h-14 sm:h-20 max-w-full drop-shadow-[0_4px_0_rgba(0,0,0,0.35)] image-render-pixelated">
            {/* Left Edge Slice Cap */}
            <img 
              src="/assets/banner/left-bg.png" 
              alt="" 
              className="h-full object-contain select-none pointer-events-none" 
            />
            {/* Middle Repeating Slice Fill */}
            <div 
              className="h-full flex items-center justify-center px-6 sm:px-12 bg-[url('/assets/banner/fill-bg.png')] bg-repeat-x bg-[length:auto_100%]"
            >
              <h2 className="text-xl sm:text-4xl font-black text-white uppercase tracking-wide drop-shadow-[0_2px_0_rgba(0,0,0,0.85)] text-center whitespace-nowrap mb-2 font-bungee [-webkit-text-stroke:2px_#000000]">
                Select your runner
              </h2>
            </div>
            {/* Right Edge Slice Cap */}
            <img 
              src="/assets/banner/right-bg.png" 
              alt="" 
              className="h-full object-contain select-none pointer-events-none" 
            />
          </div>

          {/* 📜 CHARACTER LIST SELECTION SCROLL GRID */}
          <div className="max-w-5xl grid grid-cols-4 gap-2 md:gap-4 my-auto max-h-[70%] overflow-y-auto">
            {CHARACTERS.map((char) => {
              const isSelected = selectedId === char.id;
              return (
                <div 
                  onClick={() => handleSelect(char)}
                  className="group flex flex-col items-center justify-center w-[150px] md:w-[170px] cursor-pointer select-none" 
                  key={char.id}
                >
                  {/* Decorative Upper Handle */}
                  <div className={`w-[150px] md:w-[170px] h-[15px] border-2 rounded-xl transition-all duration-150
                    ${isSelected 
                      ? 'border-[#b68263] shadow-[0_-4px_12px_rgba(255,255,255,0.7)] bg-[linear-gradient(0deg,rgba(209,143,105,1)_0%,rgba(240,210,166,1)_100%)]' 
                      : 'border-[#b68263] group-hover:shadow-[0_-4px_10px_rgba(255,255,255,0.4)] bg-[linear-gradient(180deg,rgba(250,231,194,1)_0%,rgba(240,210,166,1)_100%)]'
                    }`}
                  />

                  {/* Main Character Display Card */}
                  <div
                    className={`w-[140px] md:w-[160px] relative flex flex-col items-center justify-between z-20 border-2 rounded-t-none rounded-md p-2 bg-[#f9e7c3]
                      ${isSelected 
                        ? 'border-[#b68263] shadow-[0_-4px_12px_rgba(255,255,255,0.7)] bg-[linear-gradient(0deg,rgba(209,143,105,1)_0%,rgba(240,210,166,1)_100%)]' 
                        : 'border-[#b68263] shadow-[0_8px_16px_rgba(0,0,0,0.25),inset_0_0_40px_rgba(139,94,26,0.15)] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] hover:scale-[1.01]'
                      }`}
                  >
                    <div className="w-full absolute top-0 left-0 h-[5px] bg-[#f0d2a6]"></div>
                    
                    {/* Character Identification Header */}
                    <div className="text-center">
                      <h3 className="text-base sm:text-md md:text-lg font-black tracking-tight leading-tight text-slate-800" 
                        style={{ fontFamily: 'var(--font-fredoka)' }}
                      >
                        {char.name}
                      </h3>
                    </div>

                    {/* 🏃‍♂️ LIVE ANIMATED IDLE SPRITE PREVIEW */}
                    <div className="my-2 h-16 sm:h-20 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                      <AnimatedIdleSprite
                        folder={char.folder}
                        fallbackSprite={char.sprite}
                        frameCount={char.idleFrames}
                      />
                    </div>

                    {/* Dynamic Stat Display Bars */}
                    <div className={`w-full space-y-2 pt-2 border-t ${isSelected ? 'border-amber-50' : 'border-amber-900/10'}`}>
                      <div className="flex flex-row items-center justify-center gap-1 pt-1">
                        {(char.startSkills || []).map((skillId) => {
                          const skillDef = SKILLS_REGISTRY.find((s) => s.id === skillId);
                          if (!skillDef) return null;
                          return (
                            <div
                              key={skillId}
                              className={`flex items-center gap-1.5 rounded-md px-2 py-0.5 shadow-[0_0_6px_rgba(168,85,247,0.3)] transition-all duration-200 ${isSelected ? 'bg-[#fff]' : 'bg-[#d5a37a]'}`}
                            >
                              <span className="text-sm">{skillDef.icon}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Decorative Lower Handle */}
                  <div className={`z-10 mt-[-6px] w-[150px] md:w-[170px] h-[12px] border-2 rounded-xl transition-all duration-150 bg-[#b68263]
                    ${isSelected 
                      ? 'border-[#b68263] shadow-[0_4px_12px_rgba(255,255,255,0.7)] bg-[#b68263]' 
                      : 'border-[#b68263] group-hover:shadow-[0_4px_10px_rgba(255,255,255,0.4)] bg-[linear-gradient(180deg,rgba(250,231,194,1)_0%,rgba(240,210,166,1)_100%)]'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* 🎮 LOWER INTERACTIVE CONTROL HUD FOOTER */}
          <div className="w-full max-w-3xl flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 px-4 pb-2">
            <Button onClick={onBack} text="Back" variant="secondary" />
            <Button onClick={onStartGame} text="START" variant="primary" />
          </div>

        </div>
      </div>
    </div>
  );
}