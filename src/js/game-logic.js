let screensInitialized = false;

// Import dependencies
import { getAbilityName, hasLimitedUses, getAbilityUseLimit, formatTime } from './game-state.js';
import { updateAbilityButtonHandlers, buttons } from './ui-handlers.js';
// UI elements and game state
let screens = {};
let modals = {};
let gameBoard = null;
let gameState = null;


export function initGameLogic(initialGameState) {
    // Store reference to game state
    gameState = initialGameState;
    
    // Initialize screens immediately if document is ready
    if (document.readyState !== 'loading') {
        initializeScreens();
    } else {
        document.addEventListener('DOMContentLoaded', initializeScreens);
    }
    
    // Keep global exports for now during transition
    //window.showScreen = showScreen;
    //window.addLogMessage = addLogMessage;
    //window.renderGameBoard = renderGameBoard;
    //window.updateUI = updateUI;
    //window.updateAbilityButtons = updateAbilityButtons;
    //window.highlightPossibleMoves = highlightPossibleMoves;
    //window.hasLineOfSight = hasLineOfSight;
    //window.highlightAbilityTargets = highlightAbilityTargets;
    //window.movePlayer = movePlayer;
    //window.checkTurretDamage = checkTurretDamage;
    //window.applyDamageWithShieldOption = applyDamageWithShieldOption;
    //window.useAbility = useAbility;
    //window.switchTurn = switchTurn;
    //window.startTimer = startTimer;
    //window.checkGameOver = checkGameOver;
    //window.showGameOverModal = showGameOverModal;
    //window.handlePlayerClick = handlePlayerClick;
    //window.handleCellClick = handleCellClick;
  
}

function initializeScreens() {
    screens = {
        welcome: document.getElementById('welcomeScreen'),
        createGame: document.getElementById('createGameScreen'),
        joinGame: document.getElementById('joinGameScreen'),
        abilitySelection: document.getElementById('abilitySelectionScreen'),
        game: document.getElementById('gameScreen')
    };
    
    modals = {
        rules: document.getElementById('rulesModal'),
        gameOver: document.getElementById('gameOverModal'),
        shield: document.getElementById('shieldModal')
    };
    
    gameBoard = document.getElementById('gameBoard');
    
    screensInitialized = true;
    console.log("Screens initialized:", screens);
}

// Show the specified screen, hiding all others
function showScreen(screenId) {
    // Check if screens are initialized
    if (!screensInitialized || !screens || !screens[screenId]) {
        console.error(`Cannot show screen '${screenId}': screens not initialized or screen doesn't exist`);
        
        // If screens aren't initialized yet, schedule the function call for later
        if (!screensInitialized) {
            console.log(`Scheduling screen '${screenId}' to be shown after initialization`);
            setTimeout(() => {
                if (screensInitialized) {
                    showScreen(screenId);
                } else {
                    // Try again if still not initialized
                    setTimeout(() => showScreen(screenId), 200);
                }
            }, 200);
        }
        return;
    }
    
    // Hide all screens
    Object.values(screens).forEach(screen => {
        if (screen) {
            screen.classList.remove('active');
        }
    });
    
    // Show the requested screen
    screens[screenId].classList.add('active');
    console.log(`Screen '${screenId}' is now active`);
}

// Add a message to the game log
function addLogMessage(message) {
    const gameLog = document.querySelector('.game-log');
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.textContent = message;
    gameLog.appendChild(logEntry);
    gameLog.scrollTop = gameLog.scrollHeight;
}

