class Level {
    constructor(levelNumber) {
        this.levelNumber = levelNumber;
        this.platforms = [];
        this.holes = [];
        this.startY = 10 + (levelNumber * 5);
        this.bottomY = this.startY - 4;
        this.width = 10;
        this.depth = 10;
        this.holeSize = 2;
        this.currentLevel = levelNumber;
    }

    init(scene) {
        this.createPlatforms(scene);
        this.createHoles(scene);
    }

    createPlatforms(scene) {
        // Create main platform
        const mainPlatform = scene.createPlatformGeometry(this.width, 1, this.depth);
        mainPlatform.position.y = this.startY;
        mainPlatform.material.opacity = 0.9; // Increased opacity
        mainPlatform.material.color.setHex(0x888888); // Lighter color
        this.platforms.push(mainPlatform);
        scene.add(mainPlatform);

        // Create optical illusion platforms
        const numPlatforms = 3;
        for (let i = 0; i < numPlatforms; i++) {
            const platform = scene.createPlatformGeometry(this.width, 1, this.depth);
            platform.position.y = this.startY - (i + 1);
            platform.material.opacity = 0.8; // Increased opacity
            platform.material.color.setHex(0x666666); // Lighter color
        
            
            // Rotate platforms to create optical illusion
            const angle = (i * Math.PI) / numPlatforms;
            platform.rotation.y = angle;
            
            this.platforms.push(platform);
            scene.add(platform);
        }
    }

    createHoles(scene) {
        // Create holes in the platforms
        this.platforms.forEach((platform, index) => {
            const holeGeometry = new THREE.BoxGeometry(
                this.holeSize,
                1.1, // Slightly larger than platform height
                this.holeSize
            );
            
            const holeMaterial = new THREE.MeshPhongMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.5
            });
            
            const hole = new THREE.Mesh(holeGeometry, holeMaterial);
            hole.position.copy(platform.position);
            
            // Position holes to create optical illusion
            if (index > 0) {
                const angle = ((index - 1) * Math.PI) / (this.platforms.length - 1);
                hole.position.x = Math.sin(angle) * 2;
                hole.position.z = Math.cos(angle) * 2;
            }
            
            this.holes.push(hole);
        });
    }

    checkCollision(player) {
        const playerBox = player.getBoundingBox();
        if (!playerBox) return false;

        // Check collision with platforms
        for (const platform of this.platforms) {
            const platformBox = new THREE.Box3().setFromObject(platform);
            if (playerBox.intersectsBox(platformBox)) {
                // Check if player is above the platform
                if (player.position.y > platform.position.y) {
                    // Check if player is in a hole
                    const isInHole = this.checkHoleCollision(player.position);
                    if (!isInHole) {
                        // Calculate collision normal
                        const normal = new THREE.Vector3(0, 1, 0);
                        player.applyBounce(normal);
                        return false;
                    }
                }
            }
        }

        // Check if player has fallen below the level
        if (player.position.y < this.bottomY) {
            return true;
        }

        return false;
    }

    checkHoleCollision(position) {
        for (const hole of this.holes) {
            const holeBox = new THREE.Box3().setFromObject(hole);
            if (holeBox.containsPoint(position)) {
                return true;
            }
        }
        return false;
    }

    dispose(scene) {
        // Remove all platforms and holes from the scene
        this.platforms.forEach(platform => scene.remove(platform));
        this.holes.forEach(hole => scene.remove(hole));
        this.platforms = [];
        this.holes = [];
    }

    // Helper method to get the current visible hole position
    getVisibleHolePosition() {
        // This would be used for visual effects or debugging
        return this.holes[0].position;
    }

    update() {
        // Update any level-specific animations or effects
        this.platforms.forEach(platform => {
            // Add subtle floating animation
            platform.position.y = platform.position.y + Math.sin(Date.now() * 0.001) * 0.01;
        });
    }
} 