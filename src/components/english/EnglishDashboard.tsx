import React from 'react';
import { Book, Feather, List, Brain, Crown, Sparkles, TrendingUp, Heart, ArrowRight, Zap, PenTool } from 'lucide-react';
import { useEnglishStore } from '../../store/useEnglishStore';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { VocabMatchGame } from './VocabMatchGame';

export const EnglishDashboard: React.FC = () => {
  const { dailyStreak, wordsLearned } = useEnglishStore();
  const [showGame, setShowGame] = React.useState(false);
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  const sections = [
    {
      id: 'dictionary',
      title: 'Global Dictionary',
      description: 'Instant definitions, phonetics, and audio for millions of words.',
      icon: Book,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-cyan-400',
      delay: 0
    },
    {
      id: 'vocabulary',
      title: 'Vocabulary Builder',
      description: 'Master new words with spaced repetition flashcards.',
      icon: List,
      color: 'bg-green-500',
      gradient: 'from-emerald-500 to-teal-400',
      delay: 0.1
    },
    {
      id: 'stories',
      title: 'Story Library',
      description: 'Immersive stories with instant click-to-define lookup.',
      icon: Feather,
      color: 'bg-purple-500',
      gradient: 'from-violet-600 to-fuchsia-500',
      delay: 0.2
    },
    {
      id: 'grammar',
      title: 'Grammar Mastery',
      description: 'Clear rules, common mistakes, and interactive exercises.',
      icon: Brain,
      color: 'bg-orange-500',
      gradient: 'from-orange-500 to-amber-500',
      delay: 0.3
    },
    {
      id: 'collection',
      title: 'My Collection',
      description: 'Your personal vault of favorite words and saved stories.',
      icon: Heart,
      color: 'bg-rose-500',
      gradient: 'from-rose-500 to-pink-500',
      delay: 0.4
    },
    {
      id: 'writing-checker',
      title: 'Writing Checker',
      description: 'AI-powered grammar, spelling, and style checker for perfect writing.',
      icon: PenTool,
      color: 'bg-pink-500',
      gradient: 'from-pink-500 to-rose-500',
      delay: 0.5
    },
    {
      id: 'game',
      title: 'Vocab Match',
      description: 'Fast-paced matching challenge. Earn XP and beat your high score!',
      icon: Zap,
      color: 'bg-yellow-500',
      gradient: 'from-yellow-400 to-orange-500',
      delay: 0.6,
      isGame: true
    },
  ];

  return (
    <AnimatePresence mode="wait">
      {showGame ? (
        <motion.div
          key="game"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <VocabMatchGame onBack={() => setShowGame(false)} />
        </motion.div>
      ) : (
        <motion.div 
          key="dashboard"
          initial="hidden"
          animate="show"
          exit={{ opacity: 0, scale: 0.95 }}
          variants={container}
          className="space-y-6 max-w-7xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1 md:mb-2">
                  <span className="px-2 md:px-3 py-0.5 md:py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-1">
                      <Crown size={10} className="md:w-3 md:h-3" /> Premium Edition
                  </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">English</span> Quest
              </h1>
              <p className="text-sm md:text-lg text-slate-500 dark:text-slate-400 mt-1 md:mt-2 max-w-2xl leading-relaxed">
                Your journey to fluency. Master vocabulary, reading, and grammar.
              </p>
            </div>
            
            <div className="flex gap-3 md:gap-4">
                 <div className="bg-white dark:bg-slate-800 p-3 md:p-4 rounded-2xl md:rounded-[1.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 min-w-[100px] md:min-w-[120px] relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-12 md:h-16 h-12 md:w-16 bg-orange-500/10 rounded-bl-full -mr-2 -mt-2 md:-mr-4 md:-mt-4 group-hover:scale-150 transition-transform duration-500"></div>
                     <div className="relative z-10">
                         <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1 flex items-center gap-1">
                             <TrendingUp size={10} className="text-orange-500 md:w-3 md:h-3" />
                             Streak
                         </p>
                         <p className="text-xl md:text-3xl font-black text-slate-800 dark:text-white">{dailyStreak} <span className="text-base md:text-xl">🔥</span></p>
                     </div>
                 </div>
                 
                 <div className="bg-white dark:bg-slate-800 p-3 md:p-4 rounded-2xl md:rounded-[1.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 min-w-[100px] md:min-w-[120px] relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-12 md:h-16 h-12 md:w-16 bg-indigo-500/10 rounded-bl-full -mr-2 -mt-2 md:-mr-4 md:-mt-4 group-hover:scale-150 transition-transform duration-500"></div>
                     <div className="relative z-10">
                         <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1 flex items-center gap-1">
                             <Sparkles size={10} className="text-indigo-500 md:w-3 md:h-3" />
                             Words
                         </p>
                         <p className="text-xl md:text-3xl font-black text-slate-800 dark:text-white">{wordsLearned.length}</p>
                     </div>
                 </div>
            </div>
          </motion.div>
    
          {/* Feature Grid */}
          <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-2 gap-3 md:gap-4">
            {sections.map((section) => {
              const Wrapper = (section as any).isGame ? 'div' : Link;
              const props = (section as any).isGame ? { onClick: () => setShowGame(true) } : { to: `/english/${section.id}` };
              
              return (
                <Wrapper
                  key={section.id}
                  {...(props as any)}
                  className="group relative overflow-hidden bg-white dark:bg-slate-800 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-indigo-500/20 dark:hover:shadow-none transition-all duration-500 md:hover:-translate-y-1 block cursor-pointer"
                >
                  {/* Background Gradient Blob */}
                  <div className={`absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-gradient-to-br ${section.gradient} opacity-5 rounded-full blur-2xl md:blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                      <div className={`w-10 h-10 md:w-12 md:h-12 mb-3 md:mb-4 rounded-lg md:rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center shadow-lg shadow-${section.color.split('-')[1]}-500/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                        {React.createElement(section.icon, {
                          size: 20,
                          className: "text-white"
                        })}
                      </div>
    
                      <h3 className="text-lg md:text-2xl font-bold text-slate-800 dark:text-white mb-1 md:mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-violet-600 transition-all truncate">
                        {section.title}
                      </h3>
                      <p className="text-[10px] md:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm line-clamp-2 md:line-clamp-none">
                        {section.description}
                      </p>
                      
                      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 opacity-0 md:group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                              <ArrowRight size={12} className="text-slate-600 dark:text-slate-300" />
                          </div>
                      </div>
                  </div>
                </Wrapper>
              );
            })}
          </motion.div>
          
          <motion.div variants={item} className="mt-8 bg-gradient-to-r from-slate-900 to-indigo-900 rounded-[2rem] p-6 md:p-10 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="relative z-10 max-w-3xl mx-auto">
                  <Sparkles className="mx-auto text-yellow-400 mb-4" size={24} />
                  <h2 className="text-xl md:text-3xl font-serif italic text-white leading-relaxed mb-4">
                      "The limits of my language mean the limits of my world."
                  </h2>
                  <p className="text-indigo-200 font-bold uppercase tracking-widest text-xs">— Ludwig Wittgenstein</p>
              </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