// Render the game board based on current state
// Render the game board based on current state
function renderGameBoard() {
    console.log('Rendering game board');
    
    // Count walls before rendering
    const wallCount = gameState.board.flat().reduce((count, cell) => {
        return count + Object.values(cell.wall).filter(Boolean).length;
    }, 0);
    console.log(`Current board has ${wallCount} walls`);
    
    gameBoard.innerHTML = '';
    
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            // Make sure cell has relative positioning for absolute positioning of contents
            cell.style.position = 'relative';
            
            // Check if player is on this cell
            if (gameState.players[1].position.row === i && gameState.players[1].position.col === j) {
                const player = document.createElement('div');
                player.className = 'player player-1';
                if (gameState.currentTurn === 1) {
                    player.classList.add('movable');
                }
                cell.appendChild(player);
            }
            
            if (gameState.players[2].position.row === i && gameState.players[2].position.col === j) {
                const player = document.createElement('div');
                player.className = 'player player-2';
                if (gameState.currentTurn === 2) {
                    player.classList.add('movable');
                }
                cell.appendChild(player);
            }
            
            // Check for blocks
            if (gameState.board[i][j].block) {
                const block = document.createElement('div');
                block.className = 'block';
                cell.appendChild(block);
            }
            
            // Check for turrets
            if (gameState.board[i][j].turret) {
                const turret = document.createElement('div');
                turret.className = 'turret';
                cell.appendChild(turret);
            }
            
            // Check for walls and render them with enhanced visibility
            const cellWalls = gameState.board[i][j].wall;

            // Log the wall state for debugging
            if (cellWalls.top || cellWalls.right || cellWalls.bottom || cellWalls.left) {
                console.log(`Cell (${i},${j}) has walls:`, JSON.stringify(cellWalls));
            }

            // Render top wall
            if (cellWalls.top === true) {
                console.log(`Rendering top wall for cell (${i},${j})`);
                const wall = document.createElement('div');
                wall.className = 'wall-horizontal';
                wall.style.cssText = `
                    position: absolute;
                    height: 10px;
                    width: 100%;
                    top: -5px;
                    left: 0;
                    background-color: #8e44ad;
                    box-shadow: 0 0 5px #8e44ad;
                    z-index: 5;
                `;
                cell.appendChild(wall);
            }

            // Render right wall
            if (cellWalls.right === true) {
                console.log(`Rendering right wall for cell (${i},${j})`);
                const wall = document.createElement('div');
                wall.className = 'wall-vertical';
                wall.style.cssText = `
                    position: absolute;
                    width: 10px;
                    height: 100%;
                    right: -5px;
                    top: 0;
                    background-color: #8e44ad;
                    box-shadow: 0 0 5px #8e44ad;
                    z-index: 5;
                `;
                cell.appendChild(wall);
            }

            // Render bottom wall
            if (cellWalls.bottom === true) {
                console.log(`Rendering bottom wall for cell (${i},${j})`);
                const wall = document.createElement('div');
                wall.className = 'wall-horizontal';
                wall.style.cssText = `
                    position: absolute;
                    height: 10px;
                    width: 100%;
                    bottom: -5px;
                    left: 0;
                    background-color: #8e44ad;
                    box-shadow: 0 0 5px #8e44ad;
                    z-index: 5;
                `;
                cell.appendChild(wall);
            }

            // Render left wall
            if (cellWalls.left === true) {
                console.log(`Rendering left wall for cell (${i},${j})`);
                const wall = document.createElement('div');
                wall.className = 'wall-vertical';
                wall.style.cssText = `
                    position: absolute;
                    width: 10px;
                    height: 100%;
                    left: -5px;
                    top: 0;
                    background-color: #8e44ad;
                    box-shadow: 0 0 5px #8e44ad;
                    z-index: 5;
                `;
                cell.appendChild(wall);
            }
            
            gameBoard.appendChild(cell);
        }
    }
    
    // Count walls after rendering
    const wallElements = document.querySelectorAll('.wall-horizontal, .wall-vertical');
    console.log(`Rendered ${wallElements.length} wall elements`);
    
    updateUI();
    
    // Add click handlers for movable pieces and cells
    const movablePieces = document.querySelectorAll('.player.movable');
    movablePieces.forEach(piece => {
        piece.addEventListener('click', function(e) {
            e.stopPropagation();
            const cell = this.parentElement;
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            handlePlayerClick(row, col);
        });
    });

    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.addEventListener('click', function() {
            const row = parseInt(this.dataset.row);
            const col = parseInt(this.dataset.col);
            handleCellClick(row, col);
        });
    });
}

// Update UI elements to match game state
function updateUI() {
    // Update health bars
    document.getElementById('player1Health').style.width = `${gameState.players[1].health}%`;
    document.getElementById('player2Health').style.width = `${gameState.players[2].health}%`;
    
    // Update player names
    document.getElementById('player1Name').textContent = gameState.players[1].name;
    document.getElementById('player2Name').textContent = gameState.players[2].name;
    
    // Update timers
    document.getElementById('player1Timer').textContent = `Time: ${formatTime(gameState.players[1].timeRemaining)}`;
    document.getElementById('player2Timer').textContent = `Time: ${formatTime(gameState.players[2].timeRemaining)}`;
    
    // Update current turn
    document.getElementById('currentTurn').textContent = gameState.players[gameState.currentTurn].name;
    
    // Update ability buttons
    updateAbilityButtons();
    //if (window.updateAbilityButtonHandlers) {
    //    window.updateAbilityButtonHandlers();
    //}
    updateAbilityButtonHandlers();
    
    // Enable/disable pass button
    document.getElementById('passBtn').disabled = !(gameState.players[gameState.currentTurn].lastPlacedBlock);
}

