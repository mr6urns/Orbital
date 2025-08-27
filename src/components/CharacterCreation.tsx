import React, { useState } from 'react';
import { Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import CharacterPreview from './CharacterPreview';

interface CharacterCreationProps {
  onExplore?: (characterData: any) => void;
  showExploreButton?: boolean;
}

const helmets = [
  { id: 'standard', name: 'Standard Helmet', color: '#2196f3', unlocked: true },
  { id: 'tactical', name: 'Tactical Visor', color: '#22c55e', unlocked: true },
  { id: 'heavy', name: 'Heavy Duty', color: '#ef4444', unlocked: true },
  { id: 'stealth', name: 'Stealth Module', color: '#64748b', unlocked: true },
  { id: 'quantum', name: 'Quantum Field', color: '#a855f7', unlocked: true }
];

const suits = [
  { id: 'explorer', name: 'Explorer Suit', color: '#ffffff', unlocked: true },
  { id: 'scout', name: 'Scout Armor', color: '#626262', unlocked: true },
  { id: 'heavy', name: 'Heavy Armor', color: '#141414', unlocked: true },
  { id: 'tech', name: 'Tech Suit', color: '#ffffff', unlocked: true },
  { id: 'stealth', name: 'Stealth Suit', color: '#ffffff', unlocked: true }
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
  { id: 'green', name: 'Forest Green', color: '#166534', unlocked: true },
  { id: 'red', name: 'Crimson Red', color: '#dc2626', unlocked: true },
  { id: 'purple', name: 'Royal Purple', color: '#7c3aed', unlocked: true }
];

export default function CharacterCreation({ onExplore, showExploreButton = true }: CharacterCreationProps) {
  const [activeTab, setActiveTab] = useState('helmets');
  const [selectedHelmet, setSelectedHelmet] = useState(0);
  const [selectedSuit, setSelectedSuit] = useState(0);
  const [selectedBlaster, setSelectedBlaster] = useState(0);
  const [selectedBodyColor, setSelectedBodyColor] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleExplore = () => {
    const characterData = {
      helmet: helmets[selectedHelmet],
      suit: suits[selectedSuit],
      blaster: blasters[selectedBlaster],
      bodyColor: bodyColors[selectedBodyColor]
    };

    // Save to localStorage for game integration
    localStorage.setItem('characterData', JSON.stringify(characterData));

    if (onExplore) {
      onExplore(characterData);
    } else {
      // Default behavior - navigate to game
      window.location.href = '/explore-game.html';
    }
  };

  const tabs = [
    { id: 'helmets', name: 'Helmets', icon: '🪖' },
    { id: 'suits', name: 'Suits', icon: '🦺' },
    { id: 'blasters', name: 'Blasters', icon: '🔫' },
    { id: 'colors', name: 'Colors', icon: '🎨' }
  ];

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'helmets': return helmets;
      case 'suits': return suits;
      case 'blasters': return blasters;
      case 'colors': return bodyColors;
      default: return [];
    }
  };

  const getCurrentSelected = () => {
    switch (activeTab) {
      case 'helmets': return selectedHelmet;
      case 'suits': return selectedSuit;
      case 'blasters': return selectedBlaster;
      case 'colors': return selectedBodyColor;
      default: return 0;
    }
  };

  const setCurrentSelected = (index: number) => {
    switch (activeTab) {
      case 'helmets': setSelectedHelmet(index); break;
      case 'suits': setSelectedSuit(index); break;
      case 'blasters': setSelectedBlaster(index); break;
      case 'colors': setSelectedBodyColor(index); break;
    }
  };

  const currentItems = getCurrentItems();
  const currentSelected = getCurrentSelected();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <div className="fixed inset-0">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col p-4">
        <div className="bg-black/80 rounded-lg border border-cyan-500 shadow-[0_0_40px_rgba(56,189,248,0.3)] flex-1 flex flex-col max-w-4xl mx-auto">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-cyan-500/30">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 text-center">
              Character Creation
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-cyan-500/30">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 p-3 sm:p-4 text-center transition-colors ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="text-lg sm:text-xl mb-1">{tab.icon}</div>
                <div className="text-xs sm:text-sm font-mono">{tab.name}</div>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col lg:flex-row">
            {/* Character Preview */}
            <div className="lg:w-1/2 p-4 sm:p-6 flex flex-col items-center justify-center">
              <div className="w-full max-w-sm">
                <CharacterPreview 
                  characterType={suits[selectedSuit].id}
                  color={helmets[selectedHelmet].color}
                />
              </div>
            </div>

            {/* Customization Panel */}
            <div className="lg:w-1/2 p-4 sm:p-6 border-t lg:border-t-0 lg:border-l border-cyan-500/30">
              <div className="space-y-4">
                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentSelected(Math.max(0, currentSelected - 1))}
                    disabled={currentSelected === 0}
                    className="p-2 text-white/70 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  
                  <div className="text-center flex-1">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-white">
                        {currentItems[currentSelected]?.name}
                      </h3>
                      {!currentItems[currentSelected]?.unlocked && (
                        <Lock size={16} className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex justify-center gap-1">
                      {currentItems.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === currentSelected ? 'bg-cyan-400' : 'bg-white/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setCurrentSelected(Math.min(currentItems.length - 1, currentSelected + 1))}
                    disabled={currentSelected === currentItems.length - 1}
                    className="p-2 text-white/70 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>

                {/* Item Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {currentItems.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentSelected(index)}
                      disabled={!item.unlocked}
                      className={`relative p-4 rounded-lg border transition-all ${
                        index === currentSelected
                          ? 'border-cyan-400 bg-cyan-500/20'
                          : item.unlocked
                          ? 'border-white/20 bg-white/5 hover:border-cyan-400/50'
                          : 'border-gray-600 bg-gray-800/50 cursor-not-allowed'
                      }`}
                    >
                      {!item.unlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                          <Lock size={20} className="text-gray-400" />
                        </div>
                      )}
                      
                      <div className="text-center">
                        {'color' in item && (
                          <div 
                            className="w-8 h-8 rounded-full mx-auto mb-2 border-2 border-white/20"
                            style={{ backgroundColor: item.color }}
                          />
                        )}
                        <div className="text-xs font-mono text-white">
                          {item.name}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {showExploreButton && (
            <div className="p-4 sm:p-6 border-t border-cyan-500/30">
              <div className="flex justify-center">
                <button
                  onClick={handleExplore}
                  className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:scale-105 text-sm sm:text-base"
                >
                  Start Exploring
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}