/**
 * Hand Evaluator - So bài Poker Texas Hold'em
 * Evaluate và compare poker hands theo luật chuẩn
 */

import { getCardValue } from './deck.js';

// Hand Rankings (cao → thấp)
export const HAND_RANK = {
  ROYAL_FLUSH: 10,
  STRAIGHT_FLUSH: 9,
  FOUR_OF_KIND: 8,
  FULL_HOUSE: 7,
  FLUSH: 6,
  STRAIGHT: 5,
  THREE_OF_KIND: 4,
  TWO_PAIR: 3,
  ONE_PAIR: 2,
  HIGH_CARD: 1
};

export const HAND_NAME = {
  10: 'Royal Flush',
  9: 'Straight Flush',
  8: 'Four of a Kind',
  7: 'Full House',
  6: 'Flush',
  5: 'Straight',
  4: 'Three of a Kind',
  3: 'Two Pair',
  2: 'One Pair',
  1: 'High Card'
};

/**
 * Evaluate best hand from 7 cards (2 hole + 5 community)
 * @param {Array} holeCards - 2 lá bài tẩy
 * @param {Array} communityCards - 5 lá bài chung
 * @returns {Object} { rank, cards, description, values }
 */
export function evaluateHand(holeCards, communityCards) {
  const allCards = [...holeCards, ...communityCards];
  
  if (allCards.length < 5) {
    return {
      rank: 0,
      cards: [],
      description: 'Insufficient cards',
      values: []
    };
  }
  
  // Tìm best 5 cards từ 7 cards
  const bestHand = findBestHand(allCards);
  
  return bestHand;
}

/**
 * Tìm best 5-card hand từ array of cards
 * @param {Array} cards - Tối thiểu 5 lá
 * @returns {Object}
 */
function findBestHand(cards) {
  if (cards.length < 5) {
    return { rank: 0, cards: [], description: 'Not enough cards', values: [] };
  }
  
  // Nếu có đúng 5 lá, evaluate trực tiếp
  if (cards.length === 5) {
    return evaluateFiveCards(cards);
  }
  
  // Nếu có 6 hoặc 7 lá, thử tất cả combinations
  const combinations = getCombinations(cards, 5);
  let bestHand = null;
  
  for (const combo of combinations) {
    const hand = evaluateFiveCards(combo);
    
    if (!bestHand || compareHands(hand, bestHand) > 0) {
      bestHand = hand;
    }
  }
  
  return bestHand;
}

/**
 * Evaluate đúng 5 cards
 * @param {Array} cards
 * @returns {Object}
 */
function evaluateFiveCards(cards) {
  // Sort cards by value (high to low)
  const sorted = [...cards].sort((a, b) => getCardValue(b) - getCardValue(a));
  
  // Check các loại bài từ cao xuống thấp
  const royalFlush = checkRoyalFlush(sorted);
  if (royalFlush) return royalFlush;
  
  const straightFlush = checkStraightFlush(sorted);
  if (straightFlush) return straightFlush;
  
  const fourOfKind = checkFourOfKind(sorted);
  if (fourOfKind) return fourOfKind;
  
  const fullHouse = checkFullHouse(sorted);
  if (fullHouse) return fullHouse;
  
  const flush = checkFlush(sorted);
  if (flush) return flush;
  
  const straight = checkStraight(sorted);
  if (straight) return straight;
  
  const threeOfKind = checkThreeOfKind(sorted);
  if (threeOfKind) return threeOfKind;
  
  const twoPair = checkTwoPair(sorted);
  if (twoPair) return twoPair;
  
  const onePair = checkOnePair(sorted);
  if (onePair) return onePair;
  
  return checkHighCard(sorted);
}

// ============================================
// HAND CHECKERS
// ============================================

function checkRoyalFlush(cards) {
  const flush = isFlush(cards);
  if (!flush) return null;
  
  const straight = isStraight(cards);
  if (!straight) return null;
  
  // Check if highest card is Ace
  if (getCardValue(cards[0]) === 14) {
    return {
      rank: HAND_RANK.ROYAL_FLUSH,
      cards: cards,
      description: HAND_NAME[HAND_RANK.ROYAL_FLUSH],
      values: cards.map(c => getCardValue(c))
    };
  }
  
  return null;
}

