// Initialize game when the page loads
window.addEventListener('load', () => {
    try {
        console.log("Page loaded, initializing game");
        
        // Create and store game instance globally for debugging
        window.game = new Game();
        
        console.log("Game instance created and stored globally as window.game");
    } catch (error) {
        console.error('Error initializing game:', error);
        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.style.color = 'red';
        errorDiv.style.padding = '20px';
        errorDiv.textContent = 'Error initializing game. Please refresh the page.';
        document.body.appendChild(errorDiv);
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.game && window.game.scene) {
        console.log("Window resized, updating scene");
        window.game.scene.onWindowResize();
    }
});

// Add CSS for the leaderboard table
const style = document.createElement('style');
style.textContent = `
    .leaderboard-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
        color: white;
    }
    
    .leaderboard-table th,
    .leaderboard-table td {
        padding: 0.5rem;
        text-align: left;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .leaderboard-table th {
        color: #4a90e2;
        font-weight: bold;
    }
    
    .leaderboard-table tr:hover {
        background: rgba(255, 255, 255, 0.05);
    }
    
    @media (max-width: 768px) {
        .leaderboard-table {
            font-size: 0.9rem;
        }
        
        .leaderboard-table th,
        .leaderboard-table td {
            padding: 0.3rem;
        }
    }
`;
document.head.appendChild(style);

console.log("Main.js loaded");