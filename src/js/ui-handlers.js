// Update imports in ui-handlers.js
import { resetGameState, generateGameId, getAbilityName } from './game-state.js';
import { 
    showScreen, 
    addLogMessage, 
    renderGameBoard, 
    updateUI, 
    highlightPossibleMoves,
    movePlayer,
    switchTurn,
    startTimer,
    useAbility,
    updateAbilityButtons,
    highlightAbilityTargets,
    checkGameOver,
    hasLineOfSight,
    checkTurretDamage,
    applyDamageWithShieldOption,
    showGameOverModal,
    handlePlayerClick,
    handleCellClick
} from './game-logic.js';

// UI state variables
let buttons = {};
let inputs = {};
let selectedAbilities = [];
let gameState = null;

// First, add this debugging helper function
function debugLog(message) {
    console.log(`%c[WALL DEBUG] ${message}`, 'color: green; font-weight: bold;');
}

// Function to clean up wall selection UI elements
function cleanupWallUI() {
    // Remove wall indicators
    document.querySelectorAll('.wall-indicator').forEach(indicator => indicator.remove());
    
    // Remove tooltips
    document.querySelectorAll('.wall-tooltip').forEach(tooltip => tooltip.remove());
    
    // Remove cancel buttons
    document.querySelectorAll('.wall-cancel-btn').forEach(btn => btn.remove());
    
    // Remove wall selector container
    document.querySelectorAll('.wall-selector').forEach(selector => selector.remove());
}

// Wall selection function with visual interface
function showWallSelectionDialog(row, col, ability) {
    debugLog(`Creating wall selection dialog for cell (${row}, ${col})`);
    
    // Find valid sides
    const sides = ['top', 'right', 'bottom', 'left'];
    const validSides = sides.filter(side => {
        const hasWall = gameState.board[row][col].wall[side];
        debugLog(`Checking side ${side}: has wall = ${hasWall}`);
        return !hasWall;
    });
    
    debugLog(`Valid sides: ${validSides.join(', ')}`);
    
    if (validSides.length === 0) {
        debugLog('No valid sides available');
        alert('No valid wall placement available for this cell!');
        return;
    }
    
    // Get the cell element
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (!cell) return;
    
    // Create wall selector container
    const wallSelector = document.createElement('div');
    wallSelector.className = 'wall-selector';
    
    // Create wall options for each valid side
    validSides.forEach(side => {
        const wallOption = document.createElement('div');
        wallOption.className = `wall-option ${side}`;
        wallOption.dataset.side = side;
        
        // Add click handler
        wallOption.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            const selectedSide = this.dataset.side;
            debugLog(`Selected side: ${selectedSide}`);
            
            // Use the ability with the selected side
            useAbility(ability, { row, col, side: selectedSide });
            
            // Clean up UI
            cleanupWallUI();
        });
        
        wallSelector.appendChild(wallOption);
    });
    
    // Add elements to the cell
    cell.appendChild(wallSelector);
    
    // Add instruction tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'wall-tooltip';
    tooltip.textContent = 'Click on a side to place the wall';
    cell.appendChild(tooltip);

    // Add cancel button to the action panel
    const actionPanel = document.getElementById('actionPanel');
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'wall-cancel-btn';
    cancelBtn.textContent = 'Cancel Wall';
    cancelBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        cleanupWallUI();
    });
    actionPanel.appendChild(cancelBtn);
}

// Function to clean up wall selection UI elements
function cleanupWallSelectors() {
    // Remove wall indicators
    document.querySelectorAll('.wall-indicator').forEach(indicator => indicator.remove());
    
    // Remove tooltips
    document.querySelectorAll('.wall-tooltip').forEach(tooltip => tooltip.remove());
    
    // Remove cancel buttons - fix the selector to avoid errors
    const cancelBtns = document.querySelectorAll('button');
    cancelBtns.forEach(btn => {
        if (btn.textContent === 'Cancel Wall') {
            btn.remove();
        }
    });
}

