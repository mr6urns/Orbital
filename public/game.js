// Debug logging
console.log('Game.js loading...');

import * as THREE from 'three';
import { createNoise2D, createNoise3D } from 'simplex-noise';

console.log('Three.js imported:', THREE);
console.log('Noise functions imported');

// Scene setup
console.log('Setting up scene...');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
console.log('Renderer added to DOM');

// Lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Initialize vectors
const playerForward = new THREE.Vector3(0, 0, -1);
const playerUp = new THREE.Vector3(0, 1, 0);
let targetPlayerUp = new THREE.Vector3(0, 1, 0);

// Hexagonal map parameters
const hexMapRadius = 50; // Large hexagonal map radius
const gravity = 9.8; // Standard gravity pointing downward
let currentGravity = gravity;
const mapHeight = 2; // Height of the hexagonal terrain

// Noise for terrain generation
const noise2D = createNoise2D();
const noise3D = createNoise3D();

// Mobile detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

// Touch controls for mobile
let touchControls = {
    movement: { x: 0, y: 0 },
    jetpack: false,
    shoot: false
};

if (isMobile) {
    setupTouchControls();
}

function setupTouchControls() {
    const joystick = document.getElementById('movement-joystick');
    const knob = joystick?.querySelector('.joystick-knob');
    const jetpackButton = document.getElementById('jetpack-button');
    const shootButton = document.getElementById('shoot-button');

    if (!joystick || !knob) return;

    let joystickActive = false;
    let joystickCenter = { x: 0, y: 0 };

    // Movement joystick
    function handleJoystickStart(e) {
        e.preventDefault();
        joystickActive = true;
        const rect = joystick.getBoundingClientRect();
        joystickCenter.x = rect.left + rect.width / 2;
        joystickCenter.y = rect.top + rect.height / 2;
    }

    function handleJoystickMove(e) {
        if (!joystickActive) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - joystickCenter.x;
        const deltaY = touch.clientY - joystickCenter.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = 25;

        if (distance <= maxDistance) {
            knob.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
            touchControls.movement.x = deltaX / maxDistance;
            touchControls.movement.y = -deltaY / maxDistance; // Invert Y for game coordinates
        } else {
            const angle = Math.atan2(deltaY, deltaX);
            const limitedX = Math.cos(angle) * maxDistance;
            const limitedY = Math.sin(angle) * maxDistance;
            knob.style.transform = `translate(calc(-50% + ${limitedX}px), calc(-50% + ${limitedY}px))`;
            touchControls.movement.x = limitedX / maxDistance;
            touchControls.movement.y = -limitedY / maxDistance;
        }
    }

    function handleJoystickEnd(e) {
        e.preventDefault();
        joystickActive = false;
        knob.style.transform = 'translate(-50%, -50%)';
        touchControls.movement.x = 0;
        touchControls.movement.y = 0;
    }

    joystick.addEventListener('touchstart', handleJoystickStart);
    document.addEventListener('touchmove', handleJoystickMove);
    document.addEventListener('touchend', handleJoystickEnd);

    // Action buttons
    if (jetpackButton) {
        jetpackButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchControls.jetpack = true;
        });

        jetpackButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            touchControls.jetpack = false;
        });
    }

    if (shootButton) {
        shootButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            shoot();
        });

        shootButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            touchControls.shoot = false;
        });
    }
}

// Create starfield dome
function createStarfield() {
    const starCount = isMobile ? 800 : 1500; // Optimized for dome
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    
    // Create dome parameters
    const domeRadius = hexMapRadius * 3; // Dome extends well beyond the hex map
    const minHeight = mapHeight + 10; // Minimum height above the map
    
    for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        
        // Generate stars only in the upper hemisphere (dome)
        const theta = Math.random() * Math.PI * 2; // Full rotation around Y axis
        const phi = Math.random() * Math.PI * 0.5; // Only upper hemisphere (0 to PI/2)
        
        // Vary the radius for depth
        const radius = domeRadius + Math.random() * domeRadius * 0.5;
        
        // Convert spherical to cartesian coordinates
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = Math.max(radius * Math.cos(phi), minHeight); // Ensure stars are above map
        const z = radius * Math.sin(phi) * Math.sin(theta);
        
        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: isMobile ? 1.2 : 1.8,
        sizeAttenuation: false
    });

    const stars = new THREE.Points(geometry, material);
    stars.renderOrder = -1; // Render behind everything else
    return stars;
}

