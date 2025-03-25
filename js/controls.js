class Controls {
    constructor(camera, player) {
        this.camera = camera;
        this.player = player;
        
        // Camera settings
        this.cameraDistance = 40;
        this.cameraHeight = 35;
        this.minCameraHeight = 20;
        this.maxCameraHeight = 70;
        this.rotationSpeed = 1.5;
        this.heightSpeed = 1.0;
        this.angle = 0;
        
        // Player movement settings
        this.moveSpeed = 5;
        this.jumpForce = 10;
        
        // Initialize key states
        this.keys = {
            left: false,
            right: false,
            up: false,
            down: false,
            space: false
        };
        
        // Touch controls
        this.isDragging = false;
        this.previousTouchPosition = { x: 0, y: 0 };
        
        // Set initial camera position
        this.updateCamera();
        
        // Setup controls
        this.setupDesktopControls();
        this.setupMobileControls();
    }

    setupDesktopControls() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', () => this.handleMouseUp());
    }

    setupMobileControls() {
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        document.addEventListener('touchend', () => this.handleTouchEnd());
        
        // Setup virtual joystick
        const mobileControls = document.getElementById('mobile-controls');
        if (mobileControls && typeof nipplejs !== 'undefined') {
            this.joystick = nipplejs.create({
                zone: mobileControls,
                mode: 'static',
                position: { left: '50%', bottom: '20%' },
                color: 'white',
                size: 120
            });
            
            this.joystick.on('move', (evt, data) => {
                const angle = data.angle.radian;
                this.movePlayer(angle);
            });
        }
    }

    handleKeyDown(event) {
        switch(event.key) {
            case 'ArrowLeft':
                this.keys.left = true;
                break;
            case 'ArrowRight':
                this.keys.right = true;
                break;
            case 'ArrowUp':
                this.keys.up = true;
                break;
            case 'ArrowDown':
                this.keys.down = true;
                break;
            case ' ':
                this.keys.space = true;
                break;
        }
    }

    handleKeyUp(event) {
        switch(event.key) {
            case 'ArrowLeft':
                this.keys.left = false;
                break;
            case 'ArrowRight':
                this.keys.right = false;
                break;
            case 'ArrowUp':
                this.keys.up = false;
                break;
            case 'ArrowDown':
                this.keys.down = false;
                break;
            case ' ':
                this.keys.space = false;
                break;
        }
    }

    handleMouseDown(event) {
        this.isDragging = true;
        this.previousTouchPosition = { x: event.clientX, y: event.clientY };
    }

    handleMouseMove(event) {
        if (!this.isDragging) return;
        
        const deltaX = event.clientX - this.previousTouchPosition.x;
        const deltaY = event.clientY - this.previousTouchPosition.y;
        
        this.angle += deltaX * 0.01;
        this.cameraHeight = Math.max(this.minCameraHeight, 
            Math.min(this.maxCameraHeight, this.cameraHeight - deltaY * 0.1));
        
        this.previousTouchPosition = { x: event.clientX, y: event.clientY };
    }

    handleMouseUp() {
        this.isDragging = false;
    }

    handleTouchStart(event) {
        if (event.touches.length === 1) {
            this.isDragging = true;
            this.previousTouchPosition = { 
                x: event.touches[0].clientX, 
                y: event.touches[0].clientY 
            };
        }
    }

    handleTouchMove(event) {
        if (!this.isDragging || event.touches.length !== 1) return;
        
        const deltaX = event.touches[0].clientX - this.previousTouchPosition.x;
        const deltaY = event.touches[0].clientY - this.previousTouchPosition.y;
        
        this.angle += deltaX * 0.01;
        this.cameraHeight = Math.max(this.minCameraHeight, 
            Math.min(this.maxCameraHeight, this.cameraHeight - deltaY * 0.1));
        
        this.previousTouchPosition = { 
            x: event.touches[0].clientX, 
            y: event.touches[0].clientY 
        };
    }

    handleTouchEnd() {
        this.isDragging = false;
    }

    movePlayer(angle) {
        if (!this.player) return;
        
        const moveX = Math.sin(angle) * this.moveSpeed;
        const moveZ = Math.cos(angle) * this.moveSpeed;
        
        this.player.velocity.x = moveX;
        this.player.velocity.z = moveZ;
    }

    update() {
        // Update camera rotation
        if (this.keys.left) {
            this.angle += this.rotationSpeed * 0.02;
        }
        if (this.keys.right) {
            this.angle -= this.rotationSpeed * 0.02;
        }
        
        // Update camera height
        if (this.keys.up) {
            this.cameraHeight = Math.min(this.maxCameraHeight, this.cameraHeight + this.heightSpeed);
        }
        if (this.keys.down) {
            this.cameraHeight = Math.max(this.minCameraHeight, this.cameraHeight - this.heightSpeed);
        }

        // Update player movement
        if (this.keys.left) {
            this.player.velocity.x = -this.moveSpeed;
        } else if (this.keys.right) {
            this.player.velocity.x = this.moveSpeed;
        } else {
            this.player.velocity.x = 0;
        }

        if (this.keys.space && !this.player.isJumping) {
            this.player.velocity.y = this.jumpForce;
            this.player.isJumping = true;
        }

        this.updateCamera();
    }

    updateCamera() {
        // Calculate camera position
        const x = Math.sin(this.angle) * this.cameraDistance;
        const z = Math.cos(this.angle) * this.cameraDistance;
        
        // Get target position (slightly above player)
        const targetY = this.player.mesh.position.y + 5;
        
        // Update camera position
        this.camera.position.set(
            this.player.mesh.position.x + x,
            targetY + this.cameraHeight,
            this.player.mesh.position.z + z
        );
        
        // Make camera look at point slightly above player
        this.camera.lookAt(
            this.player.mesh.position.x,
            targetY,
            this.player.mesh.position.z
        );
    }

    dispose() {
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        document.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('touchend', this.handleTouchEnd);
    }
}