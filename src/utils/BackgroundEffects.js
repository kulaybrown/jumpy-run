export class BackgroundEffects {
  constructor(canvasWidth, groundY) {
    this.canvasWidth = canvasWidth;
    this.groundY = groundY;

    // 1. Superman Configurations
    this.superman = {
      x: -100,
      y: 80,
      width: 60,
      height: 25,
      speed: 6,
      color: '#ef4444',
      state: 'WAITING' // 'WAITING', 'FLYING', 'FINISHED'
    };

    // 2. UFO Configurations
    this.ufo = {
      x: -80,
      y: 60,
      width: 50,
      height: 20,
      state: 'HIDDEN', // 'HIDDEN', 'ENTERING', 'STAYING', 'EXITING', 'COOLDOWN'
      stayTimer: 0,
      color: '#a855f7'
    };
  }

  /**
   * Calculates a smooth Day/Sunset/Night transition color based on the current distance.
   */
  getSkyColor(distance) {
    const cycleFactor = Math.sin((distance / 1000) * Math.PI * 2);

    if (cycleFactor > 0.5) {
      return '#38bdf8'; // DAY
    } else if (cycleFactor <= 0.5 && cycleFactor > -0.2) {
      return '#f97316'; // SUNSET
    } else {
      return '#0f172a'; // NIGHT
    }
  }

  /**
   * Updates coordinates and draws background assets using dynamic distance metrics.
   */
  render(ctx, currentDistance) {
    // --- EVENT A: SUPERMAN LOGIC (Triggers EXACTLY when distance hits 500m+) ---
    if (currentDistance >= 500 && this.superman.state === 'WAITING') {
      this.superman.state = 'FLYING';
    }

    if (this.superman.state === 'FLYING') {
      this.superman.x += this.superman.speed;

      ctx.fillStyle = this.superman.color;
      ctx.fillRect(this.superman.x, this.superman.y, this.superman.width, this.superman.height);
      
      ctx.fillStyle = '#eab308';
      ctx.fillRect(this.superman.x + 20, this.superman.y + 5, 15, 15);

      if (this.superman.x > this.canvasWidth + 100) {
        this.superman.state = 'FINISHED';
      }
    }

    // --- EVENT B: UFO LOGIC (Triggers every 500m of distance) ---
    // If the player is past 0 and hits a multiple of 500 meters, bring out the UFO
    if (currentDistance > 0 && currentDistance % 500 === 0 && this.ufo.state === 'HIDDEN') {
      this.ufo.state = 'ENTERING';
      this.ufo.x = -80;
    }

    if (this.ufo.state !== 'HIDDEN') {
      const centerPos = this.canvasWidth / 2 - this.ufo.width / 2;

      if (this.ufo.state === 'ENTERING') {
        this.ufo.x += 4;
        if (this.ufo.x >= centerPos) {
          this.ufo.x = centerPos;
          this.ufo.state = 'STAYING';
          this.ufo.stayTimer = 0;
        }
      } 
      else if (this.ufo.state === 'STAYING') {
        this.ufo.stayTimer++;
        if (this.ufo.stayTimer >= 120) { 
          this.ufo.state = 'EXITING';
        }
        
        // Tractor Beam Effect
        ctx.fillStyle = 'rgba(34, 211, 238, 0.25)';
        ctx.beginPath();
        ctx.moveTo(this.ufo.x + this.ufo.width / 2, this.ufo.y + this.ufo.height);
        ctx.lineTo(this.ufo.x - 20, this.groundY);
        ctx.lineTo(this.ufo.x + this.ufo.width + 20, this.groundY);
        ctx.closePath();
        ctx.fill();
      } 
      else if (this.ufo.state === 'EXITING') {
        this.ufo.x += 18;
        if (this.ufo.x > this.canvasWidth + 100) {
          this.ufo.state = 'COOLDOWN'; 
        }
      }
      
      // Release cooldown once player runs past the exact trigger meter mark
      if (this.ufo.state === 'COOLDOWN' && currentDistance % 500 !== 0) {
        this.ufo.state = 'HIDDEN';
      }

      if (this.ufo.state !== 'HIDDEN' && this.ufo.state !== 'COOLDOWN') {
        ctx.fillStyle = this.ufo.color;
        ctx.fillRect(this.ufo.x, this.ufo.y, this.ufo.width, this.ufo.height);
        
        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(this.ufo.x + 15, this.ufo.y - 8, 20, 8);
      }
    }
  }
}