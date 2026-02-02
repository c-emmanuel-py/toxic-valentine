/* ============================================
   TOXIC VALENTINE - JavaScript
   ============================================ */

// ============================================
// TOXIC MESSAGES POOL (~25 lines)
// ============================================
const toxicMessages = [
    "¿Tú de verdad creíste que ibas a decir que no? 😌💅",
    "No está disponible. Intenta con 'Yes' 💘",
    "Eso fue un micro rechazo. Tomado personal. 😤",
    "Mira… yo sé lo que tú quieres 🥺👉👈",
    "El botón 'No' está en mantenimiento por tu bien 💀",
    "Tu libertad expiró hace 5 segundos 😶‍🌫️",
    "Dale a Yes y deja el show 😤💗",
    "Aw cute, you think you have a choice ✨",
    "The 'No' button fears commitment just like you 💔",
    "Error 404: Your freedom not found 💀🔒",
    "I didn't ask, I informed 💅😌",
    "Running away? That's our thing now 🏃‍♂️💘",
    "Every 'No' makes me stronger 📈✨",
    "This is a safe space... for Yes only 🥺💗",
    "Bestie, the universe wants us together 🌌💘",
    "Your hesitation is lowkey offensive 😤💔",
    "Plot twist: I'm the main character here 💅✨",
    "The red flags are just aesthetic 🚩😍",
    "Consent? I prefer enthusiasm 💘✨",
    "That's suspicious... that's weird 🤨💀",
    "POV: You're trapped in a situationship 😶‍🌫️",
    "Gaslight, gatekeep, girlboss energy 💅✨",
    "Delulu is the solulu bestie 🥺💗",
    "No is just Yes with extra steps 😌💘",
    "The audacity... the disrespect... 😤💔",
    "Fine, I'll just manifest it then ✨🔮",
    "This isn't toxic, it's ✨passionate✨ 💗"
];

// Track which messages have been used recently
let usedMessageIndices = [];

// ============================================
// TOXICITY LEVELS
// ============================================
const toxicityLevels = [
    { max: 25, label: "Cute jealousy 🥺", color: "#ffb6c1" },
    { max: 60, label: "Manipulation Mode 💅", color: "#ff69b4" },
    { max: 85, label: "Gaslight Pro 💀", color: "#ff1493" },
    { max: 100, label: "FINAL BOSS 🚩", color: "#dc143c" }
];

// ============================================
// DOM ELEMENTS
// ============================================
const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const card = document.getElementById('card');
const toxicityFill = document.getElementById('toxicity-fill');
const toxicityStatus = document.getElementById('toxicity-status');
const attemptsCount = document.getElementById('attempts-count');
const toxicMessage = document.getElementById('toxic-message');
const messageArea = document.querySelector('.message-area');
const successMessage = document.getElementById('success-message');
const buttonsContainer = document.getElementById('buttons-container');
const resetBtn = document.getElementById('reset-btn');
const confettiContainer = document.getElementById('confetti-container');

// ============================================
// STATE
// ============================================
let attempts = 0;
let isGameOver = false;
let audioContext = null;
let noButtonInitialized = false;

// ============================================
// INITIALIZATION
// ============================================
function init() {
    // Position No button initially relative to its container
    positionNoButtonInitially();
    
    // Add event listeners
    setupEventListeners();
    
    // Start Yes button pulse
    btnYes.classList.add('pulse');
}

function positionNoButtonInitially() {
    // Get the Yes button position to place No button next to it
    const yesRect = btnYes.getBoundingClientRect();
    const noWidth = btnNo.offsetWidth;
    const noHeight = btnNo.offsetHeight;
    
    // Position No button to the right of Yes button
    const initialLeft = yesRect.right + 20;
    const initialTop = yesRect.top + (yesRect.height / 2) - (noHeight / 2);
    
    btnNo.style.left = `${initialLeft}px`;
    btnNo.style.top = `${initialTop}px`;
    
    noButtonInitialized = true;
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Yes button click
    btnYes.addEventListener('click', handleYesClick);
    
    // No button - prevent actual click
    btnNo.addEventListener('click', handleNoClick);
    
    // Mouse movement for desktop
    document.addEventListener('mousemove', handleMouseMove);
    
    // Touch events for mobile
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    // Pointer events (covers both)
    btnNo.addEventListener('pointerdown', handleNoPointerDown);
    
    // Reset button
    resetBtn.addEventListener('click', resetGame);
    
    // Window resize - reposition if needed
    window.addEventListener('resize', () => {
        if (!isGameOver && noButtonInitialized) {
            ensureNoButtonInViewport();
        }
    });
}

