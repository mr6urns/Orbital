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

// Player physics
const player = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.3, 1.2, 4, 8),
    new THREE.MeshPhongMaterial({ color: 0x00ff00 })
);
player.position.set(0, 5, 0);
scene.add(player);

let playerVelocity = new THREE.Vector3();
let isJumping = false;
let jetpackFuel = 100;
let health = 100;
let ammo = 30;

// Projectiles
const projectiles = [];
const impactParticles = [];

function createImpactEffect(position, isMoon = false) {
    const particles = [];
    const particleCount = 8;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 4, 4),
            new THREE.MeshBasicMaterial({ 
                color: isMoon ? 0x888888 : 0xffaa00,
                transparent: true,
                opacity: 0.8
            })
        );
        
        particle.position.copy(position);
        
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 4,
            Math.random() * 3 + 1,
            (Math.random() - 0.5) * 4
        );
        
        particle.userData = {
            velocity: velocity,
            life: 1.0,
            maxLife: 1.0
        };
        
        particles.push(particle);
        scene.add(particle);
    }
    
    return particles;
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
        const oldPosition = projectile.position.clone();
        
        projectile.userData.velocity.y -= 9.8 * delta;
        projectile.position.add(projectile.userData.velocity.clone().multiplyScalar(delta));
        
        projectile.age += delta;
        
        if (projectile.fadeIn < 1) {
            projectile.fadeIn += delta * 4;
            if (projectile.fadeIn > 1) projectile.fadeIn = 1;
            if (projectile.material) {
                projectile.material.opacity = projectile.fadeIn * 0.8;
            }
            
            // Check collision with hex map
            if (checkTerrainCollision(projectile.position, hexMap)) {
                const impactPos = oldPosition.clone();
                const newParticles = createImpactEffect(impactPos, false);
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
    if (ammo <= 0) return;
    
    ammo--;
    
    const projectile = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 6, 6),
        new THREE.MeshBasicMaterial({ 
            color: 0x38bdf8,
            emissive: 0x38bdf8,
            transparent: true,
            opacity: 0
        })
    );
    
    projectile.position.copy(player.position);
    projectile.position.add(playerForward.clone().multiplyScalar(1));
    
    const shootDirection = playerForward.clone();
    projectile.userData = {
        velocity: shootDirection.multiplyScalar(15)
    };
    
    projectile.age = 0;
    projectile.fadeIn = 0;
    
    scene.add(projectile);
    projectiles.push(projectile);
    
    updateAmmoUI();
}

// Create starfield
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

