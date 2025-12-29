import { Check, ListTodo, ArrowRight, Play, Clock, CheckCircle2 } from 'lucide-react';
// ... kept CheckCircle2 for the large animation if needed or remove it?
// The large animation uses CheckCircle2 size=32. That's fine as a standalone icon.
// But the checkboxes need Check.

import React, { useEffect } from 'react';
import { useSubjectStore } from '../../store/useSubjectStore';
import { useTimetableStore } from '../../store/useTimetableStore';
import { useTimerStore } from '../../store/useTimerStore';
import { syncService } from '../../services/syncService';
import { NavLink } from 'react-router-dom';
import { SubjectVisual } from '../subjects/SubjectVisual';
import type { Subject, Topic } from '../../types';

export const DailyTasksWidget: React.FC = () => {
  const { getDailyTasks, markDailyTaskComplete, loadSubjects, loadTopics, subjects } = useSubjectStore();
  const { slots, loadTimetable, toggleSlotComplete, isSlotCompleted } = useTimetableStore();
  const { setMode } = useTimerStore();
  const [animatingTask, setAnimatingTask] = React.useState<number | null>(null);
  const [animatingSlot, setAnimatingSlot] = React.useState<number | null>(null);

  useEffect(() => {
    loadSubjects();
    loadTimetable();
    subjects.forEach((subject: Subject) => {
      if (subject.id) {
        loadTopics(subject.id);
      }
    });
  }, [loadSubjects, loadTopics, loadTimetable, subjects.length]);

  const today = new Date().getDay();
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todaySlots = slots.filter(s => s.dayOfWeek === today);
  
  const dailyTasks = getDailyTasks();
  
  const completedDailyTasks = dailyTasks.filter((t: { isCompletedToday: boolean }) => t.isCompletedToday).length;
  const completedSlotsCount = todaySlots.filter(slot => slot.id && isSlotCompleted(todayDateStr, slot.id)).length;
  
  const completedCount = completedDailyTasks + completedSlotsCount;
  const totalCount = dailyTasks.length + todaySlots.length;

  const handleMarkComplete = async (topicId: number) => {
    setAnimatingTask(topicId);
    await markDailyTaskComplete(topicId);
    syncService.triggerAutoBackup();
    setTimeout(() => setAnimatingTask(null), 600);
  };

  const handleToggleSlot = (slotId: number) => {
    setAnimatingSlot(slotId);
    toggleSlotComplete(todayDateStr, slotId);
    syncService.triggerAutoBackup();
    setTimeout(() => setAnimatingSlot(null), 600);
  };

  const getDurationInMinutes = (start: string, end: string) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    return (endH * 60 + endM) - (startH * 60 + startM);
  };

  const handleStartSession = (subjectId?: number, duration: number = 25) => {
    setMode('focus');
    // Override the time for this specific session without changing global settings
    useTimerStore.setState({ timeLeft: duration * 60 });
    
    setTimeout(() => {
      useTimerStore.getState().startSession(subjectId);
      useTimerStore.getState().start();
    }, 100);
  };

  const currentTime = new Date();
  const currentHour = currentTime.getHours();

  const format12h = (time24: string) => {
    if (!time24) return '';
    const [hour, minute] = time24.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  if (dailyTasks.length === 0 && todaySlots.length === 0) {
    return (
      <div className="glass-card rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden text-center group">
        <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:scale-110 transition-transform">
          <ListTodo size={100} />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
           <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-500 mb-2">
             <ListTodo size={32} />
           </div>
           <h3 className="text-xl font-black text-slate-800 dark:text-white">All Clear!</h3>
           <p className="text-slate-500 dark:text-slate-400 max-w-[200px] mx-auto text-sm">
             No tasks or sessions scheduled for today. Create a timetable or add recurring tasks!
           </p>
           <NavLink 
             to="/timetable"
             className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors"
           >
             Create Schedule
           </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-[2.5rem] p-5 sm:p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600">
             <ListTodo size={24} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 dark:text-white text-lg">Daily Agenda</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {completedCount} of {totalCount} Completed
            </p>
          </div>
        </div>
        
        {/* Progress Circle */}
        <div className="relative w-14 h-14">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100 dark:text-slate-800" />
            <circle 
              cx="28" cy="28" r="24" 
              stroke="currentColor" strokeWidth="4" 
              fill="transparent" 
              strokeDasharray={150.8} 
              strokeDashoffset={150.8 - (150.8 * completedCount) / (totalCount || 1)} 
              className="text-indigo-600 transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-800 dark:text-white">
            {Math.round((completedCount / (totalCount || 1)) * 100)}%
          </span>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {todaySlots.map((slot) => {
          const subject = subjects.find(s => s.id === slot.subjectId);
          // Allow slots without subjects but with a title
          if (!subject && !slot.title) return null;
          
          const slotHour = parseInt(slot.startTime.split(':')[0]);
          const isNow = slotHour === currentHour;
          const isPast = slotHour < currentHour;
          const isCompleted = slot.id ? isSlotCompleted(todayDateStr, slot.id) : false;
          
          const duration = getDurationInMinutes(slot.startTime, slot.endTime);
          
          return (
            <div 
              key={`slot-${slot.id}`}
              className={`relative flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 border min-h-[58px] sm:min-h-[68px] ${
                isCompleted
                    ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20' 
                    : isNow
                      ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-500 dark:border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)] dark:shadow-[0_0_20px_rgba(99,102,241,0.6)] ring-1 ring-indigo-400/50 dark:ring-indigo-400 relative z-10' 
                      : isPast
                        ? 'bg-slate-50/50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-600/50 opacity-85'
                        : `bg-white dark:bg-slate-700/90 border-slate-100 dark:border-slate-600 hover:border-indigo-200 dark:hover:border-indigo-500 hover:bg-white dark:hover:bg-slate-700 hover:-translate-y-0.5 hover:shadow-lg ${subject ? 'shadow-[0_0_10px_-3px_rgba(99,102,241,0.15)] dark:shadow-[0_0_12px_-3px_rgba(99,102,241,0.3)] border-indigo-100/50 dark:border-indigo-500/30' : 'hover:shadow-indigo-500/10'}`
              }`}
            >
              {/* Completion Animation */}
              {animatingSlot === slot.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 rounded-2xl animate-fade-in">
                  <CheckCircle2 size={32} className="text-emerald-500 animate-bounce" />
                </div>
              )}

              {/* Checkbox */}
              <button
                  onClick={() => slot.id && handleToggleSlot(slot.id)}
                  className={`shrink-0 w-4 h-4 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isCompleted 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-indigo-500 component-clickable'
                  }`}
                >
                  <Check size={9} strokeWidth={4} className={`${isCompleted ? 'opacity-100' : 'opacity-0'} sm:w-3.5 sm:h-3.5`} />
              </button>

              {/* Subject Icon */}
              {subject ? (
                <SubjectVisual subject={subject} size="sm" className="w-7 h-7 sm:w-9 sm:h-9 shrink-0 self-center" />
              ) : (
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 self-center">
                  <Clock size={12} className="sm:w-5 sm:h-5" />
                </div>
              )}
              
              {/* Text Content - MUST have flex-1 and min-w-0 */}
              <div className="flex-1 min-w-0 pl-1 sm:pl-0">
                <p className={`font-black truncate text-[11px] sm:text-sm leading-tight ${
                  isCompleted ? 'text-slate-400 dark:text-slate-500' : isPast ? 'text-slate-400 dark:text-slate-300' : 'text-slate-800 dark:text-white dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]'
                }`}>
                  {subject?.name || slot.title || 'Activity'}
                </p>
                {subject && slot.title && (
                  <p className={`text-[9px] sm:text-[10px] font-bold truncate leading-tight ${
                    isCompleted ? 'text-slate-400/70' : 'text-indigo-500 dark:text-[hsl(133.9deg_100%_68.2%)]'
                  }`}>
                    {slot.title}
                  </p>
                )}
                <div className={`flex flex-wrap items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[9px] font-bold uppercase mt-0.5 ${
                  isCompleted ? 'text-slate-400' : 'text-slate-400 dark:text-slate-300'
                }`}>
                  <Clock size={8} className="opacity-70 sm:w-2.5 sm:h-2.5 shrink-0" />
                  <span>{format12h(slot.startTime)}</span>
                  <span>-</span>
                  <span>{format12h(slot.endTime)}</span>
                  <span className="opacity-50">•</span>
                  <span>{duration}M</span>
                  {isNow && !isCompleted && <span className="text-indigo-600 dark:text-indigo-400 font-black">NOW</span>}
                </div>
              </div>

              {/* Play Button */}
              {isNow && !isCompleted && (
                <button 
                  onClick={() => handleStartSession(subject?.id, duration)}
                  className="shrink-0 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all"
                  title={`Start ${duration}m Focus Session`}
                >
                  <Play size={14} fill="currentColor" className="sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          );
        })}

        {dailyTasks.map(({ topic, subject, isCompletedToday }: { topic: Topic; subject: Subject; isCompletedToday: boolean }) => (
          <div 
            key={topic.id}
            className={`relative flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border ${
              isCompletedToday 
                ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20' 
                : `bg-white dark:bg-slate-700/90 border-slate-100 dark:border-slate-600 hover:border-indigo-200 dark:hover:border-indigo-500 hover:bg-white dark:hover:bg-slate-700 hover:-translate-y-0.5 hover:shadow-lg ${subject ? 'shadow-[0_0_10px_-3px_rgba(99,102,241,0.15)] dark:shadow-[0_0_12px_-3px_rgba(99,102,241,0.3)] border-indigo-100/50 dark:border-indigo-500/30' : 'hover:shadow-indigo-500/10'}`
            }`}
          >
            {/* Completion Animation */}
            {animatingTask === topic.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 rounded-2xl animate-fade-in">
                <CheckCircle2 size={32} className="text-emerald-500 animate-bounce" />
              </div>
            )}

            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={() => !isCompletedToday && topic.id && handleMarkComplete(topic.id)}
                disabled={isCompletedToday}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isCompletedToday 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-indigo-500'
                }`}
              >
                <Check size={14} strokeWidth={4} className={isCompletedToday ? 'opacity-100' : 'opacity-0'} />
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={`font-bold truncate text-sm mb-0.5 ${
                  isCompletedToday 
                    ? 'text-slate-500 dark:text-slate-400' 
                    : 'text-slate-800 dark:text-white'
                }`}>
                  {topic.name}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <div className="flex items-center gap-1">
                    <SubjectVisual subject={subject} size="sm" className="w-4 h-4 rounded-md scale-50 origin-left" /> 
                    {subject.name}
                  </div>
                </p>
              </div>
            </div>

            <NavLink 
              to={`/subjects/${subject.id}`}
              className={`p-2 rounded-xl transition-colors ${
                  isCompletedToday ? 'text-slate-300' : 'text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
              }`}
            >
              <ArrowRight size={16} />
            </NavLink>
          </div>
        ))}
      </div>
    </div>
  );
};
