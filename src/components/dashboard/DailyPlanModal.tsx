import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, ArrowRight, Play, Check } from 'lucide-react';
import { useSubjectStore } from '../../store/useSubjectStore';
import { useTimetableStore } from '../../store/useTimetableStore';
import { useTimerStore } from '../../store/useTimerStore';
import { SubjectVisual } from '../subjects/SubjectVisual';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import type { Subject, Topic } from '../../types';

interface DailyPlanModalProps {
  onClose: () => void;
}

export const DailyPlanModal: React.FC<DailyPlanModalProps> = ({ onClose }) => {
  const { getDailyTasks, markDailyTaskComplete, subjects } = useSubjectStore();
  const { slots, toggleSlotComplete, isSlotCompleted } = useTimetableStore();
  const { setMode } = useTimerStore();

  const today = new Date().getDay();
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todaySlots = slots.filter(s => s.dayOfWeek === today);
  const dailyTasks = getDailyTasks();
  
  const currentTime = new Date();
  const currentHour = currentTime.getHours();

  const handleStartSession = (subjectId?: number, duration: number = 25) => {
    setMode('focus');
    useTimerStore.setState({ timeLeft: duration * 60 });
    setTimeout(() => {
        useTimerStore.getState().startSession(subjectId);
        useTimerStore.getState().start();
        onClose();
    }, 100);
  };

  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const getDurationInMinutes = (start: string, end: string) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    return (endH * 60 + endM) - (startH * 60 + startM);
  };

  const format12h = (time24: string) => {
    if (!time24) return '';
    const [hour, minute] = time24.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop - Blurred but allowing content behind to be vaguely seen */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-md transition-all duration-500 cursor-pointer" 
        onClick={onClose}
      />

      {/* Modal Card - Larger and perfectly centered */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg sm:max-w-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-auto max-h-[85vh] border border-white/50 dark:border-slate-700/50"
        onClick={e => e.stopPropagation()}
      >
            {/* Header */}
            <div className="p-8 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-md z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">Today's Plan</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20 transition-colors"
                >
                  <X size={24} />
                </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                
                {/* Time Slots Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest pl-2">Scheduled Sessions</h3>
                    
                    {todaySlots.length === 0 ? (
                        <div className="p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center">
                            <Clock size={32} className="text-slate-200 dark:text-slate-700 mb-2" />
                            <p className="font-bold text-slate-400 text-sm">No sessions scheduled</p>
                            <NavLink to="/timetable" onClick={onClose} className="text-xs font-bold text-indigo-500 hover:text-indigo-600 mt-1">
                                Add to Timetable →
                            </NavLink>
                        </div>
                    ) : (
                        todaySlots.map(slot => {
                            const subject = subjects.find(s => s.id === slot.subjectId);
                            if (!subject && !slot.title) return null;
                            const isCompleted = slot.id ? isSlotCompleted(todayDateStr, slot.id) : false;
                            const duration = getDurationInMinutes(slot.startTime, slot.endTime);
                            const slotHour = parseInt(slot.startTime.split(':')[0]);
                            const isNow = slotHour === currentHour;

                            return (
                                <div key={slot.id} className={clsx("flex items-center gap-4 p-4 rounded-2xl border transition-all", 
                                    isCompleted ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20" :
                                    isNow ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800 shadow-md" :
                                    "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800"
                                )}>
                                    <button 
                                        onClick={() => slot.id && toggleSlotComplete(todayDateStr, slot.id)}
                                        className={clsx("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                        isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 dark:border-slate-600 text-transparent hover:border-indigo-500"
                                    )}>
                                        <Check size={14} strokeWidth={4} />
                                    </button>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            {subject && <SubjectVisual subject={subject} size="sm" />}
                                            <span className={clsx("font-black text-sm truncate", isCompleted ? "text-slate-400 dark:text-slate-500 line-through" : "text-slate-900 dark:text-white")}>
                                                {subject?.name || slot.title || 'Activity'}
                                            </span>
                                            {subject && slot.title && (
                                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
                                            )}
                                            {subject && slot.title && (
                                                <span className={clsx("text-xs font-bold truncate", isCompleted ? "text-slate-400/70 line-through" : "text-indigo-500/80 dark:text-indigo-400/80")}>
                                                    {slot.title}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-6">
                                            <span className="flex items-center gap-1"><Clock size={12} className="opacity-70" /> {format12h(slot.startTime)} - {format12h(slot.endTime)}</span>
                                            <span className="opacity-30">•</span>
                                            <span>{duration}m</span>
                                            {isNow && !isCompleted && <span className="text-indigo-600 dark:text-indigo-400 animate-pulse font-black">NOW</span>}
                                        </div>
                                    </div>

                                    {!isCompleted && isNow && (
                                        <button 
                                            onClick={() => handleStartSession(subject?.id, duration)}
                                            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                                        >
                                            <Play size={16} fill="currentColor" />
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Daily Tasks Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest pl-2">Daily Tasks</h3>
                    
                    {dailyTasks.length === 0 ? (
                         <div className="p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center">
                            <Check size={32} className="text-slate-200 dark:text-slate-700 mb-2" />
                            <p className="font-bold text-slate-400 text-sm">No tasks for today</p>
                            <p className="text-[10px] text-slate-400 max-w-[150px] mt-1">Tasks appear here based on your subject schedule.</p>
                        </div>
                    ) : (
                        dailyTasks.map(({ topic, subject, isCompletedToday }: { topic: Topic; subject: Subject; isCompletedToday: boolean }) => (
                            <div key={topic.id} className={clsx("flex items-center gap-4 p-4 rounded-2xl border transition-all",
                                isCompletedToday ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20" :
                                "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800"
                            )}>
                                <button 
                                    onClick={() => !isCompletedToday && topic.id && markDailyTaskComplete(topic.id)}
                                    disabled={isCompletedToday}
                                    className={clsx("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                    isCompletedToday ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 dark:border-slate-600 text-transparent hover:border-indigo-500"
                                )}>
                                    <Check size={14} strokeWidth={4} />
                                </button>

                                <div className="flex-1">
                                    <p className={clsx("font-bold text-sm mb-1", isCompletedToday ? "text-slate-500 line-through" : "text-slate-900 dark:text-white")}>
                                        {topic.name}
                                    </p>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        <SubjectVisual subject={subject} size="sm" className="w-4 h-4 rounded-md scale-75 origin-left" />
                                        {subject.name}
                                    </div>
                                </div>

                                <NavLink 
                                    to={`/subjects/${subject.id}`}
                                    onClick={onClose}
                                    className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                                >
                                    <ArrowRight size={18} />
                                </NavLink>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Footer Gradient Fade for scroll hint */}
            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none" />
      </motion.div>
    </div>,
    document.body
  );
};
