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
        
        // Vary number of platforms based on level
        this.numPlatforms = Math.min(3 + Math.floor(levelNumber / 2), 6);
    }

    init(scene) {
        this.createPlatforms(scene);
        this.createHoles(scene);
    }

    createPlatforms(scene) {
        // Create main platform
        const mainPlatformGeometry = scene.createPlatformGeometry(this.width, 1, this.depth);
        const mainPlatformMaterial = new THREE.MeshPhongMaterial({
            color: 0x4a90e2,
            transparent: true,
            opacity: 1
        });
        const mainPlatform = new THREE.Mesh(mainPlatformGeometry, mainPlatformMaterial);
        mainPlatform.position.y = this.startY;
        this.platforms.push(mainPlatform);
        scene.add(mainPlatform);

        // Create optical illusion platforms
        for (let i = 0; i < this.numPlatforms - 1; i++) {
            const platformGeometry = scene.createPlatformGeometry(this.width, 1, this.depth);
            const platformMaterial = new THREE.MeshPhongMaterial({
                color: 0x2ecc71,
                transparent: true,
                opacity: 1
            });
            const platform = new THREE.Mesh(platformGeometry, platformMaterial);
            platform.position.y = this.startY - (i + 1);
            
            // Rotate platforms to create optical illusion
            const angle = (i * Math.PI) / (this.numPlatforms - 1);
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
                opacity: 0.8
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
            scene.add(hole);
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
        // Check if player is in any hole
        for (const hole of this.holes) {
            const holeBox = new THREE.Box3().setFromObject(hole);
            if (holeBox.containsPoint(position)) {
                return true;
            }
        }
        return false;
    }

    update() {
        // Remove the floating animation to keep platforms stable
    }

    dispose(scene) {
        // Remove all platforms and holes from the scene
        this.platforms.forEach(platform => scene.remove(platform));
        this.holes.forEach(hole => scene.remove(hole));
        this.platforms = [];
        this.holes = [];
    }
}