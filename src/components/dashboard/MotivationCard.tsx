import React, { useState, useEffect } from 'react';
import { Quote, Sparkles, Play, ChevronRight } from 'lucide-react';
import { motivationStories, type Story } from '../../data/motivation';

export const MotivationCard: React.FC = () => {
  const [currentStory, setCurrentStory] = useState<Story>(motivationStories[0]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        const nextIndex = (motivationStories.findIndex(s => s.id === currentStory.id) + 1) % motivationStories.length;
        setCurrentStory(motivationStories[nextIndex]);
        setIsVisible(true);
      }, 500);
    }, 15000); // Rotate every 15 seconds

    return () => clearInterval(timer);
  }, [currentStory.id]);

  return (
    <div className="h-full flex flex-col justify-between relative group overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl dark:shadow-2xl transition-all duration-500 hover:shadow-2xl hover:border-primary/20 p-8 md:p-10">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.07] group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
        <Quote size={120} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={12} />
            Daily Wisdom
          </div>
          <div className="h-1 flex-1 bg-slate-50 dark:bg-slate-800 rounded-full" />
        </div>

        <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h3 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white dark:text-neon-indigo mb-6 leading-tight tracking-tight">
            {currentStory.title}
          </h3>
          
          <div className="relative mb-10">
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic pr-4">
              "{currentStory.text}"
            </p>
            {currentStory.author && (
              <p className="mt-4 text-sm font-bold text-primary">— {currentStory.author}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            <button className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-xl hover:scale-[1.03] active:scale-95 transition-all text-sm group/btn">
              <Play size={18} className="fill-current group-hover/btn:translate-x-0.5 transition-transform" />
              START STUDY QUEST
            </button>
            
            <button className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold transition-colors group/next">
              Next Wisdom
              <ChevronRight size={16} className="group-hover/next:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
