/**
 * Game Logic - State Machine và Game Loop
 * Texas Hold'em Poker Game Management
 */

import { Deck } from './deck.js';
import { Player, PLAYER_STATUS } from './player.js';

// Game States
export const GAME_STATE = {
  WAITING: 'waiting',       // Chờ bắt đầu
  PREFLOP: 'preflop',       // Trước khi chia bài chung
  FLOP: 'flop',             // Đã chia 3 lá chung
  TURN: 'turn',             // Đã chia lá thứ 4
  RIVER: 'river',           // Đã chia lá thứ 5
  SHOWDOWN: 'showdown',     // So bài
  ENDED: 'ended'            // Kết thúc ván
};

// Actions
export const ACTIONS = {
  FOLD: 'fold',
  CHECK: 'check',
  CALL: 'call',
  RAISE: 'raise',
  ALLIN: 'allin'
};

export class PokerGame {
  /**
   * @param {Array<Player>} players - Danh sách người chơi
   * @param {Object} config - Cấu hình game
   */
  constructor(players, config = {}) {
    // Players
    this.players = players;
    this.activePlayers = [];
    
    // Game config
    this.smallBlind = config.smallBlind || 5;
    this.bigBlind = config.bigBlind || 10;
    this.minRaise = this.bigBlind;
    
    // Game state
    this.state = GAME_STATE.WAITING;
    this.deck = new Deck();
    this.communityCards = [];
    this.pot = 0;
    this.sidePots = [];
    
    // Betting state
    this.currentBet = 0;
    this.lastRaiseAmount = 0;
    this.currentPlayerIndex = 0;
    this.dealerIndex = 0;
    this.actionCount = 0;
    
    // History
    this.actionHistory = [];
    this.handNumber = 0;
    
    // Callbacks
    this.onStateChange = null;
    this.onPlayerAction = null;
    this.onPotUpdate = null;
  }

  // ============================================
  // GAME INITIALIZATION
  // ============================================

  /**
   * Bắt đầu ván mới
   */
  startNewHand() {
    console.log(`\n🎮 === Starting Hand #${this.handNumber + 1} ===`);
    
    this.handNumber++;
    this.actionHistory = [];
    this.communityCards = [];
    this.pot = 0;
    this.sidePots = [];
    this.currentBet = 0;
    this.lastRaiseAmount = 0;
    this.actionCount = 0;
    
    // Reset deck
    this.deck.reset();
    this.deck.shuffle();
    
    // Reset players
    this.players.forEach(player => player.resetForNewHand());
    
    // Filter active players (có chip)
    this.activePlayers = this.players.filter(p => p.chips > 0);
    
    if (this.activePlayers.length < 2) {
      console.error('Not enough players to start!');
      return false;
    }
    
    // Move dealer button
    this.dealerIndex = (this.dealerIndex + 1) % this.activePlayers.length;
    
    // Post blinds
    this.postBlinds();
    
    // Deal cards
    this.dealHoleCards();
    
    // Start pre-flop
    this.state = GAME_STATE.PREFLOP;
    this.currentPlayerIndex = this.getFirstPlayerIndex();
    
    this.emitStateChange();
    
    console.log(`Dealer: ${this.activePlayers[this.dealerIndex].name}`);
    console.log(`Pot: $${this.pot}`);
    
    return true;
  }

  /**
   * Post blinds
   */
  postBlinds() {
    const sbIndex = (this.dealerIndex + 1) % this.activePlayers.length;
    const bbIndex = (this.dealerIndex + 2) % this.activePlayers.length;
    
    const sbPlayer = this.activePlayers[sbIndex];
    const bbPlayer = this.activePlayers[bbIndex];
    
    // Small blind
    const sbAmount = sbPlayer.bet(this.smallBlind);
    this.pot += sbAmount;
    sbPlayer.lastAction = 'small blind';
    
    console.log(`${sbPlayer.name} posts Small Blind: $${sbAmount}`);
    
    // Big blind
    const bbAmount = bbPlayer.bet(this.bigBlind);
    this.pot += bbAmount;
    this.currentBet = this.bigBlind;
    bbPlayer.lastAction = 'big blind';
    
    console.log(`${bbPlayer.name} posts Big Blind: $${bbAmount}`);
  }

  /**
   * Deal hole cards (2 lá cho mỗi người)
   */
  dealHoleCards() {
    for (let i = 0; i < 2; i++) {
      this.activePlayers.forEach(player => {
        const card = this.deck.draw();
        player.receiveCard(card);
      });
    }
    
    console.log('Dealt hole cards to all players');
  }

