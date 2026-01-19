/**
 * Game UI Controller
 * Tích hợp Game Logic với DOM UI
 */

import { getCardDisplay } from '../core/deck.js';
import { GAME_STATE } from '../core/gameLogic.js';

/**
 * UI Controller class
 */
export class GameUI {
  constructor(game) {
    this.game = game;
    this.animationQueue = [];
    this.isAnimating = false;
  }

  // ============================================
  // PLAYER RENDERING
  // ============================================

  /**
   * Update player UI in seat
   * @param {Player} player
   * @param {number} seatNumber
   */
  updatePlayerSeat(player, seatNumber) {
    const seat = document.querySelector(`.seat-${seatNumber}`);
    if (!seat) return;

    const playerCard = seat.querySelector('.player-card');
    if (!playerCard) return;

    // Update player info
    const nameEl = playerCard.querySelector('.player-name');
    const chipsEl = playerCard.querySelector('.player-chips');
    const actionEl = playerCard.querySelector('.player-action');

    if (nameEl) nameEl.textContent = player.name;
    if (chipsEl) chipsEl.textContent = `$${this.formatNumber(player.chips)}`;
    if (actionEl) {
      actionEl.textContent = player.lastAction || '';
      actionEl.className = 'player-action ' + (player.lastAction || '');
    }

    // Update player status
    playerCard.classList.remove('active', 'folded', 'allin');
    
    if (player.hasFolded()) {
      playerCard.classList.add('folded');
    } else if (player.isAllIn()) {
      playerCard.classList.add('allin');
    } else if (player.canAct()) {
      playerCard.classList.add('active');
    }

    // Update cards visibility
    this.updatePlayerCards(player, seatNumber);
  }

  /**
   * Update player cards
   * @param {Player} player
   * @param {number} seatNumber
   */
  updatePlayerCards(player, seatNumber) {
    const seat = document.querySelector(`.seat-${seatNumber}`);
    if (!seat) return;

    const cardsContainer = seat.querySelector('.player-cards-hand');
    if (!cardsContainer) return;

    // For player (seat 5), show actual cards
    if (seatNumber === 5 && player.cards.length > 0) {
      cardsContainer.innerHTML = player.cards.map(card => `
        <div class="card">
          <span class="card-value">${getCardDisplay(card)}</span>
        </div>
      `).join('');
    } else {
      // For bots, show card backs
      const cardCount = player.cards.length;
      cardsContainer.innerHTML = Array(cardCount).fill(0).map(() => `
        <div class="card card-back">?</div>
      `).join('');
    }
  }

  /**
   * Highlight current player
   * @param {number} seatNumber
   */
  highlightCurrentPlayer(seatNumber) {
    // Remove all highlights
    document.querySelectorAll('.player-card').forEach(card => {
      card.classList.remove('current-turn');
    });

    // Add highlight to current player
    const seat = document.querySelector(`.seat-${seatNumber}`);
    if (seat) {
      const playerCard = seat.querySelector('.player-card');
      if (playerCard) {
        playerCard.classList.add('current-turn');
      }
    }
  }

  // ============================================
  // COMMUNITY CARDS
  // ============================================

  /**
   * Update community cards
   * @param {Array} cards
   */
  updateCommunityCards(cards) {
    const container = document.querySelector('.community-cards');
    if (!container) return;

    const placeholders = container.querySelectorAll('.card-placeholder');
    
    cards.forEach((card, index) => {
      if (placeholders[index]) {
        placeholders[index].textContent = getCardDisplay(card);
        placeholders[index].classList.add('revealed');
      }
    });
  }

  /**
   * Reset community cards
   */
  resetCommunityCards() {
    const container = document.querySelector('.community-cards');
    if (!container) return;

    const placeholders = container.querySelectorAll('.card-placeholder');
    placeholders.forEach(placeholder => {
      placeholder.textContent = '?';
      placeholder.classList.remove('revealed');
    });
  }

  // ============================================
  // POT & GAME INFO
  // ============================================

