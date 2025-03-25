class Game {
    constructor() {
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
        
        // DOM elements
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.levelCountElement = document.getElementById('level-count');
        this.timeCountElement = document.getElementById('time-count');

        this.init();
    }

    init() {
        console.log('Initializing game');
        
        // Create game components
        this.scene = new Scene();
        this.player = new Player();
        this.audio = new AudioManager();
        this.leaderboard = new Leaderboard();
        
        // Initialize components
        this.audio.init();
        this.player.init(this.scene);
        this.controls = new Controls(this.scene.camera);
        this.monetization = new Monetization(this.scene.scene);
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('Game initialized');
    }

    setupEventListeners() {
        // Start button click
        const startButton = document.getElementById('start-button');
        if (startButton) {
            startButton.addEventListener('click', () => {
                const usernameInput = document.getElementById('username');
                if (usernameInput && usernameInput.value.trim() !== '') {
                    this.username = usernameInput.value.trim();
                    this.start();
                } else {
                    alert('Please enter your name');
                }
            });
        }
        
        // Play again button click
        const playAgainButton = document.getElementById('play-again');
        if (playAgainButton) {
            playAgainButton.addEventListener('click', () => {
                this.restart();
            });
        }
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
    }

    start() {
        if (this.isRunning) return;
        
        console.log('Starting game');
        
        // Hide start screen, show game screen
        if (this.startScreen) this.startScreen.classList.add('hidden');
        if (this.gameScreen) this.gameScreen.classList.remove('hidden');
        
        // Create initial levels
        this.createInitialLevels();
        
        // Reset player position to top of first level
        if (this.levels.length > 0) {
            const firstLevel = this.levels[0];
            this.player.reset(firstLevel.startY + 5);
        }
        
        // Reset game state
        this.gameOver = false;
        this.currentLevel = 1;
        this.levelCompleted = false;
        this.startTime = Date.now();
        this.lastFrameTime = this.startTime;
        this.elapsedTime = 0;
        
        // Start audio
        this.audio.startBackgroundMusic();
        
        // Start game loop
        this.isRunning = true;
        this.gameLoop();
        
        console.log('Game started');
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
        if (this.gameOver) return;
        
        // Update time display
        this.updateTimeDisplay();
        
        // Update player
        this.player.update();
        
        // Update controls
        this.controls.update();
        
        // Update current level
        if (this.levels.length > 0) {
            const currentLevel = this.levels[0];
            currentLevel.update();
            
            // Check collisions
            this.levelCompleted = currentLevel.checkCollision(this.player);
            
            // Check if level completed
            if (this.levelCompleted) {
                this.completeLevel();
            }
        }
        
        // Update monetization
        if (this.monetization.update(this.player.position)) {
            // If an orb was collected
            this.player.addBonusPoints(100);
        }
        
        // Check if player has fallen too far
        if (this.player.position.y < -20) {
            this.endGame();
        }
    }

    updateTimeDisplay() {
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
        
        // Show game over screen
        if (this.gameScreen) this.gameScreen.classList.add('hidden');
        if (this.gameOverScreen) this.gameOverScreen.classList.remove('hidden');
        
        // Show final score
        const finalScoreElement = document.getElementById('final-score');
        if (finalScoreElement) {
            finalScoreElement.innerHTML = `
                <p>Name: ${this.username}</p>
                <p>Level: ${this.currentLevel}</p>
                <p>Time: ${Math.floor(this.elapsedTime)} seconds</p>
            `;
        }
        
        // Add score to leaderboard
        this.leaderboard.addScore({
            name: this.username,
            level: this.currentLevel,
            time: this.elapsedTime,
            date: new Date().toISOString()
        });
        
        // Display leaderboard
        this.leaderboard.display();
    }

    restart() {
        console.log('Restarting game');
        
        // Reset game state
        this.gameOver = false;
        this.currentLevel = 1;
        this.levelCompleted = false;
        
        // Hide game over screen
        if (this.gameOverScreen) this.gameOverScreen.classList.add('hidden');
        
        // Start game again
        this.start();
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
        if (this.scene) this.scene = null;
        
        console.log('Game disposed');
    }
}