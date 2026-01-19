/**
 * Bot Storage Management
 * Quản lý 25 bot với tài khoản và số dư riêng
 */

const STORAGE_KEYS = {
  BOTS: 'poker_bots',
  BOT_INITIALIZED: 'poker_bots_initialized'
};

// Bot personalities
const BOT_PERSONALITIES = {
  AGGRESSIVE: 'aggressive',   // Thích raise và all-in
  PASSIVE: 'passive',         // Thích call và check
  BALANCED: 'balanced',       // Cân bằng
  TIGHT: 'tight',             // Chơi ít tay, fold nhiều
  LOOSE: 'loose'              // Chơi nhiều tay
};

// Danh sách tên bot
const BOT_NAMES = [
  'Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo',
  'Foxtrot', 'Golf', 'Hotel', 'India', 'Juliet',
  'Kilo', 'Lima', 'Mike', 'November', 'Oscar',
  'Papa', 'Quebec', 'Romeo', 'Sierra', 'Tango',
  'Uniform', 'Victor', 'Whiskey', 'Xray', 'Yankee'
];

// ============================================
// INITIALIZATION
// ============================================

/**
 * Khởi tạo bots từ file JSON
 * @returns {Promise<Array>} Mảng bots đã tạo
 */
export async function initializeBots() {
  try {
    // Check if already initialized
    if (isBotsInitialized()) {
      console.log('Bots already initialized');
      return getAllBots();
    }

    // Fetch bots data from JSON file
    const response = await fetch('./static/json/bots.json');
    if (!response.ok) {
      throw new Error('Failed to load bots data');
    }

    const data = await response.json();
    const botsData = data.bots;

    // Process và thêm metadata
    const bots = botsData.map(bot => ({
      ...bot,
      initialBalance: bot.balance, // Lưu balance ban đầu
      isBot: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastPlayed: null,
      // Avatar sẽ load từ file: static/avatars/{bot.id}.png
      behaviorWeights: bot.behaviorWeights || generateBehaviorWeights(bot.personality)
    }));

    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.BOTS, JSON.stringify(bots));
    localStorage.setItem(STORAGE_KEYS.BOT_INITIALIZED, 'true');

    console.log(`Successfully initialized ${bots.length} bots from JSON file`);
    return bots;
  } catch (error) {
    console.error('Error initializing bots:', error);
    // Fallback: tạo bots mặc định nếu không load được file
    return initializeBotsFromCode();
  }
}

/**
 * Fallback: Khởi tạo bots từ code (nếu không load được JSON)
 * @returns {Array} Mảng bots
 */
function initializeBotsFromCode() {
  try {
    const bots = [];
    const personalities = Object.values(BOT_PERSONALITIES);

    for (let i = 0; i < 25; i++) {
      const bot = {
        id: 'bot_' + (i + 1).toString().padStart(3, '0'),
        name: `Bot_${BOT_NAMES[i]}`,
        gender: i % 2 === 0 ? 'male' : 'female',
        
        // Balance: $80 - $150 (random)
        balance: Math.floor(Math.random() * 71) + 80,
        initialBalance: 100,
        
        // Random personality
        personality: personalities[Math.floor(Math.random() * personalities.length)],
        
        // Stats
        stats: {
          gamesPlayed: Math.floor(Math.random() * 100),
          wins: 0,
          losses: 0,
          totalWinnings: 0,
          totalLosses: 0,
          biggestPot: 0
        },
        
        // Behavior weights (dựa trên personality)
        behaviorWeights: generateBehaviorWeights(personalities[i % personalities.length]),
        
        // Metadata
        isBot: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        lastPlayed: null
      };

      // Generate random stats history
      bot.stats.wins = Math.floor(Math.random() * bot.stats.gamesPlayed * 0.4);
      bot.stats.losses = bot.stats.gamesPlayed - bot.stats.wins;

      bots.push(bot);
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.BOTS, JSON.stringify(bots));
    localStorage.setItem(STORAGE_KEYS.BOT_INITIALIZED, 'true');

    console.log('Successfully initialized 25 bots from code (fallback)');
    return bots;
  } catch (error) {
    console.error('Error in fallback initialization:', error);
    return [];
  }
}

