import React, { useState, useEffect } from 'react';

export default function SettingsModal({ isOpen, onClose }) {
  // Game Tuning Configuration States
  const [soundMaster, setSoundMaster] = useState('enabled'); // ✅ Added Master Sound Toggle State
  const [bgmVolume, setBgmVolume] = useState(80);
  const [sfxVolume, setSfxVolume] = useState(80);
  const [screenShake, setScreenShake] = useState('enabled');
  const [particleDensity, setParticleDensity] = useState('high');
  
  const [isSaving, setIsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');

  // Synchronize persisted preferences on layout initialization
  useEffect(() => {
    if (!isOpen) return;

    const storedMaster = localStorage.getItem('game_setting_sound_master');
    const storedBgm = localStorage.getItem('game_setting_bgm_vol');
    const storedSfx = localStorage.getItem('game_setting_sfx_vol');
    const storedShake = localStorage.getItem('game_setting_screen_shake');
    const storedParticles = localStorage.getItem('game_setting_particles');

    if (storedMaster !== null) setSoundMaster(storedMaster);
    if (storedBgm !== null) setBgmVolume(Number(storedBgm));
    if (storedSfx !== null) setSfxVolume(Number(storedSfx));
    if (storedShake !== null) setScreenShake(storedShake);
    if (storedParticles !== null) setParticleDensity(storedParticles);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSettingsMessage('');

    try {
      // Push modern attributes directly down into regional local cache structures
      localStorage.setItem('game_setting_sound_master', soundMaster);
      localStorage.setItem('game_setting_bgm_vol', bgmVolume.toString());
      localStorage.setItem('game_setting_sfx_vol', sfxVolume.toString());
      localStorage.setItem('game_setting_screen_shake', screenShake);
      localStorage.setItem('game_setting_particles', particleDensity);

      // Dispatch a global configuration update event for active sound manager streams
      window.dispatchEvent(new Event('game_settings_updated'));

      setSettingsMessage('✅ Configuration saved!');
      setTimeout(() => {
        setSettingsMessage('');
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      setSettingsMessage('❌ Configuration failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setSoundMaster('enabled');
    setBgmVolume(80);
    setSfxVolume(80);
    setScreenShake('enabled');
    setParticleDensity('high');
  };

  const isAudioMuted = soundMaster === 'disabled';

  return (
    <div className="absolute inset-0 bg-black/85 z-[100] flex items-center justify-center p-4 backdrop-blur-xs font-mono max-h-full overflow-y-auto">
      <div className="bg-[linear-gradient(0deg,rgba(209,143,105,1)_0%,rgba(240,210,166,1)_100%)] border border-2 border-white p-5 rounded-2xl w-full max-w-sm shadow-2xl space-y-4 text-left relative max-h-[95vh] overflow-y-auto scrollbar-none">
        
        <button onClick={onClose} className="absolute top-4 right-4 font-bold cursor-pointer text-lg">✖</button>

        <div>
          <h3 className="text-lg font-bungee font-black text-white [-webkit-text-stroke:1px_#000000] uppercase tracking-wide">⚙️ Game Settings</h3>
          <p className="text-[10px] text-black font-sans">Adjust audio levels, screen variables, and performance parameters.</p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          
          {/* 🔊 SECTION 1: AUDIO CONFIGURATION CONTROL PANELS */}
          <div className="space-y-3 bg-slate-950 p-3 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <label className="block text-[9px] uppercase font-bold text-white tracking-wider">Audio Channels</label>
              
              {/* ✅ Master Sound Switch Dropdown */}
              <select
                value={soundMaster}
                onChange={(e) => setSoundMaster(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-[10px] px-1.5 py-0.5 rounded text-white outline-none font-bold cursor-pointer transition-colors focus:border-indigo-500"
              >
                <option value="enabled">🔊 SOUND ON</option>
                <option value="disabled">🔇 MUTE ALL</option>
              </select>
            </div>
            
            {/* Dynamic visual opacity dimming layout feedback if the system is globally muted */}
            <div className={`space-y-3 transition-opacity duration-200 ${isAudioMuted ? 'opacity-35 pointer-events-none' : 'opacity-100'}`}>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Music Vol</span>
                  <span className="text-xs font-bold text-amber-400 font-mono">{bgmVolume}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={bgmVolume}
                  onChange={(e) => setBgmVolume(Number(e.target.value))}
                  disabled={isAudioMuted}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Effects Vol</span>
                  <span className="text-xs font-bold text-amber-400 font-mono">{sfxVolume}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={sfxVolume}
                  onChange={(e) => setSfxVolume(Number(e.target.value))}
                  disabled={isAudioMuted}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* 🎬 SECTION 2: GAMEPLAY & GRAPHICS ENHANCEMENTS */}
          <div className="space-y-3 bg-slate-950 p-3 border border-slate-800 rounded-xl">
            <label className="block text-[9px] uppercase font-bold text-white tracking-wider border-b border-slate-800 pb-1.5">Engine Modifiers</label>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Screen Shake</label>
                <select 
                  value={screenShake} 
                  onChange={(e) => setScreenShake(e.target.value)} 
                  className="w-full bg-white border border-slate-800 text-xs p-1.5 rounded-lg text-black outline-none font-bold cursor-pointer"
                >
                  <option value="enabled">ON</option>
                  <option value="disabled">OFF</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Particles</label>
                <select 
                  value={particleDensity} 
                  onChange={(e) => setParticleDensity(e.target.value)} 
                  className="w-full bg-white border border-slate-800 text-xs p-1.5 rounded-lg text-black outline-none font-bold cursor-pointer"
                >
                  <option value="high">HIGH DENSITY</option>
                  <option value="medium">BALANCED</option>
                  <option value="low">PERFORMANCE</option>
                </select>
              </div>
            </div>
          </div>

          {/* FOOTER ACTIONS SUBMIT SECTION */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/40">
            <button 
              type="button" 
              onClick={handleResetDefaults}
              className="text-[10px] font-bold text-slate-800 hover:text-black underline cursor-pointer transition-colors"
            >
              Reset Defaults
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-900 animate-pulse">{settingsMessage}</span>
              <button 
                type="submit" 
                disabled={isSaving} 
                className="px-4 py-1.5 text-[11px] bg-green-800 hover:bg-green-700 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-md"
              >
                {isSaving ? 'Applying...' : 'Save Configuration'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}