/**
 * Bot AI Module - Weighted Random Decision Making
 * Bot hành động dựa trên personality và behavior weights
 */

import { ACTIONS } from '../core/gameLogic.js';

// Default action weights (nếu bot không có behaviorWeights)
const DEFAULT_WEIGHTS = {
  fold: 1,
  check: 4,
  call: 3,
  raise: 2,
  allin: 1
};

/**
 * Bot quyết định action dựa trên weighted random
 * @param {Player} player - Bot player
 * @param {Array<string>} validActions - Các action hợp lệ
 * @param {Object} gameContext - Context của game (pot, currentBet, etc)
 * @returns {Object} { action, amount }
 */
export function botDecision(player, validActions, gameContext = {}) {
  if (!player.isBot || validActions.length === 0) {
    return { action: ACTIONS.FOLD, amount: 0 };
  }
  
  // Lấy behavior weights từ bot data
  const weights = player.botData?.behaviorWeights || DEFAULT_WEIGHTS;
  
  // Build action pool theo weights
  const actionPool = [];
  
  validActions.forEach(action => {
    const weight = weights[action] || 1;
    
    // Add action vào pool theo weight
    for (let i = 0; i < weight; i++) {
      actionPool.push(action);
    }
  });
  
  // Random pick action từ pool
  const chosenAction = actionPool[Math.floor(Math.random() * actionPool.length)];
  
  // Calculate amount nếu là raise
  let amount = 0;
  if (chosenAction === ACTIONS.RAISE) {
    amount = calculateRaiseAmount(player, gameContext);
  }
  
  return {
    action: chosenAction,
    amount: amount
  };
}

/**
 * Calculate raise amount dựa trên personality
 * @param {Player} player
 * @param {Object} gameContext
 * @returns {number}
 */
function calculateRaiseAmount(player, gameContext) {
  const { currentBet = 0, minRaise = 10, pot = 0 } = gameContext;
  
  // Amount cần để call
  const callAmount = currentBet - player.currentBet;
  
  // Available chips sau khi call
  const availableForRaise = player.chips - callAmount;
  
  if (availableForRaise <= minRaise) {
    return minRaise;
  }
  
  // Get personality
  const personality = player.botData?.personality || 'balanced';
  
  // Calculate multiplier dựa trên personality
  let multiplier = 0.5; // Default 50% of available
  
  switch (personality.toLowerCase()) {
    case 'aggressive':
    case 'loose-aggressive':
      // 70-100% of available
      multiplier = 0.7 + Math.random() * 0.3;
      break;
    
    case 'passive':
      // 20-50% of available
      multiplier = 0.2 + Math.random() * 0.3;
      break;
    
    case 'tight':
    case 'tight-aggressive':
      // 40-70% of available
      multiplier = 0.4 + Math.random() * 0.3;
      break;
    
    case 'loose':
      // 50-80% of available
      multiplier = 0.5 + Math.random() * 0.3;
      break;
    
    case 'reckless':
    case 'careless':
      // 80-120% (có thể over-bet)
      multiplier = 0.8 + Math.random() * 0.4;
      break;
    
    case 'balanced':
    default:
      // 40-80% of available
      multiplier = 0.4 + Math.random() * 0.4;
  }
  
  // Calculate raise amount
  let raiseAmount = Math.floor(availableForRaise * multiplier);
  
  // Ensure minimum raise
  raiseAmount = Math.max(raiseAmount, minRaise);
  
  // Round to nearest 5 or 10 để đẹp
  raiseAmount = Math.round(raiseAmount / 5) * 5;
  
  // Ensure not exceeding available chips
  raiseAmount = Math.min(raiseAmount, availableForRaise);
  
  return raiseAmount;
}

/**
 * Get bot thinking time (delay in ms)
 * @param {Player} player
 * @returns {number} Delay in milliseconds
 */
