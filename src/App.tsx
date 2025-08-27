import React from 'react';
import CharacterCreation from './components/CharacterCreation';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <div className="fixed inset-0">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col p-4">
        <CharacterCreation />
      </div>
    </div>
  );
}

export default App;