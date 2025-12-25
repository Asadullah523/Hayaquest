import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, BookOpen, CheckCircle, GraduationCap, X, Zap, Trophy, Sparkles, Star, ChevronRight, Award } from 'lucide-react';
import { grammarTopics } from '../../data/english/grammar';
import { useEnglishStore } from '../../store/useEnglishStore';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const Grammar: React.FC = () => {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'learn' | 'story' | 'practice'>('learn');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showTrophyReview, setShowTrophyReview] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { grammarTopicsMastered, markGrammarTopicAsMastered } = useEnglishStore();

  // Handle auto-scroll to topic detail
  useEffect(() => {
    if (selectedTopicId && window.innerWidth < 768) {
        // On mobile, scroll to content
        contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (selectedTopicId) {
        // On desktop, just ensure we are at the top of the content area
        const scrollContainer = contentRef.current?.querySelector('.overflow-y-auto');
        if (scrollContainer) {
            scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
  }, [selectedTopicId]);

  const selectedTopic = grammarTopics.find(t => t.id === selectedTopicId);

  const handleAnswer = (optionIdx: number) => {
      if (!selectedTopic) return;
      setSelectedAnswer(optionIdx);
      const correct = optionIdx === selectedTopic.practice[currentQuestionIdx].correctAnswer;
      setIsCorrect(correct);
  };

  const nextQuestion = () => {
      setSelectedAnswer(null);
      setIsCorrect(null);
      if (selectedTopic && currentQuestionIdx < selectedTopic.practice.length - 1) {
          setCurrentQuestionIdx((prev: number) => prev + 1);
      } else {
         // Finished
         if (selectedTopic) markGrammarTopicAsMastered(selectedTopic.id);
      }
  };

  const highlightStoryContent = (content: string) => {
      // Very simple parser based on brackets [] usage in data
      const parts = content.split(/(\[.*?\])/g);
      return parts.map((part, idx) => {
          if (part.startsWith('[') && part.endsWith(']')) {
             return (
                 <motion.span 
                    key={idx}
                    initial={{ backgroundColor: 'rgba(99, 102, 241, 0)' }}
                    whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.2)' }}
                    className="font-bold text-indigo-600 dark:text-indigo-400 px-1 rounded cursor-help relative group"
                 >
                     {part.slice(1, -1)}
                     <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                         Grammar Rule Applied!
                     </span>
                 </motion.span>
             );
          }
          return <span key={idx}>{part}</span>;
      });
  };

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Link to="/english" className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-colors shadow-sm border border-slate-100 dark:border-slate-700">
          <ArrowLeft className="text-slate-500 dark:text-slate-400" />
        </Link>
        <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Master Grammar</h1>
            <p className="text-slate-500 font-medium">Internalize rules through stories and practice.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Topics List */}
          <div className="md:col-span-4 space-y-3">
              {grammarTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => {
                        setSelectedTopicId(topic.id);
                        setActiveTab('learn');
                        setCurrentQuestionIdx(0);
                        setSelectedAnswer(null);
                        setIsCorrect(null);
                        setShowTrophyReview(false);
                    }}
                    className={`w-full text-left p-5 rounded-[1.5rem] border transition-all duration-300 relative overflow-hidden group ${
                        selectedTopicId === topic.id
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/30'
                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                      <div className="relative z-10 flex items-center justify-between">
                          <div>
                              <p className="font-bold text-lg mb-1">{topic.title}</p>
                              <span className={`text-xs font-bold uppercase tracking-wider ${selectedTopicId === topic.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                                  {topic.difficulty}
                              </span>
                          </div>
                          {grammarTopicsMastered.includes(topic.id) && (
                              <CheckCircle className={selectedTopicId === topic.id ? 'text-white' : 'text-green-500'} size={20} />
                          )}
                      </div>
                  </button>
              ))}
          </div>

          {/* Content Area */}
          <div ref={contentRef} className="md:col-span-8 lg:col-span-8">
              <div className="md:sticky md:top-8">
                  <AnimatePresence mode="wait">
                  {selectedTopic ? (
                      <motion.div 
                        key={selectedTopic.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden h-[calc(100vh-12rem)] min-h-[600px] flex flex-col relative"
                      >
                          {/* Trophy Mode Overlay (If Mastered and not in review) */}
                          {grammarTopicsMastered.includes(selectedTopic.id) && !showTrophyReview && activeTab !== 'practice' && (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center"
                              >
                                  <motion.div 
                                    initial={{ scale: 0, rotate: -20 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-center justify-center mb-8 shadow-2xl"
                                  >
                                      <Trophy size={48} className="text-white" />
                                  </motion.div>
                                  <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">Topic Mastered!</h2>
                                  <p className="text-slate-500 dark:text-slate-400 text-lg max-w-sm mb-10 leading-relaxed">
                                      You've unlocked the secrets of <span className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedTopic.title}</span>.
                                  </p>
                                  <div className="flex gap-4">
                                      <button 
                                        onClick={() => markGrammarTopicAsMastered(selectedTopic.id)} // This is just to trigger any state logic if needed, but it's already mastered
                                        className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2"
                                        style={{ display: 'none' }} // Hidden as it's just meant to be there
                                      >
                                          Done
                                      </button>
                                      <button 
                                        className="px-8 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest"
                                        onClick={() => setShowTrophyReview(true)}
                                      >
                                          Review Content
                                      </button>
                                  </div>
                                  <div id="trophy-view" className="absolute inset-0 pointer-events-none">
                                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 opacity-10">
                                          <Sparkles className="absolute top-1/4 left-1/4 text-yellow-400" size={40} />
                                          <Sparkles className="absolute top-1/4 right-1/4 text-indigo-400" size={30} />
                                          <Sparkles className="absolute bottom-1/4 left-1/3 text-purple-400" size={50} />
                                      </motion.div>
                                  </div>
                              </motion.div>
                          )}

                          {/* Tabs */}
                          <div className="flex border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-2">
                              {[
                                { id: 'learn', icon: BookOpen, label: 'Learn' },
                                { id: 'story', icon: GraduationCap, label: 'Story' },
                                { id: 'practice', icon: Award, label: 'Practice' }
                              ].map((tab) => (
                                  <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                                        activeTab === tab.id 
                                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' 
                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                    }`}
                                  >
                                      {tab.id === 'story' && !selectedTopic.storyContext ? null : (
                                          <>
                                              <tab.icon size={14} />
                                              {tab.label}
                                          </>
                                      )}
                                  </button>
                              ))}
                          </div>

                          <div className="p-8 md:p-12 flex-1 overflow-y-auto custom-scrollbar">
                              {activeTab === 'learn' && (
                                  <div className="space-y-12 animate-in fade-in duration-500">
                                      <div className="space-y-6">
                                          <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                                  <BookOpen size={20} />
                                              </div>
                                              <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">
                                                  {selectedTopic.title}
                                              </h2>
                                          </div>
                                          <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                              {selectedTopic.explanation}
                                          </p>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <div className="bg-indigo-50 dark:bg-indigo-900/10 p-8 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/30 space-y-6">
                                              <h3 className="font-black text-indigo-900 dark:text-indigo-300 flex items-center gap-2 text-sm uppercase tracking-widest">
                                                  <Zap size={18} className="text-yellow-500" /> Usage Examples
                                              </h3>
                                              <div className="space-y-4">
                                                  {selectedTopic.examples.map((ex, idx) => (
                                                      <div key={idx} className="flex items-start gap-4 bg-white dark:bg-slate-800/40 p-4 rounded-2xl shadow-sm">
                                                          <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                                                              <CheckCircle size={14} className="text-indigo-600" />
                                                          </div>
                                                          <span className="text-slate-700 dark:text-slate-200 font-bold">{ex}</span>
                                                      </div>
                                                  ))}
                                              </div>
                                          </div>

                                          <div className="space-y-6">
                                              <h3 className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-widest flex items-center gap-2">
                                                  <X size={18} className="text-red-500" /> Common Pitfalls
                                              </h3>
                                              <div className="space-y-4">
                                                  {selectedTopic.commonMistakes.map((mistake, idx) => (
                                                      <div key={idx} className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none hover:scale-[1.02] transition-transform">
                                                          <div className="flex items-center gap-3 text-red-500/50 font-black mb-1 line-through text-sm">
                                                              {mistake.incorrect}
                                                          </div>
                                                          <div className="flex items-center gap-3 text-emerald-500 font-black mb-4">
                                                              <CheckCircle size={16} /> {mistake.correct}
                                                          </div>
                                                          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm text-slate-500 font-medium">
                                                              💡 {mistake.explanation}
                                                          </div>
                                                      </div>
                                                  ))}
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              )}

                              {activeTab === 'story' && selectedTopic.storyContext && (
                                  <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                                      <div className="mb-12 p-8 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
                                          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-20 -mt-20" />
                                          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                                              <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center shrink-0">
                                                  <BookOpen size={40} className="text-indigo-400" />
                                              </div>
                                              <div>
                                                  <h2 className="text-4xl font-black font-serif italic mb-2 tracking-tight">"{selectedTopic.storyContext.title}"</h2>
                                                  <p className="text-indigo-200/60 font-black uppercase tracking-[0.2em] text-[10px]">Contextual Learning Quest</p>
                                              </div>
                                          </div>
                                      </div>
                                      
                                      <div className="prose dark:prose-invert prose-2xl max-w-none font-serif leading-loose text-slate-700 dark:text-slate-300">
                                          <p>{highlightStoryContent(selectedTopic.storyContext.content)}</p>
                                      </div>

                                      <div className="mt-12 p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/30 flex items-center gap-4">
                                          <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm">
                                              <Star size={24} className="text-yellow-500" />
                                          </div>
                                          <p className="text-slate-600 dark:text-slate-300 font-bold italic">
                                              {selectedTopic.storyContext.highlightedRuleWrapper}
                                          </p>
                                      </div>
                                  </div>
                              )}

                              {activeTab === 'practice' && (
                                  <div className="h-full flex flex-col justify-between animate-in fade-in slide-in-from-bottom-8 duration-700">
                                      <div>
                                          <div className="flex justify-between items-center mb-12">
                                              <div className="space-y-1">
                                                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">Quest Progress</span>
                                                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Question {currentQuestionIdx + 1} of {selectedTopic.practice.length}</h3>
                                              </div>
                                              <div className="flex gap-2">
                                                  {selectedTopic.practice.map((_: any, idx: number) => (
                                                      <div 
                                                        key={idx} 
                                                        className={`h-2.5 rounded-full transition-all duration-500 ${
                                                            idx === currentQuestionIdx 
                                                            ? 'w-8 bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]' 
                                                            : idx < currentQuestionIdx
                                                                ? 'w-2.5 bg-emerald-500'
                                                                : 'w-2.5 bg-slate-100 dark:bg-slate-700'
                                                        }`}
                                                       />
                                                  ))}
                                              </div>
                                          </div>

                                          <div className="mb-12">
                                              <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
                                                  {selectedTopic.practice[currentQuestionIdx].question}
                                              </h3>
                                          </div>

                                          <div className="grid grid-cols-1 gap-4">
                                              {selectedTopic.practice[currentQuestionIdx].options.map((option: string, idx: number) => (
                                                  <button
                                                      key={idx}
                                                      onClick={() => handleAnswer(idx)}
                                                      disabled={selectedAnswer !== null}
                                                      className={`w-full p-8 text-left rounded-[2rem] border-2 font-black text-xl transition-all relative overflow-hidden group ${
                                                          selectedAnswer === null
                                                          ? 'border-slate-100 dark:border-slate-800 hover:border-indigo-500 hover:scale-[1.01] bg-white dark:bg-slate-900'
                                                          : selectedAnswer === idx
                                                              ? isCorrect
                                                                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                                                                  : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                                              : idx === selectedTopic.practice[currentQuestionIdx].correctAnswer
                                                                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                                                                  : 'opacity-50 border-slate-100'
                                                      }`}
                                                  >
                                                      {option}
                                                      {selectedAnswer !== null && idx === selectedTopic.practice[currentQuestionIdx].correctAnswer && (
                                                          <CheckCircle className="absolute right-8 top-1/2 -translate-y-1/2 text-emerald-500" size={28} />
                                                      )}
                                                      {selectedAnswer === idx && !isCorrect && (
                                                          <X className="absolute right-8 top-1/2 -translate-y-1/2 text-red-500" size={28} />
                                                      )}
                                                  </button>
                                              ))}
                                          </div>
                                      </div>

                                      <AnimatePresence>
                                      {selectedAnswer !== null && (
                                          <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-700"
                                          >
                                              <div className={`p-8 rounded-[2rem] mb-8 relative overflow-hidden ${isCorrect ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20'}`}>
                                                  <div className="flex items-center gap-4 mb-4">
                                                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white shadow-lg'}`}>
                                                          {isCorrect ? <Sparkles size={24} /> : <X size={24} />}
                                                      </div>
                                                      <h4 className="text-2xl font-black uppercase tracking-tight">
                                                          {isCorrect ? 'Phenomenal!' : 'Target Missed'}
                                                      </h4>
                                                  </div>
                                                  <p className="text-lg font-medium opacity-90 leading-relaxed pl-16">
                                                      {selectedTopic.practice[currentQuestionIdx].explanation}
                                                  </p>
                                              </div>
                                              
                                              <button 
                                                onClick={nextQuestion}
                                                className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3"
                                              >
                                                  {currentQuestionIdx < selectedTopic.practice.length - 1 ? (
                                                      <>Next Quest Stage <ChevronRight size={20} /></>
                                                  ) : (
                                                      <>Claim Mastery <Trophy size={20} className="text-yellow-500" /></>
                                                  )}
                                              </button>
                                          </motion.div>
                                      )}
                                      </AnimatePresence>
                                  </div>
                              )}
                          </div>
                      </motion.div>
                  ) : (
                      <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                          <motion.div 
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                          >
                            <GraduationCap size={80} className="mb-8 opacity-10" />
                          </motion.div>
                          <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tighter">Choose Your Quest</h3>
                          <p className="text-lg font-medium max-w-sm">Select a grammar topic from the left to begin your journey to mastery.</p>
                      </div>
                  )}
                  </AnimatePresence>
              </div>
          </div>
      </div>
    </div>
  );
};
