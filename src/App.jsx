import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import MainMenu from './pages/MainMenu';
import CharacterSelect from './pages/CharacterSelect';
import GameScreen from './pages/GameScreen';
import { initializeAds } from './utils/AdService';
import { handleAndroidAuthCallback } from './utils/OAuthService';
import { supabase } from './supabaseClient';

export default function App() {
  // Game States: 'MENU', 'CHAR_SELECT', 'PLAYING'
  const [gameState, setGameState] = useState('MENU');
  const [finalScore, setFinalScore] = useState(0);
  const [finalCoins, setFinalCoins] = useState(0);
  const [userSession, setUserSession] = useState(null);
  
  const [selectedColor, setSelectedColor] = useState('#38bdf8');

  useEffect(() => {
    initializeAds();

    // 🌐 DESKTOP & GLOBAL AUTH LISTENER:
    // This listener automatically catches desktop redirects and updates user sessions cleanly
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("🌐 Initial getSession() result:", !!session, session); // 👈 debug
      setUserSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserSession(session);
      console.log("🔑 Auth state shift synchronized. Event:", _event, "| User logged in:", !!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 🤖 ANDROID DEEP-LINK LISTENER:
  // Catches custom URI callbacks when running as an installed app package
  useEffect(() => {
    console.log("📱 Is native platform?", Capacitor.isNativePlatform()); // 👈 debug

    if (!Capacitor.isNativePlatform()) return undefined;

    let listenerHandle;

    const registerListener = async () => {
      listenerHandle = await CapacitorApp.addListener('appUrlOpen', ({ url }) => {
        console.log("🔔 appUrlOpen fired with URL:", url); // 👈 debug
        void handleAndroidAuthCallback(url).catch((err) => {
          console.error('Android native auth callback execution exception:', err);
        });
      });
      console.log("✅ appUrlOpen listener registered"); // 👈 debug
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