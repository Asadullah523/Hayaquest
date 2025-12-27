import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Play, Pause, RotateCcw, Coffee, Brain, Settings, X, Volume2, VolumeX, ChevronDown, Check } from 'lucide-react';
import { useTimerStore } from '../../store/useTimerStore';
import { useSubjectStore } from '../../store/useSubjectStore';
import { SubjectVisual } from '../subjects/SubjectVisual';

export const TimerWidget: React.FC = () => {
  const { 
    timeLeft, 
    isActive, 
    mode, 
    start, 
    pause, 
    reset, 
    setMode,
    config,
    updateConfig,
    activeSession,
    startSession,
    stopSound
  } = useTimerStore();

  const { subjects, isSubjectNew } = useSubjectStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showSubjectSelector, setShowSubjectSelector] = useState(false);

  const selectedSubject = subjects.find(s => s.id === activeSession?.subjectId);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalTime = () => {
    if (mode === 'focus') return config.focusDuration;
    if (mode === 'shortBreak') return config.shortBreakDuration;
    return config.longBreakDuration;
  };

  const percentage = (timeLeft / getTotalTime()) * 100;
  const strokeDasharray = 2 * Math.PI * 90; // radius is 90
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;

  return (
    <div className="relative flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] md:rounded-[3rem] p-3 sm:p-6 md:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 transition-all duration-500 hover:shadow-indigo-500/10 h-full min-h-[200px] sm:min-h-[320px]">
      
      {/* Settings Toggle */}
      <button 
        onClick={() => setShowSettings(!showSettings)}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 p-1.5 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-all z-20"
      >
        {showSettings ? <X size={18} /> : <Settings size={18} />}
      </button>

      {/* Mode Indicator */}
      <div className="absolute top-6 sm:top-8 left-1/2 -translate-x-1/2 z-10 flex gap-1 sm:gap-2 p-0.5 sm:p-1 bg-slate-50 dark:bg-slate-800 rounded-full">
        {(['focus', 'shortBreak', 'longBreak'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 rounded-full text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
              mode === m 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {m === 'focus' ? 'Focus' : m === 'shortBreak' ? 'Short' : 'Long'}
          </button>
        ))}
      </div>

      {/* Subject Selector / Active Subject */}
      <div className="mt-11 sm:mt-12 w-full max-w-[140px] sm:max-w-[200px] z-20">
        {mode === 'focus' && (
          <div className="relative">
            <button 
              onClick={() => setShowSubjectSelector(!showSubjectSelector)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 sm:px-4 sm:py-2 bg-slate-50 dark:bg-slate-800 border-2 rounded-xl sm:rounded-2xl transition-all ${
                selectedSubject ? 'border-indigo-500/30' : 'border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3 truncate">
                {selectedSubject ? (
                  <>
                    <SubjectVisual subject={selectedSubject} size="sm" showNewBadge={isSubjectNew(selectedSubject)} />
                    <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{selectedSubject.name}</span>
                  </>
                ) : (
                  <>
                    <Brain size={14} className="text-slate-400 sm:w-4 sm:h-4" />
                    <span className="text-[10px] sm:text-xs font-bold text-slate-400">Subject</span>
                  </>
                )}
              </div>
              <ChevronDown size={12} className={`text-slate-400 transition-transform sm:w-3.5 sm:h-3.5 ${showSubjectSelector ? 'rotate-180' : ''}`} />
            </button>

            {showSubjectSelector && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 max-h-48 overflow-y-auto z-30 custom-scrollbar animate-scale-in">
                {subjects
                  .filter(s => !s.parentId)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(subject => (
                  <button
                    key={subject.id}
                    onClick={() => {
                      startSession(subject.id);
                      setShowSubjectSelector(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b last:border-0 border-slate-50 dark:border-slate-700"
                  >
                    <SubjectVisual subject={subject} size="sm" showNewBadge={isSubjectNew(subject)} />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">{subject.name}</span>
                    {selectedSubject?.id === subject.id && <Check size={14} className="ml-auto text-indigo-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Circular Timer */}
      <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 flex items-center justify-center mt-6 sm:mt-8">
        {/* Background Circle */}
        <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-50 dark:text-slate-800"
          />
          {/* Progress Circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={strokeDasharray}
            style={{ 
              strokeDashoffset,
              transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease'
            }}
            strokeLinecap="round"
            className={`${
              mode === 'focus' ? 'text-indigo-600' : 'text-emerald-500'
            } drop-shadow-[0_0_8px_rgba(79,70,229,0.3)]`}
          />
        </svg>

        {/* Inner Content */}
        <div className="relative text-center space-y-0.5 sm:space-y-1 md:space-y-2 z-10">
          <div className="flex justify-center mb-0 sm:mb-1 md:mb-2">
            {mode === 'focus' ? (
              <Brain className={`text-indigo-600 ${isActive ? 'animate-pulse' : ''} w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8`} />
            ) : (
              <Coffee className={`text-emerald-500 ${isActive ? 'animate-pulse' : ''} w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8`} />
            )}
          </div>
          <div className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-800 dark:text-white tabular-nums tracking-tight">
            {formatTime(timeLeft)}
          </div>
          {isActive && (
            <p className="text-[7px] sm:text-[8px] md:text-[9px] font-black text-indigo-500 uppercase tracking-widest animate-pulse">
              Elapsed: {formatTime(getTotalTime() - timeLeft)}
            </p>
          )}
          <p className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {isActive ? (mode === 'focus' ? 'Focusing...' : 'Resting...') : 'Ready?'}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 sm:gap-4 md:gap-6 mt-3 sm:mt-8 md:mt-10">
        <button
          onClick={reset}
          className="p-2 sm:p-3 md:p-4 bg-slate-50 dark:bg-slate-800 rounded-lg sm:rounded-2xl text-slate-400 hover:text-rose-500 transition-all active:scale-95"
          title="Reset"
        >
          <RotateCcw size={16} className="sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={isActive ? pause : start}
          className={`w-12 h-12 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-xl sm:rounded-3xl flex items-center justify-center shadow-2xl transition-all active:scale-90 ${
            isActive 
              ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-slate-900/20' 
              : mode === 'focus'
                ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                : 'bg-emerald-500 text-white shadow-emerald-500/30'
          }`}
        >
          {isActive ? <Pause size={20} fill="currentColor" className="sm:w-8 sm:h-8" /> : <Play size={20} fill="currentColor" className="ml-1 sm:w-8 sm:h-8" />}
        </button>

        <button
          onClick={() => {
            const newMuted = config.soundEnabled;
            updateConfig({ soundEnabled: !newMuted });
            if (newMuted) stopSound();
          }}
          className={`p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-2xl transition-all active:scale-95 ${
            config.soundEnabled 
              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' 
              : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
          }`}
        >
          {config.soundEnabled ? <Volume2 size={16} className="sm:w-6 sm:h-6" /> : <VolumeX size={16} className="sm:w-6 sm:h-6" />}
        </button>
      </div>

      {/* Settings Modal - Portal to body for proper centering */}
      {showSettings && ReactDOM.createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm" 
          onClick={() => setShowSettings(false)}
        >
          <div className="glass-card rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] p-4 sm:p-6 md:p-8 w-full max-w-[280px] sm:max-w-[320px] md:max-w-md lg:max-w-lg animate-scale-in shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-5">
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-1.5 sm:gap-2">
                <Settings size={14} className="text-indigo-600 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                Timer Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"
              >
                <X size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            </div>
            
            <div className="space-y-2.5 sm:space-y-3 md:space-y-4 lg:space-y-5 max-h-[65vh] overflow-y-auto pr-1 custom-scrollbar">
              {[
                { label: 'Work', key: 'focusDuration', color: 'bg-indigo-600' },
                { label: 'Short Break', key: 'shortBreakDuration', color: 'bg-emerald-500' },
                { label: 'Long Break', key: 'longBreakDuration', color: 'bg-amber-500' }
              ].map((s) => (
                <div key={s.key} className="space-y-1 sm:space-y-1.5 md:space-y-2">
                  <div className="flex justify-between items-center text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400">
                    <span>{s.label}</span>
                    <span className="text-slate-800 dark:text-white text-[10px] sm:text-xs">{(config as any)[s.key] / 60}m</span>
                  </div>
                  <input 
                    type="range"
                    min="1"
                    max="60"
                    value={(config as any)[s.key] / 60}
                    onChange={(e) => updateConfig({ [s.key]: parseInt(e.target.value) * 60 })}
                    className="w-full accent-indigo-600 h-1 sm:h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full cursor-pointer"
                  />
                </div>
              ))}

              <div className="pt-2 space-y-2 sm:space-y-2.5 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1 sm:space-y-1.5">
                  <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Alarm</span>
                    <span className="text-slate-800 dark:text-white text-[10px] sm:text-xs">{config.alarmDuration}s</span>
                  </div>
                  <input 
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={config.alarmDuration}
                    onChange={(e) => updateConfig({ alarmDuration: parseInt(e.target.value) })}
                    className="w-full accent-indigo-600 h-1 sm:h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full cursor-pointer"
                  />
                </div>

                <div className="space-y-1 sm:space-y-1.5">
                  <label className="flex items-center justify-between cursor-pointer group py-0.5">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">Auto Breaks</span>
                    <input 
                      type="checkbox" 
                      checked={config.autoStartBreaks}
                      onChange={(e) => updateConfig({ autoStartBreaks: e.target.checked })}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer group py-0.5">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">Auto Focus</span>
                    <input 
                      type="checkbox" 
                      checked={config.autoStartPomodoros}
                      onChange={(e) => updateConfig({ autoStartPomodoros: e.target.checked })}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer group py-0.5">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">Mini Timer</span>
                    <input 
                      type="checkbox" 
                      checked={config.showMiniTimer}
                      onChange={(e) => updateConfig({ showMiniTimer: e.target.checked })}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-2 space-y-2 sm:space-y-2.5 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-[10px] sm:text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Volume2 size={12} className="text-indigo-600 sm:w-3.5 sm:h-3.5" />
                  Sounds
                </h4>

                {[
                  { label: 'Focus End', key: 'focusSound' as const },
                  { label: 'Break End', key: 'breakSound' as const }
                ].map((setting) => (
                  <div key={setting.key} className="space-y-1 sm:space-y-1.5">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">{setting.label}</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { value: 'pleasant', label: 'Pleasant', icon: '🔔' },
                        { value: 'calm', label: 'Calm', icon: '🎵' },
                        { value: 'strong', label: 'Strong', icon: '⏰' },
                        { value: 'urgent', label: 'Urgent', icon: '🔊' },
                        { value: 'nuclear', label: 'Nuclear', icon: '🚨' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            updateConfig({ [setting.key]: option.value });
                            useTimerStore.getState().playNotificationSound(setting.key === 'focusSound' ? 'focus' : 'break');
                          }}
                          className={`group relative p-1.5 sm:p-2 rounded-lg border-2 transition-all text-center ${
                            config[setting.key] === option.value
                              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-400 dark:border-indigo-600 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800'
                          }`}
                        >
                          <div className="text-sm sm:text-base mb-0.5">{option.icon}</div>
                          <div className={`text-[8px] sm:text-[9px] font-bold ${
                            config[setting.key] === option.value ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'
                          }`}>{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setShowSettings(false)}
              className="mt-3 w-full py-2 sm:py-2.5 bg-indigo-600 text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
            >
              Done
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
