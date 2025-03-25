class Game {
    constructor() {
        this.scene = null;
        this.player = null;
        this.levels = [];
        this.currentLevel = 0;
        this.score = 0;
        this.time = 0;
        this.isPlaying = false;
        this.gameOver = false;
        this.username = '';
        this.startTime = 0;
        this.maxTime = 300; // 5 minutes in seconds
        this.lastLevelCompleteTime = 0;
        this.levelCompleteDelay = 1000; // 1 second delay between levels
        this.monetization = null;
        
        // Initialize the game immediately
        this.init();
    }

    init() {
        this.scene = new Scene();
        this.player = new Player();
        this.player.init(this.scene); // Pass the Scene instance instead of scene.scene
        
        // Create initial levels
        this.createInitialLevels();
        
        // Initialize levels with scene
        this.levels.forEach(level => {
            level.init(this.scene);
            console.log('Level initialized:', level);
        });
        
        this.controls = new Controls(this.player);
        this.audio = new Audio();
        this.leaderboard = new Leaderboard();
        this.monetization = new Monetization(this.scene.scene);

        // Add these debug lines
        console.log('Game initialized');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('start-button').addEventListener('click', () => this.start());
        document.getElementById('play-again').addEventListener('click', () => this.restart());
        
        // Handle username input
        document.getElementById('username').addEventListener('input', (e) => {
            this.username = e.target.value.trim();
        });

        // Add monetization event listeners
        document.addEventListener('playerDeath', () => {
            this.monetization.showAdPrompt();
        });
    }

    createInitialLevels() {
        // Create first 5 levels
        for (let i = 0; i < 5; i++) {
            this.levels.push(new Level(i));
        }
    }

    start() {
        if (!this.username) {
            alert('Please enter your name!');
            return;
        }

        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        
        // Important: Add these debug lines - new code
        console.log('Starting game');
        console.log('Scene:', this.scene);
        console.log('Player:', this.player);
        console.log('Levels:', this.levels);
        
        this.isPlaying = true;
        this.startTime = Date.now();
        this.gameLoop();
    }

    gameLoop() {
        if (!this.isPlaying) return;

        const currentTime = Date.now();
        this.time = Math.floor((currentTime - this.startTime) / 1000);
        
        // Update UI
        document.getElementById('level-count').textContent = this.currentLevel + 1;
        document.getElementById('time-count').textContent = this.time;

        // Check for game over conditions
        if (this.time >= this.maxTime || this.gameOver) {
            this.endGame();
            return;
        }

        // Update game state
        this.update();
        
        // Render
        this.scene.render();
        
        // Continue game loop
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        // Fix the guard clause - we want to update when the game is playing and not over
        if (!this.isPlaying || this.gameOver) return;

        this.time += 0.016; // Assuming 60fps
        if (this.player) {
            this.player.update();
        }
        if (this.levels[this.currentLevel]) {
            this.levels[this.currentLevel].update();
        }
        if (this.monetization) {
            this.monetization.update(this.player.mesh.position);
        }
        
        // Update score based on time and level
        this.score = Math.floor(this.time * 10) + (this.currentLevel * 100);
        
        // Update UI - using correct element IDs
        const levelCount = document.getElementById('level-count');
        const timeCount = document.getElementById('time-count');
        
        if (levelCount) {
            levelCount.textContent = this.currentLevel + 1;
        }
        if (timeCount) {
            timeCount.textContent = Math.floor(this.time);
        }

        // Check for level completion
        const currentTime = Date.now();
        if (this.player && this.player.position.y < this.levels[this.currentLevel].bottomY && 
            currentTime - this.lastLevelCompleteTime > this.levelCompleteDelay) {
            this.completeLevel();
            this.lastLevelCompleteTime = currentTime;
        }
        
        // Check for collisions
        if (this.checkCollisions()) {
            this.gameOver = true;
        }
    }

    completeLevel() {
        this.currentLevel++;
        this.score += 100;
        
        // Create new level if needed
        if (this.currentLevel >= this.levels.length) {
            this.levels.push(new Level(this.currentLevel));
            this.levels[this.currentLevel].init(this.scene);
        }
        
        // Reset player position for new level
        this.player.reset(this.levels[this.currentLevel].startY);
        
        // Play success sound
        this.audio.playSuccess();
    }

    checkCollisions() {
        const currentLevel = this.levels[this.currentLevel];
        return currentLevel.checkCollision(this.player);
    }

    endGame() {
        this.isPlaying = false;
        
        // Update leaderboard
        this.leaderboard.addScore({
            name: this.username,
            score: this.score,
            time: this.time,
            levels: this.currentLevel
        });
        
        // Show game over screen
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.remove('hidden');
        
        // Display final score
        const finalScore = document.getElementById('final-score');
        if (finalScore) {
            finalScore.textContent = 
                `Final Score: ${this.score} | Levels: ${this.currentLevel} | Time: ${this.time}s`;
        }
        
        // Update leaderboard display
        this.leaderboard.display();
        
        // Play game over sound
        this.audio.playGameOver();

        // Trigger ad prompt
        document.dispatchEvent(new Event('playerDeath'));
    }

    restart() {
        // Reset game state
        this.currentLevel = 0;
        this.score = 0;
        this.time = 0;
        this.gameOver = false;
        this.levels = [];
        this.createInitialLevels();
        
        // Reset player
        this.player.reset(this.levels[0].startY);
        
        // Hide game over screen
        document.getElementById('game-over-screen').classList.add('hidden');
        
        // Start new game
        this.start();
    }
} 