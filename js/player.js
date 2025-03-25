class Player {
    constructor() {
        // Physics properties
        this.position = new THREE.Vector3(0, 10, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, -9.8, 0); // Gravity
        this.rotationSpeed = new THREE.Vector3(0, 0, 0);
        
        // Movement properties
        this.moveSpeed = 10;
        this.maxSpeed = 15;
        this.friction = 0.95;
        
        // Crystal properties
        this.size = 1.2;
        this.mesh = null;
        
        // Game properties
        this.isAlive = true;
        this.score = 0;

        this.moveDirection = new THREE.Vector3();
        this.isJumping = false;
        this.jumpForce = 10;
    }

    init(scene) {
        // Create crystal geometry
        const geometry = scene.createCrystalGeometry(this.size);
        
        // Create crystal material
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x4a90e2,
            emissive: 0x1c3f60,
            emissiveIntensity: 0.3,
            metalness: 0.2,
            roughness: 0.1,
            reflectivity: 0.8,
            clearcoat: 1.0,
            clearcoatRoughness: 0.2,
            transparent: true,
            opacity: 0.9
        });
        
        // Create mesh
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.position.copy(this.position);
        
        // Add to scene
        scene.add(this.mesh);
        
        // Add random rotation
        this.rotationSpeed.x = (Math.random() - 0.5) * 0.02;
        this.rotationSpeed.y = (Math.random() - 0.5) * 0.02;
        this.rotationSpeed.z = (Math.random() - 0.5) * 0.02;
    }

    reset(y) {
        // Reset position
        this.position.set(0, y, 0);
        
        // Reset velocity
        this.velocity.set(0, 0, 0);
        
        // Reset mesh position
        if (this.mesh) {
            this.mesh.position.copy(this.position);
        }
        
        // Reset state
        this.isAlive = true;
    }

    update(deltaTime) {
        if (!this.isAlive || !this.mesh) return;
        
        // Apply gravity
        this.velocity.add(this.acceleration.clone().multiplyScalar(deltaTime));
        
        // Apply horizontal movement
        if (this.moveDirection) {
            const moveVector = new THREE.Vector3(this.moveDirection.x, 0, this.moveDirection.z);
            moveVector.normalize();
            this.velocity.add(moveVector.multiplyScalar(this.moveSpeed * deltaTime));
            
            // Limit horizontal speed
            const horizontalSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
            if (horizontalSpeed > this.maxSpeed) {
                const scale = this.maxSpeed / horizontalSpeed;
                this.velocity.x *= scale;
                this.velocity.z *= scale;
            }
        }
        
        // Apply friction to horizontal movement
        this.velocity.x *= this.friction;
        this.velocity.z *= this.friction;
        
        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        
        // Update mesh
        this.updateMesh();
    }

    updateMesh() {
        if (!this.mesh) return;
        
        // Update position
        this.mesh.position.copy(this.position);
        
        // Apply rotation
        this.mesh.rotation.x += this.rotationSpeed.x;
        this.mesh.rotation.y += this.rotationSpeed.y;
        this.mesh.rotation.z += this.rotationSpeed.z;
    }

    applyBounce(normal) {
        if (!this.isAlive) return;
        
        // Bounce: Reflect velocity along the normal vector
        const dot = this.velocity.dot(normal);
        this.velocity.sub(normal.multiplyScalar(2 * dot));
        
        // Dampen the bounce (lose some energy)
        this.velocity.multiplyScalar(0.7);
        
        // Minimum bounce to prevent getting stuck
        if (this.velocity.y < 2) {
            this.velocity.y = 2;
        }
    }

    stop() {
        this.velocity.set(0, 0, 0);
        this.isAlive = false;
    }

    isMoving() {
        return this.velocity.lengthSq() > 0.1;
    }

    getBoundingBox() {
        if (!this.mesh) return null;
        return new THREE.Box3().setFromObject(this.mesh);
    }
    
    addBonusPoints(points) {
        this.score += points;
        console.log(`Added ${points} bonus points. Total score: ${this.score}`);
    }

    setMoveDirection(direction) {
        this.moveDirection = direction;
    }
}