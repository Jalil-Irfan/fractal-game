class AudioManager {
    constructor() {
        this.sounds = {};
        this.bgMusic = null;
        this.isMuted = false;
        this.volume = 0.5;
        
        this.init();
    }

    init() {
        // Create audio context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create background music
        this.createBackgroundMusic();
        
        // Create sound effects
        this.createSoundEffects();
        
        // Handle user interaction for audio context
        document.addEventListener('click', () => this.resumeAudioContext(), { once: true });
        document.addEventListener('touchstart', () => this.resumeAudioContext(), { once: true });
    }

    createBackgroundMusic() {
        // Create oscillator for ambient background music
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
        
        // Create a gentle, pulsing effect
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 2);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 4);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        this.bgMusic = {
            oscillator: oscillator,
            gainNode: gainNode
        };
    }

    createSoundEffects() {
        // Create falling sound
        this.sounds.falling = this.createFallingSound();
        
        // Create bounce sound
        this.sounds.bounce = this.createBounceSound();
        
        // Create success sound
        this.sounds.success = this.createSuccessSound();
        
        // Create game over sound
        this.sounds.gameOver = this.createGameOverSound();
    }

    createFallingSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(440, this.audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        return { oscillator, gainNode };
    }

    createBounceSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(660, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(220, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        return { oscillator, gainNode };
    }

    createSuccessSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(880, this.audioContext.currentTime + 0.2);
        oscillator.frequency.linearRampToValueAtTime(440, this.audioContext.currentTime + 0.4);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.4);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        return { oscillator, gainNode };
    }

    createGameOverSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(220, this.audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        return { oscillator, gainNode };
    }

    resumeAudioContext() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    playSound(soundName) {
        if (this.isMuted) return;
        
        const sound = this.sounds[soundName];
        if (!sound) return;
        
        const newOscillator = this.audioContext.createOscillator();
        newOscillator.type = sound.oscillator.type;
        newOscillator.frequency.setValueAtTime(sound.oscillator.frequency.value, this.audioContext.currentTime);
        newOscillator.connect(sound.gainNode);
        newOscillator.start();
        newOscillator.stop(this.audioContext.currentTime + 0.5);
    }

    playFalling() {
        this.playSound('falling');
    }

    playBounce() {
        this.playSound('bounce');
    }

    playSuccess() {
        this.playSound('success');
    }

    playGameOver() {
        this.playSound('gameOver');
    }

    startBackgroundMusic() {
        if (this.isMuted) return;
        this.bgMusic.oscillator.start();
    }

    stopBackgroundMusic() {
        this.bgMusic.oscillator.stop();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBackgroundMusic();
        } else {
            this.startBackgroundMusic();
        }
    }

    dispose() {
        // Stop all sounds
        Object.values(this.sounds).forEach(sound => {
            sound.oscillator.stop();
        });
        
        if (this.bgMusic) {
            this.bgMusic.oscillator.stop();
        }
        
        // Close audio context
        this.audioContext.close();
    }
} 