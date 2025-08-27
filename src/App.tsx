import React, { useState, useEffect } from 'react';
import { Rocket, Users, Lock, ChevronLeft, ChevronRight, Palette, Zap, Shield, User } from 'lucide-react';
import CharacterPreview from './components/CharacterPreview';

console.log('App.tsx loading...');

const helmets = [
  { id: 'standard', name: 'Standard Helmet', color: '#2196f3', unlocked: true },
  { id: 'scout', name: 'Scout Visor', color: '#22c55e', unlocked: true },
  { id: 'heavy', name: 'Heavy Helmet', color: '#ef4444', unlocked: true },
  { id: 'tech', name: 'Tech Helmet', color: '#a855f7', unlocked: true },
  { id: 'stealth', name: 'Stealth Helmet', color: '#64748b', unlocked: true }
];

const suits = [
  { id: 'standard', name: 'Standard Suit', color: '#ffffff', unlocked: true },
  { id: 'tactical', name: 'Tactical Suit', color: '#626262', unlocked: true },
  { id: 'heavy', name: 'Heavy Armor', color: '#141414', unlocked: true },
  { id: 'explorer', name: 'Explorer Suit', color: '#f59e0b', unlocked: true },
  { id: 'stealth', name: 'Stealth Suit', color: '#1f2937', unlocked: true }
];

const blasters = [
  { id: 'standard', name: 'Standard Blaster', unlocked: true },
  { id: 'rapid', name: 'Rapid Fire', unlocked: true },
  { id: 'heavy', name: 'Heavy Cannon', unlocked: true },
  { id: 'plasma', name: 'Plasma Rifle', unlocked: true }
];

