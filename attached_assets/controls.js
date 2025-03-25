class Controls {
    constructor(camera) {
        this.camera = camera;
        this.target = new THREE.Vector3();
        this.rotationSpeed = 0.02;
        this.isDragging = false;
        this.previousMousePosition = new THREE.Vector2();
        this.joystick = null;
        
        this.setupDesktopControls();
        this.setupMobileControls();
    }

    setupDesktopControls() {
        // Mouse controls
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', () => this.onMouseUp());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
    }

    setupMobileControls() {
        // Check if we're on a mobile device
        if ('ontouchstart' in window) {
            // Create virtual joystick
            const options = {
                zone: document.getElementById('mobile-controls'),
                mode: 'static',
                position: { left: '50%', bottom: '20%' },
                color: 'white',
                size: 120
            };
            
            this.joystick = nipplejs.create(options);
            
            // Handle joystick events
            this.joystick.on('move', (evt, data) => {
                const angle = data.angle.radian;
                this.rotateCamera(angle);
            });
        }
        
        // Touch controls
        document.addEventListener('touchstart', (e) => this.onTouchStart(e));
        document.addEventListener('touchmove', (e) => this.onTouchMove(e));
        document.addEventListener('touchend', () => this.onTouchEnd());
    }

    onMouseDown(event) {
        this.isDragging = true;
        this.previousMousePosition.set(event.clientX, event.clientY);
    }

    onMouseMove(event) {
        if (!this.isDragging) return;

        const deltaMove = new THREE.Vector2(
            event.clientX - this.previousMousePosition.x,
            event.clientY - this.previousMousePosition.y
        );

        this.rotateCamera(deltaMove.x * this.rotationSpeed);
        this.previousMousePosition.set(event.clientX, event.clientY);
    }

    onMouseUp() {
        this.isDragging = false;
    }

    onTouchStart(event) {
        event.preventDefault();
        this.isDragging = true;
        this.previousMousePosition.set(event.touches[0].clientX, event.touches[0].clientY);
    }

    onTouchMove(event) {
        event.preventDefault();
        if (!this.isDragging) return;

        const deltaMove = new THREE.Vector2(
            event.touches[0].clientX - this.previousMousePosition.x,
            event.touches[0].clientY - this.previousMousePosition.y
        );

        this.rotateCamera(deltaMove.x * this.rotationSpeed);
        this.previousMousePosition.set(event.touches[0].clientX, event.touches[0].clientY);
    }

    onTouchEnd() {
        this.isDragging = false;
    }

    onKeyDown(event) {
        switch(event.key) {
            case 'ArrowLeft':
                this.rotateCamera(-this.rotationSpeed * 10);
                break;
            case 'ArrowRight':
                this.rotateCamera(this.rotationSpeed * 10);
                break;
        }
    }

    rotateCamera(angle) {
        // Rotate camera around the target point
        const radius = this.camera.position.length();
        const currentAngle = Math.atan2(
            this.camera.position.x,
            this.camera.position.z
        );
        
        const newAngle = currentAngle + angle;
        
        this.camera.position.x = radius * Math.sin(newAngle);
        this.camera.position.z = radius * Math.cos(newAngle);
        
        this.camera.lookAt(this.target);
    }

    dispose() {
        // Clean up event listeners
        document.removeEventListener('mousedown', this.onMouseDown);
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('touchstart', this.onTouchStart);
        document.removeEventListener('touchmove', this.onTouchMove);
        document.removeEventListener('touchend', this.onTouchEnd);
        
        // Remove joystick if it exists
        if (this.joystick) {
            this.joystick.destroy();
        }
    }
} 