export function getBotDelay(player) {
  if (!player.isBot) return 0;
  
  // Base delay: 600-1400ms
  const baseDelay = 600 + Math.random() * 800;
  
  // Personality modifier
  const personality = player.botData?.personality || 'balanced';
  let modifier = 1.0;
  
  switch (personality.toLowerCase()) {
    case 'aggressive':
    case 'reckless':
      // Faster decisions
      modifier = 0.7;
      break;
    
    case 'passive':
    case 'tight':
      // Slower, more careful
      modifier = 1.3;
      break;
    
    case 'balanced':
    default:
      modifier = 1.0;
  }
  
  return Math.floor(baseDelay * modifier);
}

/**
 * Simulate bot "thinking" with delay
 * @param {Player} player
 * @returns {Promise}
 */
export function botThink(player) {
  const delay = getBotDelay(player);
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Bot action with delay (complete flow)
 * @param {Player} player
 * @param {Array<string>} validActions
 * @param {Object} gameContext
 * @returns {Promise<Object>} { action, amount }
 */
export async function botActionWithDelay(player, validActions, gameContext) {
  // Simulate thinking time
  await botThink(player);
  
  // Make decision
  const decision = botDecision(player, validActions, gameContext);
  
  console.log(`🤖 ${player.name} (${player.botData?.personality || 'balanced'}) decides: ${decision.action}${decision.amount ? ' $' + decision.amount : ''}`);
  
  return decision;
}

/**
 * Check if bot should bluff (for future enhancement)
 * @param {Player} player
 * @param {Object} gameContext
 * @returns {boolean}
 */
export function shouldBluff(player, gameContext) {
  const personality = player.botData?.personality || 'balanced';
  
  let bluffChance = 0.1; // 10% default
  
  switch (personality.toLowerCase()) {
    case 'aggressive':
    case 'loose-aggressive':
      bluffChance = 0.25; // 25%
      break;
    
    case 'reckless':
      bluffChance = 0.4; // 40%
      break;
    
    case 'passive':
    case 'tight':
      bluffChance = 0.05; // 5%
      break;
    
    case 'loose':
      bluffChance = 0.15; // 15%
      break;
  }
  
  return Math.random() < bluffChance;
}

/**
 * Adjust weights dynamically based on game state (advanced)
 * @param {Player} player
 * @param {Object} gameContext
 * @returns {Object} Adjusted weights
 */
export function adjustWeights(player, gameContext) {
  const baseWeights = player.botData?.behaviorWeights || DEFAULT_WEIGHTS;
  const { pot = 0, currentBet = 0, communityCards = [] } = gameContext;
  
  // Clone weights
  const adjusted = { ...baseWeights };
  
  // If pot is large, reduce fold tendency
  if (pot > player.chips * 0.5) {
    adjusted.fold = Math.max(1, adjusted.fold - 1);
    adjusted.call = adjusted.call + 1;
  }
  
  // If bet is too high relative to chips, increase fold
  if (currentBet > player.chips * 0.5) {
    adjusted.fold = adjusted.fold + 2;
    adjusted.raise = Math.max(1, adjusted.raise - 1);
  }
  
  // Late stage (river), be more cautious
  if (communityCards.length === 5) {
    adjusted.raise = Math.max(1, adjusted.raise - 1);
    adjusted.check = adjusted.check + 1;
  }
  
  return adjusted;
}

/**
 * Get bot personality description
 * @param {Player} player
 * @returns {string}
 */
export function getBotPersonalityDescription(player) {
  if (!player.isBot || !player.botData) return 'Unknown';
  
  const personality = player.botData.personality || 'balanced';
  
  const descriptions = {
    'aggressive': 'Chơi mạnh, thích raise và all-in',
    'passive': 'Chơi thận trọng, thích check và call',
    'balanced': 'Chơi cân bằng, linh hoạt',
    'tight': 'Chơi ít tay, fold nhiều',
    'loose': 'Chơi nhiều tay, liều lĩnh',
    'tight-aggressive': 'Chơi ít nhưng mạnh',
    'loose-aggressive': 'Chơi nhiều và mạnh',
    'reckless': 'Bất chấp, all-in thường xuyên',
    'careless': 'Cẩu thả, không suy nghĩ'
  };
  
  return descriptions[personality.toLowerCase()] || personality;
}

// Export constants
export { DEFAULT_WEIGHTS };
