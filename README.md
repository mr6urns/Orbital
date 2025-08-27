# EXPLORE Character Creation System

A React-based 3D character creation system for space exploration games.

## Features

- **3D Character Preview** - Real-time rotating character model using Three.js
- **4 Customization Categories**:
  - Helmets (5 different styles with unique colors)
  - Suits (5 different types and colors)
  - Blasters (4 weapon types)
  - Body Colors (6 color options for limbs and accessories)
- **Responsive Design** - Works on desktop and mobile
- **Export Ready** - Designed for easy integration into other projects

## Installation

```bash
npm install
npm run dev
```

## Dependencies

```json
{
  "@react-three/fiber": "^8.18.0",
  "@types/three": "^0.165.0",
  "lucide-react": "^0.363.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "simplex-noise": "^4.0.1",
  "three": "^0.165.0"
}
```

## Integration

### As a Standalone Component

```tsx
import CharacterCreation from './components/CharacterCreation';

function MyApp() {
  const handleExplore = (characterData) => {
    console.log('Character created:', characterData);
    // Handle character data in your game
  };

  return (
    <CharacterCreation 
      onExplore={handleExplore}
      showExploreButton={true}
    />
  );
}
```

### Character Data Format

```typescript
interface CharacterData {
  helmet: {
    id: string;
    name: string;
    color: string;
    unlocked: boolean;
  };
  suit: {
    id: string;
    name: string;
    color: string;
    unlocked: boolean;
  };
  blaster: {
    id: string;
    name: string;
    unlocked: boolean;
  };
  bodyColor: {
    id: string;
    name: string;
    color: string;
    unlocked: boolean;
  };
}
```

## File Structure

```
src/
├── components/
│   ├── CharacterCreation.tsx    # Main character creation component
│   ├── CharacterPreview.tsx     # 3D character preview component
│   └── GameLauncher.tsx         # Simple explore button component
├── App.tsx                      # Main app wrapper
└── index.css                    # Styles including starfield background

public/
├── explore-game.js              # Game engine with character loading
├── explore-game.html            # Game HTML file
└── ...
```

## Key Components

### CharacterCreation
- Main component with tabbed interface
- Handles all customization logic
- Exports character data via callback or localStorage

### CharacterPreview  
- 3D character rendering using Three.js
- Real-time updates when customization changes
- Optimized for performance

### GameLauncher
- Simple button component for launching the game
- Navigates to `/explore-game.html`

## Game Integration

The system saves character data to `localStorage` as `characterData` and the game engine (`public/explore-game.js`) automatically loads and applies the customization to the in-game character model.

## Customization

- Add new items to the arrays in `CharacterCreation.tsx`
- Modify colors and styles in the component
- Extend the unlock system by changing `unlocked: false` for items
- Add new customization categories by extending the tab system

## Export Notes

- All items are currently unlocked for easy testing
- Component is fully self-contained and reusable
- Uses standard React patterns for easy integration
- Responsive design works across all screen sizes