  /**
   * Get first player index (sau big blind)
   */
  getFirstPlayerIndex() {
    if (this.state === GAME_STATE.PREFLOP) {
      // Pre-flop: bắt đầu từ sau big blind
      return (this.dealerIndex + 3) % this.activePlayers.length;
    } else {
      // Post-flop: bắt đầu từ sau dealer
      return (this.dealerIndex + 1) % this.activePlayers.length;
    }
  }

  // ============================================
  // TURN MANAGEMENT
  // ============================================

  /**
   * Get current player
   * @returns {Player}
   */
  getCurrentPlayer() {
    return this.activePlayers[this.currentPlayerIndex];
  }

  /**
   * Move to next player
   */
  nextPlayer() {
    let attempts = 0;
    const maxAttempts = this.activePlayers.length;
    
    do {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.activePlayers.length;
      attempts++;
      
      if (attempts >= maxAttempts) {
        console.warn('No valid player found in nextPlayer');
        break;
      }
    } while (!this.getCurrentPlayer().canAct());
  }

  /**
   * Get valid actions for a player
   * @param {Player} player
   * @returns {Array<string>}
   */
  getValidActions(player) {
    if (!player.canAct()) {
      return [];
    }
    
    const actions = [];
    const callAmount = this.currentBet - player.currentBet;
    
    // Check if player can check
    if (callAmount === 0) {
      actions.push(ACTIONS.CHECK);
    } else {
      // Can call or fold
      actions.push(ACTIONS.FOLD);
      
      if (player.chips >= callAmount) {
        actions.push(ACTIONS.CALL);
      }
    }
    
    // Can raise if has enough chips
    const minRaiseTotal = this.currentBet + this.minRaise;
    if (player.chips + player.currentBet > minRaiseTotal) {
      actions.push(ACTIONS.RAISE);
    }
    
    // Can always all-in if has chips
    if (player.chips > 0) {
      actions.push(ACTIONS.ALLIN);
    }
    
    return actions;
  }

  // ============================================
  // ACTION HANDLING
  // ============================================

  /**
   * Apply player action
   * @param {Player} player
   * @param {string} action
   * @param {number} amount - For raise
   * @returns {boolean} Success
   */
  applyAction(player, action, amount = 0) {
    console.log(`${player.name} -> ${action}${amount ? ' $' + amount : ''}`);
    
    let success = false;
    
    switch (action) {
      case ACTIONS.FOLD:
        player.fold();
        success = true;
        break;
      
      case ACTIONS.CHECK:
        player.check();
        success = true;
        break;
      
      case ACTIONS.CALL: {
        const callAmount = this.currentBet - player.currentBet;
        const actualBet = player.bet(callAmount);
        this.pot += actualBet;
        player.lastAction = 'call';
        success = true;
        break;
      }
      
      case ACTIONS.RAISE: {
        // Calculate total raise amount
        const callAmount = this.currentBet - player.currentBet;
        const raiseAmount = Math.max(amount, this.minRaise);
        const totalBet = callAmount + raiseAmount;
        
        if (player.chips >= totalBet) {
          const actualBet = player.bet(totalBet);
          this.pot += actualBet;
          this.currentBet = player.currentBet;
          this.lastRaiseAmount = raiseAmount;
          player.lastAction = 'raise';
          this.actionCount = 0; // Reset action count on raise
          success = true;
        }
        break;
      }
      
      case ACTIONS.ALLIN: {
        const allInAmount = player.allIn();
        this.pot += allInAmount;
        
        // If all-in is greater than current bet, it's a raise
        if (player.currentBet > this.currentBet) {
          this.currentBet = player.currentBet;
          this.actionCount = 0;
        }
        
        success = true;
        break;
      }
    }
    
    if (success) {
      this.actionHistory.push({
        player: player.name,
        action: action,
        amount: amount,
        pot: this.pot,
        state: this.state
      });
      
      this.actionCount++;
      this.emitPlayerAction(player, action, amount);
      this.emitPotUpdate();
    }
    
    return success;
  }

  // ============================================
  // BETTING ROUND MANAGEMENT
  // ============================================