const bodyColors = [
  { id: 'white', name: 'Arctic White', color: '#ffffff', unlocked: true },
  { id: 'gray', name: 'Steel Gray', color: '#6b7280', unlocked: true },
  { id: 'blue', name: 'Deep Blue', color: '#1e40af', unlocked: true },
  { id: 'red', name: 'Crimson Red', color: '#dc2626', unlocked: true },
  { id: 'green', name: 'Forest Green', color: '#059669', unlocked: true },
  { id: 'purple', name: 'Royal Purple', color: '#7c3aed', unlocked: true }
];

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [showCharacterCreation, setShowCharacterCreation] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'helmet' | 'suit' | 'blaster' | 'color'>('helmet');
  
  // Character customization state
  const [selectedHelmet, setSelectedHelmet] = useState(0);
  const [selectedSuit, setSelectedSuit] = useState(0);
  const [selectedBlaster, setSelectedBlaster] = useState(0);
  const [selectedBodyColor, setSelectedBodyColor] = useState(0);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const startGame = (mode: 'single' | 'multi') => {
    setIsLoading(true);
    
    // Save character customization to localStorage
    const characterData = {
      helmet: helmets[selectedHelmet],
      suit: suits[selectedSuit],
      blaster: blasters[selectedBlaster],
      bodyColor: bodyColors[selectedBodyColor]
    };
    
    localStorage.setItem('characterData', JSON.stringify(characterData));
    
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
        window.location.href = mode === 'single' ? '/game-single.html' : '/game-multi.html';
      }, 800);
    });
  };

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'helmet': return helmets;
      case 'suit': return suits;
      case 'blaster': return blasters;
      case 'color': return bodyColors;
      default: return helmets;
    }
  };

  const getCurrentSelection = () => {
    switch (activeTab) {
      case 'helmet': return selectedHelmet;
      case 'suit': return selectedSuit;
      case 'blaster': return selectedBlaster;
      case 'color': return selectedBodyColor;
      default: return 0;
    }
  };

  const setCurrentSelection = (index: number) => {
    switch (activeTab) {
      case 'helmet': setSelectedHelmet(index); break;
      case 'suit': setSelectedSuit(index); break;
      case 'blaster': setSelectedBlaster(index); break;
      case 'color': setSelectedBodyColor(index); break;
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'helmet': return <Shield size={16} />;
      case 'suit': return <User size={16} />;
      case 'blaster': return <Zap size={16} />;
      case 'color': return <Palette size={16} />;
      default: return <Shield size={16} />;
    }
  };

  if (showCharacterCreation) {
    const currentItems = getCurrentItems();
    const currentSelection = getCurrentSelection();
    const currentItem = currentItems[currentSelection];
    
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
                Character Creation
              </h2>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col lg:flex-row">
              {/* Character Preview */}
              <div className="lg:w-1/2 p-4 sm:p-6 flex flex-col items-center">
                <div className="h-64 sm:h-80 w-full mb-4">
                  <CharacterPreview 
                    characterData={{
                      helmet: helmets[selectedHelmet],
                      suit: suits[selectedSuit],
                      blaster: blasters[selectedBlaster],
                      bodyColor: bodyColors[selectedBodyColor]
                    }}
                  />
                </div>
              </div>

              {/* Customization Panel */}
              <div className="lg:w-1/2 p-4 sm:p-6 border-t lg:border-t-0 lg:border-l border-cyan-500/30">
                {/* Tabs */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {(['helmet', 'suit', 'blaster', 'color'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`p-2 sm:p-3 rounded-lg border transition-all duration-200 flex flex-col items-center gap-1 ${
                        activeTab === tab
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {getTabIcon(tab)}
                      <span className="text-xs capitalize">{tab}</span>
                    </button>
                  ))}
                </div>

                {/* Item Selection */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <button 
                      onClick={() => {
                        const newIndex = (currentSelection - 1 + currentItems.length) % currentItems.length;
                        setCurrentSelection(newIndex);
                      }}
                      className="p-2 text-white/70 hover:text-white transition-colors"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    
                    <div className="text-center flex-1">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-white">
                          {currentItem.name}
                        </h3>
                        {!currentItem.unlocked && (
                          <Lock size={16} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex justify-center gap-1">
                        {currentItems.map((_, index) => (
                          <div
                            key={index}
                            className={`w-2 h-2 rounded-full ${
                              index === currentSelection ? 'bg-cyan-400' : 'bg-white/20'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        const newIndex = (currentSelection + 1) % currentItems.length;
                        setCurrentSelection(newIndex);
                      }}
                      className="p-2 text-white/70 hover:text-white transition-colors"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>

                  {/* Color Preview for color tab */}
                  {activeTab === 'color' && (
                    <div className="flex justify-center mb-4">
                      <div 
                        className="w-16 h-16 rounded-full border-2 border-white/20"
                        style={{ backgroundColor: currentItem.color }}
                      />
                    </div>
                  )}

                  {/* Item Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {currentItems.map((item, index) => (
                      <button
                        key={item.id}
                        onClick={() => currentItem.unlocked && setCurrentSelection(index)}
                        className={`aspect-square rounded-lg border-2 transition-all duration-200 flex items-center justify-center relative ${
                          index === currentSelection
                            ? 'border-cyan-500 bg-cyan-500/20'
                            : item.unlocked
                            ? 'border-white/20 bg-white/5 hover:border-white/40'
                            : 'border-gray-600 bg-gray-800/50 opacity-50'
                        }`}
                        disabled={!item.unlocked}
                      >
                        {activeTab === 'color' ? (
                          <div 
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                        ) : (
                          <span className="text-xs text-center px-1">
                            {item.name.split(' ')[0]}
                          </span>
                        )}
                        {!item.unlocked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Lock size={16} className="text-gray-400" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 sm:p-6 border-t border-cyan-500/30">
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <button
                  onClick={() => {
                    // For now, just close character creation
                    setShowCharacterCreation(false);
                  }}
                  className="px-4 sm:px-6 py-3 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors text-sm sm:text-base font-medium"
                >
                  Back
                </button>
                <button
                  onClick={() => startGame('single')}
                  className="px-4 sm:px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] text-sm sm:text-base hover:scale-105"
                >
                  Single Player
                </button>
                <button
                  onClick={() => startGame('multi')}
                  className="px-4 sm:px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] text-sm sm:text-base hover:scale-105"
                >
                  Multiplayer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show character creation by default
  if (!showCharacterCreation) {
    setShowCharacterCreation(true);
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden p-4">
      <div className="fixed inset-0">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>

      <div className="relative z-10 text-center">
        <p className="text-white">Loading character creation...</p>
      </div>
    </div>
  );
}

export default App;