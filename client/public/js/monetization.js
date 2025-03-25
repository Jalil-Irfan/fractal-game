class Monetization {
    constructor(scene) {
        this.scene = scene;
        this.sponsorOrbs = [];
        this.adBanners = [];
        
        // Create geometries and materials
        this.sponsorOrbGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        this.sponsorOrbMaterial = new THREE.MeshPhongMaterial({
            color: 0xffd700,
            emissive: 0xffa500,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
        });
    }

    createSponsorOrb(position) {
        const orb = new THREE.Mesh(this.sponsorOrbGeometry, this.sponsorOrbMaterial);
        orb.position.copy(position);
        orb.userData.isSponsorOrb = true;
        orb.userData.collected = false;
        this.sponsorOrbs.push(orb);
        this.scene.add(orb);
    }

    createAdBanner(platform) {
        const bannerGeometry = new THREE.PlaneGeometry(2, 1);
        const bannerMaterial = new THREE.MeshPhongMaterial({
            color: 0x4a90e2,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        const banner = new THREE.Mesh(bannerGeometry, bannerMaterial);
        banner.position.copy(platform.position);
        banner.position.y += 0.1; // Slightly above platform
        banner.rotation.x = Math.PI / 2;
        
        this.adBanners.push(banner);
        this.scene.add(banner);
    }

    update(playerPosition) {
        if (!playerPosition) return;
        
        // Update sponsor orbs
        this.sponsorOrbs.forEach(orb => {
            if (!orb.userData.collected) {
                const distance = orb.position.distanceTo(playerPosition);
                if (distance < 1) {
                    orb.userData.collected = true;
                    orb.material.opacity = 0;
                    // Add bonus points
                    return true; // Signal that an orb was collected
                }
            }
        });

        // Rotate ad banners
        this.adBanners.forEach(banner => {
            banner.rotation.y += 0.01;
        });
        
        return false; // No orbs collected
    }

    showAdPrompt() {
        const existingPrompt = document.querySelector('.ad-prompt');
        if (existingPrompt) {
            return;
        }
        
        const adPrompt = document.createElement('div');
        adPrompt.className = 'ad-prompt';
        adPrompt.innerHTML = `
            <div class="ad-content">
                <h3>Continue Playing?</h3>
                <p>Watch a short ad to continue your game</p>
                <button id="watch-ad-btn">Watch Ad</button>
                <button id="skip-ad-btn">Skip</button>
            </div>
        `;
        document.body.appendChild(adPrompt);
        
        // Add event listeners for buttons
        return new Promise((resolve) => {
            document.getElementById('watch-ad-btn').addEventListener('click', () => {
                adPrompt.remove();
                resolve(true); // User agreed to watch ad
            });
            
            document.getElementById('skip-ad-btn').addEventListener('click', () => {
                adPrompt.remove();
                resolve(false); // User skipped ad
            });
        });
    }

    dispose() {
        // Remove all sponsor orbs and banners
        this.sponsorOrbs.forEach(orb => this.scene.remove(orb));
        this.adBanners.forEach(banner => this.scene.remove(banner));
        
        // Clear arrays
        this.sponsorOrbs = [];
        this.adBanners = [];
    }
}