const starfield = createStarfield();
scene.add(starfield);

// Create perfect hexagonal fog barrier
function createBarrierWall() {
    const barrierGroup = new THREE.Group();
    const wallHeight = 20; // Make them tall
    const wallRadius = hexMapRadius - 0.5; // Position slightly inside boundary

    // Create 6 tall barriers forming perfect hexagon perimeter
    for (let side = 0; side < 6; side++) {
        // Calculate the two vertices of this hexagon edge
        const angle1 = side * Math.PI / 3;
        const angle2 = (side + 1) * Math.PI / 3;
        
        const vertex1X = Math.cos(angle1) * wallRadius;
        const vertex1Z = Math.sin(angle1) * wallRadius;
        const vertex2X = Math.cos(angle2) * wallRadius;
        const vertex2Z = Math.sin(angle2) * wallRadius;
        
        // Calculate center point and length of this edge
        const centerX = (vertex1X + vertex2X) / 2;
        const centerZ = (vertex1Z + vertex2Z) / 2;
        const wallLength = Math.sqrt(
            Math.pow(vertex2X - vertex1X, 2) + 
            Math.pow(vertex2Z - vertex1Z, 2)
        );
        
        // Calculate angle for wall rotation (perpendicular to edge)
        const edgeAngle = Math.atan2(vertex2Z - vertex1Z, vertex2X - vertex1X);
        
        // Create tall barrier wall
        const barrierGeometry = new THREE.PlaneGeometry(wallLength, wallHeight, 1, 1);
        const barrierMaterial = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        
        const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
        barrier.position.set(centerX, mapHeight + wallHeight / 2, centerZ);
        barrier.rotation.y = edgeAngle + Math.PI / 2; // Rotate to be perpendicular to edge
        
        barrier.userData = {
            originalOpacity: 0.6,
            pulseSpeed: 0.5,
            pulseOffset: side * Math.PI / 3
        };
        
        barrierGroup.add(barrier);
    }
    
    return barrierGroup;
}

const barrierWall = createBarrierWall();
scene.add(barrierWall);

// Health system
const maxHealth = 100;
let currentHealth = maxHealth;
const healthRegenRate = 5;
const healthRegenDelay = 5;
let lastDamageTime = 0;

function updateHealthUI() {
    const healthFill = document.getElementById('health-fill');
    const healthValue = document.getElementById('health-value');
    if (healthFill && healthValue) {
        healthFill.style.width = `${(currentHealth / maxHealth) * 100}%`;
        healthValue.textContent = `${Math.round(currentHealth)}%`;
    }
}

function takeDamage(amount) {
    currentHealth = Math.max(0, currentHealth - amount);
    lastDamageTime = Date.now() / 1000;
    updateHealthUI();

    const damageFlash = document.querySelector('.damage-flash');
    if (damageFlash) {
        damageFlash.classList.add('active');
        setTimeout(() => damageFlash.classList.remove('active'), 200);
    }

    if (currentHealth <= 0) {
        console.log('Player died!');
    }
}

// Jetpack system
const maxJetpackEnergy = 100;
let jetpackEnergy = maxJetpackEnergy;
const jetpackRechargeRate = 24;
const jetpackDrainRate = 40;

function updateJetpackUI() {
    const energyFill = document.getElementById('energy-fill');
    if (energyFill) {
        energyFill.style.width = `${(jetpackEnergy / maxJetpackEnergy) * 100}%`;
    }
}

// Blaster system
const maxAmmo = 100;
let currentAmmo = maxAmmo;
const ammoRechargeRate = 2;
const projectileSpeed = 50;
const projectiles = [];
const projectileGeometry = new THREE.SphereGeometry(0.1, 8, 8);
const projectileMaterial = new THREE.MeshPhongMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0
});

function updateAmmoUI() {
    const ammoFill = document.getElementById('ammo-fill');
    if (ammoFill) {
        ammoFill.style.width = `${(currentAmmo / maxAmmo) * 100}%`;
    }
}

// Projectiles and impact effects
const impactParticles = [];

