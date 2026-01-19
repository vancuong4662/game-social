/**
 * User Storage Management
 * Quản lý CRUD cho users trong LocalStorage
 */

const STORAGE_KEYS = {
  USERS: 'poker_users',
  USER_SESSION: 'poker_userSession',
  REMEMBER_ME: 'poker_rememberMe'
};

// ============================================
// USER CRUD OPERATIONS
// ============================================

/**
 * Lấy tất cả users
 * @returns {Array} Mảng users
 */
export function getAllUsers() {
  try {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
}

/**
 * Lấy user theo ID
 * @param {string} userId 
 * @returns {Object|null} User object hoặc null
 */
export function getUserById(userId) {
  const users = getAllUsers();
  return users.find(user => user.id === userId) || null;
}

/**
 * Lấy user theo username
 * @param {string} username 
 * @returns {Object|null} User object hoặc null
 */
export function getUserByUsername(username) {
  const users = getAllUsers();
  return users.find(user => user.username === username) || null;
}

/**
 * Tạo user mới
 * @param {Object} userData - Dữ liệu user
 * @returns {Object} User object đã tạo hoặc error
 */
export function createUser(userData) {
  try {
    const users = getAllUsers();
    
    // Validate required fields
    if (!userData.username || !userData.password) {
      return {
        success: false,
        error: 'Username và password là bắt buộc'
      };
    }

    // Check username exists
    const existingUser = getUserByUsername(userData.username);
    if (existingUser) {
      return {
        success: false,
        error: 'Tên đăng nhập đã tồn tại'
      };
    }

    // Create new user
    const newUser = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      username: userData.username.trim(),
      email: userData.email ? userData.email.trim() : '',
      password: userData.password, // TODO: Hash password
      balance: userData.balance || 100, // $100 ban đầu
      createdAt: new Date().toISOString(),
      lastCheckIn: null,
      stats: {
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        totalWinnings: 0,
        totalLosses: 0,
        biggestPot: 0
      }
    };

    // Save to localStorage
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    return {
      success: true,
      user: newUser
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      error: 'Lỗi khi tạo tài khoản'
    };
  }
}

/**
 * Cập nhật user
 * @param {string} userId 
 * @param {Object} updateData 
 * @returns {Object} Result
 */
export function updateUser(userId, updateData) {
  try {
    const users = getAllUsers();
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      return {
        success: false,
        error: 'Không tìm thấy user'
      };
    }

    // Update user (không cho phép update id, username)
    const updatedUser = {
      ...users[userIndex],
      ...updateData,
      id: users[userIndex].id, // Keep original ID
      username: users[userIndex].username // Keep original username
    };

    users[userIndex] = updatedUser;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // Update session if this is current user
    const session = getUserSession();
    if (session && session.id === userId) {
      setUserSession(updatedUser);
    }

    return {
      success: true,
      user: updatedUser
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return {
      success: false,
      error: 'Lỗi khi cập nhật user'
    };
  }
}

/**
 * Xóa user
 * @param {string} userId 
 * @returns {Object} Result
 */
export function deleteUser(userId) {
  try {
    const users = getAllUsers();
    const filteredUsers = users.filter(user => user.id !== userId);

    if (users.length === filteredUsers.length) {
      return {
        success: false,
        error: 'Không tìm thấy user'
      };
    }

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filteredUsers));

    // Clear session if this is current user
    const session = getUserSession();
    if (session && session.id === userId) {
      clearUserSession();
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    return {
      success: false,
      error: 'Lỗi khi xóa user'
    };
  }
}

// ============================================
// USER SESSION MANAGEMENT
// ============================================

/**
 * Lấy session hiện tại
 * @returns {Object|null} User session
 */