// ============================================
// NO BUTTON ESCAPE LOGIC
// ============================================
const ESCAPE_RADIUS = 150; // Distance at which No button runs away

function handleMouseMove(e) {
    if (isGameOver) return;
    checkProximityAndEscape(e.clientX, e.clientY);
}

function handleTouchStart(e) {
    if (isGameOver || e.touches.length === 0) return;
    const touch = e.touches[0];
    checkProximityAndEscape(touch.clientX, touch.clientY);
}

function handleTouchMove(e) {
    if (isGameOver || e.touches.length === 0) return;
    const touch = e.touches[0];
    checkProximityAndEscape(touch.clientX, touch.clientY);
}

function handleNoPointerDown(e) {
    if (isGameOver) return;
    e.preventDefault();
    moveNoButton();
    incrementAttempts();
    showToxicMessage("Nice try 💀✨");
}

function handleNoClick(e) {
    if (isGameOver) return;
    e.preventDefault();
    e.stopPropagation();
    moveNoButton();
    incrementAttempts();
    showToxicMessage("Nice try 💀✨");
}

function checkProximityAndEscape(mouseX, mouseY) {
    const noRect = btnNo.getBoundingClientRect();
    const noCenterX = noRect.left + noRect.width / 2;
    const noCenterY = noRect.top + noRect.height / 2;
    
    const distance = Math.sqrt(
        Math.pow(mouseX - noCenterX, 2) + 
        Math.pow(mouseY - noCenterY, 2)
    );
    
    if (distance < ESCAPE_RADIUS) {
        moveNoButton();
        incrementAttempts();
        updateToxicMessage();
    }
}

function moveNoButton() {
    const noWidth = btnNo.offsetWidth;
    const noHeight = btnNo.offsetHeight;
    const padding = 20;
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Get Yes button position to avoid overlap
    const yesRect = btnYes.getBoundingClientRect();
    
    // Calculate safe area
    const maxX = viewportWidth - noWidth - padding;
    const maxY = viewportHeight - noHeight - padding;
    
    let newX, newY;
    let attempts = 0;
    const maxAttempts = 50;
    
    // Find a position that doesn't overlap with Yes button
    do {
        newX = padding + Math.random() * (maxX - padding);
        newY = padding + Math.random() * (maxY - padding);
        attempts++;
    } while (
        attempts < maxAttempts &&
        isOverlapping(newX, newY, noWidth, noHeight, yesRect)
    );
    
    // Apply new position with animation
    btnNo.style.left = `${newX}px`;
    btnNo.style.top = `${newY}px`;
    
    // Add wiggle and bounce animations
    btnNo.classList.remove('wiggle', 'bounce');
    void btnNo.offsetWidth; // Trigger reflow
    btnNo.classList.add('wiggle', 'bounce');
    
    // Remove animation classes after animation completes
    setTimeout(() => {
        btnNo.classList.remove('wiggle', 'bounce');
    }, 500);
}

function isOverlapping(x, y, width, height, rect) {
    const buffer = 30; // Extra buffer around Yes button
    return !(
        x + width < rect.left - buffer ||
        x > rect.right + buffer ||
        y + height < rect.top - buffer ||
        y > rect.bottom + buffer
    );
}

function ensureNoButtonInViewport() {
    const noRect = btnNo.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 20;
    
    let needsMove = false;
    let newX = parseFloat(btnNo.style.left);
    let newY = parseFloat(btnNo.style.top);
    
    if (noRect.right > viewportWidth - padding) {
        newX = viewportWidth - noRect.width - padding;
        needsMove = true;
    }
    if (noRect.bottom > viewportHeight - padding) {
        newY = viewportHeight - noRect.height - padding;
        needsMove = true;
    }
    if (noRect.left < padding) {
        newX = padding;
        needsMove = true;
    }
    if (noRect.top < padding) {
        newY = padding;
        needsMove = true;
    }
    
    if (needsMove) {
        btnNo.style.left = `${newX}px`;
        btnNo.style.top = `${newY}px`;
    }
}

// ============================================
// ATTEMPTS & TOXICITY
// ============================================
function incrementAttempts() {
    attempts++;
    attemptsCount.textContent = attempts;
    updateToxicityMeter();
    
    // Shake the card occasionally
    if (attempts % 3 === 0) {
        card.classList.remove('shake');
        void card.offsetWidth;
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 500);
    }
}

function updateToxicityMeter() {
    // Calculate toxicity percentage (caps at 100)
    const toxicity = Math.min(attempts * 5, 100);
    toxicityFill.style.width = `${toxicity}%`;
    
    // Update label based on level
    for (const level of toxicityLevels) {
        if (toxicity <= level.max) {
            toxicityStatus.textContent = level.label;
            toxicityStatus.style.color = level.color;
            break;
        }
    }
}