function createImpactEffect(position) {
    const particles = [];
    const particleCount = isMobile ? 4 : 8;
    const particleGeometry = new THREE.SphereGeometry(0.02, 4, 4);
    const particleMaterial = new THREE.MeshPhongMaterial({
        color: 0x38bdf8,
        emissive: 0x38bdf8,
        emissiveIntensity: 1,
        transparent: true,
        opacity: 0.8
    });

    for (let i = 0; i < particleCount; i++) {
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.copy(position);
        
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4
        );
        
        particle.velocity = velocity;
        particle.life = 0.5;
        particles.push(particle);
        scene.add(particle);
    }

    return particles;
}

function updateImpactEffects(delta) {
    for (let i = impactParticles.length - 1; i >= 0; i--) {
        const particle = impactParticles[i];
        particle.life -= delta;
        
        if (particle.life <= 0) {
            scene.remove(particle);
            impactParticles.splice(i, 1);
            continue;
        }

        particle.material.opacity = particle.life * 2;
        particle.position.add(particle.velocity.clone().multiplyScalar(delta));
        particle.velocity.multiplyScalar(0.95);
    }
}

function checkTerrainCollision(position, hexMap) {
    // Check if position is within the hexagonal map bounds
    const mapCenter = hexMap.center;
    const distanceFromCenter = Math.sqrt(
        Math.pow(position.x - mapCenter.x, 2) + 
        Math.pow(position.z - mapCenter.z, 2)
    );
    
    // If outside hexagon bounds, collision with invisible walls
    if (distanceFromCenter > hexMapRadius) {
        return true;
    }
    
    let terrainHeight = mapHeight;
    let minDistance = Infinity;
    
    hexMap.hexPositions.forEach(hexPos => {
        const distance = Math.sqrt(
            Math.pow(position.x - hexPos.x, 2) + 
            Math.pow(position.z - hexPos.z, 2)
        );
        
        if (distance < minDistance) {
            minDistance = distance;
            const noiseValue = noise3D(hexPos.x * 0.1, 0, hexPos.z * 0.1);
            const heightLevels = Math.round((noiseValue + 1) * 1.5);
            terrainHeight = mapHeight + heightLevels * 0.5;
        }
    });

    return position.y < terrainHeight + 0.2;
}

function updateProjectiles(delta) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        
        if (projectile.alive) {
            const oldPosition = projectile.position.clone();
            projectile.position.add(projectile.velocity.clone().multiplyScalar(delta));
            projectile.age += delta;
            
            if (projectile.fadeIn < 1) {
                projectile.fadeIn = Math.min(1, projectile.fadeIn + delta * 5);
                projectile.material.opacity = projectile.fadeIn * 0.8;
            }
            
            // Check collision with hex map
            if (checkTerrainCollision(projectile.position, hexMap)) {
                const impactPos = oldPosition.clone();
                const newParticles = createImpactEffect(impactPos);
                impactParticles.push(...newParticles);
                
                scene.remove(projectile);
                projectiles.splice(i, 1);
                continue;
            }

            if (projectile.age > 2) {
                scene.remove(projectile);
                projectiles.splice(i, 1);
            }
        }
    }
}

function shoot() {
    if (currentAmmo >= 10) {
        const projectile = new THREE.Mesh(
            projectileGeometry,
            projectileMaterial.clone()
        );
        
        projectile.position.copy(camera.position);
        
        const direction = new THREE.Vector3(0, 0, -1)
            .applyQuaternion(camera.quaternion)
            .normalize();
            
        projectile.velocity = direction.multiplyScalar(projectileSpeed);
        projectile.alive = true;
        projectile.age = 0;
        projectile.fadeIn = 0;
        
        scene.add(projectile);
        projectiles.push(projectile);
        
        currentAmmo = Math.max(0, currentAmmo - 5);
        updateAmmoUI();
    }
}

// Animation parameters
const walkSpeed = 10;
const legAmplitude = 0.3;
const armSwingAmplitude = 0.2;
let walkCycle = 0;