function checkStraightFlush(cards) {
  const flush = isFlush(cards);
  const straight = isStraight(cards);
  
  if (flush && straight) {
    return {
      rank: HAND_RANK.STRAIGHT_FLUSH,
      cards: cards,
      description: `${HAND_NAME[HAND_RANK.STRAIGHT_FLUSH]} (${cards[0].value}-high)`,
      values: cards.map(c => getCardValue(c))
    };
  }
  
  return null;
}

function checkFourOfKind(cards) {
  const groups = groupByValue(cards);
  const fourGroup = groups.find(g => g.length === 4);
  
  if (fourGroup) {
    const kicker = cards.find(c => getCardValue(c) !== getCardValue(fourGroup[0]));
    
    return {
      rank: HAND_RANK.FOUR_OF_KIND,
      cards: [...fourGroup, kicker],
      description: `${HAND_NAME[HAND_RANK.FOUR_OF_KIND]} (${fourGroup[0].value}s)`,
      values: [
        getCardValue(fourGroup[0]),
        getCardValue(fourGroup[0]),
        getCardValue(fourGroup[0]),
        getCardValue(fourGroup[0]),
        getCardValue(kicker)
      ]
    };
  }
  
  return null;
}

function checkFullHouse(cards) {
  const groups = groupByValue(cards);
  const threeGroup = groups.find(g => g.length === 3);
  const pairGroup = groups.find(g => g.length === 2);
  
  if (threeGroup && pairGroup) {
    return {
      rank: HAND_RANK.FULL_HOUSE,
      cards: [...threeGroup, ...pairGroup],
      description: `${HAND_NAME[HAND_RANK.FULL_HOUSE]} (${threeGroup[0].value}s over ${pairGroup[0].value}s)`,
      values: [
        getCardValue(threeGroup[0]),
        getCardValue(threeGroup[0]),
        getCardValue(threeGroup[0]),
        getCardValue(pairGroup[0]),
        getCardValue(pairGroup[0])
      ]
    };
  }
  
  return null;
}

function checkFlush(cards) {
  if (isFlush(cards)) {
    return {
      rank: HAND_RANK.FLUSH,
      cards: cards,
      description: `${HAND_NAME[HAND_RANK.FLUSH]} (${cards[0].value}-high)`,
      values: cards.map(c => getCardValue(c))
    };
  }
  
  return null;
}

function checkStraight(cards) {
  if (isStraight(cards)) {
    return {
      rank: HAND_RANK.STRAIGHT,
      cards: cards,
      description: `${HAND_NAME[HAND_RANK.STRAIGHT]} (${cards[0].value}-high)`,
      values: cards.map(c => getCardValue(c))
    };
  }
  
  return null;
}

function checkThreeOfKind(cards) {
  const groups = groupByValue(cards);
  const threeGroup = groups.find(g => g.length === 3);
  
  if (threeGroup) {
    const kickers = cards
      .filter(c => getCardValue(c) !== getCardValue(threeGroup[0]))
      .sort((a, b) => getCardValue(b) - getCardValue(a))
      .slice(0, 2);
    
    return {
      rank: HAND_RANK.THREE_OF_KIND,
      cards: [...threeGroup, ...kickers],
      description: `${HAND_NAME[HAND_RANK.THREE_OF_KIND]} (${threeGroup[0].value}s)`,
      values: [
        getCardValue(threeGroup[0]),
        getCardValue(threeGroup[0]),
        getCardValue(threeGroup[0]),
        ...kickers.map(c => getCardValue(c))
      ]
    };
  }
  
  return null;
}

function checkTwoPair(cards) {
  const groups = groupByValue(cards);
  const pairs = groups.filter(g => g.length === 2);
  
  if (pairs.length >= 2) {
    // Sort pairs by value (high to low)
    const sortedPairs = pairs.sort((a, b) => getCardValue(b[0]) - getCardValue(a[0]));
    const pair1 = sortedPairs[0];
    const pair2 = sortedPairs[1];
    
    const kicker = cards.find(c => 
      getCardValue(c) !== getCardValue(pair1[0]) && 
      getCardValue(c) !== getCardValue(pair2[0])
    );
    
    return {
      rank: HAND_RANK.TWO_PAIR,
      cards: [...pair1, ...pair2, kicker],
      description: `${HAND_NAME[HAND_RANK.TWO_PAIR]} (${pair1[0].value}s and ${pair2[0].value}s)`,
      values: [
        getCardValue(pair1[0]),
        getCardValue(pair1[0]),
        getCardValue(pair2[0]),
        getCardValue(pair2[0]),
        getCardValue(kicker)
      ]
    };
  }
  
  return null;
}

