import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../../store/useThemeStore';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  Trophy, 
  BarChart3, 
  Settings, 
  PlusCircle,
  Heart,
  GraduationCap,
  LogIn,
  Cloud,
  RefreshCw
} from 'lucide-react';
import { useSyncStore } from '../../store/useSyncStore';
import { LogSessionModal } from '../dashboard/LogSessionModal';
import { LoginModal } from '../auth/LoginModal';
import { FocusModeIndicator } from '../dashboard/FocusModeIndicator';
import { useAuthStore } from '../../store/useAuthStore';


const ThemeBackgroundEffects = React.memo(() => {
    const { theme, resolvedTheme } = useThemeStore();
    const [elements, setElements] = useState<Array<{ id: number; left: string; top: string; size: string; delay: number; duration: number; rotation?: number; type?: string }>>([]);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Debounced resize handler
        let timeoutId: ReturnType<typeof setTimeout>;
        const checkMobile = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setIsMobile(window.innerWidth < 768);
            }, 100);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => {
            window.removeEventListener('resize', checkMobile);
            clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        let count = 0;
        let type = 'particle';

        // Reduced counts for mobile (20% on mobile, lower base counts)
        const multiplier = isMobile ? 0.2 : 1;

        if (theme === 'light-sakura') { count = Math.floor(18 * multiplier); type = 'sakura'; }
        else if (theme === 'light-ocean') { count = Math.floor(4 * multiplier); type = 'wave'; }
        else if (theme === 'light-forest') { count = Math.floor(20 * multiplier); type = 'firefly'; }
        else if (theme === 'light-lilac') { count = Math.floor(15 * multiplier); type = 'lilac-petal'; }
        else if (theme === 'dark-aurora') { count = Math.max(2, Math.floor(3 * multiplier)); type = 'aurora'; }
        else if (theme === 'dark-violet') { count = Math.max(3, Math.floor(6 * multiplier)); type = 'mist'; }
        else if (theme === 'dark-amethyst') { count = Math.max(3, Math.floor(6 * multiplier)); type = 'crystal'; }
        else if (theme === 'dark-galaxy' || (resolvedTheme === 'dark' && theme === 'dark')) { count = Math.floor(40 * multiplier); type = 'star'; }

        const newElements = Array.from({ length: count }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            size: type === 'wave' ? `${Math.random() * 300 + 200}px` : `${Math.random() * 10 + 5}px`,
            delay: Math.random() * 10,
            duration: Math.random() * 15 + 10,
            rotation: Math.random() * 360,
            type
        }));
        setElements(newElements);
    }, [theme, resolvedTheme, isMobile]);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transform transition-opacity duration-1000" style={{ contain: 'strict', contentVisibility: 'auto' }}>
            {elements.map((e) => {
                if (e.type === 'sakura') {
                    return (
                        <div 
                            key={e.id} 
                            className="sakura-petal" 
                            style={{ 
                                left: e.left, 
                                top: '-10%',
                                width: e.size, 
                                height: e.size, 
                                animationDelay: `${e.delay}s`,
                                animationDuration: `${e.duration}s`
                            }} 
                        />
                    );
                }
                if (e.type === 'wave') {
                    return (
                        <div 
                            key={e.id} 
                            className="absolute rounded-full opacity-20 blur-3xl"
                            style={{ 
                                left: e.left, 
                                top: e.top,
                                width: e.size, 
                                height: e.size, 
                                backgroundColor: 'hsl(var(--primary) / 0.1)',
                                animation: `wave-float ${e.duration}s infinite ease-in-out`,
                                animationDelay: `${e.delay}s`,
                            }} 
                        />
                    );
                }
                if (e.type === 'firefly') {
                    return (
                        <div 
                            key={e.id} 
                            className="firefly" 
                            style={{ 
                                left: e.left, 
                                top: e.top,
                                animationDelay: `${e.delay}s`,
                                animationDuration: `${e.duration}s`
                            }} 
                        />
                    );
                }
                if (e.type === 'aurora') {
                    return (
                        <div 
                            key={e.id} 
                            className="aurora-band" 
                            style={{ 
                                top: `${20 + e.id * 15}%`,
                                animationDelay: `${e.delay}s`,
                                animationDuration: `${e.duration * 2}s`
                            }} 
                        />
                    );
                }
                if (e.type === 'mist') {
                    return (
                        <div 
                            key={e.id} 
                            className="neon-mist-orb" 
                            style={{ 
                                left: e.left, 
                                top: e.top,
                                width: e.size, 
                                height: e.size, 
                                animationDelay: `${e.delay}s`,
                                animationDuration: `${e.duration}s`
                            }} 
                        />
                    );
                }
                if (e.type === 'lilac-petal') {
                    return (
                        <div 
                            key={e.id} 
                            className="lilac-petal" 
                            style={{ 
                                left: e.left, 
                                top: '-20px',
                                width: e.size, 
                                height: e.size, 
                                transform: `rotate(${e.rotation}deg)`,
                                animationDelay: `${e.delay}s`,
                                animationDuration: `${e.duration + 5}s`
                            }} 
                        />
                    );
                }
                if (e.type === 'crystal') {
                    return (
                        <div 
                            key={e.id} 
                            className="crystal-glow" 
                            style={{ 
                                left: e.left, 
                                top: e.top,
                                width: e.size, 
                                height: e.size, 
                                animationDelay: `${e.delay}s`,
                                animationDuration: `${e.duration}s`
                            }} 
                        />
                    );
                }
                if (e.type === 'star') {
                    return (
                        <div
                            key={e.id}
                            className={`star star-${e.id % 3 === 0 ? 'large' : e.id % 2 === 0 ? 'medium' : 'small'}`}
                            style={{
                                left: e.left,
                                top: e.top,
                                animationDelay: `${e.delay}s`,
                            }}
                        />
                    );
                }
                return null;
            })}

            {/* Galaxy Nebula specific layer - Simplified/Removed static nebula on mobile for perf if needed, keeping for now but optimize CSS */}
            {theme === 'dark-galaxy' && (
                <>
                    <div className="nebula-cloud bg-primary w-[800px] h-[800px] -top-1/4 -left-1/4" style={{ animationDuration: '20s' }} />
                    <div className="nebula-cloud bg-accent w-[600px] h-[600px] -bottom-1/4 -right-1/4" style={{ animationDuration: '15s', animationDelay: '-5s' }} />
                </>
            )}

            {/* Retro specific layers */}
            {(theme === 'light-retro' || theme === 'dark-retro') && (
                <>
                    <div className="retro-static" />
                    <div className="retro-scanline" />
                </>
            )}
        </div>
    );
});