// Update ability buttons in the UI
function updateAbilityButtons() {
    const player1Abilities = document.getElementById('player1Abilities');
    const player2Abilities = document.getElementById('player2Abilities');
    
    player1Abilities.innerHTML = '';
    player2Abilities.innerHTML = '';
    
    gameState.players[1].abilities.forEach(ability => {
        const abilityBtn = document.createElement('div');
        abilityBtn.className = 'ability';
        abilityBtn.textContent = getAbilityName(ability);
    
        if (hasLimitedUses(ability)) {
            const usesLimit = getAbilityUseLimit(ability);
            const usesRemaining = usesLimit - gameState.players[1].abilitiesUsed[ability];
            abilityBtn.textContent += ` (${usesRemaining}/${usesLimit})`;
            if (usesRemaining === 0) {
                abilityBtn.classList.add('disabled');
            }
        }
    
        abilityBtn.addEventListener('click', function() {
            if (gameState.gameOver) return;
            if (abilityBtn.classList.contains('disabled')) return;
    
            // If already selected, deselect and reset
            if (abilityBtn.classList.contains('selected')) {
                gameState.currentAction = 'none';
                if (window.buttons) window.buttons.useAbility.textContent = 'Use Ability';
                const cells = document.querySelectorAll('.cell');
                cells.forEach(cell => cell.classList.remove('highlight'));
                const allBtns = abilityBtn.parentNode.querySelectorAll('.ability');
                allBtns.forEach(btn => btn.classList.remove('selected'));
                return;
            }
    
            // Always reset previous state
            gameState.currentAction = 'none';
            const cells = document.querySelectorAll('.cell');
            cells.forEach(cell => cell.classList.remove('highlight'));
            if (window.buttons) {
                window.buttons.move.textContent = 'Move';
                window.buttons.useAbility.textContent = 'Use Ability';
            }
    
            // Deselect all other ability buttons
            const allBtns = abilityBtn.parentNode.querySelectorAll('.ability');
            allBtns.forEach(btn => btn.classList.remove('selected'));
    
            // Select this ability
            abilityBtn.classList.add('selected');
            gameState.currentAction = `ability-${ability}`;
            if (window.buttons) window.buttons.useAbility.textContent = 'Cancel Ability';
    
            // Highlight valid targets
            highlightAbilityTargets(ability);
        });
    
        player1Abilities.appendChild(abilityBtn);
    });
    
    // Same for player 2
    gameState.players[2].abilities.forEach(ability => {
        const abilityBtn = document.createElement('div');
        abilityBtn.className = 'ability';
        abilityBtn.textContent = getAbilityName(ability);
    
        if (hasLimitedUses(ability)) {
            const usesLimit = getAbilityUseLimit(ability);
            const usesRemaining = usesLimit - gameState.players[2].abilitiesUsed[ability];
            abilityBtn.textContent += ` (${usesRemaining}/${usesLimit})`;
            if (usesRemaining === 0) {
                abilityBtn.classList.add('disabled');
            }
        }
    
        abilityBtn.addEventListener('click', function() {
            if (gameState.gameOver) return;
            if (abilityBtn.classList.contains('disabled')) return;
    
            // If already selected, deselect and reset
            if (abilityBtn.classList.contains('selected')) {
                gameState.currentAction = 'none';
                if (window.buttons) window.buttons.useAbility.textContent = 'Use Ability';
                const cells = document.querySelectorAll('.cell');
                cells.forEach(cell => cell.classList.remove('highlight'));
                const allBtns = abilityBtn.parentNode.querySelectorAll('.ability');
                allBtns.forEach(btn => btn.classList.remove('selected'));
                return;
            }
    
            // Always reset previous state
            gameState.currentAction = 'none';
            const cells = document.querySelectorAll('.cell');
            cells.forEach(cell => cell.classList.remove('highlight'));
            if (window.buttons) {
                window.buttons.move.textContent = 'Move';
                window.buttons.useAbility.textContent = 'Use Ability';
            }
    
            // Deselect all other ability buttons
            const allBtns = abilityBtn.parentNode.querySelectorAll('.ability');
            allBtns.forEach(btn => btn.classList.remove('selected'));
    
            // Select this ability
            abilityBtn.classList.add('selected');
            gameState.currentAction = `ability-${ability}`;
            if (window.buttons) window.buttons.useAbility.textContent = 'Cancel Ability';
    
            // Highlight valid targets
            highlightAbilityTargets(ability);
        });
    
        player2Abilities.appendChild(abilityBtn);
    });
}

// Highlight possible moves for the current player
function highlightPossibleMoves() {
    // Clear previous highlights
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => cell.classList.remove('highlight'));
    
    const currentPlayer = gameState.currentTurn;
    const position = gameState.players[currentPlayer].position;
    
    // Check if player has diagonal moving ability
    const hasDiagonal = gameState.players[currentPlayer].abilities.includes('diagonal');
    
    // Define possible move directions
    const directions = [
        { row: -1, col: 0 }, // up
        { row: 1, col: 0 },  // down
        { row: 0, col: -1 }, // left
        { row: 0, col: 1 }   // right
    ];
    
    // Add diagonal directions if player has diagonal moving ability
    if (hasDiagonal) {
        directions.push(
            { row: -1, col: -1 }, // up-left
            { row: -1, col: 1 },  // up-right
            { row: 1, col: -1 },  // down-left
            { row: 1, col: 1 }    // down-right
        );
    }
    
    // Check each direction
    directions.forEach(dir => {
        const newRow = position.row + dir.row;
        const newCol = position.col + dir.col;
        
        // Check if within bounds
        if (newRow >= 0 && newRow < 7 && newCol >= 0 && newCol < 7) {
            // Check for blocks
            if (gameState.board[newRow][newCol].block) return;
            
            // Check for players
            if ((gameState.players[1].position.row === newRow && gameState.players[1].position.col === newCol) ||
                (gameState.players[2].position.row === newRow && gameState.players[2].position.col === newCol)) {
                return;
            }
            
            // Check for walls
            if (dir.row === -1 && dir.col === 0 && gameState.board[position.row][position.col].wall.top) return; // up
            if (dir.row === 1 && dir.col === 0 && gameState.board[position.row][position.col].wall.bottom) return; // down
            if (dir.row === 0 && dir.col === -1 && gameState.board[position.row][position.col].wall.left) return; // left
            if (dir.row === 0 && dir.col === 1 && gameState.board[position.row][position.col].wall.right) return; // right
            
            // If diagonal, check both orthogonal walls that would block the diagonal
            if (dir.row === -1 && dir.col === -1) { // up-left
                if (gameState.board[position.row][position.col].wall.top || 
                    gameState.board[position.row][position.col].wall.left) return;
            }
            if (dir.row === -1 && dir.col === 1) { // up-right
                if (gameState.board[position.row][position.col].wall.top || 
                    gameState.board[position.row][position.col].wall.right) return;
            }
            if (dir.row === 1 && dir.col === -1) { // down-left
                if (gameState.board[position.row][position.col].wall.bottom || 
                    gameState.board[position.row][position.col].wall.left) return;
            }
            if (dir.row === 1 && dir.col === 1) { // down-right
                if (gameState.board[position.row][position.col].wall.bottom || 
                    gameState.board[position.row][position.col].wall.right) return;
            }
            
            // Highlight valid move
            const cell = document.querySelector(`.cell[data-row="${newRow}"][data-col="${newCol}"]`);
            if (cell) {
                cell.classList.add('highlight');
            }
        }
    });
}

