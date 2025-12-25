import React from 'react';
import { Zap, Flame, Trophy, Award, ChevronRight } from 'lucide-react';
import { useGamificationStore } from '../../store/useGamificationStore';
import { useLogStore } from '../../store/useLogStore';
import { useAchievementsStore } from '../../store/useAchievementsStore';
import { NavLink } from 'react-router-dom';

export const QuestStats: React.FC = () => {
  const { xp, level } = useGamificationStore();
  const { streak } = useLogStore();
  const { getUnlockedAchievements } = useAchievementsStore();
  
  const unlockedBadges = getUnlockedAchievements().slice(0, 3);

  // Level progress calculation
  const xpInCurrentLevel = xp % (level * 100);
  const xpNeededForNextLevel = level * 100;
  const progress = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      
      {/* Level & Mastery Card */}
      <div className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl transition-all duration-500 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30 transform group-hover:rotate-12 transition-transform">
                <Zap size={28} className="fill-current text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">Rank Status</p>
                <h3 className="text-2xl font-black tracking-tight dark:text-neon-indigo">Level {level}</h3>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total XP</p>
              <p className="text-xl font-black text-indigo-400 tabular-nums dark:text-neon-indigo">{xp.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-slate-400">Mastery Progress</span>
              <span className="text-white">{Math.round(progress)}%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)] dark:neon-progress-indigo"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase text-center mt-2 italic">
              {xpNeededForNextLevel - xpInCurrentLevel} XP to Level {level + 1}
            </p>
          </div>
        </div>
      </div>

      {/* Persistence / Streak Card */}
      <div className="relative group overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 border border-slate-100 dark:border-slate-800 shadow-xl transition-all duration-500 hover:-translate-y-1">
         <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full animate-pulse" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-orange-400 to-rose-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-orange-500/20">
                <Flame size={40} className="text-white fill-current animate-bounce" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-1">Persistence</p>
              <h3 className="text-4xl font-black text-slate-800 dark:text-white dark:text-neon-orange tracking-tighter tabular-nums">{streak} Days</h3>
              <p className="text-xs font-bold text-slate-400 mt-1">Study Momentum Active</p>
            </div>
         </div>
      </div>

      {/* Champion's Hall / Badges Card */}
      <div className="relative group overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-white dark:bg-slate-900 p-4 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl transition-all duration-500 hover:-translate-y-1 sm:col-span-2 xl:col-span-1">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Award size={16} className="text-amber-500 sm:w-5 sm:h-5" />
            <h3 className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Champion's Hall</h3>
          </div>
          <NavLink to="/achievements?filter=earned" className="text-[8px] sm:text-[10px] font-black uppercase text-primary hover:underline flex items-center gap-1 group/link">
            All Medals
            <ChevronRight size={10} className="sm:w-3 sm:h-3 group-hover/link:translate-x-0.5 transition-transform" />
          </NavLink>
        </div>

        <div className="flex gap-2 sm:gap-4">
          {unlockedBadges.length > 0 ? (
            unlockedBadges.map((badge) => (
              <div key={badge.id} className="group/badge relative">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-slate-50 dark:bg-slate-800 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:scale-110 transition-all cursor-help" title={badge.name}>
                  {badge.icon}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-amber-500 rounded-full flex items-center justify-center border border-white dark:border-slate-900 shadow-lg">
                  <Trophy size={8} className="text-white fill-current sm:w-[10px] sm:h-[10px]" />
                </div>
              </div>
            ))
          ) : (
            <p className="text-[10px] sm:text-xs font-medium text-slate-400 italic">No medals earned yet. Keep studying!</p>
          )}
          
          {unlockedBadges.length > 0 && Array(3 - unlockedBadges.length).fill(0).map((_, i) => (
             <div key={i} className="w-10 h-10 sm:w-14 sm:h-14 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center">
                <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-slate-200 dark:bg-slate-700 opacity-20" />
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};
