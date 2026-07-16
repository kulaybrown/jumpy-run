/**
 * SoundManager Utility
 * Preloads audio assets from the public folder and provides high-performance,
 * overlapping SFX playback capabilities alongside loopable BGM track controls.
 * Includes automatic browser autoplay unlock handling and real-time settings volume sync.
 */

const SOUNDS_REGISTRY = {
  press: new Audio('/assets/audio/press.mp3'),       
  coin: new Audio('/assets/audio/coin.mp3'),         
  select: new Audio('/assets/audio/select.mp3'),     
  click: new Audio('/assets/audio/click.mp3'),       
  dead: new Audio('/assets/audio/dead.mp3'),
  explosion: new Audio('/assets/audio/explosion.mp3'), 
  'sonic-blast': new Audio('/assets/audio/sonic-blast.mp3'), 
  superman: new Audio('/assets/audio/superman.mp3'), 
  ufo: new Audio('/assets/audio/ufo.mp3'),
  bump: new Audio('/assets/audio/bump.mp3'),                 
  'press-forward': new Audio('/assets/audio/press-forward.mp3'), 
  'press-back': new Audio('/assets/audio/press-back.mp3')        
};

// 📻 Loopable Background Music Registry
const BGM_REGISTRY = {
  'game-bgm': new Audio('/assets/audio/game-bgm.mp3'),
  'mainmenu-bgm': new Audio('/assets/audio/mainmenu-bgm.mp3')
};

// Initialize looping attributes on background tracks
Object.keys(BGM_REGISTRY).forEach(key => {
  BGM_REGISTRY[key].loop = true;
});

// 🎚️ Master Mixing Balance Levels (Prevents audio clipping)
const VOLUME_CONFIG = {
  press: 0.4,
  coin: 0.35,
  select: 0.5,
  click: 0.45,
  dead: 0.55,
  explosion: 0.5,
  'sonic-blast': 0.45,
  superman: 0.4,
  ufo: 0.4,
  bump: 0.5,
  'press-forward': 0.45,
  'press-back': 0.45,
  'game-bgm': 0.22,      
  'mainmenu-bgm': 0.22   
};

// Keep track of the currently active BGM globally
let activeBGMKey = null;

/**
 * Helper to calculate dynamic user volume scales combined with master balance profiles
 */
const getRuntimeVolume = (key, isBGM = false) => {
  const masterBase = VOLUME_CONFIG[key] || 0.5;
  if (typeof window === 'undefined') return masterBase;

  // 🛑 MASTER SOUND SWITCH INTERCEPTOR
  const masterSoundSwitch = localStorage.getItem('game_setting_sound_master');
  if (masterSoundSwitch === 'disabled') return 0;

  const storageKey = isBGM ? 'game_setting_bgm_vol' : 'game_setting_sfx_vol';
  const savedVolumePercent = localStorage.getItem(storageKey);

  // If the user hasn't modified settings yet, default to the master balance mix directly
  if (savedVolumePercent === null) return masterBase;

  // Scale the slider percentage (0 to 100) down to a 0.0 - 1.0 multiplier against master levels
  return (parseInt(savedVolumePercent, 10) / 100) * masterBase;
};

/**
 * Plays a loopable background music track.
 */
export const playBGM = (trackName) => {
  if (activeBGMKey === trackName) return; 

  stopBGM();

  const newTrack = BGM_REGISTRY[trackName];
  if (newTrack) {
    newTrack.volume = getRuntimeVolume(trackName, true);
    newTrack.currentTime = 0;
    
    activeBGMKey = trackName;

    newTrack.play().catch((err) => {
      console.log(`🔊 Autoplay restricted "${trackName}". Waiting for first user interaction to unlock.`);
    });
  }
};

/**
 * Halts the currently active background track and resets its playhead.
 */
export const stopBGM = () => {
  if (activeBGMKey) {
    const activeTrack = BGM_REGISTRY[activeBGMKey];
    if (activeTrack) {
      activeTrack.pause();
      activeTrack.currentTime = 0;
    }
    activeBGMKey = null;
  }
};

/**
 * Flawlessly plays short SFX overlapping triggers using cloned nodes.
 */
export const playSFX = (soundName) => {
  const baseAudio = SOUNDS_REGISTRY[soundName];
  if (!baseAudio) return;

  try {
    const soundClone = baseAudio.cloneNode();
    soundClone.volume = getRuntimeVolume(soundName, false);
    soundClone.play().catch(() => {});
  } catch (error) {
    console.error(`🚨 SoundManager SFX failure on "${soundName}":`, error);
  }
};

/**
 * 🔊 LIVE SETTINGS LISTENER INTERCEPTOR
 * Listens for updates saved from the Settings Modal to dynamically update the volume 
 * of the actively playing track without requiring a music restart.
 */
if (typeof window !== 'undefined') {
  window.addEventListener('game_settings_updated', () => {
    if (activeBGMKey && BGM_REGISTRY[activeBGMKey]) {
      BGM_REGISTRY[activeBGMKey].volume = getRuntimeVolume(activeBGMKey, true);
      console.log(`🎵 Live BGM volume shifted to: ${BGM_REGISTRY[activeBGMKey].volume}`);
    }
  });
}

/**
 * 🔓 GLOBAL BROWSER INTERACTION AUDIO UNLOCKER
 */
const unlockBrowserAudioContext = () => {
  if (activeBGMKey && BGM_REGISTRY[activeBGMKey]) {
    const pendingTrack = BGM_REGISTRY[activeBGMKey];
    if (pendingTrack.paused) {
      pendingTrack.play().catch(() => {});
    }
  }
  window.removeEventListener('click', unlockBrowserAudioContext);
  window.removeEventListener('keydown', unlockBrowserAudioContext);
  window.removeEventListener('touchstart', unlockBrowserAudioContext);
};

if (typeof window !== 'undefined') {
  window.addEventListener('click', unlockBrowserAudioContext);
  window.addEventListener('keydown', unlockBrowserAudioContext);
  window.addEventListener('touchstart', unlockBrowserAudioContext);
}