// Helper function to check if there's a clear line of sight between two positions
function hasLineOfSight(pos1, pos2) {
    // If same position, return true
    if (pos1.row === pos2.row && pos1.col === pos2.col) return true;
    
    // Check for blocks in the way
    // For straight lines (horizontal, vertical)
    if (pos1.row === pos2.row) {
        // Horizontal line
        const startCol = Math.min(pos1.col, pos2.col);
        const endCol = Math.max(pos1.col, pos2.col);
        
        for (let col = startCol + 1; col < endCol; col++) {
            if (gameState.board[pos1.row][col].block) {
                return false; // Block in the way
            }
        }
        
        // Check for walls
        for (let col = startCol; col < endCol; col++) {
            if (gameState.board[pos1.row][col].wall.right) {
                return false; // Wall in the way
            }
        }
    } else if (pos1.col === pos2.col) {
        // Vertical line
        const startRow = Math.min(pos1.row, pos2.row);
        const endRow = Math.max(pos1.row, pos2.row);
        
        for (let row = startRow + 1; row < endRow; row++) {
            if (gameState.board[row][pos1.col].block) {
                return false; // Block in the way
            }
        }
        
        // Check for walls
        for (let row = startRow; row < endRow; row++) {
            if (gameState.board[row][pos1.col].wall.bottom) {
                return false; // Wall in the way
            }
        }
    } else {
        // Diagonal line - check if blocks are in the way
        // For simplicity in this demo, we'll just check if it's a direct diagonal
        const rowDiff = Math.abs(pos2.row - pos1.row);
        const colDiff = Math.abs(pos2.col - pos1.col);
        
        // If it's not a direct diagonal, then need more complex check
        if (rowDiff !== colDiff) {
            return false;
        }
        
        // Check for blocks and walls along the diagonal
        const rowStep = pos2.row > pos1.row ? 1 : -1;
        const colStep = pos2.col > pos1.col ? 1 : -1;
        
        for (let i = 1; i < rowDiff; i++) {
            const checkRow = pos1.row + i * rowStep;
            const checkCol = pos1.col + i * colStep;
            
            if (gameState.board[checkRow][checkCol].block) {
                return false; // Block in the way
            }
        }
        
        // For diagonal movement, check if walls block the path
        // This is a simplification - for a real game, you'd need more thorough checks
        for (let i = 0; i < rowDiff; i++) {
            const checkRow = pos1.row + i * rowStep;
            const checkCol = pos1.col + i * colStep;
            
            if (rowStep > 0 && colStep > 0) {
                // Moving down-right
                if (gameState.board[checkRow][checkCol].wall.right || 
                    gameState.board[checkRow][checkCol].wall.bottom) {
                    return false;
                }
            } else if (rowStep > 0 && colStep < 0) {
                // Moving down-left
                if (gameState.board[checkRow][checkCol].wall.left || 
                    gameState.board[checkRow][checkCol].wall.bottom) {
                    return false;
                }
            } else if (rowStep < 0 && colStep > 0) {
                // Moving up-right
                if (gameState.board[checkRow][checkCol].wall.right || 
                    gameState.board[checkRow][checkCol].wall.top) {
                    return false;
                }
            } else if (rowStep < 0 && colStep < 0) {
                // Moving up-left
                if (gameState.board[checkRow][checkCol].wall.left || 
                    gameState.board[checkRow][checkCol].wall.top) {
                    return false;
                }
            }
        }
    }
    
    // If we get here, there's a clear line of sight
    return true;
}

// Highlight valid targets for the selected ability
// Find the highlightAbilityTargets function in game-logic.js 
// and replace it with this fixed version:

