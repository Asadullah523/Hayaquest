import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system' | 'light-sakura' | 'light-ocean' | 'light-forest' | 'light-retro' | 'light-lilac' | 'dark-violet' | 'dark-aurora' | 'dark-galaxy' | 'dark-retro' | 'dark-amethyst';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  // Computed (actual theme being applied: basically light or dark core)
  resolvedTheme: 'light' | 'dark';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      resolvedTheme: 'light', // Default

      setTheme: (theme: Theme) => {
        set({ theme });
        
        const root = window.document.documentElement;
        
        // Determine core light/dark
        let isDark = theme === 'dark' || 
                    theme === 'dark-violet' || 
                    theme === 'dark-aurora' || 
                    theme === 'dark-galaxy' ||
                    theme === 'dark-retro' ||
                    theme === 'dark-amethyst';
                    
        if (theme === 'system') {
          isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        
        // Remove all possible theme classes
        root.classList.remove(
          'light', 'dark', 
          'theme-light-sakura', 'theme-light-ocean', 'theme-light-forest', 'theme-light-retro', 'theme-light-lilac',
          'theme-dark-violet', 'theme-dark-aurora', 'theme-dark-galaxy', 'theme-dark-retro', 'theme-dark-amethyst'
        );
        
        // Add core class
        root.classList.add(isDark ? 'dark' : 'light');
        
        // Add specific theme class if not default
        if (theme !== 'light' && theme !== 'dark' && theme !== 'system') {
          root.classList.add(`theme-${theme}`);
        }
        
        set({ resolvedTheme: isDark ? 'dark' : 'light' });
      }
    }),
    {
       name: 'theme-storage',
       onRehydrateStorage: () => (state) => {
           // Apply theme on load
           if (state) {
               state.setTheme(state.theme);
           }
       }
    }
  )
);
