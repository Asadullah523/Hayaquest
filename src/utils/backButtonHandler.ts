import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

let lastBackPress = 0;
const DOUBLE_BACK_DELAY = 2000;

const getParentPath = (path: string) => {
  if (path === '/' || path === '') return null;
  
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
  if (primarySections.some(route => path.startsWith(route))) return '/';
  
  // Default fallback for any other sub-route
  return '/';
};

export const setupBackButtonHandler = (navigate: any) => {
  // Only set up on native platforms
  if (!Capacitor.isNativePlatform()) {
    return () => {};
  }

  const listener = CapacitorApp.addListener('backButton', () => {
    // Always get the most current path directly from the browser's location
    const currentPath = window.location.pathname;
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
    
    // Reset back press timer when navigating normally
    lastBackPress = 0;

    // Navigate to the logical parent
    navigate(parentPath);
  });

  // Return a cleanup function
  return () => {
    listener.then(l => l.remove());
  };
};

const showExitToast = () => {
  // Only show if we are actually on the dashboard to prevent ghost messages
  if (window.location.pathname !== '/') return;

  // Remove any existing toast
  const existingToast = document.getElementById('exit-gesture-toast');
  if (existingToast) document.body.removeChild(existingToast);

  // Create the toast container
  const toast = document.createElement('div');
  toast.id = 'exit-gesture-toast';
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
        <div style="width: 24px; height: 3px; background: rgba(255,255,255,0.6); border-radius: 2px;"></div>
        <div>Swipe again to exit</div>
    </div>
  `;
  
  toast.style.cssText = `
    position: fixed;
    bottom: 15%;
    left: -250px; /* Start off-screen left */
    background: rgba(15, 15, 15, 0.95);
    backdrop-filter: blur(12px);
    color: white;
    padding: 12px 24px;
    border-radius: 40px;
    font-size: 14px;
    font-weight: 600;
    z-index: 10000;
    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    border: 1px solid rgba(255,255,255,0.15);
    white-space: nowrap;
    pointer-events: none;
    animation: instagramFloat 2.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  `;
  
  // Add updated animation keyframes for the "float across" effect
  const styleId = 'exit-toast-styles-v2';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      @keyframes instagramFloat {
        0% { transform: translateX(0); left: -250px; opacity: 0; }
        15% { transform: translateX(0); left: 30px; opacity: 1; }
        45% { transform: translateX(-50%); left: 50%; opacity: 1; }
        65% { transform: translateX(-50%); left: 50%; opacity: 1; }
        85% { transform: translateX(-50%); left: 55%; opacity: 0; }
        100% { transform: translateX(-50%); left: 60%; opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    if (toast.parentNode) document.body.removeChild(toast);
  }, 2500);
};
