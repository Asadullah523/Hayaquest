import React, { useEffect, useState } from 'react';
import { useTimetableStore } from '../../store/useTimetableStore';
import { useSubjectStore } from '../../store/useSubjectStore';
import { X, Settings as SettingsIcon, Plus } from 'lucide-react';
import { DndContext, DragOverlay, useDraggable, useDroppable, type DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { TimetableSlot } from '../../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DraggableSlot = ({ slot, subject, onClick }: { slot: TimetableSlot, subject?: any, onClick: () => void }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `slot-${slot.id}`,
        data: { slot }
    });

    if (isDragging) {
        return <div ref={setNodeRef} className="w-full h-full opacity-0" />;
    }

    const displayName = subject?.name || slot.title || 'Activity';
    const subTitle = subject?.name ? slot.title : null;
    const backgroundColor = slot.color || subject?.color || '#94a3b8';

    return (
        <div 
            ref={setNodeRef} 
            {...listeners} 
            {...attributes}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className="w-full h-full rounded-md flex flex-col items-center justify-center text-[10px] font-bold text-white text-center leading-tight shadow-sm cursor-grab active:cursor-grabbing touch-none relative p-1 transition-transform hover:scale-[1.02]"
            style={{ backgroundColor }}
        >
            <span className="line-clamp-1">{displayName}</span>
            {subTitle && (
                <span className="text-[8px] opacity-90 line-clamp-1 font-medium mt-0.5">
                    {subTitle}
                </span>
            )}
            {slot?.recurring && <span className="absolute bottom-0.5 right-1 text-[8px] opacity-70">↻</span>}
        </div>
    );
};

const DroppableCell = ({ dayIndex, time, onClick, children }: { dayIndex: number, time: string, onClick: () => void, children: React.ReactNode }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: `cell-${dayIndex}-${time}`,
        data: { dayIndex, time }
    });

    return (
        <div 
            ref={setNodeRef}
            onClick={onClick}
            className={`border-l border-gray-100 dark:border-slate-600 relative p-1 transition-colors h-full ${isOver ? 'bg-primary/10' : 'hover:bg-gray-50 dark:hover:bg-slate-600/30'}`}
        >
            {children}
            {!children && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none sm:hidden p-0.5">
                    <span className="text-[6px] font-black text-gray-400/50 dark:text-slate-500/30 tracking-tighter leading-none">{DAYS[dayIndex].toUpperCase()}</span>
                    <span className="text-[5px] font-bold text-gray-400/30 dark:text-slate-500/20 leading-none mt-0.5">{format12h(time)}</span>
                </div>
            )}
        </div>
    );
};

const format12h = (time24: string) => {
    const [hour, minute] = time24.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
};

