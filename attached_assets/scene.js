class Scene {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        
        this.setupRenderer();
        this.setupCamera();
        this.setupLights();
        this.setupBackground();
        // Add debug helpers
        this.addDebugHelpers();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    setupRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        // old code
        // document.body.appendChild(this.renderer.domElement);

        this.renderer.shadowMap.enabled = true; // Enable shadows
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows
        

        document.getElementById('game-container').appendChild(this.renderer.domElement);
        
        // Make background visible
        this.renderer.setClearColor(0x1a1a1a);
    }

    setupCamera() {
        this.camera.position.set(0, 20, 30); // 0,5,20
        this.camera.lookAt(0, 0, 0);
    }

    setupLights() {
        // Ambient light for overall scene illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 1.0);
        this.scene.add(ambientLight);

        // Directional light for shadows and depth
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(10, 10, 10);
        this.scene.add(directionalLight);

        // Point light for dramatic effect
        const pointLight = new THREE.PointLight(0x4a90e2, 1.5, 100);
        pointLight.position.set(0,15,0);
        this.scene.add(pointLight);
    }

    setupBackground() {
        // Create a gradient background
        // const vertexShader = `
        //     varying vec2 vUv;
        //     void main() {
        //         vUv = uv;
        //         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        //     }
        // `;

        // const fragmentShader = `
        //     uniform vec3 topColor;
        //     uniform vec3 bottomColor;
        //     varying vec2 vUv;
        //     void main() {
        //         gl_FragColor = vec4(mix(bottomColor, topColor, vUv.y), 1.0);
        //     }
        // `;

        // const uniforms = {
        //     topColor: { value: new THREE.Color(0x1a1a1a) },
        //     bottomColor: { value: new THREE.Color(0x000000) }
        // };

        // const backgroundGeometry = new THREE.PlaneGeometry(2, 2);
        // const backgroundMaterial = new THREE.ShaderMaterial({
        //     uniforms: uniforms,
        //     vertexShader: vertexShader,
        //     fragmentShader: fragmentShader
        // });

        // const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
        // background.position.z = -1;
        // this.scene.add(background);

        // New code 
        // Make background lighter for better contrast
        this.renderer.setClearColor(0x2a2a2a); // Lighter gray
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    add(object) {
        this.scene.add(object);
    }

    remove(object) {
        this.scene.remove(object);
    }

    render() {
        // Old code
        // this.renderer.render(this.scene, this.camera);

        if (this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        } else {
            console.error('Scene or camera not initialized');
        }
    }

    // Helper method to create a crystal-like geometry
    createCrystalGeometry(size = 1) {
        const geometry = new THREE.OctahedronGeometry(size);
        const vertices = geometry.attributes.position.array;
        
        // Modify vertices to create a more crystal-like shape
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i + 1];
            const z = vertices[i + 2];
            
            // Create a more elongated shape
            vertices[i + 1] = y * 1.5; // Stretch vertically
        }
        
        geometry.computeVertexNormals();
        return geometry;
    }

    // Helper method to create a platform geometry
    createPlatformGeometry(width = 10, height = 1, depth = 10) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshPhongMaterial({
            color: 0x666666,
            transparent: true,
            opacity: 0.7
        });
        return new THREE.Mesh(geometry, material);
    }

    addDebugHelpers() {
        // Add axes helper
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
    
        // Add grid helper
        const gridHelper = new THREE.GridHelper(20, 20);
        this.scene.add(gridHelper);
    }
} 