// Create astronaut character
function createAstronaut(characterType = 'astronaut') {
    const group = new THREE.Group();
    const scale = 0.5;

    // Define character colors
    const characterColors = {
        astronaut: {
            suit: 0xffffff,
            helmet: 0x2196f3,
            backpack: 0xcccccc
        },
        scout: {
            suit: 0x626262,
            helmet: 0x22c55e,
            backpack: 0xcccccc
        },
        heavy: {
            suit: 0x141414,
            helmet: 0xef4444,
            backpack: 0x323232
        },
        tech: {
            suit: 0xffffff,
            helmet: 0xa855f7,
            backpack: 0xcccccc
        },
        stealth: {
            suit: 0xffffff,
            helmet: 0x64748b,
            backpack: 0xcccccc
        }
    };

    const colors = characterColors[characterType] || characterColors.astronaut;

    // Body
    const bodyGeometry = new THREE.CapsuleGeometry(0.3 * scale, 0.5 * scale, 4, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: colors.suit });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);

    // Helmet
    const helmetGeometry = new THREE.SphereGeometry(0.35 * scale, 16, 16);
    const helmetMaterial = new THREE.MeshPhongMaterial({ 
        color: colors.helmet,
        transparent: true,
        opacity: 0.8
    });
    const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
    helmet.position.y = 0.5 * scale;
    group.add(helmet);

    // Backpack
    const backpackGeometry = new THREE.BoxGeometry(0.4 * scale, 0.6 * scale, 0.2 * scale);
    const backpackMaterial = new THREE.MeshPhongMaterial({ color: colors.backpack });
    const backpack = new THREE.Mesh(backpackGeometry, backpackMaterial);
    backpack.position.z = 0.3 * scale;
    group.add(backpack);

    // Arms
    const armGeometry = new THREE.CapsuleGeometry(0.1 * scale, 0.4 * scale, 4, 8);
    const armMaterial = new THREE.MeshPhongMaterial({ color: colors.suit });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.4 * scale, 0, 0);
    group.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.4 * scale, 0, 0);
    group.add(rightArm);

    // Legs
    const legGeometry = new THREE.CapsuleGeometry(0.12 * scale, 0.4 * scale, 4, 8);
    const legMaterial = new THREE.MeshPhongMaterial({ color: colors.suit });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.2 * scale, -0.5 * scale, 0);
    group.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.2 * scale, -0.5 * scale, 0);
    group.add(rightLeg);

    return group;
}

function generateHexagonalMap(center) {
    const hexRadius = 0.866;
    const hexHeight = 0.5;
    const mapGroup = new THREE.Group();
    mapGroup.position.copy(center);
    
    const hexPositions = [];
    const segments = Math.ceil(hexMapRadius / (hexRadius * 2));
    
    // Generate hexagonal grid pattern
    for (let q = -segments; q <= segments; q++) {
        for (let r = Math.max(-segments, -q-segments); r <= Math.min(segments, -q+segments); r++) {
            const s = -q - r;
            
            if (Math.abs(s) <= segments) {
                const x = hexRadius * (Math.sqrt(3) * q + Math.sqrt(3)/2 * r);
                const z = hexRadius * (3/2 * r);
                
                const distanceFromCenter = Math.sqrt(x * x + z * z);
                
                // Only include hexes within the map radius
                if (distanceFromCenter <= hexMapRadius) {
                    const pos = new THREE.Vector3(x, 0, z);
                    
                    if (!hexPositions.some(existing => 
                        existing.distanceTo(pos) < hexRadius * 1.5)) {
                        hexPositions.push(pos);
                    }
                }
            }
        }
    }

    const hexGeometry = new THREE.CylinderGeometry(hexRadius, hexRadius, hexHeight, 6);
    
    hexPositions.forEach(pos => {
        const noiseValue = noise3D(pos.x * 0.1, 0, pos.z * 0.1);
        const heightLevels = Math.round((noiseValue + 1) * 1.5);

        for (let level = 0; level <= heightLevels; level++) {
            const hexMaterial = new THREE.MeshPhongMaterial({
                color: level === heightLevels ? 
                    (noiseValue > 0.3 ? 0x888888 : 0x00aa00) : 
                    0x666666
            });

            const hex = new THREE.Mesh(hexGeometry, hexMaterial);
            const position = new THREE.Vector3(
                pos.x,
                mapHeight + level * hexHeight,
                pos.z
            );
            hex.position.copy(position);

            // Hexes lay flat on the ground
            hex.rotation.x = 0;
            
            hex.userData = { type: noiseValue > 0.3 ? 'stone' : 'grass' };
            mapGroup.add(hex);
        }
    });

    scene.add(mapGroup);
    return { 
        group: mapGroup, 
        center, 
        radius: hexMapRadius,
        gravity: gravity,
        hexPositions 
    };
}

