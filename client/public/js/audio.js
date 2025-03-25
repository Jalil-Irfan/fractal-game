class AudioManager {
    constructor() {
        this.sounds = {};
        this.audioContext = null;
        this.backgroundMusic = null;
        this.isMuted = false;
        
        // Add audio context listener
        document.addEventListener('click', () => this.resumeAudioContext(), { once: true });
    }

    init() {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create sounds
            this.createBackgroundMusic();
            this.createSoundEffects();
            
            console.log('Audio initialized');
        } catch (error) {
            console.error('Error initializing audio:', error);
        }
    }

    createBackgroundMusic() {
        // Create a more soothing background music using multiple oscillators
        const frequencies = [220, 277.18, 329.63, 440]; // A3, C#4, E4, A4 (A major chord)
        const oscillators = [];
        const gainNodes = [];
        
        frequencies.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            // Use sine wave for smooth sound
            oscillator.type = 'sine';
            oscillator.frequency.value = freq;
            
            // Create a gentle pulsing effect
            const pulseGain = this.audioContext.createGain();
            const pulseOsc = this.audioContext.createOscillator();
            pulseOsc.type = 'sine';
            pulseOsc.frequency.value = 0.5; // Slow pulse
            pulseOsc.connect(pulseGain);
            pulseGain.gain.value = 0.05; // Subtle pulse
            pulseGain.connect(oscillator.frequency);
            
            // Set initial volume based on frequency (lower notes slightly louder)
            gainNode.gain.value = 0.05 * (1 - (index * 0.1));
            
            // Add slight delay between notes
            const delay = this.audioContext.createDelay();
            delay.delayTime.value = index * 0.1;
            
            oscillator.connect(delay);
            delay.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillators.push(oscillator);
            gainNodes.push(gainNode);
        });
        
        this.backgroundMusic = {
            oscillators: oscillators,
            gainNodes: gainNodes,
            isPlaying: false
        };
    }

    createSoundEffects() {
        this.createFallingSound();
        this.createBounceSound();
        this.createSuccessSound();
        this.createGameOverSound();
    }

    createFallingSound() {
        const bufferSize = this.audioContext.sampleRate * 0.5; // 0.5 second buffer
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            // Create a swoosh sound that starts high and drops in frequency
            const t = i / this.audioContext.sampleRate;
            data[i] = Math.sin(1000 * (1 - t) * t * 20) * (1 - t);
        }
        
        this.sounds.falling = buffer;
    }

    createBounceSound() {
        const bufferSize = this.audioContext.sampleRate * 0.2; // 0.2 second buffer
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            const t = i / bufferSize;
            data[i] = Math.sin(1200 * Math.PI * t) * (1 - t);
        }
        
        this.sounds.bounce = buffer;
    }

    createSuccessSound() {
        const bufferSize = this.audioContext.sampleRate * 0.5; // 0.5 second buffer
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            const t = i / this.audioContext.sampleRate;
            // Mix two tones for a happy chime
            data[i] = Math.sin(880 * Math.PI * t) * Math.exp(-3 * t) * 0.5 
                    + Math.sin(1320 * Math.PI * t) * Math.exp(-5 * t) * 0.5;
        }
        
        this.sounds.success = buffer;
    }

    createGameOverSound() {
        const bufferSize = this.audioContext.sampleRate * 1; // 1 second buffer
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            const t = i / this.audioContext.sampleRate;
            // Descending tone for game over
            data[i] = Math.sin(220 * Math.PI * (1 - t) * 2) * Math.exp(-2 * t);
        }
        
        this.sounds.gameOver = buffer;
    }

    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log('Audio context resumed');
            });
        }
    }

    playSound(soundName) {
        if (this.isMuted || !this.audioContext || !this.sounds[soundName]) return;
        
        const source = this.audioContext.createBufferSource();
        source.buffer = this.sounds[soundName];
        source.connect(this.audioContext.destination);
        source.start();
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
        if (this.isMuted || !this.backgroundMusic || this.backgroundMusic.isPlaying) return;
        
        // Start all oscillators
        this.backgroundMusic.oscillators.forEach(osc => osc.start());
        this.backgroundMusic.isPlaying = true;
    }

    stopBackgroundMusic() {
        if (!this.backgroundMusic || !this.backgroundMusic.isPlaying) return;
        
        try {
            // Stop all oscillators
            this.backgroundMusic.oscillators.forEach(osc => osc.stop());
            this.backgroundMusic.isPlaying = false;
            
            // Recreate oscillators as they can't be restarted once stopped
            this.createBackgroundMusic();
        } catch (error) {
            console.error('Error stopping background music:', error);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.backgroundMusic) {
            this.backgroundMusic.gainNodes.forEach(gainNode => {
                gainNode.gain.value = this.isMuted ? 0 : gainNode.gain.defaultValue;
            });
        }
        
        return this.isMuted;
    }

    dispose() {
        this.stopBackgroundMusic();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.sounds = {};
    }
}