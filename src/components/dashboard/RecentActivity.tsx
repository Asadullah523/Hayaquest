import React, { useEffect } from 'react';
import { useLogStore } from '../../store/useLogStore';
import { useSubjectStore } from '../../store/useSubjectStore';
import { Clock, History, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const RecentActivity: React.FC = () => {
  const { recentLogs, loadRecentLogs } = useLogStore();
  const { subjects } = useSubjectStore();

  useEffect(() => {
    loadRecentLogs(5); // Show last 5 sessions
  }, [loadRecentLogs]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  if (recentLogs.length === 0) {
    return (
      <div className="glass-card rounded-[2rem] p-8 text-center">
        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
          <History size={24} />
        </div>
        <p className="text-sm font-bold text-slate-400">No recent sessions found.</p>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2">Start a timer to log activity!</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl sm:rounded-2xl md:rounded-[2.5rem] p-4 sm:p-5 md:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      <div className="flex items-center justify-between px-0 sm:px-1 md:px-2">
        <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-800 dark:text-white flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
            <History size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
          Recent Activity
        </h3>
      </div>

      <div className="space-y-2 sm:space-y-3 md:space-y-4">
        {recentLogs.map((log) => {
          const subject = subjects.find((s) => s.id === log.subjectId);
          return (
            <div 
              key={log.id} 
              className="flex items-center justify-between p-2.5 sm:p-3 md:p-4 bg-white dark:bg-slate-800/50 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800 hover:scale-[1.02] transition-all group"
            >
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 overflow-hidden">
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 transition-colors shrink-0">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm md:text-base text-slate-800 dark:text-white leading-tight truncate">
                    {subject?.name || 'Unknown Subject'}
                  </h4>
                  <p className="text-[7px] sm:text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">
                    {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p className="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400">
                  +{formatDuration(log.durationSeconds)}
                </p>
                <div className="flex items-center justify-end text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5 sm:mt-1">
                  Logged <ChevronRight size={10} className="ml-0.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
