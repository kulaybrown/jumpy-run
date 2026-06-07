/**
 * BackgroundEffects Class
 * Manages the data, logic, and rendering for background aesthetic events.
 */
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
      state: 'WAITING'
    };

    // 2. UFO Configurations
    this.ufo = {
      x: -80,
      y: 60,
      width: 50,
      height: 20,
      state: 'HIDDEN',
      stayTimer: 0,
      color: '#a855f7'
    };
  }

  /**
   * Generates a completely fluid Day/Sunset/Night color transition using HSL values.
   * Smoothly cycles from 0m to 1000m distance intervals.
   */
  getSkyColor(distance) {
    // Convert distance into a continuous radial angle (0 to 2*PI every 1000 meters)
    const angle = (distance / 1000) * Math.PI * 2;
    
    // Normalizes sine wave to oscillate smoothly between 0 (Night) and 1 (Day)
    const timeFactor = (Math.sin(angle) + 1) / 2; 
    
    // Detects when the sun is crossing the horizon line (Sunset/Sunrise indicator)
    const horizonFactor = Math.max(0, Math.cos(angle)); 

    // 🎨 Dynamic HSL Interpolation Math:
    // Hue shifts from 240 (Deep Midnight Blue) up to 198 (Bright Sky Blue)
    const hue = 240 - (timeFactor * 42) + (horizonFactor * 15);
    
    // Saturation drops slightly during high noon, but spikes during sunset orange phases
    const saturation = 60 + (timeFactor * 25) + (horizonFactor * 15);
    
    // Lightness moves from 8% (Dark Night) up to 60% (Bright Clear Day)
    // Sunset drops into warm ranges using the horizon factor calculation
    const lightness = 8 + (timeFactor * 52) - (horizonFactor * 5);

    // If we are deep in a sunset pocket, gently inject warm orange/pink tones
    if (timeFactor < 0.5 && horizonFactor > 0.3) {
      const sunsetBlend = horizonFactor;
      return `hsl(${25 + (sunsetBlend * 15)}, ${saturation}%, ${lightness + 10}%)`;
    }

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
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

    // --- EVENT B: UFO LOGIC (Triggers every 800m of distance) ---
    if (currentDistance > 0 && currentDistance % 800 === 0 && this.ufo.state === 'HIDDEN') {
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