// Highlight valid targets for the selected ability
function highlightAbilityTargets(ability) {
    // Clear previous highlights
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => cell.classList.remove('highlight'));
    
    const currentPlayer = gameState.currentTurn;
    const position = gameState.players[currentPlayer].position;
    const opponentNum = currentPlayer === 1 ? 2 : 1;
    const opponentPos = gameState.players[opponentNum].position;
    
    switch (ability) {
        case 'bow':
            // Highlight cells within 2 spaces (including diagonals)
            // First check if opponent is within range
            const rowDiff = Math.abs(opponentPos.row - position.row);
            const colDiff = Math.abs(opponentPos.col - position.col);
            const distance = Math.max(rowDiff, colDiff); // Chess distance for diagonals
            
            if (distance <= 2) {
                // Check line of sight (no blocks or walls in the way)
                if (hasLineOfSight(position, opponentPos)) {
                    const cell = document.querySelector(`.cell[data-row="${opponentPos.row}"][data-col="${opponentPos.col}"]`);
                    if (cell) {
                        cell.classList.add('highlight');
                    }
                }
            }
            break;
            
        case 'sword':
            // Highlight adjacent cells (non-diagonal)
            const directions = [
                { row: -1, col: 0 }, // up
                { row: 1, col: 0 },  // down
                { row: 0, col: -1 }, // left
                { row: 0, col: 1 }   // right
            ];
            
            directions.forEach(dir => {
                const newRow = position.row + dir.row;
                const newCol = position.col + dir.col;
                
                // Check if within bounds
                if (newRow >= 0 && newRow < 7 && newCol >= 0 && newCol < 7) {
                    // Check for opponent
                    if (opponentPos.row === newRow && opponentPos.col === newCol) {
                        // Check for walls
                        if (dir.row === -1 && gameState.board[position.row][position.col].wall.top) return;
                        if (dir.row === 1 && gameState.board[position.row][position.col].wall.bottom) return;
                        if (dir.col === -1 && gameState.board[position.row][position.col].wall.left) return;
                        if (dir.col === 1 && gameState.board[position.row][position.col].wall.right) return;
                        
                        const cell = document.querySelector(`.cell[data-row="${newRow}"][data-col="${newCol}"]`);
                        if (cell) {
                            cell.classList.add('highlight');
                        }
                    }
                }
            });
            break;
            
        case 'push':
            // Highlight adjacent cells (non-diagonal)
            const pushDirections = [
                { row: -1, col: 0 }, // up
                { row: 1, col: 0 },  // down
                { row: 0, col: -1 }, // left
                { row: 0, col: 1 }   // right
            ];
            
            pushDirections.forEach(dir => {
                const newRow = position.row + dir.row;
                const newCol = position.col + dir.col;
                
                // Check if within bounds
                if (newRow >= 0 && newRow < 7 && newCol >= 0 && newCol < 7) {
                    // Check for opponent
                    if (opponentPos.row === newRow && opponentPos.col === newCol) {
                        // Check for walls
                        if (dir.row === -1 && gameState.board[position.row][position.col].wall.top) return;
                        if (dir.row === 1 && gameState.board[position.row][position.col].wall.bottom) return;
                        if (dir.col === -1 && gameState.board[position.row][position.col].wall.left) return;
                        if (dir.col === 1 && gameState.board[position.row][position.col].wall.right) return;
                        
                        const cell = document.querySelector(`.cell[data-row="${newRow}"][data-col="${newCol}"]`);
                        if (cell) {
                            cell.classList.add('highlight');
                        }
                    }
                }
            });
            break;
            
        case 'turret':
            // Highlight empty cells for turret placement
            for (let row = 0; row < 7; row++) {
                for (let col = 0; col < 7; col++) {
                    // Check if cell is empty
                    if (!gameState.board[row][col].block && 
                        !gameState.board[row][col].turret && 
                        !(gameState.players[1].position.row === row && gameState.players[1].position.col === col) && 
                        !(gameState.players[2].position.row === row && gameState.players[2].position.col === col)) {
                        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
                        if (cell) {
                            cell.classList.add('highlight');
                        }
                    }
                }
            }
            break;
            
        case 'walls':
            // Highlight cells for wall placement
            // For simplicity, we'll highlight all cells that could have at least one wall placed
            for (let row = 0; row < 7; row++) {
                for (let col = 0; col < 7; col++) {
                    // Check if at least one side is available for a wall
                    const cell = gameState.board[row][col];
                    if (!cell.wall.top || !cell.wall.right || !cell.wall.bottom || !cell.wall.left) {
                        const cellElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
                        if (cellElement) {
                            cellElement.classList.add('highlight');
                        }
                    }
                }
            }
            break;
            
        case 'blocks':
            // Highlight empty cells for block placement
            for (let row = 0; row < 7; row++) {
                for (let col = 0; col < 7; col++) {
                    // Check if cell is empty
                    if (!gameState.board[row][col].block && 
                        !gameState.board[row][col].turret && 
                        !(gameState.players[1].position.row === row && gameState.players[1].position.col === col) && 
                        !(gameState.players[2].position.row === row && gameState.players[2].position.col === col)) {
                        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
                        if (cell) {
                            cell.classList.add('highlight');
                        }
                    }
                }
            }
            break;
    }
}

// Fixed movePlayer function - properly switches turns and ensures timer starts
function movePlayer(row, col) {
    const currentPlayer = gameState.currentTurn;
    const oldPosition = { ...gameState.players[currentPlayer].position };
    
    // Update player position
    gameState.players[currentPlayer].position.row = row;
    gameState.players[currentPlayer].position.col = col;
    
    // Immediately update the UI to show movement
    renderGameBoard();
    //  if (window.updateAbilityButtonHandlers) {
    //    window.updateAbilityButtonHandlers();
    //}
    updateAbilityButtonHandlers();
    
    // Log the move
    addLogMessage(`${gameState.players[currentPlayer].name} moved from (${oldPosition.row},${oldPosition.col}) to (${row},${col}).`);
    
    // Reset lastPlacedBlock flag
    gameState.players[currentPlayer].lastPlacedBlock = false;
    
    // Check for turret damage
    checkTurretDamage();
    
    // Check for game over
    if (checkGameOver()) return;
    
    // Switch turn properly (call the actual function)
    switchTurn();
}

// Updated checkTurretDamage function to only damage opponents and include diagonals
function checkTurretDamage() {
    const currentPlayer = gameState.currentTurn;
    const opponentNum = currentPlayer === 1 ? 2 : 1; // This is the opponent of current player
    const position = gameState.players[currentPlayer].position;
    
    // Check adjacent cells for turrets (including diagonals)
    const directions = [
        { row: -1, col: 0 },  // up
        { row: 1, col: 0 },   // down
        { row: 0, col: -1 },  // left
        { row: 0, col: 1 },   // right
        { row: -1, col: -1 }, // up-left
        { row: -1, col: 1 },  // up-right
        { row: 1, col: -1 },  // down-left
        { row: 1, col: 1 },   // down-right
        { row: 0, col: 0 }    // current cell
    ];
    
    let turretFound = false;
    
    directions.forEach(dir => {
        const checkRow = position.row + dir.row;
        const checkCol = position.col + dir.col;
        
        // Check if within bounds
        if (checkRow >= 0 && checkRow < 7 && checkCol >= 0 && checkCol < 7) {
            // Check for turret
            if (gameState.board[checkRow][checkCol].turret) {
                // Only take damage if the turret belongs to the opponent
                // We can determine this by checking when the turret was placed
                // If the board square has a turret and it's not the current player's turret,
                // then it must be the opponent's
                
// Get the turret owner (default to opponent for existing turrets)
const turretOwner = gameState.board[checkRow][checkCol].turretOwner || opponentNum;
                
// Only take damage if the turret belongs to the opponent
if (turretOwner !== currentPlayer) {
    turretFound = true;
    const turretDamage = gameState.players[turretOwner].abilities.includes('turret') ? 50 : 50; // Default damage value
    
    // Check for shield option
    const shieldUsed = applyDamageWithShieldOption(
        currentPlayer, 
        turretDamage, 
        `${gameState.players[turretOwner].name}'s turret`
    );
    
    // If shield is being processed, we'll handle game over checking later
    if (!shieldUsed) {
        // Check for game over
        checkGameOver();
    }
}
}
}
});

return turretFound;
}

