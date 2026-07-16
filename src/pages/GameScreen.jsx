import React, { useEffect, useRef, useState } from 'react';
import CharacterSelect from './CharacterSelect'; 
import Button from '../components/Button';
import AdPromptOverlay from './AdPromptOverlay';
import FakeAdOverlay from './FakeAdOverlay';
import RunCompletedOverlay from './RunCompletedOverlay';
import SkillSelectionOverlay from './SkillSelectionOverlay';
import LeaderboardOverlay from '../components/LeaderboardOverlay'; 
import UserProfileModal from '../components/UserProfileModal'; 
import { SKILLS_REGISTRY } from '../skillsData';
import { BackgroundEffects } from '../utils/BackgroundEffects';
import { ObstacleManager } from '../utils/ObstacleManager';
import { showRewardedAd } from '../utils/AdService';
import { supabase } from '../supabaseClient';
import { playSFX, playBGM, stopBGM, setPlatformMuted } from '../utils/SoundManager'; 
import { Capacitor } from '@capacitor/core';

// Plain static public paths definition
const farCityImg = '/assets/far-bg.png';
const midCityImg = '/assets/mid-bg.png';
const nearCityImg = '/assets/near-bg.png';

// --- CONFIGURATION TUNING ---
const MAX_DAILY_ADS = 3;
const BACKGROUND_ZOOM = 1.1; 
const HUD_UPDATE_INTERVAL = 100;
const NATIVE_TARGET_FPS = 60;
const NATIVE_DPR_CAP = 1;
const NATIVE_MAX_PARTICLES = 50;
const DESKTOP_MAX_PARTICLES = 180;

// --- ANIMATION TRACKING ASSET FOLDER ROUTER ---
const SPRITE_CONFIG_MAP = {
  jumpy_hero: { folder: 'jumpy', runFrames: 6, jumpFrames: 6, flyFrames: 6 },
  alien_ace: { folder: 'ace', runFrames: 6, jumpFrames: 6, flyFrames: 6 }, 
  explorer_ava: { folder: 'ava', runFrames: 6, jumpFrames: 6, flyFrames: 6 },   
  pixel_pixie: { folder: 'pixie', runFrames: 6, jumpFrames: 6, flyFrames: 6 }  
};

// --- SAFE VECTOR CHARACTER COLOR MAPPING FALLBACKS ---
const FALLBACK_COLOR_MAP = {
  jumpy_hero: '#a855f7',
  alien_ace: '#3b82f6',
  explorer_ava: '#ef4444',
  pixel_pixie: '#10b981'
};

// 🛡️ Each hero's shield ring uses its own color instead of one shared cyan
const SHIELD_COLOR_MAP = {
  jumpy_hero: '#38bdf8',   // sky blue
  alien_ace: '#166534',    // dark green
  explorer_ava: '#c19a6b', // light brown
  pixel_pixie: '#ec4899'   // pink
};

// 🔁 Characters whose default skill re-activates itself on a fixed timer
const AUTO_SKILL_INTERVAL_MAP = {
  alien_ace: { id: 'invisible', interval: 20000 },   // Ghost Walk every 20s
  explorer_ava: { id: 'sonic', interval: 15000 },    // Sonic Pulse every 15s
  pixel_pixie: { id: 'spring', interval: 20000 },    // Bounce Boots every 20s
};