export const Timetable: React.FC = () => {
  const { subjects, loadSubjects } = useSubjectStore();
  const { slots, loadTimetable, assignSlot, clearSlot, moveSlot, startHour, endHour, updateTimetableHours } = useTimetableStore();
  const [selectedCell, setSelectedCell] = useState<{day: number, time: string} | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isRecurring, setIsRecurring] = useState(true);
  const [duration, setDuration] = useState(60); // Default 60 mins
  const [customTitle, setCustomTitle] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  useEffect(() => {
    loadSubjects();
    loadTimetable();
  }, [loadSubjects, loadTimetable]);

  const getTimes = () => {
    const times = [];
    let h = startHour;
    let count = 0;
    
    while (h !== endHour && count < 24) {
      times.push(`${h.toString().padStart(2, '0')}:00`);
      h = (h + 1) % 24;
      count++;
    }
    if (times.length === 0) {
        for(let i=0; i<24; i++) {
            times.push(`${((startHour + i) % 24).toString().padStart(2, '0')}:00`);
        }
    }
    return times;
  };

  const TIMES = getTimes();

  const getSlot = (day: number, time: string) => 
    slots.find(s => s.dayOfWeek === day && s.startTime === time);

  const getSubject = (id: number) => subjects.find(s => s.id === id);

  const handleCellClick = (day: number, time: string) => {
    const existing = getSlot(day, time);
    setSelectedCell({ day, time });
    setDuration(60); // Reset to default
    setCustomTitle(existing?.title || '');
    setSelectedSubjectId(existing?.subjectId || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (over && active.id !== over.id) {
        const activeData = active.data.current?.slot;
        const overData = over.data.current;

        if (activeData && overData) {
            await moveSlot(
                activeData.dayOfWeek, 
                activeData.startTime, 
                overData.dayIndex, 
                overData.time
            );
        }
    }
  };

  const RANDOM_COLORS = [
    '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f97316', 
    '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#475569'
  ];

  const handleAssignSubject = async (subjectId?: number) => {
      if (!selectedCell) return;
      
      const subId = subjectId !== undefined ? subjectId : selectedSubjectId;
      const [hour, min] = selectedCell.time.split(':').map(Number);
      const startMins = hour * 60 + min;
      const endMins = startMins + duration;
      
      const endH = Math.floor(endMins / 60) % 24;
      const endM = endMins % 60;
      
      const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

      // Pick a random color if no subject is selected
      const slotColor = subId 
        ? subjects.find(s => s.id === subId)?.color 
        : RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];

      await assignSlot({
          dayOfWeek: selectedCell.day as any,
          startTime: selectedCell.time,
          endTime,
          subjectId: subId || undefined,
          title: customTitle.trim() || undefined,
          color: slotColor,
          recurring: isRecurring
      });
      setSelectedCell(null);
      setCustomTitle('');
      setSelectedSubjectId(null);
  };

  const handleClearSlot = async () => {
      if (!selectedCell) return;
      await clearSlot(selectedCell.day, selectedCell.time);
      setSelectedCell(null);
  }

  const activeSlot = activeDragId ? slots.find(s => `slot-${s.id}` === activeDragId) : null;
  const activeSubject = activeSlot && activeSlot.subjectId ? getSubject(activeSlot.subjectId) : null;

  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Weekly Schedule</h2>
            <button 
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-xl bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-500 hover:text-primary transition-colors shadow-sm"
            >
                <SettingsIcon size={20} />
            </button>
        </div>
        
        <DndContext 
            sensors={sensors} 
            onDragStart={(e) => setActiveDragId(e.active.id as string)}
            onDragEnd={handleDragEnd}
        >
            <div className="overflow-x-auto pb-4">
                <div className="min-w-[600px] border border-gray-200 dark:border-slate-600 rounded-xl overflow-hidden bg-white dark:bg-slate-700 shadow-sm select-none">
                    {/* Header */}
                    <div className="grid grid-cols-8 border-b border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 sticky top-0 z-20">
                        <div className="p-3 text-xs font-medium text-gray-400 dark:text-slate-400 text-center uppercase tracking-wider py-4 bg-white dark:bg-slate-700 sticky left-0 z-30">Time</div>
                        {DAYS.map((day) => (
                            <div key={day} className="p-3 text-xs font-bold text-gray-600 dark:text-white text-center uppercase tracking-wider py-4 border-l border-gray-100 dark:border-slate-600">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="divide-y divide-gray-100 dark:divide-slate-600">
                        {TIMES.map(time => (
                            <div key={time} className="grid grid-cols-8 h-12">
                                <div className="p-2 text-[10px] text-gray-400 dark:text-slate-300 font-medium text-center flex items-center justify-center bg-gray-50/50 dark:bg-slate-800/50 sticky left-0 z-10 border-r border-gray-100 dark:border-slate-600">
                                    {format12h(time)}
                                </div>
                                {DAYS.map((_, dayIndex) => {
                                    const slot = getSlot(dayIndex, time);
                                    const subject = slot && slot.subjectId ? getSubject(slot.subjectId) : null;
                                    
                                    return (
                                        <DroppableCell 
                                            key={`${dayIndex}-${time}`}
                                            dayIndex={dayIndex}
                                            time={time}
                                            onClick={() => handleCellClick(dayIndex, time)}
                                        >
                                            {slot && (
                                                <DraggableSlot 
                                                    slot={slot} 
                                                    subject={subject} 
                                                    onClick={() => handleCellClick(dayIndex, time)}
                                                />
                                            )}
                                        </DroppableCell>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <DragOverlay>
                {activeSlot ? (
                    <div 
                        className="w-[80px] h-[40px] rounded-md flex flex-col items-center justify-center text-[10px] font-bold text-white text-center leading-tight shadow-lg opacity-90 p-1"
                        style={{ backgroundColor: activeSlot.color || activeSubject?.color || '#94a3b8' }}
                    >
                         <span className="line-clamp-1">{activeSubject?.name || activeSlot.title || 'Activity'}</span>
                         {activeSubject && activeSlot.title && (
                             <span className="text-[8px] opacity-90 line-clamp-1 font-medium mt-0.5">
                                 {activeSlot.title}
                             </span>
                         )}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>

        {/* Settings Modal */}
        {showSettings && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div 
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={() => setShowSettings(false)}
                />
                <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold dark:text-white">Timetable Settings</h3>
                        <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Routine Start Time</label>
                            <select 
                                value={startHour}
                                onChange={(e) => updateTimetableHours(Number(e.target.value), endHour)}
                                className="w-full p-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                            >
                                {Array.from({length: 24}).map((_, i) => (
                                    <option key={i} value={i}>{format12h(`${i.toString().padStart(2, '0')}:00`)}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Routine End Time</label>
                            <select 
                                value={endHour}
                                onChange={(e) => updateTimetableHours(startHour, Number(e.target.value))}
                                className="w-full p-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                            >
                                {Array.from({length: 24}).map((_, i) => (
                                    <option key={i} value={i}>{format12h(`${i.toString().padStart(2, '0')}:00`)}</option>
                                ))}
                            </select>
                            <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                                This sets the visible range of your weekly schedule.
                            </p>
                        </div>

                        <button 
                            onClick={() => setShowSettings(false)}
                            className="w-full py-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        >
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Selection Modal/Sheet */}
        {selectedCell && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div 
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                    onClick={() => setSelectedCell(null)}
                />
                <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6 transform transition-all animate-fade-in max-h-[85vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4 sm:mb-6 sticky top-0 bg-white dark:bg-slate-800 z-10 py-1">
                        <div>
                            <h3 className="font-bold text-xl dark:text-white">
                                {DAYS[selectedCell.day]}
                            </h3>
                            <p className="text-gray-500 dark:text-slate-400 text-sm">{format12h(selectedCell.time)}</p>
                        </div>
                        <button onClick={() => {
                            setSelectedCell(null);
                            setCustomTitle('');
                            setSelectedSubjectId(null);
                        }} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 tracking-widest px-1">
                                {selectedSubjectId ? 'Topic / Task' : 'Activity Name'}
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={customTitle}
                                    onChange={(e) => setCustomTitle(e.target.value)}
                                    placeholder={selectedSubjectId ? "e.g., Photosynthesis..." : "e.g., Gym, Lunch..."}
                                    className="flex-1 p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-transparent focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all outline-none dark:text-white text-sm"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && (customTitle.trim() || selectedSubjectId)) {
                                            handleAssignSubject();
                                        }
                                    }}
                                />
                                <button 
                                    onClick={() => handleAssignSubject()}
                                    disabled={!customTitle.trim() && !selectedSubjectId}
                                    className="p-3.5 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
                                    title="Save Activity"
                                >
                                    <Plus size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {/* Recursive Toggle */}
                            <div 
                                className="flex-1 flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-slate-900 cursor-pointer active:scale-95 transition-all"
                                onClick={() => setIsRecurring(!isRecurring)}
                            >
                                <span className="text-xs font-bold text-gray-700 dark:text-slate-300">Repeat</span>
                                <div className={`w-8 h-4 rounded-full transition-colors relative ${isRecurring ? 'bg-primary' : 'bg-gray-300 dark:bg-slate-600'}`}>
                                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${isRecurring ? 'left-4.5' : 'left-0.5'}`} style={{ left: isRecurring ? '18px' : '2px'}} />
                                </div>
                            </div>

                             {/* Duration Scroll */}
                             <div className="flex-[2] flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar px-1">
                                {[15, 30, 45, 60, 90, 120].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setDuration(m)}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                                            duration === m 
                                                ? 'bg-primary text-white shadow-md' 
                                                : 'bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-slate-400'
                                        }`}
                                    >
                                        {m}m
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest pl-1">Assign Subject</p>
                            
                            {/* Horizontal Scroll for Subjects */}
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar px-1 -mx-1">
                                {subjects.filter(s => !s.parentId).map(subject => (
                                    <button
                                        key={subject.id}
                                        onClick={() => setSelectedSubjectId(subject.id === selectedSubjectId ? null : (subject.id ?? null))}
                                        className={`flex flex-col items-center justify-center p-3 w-20 flex-shrink-0 rounded-2xl transition-all border-2 group active:scale-[0.95] ${
                                            selectedSubjectId === subject.id 
                                                ? 'bg-primary/5 border-primary shadow-sm' 
                                                : 'bg-gray-50 dark:bg-slate-900 border-transparent'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full shadow-sm mb-1.5 transition-transform group-hover:scale-110 ${selectedSubjectId === subject.id ? 'scale-110 shadow-md' : ''}`} style={{ backgroundColor: subject.color }} />
                                        <span className={`text-[10px] font-bold truncate w-full text-center transition-colors ${selectedSubjectId === subject.id ? 'text-primary' : 'text-gray-700 dark:text-slate-400'}`}>{subject.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {getSlot(selectedCell.day, selectedCell.time) && (
                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-600">
                            <button 
                                onClick={handleClearSlot}
                                className="w-full py-4 text-red-500 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all active:scale-[0.98]"
                            >
                                Clear Slot
                            </button>
                        </div>
                     )}
                </div>
            </div>
        )}
    </div>
  );
};