// ============================================
// TOXIC MESSAGES
// ============================================
function updateToxicMessage() {
    const message = getRandomToxicMessage();
    showToxicMessage(message);
}

function getRandomToxicMessage() {
    // If we've used most messages, reset the pool
    if (usedMessageIndices.length >= toxicMessages.length - 3) {
        usedMessageIndices = [];
    }
    
    // Get a random unused message
    let index;
    do {
        index = Math.floor(Math.random() * toxicMessages.length);
    } while (usedMessageIndices.includes(index));
    
    usedMessageIndices.push(index);
    return toxicMessages[index];
}

function showToxicMessage(message) {
    toxicMessage.style.opacity = '0';
    
    setTimeout(() => {
        toxicMessage.textContent = message;
        toxicMessage.style.opacity = '1';
    }, 150);
    
    // Highlight the message area
    messageArea.classList.remove('highlight');
    void messageArea.offsetWidth;
    messageArea.classList.add('highlight');
}

// ============================================
// YES BUTTON - SUCCESS!
// ============================================
function handleYesClick() {
    if (isGameOver) return;
    
    isGameOver = true;
    
    // Stop Yes button pulse
    btnYes.classList.remove('pulse');
    
    // Hide No button
    btnNo.classList.add('hidden');
    
    // Hide regular UI, show success
    buttonsContainer.style.display = 'none';
    messageArea.style.display = 'none';
    successMessage.classList.add('visible');
    
    // Add success mode to body
    document.body.classList.add('success-mode');
    
    // Play success sound
    playSuccessSound();
    
    // Launch confetti and hearts!
    launchCelebration();
}

// ============================================
// CELEBRATION EFFECTS
// ============================================
function launchCelebration() {
    // Launch hearts
    for (let i = 0; i < 30; i++) {
        setTimeout(() => createHeart(), i * 100);
    }
    
    // Launch confetti
    for (let i = 0; i < 50; i++) {
        setTimeout(() => createConfetti(), i * 50);
    }
}

function createHeart() {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.textContent = ['💖', '💗', '💕', '💘', '❤️', '🥰', '😍', '💝'][Math.floor(Math.random() * 8)];
    heart.style.left = `${Math.random() * 100}vw`;
    heart.style.bottom = '-50px';
    heart.style.fontSize = `${1.5 + Math.random() * 2}rem`;
    heart.style.animationDuration = `${3 + Math.random() * 2}s`;
    
    confettiContainer.appendChild(heart);
    
    // Remove after animation
    setTimeout(() => heart.remove(), 5000);
}

function createConfetti() {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    
    const colors = ['#ff69b4', '#ff1493', '#ffb6c1', '#ff6b6b', '#ffd700', '#ff85a2'];
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.top = '-20px';
    confetti.style.width = `${8 + Math.random() * 8}px`;
    confetti.style.height = `${8 + Math.random() * 8}px`;
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
    
    confettiContainer.appendChild(confetti);
    
    // Remove after animation
    setTimeout(() => confetti.remove(), 4000);
}

// ============================================
// SOUND (Web Audio API)
// ============================================
function playSuccessSound() {
    try {
        // Create audio context on user interaction
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create a pleasant success sound
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        
        notes.forEach((freq, i) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            const startTime = audioContext.currentTime + i * 0.15;
            const duration = 0.3;
            
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
            gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        });
    } catch (e) {
        console.log('Audio not supported or blocked');
    }
}

// ============================================
// RESET GAME
// ============================================
function resetGame() {
    // Reset state
    attempts = 0;
    isGameOver = false;
    usedMessageIndices = [];
    
    // Reset UI
    attemptsCount.textContent = '0';
    toxicityFill.style.width = '0%';
    toxicityStatus.textContent = 'Cute jealousy 🥺';
    toxicityStatus.style.color = '#ff69b4';
    toxicMessage.textContent = 'Choose wisely... ✨';
    
    // Show buttons, hide success
    buttonsContainer.style.display = 'flex';
    messageArea.style.display = 'flex';
    successMessage.classList.remove('visible');
    
    // Show No button
    btnNo.classList.remove('hidden');
    
    // Remove success mode
    document.body.classList.remove('success-mode');
    
    // Restart Yes pulse
    btnYes.classList.add('pulse');
    
    // Reposition No button
    positionNoButtonInitially();
    
    // Clear any remaining confetti
    confettiContainer.innerHTML = '';
}

// ============================================
// START THE APP
// ============================================
document.addEventListener('DOMContentLoaded', init);

// Also run init if DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 1);
}
