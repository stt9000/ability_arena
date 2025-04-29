// Import modules
import { initGameState } from './game-state.js';
import { initGameLogic, showScreen } from './game-logic.js';
import { initUIHandlers } from './ui-handlers.js';

// Global game objects
let gameState = null;
let isInitialized = false;

// Main initialization function
export function initGame() {
    return new Promise((resolve, reject) => {
        try {
            console.log("Starting game initialization...");
            
            // Step 1: Initialize game state
            gameState = initGameState();
            console.log("Game state initialized");
            
            // Step 2: Wait for DOM to be fully loaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    try {
                        completeInitialization(resolve, reject);
                    } catch (error) {
                        handleInitError(error, reject);
                    }
                });
            } else {
                completeInitialization(resolve, reject);
            }
        } catch (error) {
            handleInitError(error, reject);
        }
    });
}

// Complete the initialization after DOM is loaded
function completeInitialization(resolve, reject) {
    try {
        // Step 3: Initialize game logic
        initGameLogic(gameState);
        console.log("Game logic initialized");
        
        // Step 4: Ensure DOM elements are available
        setTimeout(() => {
            try {
                // Step 5: Initialize UI handlers
                initUIHandlers(gameState);
                console.log("UI handlers initialized");
                
                // Step 6: Mark as initialized
                isInitialized = true;
                
                // Step 7: Export game objects to window for debugging
                window.gameDebug = {
                    gameState,
                    isInitialized,
                    showWelcomeScreen: () => {
                        showScreen('welcome');
                        return true;
                    }
                };
                
                // Step 8: Show welcome screen
                setTimeout(() => {
                    showScreen('welcome');
                    console.log("Welcome screen shown");
                    resolve();
                }, 100);
            } catch (error) {
                handleInitError(error, reject);
            }
        }, 100);
    } catch (error) {
        handleInitError(error, reject);
    }
}

// Handle initialization errors
function handleInitError(error, reject) {
    console.error("Error during game initialization:", error);
    
    // Display user-friendly error message in UI
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.innerHTML = `
        <h2>Game Initialization Error</h2>
        <p>Sorry, there was a problem starting the game. Please refresh the page to try again.</p>
        <p>Technical details: ${error.message}</p>
    `;
    
    // Find a good place to show the error
    const container = document.querySelector('.container') || document.body;
    container.innerHTML = '';
    container.appendChild(errorMessage);
    
    // Reject the promise
    reject(error);
}