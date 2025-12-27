import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

let lastBackPress = 0;
const DOUBLE_BACK_DELAY = 2000; // 2 seconds to press back again

export const setupBackButtonHandler = (navigate: any, getCurrentPath: () => string) => {
  // Only set up on native platforms
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  CapacitorApp.addListener('backButton', ({ canGoBack }) => {
    const currentPath = getCurrentPath();
    
    // Dashboard route - require double back to exit
    if (currentPath === '/') {
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
    
    // For other routes, navigate back in history
    if (canGoBack) {
      navigate(-1);
    } else {
      // If can't go back in history, go to dashboard
      navigate('/');
    }
  });
};

const showExitToast = () => {
  // Create a simple toast notification
  const toast = document.createElement('div');
  toast.textContent = 'Press back again to exit';
  toast.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 24px;
    font-size: 14px;
    font-weight: 600;
    z-index: 10000;
    animation: slideUp 0.3s ease-out;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideDown 0.3s ease-in';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 1700);
};
