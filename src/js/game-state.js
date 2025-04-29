// Create an empty board with 7x7 cells
function createEmptyBoard() {
    const board = [];
    for (let i = 0; i < 7; i++) {
        board[i] = [];
        for (let j = 0; j < 7; j++) {
            board[i][j] = {
                player: null,
                wall: {
                    top: false,
                    right: false,
                    bottom: false,
                    left: false
                },
                block: false,
                turret: false,
                turretOwner: null
            };
        }
    }
    return board;
}

// Initialize and return the game state
export function initGameState() {
    return {
        players: {
            1: {
                name: "",
                health: 100,
                position: { row: 0, col: 3 },
                abilities: [],
                abilitiesUsed: {
                    shield: 0,
                    turret: 0,
                    walls: 0,
                    blocks: 0
                },
                timeRemaining: 300, // 5 minutes in seconds
                lastPlacedBlock: false
            },
            2: {
                name: "",
                health: 100,
                position: { row: 6, col: 3 },
                abilities: [],
                abilitiesUsed: {
                    shield: 0,
                    turret: 0,
                    walls: 0,
                    blocks: 0
                },
                timeRemaining: 300,
                lastPlacedBlock: false
            }
        },
        currentTurn: 1,
        currentAction: "none", // none, move, useAbility
        gameId: "",
        board: createEmptyBoard(),
        walls: [],
        blocks: [],
        turrets: [],
        turnCount: 0,
        gameOver: false,
        winner: null,
        pendingDamage: null,
        pendingTurnSwitch: false,
        timerInterval: null
    };
}

// Ability Data
export const abilityData = {
    bow: {
        name: "Bow and Arrow",
        damage: 35,
        range: 2,
        uses: Infinity
    },
    sword: {
        name: "Sword",
        damage: 50,
        range: 1,
        uses: Infinity
    },
    shield: {
        name: "Shield",
        damage: 0,
        uses: 3,
        reactive: true
    },
    push: {
        name: "Push",
        damage: 0,
        pushDistance: 3,
        uses: Infinity
    },
    diagonal: {
        name: "Diagonal Moving",
        passive: true,
        uses: Infinity
    },
    turret: {
        name: "Turret",
        damage: 50,
        uses: 1,
        firstTurnRestriction: true
    },
    walls: {
        name: "Walls",
        uses: 6
    },
    blocks: {
        name: "Blocks",
        uses: 5,
        allowsPass: true
    }
};

// Helper Functions
export function hasLimitedUses(ability) {
    return ['shield', 'turret', 'walls', 'blocks'].includes(ability);
}

export function getAbilityUseLimit(ability) {
    const limits = {
        shield: 3,
        turret: 1,
        walls: 6,
        blocks: 5
    };
    return limits[ability] || Infinity;
}

export function getAbilityName(ability) {
    return abilityData[ability]?.name || ability;
}

export function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

export function generateGameId() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Reset game state
export function resetGameState(gameState) {
    gameState.players[1].health = 100;
    gameState.players[2].health = 100;
    gameState.players[1].position = { row: 0, col: 3 };
    gameState.players[2].position = { row: 6, col: 3 };
    gameState.players[1].abilitiesUsed = { shield: 0, turret: 0, walls: 0, blocks: 0 };
    gameState.players[2].abilitiesUsed = { shield: 0, turret: 0, walls: 0, blocks: 0 };
    gameState.players[1].timeRemaining = 300;
    gameState.players[2].timeRemaining = 300;
    gameState.players[1].lastPlacedBlock = false;
    gameState.players[2].lastPlacedBlock = false;
    gameState.currentTurn = 1;
    gameState.currentAction = 'none';
    gameState.board = createEmptyBoard();
    gameState.walls = [];
    gameState.blocks = [];
    gameState.turrets = [];
    gameState.turnCount = 0;
    gameState.gameOver = false;
    gameState.winner = null;
    gameState.pendingDamage = null;
    gameState.pendingTurnSwitch = false;
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    return gameState;
}