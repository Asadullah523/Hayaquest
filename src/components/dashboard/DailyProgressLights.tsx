import React, { useMemo } from 'react';
import { useLogStore } from '../../store/useLogStore';
import { useTimerStore } from '../../store/useTimerStore';
import { useSubjectStore } from '../../store/useSubjectStore';
import { startOfWeek, addDays, isSameDay, format } from 'date-fns';

export const DailyProgressLights: React.FC = () => {
  const { logs } = useLogStore();
  const { todayStats } = useTimerStore();
  const { topics } = useSubjectStore();

  const weekDays = useMemo(() => {
    // Start from Monday of current week
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(start, i);
      const isToday = isSameDay(new Date(), date);
      const isFuture = date > new Date() && !isToday;
      
      const dayLogs = logs.filter(log => isSameDay(new Date(log.date), date));
      const dayCompletedTopics = topics.filter(t => t.status === 'completed' && t.completedAt && isSameDay(new Date(t.completedAt), date));
      
      // Keep the logic fix: check todayStats for accurate real-time light
      const hasActivity = dayLogs.length > 0 || dayCompletedTopics.length > 0 || (isToday && todayStats.totalFocusTime > 0);
      
      days.push({
        date,
        hasActivity,
        isFuture,
        label: format(date, 'EEE').charAt(0), // M, T, W...
      });
    }
    return days;
  }, [logs, todayStats.totalFocusTime, topics]);

  return (
    <div className="flex items-center gap-1.5 sm:gap-3 mt-4 px-1">
      {weekDays.map((day, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 sm:gap-2 flex-1 group relative">
          <div 
            className={`
                w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-500 relative
                ${day.hasActivity 
                    ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)] animate-pulse scale-110' 
                    : day.isFuture 
                        ? 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                        : 'bg-slate-200 dark:bg-slate-700'
                }
            `}
            title={format(day.date, 'MMM d')}
          >
            {/* Inner "bulb" glare for active state */}
            {day.hasActivity && (
                <div className="absolute inset-0.5 sm:inset-1 bg-white/40 rounded-full blur-[1px]" />
            )}
          </div>
          <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-wider ${day.hasActivity ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`}>
            {day.label}
          </span>
        </div>
      ))}
    </div>
  );
};
