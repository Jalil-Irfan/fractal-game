class Game {
    constructor() {
        console.log('Game constructor called');
        
        // Game state
        this.isRunning = false;
        this.currentLevel = 1;
        this.levelCompleted = false;
        this.gameOver = false;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.lastFrameTime = 0;
        this.username = '';
        
        // Game objects
        this.scene = null;
        this.player = null;
        this.levels = [];
        this.audio = null;
        this.controls = null;
        this.leaderboard = null;
        this.monetization = null;
        this.portals = [];
        
        // DOM elements
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.levelCountElement = document.getElementById('level-count');
        this.timeCountElement = document.getElementById('time-count');

        console.log('DOM elements:', {
            startScreen: this.startScreen,
            gameScreen: this.gameScreen,
            gameOverScreen: this.gameOverScreen,
            levelCountElement: this.levelCountElement,
            timeCountElement: this.timeCountElement
        });

        // Initialize immediately
        this.init();
    }

    init() {
        console.log('Initializing game');
        
        // Initialize audio
        this.audio = new AudioManager();
        this.audio.init();

        // Initialize scene
        this.scene = new Scene();

        // Initialize player
        this.player = new Player();
        this.player.init(this.scene);

        // Initialize controls
        this.controls = new Controls(this.scene.camera, this.player);

        // Initialize levels
        this.levels = [];
        this.currentLevel = 1;
        this.createInitialLevels();

        // Initialize UI
        this.initUI();

        // Initialize monetization
        this.monetization = new Monetization();

        // Initialize leaderboard
        this.leaderboard = new Leaderboard();

        // Start game loop
        this.isRunning = true;
        this.lastTime = performance.now();
        this.elapsedTime = 0;
        this.gameLoop();

        // Add event listeners
        window.addEventListener('resize', () => this.handleResize());
        document.getElementById('mute-button').addEventListener('click', () => this.handleMute());

        console.log('Game initialized successfully');
    }

    initUI() {
        // Initialize UI elements
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.levelCountElement = document.getElementById('level-count');
        this.timeCountElement = document.getElementById('time-count');

        // Set up event listeners
        this.setupEventListeners();

        // On initial load/refresh, only show login screen
        if (this.startScreen) {
            this.startScreen.classList.remove('hidden');
            this.startScreen.style.display = 'flex';
            this.startScreen.style.zIndex = '10';
            this.startScreen.style.position = 'absolute';
            this.startScreen.style.top = '0';
            this.startScreen.style.left = '0';
            this.startScreen.style.width = '100%';
            this.startScreen.style.height = '100%';
            this.startScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        }
        
        // Hide other screens
        if (this.gameScreen) {
            this.gameScreen.classList.add('hidden');
            this.gameScreen.style.display = 'none';
            this.gameScreen.style.zIndex = '1';
        }
        
        if (this.gameOverScreen) {
            this.gameOverScreen.classList.add('hidden');
            this.gameOverScreen.style.display = 'none';
            this.gameOverScreen.style.zIndex = '1';
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Start button click
        const startButton = document.getElementById('start-button');
        console.log('Start button element:', startButton);
        
        if (startButton) {
            startButton.addEventListener('click', (e) => {
                console.log('Start button clicked!');
                const usernameInput = document.getElementById('username');
                console.log('Username input element:', usernameInput);
                
                if (usernameInput && usernameInput.value.trim() !== '') {
                    this.username = usernameInput.value.trim();
                    console.log('Starting game with username:', this.username);
                    this.start();
                } else {
                    console.log('No username entered');
                    alert('Please enter your name');
                }
            });
            console.log('Start button click listener added');
        } else {
            console.error('Start button not found in DOM');
        }
        
        // Play again button click
        const playAgainButton = document.getElementById('play-again');
        console.log('Play again button element:', playAgainButton);
        
        if (playAgainButton) {
            playAgainButton.addEventListener('click', () => {
                console.log('Play again button clicked');
                this.restart();
            });
            console.log('Play again button click listener added');
        }

        // Mute button click
        const muteButton = document.getElementById('mute-button');
        console.log('Mute button element:', muteButton);
        
        if (muteButton) {
            muteButton.addEventListener('click', () => {
                console.log('Mute button clicked');
                const isMuted = this.audio.toggleMute();
                muteButton.textContent = isMuted ? '🔇' : '🔊';
                muteButton.classList.toggle('muted', isMuted);
            });
            console.log('Mute button click listener added');
        } else {
            console.error('Mute button not found in DOM');
        }
        
        console.log('Event listeners setup complete');
    }

    createInitialLevels() {
        // Clear any existing levels
        this.levels.forEach(level => level.dispose(this.scene));
        this.levels = [];
        
        // Create first level
        const firstLevel = new Level(this.currentLevel);
        firstLevel.init(this.scene);
        this.levels.push(firstLevel);
        
        // Update level display
        if (this.levelCountElement) {
            this.levelCountElement.textContent = this.currentLevel.toString();
        }

        // Add exit portal at the end of the level if Portal class is defined
        if (typeof Portal !== 'undefined') {
            const exitPortal = new Portal(
                this.scene,
                new THREE.Vector3(0, firstLevel.endY + 5, 0),
                new THREE.Euler(0, 0, 0),
                false
            );
            exitPortal.init();
            this.portals.push(exitPortal);
            console.log('Exit portal created');
        } else {
            console.warn('Portal class not defined, skipping portal creation');
        }
    }

    start() {
        console.log('Start method called');
        
        if (this.isRunning) {
            console.log('Game is already running');
            return;
        }
        
        // Hide start screen, show game screen
        if (this.startScreen) {
            this.startScreen.classList.add('hidden');
            this.startScreen.style.display = 'none';
            console.log('Start screen hidden');
        } else {
            console.error('Start screen element not found');
        }
        
        if (this.gameScreen) {
            this.gameScreen.classList.remove('hidden');
            this.gameScreen.style.display = 'flex';
            console.log('Game screen shown');
        } else {
            console.error('Game screen element not found');
        }
        
        // Create initial levels
        this.createInitialLevels();
        
        // Reset player position to top of first level
        if (this.levels.length > 0) {
            const firstLevel = this.levels[0];
            this.player.reset(firstLevel.startY + 5);
            console.log('Player position reset');
        } else {
            console.error('No levels created');
        }
        
        // Reset game state
        this.gameOver = false;
        this.currentLevel = 1;
        this.levelCompleted = false;
        this.startTime = Date.now();
        this.lastFrameTime = this.startTime;
        this.elapsedTime = 0;
        
        // Start audio
        if (this.audio) {
            this.audio.startBackgroundMusic();
            console.log('Background music started');
        }
        
        // Start game loop
        this.isRunning = true;
        this.gameLoop();
        
        console.log('Game started successfully');
    }

    gameLoop() {
        if (!this.isRunning) return;
        
        // Calculate delta time
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
        this.lastFrameTime = currentTime;
        
        // Update elapsed time (only when game is running)
        this.elapsedTime = (currentTime - this.startTime) / 1000;
        
        // Update game
        this.update(deltaTime);
        
        // Render scene
        this.scene.render();
        
        // Continue game loop
        requestAnimationFrame(() => this.gameLoop());
    }

    update(deltaTime) {
        if (!this.isRunning) return;

        // Update player
        if (this.player) {
            this.player.update(deltaTime);
            
            // Check if player has fallen out of bounds
            if (this.player.mesh.position.y < -100) { // Adjust this value based on your game's scale
                this.endGame();
                return;
            }
        }

        // Update portals
        this.portals.forEach(portal => {
            portal.update();
        });

        // Check portal collisions
        if (this.player) {
            this.portals.forEach(portal => {
                if (portal.checkCollision(this.player.mesh)) {
                    portal.handlePortalEnter();
                }
            });
        }

        // Update levels
        this.levels.forEach(level => {
            level.update(deltaTime);
        });

        // Check level completion
        if (this.levels.length > 0 && this.levels[0].checkCollision(this.player)) {
            this.completeLevel();
        }

        // Update camera
        if (this.controls) {
            this.controls.update();
        }

        // Update monetization
        if (this.monetization) {
            this.monetization.update();
        }

        // Update UI
        if (this.timeCountElement) {
            this.timeCountElement.textContent = Math.floor(this.elapsedTime).toString();
        }
    }

    completeLevel() {
        // Reset level completion flag
        this.levelCompleted = false;
        
        // Play success sound
        this.audio.playSuccess();
        
        // Increment level
        this.currentLevel++;
        
        // Update level display
        if (this.levelCountElement) {
            this.levelCountElement.textContent = this.currentLevel.toString();
        }
        
        // Create new level
        const newLevel = new Level(this.currentLevel);
        newLevel.init(this.scene);
        
        // Remove old level
        const oldLevel = this.levels.shift();
        oldLevel.dispose(this.scene);
        
        // Add new level
        this.levels.push(newLevel);
        
        // Reset player position to top of new level
        this.player.reset(newLevel.startY + 5);
        
        console.log(`Level ${this.currentLevel - 1} completed, starting level ${this.currentLevel}`);
    }

    checkCollisions() {
        if (this.levels.length > 0) {
            return this.levels[0].checkCollision(this.player);
        }
        return false;
    }

    endGame() {
        if (this.gameOver) return;
        
        console.log('Game over');
        
        // Set game over state
        this.gameOver = true;
        this.isRunning = false;
        
        // Stop player
        this.player.stop();
        
        // Play game over sound
        this.audio.playGameOver();
        this.audio.stopBackgroundMusic();
        
        // Format time properly
        const formattedTime = this.formatTime(this.elapsedTime);
        
        // Hide all other screens
        if (this.startScreen) {
            this.startScreen.classList.add('hidden');
            this.startScreen.style.display = 'none';
            this.startScreen.style.zIndex = '1';
        }
        
        if (this.gameScreen) {
            this.gameScreen.classList.add('hidden');
            this.gameScreen.style.display = 'none';
            this.gameScreen.style.zIndex = '1';
        }
        
        // Show game over screen with dashboard
        if (this.gameOverScreen) {
            this.gameOverScreen.classList.remove('hidden');
            this.gameOverScreen.style.display = 'flex';
            this.gameOverScreen.style.zIndex = '10';
            this.gameOverScreen.style.position = 'absolute';
            this.gameOverScreen.style.top = '0';
            this.gameOverScreen.style.left = '0';
            this.gameOverScreen.style.width = '100%';
            this.gameOverScreen.style.height = '100%';
            this.gameOverScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        }
        
        // Show final score
        const finalScoreElement = document.getElementById('final-score');
        if (finalScoreElement) {
            finalScoreElement.innerHTML = `
                <p>Name: ${this.username || 'Anonymous'}</p>
                <p>Level: ${this.currentLevel}</p>
                <p>Time: ${formattedTime}</p>
            `;
        }
        
        // Add score to leaderboard
        this.leaderboard.addScore({
            name: this.username || 'Anonymous',
            level: this.currentLevel,
            time: this.elapsedTime,
            date: new Date().toISOString()
        });
        
        // Display leaderboard
        this.leaderboard.display();
    }

    formatTime(seconds) {
        if (!Number.isFinite(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    restart() {
        console.log('Restarting game');
        
        // Reset game state
        this.gameOver = false;
        this.currentLevel = 1;
        this.levelCompleted = false;
        
        // Hide game over screen
        if (this.gameOverScreen) {
            this.gameOverScreen.classList.add('hidden');
            this.gameOverScreen.style.display = 'none';
            this.gameOverScreen.style.zIndex = '1';
        }
        
        // Show start screen
        if (this.startScreen) {
            this.startScreen.classList.remove('hidden');
            this.startScreen.style.display = 'flex';
            this.startScreen.style.zIndex = '10';
            this.startScreen.style.position = 'absolute';
            this.startScreen.style.top = '0';
            this.startScreen.style.left = '0';
            this.startScreen.style.width = '100%';
            this.startScreen.style.height = '100%';
            this.startScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        }
        
        // Reset username input
        const usernameInput = document.getElementById('username');
        if (usernameInput) {
            usernameInput.value = '';
        }
    }

    dispose() {
        // Stop game loop
        this.isRunning = false;
        
        // Dispose components
        if (this.player) this.player = null;
        if (this.levels) {
            this.levels.forEach(level => level.dispose(this.scene));
            this.levels = [];
        }
        if (this.controls) {
            this.controls.dispose();
            this.controls = null;
        }
        if (this.audio) {
            this.audio.dispose();
            this.audio = null;
        }
        if (this.monetization) {
            this.monetization.dispose();
            this.monetization = null;
        }
        if (this.portals) {
            this.portals.forEach(portal => portal.dispose());
            this.portals = [];
        }
        if (this.scene) this.scene = null;
        
        console.log('Game disposed');
    }

    handleMute() {
        if (this.audio) {
            this.audio.toggleMute();
        }
    }

    handleResize() {
        // Update camera aspect ratio
        if (this.scene && this.scene.camera) {
            this.scene.camera.aspect = window.innerWidth / window.innerHeight;
            this.scene.camera.updateProjectionMatrix();
        }

        // Update renderer size
        if (this.scene && this.scene.renderer) {
            this.scene.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
}