// Get selected character from localStorage
const selectedCharacter = localStorage.getItem('selectedCharacter') || 'astronaut';

// Player
const player = createAstronaut(selectedCharacter);
scene.add(player);

// Player physics
const playerVelocity = new THREE.Vector3();
const playerSpeed = 8.0;
const friction = 0.92;
const jumpForce = 4.0;
const maxVelocity = 10.0;
const jetpackForce = 30.0;
let isJumping = false;
let jetpackActive = true;

// Camera settings
const cameraOffset = new THREE.Vector3(0, 1.5, 3);
const cameraMinDistance = 2;
const cameraMaxDistance = 8;
const cameraSmoothness = 0.1;
let currentCameraUp = new THREE.Vector3(0, 1, 0);
let targetCameraRotation = new THREE.Quaternion();
let currentCameraRotation = new THREE.Quaternion();

// Mouse control
let isMouseLocked = false;
const mouseSensitivity = isMobile ? 0.003 : 0.002;
let yaw = 0;
let pitch = 0;
const maxPitch = Math.PI * 0.35;

// Touch controls for camera on mobile
let touchStartX = 0;
let touchStartY = 0;
let isTouchingScreen = false;

if (isMobile) {
    // Touch controls for camera movement
    renderer.domElement.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            isTouchingScreen = true;
        }
    });

    renderer.domElement.addEventListener('touchmove', (e) => {
        if (isTouchingScreen && e.touches.length === 1) {
            e.preventDefault();
            const deltaX = e.touches[0].clientX - touchStartX;
            const deltaY = e.touches[0].clientY - touchStartY;
            
            yaw -= deltaX * mouseSensitivity;
            pitch -= deltaY * mouseSensitivity;
            pitch = Math.max(-maxPitch, Math.min(maxPitch, pitch));
            
            const euler = new THREE.Euler(pitch, yaw, 0, 'YXZ');
            targetCameraRotation.setFromEuler(euler);
            
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }
    });

    renderer.domElement.addEventListener('touchend', () => {
        isTouchingScreen = false;
    });
} else {
    // Desktop mouse controls
    document.addEventListener('click', () => {
        if (!isMouseLocked) {
            renderer.domElement.requestPointerLock();
        } else {
            shoot();
        }
    });

    document.addEventListener('pointerlockchange', () => {
        isMouseLocked = document.pointerLockElement === renderer.domElement;
    });

    document.addEventListener('mousemove', (event) => {
        if (isMouseLocked) {
            yaw -= event.movementX * mouseSensitivity;
            pitch -= event.movementY * mouseSensitivity;
            pitch = Math.max(-maxPitch, Math.min(maxPitch, pitch));
            
            const euler = new THREE.Euler(pitch, yaw, 0, 'YXZ');
            targetCameraRotation.setFromEuler(euler);
        }
    });
}

