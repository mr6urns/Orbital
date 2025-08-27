import * as THREE from 'three';
import { createNoise2D, createNoise3D } from 'simplex-noise';

// Scene setup
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
    const knob = joystick.querySelector('.joystick-knob');
    const jetpackButton = document.getElementById('jetpack-button');
    const shootButton = document.getElementById('shoot-button');

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
    jetpackButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchControls.jetpack = true;
    });

    jetpackButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        touchControls.jetpack = false;
    });

    shootButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchControls.shoot = true;
        // Trigger shooting
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
    });

    shootButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        touchControls.shoot = false;
    });
}

// Create starfield
function createStarfield() {
    const starCount = isMobile ? 1000 : 2000; // Reduce stars on mobile for performance
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        const radius = 500;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: isMobile ? 1.5 : 2,
        sizeAttenuation: false
    });

    const stars = new THREE.Points(geometry, material);
    stars.renderOrder = -1;
    return stars;
}

const starfield = createStarfield();
scene.add(starfield);

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

// Planet parameters
const planetRadius = 20;
const moonRadius = 5;
const planetGravity = 12.0;
const moonGravity = 3.0;
let currentGravity = planetGravity;

// Orbital parameters
const orbitRadius = 40;
const orbitSpeed = 0.1;
let orbitAngle = 0;

// Noise for terrain generation
const noise2D = createNoise2D();
const noise3D = createNoise3D();

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

