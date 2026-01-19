/**
 * Poker Game Logic
 * Complete game integration with UI
 */

// Import bot storage
import { 
  initializeBots, 
  getRandomBots,
  isBotsInitialized 
} from './storage/botStorage.js';

// Import core modules
import { Player } from './core/player.js';
import { PokerGame, GAME_STATE, ACTIONS } from './core/gameLogic.js';
import { evaluateHand, determineWinners } from './core/handEvaluator.js';
import { botActionWithDelay } from './bot/botAI.js';
import { GameUI } from './ui/gameUI.js';

// ============================================
// GAME INSTANCE
// ============================================

let pokerGame = null;
let gameUI = null;
let currentUser = null;

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
  
  // Initialize poker game
  initializePokerGame();
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
  
  // Save current user
  currentUser = user;
  
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
  
  if (btnFold) btnFold.addEventListener('click', () => handleAction(ACTIONS.FOLD));
  if (btnCheck) btnCheck.addEventListener('click', () => handleAction(ACTIONS.CHECK));
  if (btnCall) btnCall.addEventListener('click', () => handleAction(ACTIONS.CALL));
  if (btnRaise) btnRaise.addEventListener('click', () => handleAction(ACTIONS.RAISE));
  if (btnAllin) btnAllin.addEventListener('click', () => handleAction(ACTIONS.ALL_IN));
  
  // Bet slider
  const betSlider = document.querySelector('.bet-slider');
  const betValue = document.getElementById('bet-value');
  
  if (betSlider && betValue) {
    betSlider.addEventListener('input', (e) => {
      betValue.textContent = e.target.value;
    });
  }
  
  // Log modal buttons
  const btnLog = document.getElementById('btnLog');
  const logModal = document.getElementById('logModal');
  const closeLogModal = document.getElementById('closeLogModal');
  const btnCloseLog = document.getElementById('btnCloseLog');
  const btnClearLog = document.getElementById('btnClearLog');
  
  if (btnLog) {
    btnLog.addEventListener('click', () => {
      if (logModal) {
        logModal.style.display = 'flex';
        if (gameUI) gameUI.updateLogDisplay();
      }
    });
  }
  
  if (closeLogModal) {
    closeLogModal.addEventListener('click', () => {
      if (logModal) logModal.style.display = 'none';
    });
  }
  
  if (btnCloseLog) {
    btnCloseLog.addEventListener('click', () => {
      if (logModal) logModal.style.display = 'none';
    });
  }
  
  if (btnClearLog) {
    btnClearLog.addEventListener('click', () => {
      if (gameUI && confirm('Bạn có chắc muốn xóa toàn bộ lịch sử?')) {
        gameUI.clearLogHistory();
      }
    });
  }
  
  // Close modal when clicking outside
  if (logModal) {
    logModal.addEventListener('click', (e) => {
      if (e.target === logModal) {
        logModal.style.display = 'none';
      }
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
async function handleAction(action) {
  if (!pokerGame || !gameUI) return;
  
  const currentPlayer = pokerGame.getCurrentPlayer();
  
  // Ensure it's player's turn
  if (currentPlayer.id !== 'player') {
    console.warn('Not your turn!');
    return;
  }
  
  let amount = 0;
  
  // Get raise amount if needed
  if (action === ACTIONS.RAISE) {
    const betSlider = document.querySelector('.bet-slider');
    amount = betSlider ? parseInt(betSlider.value) : pokerGame.minRaise;
  }
  
  // Apply action
  const success = pokerGame.applyAction(currentPlayer, action, amount);
  
  if (success) {
    // Update UI
    gameUI.updatePlayerSeat(currentPlayer, 5);
    gameUI.updatePot(pokerGame.pot);
    gameUI.disableActionButtons();
    
    // Move to next player
    pokerGame.nextPlayer();
    
    // Continue game loop
    await gameLoop();
  }
}

// ============================================
// POKER GAME INITIALIZATION
// ============================================

/**
 * Initialize poker game with players
 */
function initializePokerGame() {
  if (!currentUser || selectedBots.length === 0) {
    console.error('Cannot initialize game: missing user or bots');
    return;
  }
  
  console.log('\n🎮 === Initializing Poker Game ===');
  
  // Create players array
  const players = [];
  
  // Add human player (always at position 4 = seat 5)
  const humanPlayer = new Player(
    'player',
    shortenName(currentUser.username),
    currentUser.balance,
    false,
    null
  );
  humanPlayer.position = 4;
  humanPlayer.seatNumber = 5;
  players.push(humanPlayer);
  
  // Add bot players
  const botSeats = [1, 2, 3, 4, 6, 7, 8]; // Available seats
  selectedBots.forEach((bot, index) => {
    if (index >= botSeats.length) return;
    
    const seatNumber = botSeats[index];
    const botPlayer = new Player(
      bot.id,
      bot.name,
      bot.balance,
      true,
      bot
    );
    botPlayer.position = index < 4 ? index : index + 1; // Skip position 4 (human)
    botPlayer.seatNumber = seatNumber;
    players.push(botPlayer);
  });
  
  // Sort players by position
  players.sort((a, b) => a.position - b.position);
  
  console.log(`Players: ${players.length}`);
  players.forEach(p => console.log(`  - ${p.name} (Seat ${p.seatNumber}): $${p.chips}`));
  
  // Create game instance
  pokerGame = new PokerGame(players, {
    smallBlind: 5,
    bigBlind: 10
  });
  
  // Create UI controller
  gameUI = new GameUI(pokerGame);
  
  // Setup event callbacks
  pokerGame.onStateChange = (state, gameState) => {
    console.log(`\n📍 State changed: ${state}`);
    gameUI.updateRoundName(state);
    gameUI.updateCommunityCards(gameState.communityCards);
    
    // Show commentary for state changes
    let commentary = '';
    switch(state) {
      case GAME_STATE.PREFLOP:
        commentary = 'Pre-Flop: Bắt đầu vòng cược đầu tiên';
        break;
      case GAME_STATE.FLOP:
        commentary = 'Flop: 3 lá bài chung đã được mở! 🃏';
        break;
      case GAME_STATE.TURN:
        commentary = 'Turn: Lá bài thứ 4 đã được mở';
        break;
      case GAME_STATE.RIVER:
        commentary = 'River: Lá bài cuối cùng! Quyết định số phận 🎯';
        break;
      case GAME_STATE.SHOWDOWN:
        commentary = 'Showdown: Đang so bài để tìm người chiến thắng...';
        break;
    }
    
    if (commentary) {
      gameUI.showCommentary(commentary, state === GAME_STATE.RIVER);
    }
  };
  
  pokerGame.onPotUpdate = (pot) => {
    gameUI.updatePot(pot);
  };
  
  pokerGame.onPlayerAction = (player, action, amount) => {
    gameUI.showActionMessage(player.name, action, amount);
    gameUI.updatePlayerSeat(player, player.seatNumber);
    
    // Show commentary
    let commentary = '';
    const isPlayer = player.id === 'player';
    const playerDisplay = isPlayer ? 'Bạn' : player.name;
    
    switch(action) {
      case ACTIONS.FOLD:
        commentary = `${playerDisplay} ${isPlayer ? 'đã' : 'vừa'} quyết định bỏ bài (fold)`;
        break;
      case ACTIONS.CHECK:
        commentary = `${playerDisplay} ${isPlayer ? 'đã' : 'vừa'} check`;
        break;
      case ACTIONS.CALL:
        commentary = `${playerDisplay} ${isPlayer ? 'đã' : 'vừa'} call $${amount}`;
        break;
      case ACTIONS.RAISE:
        commentary = `${playerDisplay} ${isPlayer ? 'đã' : 'vừa'} raise lên $${amount}`;
        break;
      case ACTIONS.ALL_IN:
        commentary = `${playerDisplay} ${isPlayer ? 'đã' : 'vừa'} ALL-IN với $${amount}! 🔥`;
        break;
      default:
        commentary = `${playerDisplay} ${isPlayer ? 'đã' : 'vừa'} thực hiện ${action}`;
    }
    
    const highlight = action === ACTIONS.ALL_IN || action === ACTIONS.RAISE;
    gameUI.showCommentary(commentary, highlight);
  };
  
  console.log('✅ Game initialized successfully');
  
  // Start first hand after a delay
  setTimeout(() => {
    startNewHand();
  }, 1000);
}

/**
 * Start new hand
 */
async function startNewHand() {
  if (!pokerGame || !gameUI) return;
  
  console.log('\n🃏 === Starting New Hand ===');
  
  // Reset UI
  gameUI.resetForNewHand();
  
  // Show commentary
  gameUI.showCommentary('Ván mới bắt đầu! Đang chia bài...');
  
  // Start game
  const success = pokerGame.startNewHand();
  
  if (!success) {
    console.error('Failed to start hand');
    return;
  }
  
  // Update all player seats
  pokerGame.activePlayers.forEach(player => {
    gameUI.updatePlayerSeat(player, player.seatNumber);
  });
  
  // Update community cards
  gameUI.updateCommunityCards(pokerGame.communityCards);
  gameUI.updatePot(pokerGame.pot);
  gameUI.updateRoundName(pokerGame.state);
  
  // Start game loop
  await gameLoop();
}

/**
 * Main game loop
 */
async function gameLoop() {
  if (!pokerGame || !gameUI) return;
  
  // Check if betting round is complete
  if (pokerGame.isBettingRoundComplete()) {
    console.log('✅ Betting round complete');
    
    // Check if game should end early (only 1 player left)
    if (pokerGame.shouldEndEarly()) {
      await handleEarlyEnd();
      return;
    }
    
    // Advance to next state
    if (pokerGame.state === GAME_STATE.RIVER) {
      // Go to showdown
      pokerGame.advanceState();
      await handleShowdown();
      return;
    } else if (pokerGame.state !== GAME_STATE.SHOWDOWN) {
      // Deal next cards
      pokerGame.advanceState();
      
      // Update UI
      gameUI.updateCommunityCards(pokerGame.communityCards);
      gameUI.clearPlayerActions();
      
      // Start next betting round
      setTimeout(() => gameLoop(), 1000);
      return;
    }
  }
  
  // Get current player
  const currentPlayer = pokerGame.getCurrentPlayer();
  
  if (!currentPlayer || !currentPlayer.canAct()) {
    pokerGame.nextPlayer();
    setTimeout(() => gameLoop(), 100);
    return;
  }
  
  // Highlight current player
  gameUI.highlightCurrentPlayer(currentPlayer.seatNumber);
  
  // Get valid actions
  const validActions = pokerGame.getValidActions(currentPlayer);
  
  if (validActions.length === 0) {
    pokerGame.nextPlayer();
    setTimeout(() => gameLoop(), 100);
    return;
  }
  
  // If current player is human
  if (!currentPlayer.isBot) {
    // Enable action buttons
    const callAmount = pokerGame.currentBet - currentPlayer.currentBet;
    gameUI.updateActionButtons(validActions, callAmount);
    
    // Wait for player action (handled by handleAction)
    return;
  }
  
  // If current player is bot
  const decision = await botActionWithDelay(
    currentPlayer,
    validActions,
    {
      currentBet: pokerGame.currentBet,
      minRaise: pokerGame.minRaise,
      pot: pokerGame.pot,
      communityCards: pokerGame.communityCards
    }
  );
  
  // Apply bot action
  pokerGame.applyAction(currentPlayer, decision.action, decision.amount);
  
  // Update UI
  gameUI.updatePlayerSeat(currentPlayer, currentPlayer.seatNumber);
  gameUI.updatePot(pokerGame.pot);
  
  // Move to next player
  pokerGame.nextPlayer();
  
  // Continue loop
  setTimeout(() => gameLoop(), 500);
}

/**
 * Handle early end (only 1 player left)
 */
async function handleEarlyEnd() {
  const winner = pokerGame.getEarlyWinner();
  
  if (winner) {
    console.log(`\n🏆 ${winner.name} wins by default (others folded)`);
    pokerGame.awardPot(winner);
    
    gameUI.showWinnerAnnouncement(winner, pokerGame.pot, 'Others folded');
    gameUI.updatePlayerSeat(winner, winner.seatNumber);
    
    // Show commentary
    const isPlayer = winner.id === 'player';
    const playerDisplay = isPlayer ? 'Bạn' : winner.name;
    const winMessage = `🏆 ${playerDisplay} ${isPlayer ? 'đã' : 'vừa'} thắng vì tất cả người khác đã fold!`;
    gameUI.showCommentary(winMessage, true);
  }
  
  // Wait before starting new hand
  setTimeout(() => {
    startNewHand();
  }, 3000);
}

/**
 * Handle showdown
 */
async function handleShowdown() {
  console.log('\n🃏 === SHOWDOWN ===');
  
  // Evaluate hands
  const playerHands = [];
  
  pokerGame.activePlayers.forEach(player => {
    if (player.isInHand()) {
      const hand = evaluateHand(player.cards, pokerGame.communityCards);
      player.handRank = hand.rank;
      player.handDescription = hand.description;
      
      playerHands.push({ player, hand });
      
      console.log(`${player.name}: ${hand.description}`);
    }
  });
  
  // Determine winners
  const winners = determineWinners(playerHands);
  
  // Split pot if multiple winners
  const potShare = Math.floor(pokerGame.pot / winners.length);
  
  winners.forEach(({ player, hand }) => {
    pokerGame.awardPot(player);
    gameUI.showWinnerAnnouncement(player, potShare, hand.description);
    gameUI.updatePlayerSeat(player, player.seatNumber);
    
    // Show winner commentary
    const isPlayer = player.id === 'player';
    const playerDisplay = isPlayer ? 'Bạn' : player.name;
    const winMessage = `🏆 ${playerDisplay} ${isPlayer ? 'đã' : 'vừa'} thắng $${potShare} với ${hand.description}!`;
    gameUI.showCommentary(winMessage, true);
  });
  
  // Wait before starting new hand
  setTimeout(() => {
    startNewHand();
  }, 5000);
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPokerGame);
} else {
  initPokerGame();
}
