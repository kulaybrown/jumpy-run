import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import MainMenu from './pages/MainMenu';
import CharacterSelect from './pages/CharacterSelect';
import GameScreen from './pages/GameScreen';
import { initializeAds } from './utils/AdService';
import { handleOAuthCallbackUrl } from './utils/OAuthService';

export default function App() {
  // Game States: 'MENU', 'CHAR_SELECT', 'PLAYING', 'GAME_OVER'
  const [gameState, setGameState] = useState('MENU');
  const [finalScore, setFinalScore] = useState(0);
  const [finalCoins, setFinalCoins] = useState(0);
  
  // Keep track of the color chosen (Default to Cyan Blue)
  const [selectedColor, setSelectedColor] = useState('#38bdf8');

  useEffect(() => {
    initializeAds();
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;

    let listenerHandle;

    const registerListener = async () => {
      listenerHandle = await CapacitorApp.addListener('appUrlOpen', ({ url }) => {
        void handleOAuthCallbackUrl(url).catch((err) => {
          console.error('Native OAuth callback handling failed:', err);
        });
      });
    };

    void registerListener();

    return () => {
      if (listenerHandle) {
        void listenerHandle.remove();
      }
    };
  }, []);

  const goToCharacterSelect = () => {
    setGameState('CHAR_SELECT');
  };

  const handleStartGame = (color) => {
    setSelectedColor(color);
    setGameState('PLAYING');
  };

  const triggerGameOver = (score, coins) => {
    setFinalScore(score);
    setFinalCoins(coins);
    setGameState('GAME_OVER');
  };

  return (
    <div className="w-screen h-screen bg-slate-900 text-white flex items-center justify-center overflow-hidden font-sans select-none">
      {gameState === 'MENU' && (
        <MainMenu onStartGame={goToCharacterSelect} />
      )}

      {gameState === 'CHAR_SELECT' && (
        <CharacterSelect 
          onSelectCharacter={handleStartGame} 
          onBack={() => setGameState('MENU')} 
        />
      )}
      
      {gameState === 'PLAYING' && (
        <GameScreen playerColor={selectedColor} onMainMenu={() => setGameState('MENU')}  />
      )}
      
    </div>
  );
}