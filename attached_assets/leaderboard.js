class Leaderboard {
    constructor() {
        this.scores = [];
        this.maxScores = 10;
        this.storageKey = 'fractal_drop_leaderboard';
        
        this.loadScores();
    }

    loadScores() {
        const storedScores = localStorage.getItem(this.storageKey);
        if (storedScores) {
            this.scores = JSON.parse(storedScores);
            this.sortScores();
        }
    }

    saveScores() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.scores));
    }

    addScore(scoreData) {
        // Add timestamp to score data
        scoreData.timestamp = Date.now();
        
        // Add new score
        this.scores.push(scoreData);
        
        // Sort scores
        this.sortScores();
        
        // Keep only top scores
        this.scores = this.scores.slice(0, this.maxScores);
        
        // Save to localStorage
        this.saveScores();
    }

    sortScores() {
        this.scores.sort((a, b) => {
            // First sort by score
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            // Then by levels completed
            if (b.levels !== a.levels) {
                return b.levels - a.levels;
            }
            // Finally by time (faster is better)
            return a.time - b.time;
        });
    }

    display() {
        const leaderboardElement = document.getElementById('leaderboard');
        if (!leaderboardElement) return;

        // Clear existing content
        leaderboardElement.innerHTML = '';

        // Create table
        const table = document.createElement('table');
        table.className = 'leaderboard-table';

        // Add header
        const header = document.createElement('tr');
        header.innerHTML = `
            <th>Rank</th>
            <th>Name</th>
            <th>Score</th>
            <th>Levels</th>
            <th>Time</th>
        `;
        table.appendChild(header);

        // Add scores
        this.scores.forEach((score, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${this.escapeHtml(score.name)}</td>
                <td>${score.score}</td>
                <td>${score.levels}</td>
                <td>${this.formatTime(score.time)}</td>
            `;
            table.appendChild(row);
        });

        leaderboardElement.appendChild(table);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    clear() {
        this.scores = [];
        this.saveScores();
        this.display();
    }

    getTopScore() {
        return this.scores[0] || null;
    }

    isHighScore(score) {
        if (this.scores.length < this.maxScores) return true;
        return score > this.scores[this.scores.length - 1].score;
    }
} 