// Add this damage handling function with shield option
function applyDamageWithShieldOption(targetPlayer, amount, damageSource) {
// Check if the target player has the shield ability
if (gameState.players[targetPlayer].abilities.includes('shield')) {
// Check if they have shield uses remaining
const shieldUsesRemaining = getAbilityUseLimit('shield') - gameState.players[targetPlayer].abilitiesUsed.shield;

if (shieldUsesRemaining > 0) {
// Update the shield modal content
document.getElementById('shieldMessage').textContent = 
`${gameState.players[targetPlayer].name}, you are about to take ${amount} damage from ${damageSource}! Use your shield?`;
document.getElementById('shieldCountDisplay').textContent = shieldUsesRemaining;

// Store the damage info for later use
gameState.pendingDamage = {
targetPlayer: targetPlayer,
amount: amount,
source: damageSource
};

// Show the shield modal
modals.shield.style.display = 'block';

// The actual damage application will happen in the shield button event handlers
return true; // Indicates shield option was presented
}
}

// If no shield is available or player doesn't have shield ability, apply damage immediately
gameState.players[targetPlayer].health -= amount;
addLogMessage(`${gameState.players[targetPlayer].name} took ${amount} damage from ${damageSource}!`);
updateUI();
checkGameOver();
return false; // Indicates damage was applied immediately
}

