// Debug utility
export function setupDebugTools() {
    console.log("Setting up debug tools...");
    
    // Add global debug functions
    window.debugGame = {
        checkInitialization: function() {
            console.log("Checking initialization...");
            console.log("showScreen exists:", typeof window.showScreen === 'function');
            console.log("renderGameBoard exists:", typeof window.renderGameBoard === 'function');
            console.log("buttons object:", window.buttons);
        },
        
        checkEventListeners: function() {
            console.log("Checking event listeners...");
            
            // Test click on Create Game button
            const createGameBtn = document.getElementById('createGame');
            if (createGameBtn) {
                console.log("Create Game button found, simulating click...");
                // Just log, don't actually click to avoid side effects
            } else {
                console.log("Create Game button NOT found!");
            }
            
            // Check other buttons
            console.log("Show Rules button:", document.getElementById('showRules'));
            console.log("Join Game button:", document.getElementById('joinGame'));
        }
    };
    
    // Run initial checks
    setTimeout(() => {
        console.log("Running initial debug checks...");
        window.debugGame.checkInitialization();
        window.debugGame.checkEventListeners();
    }, 2000);
}