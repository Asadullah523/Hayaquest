import React from 'react';
import { createPortal } from 'react-dom';
import { useLogStore } from '../../store/useLogStore';
import { useSubjectStore } from '../../store/useSubjectStore';
import { X, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface SessionsModalProps {
  onClose: () => void;
}

export const SessionsModal: React.FC<SessionsModalProps> = ({ onClose }) => {
  const { logs, loadAllLogs, isLoading } = useLogStore();
  const { subjects, topics } = useSubjectStore();

  React.useEffect(() => {
    loadAllLogs();
    // Freeze background scrolling
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [loadAllLogs]);

  // Sort logs by newest first and filter out tiny sessions (like agenda clicks)
  const sortedLogs = [...logs]
    .filter(log => log.durationSeconds >= 60)
    .sort((a, b) => b.timestamp - a.timestamp);

  const getSubject = (id: number) => subjects.find(s => s.id === id);
  const getTopic = (id?: number) => id ? topics.find(t => t.id === id) : undefined;

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0 && s > 0) return `${m}m ${s}s`;
    if (m > 0) return `${m}m`;
    return `${s}s`;
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop - Blurred but allowing content behind to be vaguely seen */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-md transition-all duration-500 cursor-pointer" 
        onClick={onClose}
      />

      {/* Modal Card - Larger and perfectly centered */}
      <div className="relative w-full max-w-xl sm:max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-auto min-h-[500px] max-h-[85vh] border border-white/50 dark:border-slate-700/50 animate-scale-up">
        
        {/* Header */}
        <div className="p-5 md:p-8 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-md z-10 shrink-0">
          <div>
            <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2 md:gap-3">
              Session History
              <span className="text-[10px] md:text-sm font-bold px-2 md:px-3 py-0.5 md:py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full">
                {sortedLogs.length}
              </span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-0.5 md:mt-1 text-xs md:text-lg">
              Your complete learning timeline
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 md:p-4 bg-slate-100 dark:bg-slate-800 rounded-xl md:rounded-2xl text-slate-500 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20 transition-colors"
          >
            <X size={18} className="md:w-6 md:h-6" />
          </button>
        </div>

        {/* List Content */}
        <div className="overflow-y-auto p-8 space-y-4 custom-scrollbar flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
               <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mb-4" />
               <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded mb-2" />
               <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
          ) : sortedLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full pb-20">
               <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mb-6 text-slate-300">
                  <Clock size={48} />
               </div>
               <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">No sessions yet</h3>
               <p className="text-slate-400 max-w-xs text-center text-lg">
                 Start a timer or log a manual session to see your history here.
               </p>
            </div>
          ) : (
            sortedLogs.map((log) => {
              const subject = getSubject(log.subjectId);
              const topic = getTopic(log.topicId);
              
              return (
                <div 
                  key={log.id} 
                  className="group flex flex-row items-center justify-between p-3 md:p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl md:rounded-[2rem] hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0">
                    {/* Date Box */}
                    <div className="flex flex-col items-center justify-center w-12 h-12 md:w-20 md:h-20 bg-white dark:bg-slate-800 rounded-xl md:rounded-[1.2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 group-hover:scale-105 transition-transform shrink-0">
                       <span className="text-[8px] md:text-xs font-black uppercase text-slate-400 leading-none">{format(log.timestamp, 'MMM')}</span>
                       <span className="text-sm md:text-2xl font-black text-slate-800 dark:text-white leading-tight">{format(log.timestamp, 'd')}</span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5 md:space-y-1">
                       <div className="flex items-center gap-1.5 md:gap-2 mb-0 md:mb-1">
                          <span 
                            className="inline-block w-2 h-2 md:w-3 md:h-3 rounded-full shrink-0 shadow-sm" 
                            style={{ backgroundColor: subject?.color || '#ccc' }} 
                          />
                          <h4 className="text-xs md:text-lg font-black text-slate-800 dark:text-white truncate">
                             {subject?.name || 'Unknown Subject'}
                          </h4>
                       </div>
                       
                       {topic && (
                         <div className="flex items-start gap-1 text-[10px] md:text-base font-medium text-slate-500 dark:text-slate-400">
                           <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5 md:mt-1 md:w-4 md:h-4" />
                           <span className="break-words line-clamp-1 md:line-clamp-2 leading-tight md:leading-snug">{topic.name}</span>
                         </div>
                       )}
                       
                       <p className="text-[9px] md:text-sm text-slate-400 font-bold flex flex-wrap items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1">
                          <span className="bg-slate-100 dark:bg-slate-800 px-1.5 md:px-2 py-0.5 rounded-md md:rounded-lg text-[8px] md:text-xs shrink-0">
                            {format(log.timestamp, 'h:mm a')}
                          </span>
                          {log.notes && (
                            <span className="italic font-medium text-slate-400 truncate max-w-[120px] md:max-w-[200px] border-l border-slate-200 pl-1.5">
                               {log.notes}
                            </span>
                          )}
                       </p>
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="ml-2 md:ml-4 flex items-center gap-3 shrink-0">
                     <div className="px-3 md:px-5 py-2 md:py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl md:rounded-2xl text-indigo-600 dark:text-indigo-400 font-black text-xs md:text-base flex items-center gap-1.5 md:gap-2 whitespace-nowrap shadow-sm">
                        <Clock size={14} className="md:w-[18px]" />
                        {formatDuration(log.durationSeconds)}
                     </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Footer Gradient Fade for scroll hint */}
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none" />
      </div>
    </div>,
    document.body
  );
};
