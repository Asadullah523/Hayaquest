import React from 'react';
import { Settings, X } from 'lucide-react';
import { useTimerStore } from '../../store/useTimerStore';

interface TimerSettingsCardProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const TimerSettingsCard: React.FC<TimerSettingsCardProps> = ({ isOpen = true, onClose }) => {
  const { config, updateConfig } = useTimerStore();

  const handleDurationChange = (key: 'focusDuration' | 'shortBreakDuration' | 'longBreakDuration', value: string) => {
    const mins = parseInt(value) || 0;
    updateConfig({ [key]: mins * 60 });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] p-4 sm:p-6 md:p-8 max-w-md w-full animate-scale-in shadow-2xl relative overflow-hidden group" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg sm:rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Settings size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-widest text-[10px] sm:text-xs">Timer Settings</h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          )}
        </div>

        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <p className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
              <span className="w-3 h-0.5 sm:w-4 bg-slate-300 rounded-full" />
              Durations (Min)
            </p>
            
            <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
              {[
                { label: 'Focus', key: 'focusDuration' as const, color: 'bg-indigo-500' },
                { label: 'Short Break', key: 'shortBreakDuration' as const, color: 'bg-emerald-500' },
                { label: 'Long Break', key: 'longBreakDuration' as const, color: 'bg-orange-500' }
              ].map((d) => (
                <div key={d.key} className="flex items-center justify-between p-1 pl-3 sm:pl-4 pr-1 bg-slate-50 dark:bg-slate-900/50 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800 group/item hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${d.color} shadow-sm`} />
                    <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">{d.label}</span>
                  </div>
                  <input 
                    type="number"
                    value={config[d.key] / 60}
                    onChange={(e) => handleDurationChange(d.key, e.target.value)}
                    className="w-12 sm:w-14 md:w-16 bg-white dark:bg-slate-800 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl text-center font-black text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-xs sm:text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <p className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
              <span className="w-3 h-0.5 sm:w-4 bg-slate-300 rounded-full" />
              Alarm Sound
            </p>
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:gap-3">
              {[
                { label: 'Bell', value: 'bell' as const },
                { label: 'Chime', value: 'chime' as const }
              ].map((s) => (
                <button
                  key={s.value}
                  onClick={() => updateConfig({ focusSound: s.value, breakSound: s.value })}
                  className={`py-2 sm:py-2.5 md:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all border-2 ${
                    config.focusSound === s.value
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-400 hover:border-indigo-200 hover:text-indigo-500'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