// Use an ability with optional parameters
// Use an ability with optional parameters
function useAbility(ability, params) {
    const currentPlayer = gameState.currentTurn;
    const opponentNum = currentPlayer === 1 ? 2 : 1;

    switch (ability) {
        case 'bow':
            // Deal 35 damage to opponent if visible and in range
            const bowDamage = 35; // Using value directly since we don't have ability data in this scope

            // Check if opponent is in range and visible
            const playerPos = gameState.players[currentPlayer].position;
            const opponentPos = gameState.players[opponentNum].position;

            // Calculate distance
            const rowDiff = Math.abs(opponentPos.row - playerPos.row);
            const colDiff = Math.abs(opponentPos.col - playerPos.col);
            const distance = Math.max(rowDiff, colDiff); // Chess distance

            if (distance <= 2 && hasLineOfSight(playerPos, opponentPos)) {
                addLogMessage(`${gameState.players[currentPlayer].name} shot an arrow at ${gameState.players[opponentNum].name} for ${bowDamage} damage!`);
                // Check for shield option
                const shieldUsed = applyDamageWithShieldOption(opponentNum, bowDamage, `${gameState.players[currentPlayer].name}'s bow`);

                // If shield option was presented, we need to pause the turn switching until shield decision is made
                if (shieldUsed) {
                    gameState.pendingTurnSwitch = true; // We'll use this to delay the turn switch
                    return; // Exit the function early to prevent turn switch
                }
            } else {
                addLogMessage(`${gameState.players[currentPlayer].name} tried to shoot an arrow but missed or couldn't see the target!`);
            }
            break;

        case 'sword':
            // Deal 50 damage to opponent
            const swordDamage = 50;
            addLogMessage(`${gameState.players[currentPlayer].name} struck ${gameState.players[opponentNum].name} with a sword for ${swordDamage} damage!`);

            // Check for shield option
            const shieldUsed = applyDamageWithShieldOption(opponentNum, swordDamage, `${gameState.players[currentPlayer].name}'s sword`);

            // If shield option was presented, we need to pause the turn switching
            if (shieldUsed) {
                gameState.pendingTurnSwitch = true; // We'll use this to delay the turn switch
                return; // Exit the function early to prevent turn switch
            }
            break;

        case 'shield':
            // Used reactively, handled separately
            gameState.players[currentPlayer].abilitiesUsed.shield++;
            addLogMessage(`${gameState.players[currentPlayer].name} activated their shield!`);
            break;

        case 'push':
            // Push opponent 3 squares
            const pushDirection = {
                row: params.row - gameState.players[currentPlayer].position.row,
                col: params.col - gameState.players[currentPlayer].position.col
            };

            // Normalize direction
            const length = Math.sqrt(pushDirection.row ** 2 + pushDirection.col ** 2);
            pushDirection.row = Math.round(pushDirection.row / length);
            pushDirection.col = Math.round(pushDirection.col / length);

            // Calculate new position after push
            let newRow = gameState.players[opponentNum].position.row;
            let newCol = gameState.players[opponentNum].position.col;

            // Try to push 3 squares
            for (let i = 0; i < 3; i++) { // Using 3 for push distance
                const nextRow = newRow + pushDirection.row;
                const nextCol = newCol + pushDirection.col;

                // Check if next position is off the board
                if (nextRow < 0 || nextRow >= 7 || nextCol < 0 || nextCol >= 7) {
                    // Opponent is pushed off the board!
                    gameState.gameOver = true;
                    gameState.winner = currentPlayer;
                    addLogMessage(`${gameState.players[currentPlayer].name} pushed ${gameState.players[opponentNum].name} off the board!`);
                    showGameOverModal();
                    return;
                }

                // Check if next position has a block
                if (gameState.board[nextRow][nextCol].block) {
                    break; // Stop pushing if blocked
                }

                // Check if there's a wall in the way
                if (pushDirection.row === -1 && gameState.board[newRow][newCol].wall.top) break;
                if (pushDirection.row === 1 && gameState.board[newRow][newCol].wall.bottom) break;
                if (pushDirection.col === -1 && gameState.board[newRow][newCol].wall.left) break;
                if (pushDirection.col === 1 && gameState.board[newRow][newCol].wall.right) break;

                // Move to next position
                newRow = nextRow;
                newCol = nextCol;
            }

            // Update opponent position
            gameState.players[opponentNum].position.row = newRow;
            gameState.players[opponentNum].position.col = newCol;

            addLogMessage(`${gameState.players[currentPlayer].name} pushed ${gameState.players[opponentNum].name} to (${newRow},${newCol})!`);

            // Check for turret damage after push
            checkTurretDamage();
            break;

        case 'turret':
            // Place a turret and store its owner
            gameState.board[params.row][params.col].turret = true;
            gameState.board[params.row][params.col].turretOwner = currentPlayer; // Add owner info
            gameState.players[currentPlayer].abilitiesUsed.turret++;
            addLogMessage(`${gameState.players[currentPlayer].name} placed a turret at (${params.row},${params.col})!`);
            break;

        // Find the case for 'walls' in the useAbility function in game-logic.js
// and replace it with this version that has additional debugging

case 'walls':
    // Place a wall
    console.log(`%c[WALL DEBUG] useAbility called for wall at (${params.row},${params.col}) on side: ${params.side}`, 'color: red; font-weight: bold;');
    
    const wallPosition = {
        row: params.row,
        col: params.col,
        side: params.side // top, right, bottom, left
    };

    // ⚠️ CRITICAL CHANGE: Don't auto-select a side if none provided
    if (!wallPosition.side) {
        console.log(`%c[WALL DEBUG] No side provided for wall placement! Canceling wall placement.`, 'color: red; font-weight: bold;');
        return; // Exit without placing a wall
    }

    // Log the current state before modifying
    console.log('Wall state before placement:', {
        currentCell: { ...gameState.board[wallPosition.row][wallPosition.col].wall },
        adjacentCells: {
            top: wallPosition.row > 0 ? { ...gameState.board[wallPosition.row - 1][wallPosition.col].wall } : 'edge',
            right: wallPosition.col < 6 ? { ...gameState.board[wallPosition.row][wallPosition.col + 1].wall } : 'edge',
            bottom: wallPosition.row < 6 ? { ...gameState.board[wallPosition.row + 1][wallPosition.col].wall } : 'edge',
            left: wallPosition.col > 0 ? { ...gameState.board[wallPosition.row][wallPosition.col - 1].wall } : 'edge'
        }
    });

    // Update wall in game state
    gameState.board[wallPosition.row][wallPosition.col].wall[wallPosition.side] = true;
    console.log(`%c[WALL DEBUG] Set wall ${wallPosition.side} to true for cell (${wallPosition.row},${wallPosition.col})`, 'color: red; font-weight: bold;');

    // Also update adjacent cell's wall
    if (wallPosition.side === 'top' && wallPosition.row > 0) {
        gameState.board[wallPosition.row - 1][wallPosition.col].wall.bottom = true;
        console.log(`%c[WALL DEBUG] Set wall bottom to true for adjacent cell (${wallPosition.row - 1},${wallPosition.col})`, 'color: red; font-weight: bold;');
    }
    if (wallPosition.side === 'right' && wallPosition.col < 6) {
        gameState.board[wallPosition.row][wallPosition.col + 1].wall.left = true;
        console.log(`%c[WALL DEBUG] Set wall left to true for adjacent cell (${wallPosition.row},${wallPosition.col + 1})`, 'color: red; font-weight: bold;');
    }
    if (wallPosition.side === 'bottom' && wallPosition.row < 6) {
        gameState.board[wallPosition.row + 1][wallPosition.col].wall.top = true;
        console.log(`%c[WALL DEBUG] Set wall top to true for adjacent cell (${wallPosition.row + 1},${wallPosition.col})`, 'color: red; font-weight: bold;');
    }
    if (wallPosition.side === 'left' && wallPosition.col > 0) {
        gameState.board[wallPosition.row][wallPosition.col - 1].wall.right = true;
        console.log(`%c[WALL DEBUG] Set wall right to true for adjacent cell (${wallPosition.row},${wallPosition.col - 1})`, 'color: red; font-weight: bold;');
    }

    gameState.players[currentPlayer].abilitiesUsed.walls++;
    addLogMessage(`${gameState.players[currentPlayer].name} placed a wall at (${params.row},${params.col}) on the ${wallPosition.side} side!`);
    
    // Force immediate rendering update to show the wall
    renderGameBoard();
    
    // Log the state after wall placement
    console.log('Wall state after placement:', {
        currentCell: { ...gameState.board[wallPosition.row][wallPosition.col].wall },
        adjacentCells: {
            top: wallPosition.row > 0 ? { ...gameState.board[wallPosition.row - 1][wallPosition.col].wall } : 'edge',
            right: wallPosition.col < 6 ? { ...gameState.board[wallPosition.row][wallPosition.col + 1].wall } : 'edge',
            bottom: wallPosition.row < 6 ? { ...gameState.board[wallPosition.row + 1][wallPosition.col].wall } : 'edge',
            left: wallPosition.col > 0 ? { ...gameState.board[wallPosition.row][wallPosition.col - 1].wall } : 'edge'
        }
    });
    
    console.log(`%c[WALL DEBUG] Wall placement completed successfully`, 'color: red; font-weight: bold;');
    break;

        case 'blocks':
            // Place a block
            gameState.board[params.row][params.col].block = true;
            gameState.players[currentPlayer].abilitiesUsed.blocks++;
            gameState.players[currentPlayer].lastPlacedBlock = true;
            addLogMessage(`${gameState.players[currentPlayer].name} placed a block at (${params.row},${params.col})!`);
            break;
    }

    // Check for game over
    if (checkGameOver()) return;

    // Switch turn if not shield (shield is reactive)
    if (ability !== 'shield') {
        switchTurn();
    }
}

