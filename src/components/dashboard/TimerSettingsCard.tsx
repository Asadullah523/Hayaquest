import React from 'react';
import { Settings } from 'lucide-react';
import { useTimerStore } from '../../store/useTimerStore';

export const TimerSettingsCard: React.FC = () => {
  const { config, updateConfig } = useTimerStore();

  const handleDurationChange = (key: 'focusDuration' | 'shortBreakDuration' | 'longBreakDuration', value: string) => {
    const mins = parseInt(value) || 0;
    updateConfig({ [key]: mins * 60 });
  };

  return (
    <div className="glass-card rounded-[2.5rem] p-8 relative overflow-hidden group">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Settings size={20} />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-widest text-xs">Timer Settings</h3>
        </div>
        {/* <button className="text-slate-300 hover:text-slate-400 transition-colors">
          <X size={20} />
        </button> */}
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-4 h-0.5 bg-slate-300 rounded-full" />
            Durations (Min)
          </p>
          
          <div className="space-y-3">
            {[
              { label: 'Focus', key: 'focusDuration' as const, color: 'bg-indigo-500' },
              { label: 'Short Break', key: 'shortBreakDuration' as const, color: 'bg-emerald-500' },
              { label: 'Long Break', key: 'longBreakDuration' as const, color: 'bg-orange-500' }
            ].map((d) => (
              <div key={d.key} className="flex items-center justify-between p-1 pl-4 pr-1 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 group/item hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${d.color} shadow-sm`} />
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{d.label}</span>
                </div>
                <input 
                  type="number"
                  value={config[d.key] / 60}
                  onChange={(e) => handleDurationChange(d.key, e.target.value)}
                  className="w-16 bg-white dark:bg-slate-800 py-2 px-3 rounded-xl text-center font-black text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-4 h-0.5 bg-slate-300 rounded-full" />
            Alarm Sound
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Bell', value: 'bell' as const },
              { label: 'Chime', value: 'chime' as const }
            ].map((s) => (
              <button
                key={s.value}
                onClick={() => updateConfig({ focusSound: s.value, breakSound: s.value })}
                className={`py-3 rounded-2xl font-bold text-sm transition-all border-2 ${
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
  );
};