export function initUIHandlers(initialGameState) {
    // Store reference to game state
    gameState = initialGameState;
    
    // Initialize UI
    setupUIElements();
    setupEventListeners();
    
    // Don't call showScreen immediately - let init.js handle it
    console.log("UI handlers initialized, buttons:", buttons);
}

function setupUIElements() {
    // UI Elements
    buttons = {
        showRules: document.getElementById('showRules'),
        closeRules: document.getElementById('closeRules'),
        createGame: document.getElementById('createGame'),
        joinGame: document.getElementById('joinGame'),
        cancelGame: document.getElementById('cancelGame'),
        joinGameBtn: document.getElementById('joinGameBtn'),
        cancelJoin: document.getElementById('cancelJoin'),
        confirmAbilities: document.getElementById('confirmAbilities'),
        move: document.getElementById('moveBtn'),
        useAbility: document.getElementById('useAbilityBtn'),
        pass: document.getElementById('passBtn'),
        playAgain: document.getElementById('playAgain'),
        returnToLobby: document.getElementById('returnToLobby')
    };
    
    inputs = {
        playerName: document.getElementById('playerName'),
        gameId: document.getElementById('gameId'),
        joinGameId: document.getElementById('joinGameId')
    };
    
    // Make buttons available globally
    //window.buttons = buttons;
}

