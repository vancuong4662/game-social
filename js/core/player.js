/**
 * Player Module - Model người chơi
 * Chỉ giữ state, không chứa logic
 */

export const PLAYER_STATUS = {
  ACTIVE: 'active',      // Đang chơi bình thường
  FOLD: 'fold',          // Đã bỏ bài
  ALLIN: 'allin',        // All-in
  OUT: 'out',            // Hết tiền, không thể chơi tiếp
  WAITING: 'waiting'     // Chờ ván mới
};

export class Player {
  /**
   * @param {string} id - ID người chơi
   * @param {string} name - Tên hiển thị
   * @param {number} chips - Số chip ban đầu
   * @param {boolean} isBot - Có phải bot không
   * @param {Object} botData - Data bot (nếu là bot)
   */
  constructor(id, name, chips, isBot = false, botData = null) {
    this.id = id;
    this.name = name;
    this.chips = chips;
    this.isBot = isBot;
    this.botData = botData; // Lưu personality, behaviorWeights nếu là bot
    
    // Game state
    this.cards = [];           // 2 lá bài tẩy
    this.currentBet = 0;       // Số tiền đã bet trong vòng hiện tại
    this.totalBet = 0;         // Tổng số tiền đã bet trong ván
    this.status = PLAYER_STATUS.ACTIVE;
    
    // Position
    this.position = null;      // Vị trí trên bàn (0-8)
    this.seatNumber = null;    // Số ghế (1-8, bỏ 5 là player chính)
    
    // Metadata
    this.lastAction = null;    // Action cuối cùng
    this.handRank = null;      // Rank của bộ bài (sau khi evaluate)
    this.handDescription = ''; // Mô tả bộ bài
  }

  /**
   * Reset trạng thái cho ván mới
   */
  resetForNewHand() {
    this.cards = [];
    this.currentBet = 0;
    this.totalBet = 0;
    this.lastAction = null;
    this.handRank = null;
    this.handDescription = '';
    
    if (this.chips > 0) {
      this.status = PLAYER_STATUS.ACTIVE;
    } else {
      this.status = PLAYER_STATUS.OUT;
    }
  }

  /**
   * Đặt cược
   * @param {number} amount - Số tiền cược
   * @returns {number} Số tiền thực sự đã cược
   */
  bet(amount) {
    const actualBet = Math.min(amount, this.chips);
    this.chips -= actualBet;
    this.currentBet += actualBet;
    this.totalBet += actualBet;
    
    // Nếu hết chip thì all-in
    if (this.chips === 0) {
      this.status = PLAYER_STATUS.ALLIN;
    }
    
    return actualBet;
  }

  /**
   * Nhận chip (khi thắng pot)
   * @param {number} amount
   */
  addChips(amount) {
    this.chips += amount;
  }

  /**
   * Fold bài
   */
  fold() {
    this.status = PLAYER_STATUS.FOLD;
    this.lastAction = 'fold';
  }

  /**
   * Check
   */
  check() {
    this.lastAction = 'check';
  }

  /**
   * Call
   * @param {number} amount
   */
  call(amount) {
    this.bet(amount);
    this.lastAction = 'call';
  }

  /**
   * Raise
   * @param {number} amount
   */
  raise(amount) {
    this.bet(amount);
    this.lastAction = 'raise';
  }

  /**
   * All-in
   */
  allIn() {
    const allInAmount = this.chips;
    this.bet(allInAmount);
    this.status = PLAYER_STATUS.ALLIN;
    this.lastAction = 'allin';
    return allInAmount;
  }

  /**
   * Nhận lá bài
   * @param {Object} card
   */
  receiveCard(card) {
    this.cards.push(card);
  }

  /**
   * Nhận nhiều lá bài
   * @param {Array} cards
   */
  receiveCards(cards) {
    this.cards.push(...cards);
  }

  /**
   * Clear lá bài
   */
  clearCards() {
    this.cards = [];
  }

  /**
   * Kiểm tra có thể hành động không
   * @returns {boolean}
   */
  canAct() {
    return this.status === PLAYER_STATUS.ACTIVE && this.chips > 0;
  }

  /**
   * Kiểm tra đã fold chưa
   * @returns {boolean}
   */
  hasFolded() {
    return this.status === PLAYER_STATUS.FOLD;
  }

  /**
   * Kiểm tra đã all-in chưa
   * @returns {boolean}
   */
  isAllIn() {
    return this.status === PLAYER_STATUS.ALLIN;
  }

  /**
   * Kiểm tra còn trong game không (chưa fold)
   * @returns {boolean}
   */
  isInHand() {
    return this.status !== PLAYER_STATUS.FOLD && this.status !== PLAYER_STATUS.OUT;
  }

  /**
   * Get display info
   * @returns {Object}
   */
  getDisplayInfo() {
    return {
      id: this.id,
      name: this.name,
      chips: this.chips,
      currentBet: this.currentBet,
      status: this.status,
      lastAction: this.lastAction,
      cardCount: this.cards.length,
      isBot: this.isBot
    };
  }

  /**
   * Clone player (for testing)
   * @returns {Player}
   */
  clone() {
    const cloned = new Player(this.id, this.name, this.chips, this.isBot, this.botData);
    cloned.cards = [...this.cards];
    cloned.currentBet = this.currentBet;
    cloned.totalBet = this.totalBet;
    cloned.status = this.status;
    cloned.position = this.position;
    cloned.seatNumber = this.seatNumber;
    cloned.lastAction = this.lastAction;
    return cloned;
  }
}
