import React, { useState, useEffect } from 'react';
import { assetPath } from '../utils/assetPath';

export default function SpriteAnimator({ 
  characterFolder = 'jumpy', 
  action = 'idle', 
  frameCount = 6, 
  fps = 12, 
  className = "" 
}) {
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    // Reset back to initial index when context switches
    setCurrentFrame(0);

    const interval = setInterval(() => {
      setCurrentFrame((prevIndex) => (prevIndex + 1) % frameCount);
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [characterFolder, action, frameCount, fps]);

  // Builds path matching format: src/assets/animations/characterFolder/action/index.png
  const imagePath = assetPath(`assets/animations/${characterFolder}/${action}/${currentFrame}.png`);

  return (
    <img 
      src={imagePath} 
      alt={`${characterFolder} ${action} frame ${currentFrame}`} 
      className={`object-contain max-w-full max-h-full ${className}`}
      onError={(e) => {
        // Graceful transparent fallback overlay mesh if individual image file is missing
        e.target.style.opacity = '0';
      }}
    />
  );
}