function setupEventListeners() {
    const abilityCards = document.querySelectorAll('.ability-card');
    const abilityMessage = document.getElementById('abilityMessage');

    // Welcome Screen Handlers
    buttons.showRules.addEventListener('click', function() {
        document.getElementById('rulesModal').style.display = 'block';
    });
    
    buttons.closeRules.addEventListener('click', function() {
        document.getElementById('rulesModal').style.display = 'none';
    });
    
    buttons.createGame.addEventListener('click', function() {
        if (inputs.playerName.value.trim() === '') {
            showValidationModal('Please enter your name!');
            return;
        }
        
        gameState.players[1].name = inputs.playerName.value.trim();
        
        // Show ability selection screen for player 1
        showScreen('abilitySelection');
    });
    
    buttons.joinGame.addEventListener('click', function() {
        if (inputs.playerName.value.trim() === '') {
            showValidationModal('Please enter your name!');
            return;
        }
        
        showScreen('joinGame');
    });
    
    buttons.cancelGame.addEventListener('click', function() {
        showScreen('welcome');
    });
    
    buttons.cancelJoin.addEventListener('click', function() {
        showScreen('welcome');
    });
    
    buttons.joinGameBtn.addEventListener('click', function() {
        if (inputs.playerName.value.trim() === '' || inputs.joinGameId.value.trim() === '') {
            showValidationModal('Please enter your name and a valid game ID!');
            return;
        }
        
        gameState.players[2].name = inputs.playerName.value.trim();
        gameState.gameId = inputs.joinGameId.value.trim();
        
        // Show ability selection screen for player 2
        showScreen('abilitySelection');
    });

    // Add validation modal close handler
    document.getElementById('closeValidationModal').addEventListener('click', function() {
        document.getElementById('validationModal').style.display = 'none';
    });

    // Ability Selection Screen Handlers
    abilityCards.forEach(card => {
        card.addEventListener('click', function() {
            const ability = this.dataset.ability;
            
            if (this.classList.contains('selected')) {
                // Deselect
                this.classList.remove('selected');
                selectedAbilities = selectedAbilities.filter(a => a !== ability);
            } else {
                // Select (if less than 2 abilities are already selected)
                if (selectedAbilities.length < 2) {
                    this.classList.add('selected');
                    selectedAbilities.push(ability);
                } else {
                    abilityMessage.textContent = "You can only select 2 abilities!";
                    abilityMessage.className = "message error";
                    abilityMessage.style.display = "block";
                    setTimeout(() => {
                        abilityMessage.style.display = "none";
                    }, 3000);
                    return;
                }
            }
            
            // Update confirm button
            buttons.confirmAbilities.textContent = `Confirm Abilities (${selectedAbilities.length}/2 selected)`;
            buttons.confirmAbilities.disabled = selectedAbilities.length !== 2;
        });
    });
    
    buttons.confirmAbilities.addEventListener('click', function() {
        if (selectedAbilities.length !== 2) {
            abilityMessage.textContent = "Please select exactly 2 abilities!";
            abilityMessage.className = "message error";
            abilityMessage.style.display = "block";
            return;
        }
        
        // Assign abilities to player
        const playerNumber = gameState.players[2].name === inputs.playerName.value.trim() ? 2 : 1;
        gameState.players[playerNumber].abilities = [...selectedAbilities];
        
        // Reset selection for next time
        selectedAbilities = [];
        abilityCards.forEach(card => card.classList.remove('selected'));
        
        // If this is player 1, show player 2's name input
        if (playerNumber === 1) {
            // Clear the name input for player 2
            inputs.playerName.value = '';
            // Show welcome screen for player 2
            showScreen('welcome');
            // Update welcome screen message
            document.querySelector('#welcomeScreen h2').textContent = 'Player 2, Enter Your Name';
            // Hide create game button and only show join game
            document.getElementById('createGame').style.display = 'none';
            document.getElementById('joinGame').textContent = 'Continue';
            // Update join game button handler
            buttons.joinGame.onclick = function() {
                if (inputs.playerName.value.trim() === '') {
                    alert('Please enter your name!');
                    return;
                }
                gameState.players[2].name = inputs.playerName.value.trim();
                showScreen('abilitySelection');
            };
            return;
        }
        
        // If this is player 2, start the game immediately
        showScreen('game');
        renderGameBoard();
        updateUI();
        startTimer();
        
        // Add initial log messages
        addLogMessage(`${gameState.players[1].name} vs ${gameState.players[2].name}`);
        addLogMessage(`${gameState.players[1].name} chose: ${gameState.players[1].abilities.map(getAbilityName).join(', ')}`);
        addLogMessage(`${gameState.players[2].name} chose: ${gameState.players[2].abilities.map(getAbilityName).join(', ')}`);
        addLogMessage(`${gameState.players[gameState.currentTurn].name} goes first!`);
        
        // Enable action buttons
        buttons.move.disabled = false;
        buttons.useAbility.disabled = false;
        
        // Set up ability button handlers
        setupAbilityButtonHandlers();
    });

    // Game Board Screen Handlers
    buttons.move.addEventListener('click', function() {
        if (gameState.gameOver) return;
        
        // Clean up any wall selectors
        cleanupWallSelectors();
        
        // Reset any selected abilities
        const currentPlayer = gameState.currentTurn;
        const abilitiesContainer = document.getElementById(`player${currentPlayer}Abilities`);
        if (abilitiesContainer) {
            const abilityButtons = abilitiesContainer.querySelectorAll('.ability');
            abilityButtons.forEach(btn => btn.classList.remove('selected'));
        }
        
        if (gameState.currentAction === 'move') {
            // Cancel move
            gameState.currentAction = 'none';
            const cells = document.querySelectorAll('.cell');
            cells.forEach(cell => cell.classList.remove('highlight'));
            this.textContent = 'Move';
            // Reset the game state to allow for a new move
            gameState.selectedPiece = null;
        } else {
            // Start move
            gameState.currentAction = 'move';
            highlightPossibleMoves();
            this.textContent = 'Cancel Move';
            buttons.useAbility.textContent = 'Use Ability';
        }
    });
    
    buttons.useAbility.addEventListener('click', function() {
        if (gameState.gameOver) return;
        
        // Clean up any wall selectors
        cleanupWallSelectors();
        
        // If already using an ability, cancel it
        if (gameState.currentAction.startsWith('ability-')) {
            // Cancel ability
            gameState.currentAction = 'none';
            const cells = document.querySelectorAll('.cell');
            cells.forEach(cell => cell.classList.remove('highlight'));
            this.textContent = 'Use Ability';
            
            // Deselect any ability buttons
            const currentPlayer = gameState.currentTurn;
            const abilitiesContainer = document.getElementById(`player${currentPlayer}Abilities`);
            if (abilitiesContainer) {
                const abilityButtons = abilitiesContainer.querySelectorAll('.ability');
                abilityButtons.forEach(btn => btn.classList.remove('selected'));
            }
            
            return;
        }
        
        // If in move mode, cancel it and allow ability selection
        if (gameState.currentAction === 'move') {
            gameState.currentAction = 'none';
            const cells = document.querySelectorAll('.cell');
            cells.forEach(cell => cell.classList.remove('highlight'));
            buttons.move.textContent = 'Move';
            this.textContent = 'Use Ability';
            
            return;
        }
        
        // If not already using an ability or in move mode, just reset the UI to default state
        // The player should click on the ability buttons directly
        gameState.currentAction = 'none';
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => cell.classList.remove('highlight'));
        buttons.move.textContent = 'Move';
        this.textContent = 'Use Ability';
    });
    
    buttons.pass.addEventListener('click', function() {
        if (gameState.gameOver) return;
        
        // Clean up any wall selectors
        cleanupWallSelectors();
        
        const currentPlayer = gameState.currentTurn;
        if (!gameState.players[currentPlayer].lastUsedShield) {
            alert('You can only pass after using a shield to block an attack!');
            return;
        }
        
        addLogMessage(`${gameState.players[currentPlayer].name} passed their turn.`);
        gameState.players[currentPlayer].lastUsedShield = false;  // Reset the flag after passing
        switchTurn();
        
        // Update ability button handlers for new player
        setTimeout(setupAbilityButtonHandlers, 100);
    });

    // Game Board Cell Click Handler
    document.getElementById('gameBoard').addEventListener('click', function(e) {
        if (gameState.gameOver) return;
        
        const cell = e.target.closest('.cell');
        if (!cell || !cell.classList.contains('highlight')) return;
        
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        if (gameState.currentAction === 'move') {
            // Move player
            movePlayer(row, col);
            
            // Update ability button handlers for new player
            setTimeout(setupAbilityButtonHandlers, 100);
        } else if (gameState.currentAction.startsWith('ability-')) {
            // Use ability
            const ability = gameState.currentAction.split('-')[1];
            
            // Handle special case for wall placement (needs side selection)
            if (ability === 'walls') {
                debugLog(`Wall placement initiated at (${row}, ${col})`);
                
                // Clean up any existing wall selection UI
                cleanupWallUI();
                
                // Show the wall selection dialog
                showWallSelectionDialog(row, col, ability);
                
                // Don't proceed with the default ability usage
                return;
            } else {
                // All other abilities
                useAbility(ability, { row, col });
            }
            
            // Update ability button handlers for new player (if turn changed)
            setTimeout(setupAbilityButtonHandlers, 100);
        }
        
        // Reset action state
        gameState.currentAction = 'none';
        buttons.move.textContent = 'Move';
        buttons.useAbility.textContent = 'Use Ability';
        
        // Clear highlights
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => cell.classList.remove('highlight'));
        
        // Deselect any ability buttons
        const currentPlayer = gameState.currentTurn;
        const abilitiesContainer = document.getElementById(`player${currentPlayer}Abilities`);
        if (abilitiesContainer) {
            const abilityButtons = abilitiesContainer.querySelectorAll('.ability');
            abilityButtons.forEach(btn => btn.classList.remove('selected'));
        }
    });
    
    // Rules Modal Handlers
    buttons.showRules.addEventListener('click', function() {
        document.getElementById('rulesModal').style.display = 'block';
    });
    
    buttons.closeRules.addEventListener('click', function() {
        document.getElementById('rulesModal').style.display = 'none';
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === document.getElementById('rulesModal')) {
            document.getElementById('rulesModal').style.display = 'none';
        }
        if (e.target === document.getElementById('gameOverModal')) {
            document.getElementById('gameOverModal').style.display = 'none';
        }
    });

    // Game Over Modal Handlers
    buttons.playAgain.addEventListener('click', function() {
        // Reset game state
        resetGameState(gameState);
        
        // Clear game log
        document.querySelector('.game-log').innerHTML = '';
        
        // Go back to ability selection
        showScreen('abilitySelection');
        document.getElementById('gameOverModal').style.display = 'none';
    });
    
    buttons.returnToLobby.addEventListener('click', function() {
        // Reset game state and player information
        resetGameState(gameState);
        
        gameState.players[1].name = "";
        gameState.players[2].name = "";
        gameState.gameId = "";
        
        // Clear inputs
        inputs.playerName.value = "";
        inputs.gameId.value = "";
        inputs.joinGameId.value = "";
        
        // Clear game log
        document.querySelector('.game-log').innerHTML = '';
        
        // Go back to welcome screen
        showScreen('welcome');
        document.getElementById('gameOverModal').style.display = 'none';
    });
    
    // Shield Modal Handlers
    const shieldButtons = {
        useShield: document.getElementById('useShield'),
        declineShield: document.getElementById('declineShield')
    };

    // Handle shield activation choice
    shieldButtons.useShield.addEventListener('click', function() {
        if (!gameState.pendingDamage) return;
        
        const targetPlayer = gameState.pendingDamage.targetPlayer;
        
        // Use shield ability
        gameState.players[targetPlayer].abilitiesUsed.shield++;
        gameState.players[targetPlayer].lastUsedShield = true;  // Set the flag when shield is used
        addLogMessage(`${gameState.players[targetPlayer].name} activated their shield and blocked ${gameState.pendingDamage.amount} damage!`);
        
        // Close shield modal
        document.getElementById('shieldModal').style.display = 'none';
        
        // Update UI to show shield usage
        updateUI();
        
        // Check if we need to switch turns after the shield decision
        if (gameState.pendingTurnSwitch) {
            gameState.pendingTurnSwitch = false;
            switchTurn();
            
            // Update ability button handlers for new player
            setTimeout(setupAbilityButtonHandlers, 100);
        }
        
        // Clear pending damage
        gameState.pendingDamage = null;
    });

    shieldButtons.declineShield.addEventListener('click', function() {
        if (!gameState.pendingDamage) return;
        
        const targetPlayer = gameState.pendingDamage.targetPlayer;
        const damage = gameState.pendingDamage.amount;
        
        // Apply the damage that was pending
        gameState.players[targetPlayer].health -= damage;
        addLogMessage(`${gameState.players[targetPlayer].name} took ${damage} damage from ${gameState.pendingDamage.source}!`);
        
        // Close shield modal
        document.getElementById('shieldModal').style.display = 'none';
        
        // Update UI and check for game over
        updateUI();
        checkGameOver();
        
        // Check if we need to switch turns after the shield decision
        if (!gameState.gameOver && gameState.pendingTurnSwitch) {
            gameState.pendingTurnSwitch = false;
            switchTurn();
            
            // Update ability button handlers for new player
            setTimeout(setupAbilityButtonHandlers, 100);
        }
        
        // Clear pending damage
        gameState.pendingDamage = null;
    });

    // Add click event for closing the shield modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === document.getElementById('shieldModal')) {
            // If they click outside, treat it as declining (taking damage)
            if (gameState.pendingDamage) {
                shieldButtons.declineShield.click();
            }
        }
    });
}

// Set up ability button handlers
function setupAbilityButtonHandlers() {
    // This function is already defined in game-logic.js as updateAbilityButtons
    // We'll just call it here as a wrapper
    updateAbilityButtons();
}

// Export the setupAbilityButtonHandlers function
export { setupAbilityButtonHandlers as updateAbilityButtonHandlers };
export { buttons };

// Add function to show validation modal
function showValidationModal(message) {
    const validationModal = document.getElementById('validationModal');
    const validationMessage = document.getElementById('validationMessage');
    validationMessage.textContent = message;
    validationModal.style.display = 'block';
}