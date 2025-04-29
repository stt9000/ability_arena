// game-debug.js
// A debugging utility for Ability Arena

// Debug state
const debugState = {
    enabled: true,
    logLevel: 'debug', // 'error', 'warn', 'info', 'debug', 'trace'
    logToConsole: true,
    logToScreen: true
};

// Create a log container on screen if it doesn't exist
function ensureLogContainer() {
    if (!document.getElementById('debug-log-container')) {
        const container = document.createElement('div');
        container.id = 'debug-log-container';
        container.style.position = 'fixed';
        container.style.bottom = '0';
        container.style.right = '0';
        container.style.width = '400px';
        container.style.maxHeight = '300px';
        container.style.overflowY = 'auto';
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        container.style.color = '#fff';
        container.style.padding = '10px';
        container.style.fontFamily = 'monospace';
        container.style.fontSize = '12px';
        container.style.zIndex = '9999';
        
        // Add toggle button
        const toggleButton = document.createElement('button');
        toggleButton.textContent = 'Hide Debug';
        toggleButton.style.marginBottom = '10px';
        toggleButton.addEventListener('click', function() {
            const log = document.getElementById('debug-log');
            if (log.style.display === 'none') {
                log.style.display = 'block';
                this.textContent = 'Hide Debug';
            } else {
                log.style.display = 'none';
                this.textContent = 'Show Debug';
            }
        });
        
        // Add clear button
        const clearButton = document.createElement('button');
        clearButton.textContent = 'Clear';
        clearButton.style.marginBottom = '10px';
        clearButton.style.marginLeft = '10px';
        clearButton.addEventListener('click', function() {
            const log = document.getElementById('debug-log');
            log.innerHTML = '';
        });
        
        container.appendChild(toggleButton);
        container.appendChild(clearButton);
        
        // Add log element
        const log = document.createElement('div');
        log.id = 'debug-log';
        container.appendChild(log);
        
        document.body.appendChild(container);
    }
}

// Log a message
function log(level, message, data) {
    if (!debugState.enabled) return;
    
    const levels = {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
        trace: 4
    };
    
    if (levels[level] > levels[debugState.logLevel]) return;
    
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    // Log to console
    if (debugState.logToConsole) {
        if (data) {
            console[level](formattedMessage, data);
        } else {
            console[level](formattedMessage);
        }
    }
    
    // Log to screen
    if (debugState.logToScreen) {
        ensureLogContainer();
        const logElement = document.getElementById('debug-log');
        const entry = document.createElement('div');
        
        // Style based on level
        switch (level) {
            case 'error':
                entry.style.color = '#ff5252';
                break;
            case 'warn':
                entry.style.color = '#ffd600';
                break;
            case 'info':
                entry.style.color = '#2196f3';
                break;
            case 'debug':
                entry.style.color = '#4caf50';
                break;
            case 'trace':
                entry.style.color = '#e0e0e0';
                break;
        }
        
        entry.textContent = formattedMessage;
        
        // Add data if provided
        if (data) {
            const dataText = document.createElement('pre');
            dataText.style.marginLeft = '20px';
            dataText.style.fontSize = '11px';
            dataText.textContent = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
            entry.appendChild(dataText);
        }
        
        logElement.appendChild(entry);
        logElement.scrollTop = logElement.scrollHeight;
    }
}

// Export debug methods
export const debug = {
    error: (message, data) => log('error', message, data),
    warn: (message, data) => log('warn', message, data),
    info: (message, data) => log('info', message, data),
    debug: (message, data) => log('debug', message, data),
    trace: (message, data) => log('trace', message, data),
    config: (options) => {
        Object.assign(debugState, options);
    },
    inspect: (object, label) => {
        log('debug', label || 'Object Inspection', object);
    }
};

// Initialize debug module
export function initDebug() {
    debug.info('Debug module initialized');
    
    // Add global error handler
    window.addEventListener('error', function(event) {
        debug.error(`Global error: ${event.message}`, { 
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error ? event.error.stack : null
        });
    });
    
    // Export to window for console access
    window.gameDebug = debug;
}


// Add this function to game-debug.js
export function addDebugInfoDisplay() {
    const infoPanel = document.createElement('div');
    infoPanel.id = 'debug-info-panel';
    infoPanel.style.cssText = `
        position: fixed;
        bottom: 10px;
        left: 10px;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-family: monospace;
        font-size: 12px;
        z-index: 9999;
        max-width: 300px;
    `;
    
    // Display the game version and date
    infoPanel.innerHTML = `
        <div>Game Version: FIXED_WALL_PLACEMENT</div>
        <div>Loaded at: ${new Date().toLocaleTimeString()}</div>
        <button id="check-walls-btn" style="margin-top: 5px;">Count Walls</button>
    `;
    
    document.body.appendChild(infoPanel);
    
    // Add button functionality
    document.getElementById('check-walls-btn').addEventListener('click', function() {
        const wallCount = document.querySelectorAll('.wall-horizontal, .wall-vertical').length;
        const wallsInState = gameState.board.flat().reduce((count, cell) => {
            return count + Object.values(cell.wall).filter(Boolean).length;
        }, 0);
        
        alert(`Walls on screen: ${wallCount}\nWalls in game state: ${wallsInState}`);
    });
}

// Call this function in initDebug() in game-debug.js
export function initDebug() {
    debug.info('Debug module initialized');
    
    // Add global error handler
    window.addEventListener('error', function(event) {
        debug.error(`Global error: ${event.message}`, { 
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error ? event.error.stack : null
        });
    });
    
    // Add debug info display
    addDebugInfoDisplay();
    
    // Export to window for console access
    window.gameDebug = debug;
}