import React from 'react';
import GameLauncher from './components/GameLauncher';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <div className="fixed inset-0">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>

      <div className="relative z-10 text-center px-4 w-full max-w-md sm:max-w-lg">
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-8 sm:mb-12 tracking-widest animate-[float_6s_ease-in-out_infinite]">
          EXPLORE
        </h1>
        
        <div className="flex flex-col gap-4 sm:gap-6 items-center">
          <GameLauncher />
        </div>
      </div>
    </div>
  );
}

export default App;