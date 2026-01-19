/**
 * Deck Module - Bộ bài 52 lá
 * Texas Hold'em standard deck
 */

export class Deck {
  constructor() {
    this.cards = [];
    this.reset();
  }

  /**
   * Reset deck về 52 lá ban đầu
   */
  reset() {
    this.cards = [];
    const suits = ['H', 'D', 'C', 'S']; // Hearts, Diamonds, Clubs, Spades
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    for (let suit of suits) {
      for (let value of values) {
        this.cards.push({
          value: value,
          suit: suit,
          id: value + suit
        });
      }
    }
  }

  /**
   * Shuffle bộ bài (Fisher-Yates algorithm)
   */
  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  /**
   * Rút 1 lá bài từ đỉnh deck
   * @returns {Object|null} Card object hoặc null nếu hết bài
   */
  draw() {
    if (this.cards.length === 0) {
      console.warn('Deck is empty!');
      return null;
    }
    return this.cards.pop();
  }

  /**
   * Rút nhiều lá bài
   * @param {number} count - Số lượng lá cần rút
   * @returns {Array} Mảng các lá bài
   */
  drawMultiple(count) {
    const drawn = [];
    for (let i = 0; i < count; i++) {
      const card = this.draw();
      if (card) {
        drawn.push(card);
      }
    }
    return drawn;
  }

  /**
   * Số lá bài còn lại
   * @returns {number}
   */
  remaining() {
    return this.cards.length;
  }

  /**
   * Kiểm tra deck có còn bài không
   * @returns {boolean}
   */
  isEmpty() {
    return this.cards.length === 0;
  }
}

// Helper: Get card display name
export function getCardDisplay(card) {
  if (!card) return '?';
  
  const suitSymbols = {
    'H': '♥',
    'D': '♦',
    'C': '♣',
    'S': '♠'
  };
  
  return card.value + suitSymbols[card.suit];
}

// Helper: Get card numeric value for comparison
export function getCardValue(card) {
  const valueMap = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
    '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };
  return valueMap[card.value] || 0;
}