function updatePlayer(delta) {
    if (!hexMap) return;

    const up = new THREE.Vector3(0, 1, 0); // Always point upward for flat terrain
    
    // Handle jetpack input (keyboard or touch)
    const jetpackInput = (isMobile ? touchControls.jetpack : keys[' ']);
    
    if (jetpackInput && jetpackEnergy > 0 && jetpackActive) {
        jetpackEnergy = Math.max(0, jetpackEnergy - jetpackDrainRate * delta);
        playerVelocity.add(up.clone().multiplyScalar(jetpackForce * delta));
        
        if (jetpackEnergy === 0) {
            jetpackActive = false;
        }
        
        updateJetpackUI();
    } else {
        if (jetpackEnergy < maxJetpackEnergy) {
            jetpackEnergy = Math.min(maxJetpackEnergy, jetpackEnergy + jetpackRechargeRate * delta);
            
            if (jetpackEnergy === maxJetpackEnergy) {
                jetpackActive = true;
            }
            
            updateJetpackUI();
        }
    }

    if (currentAmmo < maxAmmo) {
        currentAmmo = Math.min(maxAmmo, currentAmmo + ammoRechargeRate * delta);
        updateAmmoUI();
    }

    // Health regeneration
    const currentTime = Date.now() / 1000;
    if (currentHealth < maxHealth && currentTime - lastDamageTime > healthRegenDelay) {
        currentHealth = Math.min(maxHealth, currentHealth + healthRegenRate * delta);
        updateHealthUI();
    }

    // Apply downward gravity
    playerVelocity.add(new THREE.Vector3(0, -currentGravity * delta, 0));

    const viewCameraForward = new THREE.Vector3(0, 0, -1).applyQuaternion(currentCameraRotation);
    const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(currentCameraRotation);
    
    // For flat terrain, just use the horizontal components
    const surfaceForward = new THREE.Vector3(viewCameraForward.x, 0, viewCameraForward.z).normalize();
    const surfaceRight = new THREE.Vector3(cameraRight.x, 0, cameraRight.z).normalize();

    const moveDirection = new THREE.Vector3();
    
    // Handle movement input (keyboard or touch)
    if (isMobile) {
        if (Math.abs(touchControls.movement.x) > 0.1 || Math.abs(touchControls.movement.y) > 0.1) {
            moveDirection.add(surfaceForward.clone().multiplyScalar(touchControls.movement.y));
            moveDirection.add(surfaceRight.clone().multiplyScalar(touchControls.movement.x));
        }
    } else {
        if (keys['w']) moveDirection.add(surfaceForward);
        if (keys['s']) moveDirection.sub(surfaceForward);
        if (keys['a']) moveDirection.sub(surfaceRight);
        if (keys['d']) moveDirection.add(surfaceRight);
    }

    if (moveDirection.length() > 0) {
        moveDirection.normalize().multiplyScalar(playerSpeed * delta);
        playerVelocity.add(moveDirection);
    }

    if (playerVelocity.length() > maxVelocity) {
        playerVelocity.normalize().multiplyScalar(maxVelocity);
    }

    playerVelocity.multiplyScalar(friction);

    const nextPosition = player.position.clone().add(playerVelocity.clone().multiplyScalar(delta));
    
    // Check if player is within map bounds
    const distanceFromCenter = Math.sqrt(
        Math.pow(nextPosition.x - hexMap.center.x, 2) + 
        Math.pow(nextPosition.z - hexMap.center.z, 2)
    );
    
    // Enhanced barrier collision with smooth pushback
    const barrierDistance = hexMapRadius - 2; // Barrier is slightly inside the visual wall
    if (distanceFromCenter > barrierDistance) {
        const direction = new THREE.Vector3(
            nextPosition.x - hexMap.center.x,
            0,
            nextPosition.z - hexMap.center.z
        ).normalize();
        
        // Smooth pushback effect
        const pushbackForce = (distanceFromCenter - barrierDistance) * 10;
        nextPosition.x = hexMap.center.x + direction.x * barrierDistance;
        nextPosition.z = hexMap.center.z + direction.z * barrierDistance;
        
        // Apply pushback to velocity
        playerVelocity.x -= direction.x * pushbackForce * delta;
        playerVelocity.z -= direction.z * pushbackForce * delta;
        
        // Create barrier hit effect
        if (Math.random() < 0.1) { // 10% chance per frame when touching barrier
            const sparkGeometry = new THREE.SphereGeometry(0.05, 4, 4);
            const sparkMaterial = new THREE.MeshPhongMaterial({
                color: 0x38bdf8,
                emissive: 0x38bdf8,
                emissiveIntensity: 1,
                transparent: true,
                opacity: 0.8
            });
            
            const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
            spark.position.set(
                nextPosition.x + direction.x * 0.5,
                nextPosition.y + Math.random() * 2,
                nextPosition.z + direction.z * 0.5
            );
            
            spark.userData = { life: 0.5, fadeSpeed: 2 };
            scene.add(spark);
            
            // Add to impact particles for cleanup
            impactParticles.push(spark);
        }
    }
    
    let terrainHeight = mapHeight;
    
    let minDistance = Infinity;
    hexMap.hexPositions.forEach(hexPos => {
        const distance = Math.sqrt(
            Math.pow(nextPosition.x - hexPos.x, 2) + 
            Math.pow(nextPosition.z - hexPos.z, 2)
        );
        
        if (distance < minDistance) {
            minDistance = distance;
            const noiseValue = noise3D(hexPos.x * 0.1, 0, hexPos.z * 0.1);
            const heightLevels = Math.round((noiseValue + 1) * 1.5);
            terrainHeight = mapHeight + heightLevels * 0.5;
        }
    });

    // Ground collision
    if (nextPosition.y < terrainHeight + 0.8) {
        nextPosition.y = terrainHeight + 0.8;
        
        const dot = playerVelocity.y;
        if (dot < 0) {
            playerVelocity.y = 0;
            isJumping = false;

            const fallSpeed = -dot;
            if (fallSpeed > 15) {
                const damage = Math.floor((fallSpeed - 15) * 2);
                takeDamage(damage);
            }
        }
    }

    player.position.copy(nextPosition);

    // Keep player upright without rotating with camera
    // Make player body follow the camera direction horizontally, but keep feet on ground
    const cameraForward = new THREE.Vector3(0, 0, -1).applyQuaternion(currentCameraRotation);
    const horizontalForward = new THREE.Vector3(cameraForward.x, 0, cameraForward.z).normalize();
    
    // Calculate rotation to face camera direction
    const targetRotation = Math.atan2(horizontalForward.x, horizontalForward.z) + Math.PI;
    player.rotation.y = targetRotation;
    player.rotation.x = 0; // Keep feet on ground
    player.rotation.z = 0; // No roll
}

