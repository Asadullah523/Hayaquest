import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTimerStore } from '../../store/useTimerStore';
import { useUserStore } from '../../store/useUserStore';
import { useGamificationStore } from '../../store/useGamificationStore';

export const GoalProgressWidget: React.FC = () => {
  const { todayStats } = useTimerStore();
  const { dailyGoalMinutes } = useUserStore();
  const { unlockBadge } = useGamificationStore();
  const [hasCelebrated, setHasCelebrated] = useState(false);

  // Derived state
  const todaysStudySeconds = todayStats.totalFocusTime;
  const goalPercentage = Math.min((todaysStudySeconds / (dailyGoalMinutes * 60)) * 100, 100);

  // Helper function for formatting time
  const formatStudyTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  useEffect(() => {
    if (goalPercentage === 100 && !hasCelebrated) {
      // Premium celebration sequence
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      setHasCelebrated(true);
      unlockBadge('goal_met');
    }
  }, [goalPercentage, hasCelebrated, unlockBadge]);

  return (
    <div className={clsx(
      "bg-white/80 dark:bg-slate-950/40 backdrop-blur-md px-1.5 sm:px-4 md:px-6 py-1 sm:py-3 md:py-5 rounded-lg sm:rounded-2xl shadow-sm border border-white/20 dark:border-slate-700/50 flex-1 relative overflow-hidden group/goal transition-all duration-500",
      goalPercentage === 100 && "goal-met-glow goal-met-shine"
    )}>
      <div className="flex items-center justify-between mb-0.5 sm:mb-2 md:mb-3">
        <p className="text-[5px] sm:text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-tight sm:tracking-widest leading-none">Goal</p>
        {goalPercentage === 100 && (
          <div className="flex items-center gap-0.5 text-emerald-500 animate-bounce">
            <CheckCircle2 size={8} strokeWidth={3} className="sm:w-3 sm:h-3" />
            <span className="text-[5px] sm:text-[9px] font-black uppercase tracking-tight">Met!</span>
          </div>
        )}
      </div>
      <div className="flex items-end gap-1 sm:gap-2 mb-0.5 sm:mb-2 md:mb-3">
        <p className={clsx(
          "text-[9px] sm:text-lg md:text-2xl font-black whitespace-nowrap",
          goalPercentage === 100 && "text-premium-shine"
        )}>
          {formatStudyTime(todaysStudySeconds)}
        </p>
        <p className="text-[5px] sm:text-[10px] md:text-xs font-bold text-slate-400 mb-0.5 truncate">/ {dailyGoalMinutes}m</p>
      </div>
      <div className="w-full h-0.5 sm:h-1.5 md:h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={clsx(
            "h-full transition-all duration-500 ease-out",
            goalPercentage === 100 ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "bg-primary"
          )} 
          style={{ width: `${goalPercentage}%` }} 
        />
      </div>
    </div>
  );
};
