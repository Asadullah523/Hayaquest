import React from 'react';
import { useTimerStore } from '../../store/useTimerStore';
import { Clock, Award, Zap } from 'lucide-react';

export const SessionStats: React.FC = () => {
  const { todayStats } = useTimerStore();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const stats = [
    {
      label: 'Focus Time',
      value: formatTime(todayStats.totalFocusTime),
      icon: Zap,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 dark:bg-indigo-900/30',
    },
    {
      label: 'Sessions',
      value: todayStats.sessionsCompleted.toString(),
      icon: Award,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    },
    {
      label: 'Break Time',
      value: formatTime(todayStats.totalBreakTime),
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/30',
    },
  ];

  return (
    <div className="glass-card rounded-xl sm:rounded-2xl md:rounded-[2rem] p-4 sm:p-5 md:p-6">
      <h3 className="text-[9px] sm:text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-3 sm:mb-4 md:mb-5 flex items-center gap-2">
        <span className="w-3 h-0.5 sm:w-4 bg-slate-300 rounded-full" />
        Today's Performance
      </h3>

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
              <stat.icon className={`w-4 h-4 sm:w-[18px] sm:h-[18px] ${stat.color}`} />
            </div>
            <p className="text-base sm:text-xl font-black text-slate-800 dark:text-white tabular-nums">
              {stat.value}
            </p>
            <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
