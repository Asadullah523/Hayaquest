import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Star, Volume2, Shuffle, CheckCircle, Brain, Sparkles, ChevronRight } from 'lucide-react';
import { dictionaryData } from '../../data/english/dictionary';
import { useEnglishStore } from '../../store/useEnglishStore';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'framer-motion';

export const VocabularyBuilder: React.FC = () => {
    const { 
        wordsLearned, 
        markWordAsLearned, 
        vocabularyIndex, 
        setVocabularyIndex,
        shuffledWordIds,
        vocabularySessionId,
        shuffleVocabulary,
        markWordAsRead
    } = useEnglishStore();
    
    const [flipped, setFlipped] = useState(false);
    const [isShuffled, setIsShuffled] = useState(false);
    const controls = useAnimation();
    
    // Mouse tilt effect (Parallax) - Only apply this to the INNER card container
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const tiltX = useTransform(mouseY, [-300, 300], [10, -10]);
    const tiltY = useTransform(mouseX, [-300, 300], [-10, 10]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        mouseX.set(x);
        mouseY.set(y);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };
    
    // Determine the current pool of words based on learned status and shuffled order
    const sessionWords = useMemo(() => {
        const unlearnedPool = dictionaryData.filter(d => !wordsLearned.includes(d.id));
        
        if (shuffledWordIds && shuffledWordIds.length > 0) {
            // Reconstruct the shuffled order from stored IDs
            const wordMap = new Map<string, (typeof dictionaryData[0])[]>();
            unlearnedPool.forEach(w => {
                const list = wordMap.get(w.id) || [];
                list.push(w);
                wordMap.set(w.id, list);
            });

            const orderedWords: typeof dictionaryData = [];
            shuffledWordIds.forEach(id => {
                const list = wordMap.get(id);
                if (list && list.length > 0) {
                    orderedWords.push(list.shift()!);
                }
            });
            
            wordMap.forEach(list => {
                orderedWords.push(...list);
            });

            return orderedWords;
        }
        
        return unlearnedPool;
    }, [wordsLearned, shuffledWordIds]);

    // Force flip back when current word changes (e.g. via navigation or mastery)
    const currentWordId = sessionWords[vocabularyIndex]?.id;
    useEffect(() => {
        setFlipped(false);
    }, [currentWordId, vocabularySessionId]);

    // Validate and sync index
    useEffect(() => {
        if (sessionWords.length > 0 && vocabularyIndex >= sessionWords.length) {
            setVocabularyIndex(0);
        }
    }, [sessionWords.length, vocabularyIndex, setVocabularyIndex]);

    const currentWord = sessionWords[vocabularyIndex];

    const handleNext = useCallback(() => {
        if (sessionWords.length === 0) return;
        setFlipped(false);
        const nextIndex = (vocabularyIndex + 1) % sessionWords.length;
        setVocabularyIndex(nextIndex);
    }, [sessionWords.length, vocabularyIndex, setVocabularyIndex]);

    const handlePrevious = useCallback(() => {
        if (sessionWords.length === 0) return;
        setFlipped(false);
        const prevIndex = (vocabularyIndex - 1 + sessionWords.length) % sessionWords.length;
        setVocabularyIndex(prevIndex);
    }, [sessionWords.length, vocabularyIndex, setVocabularyIndex]);

    const handleShuffle = () => {
        const unlearnedPool = dictionaryData.filter(d => !wordsLearned.includes(d.id));
        if (unlearnedPool.length === 0) return;
        
        // Before shuffling, we can record the current word as "read" if needed
        if (currentWord) markWordAsRead(currentWord.id);
        
        shuffleVocabulary(unlearnedPool.map(w => w.id));
        setIsShuffled(true);
        setTimeout(() => setIsShuffled(false), 1000);
    };

    const handleMarkAsLearned = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        e?.preventDefault();
        if (currentWord) {
            const idToMark = currentWord.id;
            // Immediate UI feedback
            setFlipped(false);
            controls.start({
                scale: [1, 1.15, 1],
                transition: { duration: 0.3 }
            });
            
            // Mark in store
            markWordAsLearned(idToMark);
        }
    }, [currentWord, markWordAsLearned, controls]);

    const handlePlayAudio = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!currentWord) return;
        const utterance = new SpeechSynthesisUtterance(currentWord.word);
        window.speechSynthesis.speak(utterance);
    };

    const handleCardFlip = useCallback(() => {
        // Single tap for better mobile UX
        setFlipped(prev => !prev);
    }, []);

    const handleDragEnd = (_: any, info: any) => {
        // Swipe threshold -> 50px
        const threshold = 50;
        if (info.offset.x < -threshold) {
             handleNext();
        } else if (info.offset.x > threshold) {
             handlePrevious();
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (sessionWords.length === 0) return;
            switch(e.key) {
                case 'ArrowRight': handleNext(); break;
                case 'ArrowLeft': handlePrevious(); break;
                case ' ': e.preventDefault(); setFlipped(prev => !prev); break;
                case 'Enter': handleMarkAsLearned(); break;
                case 'v': case 'V': handlePlayAudio(); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrevious, handleMarkAsLearned, sessionWords.length]);

    return (
        <div className="relative min-h-[80vh] flex flex-col items-center justify-start pb-12 pt-6 overflow-hidden px-4 md:pt-10">
            {/* Animated Background Blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], x: [0, 50, 0], y: [0, -30, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-20 -left-20 w-80 h-80 md:w-96 md:h-96 bg-indigo-500/10 rounded-full blur-[80px] md:blur-[100px]"
                />
                <motion.div 
                    animate={{ scale: [1, 1.3, 1], rotate: [0, -120, 0], x: [0, -60, 0], y: [0, 40, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-20 -right-20 w-80 h-80 md:w-96 md:h-96 bg-purple-500/10 rounded-full blur-[80px] md:blur-[100px]"
                />
            </div>

            <div className="w-full max-w-5xl space-y-6 md:space-y-12 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
                    <div className="flex items-center gap-4 md:gap-6">
                        <Link to="/english" className="p-3 md:p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl hover:bg-white dark:hover:bg-slate-800 rounded-2xl md:rounded-3xl transition-all shadow-xl shadow-indigo-500/5 border border-white/20 dark:border-slate-700 group flex-shrink-0">
                            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                        </Link>
                        <div className="min-w-0">
                            <h1 className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-1 md:mb-2 truncate">
                                Vocabulary <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 italic">Builder</span>
                            </h1>
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-[11px] md:text-sm">
                                <Sparkles size={14} className="text-indigo-400 animate-pulse flex-shrink-0" />
                                <span className="truncate">Level up your academic lexicon.</span>
                            </div>
                        </div>
                    </div>

                    {sessionWords.length > 0 && (
                        /* Mobile Stats - now using Flex Wrap for better fitting */
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md p-2 rounded-2xl md:rounded-[2rem] border border-white/20 dark:border-slate-800/50 shadow-lg w-full md:w-auto">
                            <div className="flex-1 min-w-[100px] px-3 py-2.5 md:px-6 md:py-3 bg-white/80 dark:bg-slate-800/80 text-indigo-600 dark:text-indigo-400 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-wider border border-indigo-500/20 flex items-center justify-center gap-2">
                                <CheckCircle size={14} />
                                <span className="whitespace-nowrap">Mastered: {wordsLearned.length}</span>
                            </div>
                            <button 
                                onClick={handleShuffle}
                                className={`flex-1 min-w-[100px] px-3 py-2.5 md:px-6 md:py-3 rounded-xl md:rounded-2xl transition-all flex items-center justify-center gap-2 font-black text-[10px] md:text-xs uppercase tracking-wider ${
                                    isShuffled ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                }`}
                            >
                                <Shuffle size={14} className={isShuffled ? 'animate-spin' : ''} />
                                Shuffle
                            </button>
                            <div className="w-full md:w-auto px-3 py-2.5 md:px-6 md:py-3 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-wider shadow-lg whitespace-nowrap text-center">
                                Card {vocabularyIndex + 1} / {sessionWords.length}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Card Area */}
                {sessionWords.length > 0 ? (
                    <div 
                        className="max-w-[320px] md:max-w-[400px] w-full mx-auto"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div className="perspective-2000 w-full aspect-[3/4] md:aspect-[4/5] relative mb-8">
                            <AnimatePresence mode="wait">
                                {/* DRAGGABLE WRAPPER - Handles Swipe Logic */}
                                <motion.div 
                                   key={`${currentWord.id}-${vocabularySessionId}`}
                                   className="w-full h-full relative cursor-grabbing touch-none"
                                   initial={{ opacity: 0, x: 50 }}
                                   animate={{ 
                                       opacity: 1,
                                       x: 0 // Always reset to center
                                   }}
                                   exit={{ opacity: 0, x: -50 }}
                                   transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                   drag="x"
                                   dragConstraints={{ left: 0, right: 0 }}
                                   dragElastic={0.2}
                                   onDragEnd={handleDragEnd}
                                >
                                    {/* FLIPPABLE CARD */}
                                    <motion.div 
                                        className="w-full h-full relative preserve-3d"
                                        animate={{ rotateY: flipped ? 180 : 0 }}
                                        transition={{ duration: 0.6, ease: "backOut" }} 
                                        style={{ 
                                            rotateX: tiltX, 
                                            rotateY: tiltY
                                        }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleCardFlip();
                                        }}
                                    >
                                        
                                        {/* FRONT SIDE */}
                                        <div 
                                            className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[3.5rem] border border-white/40 dark:border-slate-800/50 shadow-2xl backface-hidden flex flex-col items-center justify-center p-6 md:p-12 text-center group z-10"
                                            style={{ backfaceVisibility: 'hidden' }}
                                        >
                                            <div className="absolute top-6 left-6 md:top-12 md:left-12 opacity-20">
                                                <Brain size={32} className="md:w-12 md:h-12 text-indigo-600 dark:text-indigo-400" />
                                            </div>

                                            <div className="relative mb-6 md:mb-8 w-full flex-1 flex items-center justify-center">
                                                <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 transform -translate-y-4" />
                                                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none relative z-10 pointer-events-none break-words px-2">
                                                    {currentWord.word}
                                                </h2>
                                            </div>

                                            <div className="flex items-center gap-3 md:gap-4 py-2 px-4 md:py-2.5 md:px-5 bg-slate-900/5 dark:bg-white/5 rounded-2xl backdrop-blur-sm mb-6 md:mb-8 border border-slate-900/5 dark:border-white/5 relative z-30">
                                                <span className="text-slate-500 dark:text-slate-400 font-mono text-sm md:text-base">{currentWord.phonetic}</span>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handlePlayAudio(); }} 
                                                    className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all"
                                                >
                                                    <Volume2 size={16} />
                                                </button>
                                            </div>

                                            <div className="mt-auto flex flex-col items-center gap-3 relative z-30 pb-4">
                                                <div className="flex flex-col items-center gap-1 text-indigo-500 font-black text-[10px] uppercase tracking-[0.2em] animate-pulse text-center opacity-80">
                                                    <span>Tap to Flip</span>
                                                    <span className="text-[9px] opacity-70">Swipe for Next</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* BACK SIDE */}
                                        <div 
                                            className="absolute inset-0 bg-slate-950 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-800 shadow-2xl flex flex-col justify-between p-6 md:p-12 overflow-hidden text-left z-20"
                                            style={{ 
                                                transform: 'rotateY(180deg)',
                                                backfaceVisibility: 'hidden'
                                            }}
                                        >
                                            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
                                            
                                            <div className="relative z-10 space-y-4 md:space-y-10 flex-1 overflow-y-auto custom-scrollbar">
                                                <div className="flex flex-wrap gap-2 md:gap-3">
                                                    <span className="px-3 py-1.5 md:px-5 md:py-2 bg-white/10 text-white rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-wider border border-white/10">
                                                        {currentWord.meanings[0].partOfSpeech}
                                                    </span>
                                                    <span className={`px-3 py-1.5 md:px-5 md:py-2 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-wider border ${currentWord.difficulty === 'advanced' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                                        {currentWord.difficulty}
                                                    </span>
                                                </div>

                                                <div className="space-y-2 md:space-y-3">
                                                    <p className="text-[hsl(133.48deg_98.26%_42.71%)] font-black text-[10px] uppercase tracking-widest">
                                                        Definition
                                                    </p>
                                                    <h3 className="text-lg md:text-2xl font-black text-white leading-tight tracking-tight">
                                                        {currentWord.meanings[0].definition}
                                                    </h3>
                                                </div>

                                                <div className="space-y-2 md:space-y-3 pt-3 md:pt-6 border-t border-white/5">
                                                    <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                                        <Brain size={12} /> Usage
                                                    </p>
                                                    <p className="text-sm md:text-lg italic leading-relaxed font-serif text-slate-400">
                                                        "{currentWord.meanings[0].example}"
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="relative z-[100] pt-4 md:pt-6">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent flip
                                                        handleMarkAsLearned(e);
                                                    }} 
                                                    className="w-full py-3 md:py-5 rounded-2xl md:rounded-3xl font-black text-xs md:text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 md:gap-3 active:scale-95 cursor-pointer relative z-[110] bg-white text-slate-900 shadow-2xl hover:bg-slate-100"
                                                >
                                                    <Sparkles size={16} className="md:w-5 md:h-5 text-indigo-600" />
                                                    Mark as Learned
                                                </button>
                                            </div>
                                        </div>

                                    </motion.div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Controls Overlay */}
                        <div className="mt-4 md:mt-12 flex items-center justify-between md:justify-center gap-2 md:gap-10 px-0 w-full">
                            <button onClick={handlePrevious} className="group flex flex-col items-center gap-1 md:gap-3 transition-all active:scale-90 flex-shrink-0">
                                <div className="p-3 md:p-5 rounded-2xl md:rounded-3xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/20 dark:border-slate-700 shadow-xl text-slate-500 group-hover:text-indigo-600 transition-all">
                                    <ChevronRight size={20} className="rotate-180 md:w-5 md:h-5" />
                                </div>
                            </button>

                            <button onClick={(e) => handleMarkAsLearned(e)} className="flex-1 max-w-[200px] px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl md:rounded-[2.5rem] font-black uppercase tracking-[0.1em] text-[10px] md:text-xs shadow-2xl hover:scale-105 transition-all flex justify-center items-center">
                                <span className="flex items-center gap-2 md:gap-3 whitespace-nowrap"><Brain size={16} /> Master Word</span>
                            </button>

                            <button onClick={handleNext} className="group flex flex-col items-center gap-1 md:gap-3 transition-all active:scale-90 flex-shrink-0">
                                <div className="p-3 md:p-5 rounded-2xl md:rounded-3xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/20 dark:border-slate-700 shadow-xl text-slate-500 group-hover:text-indigo-600 transition-all">
                                    <ChevronRight size={20} className="md:w-5 md:h-5" />
                                </div>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white/50 dark:bg-slate-800/50 backdrop-blur-2xl rounded-[4rem] border border-white/20 dark:border-slate-700 max-w-2xl mx-auto shadow-2xl flex flex-col items-center">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-center justify-center mb-10 shadow-xl">
                            <Star className="text-white" size={48} fill="currentColor" />
                        </motion.div>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">Vocabulary Mastered!</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl max-w-md mx-auto mb-12 font-medium px-8">Every word in the dictionary is now part of your kingdom.</p>
                        <Link to="/english" className="px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl">Dashboard</Link>
                    </div>
                )}

            </div>
        </div>
    );
};
