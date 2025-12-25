import React, { useMemo } from 'react';
import { format, subWeeks, startOfToday, eachDayOfInterval, startOfWeek } from 'date-fns';
import { useLogStore } from '../../store/useLogStore';
import { useTimerStore } from '../../store/useTimerStore';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export const ActivityHeatmap: React.FC = () => {
    const { logs } = useLogStore();
    const { todayStats } = useTimerStore();
    
    // Reduced to 13 weeks (approx 3 months)
    const weeks = 13;
    const today = startOfToday();
    const startDate = startOfWeek(subWeeks(today, weeks - 1));
    
    const days = useMemo(() => {
        return eachDayOfInterval({ start: startDate, end: today });
    }, [startDate, today]);

    // Group logs by day
    const dayStats = useMemo(() => {
        const stats: Record<string, number> = {};
        
        // 1. Add historical logs
        logs.forEach(log => {
            const dateStr = format(log.timestamp, 'yyyy-MM-dd');
            stats[dateStr] = (stats[dateStr] || 0) + (log.durationSeconds / 60);
        });

        // 2. Add today's real-time focus time (if not already logged)
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const realTimeMinutes = todayStats.totalFocusTime / 60;
        
        // Use the larger of the two to avoid double counting if a session was just saved
        stats[todayStr] = Math.max(stats[todayStr] || 0, realTimeMinutes);

        return stats;
    }, [logs, todayStats.totalFocusTime]);

    const getIntensity = (minutes: number) => {
        if (minutes === 0) return 0;
        if (minutes < 60) return 1;   // < 1 hour
        if (minutes < 120) return 2;  // < 2 hours
        if (minutes < 240) return 3;  // < 4 hours
        return 4;                     // 4+ hours
    };

    const intensityClasses = [
        "bg-slate-100 dark:bg-slate-800/40",
        "bg-emerald-200 dark:bg-emerald-900/50",
        "bg-emerald-400 dark:bg-emerald-600/70",
        "bg-emerald-500 dark:bg-emerald-500",
        "bg-emerald-600 dark:bg-emerald-400 shadow-lg shadow-emerald-500/30"
    ];

    // Split days into weeks for the grid
    const weeksData = useMemo(() => {
        const result = [];
        for (let i = 0; i < days.length; i += 7) {
            result.push(days.slice(i, i + 7));
        }
        return result;
    }, [days]);

    // Generate Month Labels
    const monthLabels = useMemo(() => {
        const labels: { name: string; index: number }[] = [];
        let currentMonth = -1;
        
        weeksData.forEach((week, index) => {
            const firstDayOfWeek = week[0];
            const month = firstDayOfWeek.getMonth();
            
            // Show label only when month changes or it's the first one
            if (month !== currentMonth) {
                // Calculate position based on week index
                // Note: This is a simplified approach. In a strict grid, index * columnWidth
                labels.push({ 
                    name: format(firstDayOfWeek, 'MMM'), 
                    index 
                });
                currentMonth = month;
            }
        });
        return labels;
    }, [weeksData]);

    return (
        <div className="glass-card rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 border border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-8">
                <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white mb-0.5 sm:mb-1 flex items-center gap-2">
                        Activity Consistency
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            3 Months
                        </span>
                    </h3>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400">Visualizing your study momentum</p>
                </div>
                
                {/* Legend */}
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Less</span>
                    <div className="flex gap-1.5">
                        {intensityClasses.map((_, i) => (
                            <div key={i} className={clsx("w-4 h-4 rounded-md", intensityClasses[i])} />
                        ))}
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">More</span>
                </div>
            </div>

            <div className="overflow-x-auto pb-4 pt-10 -mt-10 custom-scrollbar">
                <div className="min-w-max">
                    {/* Month Labels */}
                    <div className="flex mb-3 pl-1 relative h-6">
                        {monthLabels.map((label, i) => (
                            <div 
                                key={i} 
                                className="absolute text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                                style={{ left: `${label.index * 26}px` }} // Approx 24px (w-6) + 2px gap
                            >
                                {label.name}
                            </div>
                        ))}
                    </div>

                    {/* Heatmap Grid */}
                    <div className="flex gap-2">
                        {weeksData.map((week, wIndex) => (
                            <div key={wIndex} className="flex flex-col gap-2">
                                {week.map((day, dIndex) => {
                                    const dateStr = format(day, 'yyyy-MM-dd');
                                    const minutes = dayStats[dateStr] || 0;
                                    const intensity = getIntensity(minutes);
                                    const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                                    
                                    return (
                                        <motion.div 
                                            key={dIndex}
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: (wIndex * 7 + dIndex) * 0.001 }}
                                            className={clsx(
                                                "w-4 h-4 sm:w-5 sm:h-5 rounded-md transition-all duration-300 relative group cursor-default",
                                                intensityClasses[intensity],
                                                isToday && "ring-2 ring-indigo-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 z-10"
                                            )}
                                        >
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl border border-slate-700">
                                                <span className="block text-slate-400 text-[9px] mb-0.5 uppercase tracking-wider">{format(day, 'MMM do')}</span>
                                                <span className="text-white font-black text-xs">{Math.round(minutes / 60 * 10) / 10} hrs</span> <span className="text-slate-300">focused</span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                <div className="flex gap-8">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Sessions</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">{logs.length}</span>
                            <span className="text-[10px] text-slate-400 font-bold">sessions</span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peak Focus</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                                {Math.round(Math.max(...Object.values(dayStats), 0))}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">min / day</span>
                        </div>
                    </div>
                </div>
                
                <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800/50">
                   {/* Optional: Add a sparkline or mini-text here later */}
                   <span>Keep the streak alive! 🔥</span>
                </div>
            </div>
        </div>
    );
};
