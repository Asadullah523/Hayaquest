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
    return () => {};
  }

  const listener = CapacitorApp.addListener('backButton', () => {
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

  // Return a cleanup function
  return () => {
    listener.then(l => l.remove());
  };
};

const showExitToast = () => {
  // Remove any existing toast
  const existingToast = document.getElementById('exit-gesture-toast');
  if (existingToast) document.body.removeChild(existingToast);

  // Create the toast container
  const toast = document.createElement('div');
  toast.id = 'exit-gesture-toast';
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
        <div style="width: 30px; height: 3px; background: rgba(255,255,255,0.6); border-radius: 2px;"></div>
        <div>Swipe again to exit</div>
    </div>
  `;
  
  toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: -200px; /* Start off-screen left */
    background: rgba(15, 15, 15, 0.95);
    backdrop-filter: blur(10px);
    color: white;
    padding: 10px 20px;
    border-radius: 30px;
    font-size: 13px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    border: 1px solid rgba(255,255,255,0.1);
    white-space: nowrap;
    pointer-events: none;
    animation: floatFromLeft 2s ease-in-out forwards;
  `;
  
  // Add updated animation keyframes
  if (!document.getElementById('exit-toast-styles')) {
    const style = document.createElement('style');
    style.id = 'exit-toast-styles';
    style.innerHTML = `
      @keyframes floatFromLeft {
        0% { left: -200px; opacity: 0; }
        20% { left: 40px; opacity: 1; }
        50% { left: 50%; transform: translateX(-50%); opacity: 1; }
        80% { left: 60%; transform: translateX(-50%); opacity: 0; }
        100% { left: 70%; transform: translateX(-50%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    if (toast.parentNode) document.body.removeChild(toast);
  }, 2000);
};
