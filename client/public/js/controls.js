class Controls {
    constructor(camera) {
        this.camera = camera;
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.cameraRadius = 35; // Distance from camera to center
        this.cameraHeight = 20;
        this.cameraAngle = 0;
        this.rotationSpeed = 0.01;
        
        // Controls state
        this.keysPressed = {
            left: false,
            right: false
        };
        
        this.joystick = null;
        
        // Set initial camera position
        this.updateCameraPosition();
        
        // Detect if we're on a mobile device
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (this.isMobile) {
            this.setupMobileControls();
        } else {
            this.setupDesktopControls();
        }
    }
    
    setupDesktopControls() {
        // Mouse controls
        document.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        
        // Keyboard controls
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', (event) => {
            if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
                this.keysPressed.left = false;
            } else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
                this.keysPressed.right = false;
            }
        });
    }
    
    setupMobileControls() {
        // Touch controls
        document.addEventListener('touchstart', this.onTouchStart.bind(this));
        document.addEventListener('touchmove', this.onTouchMove.bind(this));
        document.addEventListener('touchend', this.onTouchEnd.bind(this));
        
        // Virtual joystick for mobile
        this.setupVirtualJoystick();
    }
    
    setupVirtualJoystick() {
        const mobileControls = document.getElementById('mobile-controls');
        if (!mobileControls) return;
        
        if (typeof nipplejs !== 'undefined') {
            this.joystick = nipplejs.create({
                zone: mobileControls,
                mode: 'static',
                position: { left: '50%', top: '50%' },
                color: 'rgba(74, 144, 226, 0.5)',
                size: 120
            });
            
            this.joystick.on('move', (event, data) => {
                if (data.direction) {
                    if (data.direction.angle === 'left') {
                        this.rotateCamera(this.rotationSpeed * 2);
                    } else if (data.direction.angle === 'right') {
                        this.rotateCamera(-this.rotationSpeed * 2);
                    }
                }
            });
            
            mobileControls.style.display = 'block';
        } else {
            console.warn('nipplejs not loaded, virtual joystick disabled');
        }
    }
    
    onMouseDown(event) {
        this.isDragging = true;
        this.previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }
    
    onMouseMove(event) {
        if (!this.isDragging) return;
        
        const deltaMove = {
            x: event.clientX - this.previousMousePosition.x,
            y: event.clientY - this.previousMousePosition.y
        };
        
        // Only rotate camera based on horizontal mouse movement
        this.rotateCamera(-deltaMove.x * 0.01);
        
        this.previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }
    
    onMouseUp() {
        this.isDragging = false;
    }
    
    onTouchStart(event) {
        if (event.touches.length === 1) {
            this.isDragging = true;
            this.previousMousePosition = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        }
    }
    
    onTouchMove(event) {
        if (!this.isDragging || event.touches.length !== 1) return;
        
        const deltaMove = {
            x: event.touches[0].clientX - this.previousMousePosition.x,
            y: event.touches[0].clientY - this.previousMousePosition.y
        };
        
        // Only rotate camera based on horizontal touch movement
        this.rotateCamera(-deltaMove.x * 0.01);
        
        this.previousMousePosition = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
    }
    
    onTouchEnd() {
        this.isDragging = false;
    }
    
    onKeyDown(event) {
        if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
            this.keysPressed.left = true;
        } else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
            this.keysPressed.right = true;
        }
    }
    
    rotateCamera(angle) {
        this.cameraAngle += angle;
        this.updateCameraPosition();
    }
    
    updateCameraPosition() {
        // Calculate camera position based on angle and radius
        this.camera.position.x = Math.sin(this.cameraAngle) * this.cameraRadius;
        this.camera.position.z = Math.cos(this.cameraAngle) * this.cameraRadius;
        this.camera.position.y = this.cameraHeight;
        
        // Always look at the origin
        this.camera.lookAt(0, 0, 0);
    }
    
    update() {
        // Handle key presses
        if (this.keysPressed.left) {
            this.rotateCamera(this.rotationSpeed);
        }
        if (this.keysPressed.right) {
            this.rotateCamera(-this.rotationSpeed);
        }
    }
    
    dispose() {
        // Remove event listeners
        document.removeEventListener('mousedown', this.onMouseDown);
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
        document.removeEventListener('touchstart', this.onTouchStart);
        document.removeEventListener('touchmove', this.onTouchMove);
        document.removeEventListener('touchend', this.onTouchEnd);
        document.removeEventListener('keydown', this.onKeyDown);
        
        // Remove joystick
        if (this.joystick) {
            this.joystick.destroy();
        }
    }
}