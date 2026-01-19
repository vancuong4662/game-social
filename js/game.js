/**
 * Game Page - User Info and Navigation
 */

// Load user session from localStorage
function loadUserSession() {
  try {
    const sessionData = localStorage.getItem('poker_userSession');
    
    if (!sessionData) {
      // No session found, redirect to login
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

// Format balance with thousand separators
function formatBalance(balance) {
  return balance.toLocaleString('en-US');
}

// Render user info in sidebar
function renderUserInfo() {
  const user = loadUserSession();
  
  if (!user) return;
  
  // Update username
  const userNameElement = document.querySelector('.user-name');
  if (userNameElement) {
    userNameElement.textContent = user.username;
  }
  
  // Update balance
  const balanceElement = document.querySelector('.balance-amount');
  if (balanceElement) {
    balanceElement.textContent = formatBalance(user.balance);
  }
  
  // Update avatar if user has custom avatar
  const avatarImg = document.querySelector('.user-avatar img');
  if (avatarImg && user.avatar) {
    avatarImg.src = user.avatar;
  }
  
  console.log('User info loaded:', {
    username: user.username,
    balance: user.balance
  });
}

// Handle logout
function handleLogout(event) {
  event.preventDefault();
  
  const confirmed = confirm('Bạn có chắc chắn muốn đăng xuất?');
  
  if (confirmed) {
    // Clear session
    localStorage.removeItem('poker_userSession');
    
    // Redirect to login
    window.location.href = 'login.html';
  }
}

// Initialize page
function initGamePage() {
  // Check if user is logged in
  const user = loadUserSession();
  
  if (!user) return;
  
  // Render user info
  renderUserInfo();
  
  // Add logout handler
  const logoutLink = document.querySelector('.nav-logout');
  if (logoutLink) {
    logoutLink.addEventListener('click', handleLogout);
  }
  
  console.log('Game page initialized');
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGamePage);
} else {
  initGamePage();
}
