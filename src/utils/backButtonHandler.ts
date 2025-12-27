import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

let lastBackPress = 0;
const DOUBLE_BACK_DELAY = 2000;

const getParentPath = (path: string) => {
  if (path === '/') return null;
  
  // English section hierarchy
  if (path.startsWith('/english/') && path !== '/english') return '/english';
  if (path === '/english') return '/';
  
  // Subjects section hierarchy
  if (path.startsWith('/subjects/') && path !== '/subjects') return '/subjects';
  if (path === '/subjects') return '/';

  // Primary sections all go back to dashboard
  const primarySections = [
    '/timetable', '/imat', '/mdcat', 
    '/achievements', '/analytics', '/settings'
  ];
  if (primarySections.includes(path)) return '/';
  
  // Default fallback
  return '/';
};

export const setupBackButtonHandler = (navigate: any, getCurrentPath: () => string) => {
  // Only set up on native platforms
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  CapacitorApp.addListener('backButton', () => {
    const currentPath = getCurrentPath();
    const parentPath = getParentPath(currentPath);
    
    // If no parent path, we are on the Dashboard
    if (parentPath === null) {
      const now = Date.now();
      
      if (now - lastBackPress < DOUBLE_BACK_DELAY) {
        // Second press within time window - exit app
        CapacitorApp.exitApp();
      } else {
        // First press - show toast/indicator
        lastBackPress = now;
        showExitToast();
      }
      return;
    }
    
    // Navigate to the logical parent
    navigate(parentPath);
    
    // Reset back press timer when navigating normally
    lastBackPress = 0;
  });
};

const showExitToast = () => {
  // Remove any existing toast
  const existingToast = document.getElementById('exit-gesture-toast');
  if (existingToast) document.body.removeChild(existingToast);

  // Create a minimal, "line-like" indicator
  const toast = document.createElement('div');
  toast.id = 'exit-gesture-toast';
  toast.innerHTML = `
    <div style="width: 40px; height: 4px; background: rgba(255,255,255,0.4); border-radius: 2px; margin: 0 auto 8px;"></div>
    <div>Swipe again to exit</div>
  `;
  
  toast.style.cssText = `
    position: fixed;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(20, 20, 20, 0.9);
    backdrop-filter: blur(8px);
    color: white;
    padding: 12px 24px;
    border-radius: 16px;
    font-size: 13px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.1);
    text-align: center;
    pointer-events: none;
    animation: slideUpFade 0.3s ease-out forwards;
  `;
  
  // Add animation keyframes if not present
  if (!document.getElementById('exit-toast-styles')) {
    const style = document.createElement('style');
    style.id = 'exit-toast-styles';
    style.innerHTML = `
      @keyframes slideUpFade {
        from { opacity: 0; transform: translate(-50%, 20px); }
        to { opacity: 1; transform: translate(-50%, 0); }
      }
      @keyframes slideDownFade {
        from { opacity: 1; transform: translate(-50%, 0); }
        to { opacity: 0; transform: translate(-50%, 20px); }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideDownFade 0.3s ease-in forwards';
    setTimeout(() => {
      if (toast.parentNode) document.body.removeChild(toast);
    }, 300);
  }, 1700);
};
