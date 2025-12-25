import React, { useState } from 'react';
import type { Topic } from '../../types';
import { CheckCircle2, Circle, Trash2, Repeat, Calendar } from 'lucide-react';
import clsx from 'clsx';
import { useSubjectStore } from '../../store/useSubjectStore';

interface TopicItemProps {
  topic: Topic;
}

export const TopicItem: React.FC<TopicItemProps> = ({ topic }) => {
  const { updateTopic, deleteTopic, markDailyTaskComplete, isTaskCompletedToday } = useSubjectStore();
  const [showAnimation, setShowAnimation] = useState(false);
  
  const isCompletedToday = topic.isRecurring ? isTaskCompletedToday(topic) : false;
  
  const handleCheck = (e: React.MouseEvent) => {
      e.stopPropagation();
      const newStatus = topic.status === 'completed' ? 'not-started' : 'completed';
      updateTopic(topic.id!, { status: newStatus });
  }

  const handleDailyComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!topic.id || !topic.isRecurring) return;
    
    await markDailyTaskComplete(topic.id);
    setShowAnimation(true);
    setTimeout(() => setShowAnimation(false), 600);
  };

  const handleDelete = () => {
    if (confirm('Delete this topic?')) {
      if (topic.id) deleteTopic(topic.id);
    }
  };

  return (
    <div 
      onClick={topic.isRecurring ? handleDailyComplete : handleCheck}
      className={clsx(
        "group relative flex items-center justify-between p-2.5 md:p-4 rounded-xl border transition-all cursor-pointer",
        "bg-[#3d2b1f]/40 border-[#5a4030] hover:bg-[#4d3b2f] hover:border-[#d4b483]/30 hover:shadow-lg hover:shadow-black/20",
        (topic.isRecurring ? isCompletedToday : topic.status === 'completed') 
          ? "bg-emerald-950/20 border-emerald-500/30 opacity-90 shadow-inner shadow-emerald-950/20" 
          : "opacity-100"
    )}>
      {/* Completion Animation */}
      {showAnimation && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10 rounded-xl animate-fade-in">
          <CheckCircle2 size={32} className="text-emerald-400 animate-bounce" />
        </div>
      )}

      <div className="flex items-center gap-3 md:gap-5 overflow-hidden relative z-0">
        {!topic.isRecurring ? (
          <div 
            className={clsx(
              "flex-shrink-0 transition-colors",
              topic.status === 'completed' ? "text-emerald-400" : "text-[#b8a594] group-hover:text-[#d4b483]"
            )}
          >
            {topic.status === 'completed' ? <CheckCircle2 className="w-5 h-5 md:w-[22px] md:h-[22px]" strokeWidth={2.5} /> : <Circle className="w-5 h-5 md:w-[22px] md:h-[22px]" strokeWidth={2} />}
          </div>
        ) : (
          <div
            className={clsx(
              "flex-shrink-0 transition-colors",
              isCompletedToday ? "text-emerald-400" : "text-[#b8a594] group-hover:text-[#d4b483]"
            )}
          >
            {isCompletedToday ? <CheckCircle2 className="w-5 h-5 md:w-[22px] md:h-[22px]" strokeWidth={2.5} /> : <Calendar className="w-5 h-5 md:w-[22px] md:h-[22px]" strokeWidth={2} />}
          </div>
        )}
        
        <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 md:gap-3">
              <span className={clsx(
                  "text-sm md:text-lg font-serif tracking-wide transition-all truncate",
                  topic.status === 'completed' && "text-emerald-100/80",
                  (!topic.status || topic.status !== 'completed') && "text-[#fdf5e6] drop-shadow-sm"
              )}>
                  {topic.name}
              </span>
              {topic.isRecurring && (
                <span title="Daily recurring task">
                  <Repeat className={`w-2.5 h-2.5 md:w-3.5 md:h-3.5 ${topic.status === 'completed' ? "text-emerald-500/50" : "text-[#b8a594]"}`} />
                </span>
              )}
            </div>
            {(topic.isRecurring && isCompletedToday) ? (
                <span className="text-[8px] md:text-[10px] uppercase font-black text-emerald-400 tracking-[0.2em] mt-0.5">Vocalized Today</span>
            ) : topic.status === 'in-progress' ? (
                <span className="text-[8px] md:text-[10px] uppercase font-black text-[#d4b483] tracking-[0.2em] mt-0.5">Inscribed...</span>
            ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 opacity-0 group-hover:opacity-100 transition-all px-1 md:px-2">
        <button 
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            className="text-[#b8a594] hover:text-red-500 p-2 rounded-lg hover:bg-black/20 transition-all"
            title="Remove from Tome"
        >
            <Trash2 className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
        </button>
      </div>
    </div>
  );
};