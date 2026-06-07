import React, { useEffect, useRef, useState } from 'react';
import SkillCards from '../components/SkillCards';
import { SKILLS_REGISTRY } from '../skillsData';
import { BackgroundEffects } from '../utils/BackgroundEffects';

export default function GameScreen({ playerColor, onGameOver }) {
  const canvasRef = useRef(null);
  
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0); 
  const [coins, setCoins] = useState(0);

  const [shieldCount, setShieldCount] = useState(0);
  const [reviveCount, setReviveCount] = useState(0);

  const [showCards, setShowCards] = useState(false);
  const [randomCards, setRandomCards] = useState([]);
  const [activeSkill, setActiveSkill] = useState(null);

  const gamePausedRef = useRef(false);
  const activeSkillRef = useRef(null);
  const nextSkillMilestoneRef = useRef(200); 

  const shieldCountRef = useRef(0);
  const reviveCountRef = useRef(0);

  const skillExpirationTimeRef = useRef(0);
  const skillTimeoutIdRef = useRef(null);

  const obstaclesRef = useRef([]);
  const coinsArrayRef = useRef([]);
  const ufosRef = useRef([]);

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

    if (!skill) {
      if (!activeSkillRef.current) setActiveSkill(null);
      setShowCards(false);
      gamePausedRef.current = false;
      return;
    }

    if (skill.id === 'burst') {
      obstacles.forEach(obs => {
        coinsArray.push({ x: obs.x, y: obs.y, radius: 8, color: '#fbbf24' });
      });
      obstacles.length = 0;
      ufosRef.current.forEach(ufo => {
        coinsArray.push({ x: ufo.x, y: ufo.y, radius: 10, color: '#fbbf24' });
      });
      ufosRef.current.length = 0;

      if (!activeSkillRef.current) setActiveSkill(null);
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

    if (skillTimeoutIdRef.current) {
      clearTimeout(skillTimeoutIdRef.current);
    }

    if (activeSkillRef.current === skill.id) {
      const timeLeft = Math.max(0, skillExpirationTimeRef.current - now);
      const totalNewDuration = timeLeft + extraDuration;
      skillExpirationTimeRef.current = now + totalNewDuration;
    } else {
      setActiveSkill(`${skill.name} ${skill.icon}`);
      activeSkillRef.current = skill.id;
      skillExpirationTimeRef.current = now + extraDuration;
    }

    const operationalDuration = skillExpirationTimeRef.current - now;

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
    let localDistance = 0; 
    let localCoins = 0;
    let isGameOver = false;

    let lastTime = performance.now();
    const fpsInterval = 1000 / 60;

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
    const ufos = ufosRef.current;
    
    shieldCountRef.current = 0;
    reviveCountRef.current = 0;
    setShieldCount(0);
    setReviveCount(0);

    obstacles.length = 0;
    coinsArray.length = 0;
    ufos.length = 0;

    let obstacleTimer = 0;
    let spawnRate = 120;
    let coinTimer = 0;
    let sonicTimer = 0;
    let nextUfoMilestone = 800; 

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

    const update = () => {
      if (isGameOver) return;

      animationFrameId = requestAnimationFrame(update);

      const currentTime = performance.now();
      const elapsed = currentTime - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = currentTime - (elapsed % fpsInterval);

      if (gamePausedRef.current) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = bgEffects.getSkyColor(Math.floor(localDistance));
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const currentModifier = activeSkillRef.current;

      const rawMultiplier = 1 + Math.floor(localDistance / 200) * 0.05;
      const gameSpeedMultiplier = Math.min(rawMultiplier, 3.0); 

      if (currentModifier === 'slow') ctx.fillStyle = '#1e293b'; 
      else if (currentModifier === 'gravity') ctx.fillStyle = '#2e1065'; 
      else ctx.fillStyle = bgEffects.getSkyColor(Math.floor(localDistance)); 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      bgEffects.render(ctx, Math.floor(localDistance));

      ctx.fillStyle = '#10b981';
      ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

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

      if (shieldCountRef.current > 0) {
        ctx.save();
        ctx.beginPath();
        const shieldRadius = 26 + (shieldCountRef.current * 4);
        ctx.arc(player.x + player.width/2, player.y + player.height/2, shieldRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(34, 211, 238, ${0.2 + shieldCountRef.current * 0.15})`;
        ctx.lineWidth = 3; ctx.shadowBlur = 10; ctx.shadowColor = '#22d3ee';
        ctx.stroke();
        ctx.restore();
      }

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

      if (currentModifier === 'sonic') {
        sonicTimer++;
        if (sonicTimer > 180) { 
          ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 4; ctx.beginPath();
          ctx.arc(player.x + player.width, player.y + player.height/2, 60, -Math.PI/2, Math.PI/2);
          ctx.stroke();
          if (obstacles.length > 0) obstacles.splice(0, 1);
          if (ufos.length > 0) ufos.splice(0, 1);
          sonicTimer = 0;
        }
      }

      if (Math.floor(localDistance) >= nextUfoMilestone) {
        nextUfoMilestone += 800;
        ufos.push({
          x: canvas.width + 40,
          y: 60 + Math.random() * 80,
          width: 50, height: 25, speed: 9, pulseAngle: 0
        });
      }

      for (let i = ufos.length - 1; i >= 0; i--) {
        const ufo = ufos[i];
        ufo.x -= (currentModifier === 'slow' ? ufo.speed * 0.5 : ufo.speed) * gameSpeedMultiplier;
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

        if (player.x < ufo.x + ufo.width && player.x + player.width > ufo.x && player.y < ufo.y + ufo.height && player.y + player.height > ufo.y) {
          if (currentModifier === 'invisible' || currentModifier === 'sprint') { ufos.splice(i, 1); continue; }
          if (shieldCountRef.current > 0) { shieldCountRef.current -= 1; setShieldCount(shieldCountRef.current); ufos.splice(i, 1); continue; }
          if (reviveCountRef.current > 0) {
            reviveCountRef.current -= 1; setReviveCount(reviveCountRef.current); ufos.length = 0; obstacles.length = 0;
            activeSkillRef.current = 'invisible'; setActiveSkill('Ghost Walk 👻');
            setTimeout(() => { activeSkillRef.current = null; setActiveSkill(null); }, 3000);
            continue;
          }
          isGameOver = true; cancelAnimationFrame(animationFrameId);
          onGameOver(Math.floor(localScore), localCoins); return;
        }
        if (ufo.x + ufo.width < 0) ufos.splice(i, 1);
      }

      // --- 🛑 SMOOTH CURVE OBSTACLE ENGINE ---
      obstacleTimer += gameSpeedMultiplier;
      const currentSpawnRate = currentModifier === 'slow' ? spawnRate * 1.5 : spawnRate;
      
      if (obstacleTimer > currentSpawnRate) {
        let obsWidth = 20;
        let obsHeight = 30;
        let obsColor = '#ef4444'; 
        let obsBaseSpeed = 7; 

        // Check if player has run far enough for slow hazards (>200m)
        const canSpawnSlow = localDistance >= 200;
        const isSlowObstacle = canSpawnSlow && Math.random() < 0.25;

        if (isSlowObstacle) {
          obsWidth = 32;
          obsHeight = 24; 
          obsColor = '#06b6d4'; 
          
          // 📈 DYNAMIC SPEED SMOOTHING
          // Starts near 4.8 speed at 200m, slowly decreasing to a creeping 2.8 speed as you cross 700m
          const progressionFactor = Math.min(1, (localDistance - 200) / 500);
          obsBaseSpeed = 4.8 - (progressionFactor * 2.0); 
        } else {
          if (localDistance >= 1000) {
            obsWidth = 24; obsHeight = 65; obsColor = '#a855f7'; 
          } else if (localDistance >= 400) {
            obsWidth = 42; obsHeight = 32; obsColor = '#f97316'; 
          }
        }

        obstacles.push({
          x: canvas.width,
          y: currentModifier === 'gravity' ? (Math.random() > 0.5 ? groundY - obsHeight : 0) : groundY - obsHeight, 
          width: obsWidth, height: obsHeight, speed: obsBaseSpeed, color: obsColor
        });

        if (!isSlowObstacle && Math.random() < 0.40) {
          const maxGap = Math.max(45, 110 - Math.floor(localDistance / 15));
          const minGap = Math.max(40, 55 - Math.floor(localDistance / 30));
          const dynamicNarrowGap = minGap + Math.random() * (maxGap - minGap);
          
          obstacles.push({
            x: canvas.width + dynamicNarrowGap,
            y: currentModifier === 'gravity' ? (Math.random() > 0.5 ? groundY - obsHeight : 0) : groundY - obsHeight, 
            width: obsWidth, height: obsHeight, speed: obsBaseSpeed, color: obsColor
          });
        }
        
        obstacleTimer = 0;
        if (spawnRate > 65 && Math.random() > 0.7) spawnRate -= 1; 
      }

      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        const dynamicSpeed = (currentModifier === 'slow' ? obs.speed * 0.6 : obs.speed) * gameSpeedMultiplier;
        obs.x -= dynamicSpeed; 
        
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        if (player.x < obs.x + obs.width && player.x + player.width > obs.x && player.y < obs.y + obs.height && player.y + player.height > obs.y) {
          if (currentModifier === 'invisible' || currentModifier === 'sprint') { obstacles.splice(i, 1); continue; }
          if (shieldCountRef.current > 0) { shieldCountRef.current -= 1; setShieldCount(shieldCountRef.current); obstacles.splice(i, 1); continue; }
          if (reviveCountRef.current > 0) {
            reviveCountRef.current -= 1; setReviveCount(reviveCountRef.current); obstacles.length = 0; ufos.length = 0;
            activeSkillRef.current = 'invisible'; setActiveSkill('Ghost Walk 👻');
            setTimeout(() => { activeSkillRef.current = null; setActiveSkill(null); }, 3000);
            continue;
          }
          isGameOver = true; cancelAnimationFrame(animationFrameId);
          onGameOver(Math.floor(localScore), localCoins); return;
        }
        if (obs.x + obs.width < 0) obstacles.splice(i, 1);
      }

      // Coins Engine
      coinTimer++;
      if (coinTimer > (currentModifier === 'lucky' ? 25 : 80)) {
        coinsArray.push({ x: canvas.width, y: groundY - 45 - Math.random() * 80, radius: 8, color: '#fbbf24' });
        coinTimer = 0;
      }

      for (let i = coinsArray.length - 1; i >= 0; i--) {
        const coin = coinsArray[i]; 
        coin.x -= 5 * gameSpeedMultiplier;
        if (currentModifier === 'magnet') {
          const dx = (player.x + player.width / 2) - coin.x; const dy = (player.y + player.height / 2) - coin.y;
          coin.x += dx * 0.14; coin.y += dy * 0.14;
        }
        ctx.beginPath(); ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2); ctx.fillStyle = coin.color; ctx.fill(); ctx.closePath();

        if (player.x < coin.x + coin.radius && player.x + player.width > coin.x - coin.radius && player.y < coin.y + coin.radius && player.y + player.height > coin.y - coin.radius) {
          localCoins += (currentModifier === 'double' ? 2 : 1);
          localScore += (currentModifier === 'double' ? 50 : 25);
          setCoins(localCoins);
          coinsArray.splice(i, 1);
          continue;
        }
        if (coin.x < 0) coinsArray.splice(i, 1);
      }

      const baseDistanceStep = currentModifier === 'sprint' ? 0.4 : 0.15;
      localDistance += baseDistanceStep * gameSpeedMultiplier;
      setDistance(Math.floor(localDistance));

      const baseScoreStep = currentModifier === 'multiplier' ? 0.6 : 0.2;
      localScore += baseScoreStep * gameSpeedMultiplier;
      setScore(Math.floor(localScore));

      if (localScore >= nextSkillMilestoneRef.current) {
        nextSkillMilestoneRef.current += 200; 
        triggerCardSelection();
      }
    };

    update();

    return () => { 
      window.removeEventListener('keydown', handleKeyDown); 
      cancelAnimationFrame(animationFrameId); 
      if (skillTimeoutIdRef.current) clearTimeout(skillTimeoutIdRef.current); 
    };
  }, [onGameOver, playerColor]);

  return (
    <div className="relative flex flex-col items-center select-none w-full max-w-3xl">
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center bg-slate-950/70 pointer-events-none px-4 py-2 rounded-xl backdrop-blur-xs border border-white/10 z-10 text-xs sm:text-sm font-bold tracking-wide">
        <div className="flex items-center gap-3">
          <div className="text-cyan-400">🚩 DISTANCE: <span className="text-white">{distance}m</span></div>
          {shieldCount > 0 && (
            <div className="flex items-center gap-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-md text-[11px] font-black animate-bounce">🛡️ {shieldCount}/5</div>
          )}
          {reviveCount > 0 && (
            <div className="flex items-center gap-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-md text-[11px] font-black">❤️ {reviveCount}/2</div>
          )}
        </div>
        {activeSkill && (
          <div className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full font-semibold border border-cyan-400/30 animate-pulse uppercase text-[10px]">⚡ {activeSkill}</div>
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