/* ==========================================
   SECRET EASTER EGG COMBO: CTRL then C - I - T - D
   ========================================== */
    let isListening = false;
let keyBuffer = '';
let listenTimeout;
const secretCombo = 'citd';

document.addEventListener('keydown', (e) => {
    // 1. FIXED: Correctly detect when the Shift key itself is tapped
    if (e.key === 'Shift') {
        isListening = true;
        keyBuffer = ''; // Reset the buffer for a fresh start
        resetListenTimer(); // Start the 3-second countdown
        return;
    }

    // 2. If we are currently in listening mode, process the typing
    if (isListening) {
        // Ignore other modifier keys to keep the sequence clean
        // Also skip 'Shift' if they hold it down or tap it multiple times so it doesn't append to the buffer
        if (e.altKey || e.metaKey || e.controlKey || e.key === 'Shift') return;

        // Add the typed key to our buffer
        keyBuffer += e.key.toLowerCase();
        
        // Keep the buffer strictly to the length of our combo
        if (keyBuffer.length > secretCombo.length) {
            keyBuffer = keyBuffer.slice(-secretCombo.length);
        }

        // Reset the 3-second clock because they made a valid keystroke
        resetListenTimer();

        // 3. Check if they successfully spelled the combo
        if (keyBuffer === secretCombo) {
            unlockSecretLogo();
            
            // Turn off listening mode so it doesn't trigger again
            isListening = false;
            keyBuffer = '';
            clearTimeout(listenTimeout);
        }
    }
});

// Helper function to handle the 3-second timeout window
function resetListenTimer() {
    clearTimeout(listenTimeout);
    
    listenTimeout = setTimeout(() => {
        // If 3 seconds pass with no typing, shut it down
        isListening = false;
        keyBuffer = '';
    }, 3000); // 3000 milliseconds = 3 seconds
}

// Helper function to trigger the adjustments and print to console
function unlockSecretLogo() {
    const secretWrapper = document.querySelector('.secret-wrapper');
    const secretTooltip = document.querySelector('.secret-tooltip');
    
    if (secretWrapper) {
        // Bring it into existence and make it interactable
        secretWrapper.style.opacity = '1';
        secretWrapper.style.visibility = 'visible';
        secretWrapper.style.pointerEvents = 'auto'; 
        secretWrapper.style.transform = 'scale(1.05)';
    }
    
    if (secretTooltip) {
        secretTooltip.style.opacity = '1';
        secretTooltip.style.visibility = 'visible';
    }

    const uitBAnner = `
%c
__    __   ___    _____ 
| |  | |  |_ _|  |_   _|
| |  | |   | |     | |  
| |__| |   | |     | |  
\\______/  |___|    |_|  
                            
💻 VNUHCM University of Information Technology
🛠️ Code Signature verified. Hello, K!`;
    
    // Logs the banner with a clean terminal green color scheme
    console.log(uitBAnner, "color: #17a46c; font-family: monospace; font-weight: bold; line-height: 1.3; font-size: 13px;");
    
    // Optional: Alert notification confirming deployment
    alert("Congrats on finding a secret left by me. Now check the headers and maybe the consoles...\n - K, Developer");
}