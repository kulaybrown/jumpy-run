// src/utils/ObstacleManager.js

export class ObstacleManager {
  constructor() {
    this.isLoaded = false;
    this.images = {};
    this.types = ['wood', 'rock', 'spikeyball'];
  }

  initialize() {
    return new Promise((resolve, reject) => {
      // 1. Define the exact public paths to your assets
      const assetPaths = {
        wood: '/assets/obstacle-wood.png',
        rock: '/assets/obstacle-rock.png',
        spikeyball: '/assets/obstacle-spikeyball.png' // Adjust filenames to match your folder exactly
      };

      const typesToLoad = Object.keys(assetPaths);
      let loadedCount = 0;

      if (typesToLoad.length === 0) {
        this.isLoaded = true;
        resolve();
        return;
      }

      typesToLoad.forEach((type) => {
        const img = new Image();
        img.src = assetPaths[type];

        img.onload = () => {
          this.images[type] = img;
          loadedCount++;
          
          // Once all obstacles are fully ready, resolve the loader promise
          if (loadedCount === typesToLoad.length) {
            this.isLoaded = true;
            resolve();
          }
        };

        img.onerror = () => {
          // 🚨 Prints the exact culprit if an obstacle filename or folder path is wrong
          console.error(`🚨 ObstacleManager failed to load asset for type "${type}" at path: ${assetPaths[type]}`);
          
          // Resolve anyway so the game doesn't hang forever on a single missing texture
          loadedCount++;
          if (loadedCount === typesToLoad.length) {
            this.isLoaded = true;
            resolve();
          }
        };
      });
    });
  }

  getImage(type) {
    return this.images[type] || null;
  }

  getRandomType() {
    const randomIndex = Math.floor(Math.random() * this.types.length);
    return this.types[randomIndex];
  }
}