const hexToRgba = (hex, alpha) => {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function GameScreen({ playerColor, onMainMenu }) {
  const canvasRef = useRef(null);
  
  // Game Character View Control States
  const [showCharSelect, setShowCharSelect] = useState(true);
  
  // --- DATABASE & AUTHENTICATION MANAGEMENT STATES ---
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [showAuthForm, setShowAuthForm] = useState(false); // Controls UserProfileModal open state visibility trigger anchor
  const [authMode, setAuthMode] = useState('login'); 
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  const [selectedChar, setSelectedChar] = useState({
    id: 'jumpy_hero',
    name: 'JUMPY HERO',
    desc: 'The classic runner',
    sprite: '🏃‍♂️',
    speed: 3,
    jump: 3,
    boost: null,
    startSkills: ['revive', 'shield']
  });

  // Game Stats States
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0); 
  const [coins, setCoins] = useState(0);

  // Power-up Stocks
  const [shieldCount, setShieldCount] = useState(0);
  const [reviveCount, setReviveCount] = useState(0);

  // Card Skill States
  const [showCards, setShowCards] = useState(false);
  const [randomCards, setRandomCards] = useState([]);
  
  // Track multiple concurrent active skills for the HUD render
  const [activeSkills, setActiveSkills] = useState([]);

  // --- ECONOMIC, OVERLAY & JUICE FEATURES ---
  const [highScores, setHighScores] = useState([]);
  const [showAdPrompt, setShowAdPrompt] = useState(false);
  const [adOverlay, setAdOverlay] = useState(null); 
  const [adCountdown, setAdCountdown] = useState(5);
  const [showResumingOverlay, setShowResumingOverlay] = useState(false);
  const [hasUsedAdRevive, setHasUsedAdRevive] = useState(false);
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [isGameOverScreen, setIsGameOverScreen] = useState(false);
  const [calculatedRank, setCalculatedRank] = useState(null); // Added real-time cloud rank state tracking
  const [adDebugStatus, setAdDebugStatus] = useState('checking');
  
  // Asset Pipelines Sync State
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [dailyAdsUsed, setDailyAdsUsed] = useState(0);
  const adRewardGrantedRef = useRef(false); 
  const lossSequenceStartedRef = useRef(false);
  const resumeOverlayTimerRef = useRef(null);

  // Refs for loop management
  const gamePausedRef = useRef(false);
  const nextSkillMilestoneRef = useRef(800); 

  const shieldCountRef = useRef(0);
  const reviveCountRef = useRef(0);
  const shakeIntensityRef = useRef(0);
  
  // Ref tracker for active flying dodge maneuvers
  const flyEvadeTimerRef = useRef(0);

  // Tracks when each character's recurring default skill should next re-fire
  const autoSkillNextTriggerRef = useRef(0);

  // Dictionary collection to map multi-skill stacking streams
  const activeSkillsRef = useRef({});

  const obstaclesRef = useRef([]);
  const coinsArrayRef = useRef([]);
  const ufosRef = useRef([]);
  const particlesRef = useRef([]); 
  const sonicWavesRef = useRef([]); // Dynamic visual tracking buffer for expanding rings
  const sprintTrailsRef = useRef([]); // Tracking array buffer for rendering afterimage echoes
  const explosionsRef = useRef([]); // Structural buffer for tracking tactical chain explosions

  // --- EXTERNAL SYSTEM MANAGERS AND GRAPHICS BUFFERS ---
  const bgLayersRef = useRef([]);
  const obstacleManagerRef = useRef(new ObstacleManager());

  const canvasClickHandler = useRef(null);

  // High-performance image sequence frame asset cache loader mapping context
  const gameplaySpriteCacheRef = useRef({});

  // --- 📻 BACKGROUND MUSIC (BGM) STATE ENGINE ---
  useEffect(() => {
    if (!assetsLoaded) return;

    if (showCharSelect) {
      // 🎵 Play menu music continuously during character select and main menu phases
      playBGM('mainmenu-bgm');
    } else if (showAdPrompt || adOverlay || showResumingOverlay || isGameOverScreen) {
      // 💀 Turn off active run background music while dead/ad flow overlays are active
      stopBGM();
    } else {
      // 🎮 Start run music automatically when a new run begins / restarts
      playBGM('game-bgm');
    }

    return () => {
      stopBGM();
    };
  }, [showCharSelect, assetsLoaded, showAdPrompt, adOverlay, showResumingOverlay, isGameOverScreen]); // ✅ Hook dynamically reacts to death/ad states seamlessly

  useEffect(() => {
    return () => {
      if (resumeOverlayTimerRef.current) {
        clearTimeout(resumeOverlayTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (Capacitor.isNativePlatform() || typeof window === 'undefined') return;

    const sdk = window.CrazyGames?.SDK;
    if (!sdk || (sdk.environment !== 'local' && sdk.environment !== 'crazygames')) return;

    const syncMuteSetting = (settings) => {
      setPlatformMuted(Boolean(settings?.muteAudio));
    };

    const applySettings = async () => {
      try {
        await sdk.init();
        syncMuteSetting(sdk.game.settings || {});
      } catch (err) {
        console.warn('CrazyGames settings init failed:', err);
      }
    };

    applySettings();
    sdk.game.addSettingsChangeListener(syncMuteSetting);

    return () => {
      sdk.game.removeSettingsChangeListener(syncMuteSetting);
      setPlatformMuted(false);
    };
  }, []);

  useEffect(() => {
    if (Capacitor.isNativePlatform() || typeof window === 'undefined') return;

    const sdk = window.CrazyGames?.SDK;
    if (!sdk || (sdk.environment !== 'local' && sdk.environment !== 'crazygames')) return;

    const gameplayActive = assetsLoaded && !showCharSelect && !showCards && !showAdPrompt && !adOverlay && !showResumingOverlay && !isGameOverScreen;

    const syncGameplayState = async () => {
      try {
        await sdk.init();
        if (gameplayActive) {
          sdk.game.gameplayStart();
        } else {
          sdk.game.gameplayStop();
        }
      } catch (err) {
        console.warn('CrazyGames gameplay state sync failed:', err);
      }
    };

    syncGameplayState();
  }, [assetsLoaded, showCharSelect, showCards, showAdPrompt, adOverlay, showResumingOverlay, isGameOverScreen]);

  useEffect(() => {
    if (Capacitor.isNativePlatform() || typeof window === 'undefined' || !assetsLoaded) return;

    const sdk = window.CrazyGames?.SDK;
    if (!sdk || (sdk.environment !== 'local' && sdk.environment !== 'crazygames')) return;

    const stopLoading = async () => {
      try {
        await sdk.init();
        sdk.game.loadingStop();
      } catch (err) {
        console.warn('CrazyGames loadingStop failed:', err);
      }
    };

    stopLoading();
  }, [assetsLoaded]);

  // --- 🔗 CAPACITOR NATIVE DEEP LINK INTERCEPTOR ---
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let appListener;
    const setupDeepLinkListener = async () => {
      const { App } = await import('@capacitor/app');
      appListener = await App.addListener('appUrlOpen', async (event) => {
        console.log('🔗 Mobile device triggered App redirect:', event.url);
        
        try {
          const urlObj = new URL(event.url);
          const hash = urlObj.hash;
          
          if (hash) {
            const params = new URLSearchParams(hash.substring(1));
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken && refreshToken) {
              console.log('🔑 OAuth credentials captured! Attempting login...');
              
              // Close standard mobile Browser overlays if they remain active
              try {
                const { Browser } = await import('@capacitor/browser');
                await Browser.close();
              } catch (e) {
                console.warn("Overlay Browser already closed or unavailable.");
              }

              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });

              if (error) throw error;

              if (data?.user) {
                setUserId(data.user.id);
                setUserEmail(data.user.email || null);
                
                const { data: existingPlayer } = await supabase
                  .from('players')
                  .select('name')
                  .eq('id', data.user.id)
                  .maybeSingle();

                if (!existingPlayer) {
                  await supabase.from('players').insert({ 
                    id: data.user.id, 
                    email: data.user.email || null,
                    name: data.user.email ? data.user.email.split('@')[0] : 'Runner'
                  });
                }
                
                alert("Successfully authenticated with Google!");
                setShowAuthForm(false);
              }
            }
          }
        } catch (err) {
          console.error("🚨 Mobile OAuth Deep-Link Session Set Failed:", err);
        }
      });
    };

    setupDeepLinkListener();

    return () => {
      if (appListener) appListener.remove();
    };
  }, []);

  // --- INITIALIZATION AND DAILY CAP ROTATION ENGINE ---
  useEffect(() => {
    const cachedScores = JSON.parse(localStorage.getItem('runner_high_scores')) || [];
    setHighScores(cachedScores);

    const todayStr = new Date().toDateString(); 
    const savedDate = localStorage.getItem('runner_ad_date');
    let historicalCount = parseInt(localStorage.getItem('runner_daily_ads_count') || '0', 10);

    if (savedDate !== todayStr) {
      localStorage.setItem('runner_ad_date', todayStr);
      localStorage.setItem('runner_daily_ads_count', '0');
      historicalCount = 0;
    }
    setDailyAdsUsed(historicalCount);

    const checkAndInitializeUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          const { data, error } = await supabase.auth.signInAnonymously();
          if (!error && data?.user) {
            setUserId(data.user.id);
            
            // Safe Check: Only build a placeholder if this anonymous guest slot doesn't exist yet
            const { data: existingGuest } = await supabase
              .from('players')
              .select('name')
              .eq('id', data.user.id)
              .maybeSingle();

            if (!existingGuest) {
              await supabase.from('players').insert({ id: data.user.id, name: 'Guest' });
            }
          }
        } else {
          setUserId(session.user.id);
          setUserEmail(session.user.email || null);
          
          // Safe Check: Fetch profile row data space before evaluating names
          const { data: existingPlayer } = await supabase
            .from('players')
            .select('name')
            .eq('id', session.user.id)
            .maybeSingle();

          if (!existingPlayer) {
            // Drop a clean insert fallback down if it is an absolute new account space
            await supabase.from('players').insert({ 
              id: session.user.id, 
              email: session.user.email || null,
              name: session.user.email ? session.user.email.split('@')[0] : 'Runner'
            });
          } else if (session.user.email) {
            // Keep email configurations synced perfectly without overriding callsigns
            await supabase.from('players').update({ email: session.user.email }).eq('id', session.user.id);
          }

          const { data: topGlobalScores } = await supabase
            .from('players')
            .select('score')
            .order('score', { ascending: false })
            .limit(3);
          
          if (topGlobalScores && topGlobalScores.length > 0) {
            setHighScores(topGlobalScores.map(row => row.score));
          }
        }
      } catch (err) {
        console.error("Database authentication context pipeline failure:", err);
      }
    };

    checkAndInitializeUser();
  }, []);

  // --- CONSOLIDATED GRAPHICS PRELOADER PIPELINE ---
  useEffect(() => {
    const far = new Image(); far.src = farCityImg;
    const mid = new Image(); mid.src = midCityImg;
    const near = new Image(); near.src = nearCityImg;

    let bgsLoaded = false;
    let bgCount = 0;
    let spritesLoaded = false;

    const verifyFinalSetup = () => {
      // 🏁 Complete load ONLY when backgrounds, obstacles, and character sheets are stored in RAM
      if (bgsLoaded && obstacleManagerRef.current.isLoaded && spritesLoaded) {
        setAssetsLoaded(true);
      }
    };

    const checkBgLoad = () => {
      bgCount++;
      if (bgCount === 3) {
        bgLayersRef.current = [
          { img: far, x: 0, speed: 0.2 },
          { img: mid, x: 0, speed: 0.5 },
          { img: near, x: 0, speed: 7 } 
        ];
        bgsLoaded = true;
        verifyFinalSetup();
      }
    };

    far.onload = checkBgLoad;
    mid.onload = checkBgLoad;
    near.onload = checkBgLoad;

    far.onerror = () => console.error(`🚨 Background image failed to load at path: ${farCityImg}`);
    mid.onerror = () => console.error(`🚨 Background image failed to load at path: ${midCityImg}`);
    near.onerror = () => console.error(`🚨 Background image failed to load at path: ${nearCityImg}`);

    // 🚀 PRE-HYDRATE ALL HERO ANIMATIONS ON INITIAL BOOT
    const charactersToPreload = ['jumpy_hero', 'alien_ace', 'explorer_ava', 'pixel_pixie'];
    let loadedCount = 0;
    let totalSprites = 0;

    charactersToPreload.forEach(charId => {
      const config = SPRITE_CONFIG_MAP[charId] || SPRITE_CONFIG_MAP['jumpy_hero'];
      totalSprites += config.runFrames + config.jumpFrames + config.flyFrames;
    });

    const checkSpriteLoad = () => {
      loadedCount++;
      if (loadedCount === totalSprites) {
        spritesLoaded = true;
        verifyFinalSetup();
      }
    };

    charactersToPreload.forEach(charId => {
      const config = SPRITE_CONFIG_MAP[charId] || SPRITE_CONFIG_MAP['jumpy_hero'];
      const actions = [
        { name: 'run', frames: config.runFrames },
        { name: 'jump', frames: config.jumpFrames },
        { name: 'fly', frames: config.flyFrames }
      ];
      
      actions.forEach(action => {
        for (let i = 0; i < action.frames; i++) {
          const key = `${config.folder}_${action.name}_${i}`;
          const img = new Image();
          img.src = `/assets/animations/${config.folder}/${action.name}/${i}.png`;
          img.onload = checkSpriteLoad;
          img.onerror = () => {
            img.src = `/assets/animations/${config.folder}/idle/0.png`;
            checkSpriteLoad();
          };
          gameplaySpriteCacheRef.current[key] = img;
        }
      });
    });

    obstacleManagerRef.current.initialize().then(() => {
      verifyFinalSetup();
    });
  }, []);

  // --- AD COUNTDOWN TIMER TICK EFFECT ---
  useEffect(() => {
    let interval;
    if (adOverlay === 'playing' && adCountdown > 0) {
      interval = setInterval(() => {
        setAdCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [adOverlay, adCountdown]);

  // --- AD DEPLOYMENT HOOK TRACKING DEBUG ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkAdHook = () => {
        if (Capacitor.isNativePlatform()) {
          setAdDebugStatus('google-hook-ready');
        } else if (typeof window.adBreak !== 'undefined') {
          setAdDebugStatus('google-hook-ready');
        } else {
          setAdDebugStatus('checking');
        }
      };
      checkAdHook();
      const t = setInterval(checkAdHook, 2000);
      return () => clearInterval(t);
    }
  }, []);

  // --- FOOLPROOF DIRECT STORAGE SYNC ENGINE ---
  const saveHighScore = async (finalScore) => {
    const currentScores = JSON.parse(localStorage.getItem('runner_high_scores')) || [];
    const updated = [...currentScores, finalScore].sort((a, b) => b - a).slice(0, 3); 
    localStorage.setItem('runner_high_scores', JSON.stringify(updated));
    setHighScores(updated);

    if (userId) {
      try {
        const { data: profile } = await supabase
          .from('players')
          .select('score, attempts')
          .eq('id', userId)
          .maybeSingle();

        const currentAttempts = profile ? (profile.attempts || 0) + 1 : 1;
        const highestScore = profile ? Math.max(profile.score || 0, finalScore) : finalScore;

        const { error } = await supabase
          .from('players')
          .upsert({ 
            id: userId, 
            score: highestScore,
            attempts: currentAttempts,
            email: userEmail || null
          }, { onConflict: 'id' });

        if (error) throw error;

        const { count } = await supabase
          .from('players')
          .select('*', { count: 'exact', head: true })
          .gt('score', finalScore);
          
        setCalculatedRank((count || 0) + 1);
        console.log(`Current Run Rank evaluated: ${(count || 0) + 1} (Score: ${finalScore})`);
      } catch (err) {
        console.error("Failed syncing metrics data to database:", err);
      }
    }
  };

  const startLossSequence = () => {
    if (lossSequenceStartedRef.current) return;

    lossSequenceStartedRef.current = true;
    stopBGM();
    playSFX('dead');
  };

  const enterGameOver = (finalScoreValue) => {
    startLossSequence();
    saveHighScore(finalScoreValue);
    setIsGameOverScreen(true);
  };

  // --- UNIFIED CREDENTIALS AUTHENTICATION HANDLER ---
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return alert("Please specify valid credentials.");

    if (authMode === 'link') {
      const { data, error } = await supabase.auth.updateUser({
        email: authEmail,
        password: authPassword
      });

      if (error) return alert(`Linking Account Error: ${error.message}`);

      if (data?.user) {
        setUserEmail(data.user.email);
        
        const { error: upsertError } = await supabase
          .from('players')
          .upsert({ 
            id: data.user.id, 
            email: data.user.email, 
            name: data.user.email.split('@')[0] 
          }, { onConflict: 'id' });

        if (upsertError) console.error("Profile row field injection failed:", upsertError);

        alert("Progress successfully saved to your cloud email profile!");
        setShowAuthForm(false);
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword
      });

      if (error) return alert(`Login error: ${error.message}`);

      if (data?.user) {
        setUserId(data.user.id);
        setUserEmail(data.user.email);

        await supabase
          .from('players')
          .upsert({ 
            id: data.user.id, 
            email: data.user.email, 
            name: data.user.email.split('@')[0] 
          }, { onConflict: 'id' });

        alert("Welcome back, Runner!");
        setShowAuthForm(false);
        
        const { data: topGlobalScores } = await supabase
          .from('players')
          .select('score')
          .order('score', { ascending: false })
          .limit(3);
        if (topGlobalScores) setHighScores(topGlobalScores.map(row => row.score));
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const isNative = Capacitor.isNativePlatform();
      const redirectUrl = isNative 
        ? 'com.iamthelosworld.jumpyrun://login-callback' 
        : window.location.origin;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: isNative
        }
      });

      if (error) throw error;

      if (isNative && data?.url) {
        // 🌐 Open login consent flow in a native sheet to prevent WebView redirection failures
        const { Browser } = await import('@capacitor/browser');
        await Browser.open({ url: data.url });
      }
    } catch (err) {
      alert(`Google Provider Authentication Error: ${err.message}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserId(null);
    setUserEmail(null);
    
    const { data } = await supabase.auth.signInAnonymously();
    if (data?.user) {
      setUserId(data.user.id);
      await supabase.from('players').upsert({ id: data.user.id, name: 'Guest' }, { onConflict: 'id' });
    }
  };

  const triggerShake = (intensity) => {
    shakeIntensityRef.current = intensity;
    setShakeIntensity(intensity);
  };

  const spawnParticles = (x, y, color, count = 8) => {
    const isNative = Capacitor.isNativePlatform();
    // ⚡ Halve the rendering overhead dynamically on native devices to prevent stutter
    const finalCount = isNative ? Math.max(3, Math.floor(count * 0.5)) : count;
    const maxParticles = isNative ? NATIVE_MAX_PARTICLES : DESKTOP_MAX_PARTICLES;

    if (particlesRef.current.length > maxParticles) {
      particlesRef.current.splice(0, particlesRef.current.length - maxParticles);
    }

    for (let i = 0; i < finalCount; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        radius: Math.random() * 3 + 2,
        alpha: 1,
        color: color
      });
    }
  };

  const triggerCardSelection = () => {
    gamePausedRef.current = true;
    const shuffled = [...SKILLS_REGISTRY].sort(() => 0.5 - Math.random());
    const chosen = shuffled.slice(0, 3);
    setRandomCards(chosen);
    setShowCards(true);
  };

  const handleSelectSkill = (skill) => {
    const now = Date.now();
    const obstacles = obstaclesRef.current;
    const coinsArray = coinsArrayRef.current;

    if (!skill) {
      setShowCards(false);
      gamePausedRef.current = false;
      return;
    }

    if (skill.id === 'burst') {
      triggerShake(18); 
      playSFX('explosion');

      obstacles.forEach(obs => {
        const cx = obs.x + obs.width / 2;
        const cy = obs.y + obs.height / 2;
        
        spawnParticles(cx, cy, '#fbbf24', 8);  
        spawnParticles(cx, cy, '#f97316', 6);  
        spawnParticles(cx, cy, '#ffffff', 4);  
        
        coinsArray.push({ x: obs.x, y: obs.y, radius: 8 });
        
        explosionsRef.current.push({
          x: cx,
          y: cy,
          radius: 5,
          maxRadius: 70,
          alpha: 1.0,
          color: '#fbbf24'
        });
      });
      obstacles.length = 0;
      
      ufosRef.current.forEach(ufo => {
        const cx = ufo.x + ufo.width / 2;
        const cy = ufo.y + ufo.height / 2;
        
        spawnParticles(cx, cy, '#fbbf24', 14);
        spawnParticles(cx, cy, '#ef4444', 10);
        spawnParticles(cx, cy, '#ffffff', 6);
        
        coinsArray.push({ x: ufo.x, y: ufo.y, radius: 10 });
        
        explosionsRef.current.push({
          x: cx,
          y: cy,
          radius: 5,
          maxRadius: 105,
          alpha: 1.0,
          color: '#ef4444'
        });
      });
      ufosRef.current.length = 0;

      setShowCards(false);
      gamePausedRef.current = false;
      return;
    }

    if (skill.id === 'shield') {
      if (shieldCountRef.current < 5) {
        shieldCountRef.current += 1;
        setShieldCount(shieldCountRef.current);
      }
      setShowCards(false);
      gamePausedRef.current = false;
      return;
    }

    if (skill.id === 'revive') {
      if (reviveCountRef.current < 2) {
        reviveCountRef.current += 1;
        setReviveCount(reviveCountRef.current);
      }
      setShowCards(false);
      gamePausedRef.current = false;
      return;
    }

    const conflictGroup = ['gravity', 'fly', 'spring'];
    if (conflictGroup.includes(skill.id)) {
      conflictGroup.forEach(id => {
        if (id !== skill.id) {
          delete activeSkillsRef.current[id];
        }
      });
    }

    if (activeSkillsRef.current[skill.id] && activeSkillsRef.current[skill.id].expires > now) {
      activeSkillsRef.current[skill.id].expires += skill.duration || 0;
    } else {
      activeSkillsRef.current[skill.id] = {
        expires: now + (skill.duration || 0),
        name: skill.name,
        icon: skill.icon
      };
    }

    setShowCards(false);
    gamePausedRef.current = false;
  };

  const watchRewardedAd = () => {
    adRewardGrantedRef.current = false;
    setShowAdPrompt(false);
    setAdOverlay('loading');

    // ✅ Integrates native AdMob wrapper seamlessly, falling back to desktop simulation automatically
    showRewardedAd(
      () => {
        adRewardGrantedRef.current = true;
        const internalCount = parseInt(localStorage.getItem('runner_daily_ads_count') || '0', 10) + 1;
        localStorage.setItem('runner_daily_ads_count', internalCount.toString());
        setDailyAdsUsed(internalCount);
        setHasUsedAdRevive(true);
        setAdOverlay(null);
        setShowResumingOverlay(true);
        lossSequenceStartedRef.current = false;

        obstaclesRef.current.length = 0;
        ufosRef.current.length = 0;

        const invSkillDef = SKILLS_REGISTRY.find(s => s.id === 'invisible');
        activeSkillsRef.current['invisible'] = {
          expires: Date.now() + 3000,
          name: invSkillDef ? invSkillDef.name : 'Invisibility',
          icon: invSkillDef ? invSkillDef.icon : '👻'
        };

        if (resumeOverlayTimerRef.current) {
          clearTimeout(resumeOverlayTimerRef.current);
        }

        resumeOverlayTimerRef.current = setTimeout(() => {
          setShowResumingOverlay(false);
          gamePausedRef.current = false;
          resumeOverlayTimerRef.current = null;
        }, 650);
      },
      () => {
        setAdOverlay(null);
        setShowResumingOverlay(false);
        handleSkipAdRevive();
      }
    );
  };

  const handleSkipAdRevive = () => {
    if (resumeOverlayTimerRef.current) {
      clearTimeout(resumeOverlayTimerRef.current);
      resumeOverlayTimerRef.current = null;
    }

    setShowResumingOverlay(false);
    setShowAdPrompt(false);
    enterGameOver(score);
  };

  const preloadGameplaySprites = (charId) => {
    const config = SPRITE_CONFIG_MAP[charId] || SPRITE_CONFIG_MAP['jumpy_hero'];
    const actions = [
      { name: 'run', frames: config.runFrames },
      { name: 'jump', frames: config.jumpFrames },
      { name: 'fly', frames: config.flyFrames }
    ];
    
    actions.forEach(action => {
      for (let i = 0; i < action.frames; i++) {
        const key = `${config.folder}_${action.name}_${i}`;
        if (!gameplaySpriteCacheRef.current[key]) {
          const img = new Image();
          img.src = `/assets/animations/${config.folder}/${action.name}/${i}.png`;
          img.onerror = () => {
            img.src = `/assets/animations/${config.folder}/idle/0.png`;
          };
          gameplaySpriteCacheRef.current[key] = img;
        }
      }
    });
  };

  const handleRestartRun = () => {
    obstaclesRef.current = [];
    coinsArrayRef.current = [];
    ufosRef.current = [];
    particlesRef.current = [];
    sonicWavesRef.current = []; 
    sprintTrailsRef.current = []; 
    explosionsRef.current = []; 
    shieldCountRef.current = 0;
    reviveCountRef.current = 0;
    flyEvadeTimerRef.current = 0;
    activeSkillsRef.current = {};
    autoSkillNextTriggerRef.current = Date.now() + (AUTO_SKILL_INTERVAL_MAP[selectedChar.id]?.interval || Infinity);
    
    nextSkillMilestoneRef.current = 800; 

    const startSkillIds = selectedChar.startSkills || [];
    startSkillIds.forEach((id) => {
      if (id === 'shield') {
        shieldCountRef.current = Math.min(5, shieldCountRef.current + 1);
      } else if (id === 'revive') {
        reviveCountRef.current = Math.min(2, reviveCountRef.current + 1);
      } else {
        const skillDef = SKILLS_REGISTRY.find((s) => s.id === id);
        if (skillDef) {
          activeSkillsRef.current[id] = {
            expires: Date.now() + (skillDef.duration || 8000),
            name: skillDef.name,
            icon: skillDef.icon
          };
        }
      }
    });
    
    setScore(0);
    setDistance(0);
    setCoins(0);
    setShieldCount(shieldCountRef.current);
    setReviveCount(reviveCountRef.current);
    setActiveSkills(Object.entries(activeSkillsRef.current).map(([id, v]) => ({ id, name: v.name, icon: v.icon })));
    setHasUsedAdRevive(false);
    setIsGameOverScreen(false);
    setShowAdPrompt(false);
    setShowResumingOverlay(false);
    lossSequenceStartedRef.current = false;

    if (resumeOverlayTimerRef.current) {
      clearTimeout(resumeOverlayTimerRef.current);
      resumeOverlayTimerRef.current = null;
    }

    gamePausedRef.current = false;
  };

  useEffect(() => {
    if (isGameOverScreen || !assetsLoaded || showCharSelect) return; 

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const logicalWidth = 800;
    const logicalHeight = 400;
    
    const isNativeRuntime = Capacitor.isNativePlatform();
    const dpr = Math.min(window.devicePixelRatio || 1, isNativeRuntime ? NATIVE_DPR_CAP : 2);
    const viewportWidth = canvas.clientWidth || logicalWidth;
    const viewportHeight = canvas.clientHeight || logicalHeight;
    const scale = Math.min(viewportWidth / logicalWidth, viewportHeight / logicalHeight);
    const offsetX = (viewportWidth - (logicalWidth * scale)) / 2;
    const offsetY = (viewportHeight - (logicalHeight * scale)) / 2;

    canvas.width = viewportWidth * dpr;
    canvas.height = viewportHeight * dpr;

    ctx.setTransform(
      scale * dpr,
      0,
      0,
      scale * dpr,
      offsetX * dpr,
      offsetY * dpr
    );

    let animationFrameId;
    let localScore = score; 
    let localDistance = distance; 
    let localCoins = coins;
    let isGameOver = false;

    let lastTime = performance.now();
    let lastHudUpdateTime = lastTime;
    const fpsInterval = 1000 / (isNativeRuntime ? NATIVE_TARGET_FPS : 60);

    let prevActiveIdsStr = '';
    let lastLoggedAction = '';

    let frameTickTimer = 0;
    let spriteFrameIndex = 0;

    const player = {
      x: 80,
      y: 200,          
      width: 64,       
      height: 64,      
      gravity: 0.6,
      velocity: 0,
      jumpStrength: -13,
      isGrounded: false,
      color: FALLBACK_COLOR_MAP[selectedChar.id] || playerColor || '#a855f7'
    };

    const groundY = 400 - 70; 
    const bgEffects = new BackgroundEffects(800, groundY);
    const obstacles = obstaclesRef.current;
    const coinsArray = coinsArrayRef.current;
    const ufos = ufosRef.current;
    
    setShieldCount(shieldCountRef.current);
    setReviveCount(reviveCountRef.current);

    let obstacleTimer = 0;
    let spawnRate = 120;
    let coinTimer = 0;
    let sonicTimer = 0;
    let nextUfoMilestone = localDistance > 0 ? Math.floor(localDistance / 800) * 800 + 800 : 800; 

    const isSkillActive = (id) => activeSkillsRef.current[id] && activeSkillsRef.current[id].expires > Date.now();

    const handleJump = () => {
      if (gamePausedRef.current || isGameOver) return;
      
      if (isSkillActive('fly')) {
        if (flyEvadeTimerRef.current === 0) {
          flyEvadeTimerRef.current = 25; 
        }
        return;
      }

      if (isSkillActive('gravity')) {
        player.velocity = player.y <= 10 ? 9 : -9; 
        player.isGrounded = false;
      } else if (player.isGrounded || isSkillActive('spring')) {
        player.velocity = player.jumpStrength;
        player.isGrounded = false;
      }
    };

    canvasClickHandler.current = handleJump;

    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleJump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const update = () => {
      if (isGameOver) return;

      animationFrameId = requestAnimationFrame(update);

      const currentTime = performance.now();
      const elapsed = currentTime - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = currentTime - (elapsed % fpsInterval);

      if (gamePausedRef.current) return;

      const now = Date.now();

      const autoSkillConfig = AUTO_SKILL_INTERVAL_MAP[selectedChar.id];
      if (autoSkillConfig && now >= autoSkillNextTriggerRef.current) {
        const skillDef = SKILLS_REGISTRY.find((s) => s.id === autoSkillConfig.id);
        if (skillDef) {
          activeSkillsRef.current[autoSkillConfig.id] = {
            expires: now + (skillDef.duration || 8000),
            name: skillDef.name,
            icon: skillDef.icon
          };
        }
        autoSkillNextTriggerRef.current = now + autoSkillConfig.interval;
      }

      const currentActive = [];
      const currentIds = [];
      Object.keys(activeSkillsRef.current).forEach(id => {
        if (activeSkillsRef.current[id].expires > now) {
          currentActive.push({
            id,
            name: activeSkillsRef.current[id].name,
            icon: activeSkillsRef.current[id].icon
          });
          currentIds.push(id);
        } else {
          delete activeSkillsRef.current[id];
        }
      });

      const currentIdsStr = currentIds.sort().join(',');
      if (currentIdsStr !== prevActiveIdsStr) {
        prevActiveIdsStr = currentIdsStr;
        setActiveSkills(currentActive);
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(
        scale * dpr,
        0,
        0,
        scale * dpr,
        offsetX * dpr,
        offsetY * dpr
      );
      ctx.save();

      if (shakeIntensityRef.current > 0.1) {
        const dx = (Math.random() - 0.5) * shakeIntensityRef.current;
        const dy = (Math.random() - 0.5) * shakeIntensityRef.current;
        ctx.translate(dx, dy);
        shakeIntensityRef.current *= 0.9; 
      }

      const rawMultiplier = 1 + Math.floor(localDistance / 200) * 0.05;
      const gameSpeedMultiplier = Math.min(rawMultiplier, 3.0); 

      if (isSkillActive('slow')) ctx.fillStyle = '#1e293b'; 
      else if (isSkillActive('gravity')) ctx.fillStyle = '#2e1065'; 
      else ctx.fillStyle = bgEffects.getSkyColor(Math.floor(localDistance)); 
      ctx.fillRect(0, 0, 800, 400);

      bgLayersRef.current.forEach((layer, layerIndex) => {
        const dynamicLayerSpeed = isSkillActive('slow') ? layer.speed * 0.6 : layer.speed;
        layer.x -= dynamicLayerSpeed * gameSpeedMultiplier;
        
        const imgHeight = 400 * BACKGROUND_ZOOM; 
        const scale = imgHeight / layer.img.height;
        const scaledWidth = layer.img.width * scale;
        const yOffset = 400 - imgHeight;

        if (layer.x <= -scaledWidth) {
          layer.x += scaledWidth; 
        }

        ctx.imageSmoothingEnabled = layerIndex !== 2;
        if (!isNativeRuntime) {
          ctx.imageSmoothingQuality = 'high';
        }

        if (scaledWidth > 0) {
          const drawX = Math.round(layer.x);
          const tileW = Math.ceil(scaledWidth) + 1;
          ctx.drawImage(layer.img, drawX, yOffset, tileW, imgHeight);
          ctx.drawImage(layer.img, drawX + Math.round(scaledWidth), yOffset, tileW, imgHeight);
        }
      });

      ctx.imageSmoothingEnabled = false;

      bgEffects.render(ctx, Math.floor(localDistance), isNativeRuntime);

      ctx.save();
      const playerCenterX = player.x + player.width / 2;
      const heightAboveGround = groundY - (player.y + player.height);
      const shadowScaleFactor = Math.max(0.3, 1 - heightAboveGround / 160);
      const shadowAlphaFactor = Math.max(0, 0.35 - heightAboveGround / 240);
      
      ctx.beginPath();
      ctx.ellipse(playerCenterX, groundY, player.width * 0.55 * shadowScaleFactor, player.width * 0.14 * shadowScaleFactor, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlphaFactor})`;
      ctx.fill();
      ctx.restore();

      if (isSkillActive('shrink')) {
        player.width = 32; player.height = 32;
      } else {
        player.width = 64; player.height = 64;
      }

      const hitbox = {
        width: player.width * 0.8,
        height: player.height * 0.8,
        x: player.x + (player.width * 0.1),
        y: player.y + (player.height * 0.1)
      };

      let runtimeAction = 'run';
      const spriteConfig = SPRITE_CONFIG_MAP[selectedChar.id] || SPRITE_CONFIG_MAP['jumpy_hero'];
      let activeMaxFrames = spriteConfig.runFrames;

      if (isSkillActive('fly')) {
        let flyOffsetY = 0;
        if (flyEvadeTimerRef.current > 0) {
          flyOffsetY = -Math.sin(((25 - flyEvadeTimerRef.current) / 25) * Math.PI) * 60;
          flyEvadeTimerRef.current--;
        }
        player.y = Math.min(player.y, groundY - 140 + flyOffsetY); 
        player.velocity = 0;
        player.isGrounded = true;
        runtimeAction = 'fly';
        activeMaxFrames = spriteConfig.flyFrames;
      } else if (isSkillActive('gravity')) {
        flyEvadeTimerRef.current = 0;
        player.velocity -= player.gravity; 
        player.y += player.velocity;
        if (player.y <= 0) { player.y = 0; player.velocity = 0; player.isGrounded = true; }
        runtimeAction = 'fly';
        activeMaxFrames = spriteConfig.flyFrames;
      } else {
        flyEvadeTimerRef.current = 0;
        player.velocity += player.gravity; 
        player.y += player.velocity;
        if (player.y + player.height >= groundY) {
          player.y = groundY - player.height; player.velocity = 0; player.isGrounded = true;
        }
        
        if (!player.isGrounded) {
          runtimeAction = 'jump';
          activeMaxFrames = spriteConfig.jumpFrames;
        }
      }

      frameTickTimer++;
      if (frameTickTimer >= 5) {
        spriteFrameIndex = (spriteFrameIndex + 1) % activeMaxFrames;
        frameTickTimer = 0;
      }

      if (import.meta.env.DEV && runtimeAction !== lastLoggedAction) {
        let emojiIcon = '🏃‍♂️';
        if (runtimeAction === 'jump') emojiIcon = '🦘';
        if (runtimeAction === 'fly') emojiIcon = '🚀';
        
        console.log(
          `%c${emojiIcon} STATE CHANGED ➡️ ${runtimeAction.toUpperCase()}`, 
          "color: #22d3ee; font-weight: 900; background-color: #0f172a; padding: 4px 8px; border-radius: 6px; border: 1px solid #06b6d4;"
        );
        lastLoggedAction = runtimeAction;
      }

      if (isSkillActive('sprint')) {
        sprintTrailsRef.current.push({
          x: player.x,
          y: player.y,
          action: runtimeAction,
          frameIndex: spriteFrameIndex
        });
        if (sprintTrailsRef.current.length > 5) {
          sprintTrailsRef.current.shift();
        }
      } else {
        sprintTrailsRef.current = [];
      }

      ctx.save();
      const auraPulseFactor = 1 + Math.sin(now / 140) * 0.15;
      const px = player.x + player.width / 2;
      const py = player.y + player.height / 2;
      const auraMaxRadius = player.width * 0.85;

      let assignedAuraStyle = null;
      if (isSkillActive('sprint')) assignedAuraStyle = 'rgba(239, 68, 68, 0.45)';
      else if (isSkillActive('sonic')) assignedAuraStyle = 'rgba(34, 211, 238, 0.35)';

      if (assignedAuraStyle) {
        ctx.beginPath();
        ctx.arc(px, py, auraMaxRadius * auraPulseFactor, 0, Math.PI * 2);
        if (isNativeRuntime) {
          ctx.fillStyle = assignedAuraStyle;
        } else {
          const auraGradient = ctx.createRadialGradient(px, py, auraMaxRadius * 0.2, px, py, auraMaxRadius * auraPulseFactor);
          auraGradient.addColorStop(0, assignedAuraStyle);
          auraGradient.addColorStop(0.6, hexToRgba(player.color, 0.05));
          auraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = auraGradient;
        }
        ctx.fill();
      }

      // ⚡ Dynamic Mobile Throttling: Reduces particle emissions dynamically to save CPU cycles on mobile WebView
      const isNative = isNativeRuntime;
      const baseChance = isNative ? 0.1 : 0.3;
      const sprintChance = isNative ? 0.32 : 0.85;

      if (Math.random() < baseChance || (isSkillActive('sprint') && Math.random() < sprintChance)) {
        const isSprinting = isSkillActive('sprint');
        particlesRef.current.push({
          x: player.x + (isSprinting ? 5 : Math.random() * player.width),
          y: player.y + (isSprinting ? Math.random() * player.height : player.height - Math.random() * 10),
          vx: isSprinting ? -7 - (Math.random() * 5) : -3 - (Math.random() * 2), 
          vy: isSprinting ? (Math.random() - 0.5) * 4 : -1 - Math.random() * 2,  
          radius: isSprinting ? Math.random() * 3.5 + 1.5 : Math.random() * 2 + 1,
          alpha: 1.0,
          color: isSprinting ? (Math.random() > 0.4 ? '#ef4444' : '#f97316') : player.color
        });
      }

      if (isSkillActive('sprint') && Math.random() < (isNative ? 0.12 : 0.4)) {
        particlesRef.current.push({
          x: player.x + player.width + 10,
          y: player.y + Math.random() * player.height,
          vx: -13 - Math.random() * 7,
          vy: 0,
          radius: Math.random() * 1.5 + 0.5,
          alpha: 0.65,
          color: '#ffffff'
        });
      }
      ctx.restore();

      if (shieldCountRef.current > 0) {
        ctx.save();
        const shieldRadius = 26 + (shieldCountRef.current * 4);
        const shieldColor = SHIELD_COLOR_MAP[selectedChar.id] || '#22d3ee';
        const cx = player.x + player.width / 2;
        const cy = player.y + player.height / 2;
        const baseAlpha = 0.15 + shieldCountRef.current * 0.06;

        if (!isNativeRuntime) {
          const gradient = ctx.createRadialGradient(cx, cy, shieldRadius * 0.3, cx, cy, shieldRadius);
          gradient.addColorStop(0, hexToRgba(shieldColor, 0));
          gradient.addColorStop(0.7, hexToRgba(shieldColor, baseAlpha));
          gradient.addColorStop(1, hexToRgba(shieldColor, 0));

          ctx.beginPath();
          ctx.arc(cx, cy, shieldRadius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(cx, cy, shieldRadius, 0, Math.PI * 2);
        ctx.strokeStyle = hexToRgba(shieldColor, 0.4 + shieldCountRef.current * 0.1);
        ctx.lineWidth = 2;
        if (!isNativeRuntime) {
          ctx.shadowBlur = 12;
          ctx.shadowColor = shieldColor;
        }
        ctx.stroke();
        ctx.restore();
      }

      if (!isNativeRuntime && isSkillActive('sprint') && sprintTrailsRef.current.length > 0) {
        sprintTrailsRef.current.forEach((trail, idx) => {
          ctx.save();
          ctx.globalAlpha = 0.07 * (idx + 1);
          if (!isNativeRuntime) {
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#ef4444';
          }

          const trailKey = `${spriteConfig.folder}_${trail.action}_${trail.frameIndex}`;
          let trailTexture = gameplaySpriteCacheRef.current[trailKey];
          
          if (trail.action === 'fly') {
            ctx.translate(trail.x + player.width / 2, trail.y + player.height / 2);
            if (trailTexture && trailTexture.complete && trailTexture.naturalWidth !== 0) {
              ctx.drawImage(trailTexture, -player.width / 2, -player.height / 2, player.width, player.height);
            } else {
              ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
              ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
            }
          } else {
            if (trailTexture && trailTexture.complete && trailTexture.naturalWidth !== 0) {
              ctx.drawImage(trailTexture, trail.x, trail.y, player.width, player.height);
            } else {
              ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
              ctx.fillRect(trail.x, trail.y, player.width, player.height);
            }
          }
          ctx.restore();
        });
      }

      ctx.save();
      if (!isNativeRuntime) {
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 6;
        ctx.shadowOffsetX = 2;
      }
      
      if (isSkillActive('invisible')) {
        ctx.globalAlpha = 0.4;
      }

      const textureKey = `${spriteConfig.folder}_${runtimeAction}_${spriteFrameIndex}`;
      let loadedFrameTexture = gameplaySpriteCacheRef.current[textureKey];

      if (!loadedFrameTexture) {
        loadedFrameTexture = new Image();
        loadedFrameTexture.src = `/assets/animations/${spriteConfig.folder}/${runtimeAction}/${spriteFrameIndex}.png`;
        loadedFrameTexture.onerror = () => {
          loadedFrameTexture.src = `/assets/animations/${spriteConfig.folder}/idle/0.png`;
        };
        gameplaySpriteCacheRef.current[textureKey] = loadedFrameTexture;
      }

      if (runtimeAction === 'fly') {
        ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
        
        if (loadedFrameTexture && loadedFrameTexture.complete && loadedFrameTexture.naturalWidth !== 0) {
          ctx.drawImage(loadedFrameTexture, -player.width / 2, -player.height / 2, player.width, player.height);
        } else {
          ctx.fillStyle = player.color;
          ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
        }
      } else {
        if (loadedFrameTexture && loadedFrameTexture.complete && loadedFrameTexture.naturalWidth !== 0) {
          ctx.drawImage(loadedFrameTexture, player.x, player.y, player.width, player.height);
        } else {
          ctx.fillStyle = player.color;
          ctx.fillRect(player.x, player.y, player.width, player.height);
        }
      }
      ctx.restore();

      // 🔊 --- SONIC WAVE BLAST --- 🔊
      if (isSkillActive('sonic')) {
        sonicTimer++;
        if (sonicTimer > 180) { 
          triggerShake(5); 
          playSFX('sonic-blast');

          sonicWavesRef.current.push({
            x: player.x + player.width - 10,
            y: player.y + player.height / 2,
            radius: 15,
            maxRadius: 360,
            speed: 14
          });

          if (obstacles.length > 0) { spawnParticles(obstacles[0].x, obstacles[0].y, '#ef4444'); obstacles.splice(0, 1); }
          if (ufos.length > 0) { spawnParticles(ufos[0].x, ufos[0].y, '#38bdf8'); ufos.splice(0, 1); }
          sonicTimer = 0;
        }
      }

      for (let w = sonicWavesRef.current.length - 1; w >= 0; w--) {
        const wave = sonicWavesRef.current[w];
        wave.radius += wave.speed;
        
        const waveOpacity = Math.max(0, 1 - (wave.radius / wave.maxRadius));
        if (waveOpacity <= 0 || wave.radius >= wave.maxRadius) {
          sonicWavesRef.current.splice(w, 1);
          continue;
        }

        ctx.save();
        if (!isNativeRuntime) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#22d3ee';
        }
        
        ctx.strokeStyle = `rgba(34, 211, 238, ${waveOpacity})`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();

        if (!isNativeRuntime) {
          ctx.strokeStyle = `rgba(14, 165, 233, ${waveOpacity * 0.4})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(wave.x, wave.y, Math.max(5, wave.radius - 25), -Math.PI / 2, Math.PI / 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      for (let e = explosionsRef.current.length - 1; e >= 0; e--) {
        const exp = explosionsRef.current[e];
        exp.radius += 5.5; 
        exp.alpha -= 0.045; 

        if (exp.alpha <= 0 || exp.radius >= exp.maxRadius) {
          explosionsRef.current.splice(e, 1);
          continue;
        }

        ctx.save();
        if (!isNativeRuntime) {
          ctx.shadowBlur = 25;
          ctx.shadowColor = exp.color || '#fbbf24';
          ctx.globalCompositeOperation = 'screen';
        }

        ctx.strokeStyle = exp.color === '#ef4444' 
          ? `rgba(239, 68, 68, ${exp.alpha})` 
          : `rgba(251, 191, 36, ${exp.alpha})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 255, 255, ${exp.alpha * 0.7})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(exp.x, exp.y, Math.max(2, exp.radius * 0.65), 0, Math.PI * 2);
        ctx.stroke();

        if (!isNativeRuntime) {
          const fillGradient = ctx.createRadialGradient(exp.x, exp.y, 2, exp.x, exp.y, exp.radius);
          fillGradient.addColorStop(0, `rgba(255, 255, 255, ${exp.alpha * 0.8})`);
          fillGradient.addColorStop(0.3, exp.color === '#ef4444' ? `rgba(220, 38, 38, ${exp.alpha * 0.4})` : `rgba(249, 115, 22, ${exp.alpha * 0.4})`);
          fillGradient.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.beginPath();
          ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
          ctx.fillStyle = fillGradient;
          ctx.fill();
        }
        ctx.restore();
      }

      if (Math.floor(localDistance) >= nextUfoMilestone) {
        nextUfoMilestone += 800;
        ufos.push({
          x: 800 + 40,
          y: 60 + Math.random() * 80,
          width: 50, height: 25, speed: 9, pulseAngle: 0
        });
      }

      for (let i = ufos.length - 1; i >= 0; i--) {
        const ufo = ufos[i];
        ufo.x -= (isSkillActive('slow') ? ufo.speed * 0.5 : ufo.speed) * gameSpeedMultiplier;
        ufo.pulseAngle += 0.1;

        ctx.save();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath(); ctx.arc(ufo.x + ufo.width/2, ufo.y + ufo.height/3, ufo.width/4, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath(); ctx.ellipse(ufo.x + ufo.width/2, ufo.y + ufo.height/2, ufo.width/2, ufo.height/3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = Math.sin(ufo.pulseAngle) > 0 ? '#ef4444' : '#f59e0b';
        ctx.beginPath();
        ctx.arc(ufo.x + ufo.width/3, ufo.y + ufo.height/2, 3, 0, Math.PI*2);
        ctx.arc(ufo.x + ufo.width/2, ufo.y + ufo.height/2, 3, 0, Math.PI*2);
        ctx.arc(ufo.x + (ufo.width/3)*2, ufo.y + ufo.height/2, 3, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();

        if (hitbox.x < ufo.x + ufo.width && hitbox.x + hitbox.width > ufo.x && hitbox.y < ufo.y + ufo.height && hitbox.y + hitbox.height > ufo.y) {
          if (isSkillActive('invisible')) {
            continue; 
          }
          
          playSFX('bump');

          if (isSkillActive('sprint') || flyEvadeTimerRef.current > 0) { 
            spawnParticles(ufo.x, ufo.y, '#38bdf8'); 
            ufos.splice(i, 1); 
            continue; 
          }
          
          triggerShake(8); 
          if (shieldCountRef.current > 0) { shieldCountRef.current -= 1; setShieldCount(shieldCountRef.current); spawnParticles(ufo.x, ufo.y, SHIELD_COLOR_MAP[selectedChar.id] || '#22d3ee'); ufos.splice(i, 1); continue; }
          
          if (reviveCountRef.current > 0) {
            reviveCountRef.current -= 1; setReviveCount(reviveCountRef.current); ufos.length = 0; obstacles.length = 0;
            const invSkillDef = SKILLS_REGISTRY.find(s => s.id === 'invisible');
            activeSkillsRef.current['invisible'] = { 
              expires: Date.now() + 3000, 
              name: invSkillDef ? invSkillDef.name : 'Invisibility', 
              icon: invSkillDef ? invSkillDef.icon : '👻' 
            };
            continue;
          }

          cancelAnimationFrame(animationFrameId);
          const dailyAdsWatched = parseInt(localStorage.getItem('runner_daily_ads_count') || '0', 10);
          if (!hasUsedAdRevive && dailyAdsWatched < MAX_DAILY_ADS) {
            gamePausedRef.current = true;
            startLossSequence();
            setShowAdPrompt(true);
          } else {
            isGameOver = true;
            enterGameOver(Math.floor(localScore));
          }
          return;
        }
        if (ufo.x + ufo.width < 0) ufos.splice(i, 1);
      }

      obstacleTimer += gameSpeedMultiplier;
      const currentSpawnRate = isSkillActive('slow') ? spawnRate * 1.5 : spawnRate;
      
      if (obstacleTimer > currentSpawnRate) {
        let obsSize = 48; 
        let obsType = obstacleManagerRef.current.getRandomType(); 
        let obsBaseSpeed = 7;
        let yPos = groundY - obsSize;

        if (obsType === 'spikeyball') {
          const altitudeRoll = Math.random();
          if (altitudeRoll < 0.33) {
            yPos = groundY - obsSize; 
          } else if (altitudeRoll < 0.66) {
            yPos = groundY - obsSize - 45; 
          } else {
            yPos = groundY - obsSize - 95; 
          }
        } else {
          yPos = groundY - obsSize + 21;
        }

        obstacles.push({
          x: 800,
          y: yPos,
          baseY: yPos, 
          width: obsSize,
          height: obsSize,
          speed: obsBaseSpeed,
          type: obsType,
          bobOffset: Math.random() * Math.PI * 2 
        });

        if (obsType !== 'spikeyball' && Math.random() < 0.35) {
          const secondaryGap = 65 + Math.random() * 45;
          let secType = Math.random() > 0.5 ? 'wood' : 'rock';
          
          obstacles.push({
            x: 800 + secondaryGap,
            y: groundY - obsSize + 21,
            baseY: groundY - obsSize + 21,
            width: obsSize,
            height: obsSize,
            speed: obsBaseSpeed,
            type: secType
          });
        }
        
        obstacleTimer = 0;
        if (spawnRate > 65 && Math.random() > 0.7) spawnRate -= 1; 
      }

      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        const dynamicSpeed = (isSkillActive('slow') ? obs.speed * 0.6 : obs.speed) * gameSpeedMultiplier;
        obs.x -= dynamicSpeed; 

        if (obs.type === 'spikeyball' && obs.baseY < groundY - obs.height) {
          obs.y = obs.baseY + Math.sin((now / 180) + obs.bobOffset) * 10;
        }
        
        if (obs.type === 'spikeyball') {
          ctx.save();
          const obsCenterX = obs.x + obs.width / 2;
          const obsHeightAboveGround = groundY - (obs.y + obs.height);
          const obsShadowScale = Math.max(0.2, 1 - obsHeightAboveGround / 160);
          const obsShadowAlpha = Math.max(0, 0.32 - obsHeightAboveGround / 240);
          
          ctx.beginPath();
          ctx.ellipse(obsCenterX, groundY, obs.width * 0.5 * obsShadowScale, obs.width * 0.12 * obsShadowScale, 0, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 0, 0, ${obsShadowAlpha})`;
          ctx.fill();
          ctx.restore();
        }
        
        ctx.save();
        const assetImg = obstacleManagerRef.current.getImage(obs.type);
        if (assetImg && assetImg.complete) {
          ctx.drawImage(assetImg, obs.x, obs.y, obs.width, obs.height);
        } else {
          ctx.fillStyle = obs.type === 'spikeyball' ? '#a855f7' : '#b45309';
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        }
        ctx.restore();

        if (hitbox.x < obs.x + obs.width && hitbox.x + hitbox.width > obs.x && hitbox.y < obs.y + obs.height && hitbox.y + hitbox.height > obs.y) {
          if (isSkillActive('invisible')) {
            continue; 
          }
          
          playSFX('bump');

          if (isSkillActive('sprint') || flyEvadeTimerRef.current > 0) { 
            spawnParticles(obs.x, obs.y, '#f59e0b', 6); 
            obstacles.splice(i, 1); 
            continue; 
          }
          
          triggerShake(8); 
          if (shieldCountRef.current > 0) { shieldCountRef.current -= 1; setShieldCount(shieldCountRef.current); spawnParticles(obs.x, obs.y, SHIELD_COLOR_MAP[selectedChar.id] || '#22d3ee'); obstacles.splice(i, 1); continue; }
          
          if (reviveCountRef.current > 0) {
            reviveCountRef.current -= 1; setReviveCount(reviveCountRef.current); obstacles.length = 0; ufos.length = 0;
            const invSkillDef = SKILLS_REGISTRY.find(s => s.id === 'invisible');
            activeSkillsRef.current['invisible'] = { 
              expires: Date.now() + 3000, 
              name: invSkillDef ? invSkillDef.name : 'Invisibility', 
              icon: invSkillDef ? invSkillDef.icon : '👻' 
            };
            continue;
          }

          cancelAnimationFrame(animationFrameId);
          const dailyAdsWatched = parseInt(localStorage.getItem('runner_daily_ads_count') || '0', 10);
          if (!hasUsedAdRevive && dailyAdsWatched < MAX_DAILY_ADS) {
            gamePausedRef.current = true;
            startLossSequence();
            setShowAdPrompt(true);
          } else {
            isGameOver = true;
            enterGameOver(Math.floor(localScore));
          }
          return;
        }
        if (obs.x + obs.width < 0) obstacles.splice(i, 1);
      }

      coinTimer++;
      const currentCoinInterval = isSkillActive('lucky') ? 18 : 50;
      if (coinTimer > currentCoinInterval) {
        coinTimer = 0;
        const patternSelector = Math.random();
        const baseHeight = groundY - 45 - Math.random() * 85;

        if (patternSelector < 0.35) {
          for (let j = 0; j < 4; j++) {
            const calculatedY = baseHeight - Math.sin((j / 3) * Math.PI) * 55;
            coinsArray.push({ x: 800 + (j * 32), y: calculatedY, radius: 8 });
          }
        } else if (patternSelector < 0.70) {
          for (let j = 0; j < 3; j++) {
            coinsArray.push({ x: 800 + (j * 30), y: baseHeight, radius: 8 });
          }
        } else {
          coinsArray.push({ x: 800, y: baseHeight, radius: 8 });
          coinsArray.push({ x: 830, y: baseHeight - 35, radius: 8 });
          coinsArray.push({ x: 860, y: baseHeight, radius: 8 });
        }
      }

      for (let i = coinsArray.length - 1; i >= 0; i--) {
        const coin = coinsArray[i]; 
        coin.x -= 5 * gameSpeedMultiplier;
        if (isSkillActive('magnet')) {
          const dx = (player.x + player.width / 2) - coin.x; const dy = (player.y + player.height / 2) - coin.y;
          coin.x += dx * 0.14; coin.y += dy * 0.14;
        }
        
        ctx.save();
        ctx.font = `${coin.radius * 2.5}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🪙', coin.x, coin.y);
        ctx.restore();

        if (player.x < coin.x + coin.radius && player.x + player.width > coin.x - coin.radius && player.y < coin.y + coin.radius && player.y + player.height > coin.y - coin.radius) {
          localCoins += (isSkillActive('double') ? 2 : 1);
          localScore += (isSkillActive('double') ? 50 : 25);
          
          triggerShake(1.5); 
          spawnParticles(coin.x, coin.y, '#fbbf24', 5);
          spawnParticles(coin.x, coin.y, '#ffffff', 2);

          playSFX('coin');

          coinsArray.splice(i, 1);
          continue;
        }
        if (coin.x < 0) coinsArray.splice(i, 1);
      }

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx; p.y += p.vy; p.alpha -= 0.03;
        ctx.save();
        ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        if (p.alpha <= 0) particlesRef.current.splice(i, 1);
      }

      const maxParticles = isNativeRuntime ? NATIVE_MAX_PARTICLES : DESKTOP_MAX_PARTICLES;
      if (particlesRef.current.length > maxParticles) {
        particlesRef.current.splice(0, particlesRef.current.length - maxParticles);
      }

      const baseDistanceStep = isSkillActive('sprint') ? 0.4 : 0.15;
      localDistance += baseDistanceStep * gameSpeedMultiplier;

      const baseScoreStep = isSkillActive('multiplier') ? 0.6 : 0.2;
      localScore += baseScoreStep * gameSpeedMultiplier;

      if (currentTime - lastHudUpdateTime >= HUD_UPDATE_INTERVAL) {
        lastHudUpdateTime = currentTime;
        setCoins(localCoins);
        setDistance(Math.floor(localDistance));
        setScore(Math.floor(localScore));
      }

      if (localScore >= nextSkillMilestoneRef.current) {
        nextSkillMilestoneRef.current += 800; 
        triggerCardSelection();
      }

      ctx.restore(); 
    };

    update();

    return () => { 
      window.removeEventListener('keydown', handleKeyDown); 
      cancelAnimationFrame(animationFrameId); 
    };
  }, [onMainMenu, playerColor, adOverlay, hasUsedAdRevive, isGameOverScreen, assetsLoaded, showCharSelect, selectedChar]); 

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden flex flex-col items-center justify-center">
      
      {assetsLoaded && showCharSelect && (
        <div className="absolute inset-0 z-50 w-full h-full">
          <CharacterSelect 
            userId={userId}
            userEmail={userEmail}
            onSelectCharacter={(char) => setSelectedChar(char)}
            onBack={onMainMenu}
            onStartGame={() => {
              preloadGameplaySprites(selectedChar.id); 
              handleRestartRun();
              setShowCharSelect(false); 
            }}
          />
        </div>
      )}

      {!assetsLoaded && (
        <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center z-40 gap-3">
          <div className="w-10 h-10 border-4 border-t-cyan-400 border-white/10 rounded-full animate-spin" />
          <p className="font-mono text-xs tracking-widest text-slate-400 uppercase animate-pulse">Preloading Level Core Asset Bundles...</p>
        </div>
      )}

      {/* Game HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none px-4 py-2 z-10 text-[10px] sm:text-xs md:text-sm font-bold tracking-wide [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-3">
          <div className="text-cyan-400">🚩 DISTANCE: <span className="text-white">{distance}m</span></div>
          {shieldCount > 0 && (
            <div className="flex items-center gap-1 bg-cyan-600 text-white border border-cyan-400/40 px-2 py-0.5 rounded-md text-[9px] sm:text-[11px] font-black shadow-md">🛡️ {shieldCount}/5</div>
          )}
          {reviveCount > 0 && (
            <div className="flex items-center gap-1 bg-rose-600 text-white border border-rose-400/40 px-2 py-0.5 rounded-md text-[9px] sm:text-[11px] font-black shadow-md">❤️ {reviveCount}/2</div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1 max-w-[40%] justify-center pointer-events-none">
          {activeSkills.map((sk) => {
            const isImageIcon = typeof sk.icon === 'string' && (sk.icon.includes('/') || sk.icon.includes('.'));
            return (
              <div 
                key={sk.id} 
                className="w-6 h-6 sm:w-7 sm:h-7 border-1 bg-slate-950/20 flex items-center justify-center bg-cyan-600 text-white border border-cyan-400/40 animate-pulse text-sm sm:text-base shadow-md"
              >
                {isImageIcon ? (
                  <img src={`${sk.icon}`} alt={sk.name} className="w-full h-full object-contain select-none pointer-events-none" />
                ) : (
                  <span className="text-xs sm:text-sm select-none pointer-events-none filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                    {sk.icon}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 sm:gap-6">
          <div className="text-yellow-400">SCORE: <span className="text-white">{score}</span></div>
          <div className="text-amber-400">🪙 COINS: <span className="text-white">{coins}</span></div>
        </div>
      </div>

      {/* CANVAS ELEMENT */}
      <canvas
        ref={canvasRef}
        onClick={() => canvasClickHandler.current && canvasClickHandler.current()}
        className="w-full h-full bg-slate-950 touch-none cursor-pointer"
      />

      {/* 🏅 LIVE CLOUD LEADERBOARD OVERLAY */}
      <LeaderboardOverlay isGameOverScreen={isGameOverScreen} />

      {/* 🎯 SKILL CARD CHOOSE MODAL OVERLAY */}
      <SkillSelectionOverlay
        showCards={showCards}
        randomCards={randomCards}
        onSelectSkill={handleSelectSkill}
      />

      {/* 💀 RUN COMPLETED PANEL OVERLAY */}
      <RunCompletedOverlay
        isGameOverScreen={isGameOverScreen}
        score={score}
        distance={distance}
        coins={coins}
        highScores={highScores}
        rank={calculatedRank} 
        onRestart={() => {
          setCalculatedRank(null); 
          preloadGameplaySprites(selectedChar.id);
          handleRestartRun();
        }}
        onSelectCharacter={() => {
          setCalculatedRank(null);
          setIsGameOverScreen(false);
          setShowCharSelect(true);
        }}
        onMainMenu={() => {
          setCalculatedRank(null);
          onMainMenu();
        }}
      />

      {/* REWARDED VIDEO ADS INTERCEPTION OVERLAY */}
      <AdPromptOverlay
        showAdPrompt={showAdPrompt}
        adOverlay={adOverlay}
        hasUsedAdRevive={hasUsedAdRevive}
        dailyAdsUsed={dailyAdsUsed}
        maxDailyAds={MAX_DAILY_ADS}
        isGameOverScreen={isGameOverScreen}
        onWatchAd={watchRewardedAd}
        onSkipAd={handleSkipAdRevive}
      />

      {/* FAKE AD OVERLAY */}
      <FakeAdOverlay 
        adOverlay={adOverlay} 
        adCountdown={adCountdown} 
      />

      {showResumingOverlay && (
        <div className="absolute inset-0 z-[65] flex items-center justify-center pointer-events-none">
          <div className="px-4 py-2 rounded-lg bg-slate-900/85 border border-cyan-300/50 shadow-lg">
            <p className="text-cyan-100 text-xs sm:text-sm font-black tracking-wide uppercase">Resuming...</p>
          </div>
        </div>
      )}

      {import.meta.env.DEV && (
        <div className="absolute top-2 right-2 z-[70] bg-black/70 text-white text-[10px] font-mono px-2 py-1 rounded border border-white/20 pointer-events-none">
          Ad Status: {adDebugStatus === 'google-hook-ready' ? 'SDK Loaded' : adDebugStatus === 'checking' ? 'Checking' : 'SDK Missing'}
        </div>
      )}
      
      {/* 🔐 UNIFIED RUNNER PROFILE & PROGRESS LINKING DASHBOARD */}
      <UserProfileModal
        isOpen={showAuthForm}
        onClose={() => setShowAuthForm(false)}
        userId={userId}
        userEmail={userEmail}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        handleEmailAuth={handleEmailAuth}
        handleGoogleLogin={handleGoogleLogin}
        handleLogout={handleLogout}
      />
      
    </div>
  );
}