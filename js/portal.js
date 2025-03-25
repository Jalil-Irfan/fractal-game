class Portal {
    constructor(scene, position, rotation, isEntry = false) {
        this.scene = scene;
        this.position = position;
        this.rotation = rotation;
        this.isEntry = isEntry;
        this.mesh = null;
        this.portalMaterial = null;
        this.portalEffect = null;
    }

    init() {
        // Create portal geometry (a ring)
        const ringGeometry = new THREE.TorusGeometry(2, 0.2, 16, 100);
        
        // Create portal material with glow effect
        this.portalMaterial = new THREE.MeshPhongMaterial({
            color: this.isEntry ? 0x00ff00 : 0xff0000,
            emissive: this.isEntry ? 0x00ff00 : 0xff0000,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
        });

        // Create portal mesh
        this.mesh = new THREE.Mesh(ringGeometry, this.portalMaterial);
        this.mesh.position.copy(this.position);
        this.mesh.rotation.copy(this.rotation);
        
        // Add portal to scene
        this.scene.add(this.mesh);

        // Create portal effect (particles)
        const particleCount = 100;
        const particles = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];

        for (let i = 0; i < particleCount; i++) {
            const radius = 2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 2;
            
            positions.push(
                radius * Math.sin(theta) * Math.cos(phi),
                radius * Math.sin(theta) * Math.sin(phi),
                radius * Math.cos(theta)
            );

            colors.push(
                this.isEntry ? 0 : 1, // R
                this.isEntry ? 1 : 0, // G
                0 // B
            );
        }

        particles.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.6
        });

        this.portalEffect = new THREE.Points(particles, particleMaterial);
        this.portalEffect.position.copy(this.position);
        this.scene.add(this.portalEffect);

        // Add portal label
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.font = 'bold 32px Arial';
        context.fillStyle = '#ffffff';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(this.isEntry ? 'Entry Portal' : 'Vibeverse Portal', canvas.width/2, canvas.height/2);

        const texture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.SpriteMaterial({ map: texture });
        const labelSprite = new THREE.Sprite(labelMaterial);
        labelSprite.scale.set(4, 1, 1);
        labelSprite.position.set(0, 3, 0);
        this.mesh.add(labelSprite);
    }

    update() {
        // Rotate portal effect
        if (this.portalEffect) {
            this.portalEffect.rotation.y += 0.01;
        }

        // Pulse portal material
        if (this.portalMaterial) {
            this.portalMaterial.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.003) * 0.2;
        }
    }

    checkCollision(playerPosition) {
        const distance = playerPosition.distanceTo(this.mesh.position);
        return distance < 2.5; // Portal radius + some buffer
    }

    handlePortalEnter() {
        if (this.isEntry) return; // Don't handle entry portal collisions

        // Get current URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        
        // Construct portal URL with player data
        const portalUrl = new URL('http://portal.pieter.com');
        portalUrl.searchParams.set('username', urlParams.get('username') || 'player');
        portalUrl.searchParams.set('color', urlParams.get('color') || '#ff0000');
        portalUrl.searchParams.set('speed', urlParams.get('speed') || '5');
        portalUrl.searchParams.set('ref', window.location.href);
        
        // Redirect to portal
        window.location.href = portalUrl.toString();
    }

    dispose() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh = null;
        }
        if (this.portalEffect) {
            this.scene.remove(this.portalEffect);
            this.portalEffect = null;
        }
    }
} 