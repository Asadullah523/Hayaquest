import React, { useMemo, useState, useEffect } from 'react';
import { format, startOfToday, eachDayOfInterval, startOfWeek, addMonths, isAfter } from 'date-fns';
import { useLogStore } from '../../store/useLogStore';
import { useTimerStore } from '../../store/useTimerStore';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ChevronDown } from 'lucide-react';

const GOAL_OPTIONS = [3, 6, 9, 12];

export const ActivityHeatmap: React.FC = () => {
    const { logs } = useLogStore();
    const { todayStats } = useTimerStore();
    
    const today = startOfToday();

    // Read persisted month goal from localStorage (default: 3)
    const [monthGoal, setMonthGoal] = useState<number>(() => {
        const stored = localStorage.getItem('heatmap_month_goal');
        if (stored) {
            const val = parseInt(stored);
            if (GOAL_OPTIONS.includes(val)) return val;
        }
        return 3;
    });
    const [showGoalPicker, setShowGoalPicker] = useState(false);

    const handleGoalChange = (months: number) => {
        setMonthGoal(months);
        localStorage.setItem('heatmap_month_goal', months.toString());
        setShowGoalPicker(false);
    };

    // Close picker when clicking outside
    useEffect(() => {
        if (!showGoalPicker) return;
        const handler = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('[data-goal-picker]')) {
                setShowGoalPicker(false);
            }
        };
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [showGoalPicker]);

    // Determine when the user's journey started
    const journeyStart = useMemo(() => {
        const stored = localStorage.getItem('heatmap_start_date');
        if (stored) {
            const d = new Date(parseInt(stored));
            if (!isNaN(d.getTime())) return d;
        }

        if (logs.length > 0) {
            const earliest = logs.reduce((min, log) => {
                const t = log.timestamp || log.date;
                return t < min ? t : min;
            }, logs[0].timestamp || logs[0].date);
            const d = new Date(earliest);
            if (!isNaN(d.getTime())) {
                localStorage.setItem('heatmap_start_date', d.getTime().toString());
                return d;
            }
        }

        localStorage.setItem('heatmap_start_date', Date.now().toString());
        return today;
    }, [logs, today]);

    // Range: from the Monday of the journey week to N months after journey start
    // This includes FUTURE days (like GitHub) — no cap at today
    const rangeStart = useMemo(() => startOfWeek(journeyStart, { weekStartsOn: 1 }), [journeyStart]);
    const rangeEnd = useMemo(() => addMonths(rangeStart, monthGoal), [rangeStart, monthGoal]);
    
    const days = useMemo(() => {
        return eachDayOfInterval({ start: rangeStart, end: rangeEnd });
    }, [rangeStart, rangeEnd]);

    // Group logs by day
    const dayStats = useMemo(() => {
        const stats: Record<string, number> = {};
        
        logs.forEach(log => {
            const dateStr = format(log.timestamp, 'yyyy-MM-dd');
            stats[dateStr] = (stats[dateStr] || 0) + (log.durationSeconds / 60);
        });

        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const realTimeMinutes = todayStats.totalFocusTime / 60;
        stats[todayStr] = Math.max(stats[todayStr] || 0, realTimeMinutes);

        return stats;
    }, [logs, todayStats.totalFocusTime]);

    const getIntensity = (minutes: number) => {
        if (minutes === 0) return 0;
        if (minutes < 60) return 1;
        if (minutes < 120) return 2;
        if (minutes < 240) return 3;
        return 4;
    };

    const intensityClasses = [
        "bg-slate-100 dark:bg-slate-800/40",
        "bg-emerald-200 dark:bg-emerald-900/50",
        "bg-emerald-400 dark:bg-emerald-600/70",
        "bg-emerald-500 dark:bg-emerald-500",
        "bg-emerald-600 dark:bg-emerald-400 shadow-lg shadow-emerald-500/30"
    ];

    // Split days into weeks
    const weeksData = useMemo(() => {
        const result = [];
        for (let i = 0; i < days.length; i += 7) {
            result.push(days.slice(i, i + 7));
        }
        return result;
    }, [days]);

    // Month labels
    const monthLabels = useMemo(() => {
        const labels: { name: string; index: number }[] = [];
        let currentMonth = -1;
        
        weeksData.forEach((week, index) => {
            const firstDayOfWeek = week[0];
            const month = firstDayOfWeek.getMonth();
            
            if (month !== currentMonth) {
                labels.push({ 
                    name: format(firstDayOfWeek, 'MMM'), 
                    index 
                });
                currentMonth = month;
            }
        });
        return labels;
    }, [weeksData]);

    // Range label
    const rangeLabel = useMemo(() => {
        const startMonth = format(rangeStart, 'MMM');
        const endMonth = format(rangeEnd, 'MMM');
        if (startMonth === endMonth) return startMonth;
        return `${startMonth} — ${endMonth}`;
    }, [rangeStart, rangeEnd]);

    // Calculate completion progress
    const totalDays = days.length;
    const activeDays = useMemo(() => {
        return days.filter(d => {
            const ds = format(d, 'yyyy-MM-dd');
            return (dayStats[ds] || 0) > 0;
        }).length;
    }, [days, dayStats]);
    const completionPercent = totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0;

    return (
        <div className="glass-card rounded-3xl 2xl:rounded-[2.5rem] p-4 lg:p-6 2xl:p-8 border border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 lg:mb-6 2xl:mb-8">
                <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white mb-0.5 sm:mb-1 flex items-center gap-2">
                        Activity Consistency
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {monthGoal} Months • {rangeLabel}
                        </span>
                    </h3>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400">Visualizing your study momentum</p>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400">
                        Your study momentum since {format(journeyStart, 'MMM do, yyyy')}
                    </p>
                </div>
                
                <div className="flex items-center gap-2">
                    {/* Goal Picker Button */}
                    <div className="relative" data-goal-picker>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowGoalPicker(!showGoalPicker); }}
                            className={clsx(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all border",
                                showGoalPicker 
                                    ? "bg-primary/10 text-primary border-primary/30 shadow-lg shadow-primary/10" 
                                    : "bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:border-primary/30 hover:text-primary"
                            )}
                        >
                            <Target size={14} />
                            <span className="hidden sm:inline">Goal:</span> {monthGoal}mo
                            <ChevronDown size={12} className={clsx("transition-transform", showGoalPicker && "rotate-180")} />
                        </button>
                        
                        <AnimatePresence>
                            {showGoalPicker && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2 z-50 min-w-[140px]"
                                >
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 mb-1.5">Set Goal</p>
                                    {GOAL_OPTIONS.map(opt => (
                                        <button
                                            key={opt}
                                            onClick={(e) => { e.stopPropagation(); handleGoalChange(opt); }}
                                            className={clsx(
                                                "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between",
                                                monthGoal === opt 
                                                    ? "bg-primary/10 text-primary" 
                                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                            )}
                                        >
                                            <span>{opt} months</span>
                                            {monthGoal === opt && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            )}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
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
            </div>

            <div className="overflow-x-auto pb-4 pt-10 -mt-10 custom-scrollbar">
                <div className="min-w-max pl-3 sm:pl-6">
                    {/* Month Labels */}
                    <div className="flex mb-3 pl-1 relative h-6">
                        {monthLabels.map((label, i) => (
                            <div 
                                key={i} 
                                className="absolute text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                                style={{ left: `${label.index * 26}px` }}
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
                                    const isFuture = isAfter(day, today);
                                    const minutes = isFuture ? 0 : (dayStats[dateStr] || 0);
                                    const intensity = isFuture ? -1 : getIntensity(minutes);
                                    const isCurrentDay = dateStr === format(new Date(), 'yyyy-MM-dd');
                                    
                                    return (
                                        <motion.div 
                                            key={dIndex}
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: (wIndex * 7 + dIndex) * 0.001 }}
                                            className={clsx(
                                                "w-4 h-4 sm:w-5 sm:h-5 rounded-md transition-all duration-300 relative group cursor-default",
                                                isFuture 
                                                    ? "bg-slate-50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-700/50" 
                                                    : intensityClasses[intensity],
                                                isCurrentDay && "ring-2 ring-indigo-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 z-10"
                                            )}
                                        >
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl border border-slate-700">
                                                <span className="block text-slate-400 text-[9px] mb-0.5 uppercase tracking-wider">{format(day, 'MMM do')}</span>
                                                {isFuture ? (
                                                    <span className="text-slate-300 text-[10px]">Upcoming</span>
                                                ) : (
                                                    <><span className="text-white font-black text-xs">{Math.round(minutes / 60 * 10) / 10} hrs</span> <span className="text-slate-300">focused</span></>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-6 lg:mt-8 2xl:mt-12 pt-4 lg:pt-6 border-t border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-6 sm:gap-8">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Days</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">{activeDays}</span>
                            <span className="text-[10px] text-slate-400 font-bold">/ {totalDays}</span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Completion</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-emerald-500 leading-none">{completionPercent}%</span>
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
                
                {/* Progress bar */}
                <div className="w-full sm:w-40">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{monthGoal}-Month Goal</span>
                        <span className="text-[9px] font-black text-emerald-500">{completionPercent}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${completionPercent}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
