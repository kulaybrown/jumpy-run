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
      x: -250,         
      y: 35,           // Placed near the very top of the screen
      width: 170,      
      height: 70,      
      speed: 6.5,      
      state: 'WAITING',
      frameIndex: 0,
      tickCount: 0,
      ticksPerFrame: 4 
    };

    // 2. UFO Configurations
    this.ufo = {
      x: -250,         
      y: 25,           // Shifted high up into the upper sky layer
      width: 140,      
      height: 55,      
      state: 'HIDDEN',
      stayTimer: 0,
      frameIndex: 0,
      tickCount: 0,
      ticksPerFrame: 5 
    };

    // Load Superman Frames (1-12)
    this.supermanImages = [];
    for (let i = 1; i <= 12; i++) {
      const img = new Image();
      const path = `/assets/animations/superman/${i}.png`;
      img.src = path;
      
      img.onerror = () => {
        console.error(`❌ Failed to load Superman frame at: ${path}. Check if folder is 'animation' or 'animations' inside public/`);
      };
      
      this.supermanImages.push(img);
    }

    // Load UFO Frames (1-6)
    this.ufoImages = [];
    for (let i = 1; i <= 6; i++) {
      const img = new Image();
      const path = `/assets/animations/ufo/${i}.png`;
      img.src = path;
      
      img.onerror = () => {
        console.error(`❌ Failed to load UFO frame at: ${path}. Check your spelling and file extensions!`);
      };
      
      this.ufoImages.push(img);
    }
  }

  /**
   * Generates a completely fluid Day/Sunset/Night color transition using HSL values.
   */
  getSkyColor(distance) {
    const angle = (distance / 1000) * Math.PI * 2;
    const timeFactor = (Math.sin(angle) + 1) / 2; 
    const horizonFactor = Math.max(0, Math.cos(angle)); 

    const hue = 240 - (timeFactor * 42) + (horizonFactor * 15);
    const saturation = 60 + (timeFactor * 25) + (horizonFactor * 15);
    const lightness = 8 + (timeFactor * 52) - (horizonFactor * 5);

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
    // --- EVENT A: SUPERMAN LOGIC ---
    if (currentDistance >= 500 && this.superman.state === 'WAITING') {
      this.superman.state = 'FLYING';
    }

    if (this.superman.state === 'FLYING') {
      this.superman.x += this.superman.speed;

      this.superman.tickCount++;
      if (this.superman.tickCount >= this.superman.ticksPerFrame) {
        this.superman.tickCount = 0;
        this.superman.frameIndex = (this.superman.frameIndex + 1) % 12;
      }

      const currentSupesFrame = this.supermanImages[this.superman.frameIndex];
      
      if (currentSupesFrame && currentSupesFrame.complete && currentSupesFrame.naturalWidth !== 0) {
        const aspectRatio = currentSupesFrame.naturalHeight / currentSupesFrame.naturalWidth;
        const autoProportionalHeight = this.superman.width * aspectRatio;

        ctx.drawImage(
          currentSupesFrame, 
          this.superman.x, 
          this.superman.y, 
          this.superman.width, 
          autoProportionalHeight
        );
      } else {
        // Fallback shape if loading fails
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(this.superman.x, this.superman.y, this.superman.width, this.superman.height);
        ctx.fillStyle = '#eab308';
        ctx.fillRect(this.superman.x + (this.superman.width * 0.4), this.superman.y + (this.superman.height * 0.2), this.superman.width * 0.25, this.superman.height * 0.6);
      }

      if (this.superman.x > this.canvasWidth + 250) {
        this.superman.state = 'FINISHED';
      }
    }

    // --- EVENT B: UFO LOGIC ---
    if (currentDistance > 0 && currentDistance % 800 === 0 && this.ufo.state === 'HIDDEN') {
      this.ufo.state = 'ENTERING';
      this.ufo.x = -250;
    }

    if (this.ufo.state !== 'HIDDEN') {
      const centerPos = this.canvasWidth / 2 - this.ufo.width / 2;

      this.ufo.tickCount++;
      if (this.ufo.tickCount >= this.ufo.ticksPerFrame) {
        this.ufo.tickCount = 0;
        this.ufo.frameIndex = (this.ufo.frameIndex + 1) % 6;
      }

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
        
        const currentUfoFrame = this.ufoImages[this.ufo.frameIndex];
        let currentUfoHeight = this.ufo.height;
        if (currentUfoFrame && currentUfoFrame.complete && currentUfoFrame.naturalWidth !== 0) {
          currentUfoHeight = this.ufo.width * (currentUfoFrame.naturalHeight / currentUfoFrame.naturalWidth);
        }

        if (this.ufo.stayTimer >= 120) { 
          this.ufo.state = 'EXITING';
        }
        
        // ⚡ --- HIGH-INTENSITY BRIGHT WHITE/YELLOW TRACTOR BEAM GRADIENT --- ⚡
        ctx.save();
        ctx.globalCompositeOperation = 'screen'; // Enables glow blending over city elements
        
        const emitterX = this.ufo.x + this.ufo.width / 2;
        
        // ✅ FIX: Anchor point tucked directly inside the saucer core (75% height) to mask asset empty space transparency
        const beamAnchorY = this.ufo.y + (currentUfoHeight * 0.75); 
        
        const beamGlow = ctx.createLinearGradient(
          emitterX, beamAnchorY,
          emitterX, this.groundY
        );
        
        beamGlow.addColorStop(0, 'rgba(255, 255, 255, 0.75)');   // Stark white hot ray core inside emitter source
        beamGlow.addColorStop(0.2, 'rgba(254, 240, 138, 0.45)'); // Electric neon light-yellow transition hull
        beamGlow.addColorStop(0.75, 'rgba(234, 179, 8, 0.22)');   // Warm burning secondary laser yellow body
        beamGlow.addColorStop(1, 'rgba(234, 179, 8, 0.02)');      // Ground falloff fade
        
        ctx.fillStyle = beamGlow;
        ctx.beginPath();
        ctx.moveTo(emitterX, beamAnchorY);
        ctx.lineTo(this.ufo.x - 50, this.groundY);
        ctx.lineTo(this.ufo.x + this.ufo.width + 50, this.groundY);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } 
      else if (this.ufo.state === 'EXITING') {
        this.ufo.x += 18;
        if (this.ufo.x > this.canvasWidth + 250) {
          this.ufo.state = 'COOLDOWN'; 
        }
      }
      
      if (this.ufo.state === 'COOLDOWN' && currentDistance % 500 !== 0) {
        this.ufo.state = 'HIDDEN';
      }

      if (this.ufo.state !== 'HIDDEN' && this.ufo.state !== 'COOLDOWN') {
        const currentUfoFrame = this.ufoImages[this.ufo.frameIndex];
        
        if (currentUfoFrame && currentUfoFrame.complete && currentUfoFrame.naturalWidth !== 0) {
          const aspectRatio = currentUfoFrame.naturalHeight / currentUfoFrame.naturalWidth;
          const autoProportionalHeight = this.ufo.width * aspectRatio;

          ctx.drawImage(
            currentUfoFrame, 
            this.ufo.x, 
            this.ufo.y, 
            this.ufo.width, 
            autoProportionalHeight
          );
        } else {
          ctx.fillStyle = '#a855f7';
          ctx.fillRect(this.ufo.x, this.ufo.y, this.ufo.width, this.ufo.height);
          ctx.fillStyle = '#22d3ee';
          ctx.fillRect(this.ufo.x + (this.ufo.width * 0.3), this.ufo.y - (this.ufo.height * 0.4), this.ufo.width * 0.4, this.ufo.height * 0.4);
        }
      }
    }
  }
}