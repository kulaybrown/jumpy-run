/**
 * SoundManager Utility
 * Preloads audio assets from the public folder and provides high-performance,
 * overlapping SFX playback capabilities alongside loopable BGM track controls.
 * Includes automatic browser autoplay unlock handling and real-time settings volume sync.
 * 📱 Enhanced with native OS lifecycle hooks to handle automatic background suspension.
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

// Keep track of the currently active BGM and playing sound clones
let activeBGMKey = null;
let activeSFXClones = new Set();
let isSuspendedBySystem = false; // Tracks if the game was minimized

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

  if (savedVolumePercent === null) return masterBase;

  return (parseInt(savedVolumePercent, 10) / 100) * masterBase;
};

/**
 * Plays a loopable background music track.
 */
export const playBGM = (trackName) => {
  if (activeBGMKey === trackName) return; 

  stopBGM();
  activeBGMKey = trackName;

  // If the app is currently minimized, defer the actual playback processing until restore
  if (isSuspendedBySystem) return;

  const newTrack = BGM_REGISTRY[trackName];
  if (newTrack) {
    newTrack.volume = getRuntimeVolume(trackName, true);
    newTrack.currentTime = 0;

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
  if (isSuspendedBySystem) return; // Block new sound emission if app is in background

  const baseAudio = SOUNDS_REGISTRY[soundName];
  if (!baseAudio) return;

  try {
    const soundClone = baseAudio.cloneNode();
    soundClone.volume = getRuntimeVolume(soundName, false);
    
    activeSFXClones.add(soundClone);
    soundClone.addEventListener('ended', () => {
      activeSFXClones.delete(soundClone);
    });

    soundClone.play().catch(() => {
      activeSFXClones.delete(soundClone);
    });
  } catch (error) {
    console.error(`🚨 SoundManager SFX failure on "${soundName}":`, error);
  }
};

/**
 * 🔇 Central system pause routines to freeze audio execution instantly
 */
const suspendAllAudio = () => {
  isSuspendedBySystem = true;

  // 1. Pause active BGM line safely without wiping the cache key pointer
  if (activeBGMKey && BGM_REGISTRY[activeBGMKey]) {
    BGM_REGISTRY[activeBGMKey].pause();
  }

  // 2. Halt all active floating audio effect clones instantly
  activeSFXClones.forEach(clone => {
    try {
      clone.pause();
    } catch (e) {}
  });
  activeSFXClones.clear();
};

/**
 * 🔊 Central system resume routines to safely fire audio execution back up
 */
const restoreAllAudio = () => {
  if (!isSuspendedBySystem) return;
  isSuspendedBySystem = false;

  // Restart BGM track if it was playing prior to the window context switch
  if (activeBGMKey && BGM_REGISTRY[activeBGMKey]) {
    const currentTrack = BGM_REGISTRY[activeBGMKey];
    currentTrack.volume = getRuntimeVolume(activeBGMKey, true);
    currentTrack.play().catch(err => {
      console.warn("BGM context restore blocked by device power policies:", err);
    });
  }
};

/**
 * 🛠️ AUTOMATIC LIFECYCLE ROUTER ENGINE
 */
if (typeof window !== 'undefined') {
  // Pass A: Handle Standard Web / PWA layout updates
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      suspendAllAudio();
    } else {
      restoreAllAudio();
    }
  });

  // Pass B: Handle Native Android / Capacitor container state changes
  const bindNativeLifecycleEvents = async () => {
    try {
      if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        const { App } = await import('@capacitor/app');
        
        App.addListener('appStateChange', (state) => {
          if (!state.isActive) {
            suspendAllAudio();
          } else {
            restoreAllAudio();
          }
        });
      }
    } catch (err) {
      console.warn("Capacitor background interceptor initialization failed:", err);
    }
  };
  
  bindNativeLifecycleEvents();
}

/**
 * 🔊 LIVE SETTINGS LISTENER INTERCEPTOR
 */
if (typeof window !== 'undefined') {
  window.addEventListener('game_settings_updated', () => {
    if (activeBGMKey && BGM_REGISTRY[activeBGMKey] && !isSuspendedBySystem) {
      BGM_REGISTRY[activeBGMKey].volume = getRuntimeVolume(activeBGMKey, true);
      console.log(`🎵 Live BGM volume shifted to: ${BGM_REGISTRY[activeBGMKey].volume}`);
    }
  });
}

/**
 * 🔓 GLOBAL BROWSER INTERACTION AUDIO UNLOCKER
 */
const unlockBrowserAudioContext = () => {
  if (activeBGMKey && BGM_REGISTRY[activeBGMKey] && !isSuspendedBySystem) {
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