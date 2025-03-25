class Portal {
    constructor(scene, position, rotation, isEntry = false) {
        this.scene = scene;
        this.position = position;
        this.rotation = rotation;
        this.isEntry = isEntry;
        this.group = null;
        this.portalMaterial = null;
        this.portalEffect = null;
        this.particleSystem = null;
        this.collisionBox = null;
    }

    init() {
        // Create portal group to contain all portal elements
        this.group = new THREE.Group();
        this.group.position.copy(this.position);
        this.group.rotation.copy(this.rotation);
        
        // Create portal effect (ring)
        const portalGeometry = new THREE.TorusGeometry(15, 2, 16, 100);
        this.portalMaterial = new THREE.MeshPhongMaterial({
            color: this.isEntry ? 0x00ff00 : 0xff0000,
            emissive: this.isEntry ? 0x00ff00 : 0xff0000,
            transparent: true,
            opacity: 0.8
        });
        const portal = new THREE.Mesh(portalGeometry, this.portalMaterial);
        this.group.add(portal);

        // Create portal inner surface
        const innerGeometry = new THREE.CircleGeometry(13, 32);
        const innerMaterial = new THREE.MeshBasicMaterial({
            color: this.isEntry ? 0x00ff00 : 0xff0000,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        const innerSurface = new THREE.Mesh(innerGeometry, innerMaterial);
        this.group.add(innerSurface);

        // Create particle system for portal effect
        const particleCount = 1000;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            // Create particles in a ring around the portal
            const angle = Math.random() * Math.PI * 2;
            const radius = 15 + (Math.random() - 0.5) * 4;
            positions[i] = Math.cos(angle) * radius;
            positions[i + 1] = Math.sin(angle) * radius;
            positions[i + 2] = (Math.random() - 0.5) * 4;

            // Color based on portal type
            if (this.isEntry) {
                colors[i] = 0;
                colors[i + 1] = 0.8 + Math.random() * 0.2;
                colors[i + 2] = 0;
            } else {
                colors[i] = 0.8 + Math.random() * 0.2;
                colors[i + 1] = 0;
                colors[i + 2] = 0;
            }
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.6
        });

        this.particleSystem = new THREE.Points(particles, particleMaterial);
        this.group.add(this.particleSystem);

        // Add portal label
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 64;
        
        context.fillStyle = this.isEntry ? '#00ff00' : '#ff0000';
        context.font = 'bold 32px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(this.isEntry ? 'ENTRY PORTAL' : 'VIBEVERSE PORTAL', canvas.width/2, canvas.height/2);

        const texture = new THREE.CanvasTexture(canvas);
        const labelGeometry = new THREE.PlaneGeometry(30, 5);
        const labelMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        label.position.y = 20;
        this.group.add(label);

        // Add portal group to scene
        this.scene.add(this.group);

        // Create portal collision box
        this.collisionBox = new THREE.Box3().setFromObject(this.group);

        // Start particle animation
        this.animateParticles();
    }

    update() {
        // Update particle animation
        this.animateParticles();
    }

    animateParticles() {
        if (!this.particleSystem) return;

        const positions = this.particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += 0.05 * Math.sin(Date.now() * 0.001 + i);
        }
        this.particleSystem.geometry.attributes.position.needsUpdate = true;

        // Update portal material
        if (this.portalMaterial) {
            this.portalMaterial.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.003) * 0.2;
        }

        requestAnimationFrame(() => this.animateParticles());
    }

    checkCollision(player) {
        if (!this.collisionBox || !player) return false;
        
        const playerBox = new THREE.Box3().setFromObject(player);
        const portalDistance = playerBox.getCenter(new THREE.Vector3()).distanceTo(this.collisionBox.getCenter(new THREE.Vector3()));
        
        // First check if player is within 50 units
        if (portalDistance < 50) {
            // Then check if player is actually intersecting the portal
            return playerBox.intersectsBox(this.collisionBox);
        }
        
        return false;
    }

    handlePortalEnter() {
        if (this.isEntry) return; // Don't handle entry portal collisions

        // Get current URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        
        // Construct portal URL with player data
        const portalUrl = new URL('https://portal.pieter.com');
        portalUrl.searchParams.set('portal', 'true');
        portalUrl.searchParams.set('username', urlParams.get('username') || 'player');
        portalUrl.searchParams.set('color', urlParams.get('color') || '#ff0000');
        portalUrl.searchParams.set('speed', urlParams.get('speed') || '5');
        
        // Add all other parameters except 'ref'
        for (const [key, value] of urlParams) {
            if (key !== 'ref') {
                portalUrl.searchParams.set(key, value);
            }
        }

        // Preload the next page
        if (!document.getElementById('preloadFrame')) {
            const iframe = document.createElement('iframe');
            iframe.id = 'preloadFrame';
            iframe.style.display = 'none';
            iframe.src = portalUrl.toString();
            document.body.appendChild(iframe);
        }

        // Redirect to portal
        window.location.href = portalUrl.toString();
    }

    dispose() {
        if (this.group) {
            this.scene.remove(this.group);
            this.group = null;
        }
        this.collisionBox = null;
    }
} 