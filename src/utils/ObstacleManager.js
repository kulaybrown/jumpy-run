import small1 from '../assets/obstacle-small-1.png';
import small2 from '../assets/obstacle-small-2.png';
import med1 from '../assets/obstacle-medium-1.png';
import med2 from '../assets/obstacle-medium-2.png';
import med3 from '../assets/obstacle-medium-3.png';
import med4 from '../assets/obstacle-medium-4.png';
import med5 from '../assets/obstacle-medium-5.png';
import med6 from '../assets/obstacle-medium-6.png';
import tall1 from '../assets/obstacle-tall-1.png';
import tall2 from '../assets/obstacle-tall-2.png';

export class ObstacleManager {
  constructor() {
    this.sprites = {
      small: [],
      medium: [],
      tall: []
    };
    this.isLoaded = false;
  }

  /**
   * Preloads all image streams completely into memory vectors before releasing game execution.
   */
  async initialize() {
    const assetManifest = {
      small: [small1, small2],
      medium: [med1, med2, med3, med4, med5, med6],
      tall: [tall1, tall2]
    };

    const loadPromises = [];

    Object.keys(assetManifest).forEach(poolKey => {
      assetManifest[poolKey].forEach(src => {
        const img = new Image();
        img.src = src;
        const p = new Promise(resolve => {
          img.onload = () => {
            this.sprites[poolKey].push(img);
            resolve();
          };
          img.onerror = () => {
            console.error(`Critical layout pipeline error: Failure loading ${src}`);
            resolve(); // Resolved defensively to prevent blocking game initialization on minor file errors
          };
        });
        loadPromises.push(p);
      });
    });

    await Promise.all(loadPromises);
    this.isLoaded = true;
  }

  /**
   * Fetches a random preloaded HTMLImageElement out of a size-indexed pool context.
   */
  getRandomSprite(poolType) {
    const targetedPool = this.sprites[poolType] || [];
    if (targetedPool.length === 0) return null;
    return targetedPool[Math.floor(Math.random() * targetedPool.length)];
  }
}