function updateCamera() {
    currentCameraRotation.slerp(targetCameraRotation, cameraSmoothness);
    
    // For flat terrain, up is always (0, 1, 0)
    targetPlayerUp.set(0, 1, 0);
    playerUp.lerp(targetPlayerUp, cameraSmoothness);
    playerUp.normalize();

    const cameraForward = new THREE.Vector3(0, 0, -1).applyQuaternion(currentCameraRotation);
    playerForward.set(cameraForward.x, 0, cameraForward.z).normalize();

    const targetPosition = player.position.clone()
        .add(playerUp.clone().multiplyScalar(cameraOffset.y))
        .add(cameraForward.clone().multiplyScalar(-cameraOffset.z));

    camera.position.lerp(targetPosition, cameraSmoothness);
    camera.quaternion.copy(currentCameraRotation);
    camera.up.copy(playerUp);
}

// Initialize game
const hexMap = generateHexagonalMap(new THREE.Vector3(0, 0, 0));
player.position.set(0, mapHeight + 2, 0);
console.log('Game initialized, starting animation loop...');

// Initialize UI
updateHealthUI();
updateJetpackUI();
updateAmmoUI();

// Animation loop
const fixedTimeStep = 1/60;
let lastTime = 0;
let accumulator = 0;

function animate(currentTime) {
    requestAnimationFrame(animate);

    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
    lastTime = currentTime;
    accumulator += deltaTime;

    while (accumulator >= fixedTimeStep) {
        updatePlayer(fixedTimeStep);
        updateProjectiles(fixedTimeStep);
        updateImpactEffects(fixedTimeStep);
        
        // Animate barrier wall particles
        if (barrierWall) {
            barrierWall.children.forEach(child => {
                if (child.userData.pulseSpeed !== undefined) {
                    // Animate fog walls with subtle pulsing
                    child.userData.pulseOffset += child.userData.pulseSpeed * fixedTimeStep;
                    const pulse = (Math.sin(child.userData.pulseOffset) + 1) * 0.5;
                    child.material.opacity = child.userData.originalOpacity * (0.7 + pulse * 0.3);
                }
            });
        }
        
        // Rotate starfield slowly
        starfield.rotation.y += 0.0001;
        
        accumulator -= fixedTimeStep;
    }

    updateCamera();
    const gravityElement = document.getElementById('gravity-value');
    if (gravityElement) {
        gravityElement.textContent = `${currentGravity.toFixed(1)} m/s²`;
    }
    renderer.render(scene, camera);
}

console.log('Starting first animation frame...');
requestAnimationFrame(animate);

// Keyboard controls (desktop only)
const keys = {};
if (!isMobile) {
    window.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Prevent zoom on mobile
document.addEventListener('touchmove', function (event) {
    if (event.scale !== 1) { 
        event.preventDefault(); 
    }
}, { passive: false });

// Prevent context menu on long press
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});