/**
 * Generate behavior weights dựa trên personality
 * @param {string} personality 
 * @returns {Object} Weights
 */
function generateBehaviorWeights(personality) {
  const baseWeights = {
    fold: 2,
    check: 3,
    call: 3,
    raise: 2,
    allin: 1
  };

  // Normalize personality string (lowercase, trim)
  const normalizedPersonality = personality.toLowerCase().trim();

  switch (normalizedPersonality) {
    case 'aggressive':
      return {
        fold: 1,
        check: 1,
        call: 3,
        raise: 5,
        allin: 3
      };
    
    case 'passive':
      return {
        fold: 2,
        check: 5,
        call: 4,
        raise: 1,
        allin: 1
      };
    
    case 'tight':
      return {
        fold: 5,
        check: 3,
        call: 2,
        raise: 2,
        allin: 1
      };
    
    case 'loose':
      return {
        fold: 1,
        check: 3,
        call: 4,
        raise: 3,
        allin: 2
      };
    
    case 'tight-aggressive':
      return {
        fold: 3,
        check: 2,
        call: 2,
        raise: 4,
        allin: 2
      };
    
    case 'loose-aggressive':
      return {
        fold: 1,
        check: 1,
        call: 3,
        raise: 5,
        allin: 3
      };
    
    case 'careless':
    case 'reckless':
      return {
        fold: 1,
        check: 1,
        call: 2,
        raise: 3,
        allin: 5
      };
    
    case 'balanced':
    default:
      return baseWeights;
  }
}

/**
 * Check if bots đã được khởi tạo
 * @returns {boolean}
 */
export function isBotsInitialized() {
  return localStorage.getItem(STORAGE_KEYS.BOT_INITIALIZED) === 'true';
}

// ============================================
// BOT CRUD OPERATIONS
// ============================================

/**
 * Lấy tất cả bots
 * @returns {Array} Mảng bots
 */
export function getAllBots() {
  try {
    const bots = localStorage.getItem(STORAGE_KEYS.BOTS);
    return bots ? JSON.parse(bots) : [];
  } catch (error) {
    console.error('Error getting bots:', error);
    return [];
  }
}

/**
 * Lấy bot theo ID
 * @param {string} botId 
 * @returns {Object|null}
 */
export function getBotById(botId) {
  const bots = getAllBots();
  return bots.find(bot => bot.id === botId) || null;
}

/**
 * Lấy bot active (có thể chơi)
 * @returns {Array} Mảng bots active
 */
export function getActiveBots() {
  const bots = getAllBots();
  return bots.filter(bot => bot.isActive && bot.balance >= 20); // Min $20 để chơi
}

/**
 * Lấy ngẫu nhiên N bots để chơi
 * @param {number} count - Số lượng bot cần (6-10)
 * @returns {Array} Mảng bots được chọn
 */