  /**
   * Update pot display
   * @param {number} amount
   */
  updatePot(amount) {
    const potAmount = document.querySelector('.pot-amount');
    if (potAmount) {
      potAmount.textContent = `$${this.formatNumber(amount)}`;
    }
  }

  /**
   * Update round name
   * @param {string} state
   */
  updateRoundName(state) {
    const roundName = document.getElementById('round-name');
    if (!roundName) return;

    const stateNames = {
      [GAME_STATE.WAITING]: 'Chờ bắt đầu',
      [GAME_STATE.PREFLOP]: 'Pre-Flop',
      [GAME_STATE.FLOP]: 'Flop',
      [GAME_STATE.TURN]: 'Turn',
      [GAME_STATE.RIVER]: 'River',
      [GAME_STATE.SHOWDOWN]: 'Showdown',
      [GAME_STATE.ENDED]: 'Kết thúc'
    };

    roundName.textContent = stateNames[state] || state;
  }

  // ============================================
  // ACTION BUTTONS
  // ============================================

  /**
   * Update action buttons based on valid actions
   * @param {Array<string>} validActions
   * @param {number} callAmount
   */
  updateActionButtons(validActions, callAmount = 0) {
    const btnFold = document.querySelector('.btn-fold');
    const btnCheck = document.querySelector('.btn-check');
    const btnCall = document.querySelector('.btn-call');
    const btnRaise = document.querySelector('.btn-raise');
    const btnAllin = document.querySelector('.btn-allin');

    // Disable all first
    [btnFold, btnCheck, btnCall, btnRaise, btnAllin].forEach(btn => {
      if (btn) btn.disabled = true;
    });

    // Enable valid actions
    validActions.forEach(action => {
      switch (action) {
        case 'fold':
          if (btnFold) btnFold.disabled = false;
          break;
        case 'check':
          if (btnCheck) btnCheck.disabled = false;
          break;
        case 'call':
          if (btnCall) {
            btnCall.disabled = false;
            const btnText = btnCall.querySelector('.btn-text');
            if (btnText) {
              btnText.textContent = `Call $${this.formatNumber(callAmount)}`;
            }
          }
          break;
        case 'raise':
          if (btnRaise) btnRaise.disabled = false;
          break;
        case 'allin':
          if (btnAllin) btnAllin.disabled = false;
          break;
      }
    });
  }

  /**
   * Disable all action buttons
   */
  disableActionButtons() {
    document.querySelectorAll('.btn-action').forEach(btn => {
      btn.disabled = true;
    });
  }

  // ============================================
  // ANIMATIONS
  // ============================================

  /**
   * Show action message
   * @param {string} playerName
   * @param {string} action
   * @param {number} amount
   */
  showActionMessage(playerName, action, amount = 0) {
    console.log(`💬 ${playerName}: ${action}${amount ? ' $' + amount : ''}`);
    
    // TODO: Add visual notification in UI
    // Could create a toast/notification element
  }

  /**
   * Show winner announcement
   * @param {Player} winner
   * @param {number} amount
   * @param {string} handDescription
   */
  showWinnerAnnouncement(winner, amount, handDescription) {
    console.log(`\n🏆 ${winner.name} wins $${amount}`);
    console.log(`   ${handDescription}`);
    
    // TODO: Add visual winner overlay
    // Show winning hand, pot amount, etc
  }

  // ============================================
  // UTILITIES
  // ============================================

  /**
   * Format number with commas
   * @param {number} num
   * @returns {string}
   */
  formatNumber(num) {
    return num.toLocaleString('en-US');
  }

  /**
   * Clear all player actions
   */
  clearPlayerActions() {
    document.querySelectorAll('.player-action').forEach(el => {
      el.textContent = '';
      el.className = 'player-action';
    });
  }

  /**
   * Reset UI for new hand
   */
  resetForNewHand() {
    this.resetCommunityCards();
    this.updatePot(0);
    this.clearPlayerActions();
    this.disableActionButtons();
    
    // Remove all highlights
    document.querySelectorAll('.player-card').forEach(card => {
      card.classList.remove('current-turn', 'folded', 'allin');
    });
  }
}
