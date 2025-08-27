import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface CharacterPreviewProps {
  characterType: string;
  color: string;
}

export default function CharacterPreview({ characterType, color }: CharacterPreviewProps) {
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
    const character = createCharacter(characterType, color);
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
  }, [characterType, color]);

  return <div ref={containerRef} className="w-full h-72" />;
}

function createCharacter(characterType: string, color: string): THREE.Group {
  const group = new THREE.Group();
  const scale = 1.5;

  // Define suit color based on character type
  let suitColor = 0xffffff; // Default white
  let backpackColor = 0xcccccc; // Default gray

  switch (characterType) {
    case 'scout':
      suitColor = 0x626262;
      break;
    case 'heavy':
      suitColor = 0x141414;
      backpackColor = 0x323232;
      break;
    case 'tech':
      suitColor = 0xffffff;
      break;
    case 'stealth':
      suitColor = 0xffffff;
      break;
    default:
      suitColor = 0xffffff;
      break;
  }

  // Body
  const bodyGeometry = new THREE.CapsuleGeometry(0.3 * scale, 0.5 * scale, 4, 8);
  const bodyMaterial = new THREE.MeshPhongMaterial({ color: suitColor });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  group.add(body);

  // Helmet
  const helmetGeometry = new THREE.SphereGeometry(0.35 * scale, 16, 16);
  const helmetMaterial = new THREE.MeshPhongMaterial({ 
    color: color,
    transparent: true,
    opacity: 0.8
  });
  const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
  helmet.position.y = 0.5 * scale;
  group.add(helmet);

  // Backpack
  const backpackGeometry = new THREE.BoxGeometry(0.4 * scale, 0.6 * scale, 0.2 * scale);
  const backpackMaterial = new THREE.MeshPhongMaterial({ color: backpackColor });
  const backpack = new THREE.Mesh(backpackGeometry, backpackMaterial);
  backpack.position.z = 0.3 * scale;
  group.add(backpack);

  // Arms
  const armGeometry = new THREE.CapsuleGeometry(0.1 * scale, 0.4 * scale, 4, 8);
  const armMaterial = new THREE.MeshPhongMaterial({ color: suitColor });
  
  const leftArm = new THREE.Mesh(armGeometry, armMaterial);
  leftArm.position.set(-0.4 * scale, 0, 0);
  group.add(leftArm);
  
  const rightArm = new THREE.Mesh(armGeometry, armMaterial);
  rightArm.position.set(0.4 * scale, 0, 0);
  group.add(rightArm);

  // Legs
  const legGeometry = new THREE.CapsuleGeometry(0.12 * scale, 0.4 * scale, 4, 8);
  const legMaterial = new THREE.MeshPhongMaterial({ color: suitColor });
  
  const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
  leftLeg.position.set(-0.2 * scale, -0.5 * scale, 0);
  group.add(leftLeg);
  
  const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
  rightLeg.position.set(0.2 * scale, -0.5 * scale, 0);
  group.add(rightLeg);

  return group;
}