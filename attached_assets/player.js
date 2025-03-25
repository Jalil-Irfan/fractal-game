class Player {
    constructor() {
        this.mesh = null;
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3(0, -9.8, 0); // Gravity
        this.position = new THREE.Vector3();
        this.rotation = new THREE.Vector3();
        this.isFalling = true;
        this.bounceFactor = 0.6;
        this.friction = 0.98;
        this.angularVelocity = new THREE.Vector3();
        this.audio = null;
    }

    init(scene) {
        // Create crystal mesh with more visible material
        const geometry = scene.createCrystalGeometry(1.2); // Get geometry from scene
        this.mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
            color: 0x00ffff, // Bright cyan color
            transparent: true,
            opacity: 1.0,
            shininess: 100,
            emissive: 0x008888,
            emissiveIntensity: 0.5
        }));
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        scene.scene.add(this.mesh); // Add to the THREE.js scene
        
        // Set initial position
        this.reset(15);
    }

    reset(y) {
        this.position.set(0, y, 0);
        this.velocity.set(0, 0, 0);
        this.angularVelocity.set(0, 0, 0);
        this.isFalling = true;
        this.updateMesh();
    }

    update() {
        // Update velocity with acceleration
        this.velocity.add(this.acceleration.clone().multiplyScalar(1/60));

        // Apply friction to velocity
        this.velocity.multiplyScalar(this.friction);

        // Update position
        this.position.add(this.velocity);

        // Update rotation
        this.rotation.add(this.angularVelocity);
        this.angularVelocity.multiplyScalar(this.friction);

        // Update mesh position and rotation
        this.updateMesh();

        // Add falling effect
        if (this.isFalling && this.velocity.y < -0.1) {
            this.mesh.material.emissiveIntensity = 0.5 + Math.abs(this.velocity.y) * 0.1;
        }
    }

    updateMesh() {
        if (this.mesh) {
            this.mesh.position.copy(this.position);
            this.mesh.rotation.set(
                this.rotation.x,
                this.rotation.y,
                this.rotation.z
            );
        }
    }

    applyBounce(normal) {
        // Reflect velocity off the surface
        this.velocity.reflect(normal);
        
        // Apply bounce factor
        this.velocity.multiplyScalar(this.bounceFactor);
        
        // Add some random rotation on bounce
        this.angularVelocity.set(
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5
        );

        // Flash effect on bounce
        this.mesh.material.emissiveIntensity = 1.0;
        setTimeout(() => {
            this.mesh.material.emissiveIntensity = 0.5;
        }, 100);
    }

    stop() {
        this.velocity.set(0, 0, 0);
        this.angularVelocity.set(0, 0, 0);
        this.isFalling = false;
    }

    // Helper method to check if the player is moving significantly
    isMoving() {
        return this.velocity.length() > 0.01;
    }

    // Get the player's bounding box for collision detection
    getBoundingBox() {
        if (!this.mesh) return null;
        return new THREE.Box3().setFromObject(this.mesh);
    }
} 