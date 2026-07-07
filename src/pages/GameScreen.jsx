import React, { useEffect, useRef, useState } from 'react';
import CharacterSelect from './CharacterSelect'; 
import Button from '../components/Button';
import { SKILLS_REGISTRY } from '../skillsData';
import { BackgroundEffects } from '../utils/BackgroundEffects';
import { ObstacleManager } from '../utils/ObstacleManager';

// Plain static public paths definition
const farCityImg = '/assets/far-bg.png';
const midCityImg = '/assets/mid-bg.png';
const nearCityImg = '/assets/near-bg.png';

// --- CONFIGURATION TUNING ---
const MAX_DAILY_ADS = 3;
const BACKGROUND_ZOOM = 1.1; 

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
// throughout the run (in addition to being granted at the very start).
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
  const [hasUsedAdRevive, setHasUsedAdRevive] = useState(false);
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [isGameOverScreen, setIsGameOverScreen] = useState(false);
  
  // Asset Pipelines Sync State
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [dailyAdsUsed, setDailyAdsUsed] = useState(0);
  const adRewardGrantedRef = useRef(false); 

  // Refs for loop management
  const gamePausedRef = useRef(false);
  const nextSkillMilestoneRef = useRef(400); 

  const shieldCountRef = useRef(0);
  const reviveCountRef = useRef(0);
  const shakeIntensityRef = useRef(0);
  
  // Ref tracker for active flying dodge maneuvers
  const flyEvadeTimerRef = useRef(0);

  // Tracks when each character's recurring default skill should next re-fire
  const autoSkillNextTriggerRef = useRef(0);

  // Dictionary collection to map multi-skill stacking streams: { [skillId]: { expires, name, icon } }
  const activeSkillsRef = useRef({});

  const obstaclesRef = useRef([]);
  const coinsArrayRef = useRef([]);
  const ufosRef = useRef([]);
  const particlesRef = useRef([]); 

  // --- EXTERNAL SYSTEM MANAGERS AND GRAPHICS BUFFERS ---
  const bgLayersRef = useRef([]);
  const obstacleManagerRef = useRef(new ObstacleManager());

  const canvasClickHandler = useRef(null);

  // High-performance image sequence frame asset cache loader mapping context
  const gameplaySpriteCacheRef = useRef({});

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
  }, []);

  // --- CONSOLIDATED GRAPHICS PRELOADER PIPELINE ---
  useEffect(() => {
    const far = new Image(); far.src = farCityImg;
    const mid = new Image(); mid.src = midCityImg;
    const near = new Image(); near.src = nearCityImg;

    let bgsLoaded = false;
    let bgCount = 0;

    const verifyFinalSetup = () => {
      if (bgsLoaded && obstacleManagerRef.current.isLoaded) {
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

  // --- CLEAN AD REWARD DELIVERY EFFECT ---
  useEffect(() => {
    if (adOverlay === 'playing' && adCountdown === 0 && !adRewardGrantedRef.current) {
      adRewardGrantedRef.current = true; 

      const internalCount = parseInt(localStorage.getItem('runner_daily_ads_count') || '0', 10) + 1;
      localStorage.setItem('runner_daily_ads_count', internalCount.toString());
      
      setDailyAdsUsed(internalCount);
      setHasUsedAdRevive(true);
      setAdOverlay(null);

      obstaclesRef.current.length = 0;
      ufosRef.current.length = 0;
      
      activeSkillsRef.current['invisible'] = {
        expires: Date.now() + 3000,
        name: 'Ghost Walk',
        icon: '👻'
      };
      gamePausedRef.current = false;
    }
  }, [adCountdown, adOverlay]);

  const saveHighScore = (finalScore) => {
    const currentScores = JSON.parse(localStorage.getItem('runner_high_scores')) || [];
    const updated = [...currentScores, finalScore]
      .sort((a, b) => b - a)
      .slice(0, 3); 
    localStorage.setItem('runner_high_scores', JSON.stringify(updated));
    setHighScores(updated);
  };

  const triggerShake = (intensity) => {
    shakeIntensityRef.current = intensity;
    setShakeIntensity(intensity);
  };

  const spawnParticles = (x, y, color, count = 8) => {
    for (let i = 0; i < count; i++) {
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
      triggerShake(12); 
      obstacles.forEach(obs => {
        spawnParticles(obs.x, obs.y, '#fbbf24', 6);
        coinsArray.push({ x: obs.x, y: obs.y, radius: 8 });
      });
      obstacles.length = 0;
      ufosRef.current.forEach(ufo => {
        spawnParticles(ufo.x, ufo.y, '#fbbf24', 12);
        coinsArray.push({ x: ufo.x, y: ufo.y, radius: 10 });
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

    let extraDuration = skill.duration || 0;
    const conflictGroup = ['gravity', 'fly', 'spring'];

    if (conflictGroup.includes(skill.id)) {
      conflictGroup.forEach(id => {
        if (id !== skill.id) {
          delete activeSkillsRef.current[id];
        }
      });
    }

    if (activeSkillsRef.current[skill.id] && activeSkillsRef.current[skill.id].expires > now) {
      activeSkillsRef.current[skill.id].expires += extraDuration;
    } else {
      activeSkillsRef.current[skill.id] = {
        expires: now + extraDuration,
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

    setTimeout(() => {
      setAdOverlay('playing');
      setAdCountdown(5);
    }, 1000);
  };

  const handleSkipAdRevive = () => {
    setShowAdPrompt(false);
    saveHighScore(score);
    setIsGameOverScreen(true);
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
    shieldCountRef.current = 0;
    reviveCountRef.current = 0;
    flyEvadeTimerRef.current = 0;
    activeSkillsRef.current = {};
    autoSkillNextTriggerRef.current = Date.now() + (AUTO_SKILL_INTERVAL_MAP[selectedChar.id]?.interval || Infinity);
    
    nextSkillMilestoneRef.current = 400; 

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
    gamePausedRef.current = false;
  };

  useEffect(() => {
    if (isGameOverScreen || !assetsLoaded || showCharSelect) return; 

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 800 * dpr;
    canvas.height = 400 * dpr;

    ctx.scale(dpr, dpr);

    let animationFrameId;
    let localScore = score; 
    let localDistance = distance; 
    let localCoins = coins;
    let isGameOver = false;

    let lastTime = performance.now();
    const fpsInterval = 1000 / 60;

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

      ctx.clearRect(0, 0, 800, 400);
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
        ctx.imageSmoothingQuality = 'high';

        if (scaledWidth > 0) {
          const drawX = Math.round(layer.x);
          const tileW = Math.ceil(scaledWidth) + 1;
          ctx.drawImage(layer.img, drawX, yOffset, tileW, imgHeight);
          ctx.drawImage(layer.img, drawX + Math.round(scaledWidth), yOffset, tileW, imgHeight);
        }
      });

      ctx.imageSmoothingEnabled = false;

      bgEffects.render(ctx, Math.floor(localDistance));

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

      if (runtimeAction !== lastLoggedAction) {
        let emojiIcon = '🏃‍♂️';
        if (runtimeAction === 'jump') emojiIcon = '🦘';
        if (runtimeAction === 'fly') emojiIcon = '🚀';
        
        console.log(
          `%c${emojiIcon} STATE CHANGED ➡️ ${runtimeAction.toUpperCase()}`, 
          "color: #22d3ee; font-weight: 900; background-color: #0f172a; padding: 4px 8px; border-radius: 6px; border: 1px solid #06b6d4;"
        );
        lastLoggedAction = runtimeAction;
      }

      if (shieldCountRef.current > 0) {
        ctx.save();
        const shieldRadius = 26 + (shieldCountRef.current * 4);
        const shieldColor = SHIELD_COLOR_MAP[selectedChar.id] || '#22d3ee';
        const cx = player.x + player.width / 2;
        const cy = player.y + player.height / 2;
        const baseAlpha = 0.15 + shieldCountRef.current * 0.06;

        const gradient = ctx.createRadialGradient(cx, cy, shieldRadius * 0.3, cx, cy, shieldRadius);
        gradient.addColorStop(0, hexToRgba(shieldColor, 0));
        gradient.addColorStop(0.7, hexToRgba(shieldColor, baseAlpha));
        gradient.addColorStop(1, hexToRgba(shieldColor, 0));

        ctx.beginPath();
        ctx.arc(cx, cy, shieldRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, shieldRadius, 0, Math.PI * 2);
        ctx.strokeStyle = hexToRgba(shieldColor, 0.4 + shieldCountRef.current * 0.1);
        ctx.lineWidth = 2; ctx.shadowBlur = 12; ctx.shadowColor = shieldColor;
        ctx.stroke();
        ctx.restore();
      }

      ctx.save();
      ctx.shadowBlur = 15; ctx.shadowOffsetY = 6; ctx.shadowOffsetX = 2;
      
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

      if (loadedFrameTexture && loadedFrameTexture.complete && loadedFrameTexture.naturalWidth !== 0) {
        ctx.drawImage(loadedFrameTexture, player.x, player.y, player.width, player.height);
      } else {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
      }
      ctx.restore();

      if (isSkillActive('sonic')) {
        sonicTimer++;
        if (sonicTimer > 180) { 
          triggerShake(5); 
          ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 4; ctx.beginPath();
          ctx.arc(player.x + player.width, player.y + player.height/2, 60, -Math.PI/2, Math.PI/2);
          ctx.stroke();
          if (obstacles.length > 0) { spawnParticles(obstacles[0].x, obstacles[0].y, '#ef4444'); obstacles.splice(0, 1); }
          if (ufos.length > 0) { spawnParticles(ufos[0].x, ufos[0].y, '#38bdf8'); ufos.splice(0, 1); }
          sonicTimer = 0;
        }
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
          if (isSkillActive('sprint') || flyEvadeTimerRef.current > 0) { 
            spawnParticles(ufo.x, ufo.y, '#38bdf8'); 
            ufos.splice(i, 1); 
            continue; 
          }
          
          triggerShake(8); 
          if (shieldCountRef.current > 0) { shieldCountRef.current -= 1; setShieldCount(shieldCountRef.current); spawnParticles(ufo.x, ufo.y, SHIELD_COLOR_MAP[selectedChar.id] || '#22d3ee'); ufos.splice(i, 1); continue; }
          if (reviveCountRef.current > 0) {
            reviveCountRef.current -= 1; setReviveCount(reviveCountRef.current); ufos.length = 0; obstacles.length = 0;
            activeSkillsRef.current['invisible'] = { expires: Date.now() + 3000, name: 'Ghost Walk', icon: '👻' };
            continue;
          }

          cancelAnimationFrame(animationFrameId);
          const dailyAdsWatched = parseInt(localStorage.getItem('runner_daily_ads_count') || '0', 10);
          if (!hasUsedAdRevive && dailyAdsWatched < MAX_DAILY_ADS) {
            gamePausedRef.current = true;
            setShowAdPrompt(true);
          } else {
            isGameOver = true;
            saveHighScore(Math.floor(localScore));
            setIsGameOverScreen(true);
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
          if (isSkillActive('sprint') || flyEvadeTimerRef.current > 0) { 
            spawnParticles(obs.x, obs.y, '#f59e0b', 6); 
            obstacles.splice(i, 1); 
            continue; 
          }
          
          triggerShake(8); 
          if (shieldCountRef.current > 0) { shieldCountRef.current -= 1; setShieldCount(shieldCountRef.current); spawnParticles(obs.x, obs.y, SHIELD_COLOR_MAP[selectedChar.id] || '#22d3ee'); obstacles.splice(i, 1); continue; }
          if (reviveCountRef.current > 0) {
            reviveCountRef.current -= 1; setReviveCount(reviveCountRef.current); obstacles.length = 0; ufos.length = 0;
            activeSkillsRef.current['invisible'] = { expires: Date.now() + 3000, name: 'Ghost Walk', icon: '👻' };
            continue;
          }

          cancelAnimationFrame(animationFrameId);
          const dailyAdsWatched = parseInt(localStorage.getItem('runner_daily_ads_count') || '0', 10);
          if (!hasUsedAdRevive && dailyAdsWatched < MAX_DAILY_ADS) {
            gamePausedRef.current = true;
            setShowAdPrompt(true);
          } else {
            isGameOver = true;
            saveHighScore(Math.floor(localScore));
            setIsGameOverScreen(true);
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

          setCoins(localCoins);
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

      const baseDistanceStep = isSkillActive('sprint') ? 0.4 : 0.15;
      localDistance += baseDistanceStep * gameSpeedMultiplier;
      setDistance(Math.floor(localDistance));

      const baseScoreStep = isSkillActive('multiplier') ? 0.6 : 0.2;
      localScore += baseScoreStep * gameSpeedMultiplier;
      setScore(Math.floor(localScore));

      if (localScore >= nextSkillMilestoneRef.current) {
        nextSkillMilestoneRef.current += 400; 
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
    <div className="relative w-full max-w-[1400px] h-full lg:h-auto lg:aspect-[2/1] bg-slate-950 border border-white/10 shadow-2xl overflow-hidden flex flex-col items-center justify-center">
      
      {assetsLoaded && showCharSelect && (
        <div className="absolute inset-0 z-50 w-full h-full">
          <CharacterSelect 
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
          {activeSkills.map((sk) => (
            <div key={sk.id} className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center bg-cyan-600 text-white rounded-full border border-cyan-400/40 animate-pulse text-sm sm:text-base shadow-md">
              <span>{sk.icon}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-4 sm:gap-6">
          <div className="text-yellow-400">SCORE: <span className="text-white">{score}</span></div>
          <div className="text-amber-400">🪙 COINS: <span className="text-white">{coins}</span></div>
        </div>
      </div>

      {/* FLUID CANVAS ELEMENT */}
      <canvas
        ref={canvasRef}
        onClick={() => canvasClickHandler.current && canvasClickHandler.current()}
        className="w-full object-contain bg-slate-950 touch-none cursor-pointer"
      />

      {/* 🏅 LEADERBOARD OVERLAY */}
      {highScores.length > 0 && !isGameOverScreen && (
        <div className="absolute right-4 top-16 bg-slate-950/80 border border-white/10 backdrop-blur-md text-white p-2.5 rounded-xl pointer-events-none text-[10px] md:text-xs z-10 w-28 sm:w-32 md:w-36 shadow-xl">
          <div className="text-amber-400 font-extrabold mb-1 tracking-wider border-b border-white/10 pb-0.5 text-right">🏆 TOP RUNS</div>
          <ol className="list-decimal list-inside space-y-0.5 font-mono opacity-90 text-right">
            {highScores.map((hs, i) => (
              <li key={i} className={i === 0 ? "text-yellow-300 font-bold" : ""}>
                <span className="text-slate-400 mr-1">#{i + 1}</span>
                {hs}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* 🎯 SKILL CARD CHOOSE MODAL OVERLAY */}
      {showCards && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md z-30 p-4">
          <div className="text-center mb-4 md:mb-6">
            <h3 className="text-base sm:text-xl md:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 uppercase">
              🚀 Milestone Reached!
            </h3>
            <p className="text-[10px] sm:text-xs md:text-sm text-slate-400 mt-0.5">Select a skill upgrade to bolster your current run</p>
          </div>
          
          <div className="grid grid-cols-3 gap-2.5 md:gap-4 w-full max-w-xl md:max-w-2xl px-2">
            {randomCards.map((skill) => (
              <button
                key={skill.id}
                onClick={() => handleSelectSkill(skill)}
                className="group relative flex flex-col items-center text-center bg-slate-900/90 border border-white/10 rounded-xl p-2 sm:p-3 md:p-4 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all transform hover:-translate-y-0.5 active:scale-95 shadow-xl overflow-hidden"
              >
                <div className="absolute -inset-px bg-gradient-to-b from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                <div className="text-2xl sm:text-3xl md:text-4xl mb-1.5 p-1.5 sm:p-2 bg-slate-950 rounded-lg group-hover:scale-110 transition-transform shadow-inner">
                  {skill.icon}
                </div>
                <h4 className="text-[10px] sm:text-xs md:text-sm font-extrabold text-white group-hover:text-cyan-400 transition-colors line-clamp-1 mb-0.5">
                  {skill.name}
                </h4>
                <p className="text-[9px] sm:text-[10px] md:text-xs leading-tight text-slate-400 group-hover:text-slate-300 transition-colors line-clamp-2 h-6 sm:h-7 md:h-8 font-medium">
                  {skill.description}
                </p>
                {skill.duration && (
                  <span className="mt-2 text-[8px] sm:text-[9px] font-mono tracking-wider bg-slate-950 text-cyan-400 px-1.5 py-0.5 rounded-md uppercase opacity-75">
                    ⏱️ {(skill.duration / 1000)}s
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 💀 PLAYFUL RUN COMPLETED PANEL OVERLAY */}
      {isGameOverScreen && (
        <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md z-40 p-4 animate-fade-in">
          
          <div className="relative flex flex-col items-center scale-[0.8] lg:scale-[1] will-change-transform">
            
            {/* 📋 CHOPPED PIXEL-ART ASSET BANNER OVERLAY */}
            <div className="flex items-center justify-center h-14 sm:h-20 max-w-full drop-shadow-[0_4px_0_rgba(0,0,0,0.35)] image-render-pixelated z-50 md:-mb-6 -mb-15 translate-y-1 transform">
              <img 
                src="/assets/banner/left-bg.png" 
                alt="" 
                className="h-full object-contain select-none pointer-events-none" 
              />
              <div 
                className="h-full flex items-center justify-center px-6 sm:px-12 bg-[url('/assets/banner/fill-bg.png')] bg-repeat-x bg-[length:auto_100%]"
              >
                <h2 className="text-xl sm:text-4xl font-black text-white uppercase tracking-wide drop-shadow-[0_2px_0_rgba(0,0,0,0.85)] text-center whitespace-nowrap mb-2 font-bungee [-webkit-text-stroke:2px_#000000] mb-2">
                  AWESOME RUN!
                </h2>
              </div>
              <img 
                src="/assets/banner/right-bg.png" 
                alt="" 
                className="h-full object-contain select-none pointer-events-none" 
              />
            </div>

            {/* 📋 REBUILT MAIN SCORECARD BASE PANEL PIXEL-ART SANDWICH ASSEMBLY */}
            <div className="w-full md:max-w-xl flex flex-col drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] image-render-pixelated relative">
              
              {/* Scoreboard Slice: Top Cap */}
              <img 
                src="/assets/scoreboard-top.png" 
                alt="" 
                className="w-full object-contain select-none pointer-events-none" 
              />
              
              {/* Scoreboard Slice: Center Content Fill */}
              <div 
                className="w-full bg-[url('/assets/scoreboard-center.png')] bg-repeat-y bg-[length:100%_auto] px-6 py-1 flex flex-col items-center text-center"
              >
                <p className="text-amber-950 text-xs sm:text-sm font-black tracking-wider uppercase mb-5 drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">
                  Check out your spectacular score report!
                </p>

                {/* 📊 SCORE REPORT BOXES COMPLETE WITH SIBLING HANDLES (WOOD CAPS) */}
                <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-4 w-full max-w-[480px] mx-auto">
                  
                  {/* Stars Box Column Bundle */}
                  <div className="flex flex-col items-center select-none w-full">
                    <div className="w-full h-[12px] sm:h-[15px] border-2 border-[#b68263] rounded-xl bg-[linear-gradient(180deg,rgba(250,231,194,1)_0%,rgba(240,210,166,1)_100%)] shadow-[0_-2px_4px_rgba(0,0,0,0.15)]" />
                    
                    <div className="w-[92%] relative flex flex-col items-center justify-between z-20 border-2 border-[#b68263] rounded-t-none rounded-md p-2 bg-[#f9e7c3] shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
                      <div className="w-full absolute top-0 left-0 h-[5px] bg-[#f0d2a6]"></div>
             
                      <div className="my-1.5 p-1.5 sm:p-2 rounded-lg bg-[#cfa174] border border-[#b68263]/30 flex items-center justify-center shadow-inner">
                        <img src="/assets/status-star.png" alt="Stars" className="w-[20px] h-[20px] lg:w-[32px] lg:h-[32px] object-contain image-render-pixelated select-none pointer-events-none" />
                      </div>
                      <p className="text-sm sm:text-xl font-black text-slate-900 font-sans tracking-tight">
                        {score}
                      </p>
                    </div>

                    <div className="z-10 mt-[-6px] w-full h-[10px] sm:h-[12px] border-2 border-[#b68263] rounded-xl bg-[#b68263] shadow-[0_3px_5px_rgba(0,0,0,0.15)]" />
                  </div>

                  {/* Steps Box Column Bundle */}
                  <div className="flex flex-col items-center select-none w-full">
                    <div className="w-full h-[12px] sm:h-[15px] border-2 border-[#b68263] rounded-xl bg-[linear-gradient(180deg,rgba(250,231,194,1)_0%,rgba(240,210,166,1)_100%)] shadow-[0_-2px_4px_rgba(0,0,0,0.15)]" />
                    
                    <div className="w-[92%] relative flex flex-col items-center justify-between z-20 border-2 border-[#b68263] rounded-t-none rounded-md p-2 bg-[#f9e7c3] shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
                      <div className="w-full absolute top-0 left-0 h-[5px] bg-[#f0d2a6]"></div>

                      <div className="my-1.5 p-1.5 sm:p-2 rounded-lg bg-[#cfa174] border border-[#b68263]/30 flex items-center justify-center shadow-inner">
                        <img src="/assets/status-run.png" alt="Steps" className="w-[20px] h-[20px] lg:w-[32px] lg:h-[32px] object-contain image-render-pixelated select-none pointer-events-none" />
                      </div>
                      <p className="text-sm sm:text-xl font-black text-slate-900 font-sans tracking-tight whitespace-nowrap">
                        {distance}m
                      </p>
                    </div>

                    <div className="z-10 mt-[-6px] w-full h-[10px] sm:h-[12px] border-2 border-[#b68263] rounded-xl bg-[#b68263] shadow-[0_3px_5px_rgba(0,0,0,0.15)]" />
                  </div>

                  {/* Coins Box Column Bundle */}
                  <div className="flex flex-col items-center select-none w-full">
                    <div className="w-full h-[12px] sm:h-[15px] border-2 border-[#b68263] rounded-xl bg-[linear-gradient(180deg,rgba(250,231,194,1)_0%,rgba(240,210,166,1)_100%)] shadow-[0_-2px_4px_rgba(0,0,0,0.15)]" />
                    
                    <div className="w-[92%] relative flex flex-col items-center justify-between z-20 border-2 border-[#b68263] rounded-t-none rounded-md p-2 bg-[#f9e7c3] shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
                      <div className="w-full absolute top-0 left-0 h-[5px] bg-[#f0d2a6]"></div>

                      <div className="my-1.5 p-1.5 sm:p-2 rounded-lg bg-[#cfa174] border border-[#b68263]/30 flex items-center justify-center shadow-inner">
                        <img src="/assets/status-coins.png" alt="Coins" className="w-[20px] h-[20px] lg:w-[32px] lg:h-[32px] object-contain image-render-pixelated select-none pointer-events-none" />
                      </div>
                      <p className="text-sm sm:text-xl font-black text-slate-900 font-sans tracking-tight">
                        {coins}
                      </p>
                    </div>

                    <div className="z-10 mt-[-6px] w-full h-[10px] sm:h-[12px] border-2 border-[#b68263] rounded-xl bg-[#b68263] shadow-[0_3px_5px_rgba(0,0,0,0.15)]" />
                  </div>

                </div>

                {/* 🏅 LEADERBOARD PLACEMENT BADGE */}
                {highScores.length > 0 && (
                  <div className="flex items-center justify-center gap-2 sm:gap-3 text-amber-950 font-black tracking-wide text-xs sm:text-sm -mb-[20px] uppercase drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">
                    <img src="/assets/trophy.png" alt="Trophy" className="h-6 sm:h-8 object-contain select-none pointer-events-none image-render-pixelated" />
                    <span style={{ fontFamily: 'var(--font-fredoka)' }}>Your new rank:</span>
                    {(() => {
                      const achievedRank = highScores.indexOf(score) + 1;
                      if (achievedRank === 1) return <img src="/assets/rank-gold.png" alt="Gold" className="h-8 sm:h-10 object-contain select-none pointer-events-none image-render-pixelated" />;
                      if (achievedRank === 2) return <img src="/assets/rank-silver.png" alt="Silver" className="h-8 sm:h-10 object-contain select-none pointer-events-none image-render-pixelated" />;
                      if (achievedRank === 3) return <img src="/assets/rank-bronze.png" alt="Bronze" className="h-8 sm:h-10 object-contain select-none pointer-events-none image-render-pixelated" />;
                      return <span className="text-xs sm:text-sm font-black font-mono bg-slate-950/20 text-slate-800 border border-slate-700/30 px-2.5 py-0.5 rounded-md shadow-inner ml-1">#{achievedRank}</span>;
                    })()}
                  </div>
                )}
              </div>
              
              {/* Scoreboard Slice: Bottom Cap */}
              <img 
                src="/assets/scoreboard-bot.png" 
                alt="" 
                className="w-full object-contain select-none pointer-events-none" 
              />
            </div>

            {/* 🎮 REUSABLE ACTION INTERACTIVE CONTROLLER HUD BUTTONS */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 px-4 pb-2 mt-4 z-10">
              <Button
                onClick={() => {
                  preloadGameplaySprites(selectedChar.id);
                  handleRestartRun();
                }}
                text="🚀 AGAIN!"
                variant="primary"
              />
              <Button
                onClick={() => {
                  setIsGameOverScreen(false);
                  setShowCharSelect(true); 
                }}
                text="🦸 Select"
                variant="secondary"
              />
              <Button
                onClick={() => onMainMenu()}
                text="Exit"
                variant="secondary"
              />
            </div>

          </div>
        </div>
      )}

      {/* REWARDED VIDEO ADS INTERCEPTION OVERLAY */}
      {showAdPrompt && !adOverlay && !hasUsedAdRevive && dailyAdsUsed < MAX_DAILY_ADS && !isGameOverScreen && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-xs z-50 p-4">
          <div className="text-center p-5 max-w-sm bg-slate-900 border border-white/10 rounded-2xl shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Continue Run?</h3>
            <p className="text-xs text-slate-400 mb-4">Watch a short ad to revive and keep your score.</p>
            <div className="flex flex-col gap-2.5">
              <button onClick={watchRewardedAd} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-lg">
                🎥 Watch Ad to Revive
              </button>
              <button onClick={handleSkipAdRevive} className="text-slate-500 hover:text-slate-300 text-[11px] font-semibold py-1">
                Skip & End Run
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAKE AD OVERLAY */}
      {adOverlay === 'playing' && (
        <div className="absolute inset-0 bg-black z-[60] flex flex-col items-center justify-center p-4">
          <div className="absolute top-4 right-4 bg-white/10 text-white text-[10px] md:text-xs font-mono px-2.5 py-1 rounded-full">
            {adCountdown > 0 ? `Reward in ${adCountdown}s` : 'Reward Granted!'}
          </div>
          <div className="text-slate-500 text-xs md:text-sm mb-3 border border-slate-800 px-3 py-1.5 rounded-lg bg-slate-900">
            [ Sponsor Advertisement Simulation ]
          </div>
          <div className="w-full max-w-xs h-36 md:h-44 bg-slate-800 animate-pulse rounded-xl flex items-center justify-center">
            <span className="text-slate-600 font-bold text-xs md:text-sm tracking-widest uppercase">Video Ad</span>
          </div>
        </div>
      )}
      
    </div>
  );
}