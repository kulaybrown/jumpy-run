import React, { useEffect, useRef, useState } from 'react';
import SkillCards from '../components/SkillCards';
import { SKILLS_REGISTRY } from '../skillsData';
import { BackgroundEffects } from '../utils/BackgroundEffects';

export default function GameScreen({ playerColor, onGameOver }) {
  const canvasRef = useRef(null);
  
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0); // ✨ New state for displaying meters
  const [coins, setCoins] = useState(0);

  const [showCards, setShowCards] = useState(false);
  const [randomCards, setRandomCards] = useState([]);
  const [activeSkill, setActiveSkill] = useState(null);

  const gamePausedRef = useRef(false);
  const activeSkillRef = useRef(null);
  const nextSkillMilestoneRef = useRef(200); 

  const skillExpirationTimeRef = useRef(0);
  const skillTimeoutIdRef = useRef(null);

  const obstaclesRef = useRef([]);
  const coinsArrayRef = useRef([]);

  const canvasClickHandler = useRef(null);

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

    // --- INSTANT CAST SKILL: Coin Burst ---
    if (skill.id === 'burst') {
      obstacles.forEach(obs => {
        coinsArray.push({ x: obs.x, y: obs.y, radius: 8, color: '#fbbf24' });
      });
      obstacles.length = 0;
      
      // If they had an active timed skill running, unpause and let it keep running
      if (!activeSkillRef.current) {
        setActiveSkill(null);
      }
      setShowCards(false);
      gamePausedRef.current = false;
      return;
    }

    // --- TIMED SKILLS STACKING ENGINE ---
    let extraDuration = skill.duration || 0;

    // Clear any existing active timeout loops to prevent conflicting overlapping clears
    if (skillTimeoutIdRef.current) {
      clearTimeout(skillTimeoutIdRef.current);
    }

    if (activeSkillRef.current === skill.id) {
      // 🔄 STACKING MECHANIC: If picking the SAME skill, calculate leftover time and add to it
      const timeLeft = Math.max(0, skillExpirationTimeRef.current - now);
      const totalNewDuration = timeLeft + extraDuration;

      skillExpirationTimeRef.current = now + totalNewDuration;
    } else {
      // 🆕 REPLACEMENT MECHANIC: If picking a DIFFERENT skill, overwrite it entirely with its fresh duration
      setActiveSkill(skill.name);
      activeSkillRef.current = skill.id;
      skillExpirationTimeRef.current = now + extraDuration;
    }

    // Calculate how long the new stacked timer needs to run from this exact moment
    const operationalDuration = skillExpirationTimeRef.current - now;

    // Set the fresh single timeout tracking engine
    skillTimeoutIdRef.current = setTimeout(() => {
      activeSkillRef.current = null;
      setActiveSkill(null);
      skillExpirationTimeRef.current = 0;
    }, operationalDuration);

    setShowCards(false);
    gamePausedRef.current = false;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 400;

    let animationFrameId;
    let localScore = 0;
    let localDistance = 0; // ✨ Local tracker for performance looping
    let localCoins = 0;
    let isGameOver = false;

    const player = {
      x: 80,
      y: 300,
      width: 40,
      height: 40,
      gravity: 0.6,
      velocity: 0,
      jumpStrength: -13,
      isGrounded: false,
      color: playerColor 
    };

    const groundY = canvas.height - 60;
    const bgEffects = new BackgroundEffects(canvas.width, groundY);
    const obstacles = obstaclesRef.current;
    const coinsArray = coinsArrayRef.current;
    
    obstacles.length = 0;
    coinsArray.length = 0;

    let obstacleTimer = 0;
    let spawnRate = 120;
    let coinTimer = 0;
    let sonicTimer = 0;

    const handleJump = () => {
      if (gamePausedRef.current || isGameOver) return;
      if (activeSkillRef.current === 'gravity') {
        player.velocity = player.y <= 10 ? 9 : -9; 
        player.isGrounded = false;
      } else if (player.isGrounded || activeSkillRef.current === 'spring') {
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

    // --- MAIN RENDER CYCLE LOOP ---
    const update = () => {
      if (isGameOver) return;
      if (gamePausedRef.current) {
        animationFrameId = requestAnimationFrame(update);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const currentModifier = activeSkillRef.current;

      // 1. Sky Background Color
      if (currentModifier === 'slow') ctx.fillStyle = '#1e293b'; 
      else if (currentModifier === 'gravity') ctx.fillStyle = '#2e1065'; 
      else ctx.fillStyle = bgEffects.getSkyColor(Math.floor(localDistance)); 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Render Separated Background Aesthetics using Distance Metric
      bgEffects.render(ctx, Math.floor(localDistance));

      // 3. Ground Draw
      ctx.fillStyle = '#10b981';
      ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

      // --- PLAYER PHYSICS ---
      if (currentModifier === 'shrink') {
        player.width = 20; player.height = 20;
      } else {
        player.width = 40; player.height = 40;
      }

      if (currentModifier === 'fly') {
        player.y = Math.min(player.y, groundY - 140); 
        player.velocity = 0;
        player.isGrounded = true;
      } else if (currentModifier === 'gravity') {
        player.velocity -= player.gravity; 
        player.y += player.velocity;
        if (player.y <= 0) { player.y = 0; player.velocity = 0; player.isGrounded = true; }
      } else {
        player.velocity += player.gravity; 
        player.y += player.velocity;
        if (player.y + player.height >= groundY) {
          player.y = groundY - player.height; player.velocity = 0; player.isGrounded = true;
        }
      }

      // --- RENDER CHARACTER SKIN WITH BORDER & SHADOW ---
      ctx.save();
      ctx.shadowBlur = 15; ctx.shadowOffsetY = 6; ctx.shadowOffsetX = 2;

      if (currentModifier === 'invisible') {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)'; ctx.shadowColor = 'rgba(56, 189, 248, 0.2)'; ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      } else if (currentModifier === 'sprint') {
        ctx.fillStyle = '#f59e0b'; ctx.shadowColor = '#f59e0b'; ctx.strokeStyle = '#fff';
      } else if (currentModifier === 'fly') {
        ctx.fillStyle = '#a78bfa'; ctx.shadowColor = '#a78bfa'; ctx.strokeStyle = '#fff';
      } else if (currentModifier === 'gravity') {
        ctx.fillStyle = '#ec4899'; ctx.shadowColor = '#ec4899'; ctx.strokeStyle = '#fff';
      } else {
        ctx.fillStyle = player.color; ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'; ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      }
      ctx.fillRect(player.x, player.y, player.width, player.height);
      ctx.lineWidth = 3; ctx.strokeRect(player.x, player.y, player.width, player.height);
      ctx.restore();

      // --- SONIC BLAST ---
      if (currentModifier === 'sonic') {
        sonicTimer++;
        if (sonicTimer > 180) { 
          ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 4; ctx.beginPath();
          ctx.arc(player.x + player.width, player.y + player.height/2, 60, -Math.PI/2, Math.PI/2);
          ctx.stroke();
          if (obstacles.length > 0) obstacles.splice(0, 1);
          sonicTimer = 0;
        }
      }

      // --- OBSTACLES ---
      obstacleTimer++;
      const currentSpawnRate = currentModifier === 'slow' ? spawnRate * 1.5 : spawnRate;
      if (obstacleTimer > currentSpawnRate) {
        obstacles.push({
          x: canvas.width,
          y: currentModifier === 'gravity' ? (Math.random() > 0.5 ? groundY - 30 : 0) : groundY - 30, 
          width: 20, height: 30, speed: currentModifier === 'slow' ? 4 : 7, color: '#ef4444'
        });
        obstacleTimer = 0;
        if (spawnRate > 50) spawnRate -= 1;
      }

      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= (currentModifier === 'slow' ? obs.speed * 0.6 : obs.speed); 
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        if (player.x < obs.x + obs.width && player.x + player.width > obs.x && player.y < obs.y + obs.height && player.y + player.height > obs.y) {
          if (currentModifier === 'invisible' || currentModifier === 'sprint') { obstacles.splice(i, 1); continue; }
          if (currentModifier === 'shield') { activeSkillRef.current = null; setActiveSkill(null); obstacles.splice(i, 1); continue; }
          if (currentModifier === 'revive') {
            activeSkillRef.current = 'invisible'; setActiveSkill('Ghost Walk 👻'); obstacles.length = 0;
            setTimeout(() => { activeSkillRef.current = null; setActiveSkill(null); }, 3000);
            continue;
          }
          isGameOver = true; cancelAnimationFrame(animationFrameId);
          onGameOver(Math.floor(localScore), localCoins); return;
        }
        if (obs.x + obs.width < 0) obstacles.splice(i, 1);
      }

      // --- COINS ---
      coinTimer++;
      if (coinTimer > (currentModifier === 'lucky' ? 25 : 80)) {
        coinsArray.push({ x: canvas.width, y: groundY - 45 - Math.random() * 80, radius: 8, color: '#fbbf24' });
        coinTimer = 0;
      }

      for (let i = coinsArray.length - 1; i >= 0; i--) {
        const coin = coinsArray[i]; coin.x -= 5;
        if (currentModifier === 'magnet') {
          const dx = (player.x + player.width / 2) - coin.x; const dy = (player.y + player.height / 2) - coin.y;
          coin.x += dx * 0.14; coin.y += dy * 0.14;
        }
        ctx.beginPath(); ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2); ctx.fillStyle = coin.color; ctx.fill(); ctx.closePath();

        if (player.x < coin.x + coin.radius && player.x + player.width > coin.x - coin.radius && player.y < coin.y + coin.radius && player.y + player.height > coin.y - coin.radius) {
          localCoins += (currentModifier === 'double' ? 2 : 1);
          // Coins also award direct survival points!
          localScore += (currentModifier === 'double' ? 50 : 25);
          setCoins(localCoins);
          coinsArray.splice(i, 1);
          continue;
        }
        if (coin.x < 0) coinsArray.splice(i, 1);
      }

      // --- DISTANCE & SCORE CALCULATIONS ---
      // Distance grows steadily based on run speed
      localDistance += (currentModifier === 'sprint' ? 0.4 : 0.15);
      setDistance(Math.floor(localDistance));

      // Score calculates distance and bonus values combined
      localScore += (currentModifier === 'multiplier' ? 0.6 : 0.2);
      setScore(Math.floor(localScore));

      if (localScore >= nextSkillMilestoneRef.current) {
        nextSkillMilestoneRef.current += 200; 
        triggerCardSelection();
      }

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animationFrameId);
      
      // 🌟 ADD THIS LINE RIGHT HERE:
      if (skillTimeoutIdRef.current) clearTimeout(skillTimeoutIdRef.current);
    };
  }, [onGameOver, playerColor]);

  return (
    <div className="relative flex flex-col items-center select-none w-full max-w-3xl">
      
      {/* Updated HUD Displays */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center bg-slate-950/70 pointer-events-none px-4 py-2 rounded-xl backdrop-blur-xs border border-white/10 z-10 text-xs sm:text-sm font-bold tracking-wide">
        <div className="text-cyan-400">
          🚩 DISTANCE: <span className="text-white">{distance}m</span>
        </div>
        
        {activeSkill && (
          <div className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full font-semibold border border-cyan-400/30 animate-pulse uppercase text-[10px]">
            ⚡ {activeSkill}
          </div>
        )}

        <div className="flex gap-4 sm:gap-6">
          <div className="text-yellow-400">SCORE: <span className="text-white">{score}</span></div>
          <div className="text-amber-400">🪙 COINS: <span className="text-white">{coins}</span></div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        onClick={() => canvasClickHandler.current && canvasClickHandler.current()}
        className="w-full aspect-[2/1] rounded-2xl shadow-2xl border border-slate-700 bg-slate-950 touch-none cursor-pointer"
      />
      {showCards && <SkillCards visibleCards={randomCards} onSelectSkill={handleSelectSkill} />}
    </div>
  );
}