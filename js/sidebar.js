/**
 * Sidebar Navigation - Active State Management
 * Automatically highlights the current page in sidebar navigation
 */

// Page-to-URL mapping (after links are updated)
const PAGE_MENU_MAP = {
  'game.html': 'game.html',
  'profile.html': 'profile.html',
  'leaderboard.html': 'leaderboard.html',
  'deposit.html': 'deposit.html',
  'change-password.html': 'change-password.html',
  'poker.html': 'game.html', // Game pages also highlight "Chọn Trò Chơi"
  'horse-racing.html': 'game.html'
};

// Get current page filename
function getCurrentPage() {
  const path = window.location.pathname;
  const page = path.split('/').pop() || 'index.html';
  return page;
}

// Update navigation links to use actual page URLs
function updateNavigationLinks() {
  const navLinks = {
    '[href="#games"]': 'game.html',
    '[href="#profile"]': 'profile.html',
    '[href="#leaderboard"]': 'leaderboard.html',
    '[href="#deposit"]': 'deposit.html',
    '[href="#change-password"]': 'change-password.html'
  };
  
  Object.entries(navLinks).forEach(([selector, url]) => {
    const link = document.querySelector(selector);
    if (link && !link.classList.contains('nav-logout')) {
      link.href = url;
    }
  });
}

// Set active menu item based on current page
function setActiveMenuItem() {
  const currentPage = getCurrentPage();
  
  // Remove all active classes first
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Find the target URL for current page
  const targetUrl = PAGE_MENU_MAP[currentPage];
  
  if (targetUrl) {
    // Find menu item with matching href
    const menuItem = document.querySelector(`.nav-item[href="${targetUrl}"]`);
    if (menuItem) {
      menuItem.classList.add('active');
      console.log(`Active menu set for: ${currentPage} -> ${targetUrl}`);
    } else {
      console.warn(`Menu item not found for: ${targetUrl}`);
    }
  } else {
    console.warn(`No mapping found for page: ${currentPage}`);
  }
}

// Initialize sidebar navigation
function initSidebarNavigation() {
  // Update navigation links first
  updateNavigationLinks();
  
  // Then set active menu item (after links are updated)
  setActiveMenuItem();
  
  console.log('Sidebar navigation initialized');
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSidebarNavigation);
} else {
  initSidebarNavigation();
}
