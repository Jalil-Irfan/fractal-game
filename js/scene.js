class Scene {
    constructor() {
        // Set up the scene, camera, and renderer
        this.scene = new THREE.Scene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        this.setupBackground();
        
        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        console.log('Scene initialized');
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x121212, 1);
        
        // Add renderer to the DOM
        document.getElementById('game-screen').appendChild(this.renderer.domElement);
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            60, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(0, 20, 35);
        this.camera.lookAt(0, 0, 0);
    }
    
    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        
        // Directional light (sunlight)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
        directionalLight.position.set(-10, 20, 10);
        directionalLight.castShadow = true;
        
        // Set up shadow properties
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 100;
        directionalLight.shadow.camera.left = -30;
        directionalLight.shadow.camera.right = 30;
        directionalLight.shadow.camera.top = 30;
        directionalLight.shadow.camera.bottom = -30;
        
        this.scene.add(directionalLight);
        
        // Point light (glow)
        const pointLight = new THREE.PointLight(0x4a90e2, 1, 50);
        pointLight.position.set(0, 15, 0);
        this.scene.add(pointLight);
    }
    
    setupBackground() {
        // Create skybox
        const skyboxGeometry = new THREE.BoxGeometry(500, 500, 500);
        const skyboxMaterials = [
            new THREE.MeshBasicMaterial({ color: 0x16213e, side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ color: 0x16213e, side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ color: 0x1a1a2e, side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ color: 0x0f3460, side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ color: 0x16213e, side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ color: 0x16213e, side: THREE.BackSide })
        ];
        
        const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterials);
        this.scene.add(skybox);
        
        // Add some stars
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 1000;
        const starPositions = [];
        
        for (let i = 0; i < starCount; i++) {
            const x = Math.random() * 400 - 200;
            const y = Math.random() * 400 - 200;
            const z = Math.random() * 400 - 200;
            starPositions.push(x, y, z);
        }
        
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            size: 0.5,
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
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
        this.renderer.render(this.scene, this.camera);
    }
    
    createCrystalGeometry(size = 1) {
        // Create a crystal-like geometry for the player
        const geometry = new THREE.OctahedronGeometry(size, 1);
        // Randomize vertices slightly for more crystal-like appearance
        const positionAttribute = geometry.getAttribute('position');
        
        for (let i = 0; i < positionAttribute.count; i++) {
            const x = positionAttribute.getX(i);
            const y = positionAttribute.getY(i);
            const z = positionAttribute.getZ(i);
            
            // Random slight offset to make it less uniform
            const offset = 0.15 * size;
            positionAttribute.setXYZ(
                i,
                x + (Math.random() * offset * 2 - offset),
                y + (Math.random() * offset * 2 - offset),
                z + (Math.random() * offset * 2 - offset)
            );
        }
        
        geometry.computeVertexNormals();
        return geometry;
    }
    
    createPlatformGeometry(width = 10, height = 1, depth = 10) {
        // Create a platform geometry
        return new THREE.BoxGeometry(width, height, depth);
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