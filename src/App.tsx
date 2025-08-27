import React, { useState, useEffect } from 'react';
import { Rocket, Users, Lock, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import CharacterPreview from './components/CharacterPreview';

console.log('App.tsx loading...');

const characters = [
  {
    id: 'astronaut',
    name: 'ORBITAL EXPLORER',
    description: 'Standard-issue explorer suit with balanced capabilities.',
    stats: {
      speed: 70,
      jetpack: 80,
      shield: 60,
      weapon: 65
    },
    color: '#38bdf8',
    unlocked: true
  },
  {
    id: 'scout',
    name: 'VELOCITY SCOUT',
    description: 'Lightweight suit focused on speed and maneuverability.',
    stats: {
      speed: 90,
      jetpack: 85,
      shield: 40,
      weapon: 50
    },
    color: '#22c55e',
    unlocked: true
  },
  {
    id: 'heavy',
    name: 'TITAN DEFENDER',
    description: 'Heavy-duty suit with superior protection and firepower.',
    stats: {
      speed: 40,
      jetpack: 60,
      shield: 90,
      weapon: 85
    },
    color: '#ef4444',
    unlocked: true
  },
  {
    id: 'tech',
    name: 'QUANTUM ENGINEER',
    description: 'Advanced suit with experimental technology integration.',
    stats: {
      speed: 60,
      jetpack: 75,
      shield: 70,
      weapon: 70
    },
    color: '#a855f7',
    unlocked: true
  },
  {
    id: 'stealth',
    name: 'SHADOW OPERATIVE',
    description: 'Specialized suit designed for covert operations.',
    stats: {
      speed: 80,
      jetpack: 70,
      shield: 50,
      weapon: 75
    },
    color: '#64748b',
    unlocked: false
  }
];

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(0);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [gameMode, setGameMode] = useState<'single' | 'multi' | null>(null);
  const [characterSelected, setCharacterSelected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [players, setPlayers] = useState([
    { id: 1, name: 'Player 1', ready: true },
    { id: 2, name: null, ready: false },
    { id: 3, name: null, ready: false },
    { id: 4, name: null, ready: false }
  ]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const startGame = () => {
    setIsLoading(true);
    
    localStorage.setItem('selectedCharacter', characters[selectedCharacter].id);
    
    const transition = document.createElement('div');
    transition.style.position = 'fixed';
    transition.style.inset = '0';
    transition.style.background = 'black';
    transition.style.zIndex = '9999';
    transition.style.opacity = '0';
    transition.style.transition = 'opacity 0.5s ease';
    document.body.appendChild(transition);

    const loadingText = document.createElement('div');
    loadingText.style.position = 'absolute';
    loadingText.style.top = '50%';
    loadingText.style.left = '50%';
    loadingText.style.transform = 'translate(-50%, -50%)';
    loadingText.style.color = '#38bdf8';
    loadingText.style.fontFamily = '"Share Tech Mono", monospace';
    loadingText.style.fontSize = isMobile ? '18px' : '24px';
    loadingText.textContent = 'INITIALIZING...';
    transition.appendChild(loadingText);

    requestAnimationFrame(() => {
      transition.style.opacity = '1';
      setTimeout(() => {
        window.location.href = gameMode === 'single' ? '/game-single.html' : '/game-multi.html';
      }, 800);
    });
  };

  const startMultiplayer = () => {
    setShowQueue(true);
    const joinInterval = setInterval(() => {
      setPlayers(current => {
        const nextEmpty = current.findIndex(p => !p.name);
        if (nextEmpty === -1) {
          clearInterval(joinInterval);
          setTimeout(() => {
            startGame();
          }, 1000);
          return current;
        }
        const updated = [...current];
        updated[nextEmpty] = {
          ...updated[nextEmpty],
          name: `Player ${nextEmpty + 1}`,
          ready: true
        };
        return updated;
      });
    }, 2000);
  };

  const StatBar = ({ value, color }: { value: number; color: string }) => (
    <div className="h-2 w-full bg-white/10 rounded overflow-hidden">
      <div 
        className="h-full transition-all duration-300"
        style={{ 
          width: `${value}%`,
          backgroundColor: color
        }}
      />
    </div>
  );

  if (showQueue) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden p-4">
        <div className="fixed inset-0">
          <div className="stars"></div>
          <div className="twinkling"></div>
        </div>

        <div className="relative z-10 bg-black/80 p-4 sm:p-6 md:p-8 rounded-lg border border-cyan-500 shadow-[0_0_40px_rgba(56,189,248,0.3)] w-full max-w-md">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-6 md:mb-8 text-center">
            Waiting for Players...
          </h2>

          <div className="grid gap-3 sm:gap-4">
            {players.map((player, index) => (
              <div 
                key={player.id}
                className={`flex items-center justify-between p-3 sm:p-4 rounded-lg ${
                  player.ready 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <span className="text-white font-mono text-sm sm:text-base">
                  {player.name || `Waiting for Player ${index + 1}`}
                </span>
                {player.ready ? (
                  <span className="text-cyan-400 text-sm sm:text-base">Ready</span>
                ) : (
                  <div className="animate-spin text-gray-500">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showCharacterSelect) {
    const character = characters[selectedCharacter];
    
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
        <div className="fixed inset-0">
          <div className="stars"></div>
          <div className="twinkling"></div>
        </div>

        <div className="relative z-10 w-full h-full flex flex-col p-4">
          <div className="bg-black/80 rounded-lg border border-cyan-500 shadow-[0_0_40px_rgba(56,189,248,0.3)] flex-1 flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-cyan-500/30">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 text-center">
                Select Your Character
              </h2>
            </div>

            {/* Character Display */}
            <div className="flex-1 flex flex-col">
              {/* Mobile Character Navigation */}
              {isMobile ? (
                <div className="flex-1 flex flex-col">
                  {/* Character Preview */}
                  <div className="p-4 flex-shrink-0">
                    <div className="h-48 mb-4">
                      <CharacterPreview 
                        characterType={character.id}
                        color={character.color}
                      />
                    </div>
                    
                    {/* Character Navigation */}
                    <div className="flex items-center justify-between mb-4">
                      <button 
                        onClick={() => {
                          setSelectedCharacter(prev => (prev - 1 + characters.length) % characters.length);
                          setCharacterSelected(false);
                        }}
                        className="p-2 text-white/70 hover:text-white transition-colors"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      
                      <div className="text-center flex-1">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <h3 className="text-lg font-bold" style={{ color: character.color }}>
                            {character.name}
                          </h3>
                          {!character.unlocked && (
                            <Lock size={16} className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex justify-center gap-1">
                          {characters.map((_, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full ${
                                index === selectedCharacter ? 'bg-cyan-400' : 'bg-white/20'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => {
                          setSelectedCharacter(prev => (prev + 1) % characters.length);
                          setCharacterSelected(false);
                        }}
                        className="p-2 text-white/70 hover:text-white transition-colors"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </div>
                  </div>

                  {/* Character Info */}
                  <div className="p-4 flex-1 overflow-y-auto">
                    <p className="text-sm text-gray-400 mb-6 text-center">{character.description}</p>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-400">Speed</span>
                          <span className="text-sm" style={{ color: character.color }}>{character.stats.speed}%</span>
                        </div>
                        <StatBar value={character.stats.speed} color={character.color} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-400">Jetpack</span>
                          <span className="text-sm" style={{ color: character.color }}>{character.stats.jetpack}%</span>
                        </div>
                        <StatBar value={character.stats.jetpack} color={character.color} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-400">Shield</span>
                          <span className="text-sm" style={{ color: character.color }}>{character.stats.shield}%</span>
                        </div>
                        <StatBar value={character.stats.shield} color={character.color} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-400">Weapon</span>
                          <span className="text-sm" style={{ color: character.color }}>{character.stats.weapon}%</span>
                        </div>
                        <StatBar value={character.stats.weapon} color={character.color} />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Desktop Layout */
                <div className="flex items-center gap-8 p-6 flex-1">
                  <button 
                    onClick={() => {
                      setSelectedCharacter(prev => (prev - 1 + characters.length) % characters.length);
                      setCharacterSelected(false);
                    }}
                    className="text-white/50 hover:text-white transition-colors p-2"
                  >
                    <ChevronLeft size={32} />
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold" style={{ color: character.color }}>
                        {character.name}
                      </h3>
                      {!character.unlocked && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Lock size={16} />
                          <span className="text-sm">Locked</span>
                        </div>
                      )}
                    </div>

                    <div className="mb-8">
                      <CharacterPreview 
                        characterType={character.id}
                        color={character.color}
                      />
                    </div>

                    <p className="text-base text-gray-400 mb-8">{character.description}</p>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-400">Speed</span>
                          <span className="text-sm" style={{ color: character.color }}>{character.stats.speed}%</span>
                        </div>
                        <StatBar value={character.stats.speed} color={character.color} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-400">Jetpack</span>
                          <span className="text-sm" style={{ color: character.color }}>{character.stats.jetpack}%</span>
                        </div>
                        <StatBar value={character.stats.jetpack} color={character.color} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-400">Shield</span>
                          <span className="text-sm" style={{ color: character.color }}>{character.stats.shield}%</span>
                        </div>
                        <StatBar value={character.stats.shield} color={character.color} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-400">Weapon</span>
                          <span className="text-sm" style={{ color: character.color }}>{character.stats.weapon}%</span>
                        </div>
                        <StatBar value={character.stats.weapon} color={character.color} />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setSelectedCharacter(prev => (prev + 1) % characters.length);
                      setCharacterSelected(false);
                    }}
                    className="text-white/50 hover:text-white transition-colors p-2"
                  >
                    <ChevronRight size={32} />
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-4 sm:p-6 border-t border-cyan-500/30">
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <button
                  onClick={() => {
                    setShowCharacterSelect(false);
                    setGameMode(null);
                    setCharacterSelected(false);
                  }}
                  className="px-4 sm:px-6 py-3 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors text-sm sm:text-base font-medium"
                >
                  Back
                </button>
                <button
                  onClick={() => setCharacterSelected(true)}
                  disabled={!character.unlocked || characterSelected}
                  className={`px-4 sm:px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] text-sm sm:text-base ${
                    !character.unlocked || characterSelected ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                  }`}
                >
                  {characterSelected ? 'Selected' : 'Select'}
                </button>
                <button
                  onClick={() => {
                    if (gameMode === 'single') {
                      startGame();
                    } else {
                      startMultiplayer();
                    }
                  }}
                  disabled={!characterSelected}
                  className={`px-4 sm:px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] text-sm sm:text-base ${
                    !characterSelected ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <div className="fixed inset-0">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>

      <div className="relative z-10 text-center px-4 w-full max-w-md sm:max-w-lg">
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-8 sm:mb-12 tracking-widest animate-[float_6s_ease-in-out_infinite]">
          ORBITAL
        </h1>
        
        <div className="flex flex-col gap-4 sm:gap-6 items-center">
          <button 
            onClick={() => {
              setGameMode('single');
              setShowCharacterSelect(true);
            }}
            disabled={isLoading}
            className={`group relative px-6 sm:px-8 py-3 sm:py-4 w-full max-w-xs overflow-hidden rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-base sm:text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(56,189,248,0.6)] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors duration-300"></div>
            <span className="flex items-center justify-center gap-2">
              <Rocket className={isLoading ? 'animate-spin' : 'animate-pulse'} size={isMobile ? 20 : 24} />
              {isLoading ? 'Launching...' : 'Single Player'}
            </span>
          </button>

          <button 
            onClick={() => {
              setGameMode('multi');
              setShowCharacterSelect(true);
            }}
            disabled={isLoading}
            className="group relative px-6 sm:px-8 py-3 sm:py-4 w-full max-w-xs overflow-hidden rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-base sm:text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(56,189,248,0.6)]"
          >
            <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors duration-300"></div>
            <span className="flex items-center justify-center gap-2">
              <Users className={isLoading ? 'animate-spin' : 'animate-pulse'} size={isMobile ? 20 : 24} />
              {isLoading ? 'Launching...' : 'Player vs Player'}
            </span>
          </button>
        </div>

        {/* Mobile Instructions */}
        {isMobile && (
          <div className="mt-8 p-4 bg-black/40 rounded-lg border border-cyan-500/30">
            <p className="text-xs text-gray-400 text-center">
              For the best experience, use landscape orientation when playing
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;