function updatePlayer(delta) {
    if (!hexMap) return;

    const up = new THREE.Vector3(0, 1, 0); // Always point upward for flat terrain
    
    // Handle jetpack input (keyboard or touch)
    const jetpackInput = (isMobile ? touchControls.jetpack : keys[' ']);
    
    if (jetpackInput && jetpackFuel > 0) {
        playerVelocity.add(up.clone().multiplyScalar(15 * delta));
        jetpackFuel -= 50 * delta;
        if (jetpackFuel < 0) jetpackFuel = 0;
        updateJetpackUI();
    } else {
        jetpackFuel += 20 * delta;
        if (jetpackFuel > 100) jetpackFuel = 100;
        updateJetpackUI();
    }

    // Handle jump input
    const jumpInput = (isMobile ? touchControls.jump : keys['KeyW']);
    if (jumpInput && !isJumping) {
        playerVelocity.add(up.clone().multiplyScalar(8));
        isJumping = true;
    }

    // Environmental damage
    if (Math.random() < 0.001) {
        health -= 1;
        if (health < 0) health = 0;
        updateHealthUI();
    }

    // Apply downward gravity
    playerVelocity.add(new THREE.Vector3(0, -currentGravity * delta, 0));

    const cameraForward = new THREE.Vector3(0, 0, -1).applyQuaternion(currentCameraRotation);
    const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(currentCameraRotation);
    
    // For flat terrain, just use the horizontal components
    const surfaceForward = new THREE.Vector3(cameraForward.x, 0, cameraForward.z).normalize();
    const surfaceRight = new THREE.Vector3(cameraRight.x, 0, cameraRight.z).normalize();

    const moveDirection = new THREE.Vector3();
    
    // Handle movement input (keyboard or touch)
    const forwardInput = (isMobile ? touchControls.forward : keys['KeyW']);
    const backwardInput = (isMobile ? touchControls.backward : keys['KeyS']);
    const leftInput = (isMobile ? touchControls.left : keys['KeyA']);
    const rightInput = (isMobile ? touchControls.right : keys['KeyD']);
    
    if (forwardInput) moveDirection.add(surfaceForward);
    if (backwardInput) moveDirection.sub(surfaceForward);
    if (leftInput) moveDirection.sub(surfaceRight);
    if (rightInput) moveDirection.add(surfaceRight);

    if (moveDirection.length() > 0) {
        moveDirection.normalize();
        playerVelocity.add(moveDirection.multiplyScalar(10 * delta));
    }

    const friction = Math.pow(0.8, delta * 60);
    playerVelocity.multiplyScalar(friction);

    const nextPosition = player.position.clone().add(playerVelocity.clone().multiplyScalar(delta));
    
    // Check if player is within map bounds
    const distanceFromCenter = Math.sqrt(
        Math.pow(nextPosition.x - hexMap.center.x, 2) + 
        Math.pow(nextPosition.z - hexMap.center.z, 2)
    );
    
    // Keep player within hexagonal bounds
    if (distanceFromCenter > hexMapRadius - 1) {
        const direction = new THREE.Vector3(
            nextPosition.x - hexMap.center.x,
            0,
            nextPosition.z - hexMap.center.z
        ).normalize();
        
        nextPosition.x = hexMap.center.x + direction.x * (hexMapRadius - 1);
        nextPosition.z = hexMap.center.z + direction.z * (hexMapRadius - 1);
        
        // Stop horizontal movement when hitting boundary
        playerVelocity.x = 0;
        playerVelocity.z = 0;
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
    if (nextPosition.y < terrainHeight + 0.5) {
        nextPosition.y = terrainHeight + 0.5;
        
        const dot = playerVelocity.y;
        if (dot < 0) {
            playerVelocity.y = 0;
            isJumping = false;

            const fallSpeed = -dot;
            if (fallSpeed > 15) {
                const damage = Math.floor((fallSpeed - 15) * 2);
                health -= damage;
                if (health < 0) health = 0;
                updateHealthUI();
            }
        }
    }

    player.position.copy(nextPosition);
}

function updateCamera() {
    currentCameraRotation.slerp(targetCameraRotation, cameraSmoothness);
    
    // For flat terrain, up is always (0, 1, 0)
    targetPlayerUp.set(0, 1, 0);
    playerUp.lerp(targetPlayerUp, cameraSmoothness);
    playerUp.normalize();

    const cameraForward = new THREE.Vector3(0, 0, -1).applyQuaternion(currentCameraRotation);
    playerForward.set(cameraForward.x, 0, cameraForward.z).normalize();

    const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(currentCameraRotation);
    const cameraUp = new THREE.Vector3(0, 1, 0).applyQuaternion(currentCameraRotation);

    const cameraDistance = 5;
    const cameraPosition = player.position.clone()
        .add(cameraForward.clone().multiplyScalar(-cameraDistance))
        .add(cameraUp.clone().multiplyScalar(2));

    camera.position.copy(cameraPosition);
    camera.lookAt(player.position.clone().add(cameraUp.clone().multiplyScalar(1)));
}

// Initialize game
const hexMap = generateHexagonalMap(new THREE.Vector3(0, 0, 0));
player.position.set(0, mapHeight + 2, 0);

// Animation loop
const fixedTimeStep = 1/60;
let accumulator = 0;
let lastTime = 0;

function animate(currentTime) {
    requestAnimationFrame(animate);
    
    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
    lastTime = currentTime;
    accumulator += deltaTime;
    
    while (accumulator >= fixedTimeStep) {
        updatePlayer(fixedTimeStep);
        updateProjectiles(fixedTimeStep);
        updateImpactEffects(fixedTimeStep);
        
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