import React from 'react';

interface GameLauncherProps {
  onExplore?: () => void;
}

export default function GameLauncher({ onExplore }: GameLauncherProps) {
  const handleExplore = () => {
    if (onExplore) {
      onExplore();
    } else {
      // Navigate to the EXPLORE game
      window.location.href = '/explore-game.html';
    }
  };

  return (
    <button
      onClick={handleExplore}
      className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:scale-105"
    >
      Explore
    </button>
  );
}