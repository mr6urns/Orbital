import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface CharacterData {
  helmet: { id: string; name: string; color: string; unlocked: boolean };
  suit: { id: string; name: string; color: string; unlocked: boolean };
  blaster: { id: string; name: string; unlocked: boolean };
  bodyColor: { id: string; name: string; color: string; unlocked: boolean };
}

interface CharacterPreviewProps {
  characterData: CharacterData;
}

export default function CharacterPreview({ characterData }: CharacterPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const characterRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 9;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create character
    const character = createCharacter(characterData);
    scene.add(character);
    characterRef.current = character;

    // Animation loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (characterRef.current) {
        characterRef.current.rotation.y += 0.01;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [characterData]);

  return <div ref={containerRef} className="w-full h-full" />;
}

function createCharacter(characterData: CharacterData): THREE.Group {
  const group = new THREE.Group();
  const scale = 1.5;

  // Body - use suit color
  const bodyGeometry = new THREE.CapsuleGeometry(0.3 * scale, 0.5 * scale, 4, 8);
  const bodyMaterial = new THREE.MeshPhongMaterial({ color: characterData.suit.color });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  group.add(body);

  // Helmet - use helmet color
  const helmetGeometry = new THREE.SphereGeometry(0.35 * scale, 16, 16);
  const helmetMaterial = new THREE.MeshPhongMaterial({ 
    color: characterData.helmet.color,
    transparent: true,
    opacity: 0.8
  });
  const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
  helmet.position.y = 0.5 * scale;
  group.add(helmet);

  // Backpack - use body color
  const backpackGeometry = new THREE.BoxGeometry(0.4 * scale, 0.6 * scale, 0.2 * scale);
  const backpackMaterial = new THREE.MeshPhongMaterial({ color: characterData.bodyColor.color });
  const backpack = new THREE.Mesh(backpackGeometry, backpackMaterial);
  backpack.position.z = 0.3 * scale;
  group.add(backpack);

  // Arms - use body color
  const armGeometry = new THREE.CapsuleGeometry(0.1 * scale, 0.4 * scale, 4, 8);
  const armMaterial = new THREE.MeshPhongMaterial({ color: characterData.suit.color });
  
  const leftArm = new THREE.Mesh(armGeometry, armMaterial);
  leftArm.position.set(-0.4 * scale, 0, 0);
  group.add(leftArm);
  
  const rightArm = new THREE.Mesh(armGeometry, armMaterial);
  rightArm.position.set(0.4 * scale, 0, 0);
  group.add(rightArm);

  // Legs - use body color
  const legGeometry = new THREE.CapsuleGeometry(0.12 * scale, 0.4 * scale, 4, 8);
  const legMaterial = new THREE.MeshPhongMaterial({ color: characterData.suit.color });
  
  const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
  leftLeg.position.set(-0.2 * scale, -0.5 * scale, 0);
  group.add(leftLeg);
  
  const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
  rightLeg.position.set(0.2 * scale, -0.5 * scale, 0);
  group.add(rightLeg);

  // Blaster - create different styles based on blaster type
  const blaster = createBlaster(characterData.blaster.id, scale);
  blaster.position.set(0.4 * scale, -0.2 * scale, 0.1 * scale);
  blaster.rotation.x = -Math.PI / 2;
  group.add(blaster);

  return group;
}

function createBlaster(blasterType: string, scale: number): THREE.Group {
  const blasterGroup = new THREE.Group();

  switch (blasterType) {
    case 'rapid':
      // Smaller, sleeker design
      const rapidBody = new THREE.BoxGeometry(0.08, 0.12, 0.3);
      const rapidMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
      const rapidMesh = new THREE.Mesh(rapidBody, rapidMaterial);
      blasterGroup.add(rapidMesh);
      break;

    case 'heavy':
      // Larger, bulkier design
      const heavyBody = new THREE.BoxGeometry(0.15, 0.2, 0.5);
      const heavyMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
      const heavyMesh = new THREE.Mesh(heavyBody, heavyMaterial);
      blasterGroup.add(heavyMesh);
      break;

    case 'plasma':
      // Futuristic design with glowing elements
      const plasmaBody = new THREE.BoxGeometry(0.12, 0.16, 0.4);
      const plasmaMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x444444,
        emissive: 0x0066ff,
        emissiveIntensity: 0.2
      });
      const plasmaMesh = new THREE.Mesh(plasmaBody, plasmaMaterial);
      blasterGroup.add(plasmaMesh);
      break;

    default: // standard
      // Standard blaster design
      const bodyGeometry = new THREE.BoxGeometry(0.1, 0.15, 0.4);
      const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      blasterGroup.add(body);

      const barrelGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8);
      const barrelMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
      const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.z = 0.3;
      blasterGroup.add(barrel);
      break;
  }

  blasterGroup.scale.set(scale, scale, scale);
  return blasterGroup;
}