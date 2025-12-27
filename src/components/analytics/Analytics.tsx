import React, { useEffect, useMemo } from 'react';
import { useLogStore } from '../../store/useLogStore';
import { useTimerStore } from '../../store/useTimerStore';
import { useSubjectStore } from '../../store/useSubjectStore';
import { BarChart2, PieChart, Clock, Trophy, TrendingUp, CheckCircle2 } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ActivityHeatmap } from '../dashboard/ActivityHeatmap';

export const Analytics: React.FC = () => {
  const { logs, loadAllLogs } = useLogStore();
  const { subjects, loadSubjects, topics, loadAllTopics } = useSubjectStore();
  const { todayStats } = useTimerStore();

  useEffect(() => {
    loadAllLogs(); 
    loadSubjects();
    loadAllTopics();
  }, [loadAllLogs, loadSubjects, loadAllTopics]);

  const topicStats = useMemo(() => {
      const completed = topics.filter(t => t.status === 'completed').length;
      const total = topics.length;
      return { completed, total };
  }, [topics]);

  // --- Insight Calculations ---

  const formatTimeDetailed = (totalSeconds: number) => {
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = Math.floor(totalSeconds % 60);
      
      if (h > 0) return `${h}h ${m}m ${s}s`;
      if (m > 0) return `${m}m ${s}s`;
      return `${s}s`;
  };

  // 1. Weekly Focus (Fixed Week starting Monday)
  const weeklyData = useMemo(() => {
    const data = [];
    // Start from Monday of the current week
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(monday, i);
      const isToday = isSameDay(new Date(), date);
      const isFuture = date > new Date() && !isToday;
      
      // Filter logs for this specific day
      const dayLogs = logs.filter(log => isSameDay(new Date(log.date), date));
      
      let totalSeconds = 0;
      if (!isFuture) {
        // 1. Add timer time for today
        if (isToday) {
          totalSeconds += todayStats.totalFocusTime;
        }

        // 2. Add non-timer logs for all days, or timer logs for previous days
        totalSeconds += dayLogs.reduce((acc, log) => {
            const isTimerLog = (log as any).notes === 'Timer Session';
            const isTodayLog = isSameDay(new Date(log.date), new Date());
            
            // Skip today's timer logs because we use todayStats.totalFocusTime for those
            if (isTodayLog && isTimerLog) return acc;
            
            const seconds = log.durationSeconds || ((log as any).duration * 60) || ((log as any).durationMinutes * 60) || 0;
            return acc + seconds;
        }, 0);
      }
      
      data.push({
        day: format(date, 'EEE'), // Mon, Tue...
        hours: totalSeconds / 3600,
        fullDate: date,
        isFuture
      });
    }
    return data;
  }, [logs, todayStats.totalFocusTime]);

  // 2. Subject Breakdown
  const subjectData = useMemo(() => {
     const map = new Map<number, number>();
     
     // 1. Add historical logs AND manual logs from today
     logs.forEach(log => {
         const isTimerLog = (log as any).notes === 'Timer Session';
         const isTodayLog = isSameDay(new Date(log.date), new Date());
         
         // Skip today's timer logs because we use todayStats.subjectFocusTime for those
         if (isTodayLog && isTimerLog) return;
         
         const seconds = log.durationSeconds || ((log as any).duration * 60) || ((log as any).durationMinutes * 60) || 0;
         const current = map.get(log.subjectId) || 0;
         map.set(log.subjectId, current + seconds);
     });
     
     // 2. Add today's timer accumulation
     if (todayStats.subjectFocusTime) {
         Object.entries(todayStats.subjectFocusTime).forEach(([sid, seconds]) => {
             const subjectId = parseInt(sid);
             if (isNaN(subjectId)) return;
             const current = map.get(subjectId) || 0;
             map.set(subjectId, current + (seconds as number));
         });
     }
     
     const totalTime = Array.from(map.values()).reduce((a, b) => a + b, 0);
     
     return Array.from(map.entries()).map(([id, seconds]) => {
         const subject = subjects.find(s => s.id === id);
         return {
             name: subject?.name || 'Unknown',
             color: subject?.color || '#ccc',
             seconds,
             percentage: totalTime > 0 ? (seconds / totalTime) * 100 : 0
         };
     }).sort((a, b) => b.seconds - a.seconds);
  }, [logs, subjects, todayStats.totalFocusTime, todayStats.subjectFocusTime]);

  // 3. Key Stats
  const totalStudySeconds = useMemo(() => {
    // 1. Sum logs but skip today's timer logs
    const historicalAndManualSeconds = logs.reduce((acc, log) => {
        const isTimerLog = (log as any).notes === 'Timer Session';
        const isTodayLog = isSameDay(new Date(log.date), new Date());
        
        if (isTodayLog && isTimerLog) return acc;

        const seconds = log.durationSeconds || ((log as any).duration * 60) || ((log as any).durationMinutes * 60) || 0;
        return acc + seconds;
    }, 0);

    // 2. Add all today's timer time
    return historicalAndManualSeconds + todayStats.totalFocusTime;
  }, [logs, todayStats.totalFocusTime]);
  
  const mostFocusedSubject = subjectData.length > 0 ? subjectData[0] : null;

  const currentWeekSeconds = useMemo(() => {
     return weeklyData.reduce((acc, d) => acc + (d.hours * 3600), 0);
  }, [weeklyData]);

  // --- Helper Components ---

  const BarChart = () => {
    const maxHours = Math.max(...weeklyData.map(d => d.hours), 1); // Minimum max of 1h for scale
    
    return (
        <div className="h-48 flex items-end justify-between gap-2 px-2 border-b border-gray-100 dark:border-gray-800 pb-1">
            {weeklyData.map((d, i) => {
                const heightPercentage = (d.hours / maxHours) * 100;
                // Minimum visible height for non-future days with 0 hours, just to show the slot
                const displayHeight = d.hours === 0 && !d.isFuture ? '4px' : `${heightPercentage}%`;

                return (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer h-full justify-end">
                        <div className="relative w-full flex justify-center items-end h-full">
                            {/* Tooltip */}
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-10 bg-gray-900 text-white text-[10px] px-2 py-1.5 rounded-lg transition-all transform scale-90 group-hover:scale-100 whitespace-nowrap z-50 pointer-events-none shadow-xl border border-white/10 font-bold">
                                {format(d.fullDate, 'EEEE, MMM do')}
                                <div className="text-primary mt-0.5">{(d.hours).toFixed(1)}h focused</div>
                            </div>
                            {/* Bar Container */}
                            <div className="w-full max-w-[32px] h-full flex items-end">
                                <div 
                                    className={`w-full rounded-t-lg transition-all duration-700 ease-out relative
                                        ${d.isFuture ? 'bg-gray-100 dark:bg-gray-800/20' : 'bg-primary/90 dark:bg-indigo-500/60 hover:bg-primary dark:hover:bg-indigo-400'}
                                        ${d.hours > 0 ? 'shadow-lg shadow-primary/10' : ''}
                                    `}
                                    style={{ 
                                        height: displayHeight,
                                        transitionDelay: `${i * 50}ms`
                                    }}
                                >
                                    {/* Pulse effect for today if active */}
                                    {isSameDay(new Date(), d.fullDate) && d.hours > 0 && (
                                        <div className="absolute inset-0 rounded-t-lg bg-white/20 animate-pulse" />
                                    )}
                                </div>
                            </div>
                        </div>
                        <span className={`text-[10px] uppercase font-black tracking-tighter transition-colors ${
                            isSameDay(new Date(), d.fullDate) ? 'text-primary' : 'text-gray-400'
                        }`}>
                            {d.day}
                        </span>
                    </div>
                );
            })}
        </div>
    );
  };

  const DonutChart = () => {
      // Simple CSS Conic Gradient
      const gradient = subjectData.reduce((acc, item, index) => {
          const prevPerc = subjectData.slice(0, index).reduce((a, b) => a + b.percentage, 0);
          return `${acc}, ${item.color} ${prevPerc}% ${prevPerc + item.percentage}%`;
      }, '');
      
      const conicStyle = subjectData.length > 0 ? `conic-gradient(${gradient.substring(2)})` : '#e5e7eb';

      return (
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 justify-center">
              <div 
                className="w-40 h-40 aspect-square flex-shrink-0 rounded-full relative"
                style={{ background: conicStyle }}
              >
                  <div className="absolute inset-4 bg-white/90 dark:bg-slate-800/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <div className="text-center">
                          <p className="text-2xl font-bold">{(totalStudySeconds / 3600).toFixed(1)}</p>
                          <p className="text-xs text-gray-500 uppercase">Hours</p>
                      </div>
                  </div>
              </div>
              <div className="space-y-2">
                  {subjectData.slice(0, 4).map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="text-gray-700 dark:text-gray-200 font-medium truncate max-w-[100px]">{s.name}</span>
                          <span className="text-gray-400 text-xs">{s.percentage.toFixed(0)}%</span>
                      </div>
                  ))}
              </div>
          </div>
      );
  };


  return (
    <div className="page-transition space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Insights <TrendingUp className="text-primary" />
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Your study habits decoded.
                </p>
            </div>
        </div>

        {/* Key Stats Cards */}
        <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-6">
            <div className="glass-card p-1.5 sm:p-6 rounded-xl sm:rounded-3xl flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-4 text-center sm:text-left">
                <div className="p-1.5 sm:p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg sm:rounded-2xl">
                    <Clock size={12} className="sm:w-7 sm:h-7" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-gray-500 dark:text-gray-400 text-[5px] sm:text-xs uppercase font-black tracking-tight sm:tracking-wider truncate">Total Focus</h3>
                    <p className="text-[9px] sm:text-2xl font-black text-gray-900 dark:text-white dark:text-neon-indigo truncate">{formatTimeDetailed(totalStudySeconds)}</p>
                </div>
            </div>
            
            <div className="glass-card p-1.5 sm:p-6 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-4 text-center sm:text-left">
                <div className="p-1.5 sm:p-4 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg sm:rounded-2xl">
                    <CheckCircle2 size={12} className="sm:w-7 sm:h-7" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-gray-500 dark:text-gray-400 text-[5px] sm:text-xs uppercase font-black tracking-tight sm:tracking-wider truncate">Topics Done</h3>
                    <p className="text-[9px] sm:text-2xl font-black text-gray-900 dark:text-white dark:text-neon-emerald">{topicStats.completed}</p>
                </div>
            </div>
            
            <div className="glass-card p-1.5 sm:p-6 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-4 text-center sm:text-left">
                <div className="p-1.5 sm:p-4 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg sm:rounded-2xl">
                    <Trophy size={12} className="sm:w-7 sm:h-7" />
                </div>
                <div className="min-w-0 w-full">
                     <h3 className="text-gray-500 dark:text-gray-400 text-[5px] sm:text-xs uppercase font-black tracking-tight sm:tracking-wider truncate">Top Subject</h3>
                     <p className="text-[9px] sm:text-xl font-black text-gray-900 dark:text-white dark:text-neon-orange truncate">
                         {mostFocusedSubject ? mostFocusedSubject.name : 'N/A'}
                     </p>
                </div>
            </div>
 
             <div className="glass-card p-1.5 sm:p-6 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-4 text-center sm:text-left">
                <div className="p-1.5 sm:p-4 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg sm:rounded-2xl">
                    <BarChart2 size={12} className="sm:w-7 sm:h-7" />
                </div>
                <div className="min-w-0">
                     <h3 className="text-gray-500 dark:text-gray-400 text-[5px] sm:text-xs uppercase font-black tracking-tight sm:tracking-wider truncate">This Week</h3>
                     <p className="text-[9px] sm:text-2xl font-black text-gray-900 dark:text-white dark:text-neon-purple">{(currentWeekSeconds / 3600).toFixed(1)}h</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Activity */}
            <div className="glass-card p-6 rounded-3xl">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Clock size={18} className="text-gray-400" /> Weekly Activity
                </h2>
                <BarChart />
            </div>

            {/* Distribution */}
            <div className="glass-card p-6 rounded-3xl">
                 <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <PieChart size={18} className="text-gray-400" /> Subject Mix
                </h2>
                {subjectData.length > 0 ? (
                     <DonutChart />
                ) : (
                    <div className="h-40 flex flex-col items-center justify-center text-gray-400">
                        <PieChart size={32} className="mb-2 opacity-20" />
                        <p className="italic">No timer data yet</p>
                        <p className="text-xs mt-1">Complete a timer session to see stats</p>
                    </div>
                )}
            </div>
        </div>

        {/* Activity Consistency */}
        <ActivityHeatmap />
    </div>
  );
};