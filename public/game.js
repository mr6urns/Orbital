@@ .. @@
 // Planet parameters
-const planetRadius = 20;
-const moonRadius = 5;
-const planetGravity = 12.0;
-const moonGravity = 3.0;
-let currentGravity = planetGravity;
-
-// Orbital parameters
-const orbitRadius = 40;
-const orbitSpeed = 0.1;
-let orbitAngle = 0;
+const hexMapRadius = 50; // Large hexagonal map radius
+const gravity = 9.8; // Standard gravity pointing downward
+let currentGravity = gravity;
+const mapHeight = 2; // Height of the hexagonal terrain

 // Noise for terrain generation
@@ .. @@
     return impactParticles;
 }

-function checkTerrainCollision(position, celestialBody) {
-    const distanceFromCenter = position.distanceTo(celestialBody.center);
-    let terrainHeight = celestialBody.radius;
+function checkTerrainCollision(position, hexMap) {
+    // Check if position is within the hexagonal map bounds
+    const mapCenter = hexMap.center;
+    const distanceFromCenter = Math.sqrt(
+        Math.pow(position.x - mapCenter.x, 2) + 
+        Math.pow(position.z - mapCenter.z, 2)
+    );
+    
+    // If outside hexagon bounds, collision with invisible walls
+    if (distanceFromCenter > hexMapRadius) {
+        return true;
+    }
+    
+    let terrainHeight = mapHeight;
     let minDistance = Infinity;
     
-    celestialBody.hexPositions.forEach(hexPos => {
-        const hexWorldPos = hexPos.clone()
-            .normalize()
-            .multiplyScalar(celestialBody.radius)
-            .add(celestialBody.center);
-        const distance = position.distanceTo(hexWorldPos);
+    hexMap.hexPositions.forEach(hexPos => {
+        const distance = Math.sqrt(
+            Math.pow(position.x - hexPos.x, 2) + 
+            Math.pow(position.z - hexPos.z, 2)
+        );
         
         if (distance < minDistance) {
             minDistance = distance;
-            const noiseValue = noise3D(hexPos.x * 0.1, hexPos.y * 0.1, hexPos.z * 0.1);
+            const noiseValue = noise3D(hexPos.x * 0.1, 0, hexPos.z * 0.1);
             const heightLevels = Math.round((noiseValue + 1) * 1.5);
-            terrainHeight = celestialBody.radius + heightLevels * 0.5;
+            terrainHeight = mapHeight + heightLevels * 0.5;
         }
     });

-    return distanceFromCenter < terrainHeight + 0.2;
+    return position.y < terrainHeight + 0.2;
 }

 function updateProjectiles(delta) {
@@ .. @@
             }
             
-            // Check collision with planet
-            if (checkTerrainCollision(projectile.position, planet)) {
+            // Check collision with hex map
+            if (checkTerrainCollision(projectile.position, hexMap)) {
                 const impactPos = oldPosition.clone();
                 const newParticles = createImpactEffect(impactPos, false);
                 impactParticles.push(...newParticles);
@@ .. @@
                 continue;
             }
             
-            // Check collision with moon
-            const moonWorldPos = moon.center.clone().add(moon.group.position);
-            const moonCollision = checkTerrainCollision(
-                projectile.position.clone().sub(moon.group.position),
-                { ...moon, center: new THREE.Vector3(0, 0, 0) }
-            );
-            
-            if (moonCollision) {
-                const impactPos = oldPosition.clone();
-                const newParticles = createImpactEffect(impactPos, true);
-                impactParticles.push(...newParticles);
-                
-                scene.remove(projectile);
-                projectiles.splice(i, 1);
-                continue;
-            }
-
             if (projectile.age > 2) {
                 scene.remove(projectile);
                 projectiles.splice(i, 1);
@@ .. @@
     updateAmmoUI();
 }

-function generatePlanet(center, radius, isMoon = false) {
+function generateHexagonalMap(center) {
     const hexRadius = 0.866;
     const hexHeight = 0.5;
-    const planetGroup = new THREE.Group();
-    planetGroup.position.copy(center);
-    
-    const coreGeometry = new THREE.SphereGeometry(radius - hexHeight, isMobile ? 16 : 32, isMobile ? 16 : 32);
-    const coreMaterial = new THREE.MeshPhongMaterial({
-        color: isMoon ? 0x666666 : 0x553322,
-        shininess: 0,
-        flatShading: true
-    });
-    const core = new THREE.Mesh(coreGeometry, coreMaterial);
-    planetGroup.add(core);
+    const mapGroup = new THREE.Group();
+    mapGroup.position.copy(center);
     
     const hexPositions = [];
-    const segments = Math.ceil(radius * Math.PI / (hexRadius * 2));
+    const segments = Math.ceil(hexMapRadius / (hexRadius * 2));
     
+    // Generate hexagonal grid pattern
     for (let q = -segments; q <= segments; q++) {
         for (let r = Math.max(-segments, -q-segments); r <= Math.min(segments, -q+segments); r++) {
             const s = -q - r;
             
             if (Math.abs(s) <= segments) {
                 const x = hexRadius * (Math.sqrt(3) * q + Math.sqrt(3)/2 * r);
                 const z = hexRadius * (3/2 * r);
                 
-                const distanceFromCenter = Math.sqrt(x*x + z*z);
-                const angle = distanceFromCenter / radius;
+                const distanceFromCenter = Math.sqrt(x * x + z * z);
                 
-                if (angle <= Math.PI) {
-                    const phi = Math.atan2(z, x);
-                    const theta = angle;
-                    
-                    const pos = new THREE.Vector3(
-                        radius * Math.sin(theta) * Math.cos(phi),
-                        radius * Math.cos(theta),
-                        radius * Math.sin(theta) * Math.sin(phi)
-                    );
+                // Only include hexes within the map radius
+                if (distanceFromCenter <= hexMapRadius) {
+                    const pos = new THREE.Vector3(x, 0, z);
                     
                     if (!hexPositions.some(existing => 
                         existing.distanceTo(pos) < hexRadius * 1.5)) {
@@ .. @@
     hexPositions.forEach(pos => {
-        const noiseValue = noise3D(pos.x * 0.1, pos.y * 0.1, pos.z * 0.1);
+        const noiseValue = noise3D(pos.x * 0.1, 0, pos.z * 0.1);
         const heightLevels = Math.round((noiseValue + 1) * 1.5);

         for (let level = 0; level <= heightLevels; level++) {
             const hexMaterial = new THREE.MeshPhongMaterial({
-                color: isMoon ? 0x888888 :
-                    (level === heightLevels ? 
-                        (noiseValue > 0.3 ? 0x888888 : 0x00aa00) : 
-                        0x666666)
+                color: level === heightLevels ? 
+                    (noiseValue > 0.3 ? 0x888888 : 0x00aa00) : 
+                    0x666666
             });

             const hex = new THREE.Mesh(hexGeometry, hexMaterial);
-            const direction = pos.clone().normalize();
-            const position = direction.multiplyScalar(radius + level * hexHeight);
+            const position = new THREE.Vector3(
+                pos.x,
+                mapHeight + level * hexHeight,
+                pos.z
+            );
             hex.position.copy(position);

-            const up = position.clone().normalize();
-            const forward = new THREE.Vector3(0, 1, 0);
-            const right = new THREE.Vector3().crossVectors(up, forward).normalize();
-            forward.crossVectors(right, up).normalize();
-            
-            const rotationMatrix = new THREE.Matrix4().makeBasis(right, up, forward);
-            hex.quaternion.setFromRotationMatrix(rotationMatrix);
+            // Hexes lay flat on the ground
+            hex.rotation.x = 0;
             
             hex.userData = { type: noiseValue > 0.3 ? 'stone' : 'grass' };
-            planetGroup.add(hex);
+            mapGroup.add(hex);
         }
     });

-    scene.add(planetGroup);
+    scene.add(mapGroup);
     return { 
-        group: planetGroup, 
+        group: mapGroup, 
         center, 
-        radius, 
-        gravity: radius === planetRadius ? planetGravity : moonGravity,
+        radius: hexMapRadius,
+        gravity: gravity,
         hexPositions 
     };
 }
@@ .. @@
 function updatePlayer(delta) {
-    if (!currentPlanet) return;
+    if (!hexMap) return;

-    const up = player.position.clone().sub(currentPlanet.center).normalize();
+    const up = new THREE.Vector3(0, 1, 0); // Always point upward for flat terrain
     
     // Handle jetpack input (keyboard or touch)
     const jetpackInput = (isMobile ? touchControls.jetpack : keys[' ']);
@@ .. @@
         updateHealthUI();
     }

-    playerVelocity.add(up.clone().multiplyScalar(-currentGravity * delta));
+    // Apply downward gravity
+    playerVelocity.add(new THREE.Vector3(0, -currentGravity * delta, 0));

     const cameraForward = new THREE.Vector3(0, 0, -1).applyQuaternion(currentCameraRotation);
     const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(currentCameraRotation);
     
-    const surfaceForward = cameraForward.clone().sub(up.clone().multiplyScalar(cameraForward.dot(up))).normalize();
-    const surfaceRight = cameraRight.clone().sub(up.clone().multiplyScalar(cameraRight.dot(up))).normalize();
+    // For flat terrain, just use the horizontal components
+    const surfaceForward = new THREE.Vector3(cameraForward.x, 0, cameraForward.z).normalize();
+    const surfaceRight = new THREE.Vector3(cameraRight.x, 0, cameraRight.z).normalize();

     const moveDirection = new THREE.Vector3();
@@ .. @@
     const nextPosition = player.position.clone().add(playerVelocity.clone().multiplyScalar(delta));
-    const distanceFromCenter = nextPosition.distanceTo(currentPlanet.center);
+    
+    // Check if player is within map bounds
+    const distanceFromCenter = Math.sqrt(
+        Math.pow(nextPosition.x - hexMap.center.x, 2) + 
+        Math.pow(nextPosition.z - hexMap.center.z, 2)
+    );
+    
+    // Keep player within hexagonal bounds
+    if (distanceFromCenter > hexMapRadius - 1) {
+        const direction = new THREE.Vector3(
+            nextPosition.x - hexMap.center.x,
+            0,
+            nextPosition.z - hexMap.center.z
+        ).normalize();
+        
+        nextPosition.x = hexMap.center.x + direction.x * (hexMapRadius - 1);
+        nextPosition.z = hexMap.center.z + direction.z * (hexMapRadius - 1);
+        
+        // Stop horizontal movement when hitting boundary
+        playerVelocity.x = 0;
+        playerVelocity.z = 0;
+    }
     
-    let terrainHeight = currentPlanet.radius;
-    const playerDirection = nextPosition.clone().sub(currentPlanet.center).normalize();
+    let terrainHeight = mapHeight;
     
     let minDistance = Infinity;
-    currentPlanet.hexPositions.forEach(hexPos => {
-        const hexWorldPos = hexPos.clone()
-            .normalize()
-            .multiplyScalar(currentPlanet.radius)
-            .add(currentPlanet.center);
-        const distance = nextPosition.distanceTo(hexWorldPos);
+    hexMap.hexPositions.forEach(hexPos => {
+        const distance = Math.sqrt(
+            Math.pow(nextPosition.x - hexPos.x, 2) + 
+            Math.pow(nextPosition.z - hexPos.z, 2)
+        );
         
         if (distance < minDistance) {
             minDistance = distance;
-            const noiseValue = noise3D(hexPos.x * 0.1, hexPos.y * 0.1, hexPos.z * 0.1);
+            const noiseValue = noise3D(hexPos.x * 0.1, 0, hexPos.z * 0.1);
             const heightLevels = Math.round((noiseValue + 1) * 1.5);
-            terrainHeight = currentPlanet.radius + heightLevels * 0.5;
+            terrainHeight = mapHeight + heightLevels * 0.5;
         }
     });

-    if (distanceFromCenter < terrainHeight + 0.5) {
-        nextPosition.copy(currentPlanet.center)
-            .add(playerDirection.multiplyScalar(terrainHeight + 0.5));
+    // Ground collision
+    if (nextPosition.y < terrainHeight + 0.5) {
+        nextPosition.y = terrainHeight + 0.5;
         
-        const normal = nextPosition.clone().sub(currentPlanet.center).normalize();
-        const dot = playerVelocity.dot(normal);
+        const dot = playerVelocity.y;
         if (dot < 0) {
-            playerVelocity.sub(normal.multiplyScalar(dot));
+            playerVelocity.y = 0;
             isJumping = false;

             const fallSpeed = -dot;
@@ .. @@
 }

 function updateCamera() {
     currentCameraRotation.slerp(targetCameraRotation, cameraSmoothness);
     
-    targetPlayerUp.copy(player.position).sub(currentPlanet.center).normalize();
+    // For flat terrain, up is always (0, 1, 0)
+    targetPlayerUp.set(0, 1, 0);
     playerUp.lerp(targetPlayerUp, cameraSmoothness);
     playerUp.normalize();

     const cameraForward = new THREE.Vector3(0, 0, -1).applyQuaternion(currentCameraRotation);
-    playerForward.copy(cameraForward).sub(playerUp.clone().multiplyScalar(cameraForward.dot(playerUp))).normalize();
+    playerForward.set(cameraForward.x, 0, cameraForward.z).normalize();

     const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(currentCameraRotation);
     const cameraUp = new THREE.Vector3(0, 1, 0).applyQuaternion(currentCameraRotation);
@@ .. @@
 }

 // Initialize game
-const planet = generatePlanet(new THREE.Vector3(0, 0, 0), planetRadius);
-const moon = generatePlanet(new THREE.Vector3(orbitRadius, 0, 0), moonRadius, true);
-let currentPlanet = planet;
-player.position.set(0, planetRadius + 1, 0);
+const hexMap = generateHexagonalMap(new THREE.Vector3(0, 0, 0));
+player.position.set(0, mapHeight + 2, 0);

 // Animation loop
@@ .. @@
         updateProjectiles(fixedTimeStep);
         updateImpactEffects(fixedTimeStep);
         
-        orbitAngle += orbitSpeed * fixedTimeStep;
-        moon.group.position.set(
-            Math.cos(orbitAngle) * orbitRadius,
-            0,
-            Math.sin(orbitAngle) * orbitRadius
-        );
-        
         // Rotate starfield slowly
         starfield.rotation.y += 0.0001;
         
@@ .. @@