  /**
   * Check if betting round is complete
   * @returns {boolean}
   */
  isBettingRoundComplete() {
    // Count players who can still act
    const activePlayers = this.activePlayers.filter(p => p.canAct());
    
    // If no one can act, round is done
    if (activePlayers.length === 0) {
      return true;
    }
    
    // If only 1 player left (others folded), round is done
    const playersInHand = this.activePlayers.filter(p => p.isInHand());
    if (playersInHand.length === 1) {
      return true;
    }
    
    // Check if all active players have matched current bet
    const allMatched = activePlayers.every(p => 
      p.currentBet === this.currentBet || p.isAllIn()
    );
    
    // Need at least one action from each player
    const minActions = activePlayers.length;
    
    return allMatched && this.actionCount >= minActions;
  }

  /**
   * Reset bets for new betting round
   */
  resetBets() {
    this.currentBet = 0;
    this.lastRaiseAmount = 0;
    this.actionCount = 0;
    this.activePlayers.forEach(p => {
      p.currentBet = 0;
    });
  }

  /**
   * Advance to next state
   */
  advanceState() {
    console.log(`\n--- Advancing from ${this.state} ---`);
    
    this.resetBets();
    
    switch (this.state) {
      case GAME_STATE.PREFLOP:
        // Deal flop (3 cards)
        this.deck.draw(); // Burn card
        for (let i = 0; i < 3; i++) {
          this.communityCards.push(this.deck.draw());
        }
        this.state = GAME_STATE.FLOP;
        console.log('Flop dealt:', this.communityCards.map(c => c.id).join(' '));
        break;
      
      case GAME_STATE.FLOP:
        // Deal turn (1 card)
        this.deck.draw(); // Burn card
        this.communityCards.push(this.deck.draw());
        this.state = GAME_STATE.TURN;
        console.log('Turn dealt:', this.communityCards[3].id);
        break;
      
      case GAME_STATE.TURN:
        // Deal river (1 card)
        this.deck.draw(); // Burn card
        this.communityCards.push(this.deck.draw());
        this.state = GAME_STATE.RIVER;
        console.log('River dealt:', this.communityCards[4].id);
        break;
      
      case GAME_STATE.RIVER:
        this.state = GAME_STATE.SHOWDOWN;
        console.log('Going to showdown');
        break;
      
      case GAME_STATE.SHOWDOWN:
        this.state = GAME_STATE.ENDED;
        break;
    }
    
    // Reset to first player for new round
    if (this.state !== GAME_STATE.SHOWDOWN && this.state !== GAME_STATE.ENDED) {
      this.currentPlayerIndex = this.getFirstPlayerIndex();
    }
    
    this.emitStateChange();
  }

  // ============================================
  // GAME STATUS
  // ============================================

  /**
   * Check if game should end (only 1 player left)
   * @returns {boolean}
   */
  shouldEndEarly() {
    const playersInHand = this.activePlayers.filter(p => p.isInHand());
    return playersInHand.length === 1;
  }

  /**
   * Get winner (when only 1 player left)
   * @returns {Player|null}
   */
  getEarlyWinner() {
    const playersInHand = this.activePlayers.filter(p => p.isInHand());
    return playersInHand.length === 1 ? playersInHand[0] : null;
  }

  /**
   * Award pot to winner
   * @param {Player} winner
   */
  awardPot(winner) {
    console.log(`\n💰 ${winner.name} wins $${this.pot}`);
    winner.addChips(this.pot);
    this.pot = 0;
  }

  // ============================================
  // EVENT EMITTERS
  // ============================================

  emitStateChange() {
    if (this.onStateChange) {
      this.onStateChange(this.state, this.getGameState());
    }
  }

  emitPlayerAction(player, action, amount) {
    if (this.onPlayerAction) {
      this.onPlayerAction(player, action, amount);
    }
  }

  emitPotUpdate() {
    if (this.onPotUpdate) {
      this.onPotUpdate(this.pot);
    }
  }

  // ============================================
  // GETTERS
  // ============================================

  /**
   * Get full game state for UI
   * @returns {Object}
   */
  getGameState() {
    return {
      state: this.state,
      handNumber: this.handNumber,
      pot: this.pot,
      currentBet: this.currentBet,
      communityCards: this.communityCards,
      currentPlayerIndex: this.currentPlayerIndex,
      currentPlayer: this.getCurrentPlayer()?.getDisplayInfo(),
      players: this.activePlayers.map(p => p.getDisplayInfo()),
      dealerIndex: this.dealerIndex,
      actionHistory: this.actionHistory
    };
  }
}
