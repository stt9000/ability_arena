// Import initialization module
import { initGame } from './init.js';
import { setupDebugTools } from './debug.js';
// Removed import for initDebug

// Start the game
console.log("Starting game...");
initGame()
    .then(() => {
        console.log("Game initialized successfully!");
        setupDebugTools();
    })
    .catch(error => {
        console.error("Failed to initialize game:", error);
        // Any additional error handling at the top level
    });