export function getRandomBots(count = 7) {
  const activeBots = getActiveBots();
  
  if (activeBots.length < count) {
    console.warn(`Not enough active bots. Requested: ${count}, Available: ${activeBots.length}`);
    return activeBots;
  }

  // Shuffle và lấy N bot đầu tiên
  const shuffled = activeBots.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Cập nhật bot
 * @param {string} botId 
 * @param {Object} updateData 
 * @returns {Object} Result
 */
export function updateBot(botId, updateData) {
  try {
    const bots = getAllBots();
    const botIndex = bots.findIndex(bot => bot.id === botId);

    if (botIndex === -1) {
      return {
        success: false,
        error: 'Không tìm thấy bot'
      };
    }

    // Update bot (giữ nguyên id, name, personality)
    const updatedBot = {
      ...bots[botIndex],
      ...updateData,
      id: bots[botIndex].id,
      name: bots[botIndex].name,
      personality: bots[botIndex].personality,
      isBot: true
    };

    bots[botIndex] = updatedBot;
    localStorage.setItem(STORAGE_KEYS.BOTS, JSON.stringify(bots));

    return {
      success: true,
      bot: updatedBot
    };
  } catch (error) {
    console.error('Error updating bot:', error);
    return {
      success: false,
      error: 'Lỗi khi cập nhật bot'
    };
  }
}

/**
 * Cập nhật balance bot
 * @param {string} botId 
 * @param {number} amount - Số tiền thay đổi (+ hoặc -)
 * @returns {Object} Result
 */
export function updateBotBalance(botId, amount) {
  const bot = getBotById(botId);
  if (!bot) {
    return {
      success: false,
      error: 'Không tìm thấy bot'
    };
  }

  const newBalance = bot.balance + amount;

  // Nếu bot hết tiền, reset về initial balance
  const finalBalance = newBalance < 0 ? bot.initialBalance : newBalance;

  return updateBot(botId, {
    balance: finalBalance,
    lastPlayed: new Date().toISOString()
  });
}

/**
 * Cập nhật stats bot sau game
 * @param {string} botId 
 * @param {Object} gameResult 
 * @returns {Object} Result
 */
export function updateBotStats(botId, gameResult) {
  const bot = getBotById(botId);
  if (!bot) {
    return {
      success: false,
      error: 'Không tìm thấy bot'
    };
  }

  const stats = bot.stats;
  stats.gamesPlayed += 1;

  if (gameResult.isWin) {
    stats.wins += 1;
    stats.totalWinnings += gameResult.amount;
    stats.biggestPot = Math.max(stats.biggestPot, gameResult.potSize || 0);
  } else {
    stats.losses += 1;
    stats.totalLosses += Math.abs(gameResult.amount);
  }

  return updateBot(botId, { 
    stats,
    lastPlayed: new Date().toISOString()
  });
}

/**
 * Reset tất cả bots (dùng cho debug/testing)
 */
export function resetAllBots() {
  localStorage.removeItem(STORAGE_KEYS.BOTS);
  localStorage.removeItem(STORAGE_KEYS.BOT_INITIALIZED);
  return initializeBots();
}

// ============================================
// BOT BEHAVIOR
// ============================================

/**
 * Lấy hành động của bot dựa trên weights
 * @param {Object} bot 
 * @param {Array} validActions - Các action hợp lệ
 * @returns {string} Action được chọn
 */
export function getBotAction(bot, validActions) {
  if (!bot || !validActions || validActions.length === 0) {
    return 'fold';
  }

  const weights = bot.behaviorWeights || {};
  const actionPool = [];

  // Tạo pool dựa trên weights
  validActions.forEach(action => {
    const weight = weights[action] || 1;
    for (let i = 0; i < weight; i++) {
      actionPool.push(action);
    }
  });

  // Random chọn 1 action
  return actionPool[Math.floor(Math.random() * actionPool.length)];
}

/**
 * Lấy raise amount của bot
 * @param {Object} bot 
 * @param {number} minRaise 
 * @param {number} maxRaise 
 * @returns {number} Raise amount
 */
export function getBotRaiseAmount(bot, minRaise, maxRaise) {
  if (!bot || minRaise >= maxRaise) {
    return minRaise;
  }

  const personality = bot.personality;
  let multiplier = 0.5; // Default 50% of range

  switch (personality) {
    case BOT_PERSONALITIES.AGGRESSIVE:
      multiplier = 0.7 + Math.random() * 0.3; // 70-100%
      break;
    
    case BOT_PERSONALITIES.PASSIVE:
      multiplier = 0.2 + Math.random() * 0.3; // 20-50%
      break;
    
    case BOT_PERSONALITIES.TIGHT:
      multiplier = 0.3 + Math.random() * 0.2; // 30-50%
      break;
    
    case BOT_PERSONALITIES.LOOSE:
      multiplier = 0.5 + Math.random() * 0.3; // 50-80%
      break;
    
    case BOT_PERSONALITIES.BALANCED:
    default:
      multiplier = 0.4 + Math.random() * 0.4; // 40-80%
  }

  const amount = minRaise + (maxRaise - minRaise) * multiplier;
  return Math.floor(amount / 10) * 10; // Round to nearest 10
}

// ============================================
// EXPORT
// ============================================

export { 
  STORAGE_KEYS,
  BOT_PERSONALITIES,
  BOT_NAMES
};