export function getUserSession() {
  try {
    const session = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Set user session
 * @param {Object} user - User object
 */
export function setUserSession(user) {
  try {
    // Chỉ lưu thông tin cần thiết
    const sessionData = {
      id: user.id,
      username: user.username,
      email: user.email,
      balance: user.balance,
      lastCheckIn: user.lastCheckIn,
      stats: user.stats
    };

    localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(sessionData));
  } catch (error) {
    console.error('Error setting session:', error);
  }
}

/**
 * Clear session
 */
export function clearUserSession() {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}

/**
 * Check if user is logged in
 * @returns {boolean}
 */
export function isLoggedIn() {
  return getUserSession() !== null;
}

// ============================================
// AUTHENTICATION
// ============================================

/**
 * Đăng nhập user
 * @param {string} username 
 * @param {string} password 
 * @returns {Object} Result with user or error
 */
export function loginUser(username, password) {
  try {
    const users = getAllUsers();
    const user = users.find(u => 
      u.username === username && u.password === password
    );

    if (!user) {
      return {
        success: false,
        error: 'Tên đăng nhập hoặc mật khẩu không đúng'
      };
    }

    // Set session
    setUserSession(user);

    return {
      success: true,
      user: user
    };
  } catch (error) {
    console.error('Error logging in:', error);
    return {
      success: false,
      error: 'Lỗi khi đăng nhập'
    };
  }
}

/**
 * Đăng xuất
 */
export function logoutUser() {
  clearUserSession();
}

// ============================================
// CHECK-IN SYSTEM
// ============================================

/**
 * Kiểm tra xem user đã điểm danh hôm nay chưa
 * @param {string} userId 
 * @returns {boolean}
 */
export function canCheckInToday(userId) {
  const user = getUserById(userId);
  if (!user || !user.lastCheckIn) {
    return true; // Chưa từng check-in
  }

  const lastCheckIn = new Date(user.lastCheckIn);
  const today = new Date();

  // Reset time to midnight for comparison
  lastCheckIn.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return lastCheckIn.getTime() !== today.getTime();
}

/**
 * Điểm danh và nhận thưởng
 * @param {string} userId 
 * @returns {Object} Result
 */
export function checkInUser(userId) {
  if (!canCheckInToday(userId)) {
    return {
      success: false,
      error: 'Bạn đã điểm danh hôm nay rồi'
    };
  }

  const user = getUserById(userId);
  if (!user) {
    return {
      success: false,
      error: 'Không tìm thấy user'
    };
  }

  const CHECKIN_BONUS = 50;

  // Update user
  const result = updateUser(userId, {
    balance: user.balance + CHECKIN_BONUS,
    lastCheckIn: new Date().toISOString()
  });

  if (result.success) {
    return {
      success: true,
      bonus: CHECKIN_BONUS,
      newBalance: result.user.balance
    };
  }

  return result;
}

// ============================================
// BALANCE MANAGEMENT
// ============================================

/**
 * Cập nhật balance
 * @param {string} userId 
 * @param {number} amount - Số tiền cộng/trừ (+ hoặc -)
 * @returns {Object} Result
 */
export function updateBalance(userId, amount) {
  const user = getUserById(userId);
  if (!user) {
    return {
      success: false,
      error: 'Không tìm thấy user'
    };
  }

  const newBalance = user.balance + amount;

  if (newBalance < 0) {
    return {
      success: false,
      error: 'Số dư không đủ'
    };
  }

  return updateUser(userId, {
    balance: newBalance
  });
}

/**
 * Lấy balance hiện tại
 * @param {string} userId 
 * @returns {number}
 */
export function getBalance(userId) {
  const user = getUserById(userId);
  return user ? user.balance : 0;
}

// ============================================
// STATS MANAGEMENT
// ============================================

/**
 * Cập nhật stats sau game
 * @param {string} userId 
 * @param {Object} gameResult 
 * @returns {Object} Result
 */
export function updateStats(userId, gameResult) {
  const user = getUserById(userId);
  if (!user) {
    return {
      success: false,
      error: 'Không tìm thấy user'
    };
  }

  const stats = user.stats;
  stats.gamesPlayed += 1;

  if (gameResult.isWin) {
    stats.wins += 1;
    stats.totalWinnings += gameResult.amount;
    stats.biggestPot = Math.max(stats.biggestPot, gameResult.potSize || 0);
  } else {
    stats.losses += 1;
    stats.totalLosses += Math.abs(gameResult.amount);
  }

  return updateUser(userId, { stats });
}

// Export storage keys for external use
export { STORAGE_KEYS };