function createImpactEffect(position, isMoon = false) {
    const particles = [];
    const particleCount = isMobile ? 4 : 8; // Reduce particles on mobile
    const particleGeometry = new THREE.SphereGeometry(0.02, 4, 4);
    const particleMaterial = new THREE.MeshPhongMaterial({
        color: isMoon ? 0xcccccc : 0x38bdf8,
        emissive: isMoon ? 0xcccccc : 0x38bdf8,
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

let impactParticles = [];

function checkTerrainCollision(position, celestialBody) {
    const distanceFromCenter = position.distanceTo(celestialBody.center);
    let terrainHeight = celestialBody.radius;
    let minDistance = Infinity;
    
    celestialBody.hexPositions.forEach(hexPos => {
        const hexWorldPos = hexPos.clone()
            .normalize()
            .multiplyScalar(celestialBody.radius)
            .add(celestialBody.center);
        const distance = position.distanceTo(hexWorldPos);
        
        if (distance < minDistance) {
            minDistance = distance;
            const noiseValue = noise3D(hexPos.x * 0.1, hexPos.y * 0.1, hexPos.z * 0.1);
            const heightLevels = Math.round((noiseValue + 1) * 1.5);
            terrainHeight = celestialBody.radius + heightLevels * 0.5;
        }
    });

    return distanceFromCenter < terrainHeight + 0.2;
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
            
            // Check collision with planet
            if (checkTerrainCollision(projectile.position, planet)) {
                const impactPos = oldPosition.clone();
                const newParticles = createImpactEffect(impactPos, false);
                impactParticles.push(...newParticles);
                
                scene.remove(projectile);
                projectiles.splice(i, 1);
                continue;
            }
            
            // Check collision with moon
            const moonWorldPos = moon.center.clone().add(moon.group.position);
            const moonCollision = checkTerrainCollision(
                projectile.position.clone().sub(moon.group.position),
                { ...moon, center: new THREE.Vector3(0, 0, 0) }
            );
            
            if (moonCollision) {
                const impactPos = oldPosition.clone();
                const newParticles = createImpactEffect(impactPos, true);
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

function createRayGun() {
    const gunGroup = new THREE.Group();

    const bodyGeometry = new THREE.BoxGeometry(0.1, 0.15, 0.4);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x444444,
        metalness: 0.8,
        roughness: 0.2
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    gunGroup.add(body);

    const barrelGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8);
    const barrelMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x666666,
        metalness: 0.9,
        roughness: 0.1
    });
    const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = 0.3;
    gunGroup.add(barrel);

    const coreGeometry = new THREE.SphereGeometry(0.04, 8, 8);
    const coreMaterial = new THREE.MeshPhongMaterial({
        color: 0x38bdf8,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.5
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.y = 0.08;
    gunGroup.add(core);

    return gunGroup;
}

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

    const bodyGeometry = new THREE.CapsuleGeometry(0.3 * scale, 0.5 * scale, 4, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: colors.suit });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);

    const helmetGeometry = new THREE.SphereGeometry(0.35 * scale, 16, 16);
    const helmetMaterial = new THREE.MeshPhongMaterial({ 
        color: colors.helmet,
        transparent: true,
        opacity: 0.8
    });
    const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
    helmet.position.y = 0.5 * scale;
    group.add(helmet);

    const backpackGeometry = new THREE.BoxGeometry(0.4 * scale, 0.6 * scale, 0.2 * scale);
    const backpackMaterial = new THREE.MeshPhongMaterial({ color: colors.backpack });
    const backpack = new THREE.Mesh(backpackGeometry, backpackMaterial);
    backpack.position.z = 0.3 * scale;
    group.add(backpack);

    const leftArmJoint = new THREE.Group();
    leftArmJoint.position.set(-0.4 * scale, 0.2 * scale, 0);
    group.add(leftArmJoint);

    const rightArmJoint = new THREE.Group();
    rightArmJoint.position.set(0.4 * scale, 0.2 * scale, 0);
    group.add(rightArmJoint);

    const leftLegJoint = new THREE.Group();
    leftLegJoint.position.set(-0.2 * scale, -0.3 * scale, 0);
    group.add(leftLegJoint);

    const rightLegJoint = new THREE.Group();
    rightLegJoint.position.set(0.2 * scale, -0.3 * scale, 0);
    group.add(rightLegJoint);

    const armGeometry = new THREE.CapsuleGeometry(0.1 * scale, 0.4 * scale, 4, 8);
    const armMaterial = new THREE.MeshPhongMaterial({ color: colors.suit });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.y = -0.2 * scale;
    leftArmJoint.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.y = -0.2 * scale;
    rightArmJoint.add(rightArm);

    const legGeometry = new THREE.CapsuleGeometry(0.12 * scale, 0.4 * scale, 4, 8);
    const legMaterial = new THREE.MeshPhongMaterial({ color: colors.suit });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.y = -0.2 * scale;
    leftLegJoint.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.y = -0.2 * scale;
    rightLegJoint.add(rightLeg);

    const rayGun = createRayGun();
    rayGun.scale.set(scale, scale, scale);
    rayGun.position.set(0, -0.2 * scale, 0.1 * scale);
    rayGun.rotation.x = -Math.PI / 2;
    rightArmJoint.add(rayGun);

    group.rotateX(Math.PI / 2);
    
    return group;
}

// Get selected character from localStorage
const selectedCharacter = localStorage.getItem('selectedCharacter') || 'astronaut';

// Player
const player = createAstronaut(selectedCharacter);
scene.add(player);

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
const mouseSensitivity = isMobile ? 0.003 : 0.002; // Slightly higher sensitivity on mobile
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
        } else if (currentAmmo >= 10) {
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

function updateAmmoUI() {
    const ammoFill = document.getElementById('ammo-fill');
    if (ammoFill) {
        ammoFill.style.width = `${(currentAmmo / maxAmmo) * 100}%`;
    }
}

function generatePlanet(center, radius, isMoon = false) {
    const hexRadius = 0.866;
    const hexHeight = 0.5;
    const planetGroup = new THREE.Group();
    planetGroup.position.copy(center);
    
    const coreGeometry = new THREE.SphereGeometry(radius - hexHeight, isMobile ? 16 : 32, isMobile ? 16 : 32);
    const coreMaterial = new THREE.MeshPhongMaterial({
        color: isMoon ? 0x666666 : 0x553322,
        shininess: 0,
        flatShading: true
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    planetGroup.add(core);
    
    const hexPositions = [];
    const segments = Math.ceil(radius * Math.PI / (hexRadius * 2));
    
    for (let q = -segments; q <= segments; q++) {
        for (let r = Math.max(-segments, -q-segments); r <= Math.min(segments, -q+segments); r++) {
            const s = -q - r;
            
            if (Math.abs(s) <= segments) {
                const x = hexRadius * (Math.sqrt(3) * q + Math.sqrt(3)/2 * r);
                const z = hexRadius * (3/2 * r);
                
                const distanceFromCenter = Math.sqrt(x*x + z*z);
                const angle = distanceFromCenter / radius;
                
                if (angle <= Math.PI) {
                    const phi = Math.atan2(z, x);
                    const theta = angle;
                    
                    const pos = new THREE.Vector3(
                        radius * Math.sin(theta) * Math.cos(phi),
                        radius * Math.cos(theta),
                        radius * Math.sin(theta) * Math.sin(phi)
                    );
                    
                    if (!hexPositions.some(existing => 
                        existing.distanceTo(pos) < hexRadius * 1.5)) {
                        hexPositions.push(pos);
                    }
                }
            }
        }
    }

    const hexShape = new THREE.Shape();
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = hexRadius * Math.cos(angle);
        const y = hexRadius * Math.sin(angle);
        if (i === 0) {
            hexShape.moveTo(x, y);
        } else {
            hexShape.lineTo(x, y);
        }
    }
    hexShape.closePath();

    const extrudeSettings = {
        depth: hexHeight,
        bevelEnabled: false
    };

    const hexGeometry = new THREE.ExtrudeGeometry(hexShape, extrudeSettings);
    hexGeometry.rotateX(Math.PI / 2);

    hexPositions.forEach(pos => {
        const noiseValue = noise3D(pos.x * 0.1, pos.y * 0.1, pos.z * 0.1);
        const heightLevels = Math.round((noiseValue + 1) * 1.5);

        for (let level = 0; level <= heightLevels; level++) {
            const hexMaterial = new THREE.MeshPhongMaterial({
                color: isMoon ? 0x888888 :
                    (level === heightLevels ? 
                        (noiseValue > 0.3 ? 0x888888 : 0x00aa00) : 
                        0x666666)
            });

            const hex = new THREE.Mesh(hexGeometry, hexMaterial);
            const direction = pos.clone().normalize();
            const position = direction.multiplyScalar(radius + level * hexHeight);
            hex.position.copy(position);

            const up = position.clone().normalize();
            const forward = new THREE.Vector3(0, 1, 0);
            const right = new THREE.Vector3().crossVectors(up, forward).normalize();
            forward.crossVectors(right, up).normalize();
            
            const rotationMatrix = new THREE.Matrix4().makeBasis(right, up, forward);
            hex.quaternion.setFromRotationMatrix(rotationMatrix);
            
            hex.userData = { type: noiseValue > 0.3 ? 'stone' : 'grass' };
            planetGroup.add(hex);
        }
    });

    scene.add(planetGroup);
    return { 
        group: planetGroup, 
        center, 
        radius, 
        gravity: radius === planetRadius ? planetGravity : moonGravity,
        hexPositions 
    };
}

// Player physics
const playerVelocity = new THREE.Vector3();
const playerSpeed = 8.0;
const friction = 0.92;
const jumpForce = 4.0;
const maxVelocity = 10.0;
const jetpackForce = 30.0;
const maxJetpackEnergy = 100;
let jetpackEnergy = maxJetpackEnergy;
const jetpackRechargeRate = 24;
const jetpackDrainRate = 40;
let isJumping = false;
let jetpackActive = true;

// Animation parameters
const walkSpeed = 10;
const legAmplitude = 0.3;
const armSwingAmplitude = 0.2;
let walkCycle = 0;
let isRightArmSwinging = false;

function updatePlayer(delta) {
    if (!currentPlanet) return;

    const up = player.position.clone().sub(currentPlanet.center).normalize();
    
    // Handle jetpack input (keyboard or touch)
    const jetpackInput = (isMobile ? touchControls.jetpack : keys[' ']);
    
    if (jetpackInput && jetpackEnergy > 0 && jetpackActive) {
        jetpackEnergy = Math.max(0, jetpackEnergy - jetpackDrainRate * delta);
        playerVelocity.add(up.clone().multiplyScalar(jetpackForce * delta));
        
        if (jetpackEnergy === 0) {
            jetpackActive = false;
        }
        
        const energyFill = document.getElementById('energy-fill');
        if (energyFill) {
            energyFill.style.width = `${(jetpackEnergy / maxJetpackEnergy) * 100}%`;
        }
    } else {
        if (jetpackEnergy < maxJetpackEnergy) {
            jetpackEnergy = Math.min(maxJetpackEnergy, jetpackEnergy + jetpackRechargeRate * delta);
            
            if (jetpackEnergy === maxJetpackEnergy) {
                jetpackActive = true;
            }
            
            const energyFill = document.getElementById('energy-fill');
            if (energyFill) {
                energyFill.style.width = `${(jetpackEnergy / maxJetpackEnergy) * 100}%`;
            }
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

    playerVelocity.add(up.clone().multiplyScalar(-currentGravity * delta));

    const cameraForward = new THREE.Vector3(0, 0, -1).applyQuaternion(currentCameraRotation);
    const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(currentCameraRotation);
    
    const surfaceForward = cameraForward.clone().sub(up.clone().multiplyScalar(cameraForward.dot(up))).normalize();
    const surfaceRight = cameraRight.clone().sub(up.clone().multiplyScalar(cameraRight.dot(up))).normalize();

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
    const distanceFromCenter = nextPosition.distanceTo(currentPlanet.center);
    
    let terrainHeight = currentPlanet.radius;
    const playerDirection = nextPosition.clone().sub(currentPlanet.center).normalize();
    
    let minDistance = Infinity;
    currentPlanet.hexPositions.forEach(hexPos => {
        const hexWorldPos = hexPos.clone()
            .normalize()
            .multiplyScalar(currentPlanet.radius)
            .add(currentPlanet.center);
        const distance = nextPosition.distanceTo(hexWorldPos);
        
        if (distance < minDistance) {
            minDistance = distance;
            const noiseValue = noise3D(hexPos.x * 0.1, hexPos.y * 0.1, hexPos.z * 0.1);
            const heightLevels = Math.round((noiseValue + 1) * 1.5);
            terrainHeight = currentPlanet.radius + heightLevels * 0.5;
        }
    });

    if (distanceFromCenter < terrainHeight + 0.5) {
        nextPosition.copy(currentPlanet.center)
            .add(playerDirection.multiplyScalar(terrainHeight + 0.5));
        
        const normal = nextPosition.clone().sub(currentPlanet.center).normalize();
        const dot = playerVelocity.dot(normal);
        if (dot < 0) {
            playerVelocity.sub(normal.multiplyScalar(dot));
            isJumping = false;

            const fallSpeed = -dot;
            if (fallSpeed > 15) {
                const damage = (fallSpeed - 15) * 5;
                takeDamage(damage);
            }
        }
    }

    player.position.copy(nextPosition);

    // Animation
    if (!isJumping && !jetpackInput) {
        const isMoving = isMobile ? 
            (Math.abs(touchControls.movement.x) > 0.1 || Math.abs(touchControls.movement.y) > 0.1) :
            (keys['w'] || keys['s'] || keys['a'] || keys['d']);
            
        if (isMoving) {
            walkCycle += walkSpeed * delta;
            
            const leftLegJoint = player.children[5];
            const rightLegJoint = player.children[6];
            const leftArmJoint = player.children[3];
            const rightArmJoint = player.children[4];
            
            leftLegJoint.rotation.x = Math.sin(walkCycle) * legAmplitude;
            rightLegJoint.rotation.x = Math.sin(walkCycle + Math.PI) * legAmplitude;
            leftArmJoint.rotation.x = Math.sin(walkCycle + Math.PI) * armSwingAmplitude;
            if (!isRightArmSwinging) {
                rightArmJoint.rotation.x = Math.sin(walkCycle) * armSwingAmplitude;
            }
        }
    }
}

function updateCamera() {
    currentCameraRotation.slerp(targetCameraRotation, cameraSmoothness);
    
    targetPlayerUp.copy(player.position).sub(currentPlanet.center).normalize();
    playerUp.lerp(targetPlayerUp, cameraSmoothness);
    playerUp.normalize();

    const cameraForward = new THREE.Vector3(0, 0, -1).applyQuaternion(currentCameraRotation);
    playerForward.copy(cameraForward).sub(playerUp.clone().multiplyScalar(cameraForward.dot(playerUp))).normalize();

    const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(currentCameraRotation);
    const cameraUp = new THREE.Vector3(0, 1, 0).applyQuaternion(currentCameraRotation);

    const targetPosition = player.position.clone()
        .add(playerUp.clone().multiplyScalar(cameraOffset.y))
        .add(cameraForward.clone().multiplyScalar(-cameraOffset.z));

    camera.position.lerp(targetPosition, cameraSmoothness);
    camera.quaternion.copy(currentCameraRotation);
    camera.up.copy(playerUp);

    const playerRotationMatrix = new THREE.Matrix4();
    playerRotationMatrix.lookAt(
        player.position,
        player.position.clone().add(playerForward),
        playerUp
    );
    player.quaternion.setFromRotationMatrix(playerRotationMatrix);
}

// Initialize game
const planet = generatePlanet(new THREE.Vector3(0, 0, 0), planetRadius);
const moon = generatePlanet(new THREE.Vector3(orbitRadius, 0, 0), moonRadius, true);
let currentPlanet = planet;
player.position.set(0, planetRadius + 1, 0);

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
        
        orbitAngle += orbitSpeed * fixedTimeStep;
        moon.group.position.set(
            Math.cos(orbitAngle) * orbitRadius,
            0,
            Math.sin(orbitAngle) * orbitRadius
        );
        
        // Rotate starfield slowly
        starfield.rotation.y += 0.0001;
        
        accumulator -= fixedTimeStep;
    }

    updateCamera();
    document.getElementById('gravity-value').textContent = `${currentGravity.toFixed(1)} m/s²`;
    renderer.render(scene, camera);
}

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