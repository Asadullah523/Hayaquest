import React from 'react';
import { useAchievementsStore, type Achievement } from '../../store/useAchievementsStore';
import { format } from 'date-fns';
import { Lock, Sparkles, CheckCircle2 } from 'lucide-react';

interface AchievementCardProps {
  achievement: Achievement;
  unlocked: boolean;
  unlockedAt?: number;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, unlocked, unlockedAt }) => {
  const store = useAchievementsStore();
  const progress = achievement.getProgress(store);
  const percentage = Math.round((progress.current / progress.total) * 100);

  const getTierStyles = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return {
          iconBg: 'bg-indigo-50 dark:bg-indigo-900/40',
          iconText: 'text-indigo-600 dark:text-indigo-300',
          badge: 'from-indigo-500 to-purple-600',
          border: 'border-indigo-200 dark:border-indigo-800/50',
          glow: 'group-hover:shadow-indigo-500/20'
        };
      case 'gold':
        return {
          iconBg: 'bg-amber-50 dark:bg-amber-900/40',
          iconText: 'text-amber-600 dark:text-amber-300',
          badge: 'from-yellow-400 to-amber-600',
          border: 'border-amber-200 dark:border-amber-800/50',
          glow: 'group-hover:shadow-amber-500/20'
        };
      case 'silver':
        return {
          iconBg: 'bg-slate-50 dark:bg-slate-800/40',
          iconText: 'text-slate-600 dark:text-slate-300',
          badge: 'from-gray-400 to-slate-600',
          border: 'border-slate-200 dark:border-slate-700/50',
          glow: 'group-hover:shadow-slate-500/10'
        };
      default: // bronze
        return {
          iconBg: 'bg-orange-50 dark:bg-orange-900/40',
          iconText: 'text-orange-600 dark:text-orange-300',
          badge: 'from-orange-400 to-amber-700',
          border: 'border-orange-200 dark:border-orange-800/50',
          glow: 'group-hover:shadow-orange-500/20'
        };
    }
  };

  const styles = getTierStyles(achievement.tier);

  if (unlocked) {
    return (
      <div
        className={`glass-card rounded-xl sm:rounded-[2.5rem] p-1.5 sm:p-8 transition-all duration-700 relative overflow-hidden group border-2
          ${styles.border} ${styles.glow} hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] cursor-pointer bg-white/40 dark:bg-slate-900/40`}
      >
        {/* Shine Animation Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
          <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[30deg] animate-shine" />
        </div>

        {/* Decorative Background Glow */}
        <div className={`absolute -right-12 -top-12 w-48 h-48 bg-gradient-to-br ${styles.badge} opacity-20 blur-3xl group-hover:opacity-40 transition-opacity duration-700`} />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Tier Badge - Top Center */}
          <div className={`mb-0.5 sm:mb-6 bg-gradient-to-r ${styles.badge} text-white px-1 sm:px-4 py-0 sm:py-1.5 rounded-full text-[4px] sm:text-[10px] font-black uppercase tracking-tight sm:tracking-[0.2em] flex items-center gap-0.5 sm:gap-2 shadow-lg scale-100 sm:scale-110`}>
            <Sparkles size={4} className="animate-pulse sm:w-3 sm:h-3" />
            {achievement.tier} Reward
          </div>

          {/* Large Trophy Icon */}
          <div className={`relative mb-1 sm:mb-6 group-hover:scale-110 transition-transform duration-500`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${styles.badge} opacity-20 blur-2xl rounded-full animate-pulse-subtle`} />
            <div className={`w-8 h-8 sm:w-28 sm:h-28 rounded-md sm:rounded-3xl flex items-center justify-center text-lg sm:text-6xl shadow-2xl bg-white/10 backdrop-blur-sm border border-white/20 relative z-10 overflow-hidden`}>
              {achievement.icon.startsWith('/') ? (
                <img src={achievement.icon} alt={achievement.name} className="w-5 h-5 sm:w-20 sm:h-20 object-contain drop-shadow-2xl" />
              ) : (
                <span className="drop-shadow-lg text-sm sm:text-6xl">{achievement.icon}</span>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-2 sm:-right-2 bg-green-500 text-white p-0.5 sm:p-1.5 rounded-full shadow-lg border-1 border-white dark:border-slate-900 z-20 scale-100 sm:scale-125">
              <CheckCircle2 size={6} className="sm:w-4 sm:h-4" />
            </div>
          </div>

          {/* Achievement Name */}
          <h3 className="font-black text-[7px] sm:text-2xl mb-0 sm:mb-2 text-slate-900 dark:text-white tracking-tight drop-shadow-sm uppercase line-clamp-1">
            {achievement.name}
          </h3>
          
          <p className="hidden sm:block text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed mb-6 max-w-[200px]">
            {achievement.description}
          </p>

          {/* Earned Footer */}
          {unlockedAt && (
             <div className="mt-1 sm:mt-2 py-1.5 sm:py-3 px-3 sm:px-6 bg-slate-900/5 dark:bg-slate-100/5 rounded-xl sm:rounded-2xl border border-slate-900/10 dark:border-slate-100/10">
                <span className="hidden sm:block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 opacity-60">Earned On</span>
                <span className="text-[7px] sm:text-xs font-black text-primary dark:text-white uppercase tracking-tight">
                  {format(unlockedAt, 'MMM d, yy')}
                </span>
             </div>
          )}
        </div>
      </div>
    );
  }

  // Locked State - Progress Focused
  return (
    <div
      className="glass-card rounded-2xl sm:rounded-[2rem] p-2 sm:p-6 transition-all duration-500 relative overflow-hidden group border-2 border-transparent bg-slate-50/50 dark:bg-slate-900/20 opacity-80 grayscale-[0.3] hover:opacity-100 hover:grayscale-0"
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-1.5 sm:mb-6">
          <div className={`w-8 h-8 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl flex items-center justify-center text-lg sm:text-3xl shadow-inner bg-slate-200/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700`}>
            <Lock className="text-slate-400 w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div className={`hidden sm:flex bg-slate-200 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest items-center gap-1`}>
            {achievement.tier}
          </div>
        </div>

        <div className="mb-0.5 sm:mb-6">
          <h3 className="font-black text-[8px] sm:text-lg mb-0 sm:mb-1 text-slate-500 dark:text-slate-400 line-clamp-1">
            {achievement.name}
          </h3>
          <p className="hidden sm:block text-xs font-medium text-slate-400 dark:text-slate-500">
            {achievement.description}
          </p>
        </div>

        <div className="space-y-1 sm:space-y-3">
          <div className="flex justify-between items-center text-[5px] sm:text-[10px] font-black uppercase tracking-tight sm:tracking-widest">
            <span className="text-slate-400">Progress</span>
            <span className="text-primary">
              {progress.current} / {progress.total}
            </span>
          </div>
          
          <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
            <div 
              className={`h-full transition-all duration-1000 ease-out bg-gradient-to-r ${styles.badge} opacity-50`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="mt-0.5 sm:mt-4 bg-slate-900/5 dark:bg-slate-100/5 p-0.5 sm:p-3 rounded-md sm:rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-[5px] sm:text-[10px] text-slate-500 font-bold leading-tight sm:leading-relaxed line-clamp-2">
              <span className="text-primary mr-0.5">TIPS:</span>
              {achievement.howToEarn}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
