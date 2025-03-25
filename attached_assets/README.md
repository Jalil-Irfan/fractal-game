# Fractal Drop

A minimalist, browser-based 3D puzzle game where you guide a crystal seed through an optical illusion tower. Built with Three.js and pure JavaScript.

## Features

- 🎮 No login required - just enter your name and play
- 🌐 Works on both desktop and mobile devices
- 🎨 Beautiful minimalist design with optical illusions
- 🎵 Ambient background music and sound effects
- 📊 Local leaderboard system
- ⚡ Lightweight (<5MB) with no external dependencies
- 🎯 Physics-based falling and bouncing mechanics

## How to Play

1. Enter your name and click "Start Game"
2. Use arrow keys or mouse drag to rotate the camera
3. Find the correct angle where the holes align
4. Guide the crystal seed through the holes
5. Try to reach the lowest level possible before time runs out

### Mobile Controls
- Touch and drag to rotate the camera
- Use the virtual joystick for precise control

## Technical Details

### Requirements
- Modern web browser with WebGL support
- JavaScript enabled
- No additional software required

### Dependencies
- Three.js (loaded via CDN)
- Nipple.js for mobile controls (loaded via CDN)

### Running the Game
1. Clone this repository
2. Open `index.html` in a web browser
3. No build process required!

## Game Mechanics

- Each level has multiple platforms with holes
- Holes are only visible from certain camera angles
- The crystal seed bounces off platforms
- Time limit of 5 minutes per game
- Score based on levels completed and time taken

## Development

The game is built using vanilla JavaScript and Three.js for 3D rendering. All assets are generated programmatically to keep the game lightweight.

### Project Structure
```
fractal-drop/
├── index.html          # Main HTML file
├── styles.css          # Game styles
├── js/
│   ├── main.js        # Entry point
│   ├── game.js        # Main game logic
│   ├── scene.js       # Three.js scene management
│   ├── player.js      # Player physics and controls
│   ├── level.js       # Level generation and management
│   ├── controls.js    # Input handling
│   ├── audio.js       # Sound effects and music
│   └── leaderboard.js # Score tracking
└── README.md          # This file
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License - see the LICENSE file for details. 