export const Layout: React.FC = () => {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const { status: syncStatus } = useSyncStore();

  const location = useLocation();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/subjects', icon: BookOpen, label: 'My Subjects' },
    { path: '/english', icon: GraduationCap, label: 'English' },
    { path: '/timetable', icon: Calendar, label: 'Timetable' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/achievements', icon: Trophy, label: 'Achievements' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-transparent flex flex-col md:flex-row relative">
      <ThemeBackgroundEffects />
      <LogSessionModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} />
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-[240px] lg:w-[240px] xl:w-[260px] 2xl:w-[280px] hidden lg:flex flex-col bg-white dark:bg-slate-700 border-r border-slate-100 dark:border-slate-600 z-50 overflow-hidden">
        {/* Brand */}
        <div className="p-3 lg:p-3 xl:p-4 2xl:p-8 pb-4 xl:pb-6 2xl:pb-10">
          <NavLink to="/" className="flex items-center gap-2 xl:gap-2.5 2xl:gap-3 group">
            <div className="w-8 h-8 lg:w-8 xl:w-9 xl:h-9 2xl:w-12 2xl:h-12 bg-indigo-600 rounded-lg xl:rounded-xl 2xl:rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
              <img src="/hayaquest-logo.svg" alt="HayaQuest Logo" className="w-6 h-6 lg:w-6 xl:w-7 xl:h-7 2xl:w-10 2xl:h-10" />
            </div>
            <div>
              <h1 className="text-base lg:text-base xl:text-lg 2xl:text-xl font-black text-slate-800 dark:text-white tracking-tight">HayaQuest</h1>
              <p className="text-[8px] lg:text-[8px] xl:text-[9px] 2xl:text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none mt-0.5 xl:mt-1">The Ultimate Study Quest</p>
            </div>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 xl:px-6 space-y-1 xl:space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive: isLinkActive }) => `
                flex items-center gap-2.5 xl:gap-3 2xl:gap-4 px-3 xl:px-4 2xl:px-5 py-2 xl:py-3 2xl:py-4 rounded-xl xl:rounded-xl 2xl:rounded-2xl font-bold transition-all duration-300 group relative overflow-hidden
                ${isLinkActive 
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600/50'}
              `}
            >
              <item.icon size={18} className={`transition-colors relative z-10 ${isActive(item.path) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} />
              <span className="flex-1 text-[13px] lg:text-[13px] xl:text-sm 2xl:text-base relative z-10">{item.label}</span>
              {isActive(item.path) && <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-indigo-600" />}
            </NavLink>
          ))}
        </nav>

        {/* Action Area & Credit */}
        <div className="p-3 lg:p-3 xl:p-4 2xl:p-6 border-t border-slate-100 dark:border-slate-600 space-y-2.5 xl:space-y-3 2xl:space-y-4">
          {!isAuthenticated ? (
            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full flex items-center justify-center gap-2 lg:gap-2 xl:gap-2.5 2xl:gap-3 py-2.5 lg:py-2.5 xl:py-3 2xl:py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg xl:rounded-xl 2xl:rounded-2xl font-bold shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-95 group text-xs lg:text-xs xl:text-sm 2xl:text-base"
            >
              <LogIn size={16} className="group-hover:-translate-y-0.5 transition-transform" />
              Sign In
            </button>
          ) : (
            <div className="flex items-center gap-2 xl:gap-2.5 2xl:gap-3 px-2.5 xl:px-3 2xl:px-4 py-2 xl:py-2.5 2xl:py-3 bg-slate-50 dark:bg-slate-800 rounded-xl xl:rounded-xl 2xl:rounded-2xl border border-slate-100 dark:border-slate-700">
               <div className="relative">
                  <div className="w-7 h-7 lg:w-7 xl:w-8 xl:h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xl overflow-hidden">
                    <img 
                      src="https://api.dicebear.com/7.x/bottts/svg?seed=neutral"
                      alt="Avatar" 
                      className="w-full h-full" 
                    />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 lg:w-3 lg:h-3 xl:w-4 xl:h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800" />
               </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{user?.name || 'Explorer'}</p>
                  <div className="flex items-center gap-1.5 xl:gap-2">
                    <p className="text-[9px] lg:text-[9px] xl:text-[10px] text-slate-500 font-bold uppercase tracking-wider">Online</p>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <div className="flex items-center gap-1">
                        {syncStatus.isSyncing ? (
                            <>
                                <RefreshCw size={8} className="text-indigo-500 animate-spin" />
                                <span className="text-[8px] lg:text-[8px] xl:text-[9px] text-indigo-500 font-black uppercase tracking-widest">Mirroring</span>
                            </>
                        ) : (
                            <>
                                <Cloud size={8} className="text-emerald-500" />
                                <span className="text-[8px] lg:text-[8px] xl:text-[9px] text-emerald-500 font-black uppercase tracking-widest">Synched</span>
                            </>
                        )}
                    </div>
                  </div>
               </div>
            </div>
          )}

          <button 
            onClick={() => setIsLogModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 lg:gap-2 xl:gap-2.5 2xl:gap-3 py-2.5 lg:py-2.5 xl:py-3 2xl:py-4 bg-indigo-600 text-white rounded-lg xl:rounded-xl 2xl:rounded-2xl font-bold shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/30 transition-all active:scale-95 group text-xs lg:text-xs xl:text-sm 2xl:text-base"
          >
            <PlusCircle size={16} className="group-hover:rotate-90 transition-transform duration-500" />
            Log Session
          </button>
          
          <div className="pt-1 xl:pt-2 text-center pb-1 xl:pb-2 2xl:pb-8">
            <p className="text-xs lg:text-xs xl:text-sm 2xl:text-base font-medium text-slate-700 dark:text-neon-mint flex items-center justify-center gap-2 transition-all duration-500">
              Built with <Heart size={14} className="fill-current animate-pulse text-indigo-500 dark:text-neon-mint sm:w-4.5" /> by Asad
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-[240px] xl:ml-[260px] 2xl:ml-[280px] min-h-screen pb-24 md:pb-0 relative z-10 transition-all duration-300">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 lg:p-8 xl:p-8 2xl:p-12">
          <Outlet />
        </div>
      </main>

      {/* Mobile/Tablet Bottom Navigation */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-[100] animate-slide-up mobile-nav-bar">
        <div className="glass-card rounded-[2rem] p-2 flex items-center justify-between shadow-2xl shadow-indigo-900/10 gap-1 overflow-x-auto scrollbar-hide">
           <div className="flex items-center gap-1 min-w-max px-2">
              {navItems.map((item) => (
                <NavLink 
                   key={item.path} 
                   to={item.path} 
                   className={({ isActive: isLinkActive }) => `
                     p-2.5 sm:p-3.5 rounded-2xl transition-all duration-300 flex-shrink-0
                     ${isLinkActive 
                       ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-105' 
                       : 'text-slate-400 hover:text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600/50'}
                   `}
                >
                  <item.icon size={20} className="sm:w-6 sm:h-6" />
                </NavLink>
              ))}
           </div>
           
           <div className="flex-shrink-0 px-2 border-l border-slate-100 dark:border-slate-800 ml-1 flex items-center gap-2">
              {!isAuthenticated ? (
                <button 
                   onClick={() => setShowLoginModal(true)}
                   className="p-2.5 sm:p-3.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 transition-all hover:scale-105 active:scale-95"
                >
                   <LogIn size={20} className="sm:w-6 sm:h-6" />
                </button>
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white dark:border-slate-700 overflow-hidden shadow-sm">
                   <img 
                     src="https://api.dicebear.com/7.x/bottts/svg?seed=neutral"
                     alt="Avatar" 
                     className="w-full h-full bg-indigo-100" 
                   />
                </div>
              )}
              <button 
                 onClick={() => setIsLogModalOpen(true)}
                 className="p-2.5 sm:p-3.5 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 hover:scale-105 active:scale-95 transition-all"
              >
                 <PlusCircle size={20} className="sm:w-6 sm:h-6" />
              </button>
           </div>
        </div>
      </div>

      {/* Global Focus Mode Indicator */}
      <FocusModeIndicator />
    </div>
  );
};
