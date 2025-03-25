class Player {
    constructor() {
        // Physics properties
        this.position = new THREE.Vector3(0, 10, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, -9.8, 0); // Gravity
        this.rotationSpeed = new THREE.Vector3(0, 0, 0);
        
        // Movement properties
        this.moveSpeed = 5;
        this.maxSpeed = 15;
        this.friction = 0.95;
        this.jumpForce = 10;
        
        // Crystal properties
        this.size = 1.2;
        this.mesh = null;
        
        // Game properties
        this.isAlive = true;
        this.score = 0;
        this.isJumping = false;
    }

    init(scene) {
        // Create crystal geometry
        const geometry = new THREE.OctahedronGeometry(this.size);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            shininess: 100,
            specular: 0x444444,
            emissive: 0x00ff00,
            emissiveIntensity: 0.2
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        scene.add(this.mesh);
    }

    update(deltaTime = 0.016) { // Default to 60fps
        if (!this.isAlive || !this.mesh) return;
        
        // Apply gravity
        this.velocity.add(this.acceleration.clone().multiplyScalar(deltaTime));
        
        // Apply friction to horizontal movement
        this.velocity.x *= this.friction;
        this.velocity.z *= this.friction;
        
        // Limit horizontal speed
        const horizontalSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
        if (horizontalSpeed > this.maxSpeed) {
            const scale = this.maxSpeed / horizontalSpeed;
            this.velocity.x *= scale;
            this.velocity.z *= scale;
        }
        
        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        
        // Update mesh
        this.updateMesh();
        
        // Add rotation effect
        this.mesh.rotation.x += 0.02;
        this.mesh.rotation.y += 0.02;
    }

    updateMesh() {
        if (!this.mesh) return;
        this.mesh.position.copy(this.position);
    }

    applyBounce(normal) {
        // Reflect velocity off the surface
        const reflection = this.velocity.clone().reflect(normal);
        this.velocity.copy(reflection);
        
        // Add some energy loss
        this.velocity.multiplyScalar(0.8);
        
        // Reset jumping state when hitting a platform
        this.isJumping = false;
    }

    getBoundingBox() {
        if (!this.mesh) return null;
        return new THREE.Box3().setFromObject(this.mesh);
    }

    reset(y) {
        this.position.set(0, y, 0);
        this.velocity.set(0, 0, 0);
        this.isJumping = false;
        if (this.mesh) {
            this.mesh.position.copy(this.position);
        }
    }

    addBonusPoints(points) {
        this.score += points;
        console.log(`Added ${points} bonus points. Total score: ${this.score}`);
    }
}