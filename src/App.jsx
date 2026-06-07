import React, { useState } from 'react';
import MainMenu from './pages/MainMenu';
import CharacterSelect from './pages/CharacterSelect';
import GameScreen from './pages/GameScreen';
import GameOverScreen from './pages/GameOverScreen';

export default function App() {
  // Game States: 'MENU', 'CHAR_SELECT', 'PLAYING', 'GAME_OVER'
  const [gameState, setGameState] = useState('MENU');
  const [finalScore, setFinalScore] = useState(0);
  const [finalCoins, setFinalCoins] = useState(0);
  
  // Keep track of the color chosen (Default to Cyan Blue)
  const [selectedColor, setSelectedColor] = useState('#38bdf8');

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
    <div className="w-full h-screen bg-slate-900 text-white flex items-center justify-center overflow-hidden font-sans select-none">
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
        <GameScreen playerColor={selectedColor} onGameOver={triggerGameOver} />
      )}
      
      {gameState === 'GAME_OVER' && (
        <GameOverScreen 
          score={finalScore} 
          coins={finalCoins} 
          onRestart={goToCharacterSelect} 
          onMainMenu={() => setGameState('MENU')} 
        />
      )}
    </div>
  );
}