function checkOnePair(cards) {
  const groups = groupByValue(cards);
  const pair = groups.find(g => g.length === 2);
  
  if (pair) {
    const kickers = cards
      .filter(c => getCardValue(c) !== getCardValue(pair[0]))
      .sort((a, b) => getCardValue(b) - getCardValue(a))
      .slice(0, 3);
    
    return {
      rank: HAND_RANK.ONE_PAIR,
      cards: [...pair, ...kickers],
      description: `${HAND_NAME[HAND_RANK.ONE_PAIR]} (${pair[0].value}s)`,
      values: [
        getCardValue(pair[0]),
        getCardValue(pair[0]),
        ...kickers.map(c => getCardValue(c))
      ]
    };
  }
  
  return null;
}

function checkHighCard(cards) {
  return {
    rank: HAND_RANK.HIGH_CARD,
    cards: cards,
    description: `${HAND_NAME[HAND_RANK.HIGH_CARD]} (${cards[0].value})`,
    values: cards.map(c => getCardValue(c))
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function isFlush(cards) {
  if (cards.length < 5) return false;
  const suit = cards[0].suit;
  return cards.every(c => c.suit === suit);
}

function isStraight(cards) {
  if (cards.length < 5) return false;
  
  const values = cards.map(c => getCardValue(c));
  
  // Check normal straight
  for (let i = 0; i < values.length - 1; i++) {
    if (values[i] - values[i + 1] !== 1) {
      // Check for A-2-3-4-5 (wheel)
      if (i === 0 && values[0] === 14) {
        const wheel = [14, 5, 4, 3, 2];
        const sorted = [...values].sort((a, b) => b - a);
        if (JSON.stringify(sorted) === JSON.stringify(wheel)) {
          return true;
        }
      }
      return false;
    }
  }
  
  return true;
}

function groupByValue(cards) {
  const groups = {};
  
  cards.forEach(card => {
    const value = getCardValue(card);
    if (!groups[value]) {
      groups[value] = [];
    }
    groups[value].push(card);
  });
  
  return Object.values(groups).sort((a, b) => b.length - a.length);
}

function getCombinations(arr, k) {
  const result = [];
  
  function combine(start, chosen) {
    if (chosen.length === k) {
      result.push([...chosen]);
      return;
    }
    
    for (let i = start; i < arr.length; i++) {
      chosen.push(arr[i]);
      combine(i + 1, chosen);
      chosen.pop();
    }
  }
  
  combine(0, []);
  return result;
}

// ============================================
// HAND COMPARISON
// ============================================

/**
 * So sánh 2 hands
 * @param {Object} hand1
 * @param {Object} hand2
 * @returns {number} 1 if hand1 wins, -1 if hand2 wins, 0 if tie
 */
export function compareHands(hand1, hand2) {
  // Compare by rank first
  if (hand1.rank > hand2.rank) return 1;
  if (hand1.rank < hand2.rank) return -1;
  
  // Same rank, compare by values
  for (let i = 0; i < hand1.values.length; i++) {
    if (hand1.values[i] > hand2.values[i]) return 1;
    if (hand1.values[i] < hand2.values[i]) return -1;
  }
  
  // Complete tie
  return 0;
}

/**
 * Determine winner(s) from multiple players
 * @param {Array<Object>} playerHands - Array of { player, hand }
 * @returns {Array} Array of winners
 */
export function determineWinners(playerHands) {
  if (playerHands.length === 0) return [];
  if (playerHands.length === 1) return [playerHands[0]];
  
  // Find best hand
  let winners = [playerHands[0]];
  
  for (let i = 1; i < playerHands.length; i++) {
    const comparison = compareHands(playerHands[i].hand, winners[0].hand);
    
    if (comparison > 0) {
      // New winner
      winners = [playerHands[i]];
    } else if (comparison === 0) {
      // Tie
      winners.push(playerHands[i]);
    }
  }
  
  return winners;
}
