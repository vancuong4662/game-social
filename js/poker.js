/**
 * Poker Game Logic
 * Basic initialization and UI control
 */

// Import bot storage
import { 
  initializeBots, 
  getRandomBots,
  isBotsInitialized 
} from './storage/botStorage.js';

// ============================================
// LOADING & MATCHING
// ============================================

let selectedBots = [];
let isSetupComplete = false;

/**
 * Simulate matching progress with smooth animation
 */
async function simulateMatching() {
  const progressFill = document.getElementById('progressFill');
  const progressPercentage = document.getElementById('progressPercentage');
  const overlay = document.getElementById('loadingOverlay');
  
  if (!progressFill || !progressPercentage || !overlay) return;
  
  let progress = 0;
  const duration = 3000; // 3 seconds
  const intervalTime = 30; // Update every 30ms
  const increment = (100 / duration) * intervalTime;
  
  // Start bot initialization in parallel
  const botSetupPromise = setupBots();
  
  // Animate progress bar
  const progressInterval = setInterval(() => {
    progress += increment;
    
    if (progress >= 100) {
      progress = 100;
      clearInterval(progressInterval);
      
      // Wait for bot setup to complete
      botSetupPromise.then(() => {
        setTimeout(() => {
          hideLoadingOverlay();
        }, 500);
      });
    }
    
    progressFill.style.width = `${progress}%`;
    progressPercentage.textContent = `${Math.round(progress)}%`;
  }, intervalTime);
}

/**
 * Setup bots for the game
 */
async function setupBots() {
  try {
    console.log('🎲 Starting bot setup...');
    
    // Initialize bots if not already done
    if (!isBotsInitialized()) {
      console.log('📦 Initializing bots from JSON...');
      await initializeBots();
    }
    
    // Get random number of players (6-8 bots + 1 player = 7-9 total)
    const numBots = Math.floor(Math.random() * 3) + 6; // 6, 7, or 8 bots
    
    // Select random bots
    selectedBots = getRandomBots(numBots);
    
    console.log(`✅ Selected ${selectedBots.length} bots for this game:`);
    console.table(selectedBots.map(bot => ({
      ID: bot.id,
      Name: bot.name,
      Balance: `$${bot.balance}`,
      Personality: bot.personality
    })));
    
    isSetupComplete = true;
    return selectedBots;
  } catch (error) {
    console.error('❌ Error setting up bots:', error);
    isSetupComplete = true; // Continue anyway
    return [];
  }
}

/**
 * Hide loading overlay and render bots
 */
function hideLoadingOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  
  if (overlay) {
    overlay.classList.add('hidden');
    
    // Remove from DOM after animation
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 500);
  }
  
  console.log('🎮 Game ready! Bots loaded:', selectedBots.length);
  
  // Render bots into seats
  renderBots();
}

/**
 * Render bots into poker table seats
 */
function renderBots() {
  if (!selectedBots || selectedBots.length === 0) {
    console.warn('No bots to render');
    return;
  }
  
  // Available seats (excluding seat 5 which is player)
  const availableSeats = [1, 2, 3, 4, 6, 7, 8];
  
  // Shuffle seats for random placement
  const shuffledSeats = availableSeats.sort(() => Math.random() - 0.5);
  
  // Render each bot
  selectedBots.forEach((bot, index) => {
    if (index >= shuffledSeats.length) return;
    
    const seatNumber = shuffledSeats[index];
    renderBotInSeat(bot, seatNumber);
  });
  
  console.log('✅ Rendered bots into seats');
}

/**
 * Render a single bot into a specific seat
 */
function renderBotInSeat(bot, seatNumber) {
  const seat = document.querySelector(`.seat-${seatNumber}`);
  if (!seat) return;
  
  const playerCard = seat.querySelector('.player-card');
  if (!playerCard) return;
  
  // Remove empty-seat class and add active class
  playerCard.classList.remove('empty-seat');
  playerCard.classList.add('active');
  
  // Build avatar image path
  const avatarPath = `static/avatars/${bot.id}.jpg`;
  
  // Create bot card HTML
  playerCard.innerHTML = `
    <div class="player-left-col">
      <div class="player-avatar">
        <img src="${avatarPath}" alt="${bot.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div class="avatar-placeholder" style="display: none;">🤖</div>
      </div>
      <div class="player-name">${bot.name}</div>
    </div>
    <div class="player-right-col">
      <div class="player-chips">$${formatBalance(bot.balance)}</div>
      <div class="player-cards-hand">
        <div class="card card-back">?</div>
        <div class="card card-back">?</div>
      </div>
      <div class="player-action"></div>
    </div>
  `;
}

