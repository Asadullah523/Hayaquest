import React, { useEffect, useState } from 'react';
import { useTimerStore } from '../../store/useTimerStore';
import { useTimetableStore } from '../../store/useTimetableStore';
import { useSubjectStore } from '../../store/useSubjectStore';
import { Play, Pause, ChevronDown, ChevronUp, Monitor, Volume2, VolumeX } from 'lucide-react';
import { createPortal } from 'react-dom';

export const FocusModeIndicator: React.FC = () => {
  const { isActive, mode, timeLeft, start, pause, tick, startSession, activeSession, config, stopSound, updateConfig } = useTimerStore();
  

  const { slots } = useTimetableStore();
  const { subjects } = useSubjectStore();
  const [currentSlot, setCurrentSlot] = useState<any>(null);
  const [isMinimized, setIsMinimized] = useState(true);
  const [pipWindow, setPipWindow] = useState<any>(null);
  
  // Draggable State
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Load position from localStorage
  useEffect(() => {
    const savedPos = localStorage.getItem('focus-indicator-pos');
    if (savedPos) {
      try {
        const parsed = JSON.parse(savedPos);
        // Validate saved position is within window bounds
        const x = Math.min(Math.max(0, parsed.x), window.innerWidth - 64);
        const y = Math.min(Math.max(0, parsed.y), window.innerHeight - 64);
        setPosition({ x, y });
      } catch (e) {
        console.error("Failed to parse saved position", e);
      }
    }
  }, []);

  // Persist position
  useEffect(() => {
    if (position) {
      localStorage.setItem('focus-indicator-pos', JSON.stringify(position));
    }
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    // Don't drag if clicking buttons
    if ((e.target as HTMLElement).closest('button')) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsDragging(true);
    setDragStart({
      x: clientX - rect.left,
      y: clientY - rect.top
    });
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      
      const rect = containerRef.current.getBoundingClientRect();
      const margin = 8;
      
      // Calculate new position
      let newX = clientX - dragStart.x;
      let newY = clientY - dragStart.y;
      
      // Bounds checking
      newX = Math.min(Math.max(margin, newX), window.innerWidth - rect.width - margin);
      newY = Math.min(Math.max(margin, newY), window.innerHeight - rect.height - margin);
      
      setPosition({ x: newX, y: newY });
    };

    const handleUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, dragStart]);

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(tick, 1000);
      
      // Also update immediately when tab becomes visible to "catch up" instantly
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          tick();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
    return () => clearInterval(interval);
  }, [isActive, tick]);

  useEffect(() => {
    // Find current timetable slot based on current day and time
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:00`;
    
    const slot = slots.find(s => 
      s.dayOfWeek === currentDay && 
      s.startTime <= currentTime && 
      s.endTime > currentTime
    );
    
    setCurrentSlot(slot);
  }, [slots]);

  const subject = currentSlot ? subjects.find(s => s.id === currentSlot.subjectId) : null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMinimize = () => {
    if (containerRef.current && position) {
        const rect = containerRef.current.getBoundingClientRect();
        const isCurrentlyMinimized = isMinimized;
        const screenMid = window.innerWidth / 2;
        const isRightSide = (rect.left + rect.width / 2) > screenMid;
        
        if (isRightSide) {
            // If on right side, when expanding we need to shift left
            // When minimizing we need to shift right to re-center the circle
            const cardWidth = 312; // Approx expanded width
            const circleWidth = 64; // Approx minimized width
            
            if (!isCurrentlyMinimized) {
                // About to minimize: Shift right
                setPosition(prev => prev ? { 
                    x: Math.min(window.innerWidth - circleWidth - 8, prev.x + (rect.width - circleWidth)), 
                    y: prev.y 
                } : null);
            } else {
                // About to expand: Shift left
                setPosition(prev => prev ? { 
                    x: Math.max(8, prev.x - (cardWidth - circleWidth)), 
                    y: prev.y 
                } : null);
            }
        }
    }
    setIsMinimized(!isMinimized);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMinimize();
  };

  const togglePiP = async () => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
      return;
    }

    if (!('documentPictureInPicture' in window)) {
      alert('Picture-in-Picture is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    try {
      // @ts-ignore
      const pipW = await window.documentPictureInPicture.requestWindow({
        width: 260,
        height: 260,
      });

      // Copy styles
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          if (styleSheet.cssRules) {
            const newStyle = pipW.document.createElement('style');
            [...styleSheet.cssRules].forEach((rule) => {
              newStyle.appendChild(pipW.document.createTextNode(rule.cssText));
            });
            pipW.document.head.appendChild(newStyle);
          } else if (styleSheet.href) {
            const newLink = pipW.document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.href = styleSheet.href;
            pipW.document.head.appendChild(newLink);
          }
        } catch (e) {
          console.error('Failed to copy stylesheet', e);
        }
      });

      if (document.documentElement.classList.contains('dark')) {
        pipW.document.documentElement.classList.add('dark');
      }

      // Force reset body/html margins and prevent scrolling
      const styleReset = pipW.document.createElement('style');
      styleReset.textContent = `
        body, html { 
          margin: 0 !important; 
          padding: 0 !important; 
          overflow: hidden !important; 
          height: 100vh !important;
          width: 100vw !important;
        }
      `;
      pipW.document.head.appendChild(styleReset);

      pipW.addEventListener('pagehide', () => {
        setPipWindow(null);
      });

      setPipWindow(pipW);
    } catch (error) {
      console.error('Failed to open PiP window', error);
    }
  };

  const PiPContent = () => {
    const totalTime = mode === 'focus' ? config.focusDuration : mode === 'shortBreak' ? config.shortBreakDuration : config.longBreakDuration;
    const percentage = (timeLeft / totalTime) * 100;
    const strokeDasharray = 2 * Math.PI * 80;
    const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;

    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-900 overflow-hidden select-none p-4 font-sans border-none">
        <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="absolute w-full h-full transform -rotate-90 scale-100" viewBox="0 0 192 192" preserveAspectRatio="xMidYMid meet">
              <circle
                cx="96"
                cy="96"
                r="80"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-100 dark:text-slate-800/50"
              />
              {/* Progress Circle with Glow */}
              <circle
                cx="96"
                cy="96"
                r="80"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={strokeDasharray}
                style={{ 
                  strokeDashoffset,
                  transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease',
                  filter: `drop-shadow(0 0 6px ${mode === 'focus' ? 'rgba(79, 70, 229, 0.4)' : 'rgba(16, 185, 129, 0.4)'})`
                }}
                strokeLinecap="round"
                className={mode === 'focus' ? 'text-indigo-600' : 'text-emerald-500'}
              />
            </svg>

            {/* Inner Content */}
            <div className="relative text-center z-10 space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-2">
                {mode === 'focus' ? 'Focus' : 'Break'}
              </p>
              <div className="text-4xl font-black text-slate-800 dark:text-white tabular-nums tracking-tighter">
                {formatTime(timeLeft)}
              </div>
              {subject && (
                <div className="flex flex-col items-center gap-1.5 mt-2">
                  <div className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30">
                    <p className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-[120px]">
                      {subject.name}
                    </p>
                  </div>
                </div>
              )}
            </div>
        </div>

        <div className="mt-6 flex gap-3">
             <button 
               onClick={(e) => { 
                 e.stopPropagation(); 
                 const newMuted = config.soundEnabled;
                 updateConfig({ soundEnabled: !newMuted });
                 if (newMuted) stopSound();
               }}
               className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                 config.soundEnabled 
                   ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30' 
                   : 'bg-slate-200 text-slate-500'
               }`}
               title={config.soundEnabled ? "Mute" : "Unmute"}
             >
               {config.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
             </button>

             <button 
               onClick={(e) => { e.stopPropagation(); if (!isActive && subject && (!activeSession || !activeSession.subjectId)) { startSession(subject.id); } isActive ? pause() : start(); }}
               className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-90 ${
                 isActive 
                   ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-slate-900/20' 
                   : mode === 'focus'
                     ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                     : 'bg-emerald-500 text-white shadow-emerald-500/30'
               }`}
             >
               {isActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
             </button>
        </div>
      </div>
    );
  };

  const dynamicStyle = position ? {
    left: `${position.x}px`,
    top: `${position.y}px`,
    bottom: 'auto',
    right: 'auto',
  } : undefined;

  if (!config.showMiniTimer) return null;

  if (isMinimized) {
      return (
        <div 
          ref={containerRef}
          className={`fixed z-40 animate-in fade-in zoom-in duration-300 hidden md:block ${!position ? 'bottom-28 lg:bottom-6 right-6' : ''}`}
          style={dynamicStyle}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          onTouchStart={handleMouseDown}
        >
            <div className={`relative group ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`} onClick={!isDragging ? toggleMinimize : undefined}>
                 <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 rounded-full blur-sm group-hover:blur-md transition-all" />
                  <div className="relative w-14 h-14 lg:w-16 lg:h-16 bg-white dark:bg-slate-900 rounded-full shadow-xl border border-indigo-100 dark:border-indigo-900 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 overflow-hidden">
                     <svg className="absolute inset-0 w-full h-full transform -rotate-90 p-1" viewBox="0 0 64 64">
                         <circle
                             cx="32"
                             cy="32"
                             r="28"
                             fill="transparent"
                             stroke="currentColor"
                             strokeWidth="4"
                             className="text-slate-100 dark:text-slate-800"
                         />
                         <circle
                             cx="32"
                             cy="32"
                             r="28"
                             fill="transparent"
                             stroke="currentColor"
                             strokeWidth="4"
                             strokeDasharray={175.9}
                             strokeDashoffset={175.9 * (1 - (timeLeft / (mode === 'focus' ? 1500 : 300)))}
                             className={mode === 'focus' ? 'text-indigo-600 dark:text-indigo-500' : 'text-emerald-500'}
                             strokeLinecap="round"
                         />
                     </svg>
                     <span className="text-[10px] font-black text-slate-800 dark:text-white tabular-nums z-10">
                         {Math.floor(timeLeft / 60)}m
                     </span>
                    {/* Hover expand hint */}
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg scale-0 group-hover:scale-100 origin-bottom-left">
                        <ChevronUp size={12} />
                    </div>
                  </div>
            </div>
        </div>
      );
  }

  return (
    <div 
      ref={containerRef}
      className={`fixed z-40 animate-slide-up hidden md:block ${!position ? 'bottom-28 lg:bottom-6 right-6' : ''}`}
      style={dynamicStyle}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleMouseDown}
    >
      <div className={`glass-card rounded-[2rem] p-4 pr-6 shadow-2xl border-2 border-indigo-200 dark:border-indigo-800 min-w-[300px] flex items-center justify-between gap-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl relative group ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}>
        
        {/* Minimize Button */}
        <button 
            onClick={(e) => { e.stopPropagation(); toggleMinimize(); }}
            className="absolute -top-3 -right-3 w-8 h-8 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 border border-slate-100 dark:border-slate-700 pointer-events-auto"
            title="Minimize"
        >
            <ChevronDown size={16} />
        </button>

        {/* PiP Button */}
        <button 
            onClick={(e) => { e.stopPropagation(); togglePiP(); }}
            className={`absolute -top-3 right-8 w-8 h-8 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 border border-slate-100 dark:border-slate-700 pointer-events-auto ${pipWindow ? 'text-indigo-600 border-indigo-200' : 'text-slate-400'}`}
            title="Picture-in-Picture"
        >
            <Monitor size={16} />
        </button>

        <div className="flex items-center gap-3">
           <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                const newMuted = config.soundEnabled;
                updateConfig({ soundEnabled: !newMuted });
                if (newMuted) stopSound();
              }}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95 pointer-events-auto ${
                config.soundEnabled 
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30' 
                  : 'bg-slate-50 text-slate-400'
              }`}
            >
              {config.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>

           <button 
             onClick={(e) => { e.stopPropagation(); if (!isActive && subject && (!activeSession || !activeSession.subjectId)) { startSession(subject.id); } isActive ? pause() : start(); }}
             className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95 pointer-events-auto ${
               isActive 
                 ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
                 : 'bg-indigo-600 text-white shadow-indigo-600/25'
             }`}
           >
             {isActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
           </button>

           <div className="select-none">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                {mode === 'focus' ? 'Focus Session' : 'Break Time'}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800 dark:text-white tabular-nums leading-none">
                  {formatTime(timeLeft)}
                </span>
                {subject && (
                  <span className="text-xs font-bold text-indigo-500 truncate max-w-[100px]">
                    • {subject.name}
                  </span>
                )}
              </div>
           </div>
        </div>

        <div className="relative w-10 h-10">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90 p-0.5" viewBox="0 0 40 40">
              <circle
                cx="20"
                cy="20"
                r="17"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="3.5"
                className="text-slate-100 dark:text-slate-800"
              />
              <circle
                cx="20"
                cy="20"
                r="17"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeDasharray={106.8}
                strokeDashoffset={106.8 * (1 - (timeLeft / (mode === 'focus' ? 1500 : 300)))}
                className={mode === 'focus' ? 'text-indigo-600 dark:text-indigo-500' : 'text-emerald-500'}
                strokeLinecap="round"
              />
            </svg>
          </div>
      </div>
      {pipWindow && createPortal(<PiPContent />, pipWindow.document.body)}
    </div>
  );
};
