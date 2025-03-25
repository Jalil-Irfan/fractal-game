class AudioManager {
    constructor() {
        this.sounds = {};
        this.audioContext = null;
        this.masterGain = null;
        this.isMuted = false;
        this.backgroundMusic = null;
        this.currentTrackIndex = 0;
        this.volume = 0.5; // Default volume
        this.tracks = [
            {
                name: "Track 1",
                url: "audio/track1.mp3"
            },
            {
                name: "Track 2",
                url: "audio/track2.mp3"
            },
            {
                name: "Track 3",
                url: "audio/track3.mp3"
            },
            {
                name: "Track 4",
                url: "audio/track4.mp3"
            },
            {
                name: "Track 5",
                url: "audio/track5.mp3"
            }
        ];
        
        // Add audio context listener
        document.addEventListener('click', () => this.resumeAudioContext(), { once: true });
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.volume;
            
            // Create music player UI
            this.createMusicPlayerUI();
            
            // Load sound effects
            this.loadSoundEffects();
            
            // Start playing the first track
            this.startBackgroundMusic();
            
            console.log('Audio system initialized');
        } catch (error) {
            console.error('Error initializing audio:', error);
        }
    }

    createMusicPlayerUI() {
        const playerContainer = document.createElement('div');
        playerContainer.className = 'music-player';
        playerContainer.innerHTML = `
            <div class="music-player-content">
                <div class="track-info">
                    <span id="current-track-name">Loading...</span>
                </div>
                <div class="player-controls">
                    <button id="prev-track" class="player-btn">⏮</button>
                    <button id="play-pause" class="player-btn">⏸</button>
                    <button id="next-track" class="player-btn">⏭</button>
                    <button id="mute-button" class="player-btn">🔊</button>
                </div>
                <div class="volume-control">
                    <input type="range" id="volume-slider" min="0" max="100" value="${this.volume * 100}">
                </div>
            </div>
        `;
        document.body.appendChild(playerContainer);

        // Add event listeners
        document.getElementById('prev-track').addEventListener('click', () => this.playPreviousTrack());
        document.getElementById('next-track').addEventListener('click', () => this.playNextTrack());
        document.getElementById('play-pause').addEventListener('click', () => this.togglePlayPause());
        document.getElementById('volume-slider').addEventListener('input', (e) => this.setVolume(e.target.value / 100));
        document.getElementById('mute-button').addEventListener('click', () => this.toggleMute());
    }

    async loadSoundEffects() {
        const soundFiles = {
            falling: 'audio/falling.mp3',
            bounce: 'audio/bounce.mp3',
            success: 'audio/success.mp3',
            gameOver: 'audio/gameover.mp3'
        };

        for (const [name, url] of Object.entries(soundFiles)) {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    console.warn(`Sound file not found: ${url}`);
                    continue;
                }
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                this.sounds[name] = audioBuffer;
                console.log(`Loaded sound: ${name}`);
            } catch (error) {
                console.warn(`Error loading sound ${name}: ${error.message}`);
                // Create a silent buffer as fallback
                const silentBuffer = this.audioContext.createBuffer(1, 1, 22050);
                this.sounds[name] = silentBuffer;
            }
        }
    }

    async loadTrack(track) {
        try {
            const response = await fetch(track.url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            return audioBuffer;
        } catch (error) {
            console.error(`Error loading track ${track.name}:`, error);
            return null;
        }
    }

    async startBackgroundMusic() {
        // Stop any existing music
        this.stopBackgroundMusic();
        
        // Load and play the current track
        const track = this.tracks[this.currentTrackIndex];
        const audioBuffer = await this.loadTrack(track);
        
        if (audioBuffer) {
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.loop = true;
            source.connect(this.masterGain);
            source.start();
            
            this.backgroundMusic = source;
            
            // Update UI
            document.getElementById('current-track-name').textContent = track.name;
            document.getElementById('play-pause').textContent = '⏸';
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.masterGain) {
            this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
            console.log(`Audio ${this.isMuted ? 'muted' : 'unmuted'}, volume: ${this.masterGain.gain.value}`);
        }
        
        // Update mute button text
        const muteButton = document.getElementById('mute-button');
        if (muteButton) {
            muteButton.textContent = this.isMuted ? '🔇' : '🔊';
        }
        
        return this.isMuted;
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
            this.backgroundMusic = null;
        }
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
        
        try {
            const source = this.audioContext.createBufferSource();
            source.buffer = this.sounds[soundName];
            source.connect(this.masterGain);
            source.start();
        } catch (error) {
            console.warn(`Error playing sound ${soundName}: ${error.message}`);
        }
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

    playNextTrack() {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        this.startBackgroundMusic();
    }

    playPreviousTrack() {
        this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
        this.startBackgroundMusic();
    }

    togglePlayPause() {
        if (this.backgroundMusic) {
            const isPlaying = this.backgroundMusic.state === 'running';
            if (isPlaying) {
                this.backgroundMusic.stop();
                document.getElementById('play-pause').textContent = '▶';
            } else {
                this.startBackgroundMusic();
                document.getElementById('play-pause').textContent = '⏸';
            }
        }
    }

    setVolume(value) {
        this.volume = value;
        if (this.masterGain && !this.isMuted) {
            this.masterGain.gain.value = value;
            console.log(`Volume set to: ${value}`);
        }
    }

    dispose() {
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.sounds = {};
    }
}