// ============================================
// USER SESSION
// ============================================

// Load user session
function loadUserSession() {
  try {
    const sessionData = localStorage.getItem('poker_userSession');
    
    if (!sessionData) {
      window.location.href = 'login.html';
      return null;
    }
    
    return JSON.parse(sessionData);
  } catch (error) {
    console.error('Error loading user session:', error);
    window.location.href = 'login.html';
    return null;
  }
}

// Format balance
function formatBalance(balance) {
  return balance.toLocaleString('en-US');
}

// Shorten name if too long (only for player, not bots)
function shortenName(name) {
  if (!name) return '';
  
  // If name is longer than 6 characters, shorten to 5 chars + ".."
  if (name.length > 6) {
    return name.substring(0, 5) + '..';
  }
  
  return name;
}

// Initialize poker game UI
function initPokerGame() {
  const user = loadUserSession();
  
  if (!user) return;
  
  // Start matching simulation
  simulateMatching();
  
  // Shorten player name if needed
  const displayName = shortenName(user.username);
  
  // Update player info in seat 5 (player seat)
  const playerName = document.querySelector('.seat-5 .player-name');
  const playerChips = document.querySelector('.seat-5 .player-chips');
  const sidebarBalance = document.querySelector('.player-balance');
  
  if (playerName) {
    playerName.textContent = displayName;
  }
  
  if (playerChips) {
    playerChips.textContent = `$${formatBalance(user.balance)}`;
  }
  
  if (sidebarBalance) {
    sidebarBalance.textContent = `$${formatBalance(user.balance)}`;
  }
  
  // Add event listeners
  setupEventListeners();
  
  console.log('Poker game initialized for:', user.username);
}

// Setup event listeners
function setupEventListeners() {
  // Start game button
  const btnStartGame = document.querySelector('.btn-start-game');
  if (btnStartGame) {
    btnStartGame.addEventListener('click', handleStartGame);
  }
  
  // Leave table button
  const btnLeaveTable = document.querySelector('.btn-leave-table');
  if (btnLeaveTable) {
    btnLeaveTable.addEventListener('click', handleLeaveTable);
  }
  
  // Action buttons
  const btnFold = document.querySelector('.btn-fold');
  const btnCheck = document.querySelector('.btn-check');
  const btnCall = document.querySelector('.btn-call');
  const btnRaise = document.querySelector('.btn-raise');
  const btnAllin = document.querySelector('.btn-allin');
  
  if (btnFold) btnFold.addEventListener('click', () => handleAction('fold'));
  if (btnCheck) btnCheck.addEventListener('click', () => handleAction('check'));
  if (btnCall) btnCall.addEventListener('click', () => handleAction('call'));
  if (btnRaise) btnRaise.addEventListener('click', () => handleAction('raise'));
  if (btnAllin) btnAllin.addEventListener('click', () => handleAction('allin'));
  
  // Bet slider
  const betSlider = document.querySelector('.bet-slider');
  const betValue = document.getElementById('bet-value');
  
  if (betSlider && betValue) {
    betSlider.addEventListener('input', (e) => {
      betValue.textContent = e.target.value;
    });
  }
}

// Handle start game (reload to find new match)
function handleStartGame() {
  const confirmed = confirm('Bạn muốn tìm trận đấu khác? Trận đấu hiện tại sẽ kết thúc.');
  
  if (confirmed) {
    window.location.reload();
  }
}

// Handle leave table
function handleLeaveTable() {
  const confirmed = confirm('Bạn có chắc muốn rời bàn?');
  
  if (confirmed) {
    window.location.href = 'game.html';
  }
}

// Handle player actions
function handleAction(action) {
  console.log('Player action:', action);
  
  // TODO: Implement game logic for each action
  
  alert(`Action "${action}" chưa được triển khai. Đây là UI demo.`);
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPokerGame);
} else {
  initPokerGame();
}
