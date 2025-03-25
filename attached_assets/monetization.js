class Monetization {
    constructor(scene) {
        this.scene = scene;
        this.sponsorOrbs = [];
        this.adBanners = [];
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

    update(player) {
        // Update sponsor orbs
        this.sponsorOrbs.forEach(orb => {
            if (!orb.userData.collected) {
                const distance = orb.position.distanceTo(player.position);
                if (distance < 1) {
                    orb.userData.collected = true;
                    orb.material.opacity = 0;
                    // Add bonus points
                    player.addBonusPoints(50);
                }
            }
        });

        // Rotate ad banners
        this.adBanners.forEach(banner => {
            banner.rotation.y += 0.01;
        });
    }

    showAdPrompt() {
        const adPrompt = document.createElement('div');
        adPrompt.className = 'ad-prompt';
        adPrompt.innerHTML = `
            <div class="ad-content">
                <h3>Continue Playing?</h3>
                <p>Watch a short ad to continue your game</p>
                <button onclick="this.parentElement.parentElement.remove()">Watch Ad</button>
                <button onclick="this.parentElement.parentElement.remove()">Skip</button>
            </div>
        `;
        document.body.appendChild(adPrompt);
    }

    dispose() {
        this.sponsorOrbs.forEach(orb => this.scene.remove(orb));
        this.adBanners.forEach(banner => this.scene.remove(banner));
        this.sponsorOrbs = [];
        this.adBanners = [];
    }
} 