// Fixed switchTurn function that ensures timer starts
function switchTurn() {
gameState.currentTurn = gameState.currentTurn === 1 ? 2 : 1;
gameState.currentAction = "none";
gameState.turnCount++;

// Re-render after turn switch to update UI
renderGameBoard();
//  if (window.updateAbilityButtonHandlers) {
//    window.updateAbilityButtonHandlers();
//}
updateAbilityButtonHandlers();

// Make sure the timer is running
startTimer();

addLogMessage(`It's ${gameState.players[gameState.currentTurn].name}'s turn.`);
}

// Ensure timer starts properly
function startTimer() {
// Clear any existing timer
if (gameState.timerInterval) {
clearInterval(gameState.timerInterval);
}

// Remove active class from both timers
document.getElementById('player1Timer').classList.remove('active');
document.getElementById('player2Timer').classList.remove('active');

// Add active class to current player's timer
document.getElementById(`player${gameState.currentTurn}Timer`).classList.add('active');

gameState.timerInterval = setInterval(() => {
if (gameState.gameOver) {
clearInterval(gameState.timerInterval);
return;
}

// Decrease time for current player
gameState.players[gameState.currentTurn].timeRemaining--;

// Update UI
document.getElementById(`player${gameState.currentTurn}Timer`).textContent = 
`Time: ${formatTime(gameState.players[gameState.currentTurn].timeRemaining)}`;

// Check if time is up
if (gameState.players[gameState.currentTurn].timeRemaining <= 0) {
clearInterval(gameState.timerInterval);
checkGameOver();
}
}, 1000);
}

// Check if the game is over
function checkGameOver() {
// Check health
if (gameState.players[1].health <= 0) {
gameState.gameOver = true;
gameState.winner = 2;
addLogMessage(`${gameState.players[2].name} wins! ${gameState.players[1].name} has been defeated.`);
showGameOverModal();
return true;
}

if (gameState.players[2].health <= 0) {
gameState.gameOver = true;
gameState.winner = 1;
addLogMessage(`${gameState.players[1].name} wins! ${gameState.players[2].name} has been defeated.`);
showGameOverModal();
return true;
}

// Check time
if (gameState.players[1].timeRemaining <= 0) {
gameState.gameOver = true;
gameState.winner = 2;
addLogMessage(`${gameState.players[2].name} wins! ${gameState.players[1].name} ran out of time.`);
showGameOverModal();
return true;
}

if (gameState.players[2].timeRemaining <= 0) {
gameState.gameOver = true;
gameState.winner = 1;
addLogMessage(`${gameState.players[1].name} wins! ${gameState.players[2].name} ran out of time.`);
showGameOverModal();
return true;
}

return false;
}

// Show the game over modal
function showGameOverModal() {
modals.gameOver.style.display = 'block';
if (gameState.winner) {
document.getElementById('winnerDisplay').textContent = `${gameState.players[gameState.winner].name} wins!`;
} else {
document.getElementById('winnerDisplay').textContent = "Game over!";
}
}

function handlePlayerClick(row, col) {
    const currentPlayer = gameState.currentTurn;
    const currentPos = gameState.players[currentPlayer].position;
    
    // If clicking on current position, start move
    if (row === currentPos.row && col === currentPos.col) {
        gameState.currentAction = 'move';
        
        // Highlight valid moves
        highlightPossibleMoves();
    }
}

function handleCellClick(row, col) {
    // Ability usage flow
    if (gameState.currentAction && gameState.currentAction.startsWith('ability-')) {
        const ability = gameState.currentAction.split('-')[1];
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        
        if (cell && cell.classList.contains('highlight')) {
            // Handle special case for wall placement
            if (ability === 'walls') {
                // Show wall selection dialog
                showWallSelectionDialog(row, col, ability);
                return;
            } else {
                // All other abilities
                useAbility(ability, { row, col });
            }
            
            // Reset UI state
            gameState.currentAction = 'none';
            document.querySelectorAll('.cell.highlight').forEach(cell => cell.classList.remove('highlight'));
            const currentPlayer = gameState.currentTurn;
            const abilitiesContainer = document.getElementById(`player${currentPlayer}Abilities`);
            if (abilitiesContainer) {
                const abilityButtons = abilitiesContainer.querySelectorAll('.ability');
                abilityButtons.forEach(btn => btn.classList.remove('selected'));
            }
            if (window.buttons) window.buttons.useAbility.textContent = 'Use Ability';
            return;
        }
    }
    
    // Move logic
    if (gameState.currentAction === 'move') {
        const currentPlayer = gameState.currentTurn;
        const currentPos = gameState.players[currentPlayer].position;
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        
        if (cell && cell.classList.contains('highlight')) {
            movePlayer(row, col);
            gameState.currentAction = 'none';
            renderGameBoard();
            updateAbilityButtonHandlers();
        }
    }
}

// At the end of game-logic.js, add to your exports:
export { 
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
};