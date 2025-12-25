import React, { useState } from 'react';
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
    <div className="relative flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] md:rounded-[3rem] p-4 sm:p-6 md:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 transition-all duration-500 hover:shadow-indigo-500/10 h-full min-h-[280px] sm:min-h-[320px]">
      
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
      <div className="mt-10 sm:mt-12 w-full max-w-[180px] sm:max-w-[200px] z-20">
        {mode === 'focus' && (
          <div className="relative">
            <button 
              onClick={() => setShowSubjectSelector(!showSubjectSelector)}
              className={`w-full flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800 border-2 rounded-2xl transition-all ${
                selectedSubject ? 'border-indigo-500/30' : 'border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                {selectedSubject ? (
                  <>
                    <SubjectVisual subject={selectedSubject} size="sm" showNewBadge={isSubjectNew(selectedSubject)} />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{selectedSubject.name}</span>
                  </>
                ) : (
                  <>
                    <Brain size={16} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-400">Select Subject</span>
                  </>
                )}
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${showSubjectSelector ? 'rotate-180' : ''}`} />
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
      <div className="relative w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-56 lg:h-56 flex items-center justify-center mt-4 sm:mt-6">
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
          <div className="flex justify-center mb-0.5 sm:mb-1 md:mb-2">
            {mode === 'focus' ? (
              <Brain className={`text-indigo-600 ${isActive ? 'animate-pulse' : ''} w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8`} />
            ) : (
              <Coffee className={`text-emerald-500 ${isActive ? 'animate-pulse' : ''} w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8`} />
            )}
          </div>
          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-800 dark:text-white tabular-nums tracking-tight">
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
      <div className="flex items-center gap-3 sm:gap-4 md:gap-6 mt-6 sm:mt-8 md:mt-10">
        <button
          onClick={reset}
          className="p-2.5 sm:p-3 md:p-4 bg-slate-50 dark:bg-slate-800 rounded-xl sm:rounded-2xl text-slate-400 hover:text-rose-500 transition-all active:scale-95"
          title="Reset"
        >
          <RotateCcw size={20} className="sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={isActive ? pause : start}
          className={`w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl transition-all active:scale-90 ${
            isActive 
              ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-slate-900/20' 
              : mode === 'focus'
                ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                : 'bg-emerald-500 text-white shadow-emerald-500/30'
          }`}
        >
          {isActive ? <Pause size={28} fill="currentColor" className="sm:w-8 sm:h-8" /> : <Play size={28} fill="currentColor" className="ml-1 sm:w-8 sm:h-8" />}
        </button>

        <button
          onClick={() => {
            const newMuted = config.soundEnabled;
            updateConfig({ soundEnabled: !newMuted });
            if (newMuted) stopSound();
          }}
          className={`p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl transition-all active:scale-95 ${
            config.soundEnabled 
              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' 
              : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
          }`}
        >
          {config.soundEnabled ? <Volume2 size={20} className="sm:w-6 sm:h-6" /> : <VolumeX size={20} className="sm:w-6 sm:h-6" />}
        </button>
      </div>

      {/* Settings Overlay */}
      {showSettings && (
        <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md z-30 flex flex-col p-10 animate-fade-in rounded-[3rem]">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-3">
            <Settings size={22} className="text-indigo-600" />
            Timer Settings
          </h3>
          
          <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {[
              { label: 'Work Duration', key: 'focusDuration', color: 'bg-indigo-600' },
              { label: 'Break Duration', key: 'shortBreakDuration', color: 'bg-emerald-500' },
              { label: 'Long Break', key: 'longBreakDuration', color: 'bg-amber-500' }
            ].map((s) => (
              <div key={s.key} className="space-y-3">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-400">
                  <span>{s.label}</span>
                  <span className="text-slate-800 dark:text-white">{(config as any)[s.key] / 60}m</span>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="60"
                  value={(config as any)[s.key] / 60}
                  onChange={(e) => updateConfig({ [s.key]: parseInt(e.target.value) * 60 })}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full cursor-pointer"
                />
              </div>
            ))}

            <div className="pt-4 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-400">
                  <span>Alarm Duration</span>
                  <span className="text-slate-800 dark:text-white">{config.alarmDuration}s</span>
                </div>
                <input 
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={config.alarmDuration}
                  onChange={(e) => updateConfig({ alarmDuration: parseInt(e.target.value) })}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full cursor-pointer"
                />
              </div>

              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">Start Breaks Automatically</span>
                <input 
                  type="checkbox" 
                  checked={config.autoStartBreaks}
                  onChange={(e) => updateConfig({ autoStartBreaks: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">Start Pomodoros Automatically</span>
                <input 
                  type="checkbox" 
                  checked={config.autoStartPomodoros}
                  onChange={(e) => updateConfig({ autoStartPomodoros: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">Show Mini Floating Timer</span>
                <input 
                  type="checkbox" 
                  checked={config.showMiniTimer}
                  onChange={(e) => updateConfig({ showMiniTimer: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </label>
            </div>

            <div className="pt-6 space-y-6 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Volume2 size={16} className="text-indigo-600" />
                Notification Sounds
              </h4>

              {[
                { label: 'Focus End Sound', key: 'focusSound' as const },
                { label: 'Break End Sound', key: 'breakSound' as const }
              ].map((setting) => (
                <div key={setting.key} className="space-y-3">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">{setting.label}</span>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { value: 'pleasant', label: 'Pleasant (Chime)' },
                      { value: 'calm', label: 'Calm (Bells)' },
                      { value: 'strong', label: 'Strong (Alarm)' },
                      { value: 'urgent', label: 'Urgent (Beep)' },
                      { value: 'nuclear', label: 'Nuclear (Siren)' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateConfig({ [setting.key]: option.value })}
                        className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
                          config[setting.key] === option.value
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                            : 'bg-slate-50 dark:bg-slate-800 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            config[setting.key] === option.value
                              ? 'border-indigo-600'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}>
                            {config[setting.key] === option.value && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                          </div>
                          <span className={`text-sm font-bold ${
                            config[setting.key] === option.value ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'
                          }`}>{option.label}</span>
                        </div>
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            useTimerStore.getState().playNotificationSound(setting.key === 'focusSound' ? 'focus' : 'break');
                          }}
                          className="p-2 rounded-lg bg-white dark:bg-slate-900 shadow-sm text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play size={12} fill="currentColor" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setShowSettings(false)}
            className="mt-6 w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-bold"
          >
            Close Settings
          </button>
        </div>
      )}
    </div>
  );
};
