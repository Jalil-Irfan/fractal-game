class Leaderboard {
    constructor() {
        this.scores = [];
        this.maxScores = 10;
        
        // Load scores from localStorage
        this.loadScores();
    }
    
    loadScores() {
        const storedScores = localStorage.getItem('fractalDropLeaderboard');
        if (storedScores) {
            try {
                this.scores = JSON.parse(storedScores);
                console.log('Loaded leaderboard scores:', this.scores.length);
            } catch (error) {
                console.error('Error parsing leaderboard scores:', error);
                this.scores = [];
            }
        } else {
            console.log('No leaderboard scores found in storage');
        }
    }
    
    saveScores() {
        try {
            localStorage.setItem('fractalDropLeaderboard', JSON.stringify(this.scores));
            console.log('Saved leaderboard scores');
        } catch (error) {
            console.error('Error saving leaderboard scores:', error);
        }
    }
    
    addScore(scoreData) {
        // Add new score
        this.scores.push(scoreData);
        
        // Sort and limit scores
        this.sortScores();
        
        // Save to localStorage
        this.saveScores();
        
        // Return the rank of the new score
        return this.scores.findIndex(score => score === scoreData) + 1;
    }
    
    sortScores() {
        // Sort by level (high to low) then by time (low to high)
        this.scores.sort((a, b) => {
            if (a.level !== b.level) {
                return b.level - a.level; // Higher level is better
            } else {
                return a.time - b.time; // Lower time is better
            }
        });
        
        // Limit to max scores
        if (this.scores.length > this.maxScores) {
            this.scores = this.scores.slice(0, this.maxScores);
        }
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
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Level</th>
                <th>Time</th>
                <th>Date</th>
            </tr>
        `;
        table.appendChild(thead);
        
        // Add scores
        const tbody = document.createElement('tbody');
        
        if (this.scores.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="5" style="text-align: center;">No scores yet. Be the first!</td>
            `;
            tbody.appendChild(emptyRow);
        } else {
            this.scores.forEach((score, index) => {
                const row = document.createElement('tr');
                
                // Format date
                const date = new Date(score.date);
                const dateString = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
                
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${this.escapeHtml(score.name)}</td>
                    <td>${score.level}</td>
                    <td>${this.formatTime(score.time)}</td>
                    <td>${dateString}</td>
                `;
                
                tbody.appendChild(row);
            });
        }
        
        table.appendChild(tbody);
        leaderboardElement.appendChild(table);
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
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
        localStorage.removeItem('fractalDropLeaderboard');
    }
    
    getTopScore() {
        if (this.scores.length === 0) return null;
        return this.scores[0];
    }
    
    isHighScore(score) {
        if (this.scores.length < this.maxScores) return true;
        
        // Check if score is better than the lowest score
        const lowestScore = this.scores[this.scores.length - 1];
        
        if (score.level > lowestScore.level) return true;
        if (score.level === lowestScore.level && score.time < lowestScore.time) return true;
        
        return false;
    }
}