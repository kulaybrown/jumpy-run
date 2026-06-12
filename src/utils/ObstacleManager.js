import obstacleWood from '../assets/obstacle-wood.png';
import obstacleRock from '../assets/obstacle-rock.png';
import obstacleSpikeyBall from '../assets/obstacle-spikeyball.png';

export class ObstacleManager {
  constructor() {
    this.images = {
      wood: new Image(),
      rock: new Image(),
      spikeyball: new Image()
    };
    
    this.images.wood.src = obstacleWood;
    this.images.rock.src = obstacleRock;
    this.images.spikeyball.src = obstacleSpikeyBall;

    this.isLoaded = false;
  }

  /**
   * Promisified preloader ensuring all imagery is safely cached 
   * in memory before the main canvas execution loop spins up.
   */
  async initialize() {
    const loadImg = (img) => new Promise((resolve) => {
      if (img.complete) resolve();
      else img.onload = () => resolve();
    });

    await Promise.all([
      loadImg(this.images.wood),
      loadImg(this.images.rock),
      loadImg(this.images.spikeyball)
    ]);

    this.isLoaded = true;
    return Promise.resolve();
  }

  /**
   * Selects a random hazard variant based on game layout requirements.
   */
  getRandomType() {
    const randSelector = Math.random();
    if (randSelector < 0.35) return 'wood';
    if (randSelector < 0.70) return 'rock';
    return 'spikeyball';
  }

  /**
   * Returns the preloaded HTMLImageElement reference for direct canvas mapping.
   */
  getImage(type) {
    return this.images[type] || null;
  }
}