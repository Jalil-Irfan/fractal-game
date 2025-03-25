class AudioManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.volume = 0.5;
        this.masterGain.gain.value = this.volume;
        
        this.sounds = {};
        this.isMuted = false;
        this.currentTrackIndex = 0;
        
        this.tracks = [
            { name: "Track 1", url: "audio/track1.mp3" },
            { name: "Track 2", url: "audio/track2.mp3" },
            { name: "Track 3", url: "audio/track3.mp3" },
            { name: "Track 4", url: "audio/track4.mp3" },
            { name: "Track 5", url: "audio/track5.mp3" }
        ];
        
        this.currentTrack = null;
        this.trackSource = null;
    }

    async init() {
        await this.loadSoundEffects();
        this.createMusicPlayerUI();
    }

    createMusicPlayerUI() {
        // Create music player container
        const playerContainer = document.createElement('div');
        playerContainer.id = 'music-player';
        playerContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 10px;
            padding: 10px;
            color: white;
            z-index: 1000;
            width: 300px;
            display: none;
        `;

        // Create header/toggle
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            padding: 5px;
        `;
        header.innerHTML = '<span>Music Player</span><span class="toggle">▼</span>';

        // Create content container
        const content = document.createElement('div');
        content.style.cssText = `
            margin-top: 10px;
            display: none;
        `;

        // Create track info
        const trackInfo = document.createElement('div');
        trackInfo.id = 'track-info';
        trackInfo.style.cssText = 'margin-bottom: 10px; text-align: center;';
        trackInfo.textContent = this.tracks[this.currentTrackIndex].name;

        // Create controls
        const controls = document.createElement('div');
        controls.style.cssText = `
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-bottom: 10px;
        `;

        // Previous button
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '⏮';
        prevButton.onclick = () => this.previousTrack();
        prevButton.style.cssText = this.getButtonStyle();

        // Play/Pause button
        const playButton = document.createElement('button');
        playButton.innerHTML = '⏸';
        playButton.onclick = () => this.togglePlay();
        playButton.style.cssText = this.getButtonStyle();

        // Next button
        const nextButton = document.createElement('button');
        nextButton.innerHTML = '⏭';
        nextButton.onclick = () => this.nextTrack();
        nextButton.style.cssText = this.getButtonStyle();

        // Mute button
        const muteButton = document.createElement('button');
        muteButton.innerHTML = '🔊';
        muteButton.onclick = () => this.toggleMute();
        muteButton.style.cssText = this.getButtonStyle();

        // Volume slider
        const volumeSlider = document.createElement('input');
        volumeSlider.type = 'range';
        volumeSlider.min = '0';
        volumeSlider.max = '1';
        volumeSlider.step = '0.1';
        volumeSlider.value = this.volume;
        volumeSlider.style.cssText = `
            width: 100%;
            margin-top: 10px;
        `;
        volumeSlider.oninput = (e) => this.setVolume(parseFloat(e.target.value));

        // Add all elements
        controls.appendChild(prevButton);
        controls.appendChild(playButton);
        controls.appendChild(nextButton);
        controls.appendChild(muteButton);
        
        content.appendChild(trackInfo);
        content.appendChild(controls);
        content.appendChild(volumeSlider);

        playerContainer.appendChild(header);
        playerContainer.appendChild(content);

        // Add click handler for accordion
        header.onclick = () => {
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
            header.querySelector('.toggle').textContent = content.style.display === 'none' ? '▼' : '▲';
        };

        document.body.appendChild(playerContainer);
    }

    getButtonStyle() {
        return `
            background: none;
            border: 1px solid white;
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s;
            &:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }
        `;
    }

    async loadTrack(index) {
        try {
            const response = await fetch(this.tracks[index].url);
            if (!response.ok) {
                console.warn(`Track file not found: ${this.tracks[index].url}`);
                return null;
            }
            const arrayBuffer = await response.arrayBuffer();
            return await this.audioContext.decodeAudioData(arrayBuffer);
        } catch (error) {
            console.warn(`Error loading track ${index}: ${error.message}`);
            return null;
        }
    }

    async startBackgroundMusic() {
        if (this.trackSource) {
            this.trackSource.stop();
            this.trackSource = null;
        }

        this.currentTrack = await this.loadTrack(this.currentTrackIndex);
        if (!this.currentTrack) return;

        this.trackSource = this.audioContext.createBufferSource();
        this.trackSource.buffer = this.currentTrack;
        this.trackSource.loop = true;
        this.trackSource.connect(this.masterGain);
        this.trackSource.start();

        // Update track info display
        const trackInfo = document.getElementById('track-info');
        if (trackInfo) {
            trackInfo.textContent = this.tracks[this.currentTrackIndex].name;
        }
    }

    async nextTrack() {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        await this.startBackgroundMusic();
    }

    async previousTrack() {
        this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
        await this.startBackgroundMusic();
    }

    togglePlay() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        } else if (this.audioContext.state === 'running') {
            this.audioContext.suspend();
        }
        
        const playButton = document.querySelector('#music-player button:nth-child(2)');
        if (playButton) {
            playButton.innerHTML = this.audioContext.state === 'running' ? '⏸' : '▶';
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
        
        const muteButton = document.querySelector('#music-player button:nth-child(4)');
        if (muteButton) {
            muteButton.innerHTML = this.isMuted ? '🔇' : '🔊';
        }
        
        return this.isMuted;
    }

    setVolume(value) {
        this.volume = value;
        if (!this.isMuted) {
            this.masterGain.gain.value = value;
        }
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
                const silentBuffer = this.audioContext.createBuffer(1, 1, 22050);
                this.sounds[name] = silentBuffer;
            }
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

    playGameOver() {
        this.playSound('gameOver');
    }

    playSuccess() {
        this.playSound('success');
    }

    stopBackgroundMusic() {
        if (this.trackSource) {
            this.trackSource.stop();
            this.trackSource = null;
        }
    }

    dispose() {
        this.stopBackgroundMusic();
        if (this.audioContext) {
            this.audioContext.close();
        }
        const playerElement = document.getElementById('music-player');
        if (playerElement) {
            playerElement.remove();
        }
    }
}