class Level {
    constructor(levelNumber) {
        // Level properties
        this.levelNumber = levelNumber;
        this.platforms = [];
        this.holes = [];
        this.completed = false;
        
        // Platform properties
        this.platformWidth = 20;
        this.platformHeight = 1;
        this.platformDepth = 20;
        this.platformGap = 15;
        this.platformCount = 3;
        
        // Calculate start height for the level
        this.startY = (this.levelNumber - 1) * (this.platformGap * this.platformCount);
        
        // Hole properties
        this.holeRadius = 3; 
        this.holePositions = [];
    }

    init(scene) {
        this.createPlatforms(scene);
        this.createHoles(scene);
        
        console.log(`Level ${this.levelNumber} initialized with ${this.platformCount} platforms`);
    }

    createPlatforms(scene) {
        // Create platforms from top to bottom
        for (let i = 0; i < this.platformCount; i++) {
            // Platform becomes more challenging with level progression
            const platformWidth = this.platformWidth - (this.levelNumber * 0.5);
            const platformDepth = this.platformDepth - (this.levelNumber * 0.5);
            
            // Platform Y position
            const y = this.startY - (i * this.platformGap);
            
            // Create platform geometry
            const geometry = scene.createPlatformGeometry(platformWidth, this.platformHeight, platformDepth);
            
            // Create platform material with different colors based on level
            let platformColor;
            switch (this.levelNumber % 5) {
                case 1: platformColor = 0x4a90e2; break; // Blue
                case 2: platformColor = 0x50C878; break; // Green
                case 3: platformColor = 0xF5A623; break; // Orange
                case 4: platformColor = 0xD0021B; break; // Red
                case 0: platformColor = 0x9013FE; break; // Purple
            }
            
            const material = new THREE.MeshPhongMaterial({ 
                color: platformColor,
                specular: 0x111111,
                shininess: 30
            });
            
            // Create platform mesh
            const platform = new THREE.Mesh(geometry, material);
            platform.position.set(0, y, 0);
            platform.receiveShadow = true;
            
            // Store platform data
            this.platforms.push({
                mesh: platform,
                width: platformWidth,
                height: this.platformHeight,
                depth: platformDepth,
                position: platform.position.clone()
            });
            
            // Add to scene
            scene.add(platform);
        }
    }

    createHoles(scene) {
        // Generate random holes in the platforms
        for (let i = 0; i < this.platforms.length; i++) {
            const platform = this.platforms[i];
            
            // For first platform in first level, make hole position more predictable
            let holeX, holeZ;
            if (this.levelNumber === 1 && i === 0) {
                holeX = 0;
                holeZ = 0;
            } else {
                // Random position within platform bounds
                const maxOffset = (Math.min(platform.width, platform.depth) / 2) - this.holeRadius - 1;
                holeX = (Math.random() * 2 - 1) * maxOffset;
                holeZ = (Math.random() * 2 - 1) * maxOffset;
            }
            
            // Store hole position relative to platform
            this.holePositions.push({
                x: holeX,
                z: holeZ,
                platformIndex: i
            });
            
            // Calculate world position of hole
            const holePosition = new THREE.Vector3(
                platform.position.x + holeX,
                platform.position.y + platform.height / 2,
                platform.position.z + holeZ
            );
            
            // Create hole (visual only, not physical)
            const holeGeometry = new THREE.CircleGeometry(this.holeRadius, 32);
            const holeMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x000000,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide 
            });
            
            // Create hole mesh
            const hole = new THREE.Mesh(holeGeometry, holeMaterial);
            hole.position.copy(holePosition);
            hole.rotation.x = Math.PI / 2; // Make circle horizontal
            
            // Store hole data
            this.holes.push({
                mesh: hole,
                radius: this.holeRadius,
                position: holePosition,
                platformIndex: i
            });
            
            // Add to scene
            scene.add(hole);
        }
    }

    isCompleted() {
        return this.completed;
    }

    checkCollision(player) {
        if (!player) return false;
        
        const playerBox = player.getBoundingBox();
        
        // Check platform collisions
        for (let i = 0; i < this.platforms.length; i++) {
            const platform = this.platforms[i];
            
            // Platform bounds
            const platformMin = new THREE.Vector3(
                platform.position.x - platform.width / 2,
                platform.position.y - platform.height / 2,
                platform.position.z - platform.depth / 2
            );
            
            const platformMax = new THREE.Vector3(
                platform.position.x + platform.width / 2,
                platform.position.y + platform.height / 2,
                platform.position.z + platform.depth / 2
            );
            
            // Check if player is above platform
            if (playerBox.min.y <= platformMax.y && 
                playerBox.max.y >= platformMin.y &&
                playerBox.min.x <= platformMax.x && 
                playerBox.max.x >= platformMin.x &&
                playerBox.min.z <= platformMax.z && 
                playerBox.max.z >= platformMin.z) {
                
                // Check if player's center is inside hole
                if (this.checkHoleCollision(player.position, i)) {
                    // Player is in the hole - continue falling
                    if (i === this.platforms.length - 1) {
                        // Player made it through the bottom platform - level completed!
                        this.completed = true;
                        return true;
                    }
                } else {
                    // Player hit the platform - bounce
                    if (player.velocity.y < 0) {
                        const normal = new THREE.Vector3(0, 1, 0);
                        player.applyBounce(normal);
                    }
                }
            }
        }
        
        // Level not completed
        return false;
    }

    checkHoleCollision(position, platformIndex) {
        // Find hole for this platform
        const hole = this.holes.find(h => h.platformIndex === platformIndex);
        if (!hole) return false;
        
        // Create horizontal vector from hole center to player
        const holeCenter = new THREE.Vector2(hole.position.x, hole.position.z);
        const playerPos = new THREE.Vector2(position.x, position.z);
        
        // Check if player is within hole radius
        return holeCenter.distanceTo(playerPos) < hole.radius;
    }

    dispose(scene) {
        // Remove all meshes from scene
        this.platforms.forEach(platform => {
            scene.remove(platform.mesh);
        });
        
        this.holes.forEach(hole => {
            scene.remove(hole.mesh);
        });
        
        // Clear arrays
        this.platforms = [];
        this.holes = [];
    }

    getVisibleHolePosition() {
        // Return the position of the next visible hole
        if (this.holes.length > 0) {
            return this.holes[0].position.clone();
        }
        return null;
    }

    update() {
        // Add any level animation or updates here
        // For example, rotate the holes slightly to make them more visible
        this.holes.forEach(hole => {
            hole.mesh.rotation.z += 0.005;
        });
    }
}