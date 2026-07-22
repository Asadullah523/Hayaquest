
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Timer, RefreshCw, ChevronLeft, Zap, CheckCircle, XCircle } from 'lucide-react';
import { dictionaryData } from '../../data/english/dictionary';
import { useGamificationStore } from '../../store/useGamificationStore';
import clsx from 'clsx';

interface GameWord {
    word: string;
    definition: string;
    options: string[];
}

const WORDS_PER_STAGE = 10;
const PASS_THRESHOLD = 7; // 70%

export const VocabMatchGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { addXp } = useGamificationStore();
    
    // Screens: 'home' | 'stages' | 'playing' | 'failed' | 'complete'
    const [screen, setScreen] = useState<'home' | 'stages' | 'playing' | 'failed' | 'complete'>('home');
    const [unlockedStages, setUnlockedStages] = useState<number>(() => parseInt(localStorage.getItem('vocab_match_unlocked_stage') || '1'));
    const [selectedStage, setSelectedStage] = useState<number>(1);
    const [currentQuestion, setCurrentQuestion] = useState<GameWord | null>(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('vocab_match_highscore') || '0'));
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [showQuitModal, setShowQuitModal] = useState(false);
    
    // Stage words tracking
    const [remainingWordIndices, setRemainingWordIndices] = useState<number[]>([]);
    const [questionsAnswered, setQuestionsAnswered] = useState(0);

    const totalStages = Math.ceil(dictionaryData.length / WORDS_PER_STAGE);

    const getStageWords = useCallback((stage: number) => {
        const start = (stage - 1) * WORDS_PER_STAGE;
        const end = Math.min(start + WORDS_PER_STAGE, dictionaryData.length);
        const indices = [];
        for (let i = start; i < end; i++) indices.push(i);
        return indices;
    }, []);

    const finishStage = useCallback(() => {
        const passed = score >= PASS_THRESHOLD;
        if (passed) {
            setScreen('complete');
            if (selectedStage === unlockedStages && selectedStage < totalStages) {
                const nextStage = selectedStage + 1;
                setUnlockedStages(nextStage);
                localStorage.setItem('vocab_match_unlocked_stage', nextStage.toString());
            }
        } else {
            setScreen('failed');
        }
    }, [score, selectedStage, unlockedStages, totalStages]);

    const generateQuestion = useCallback(() => {
        if (remainingWordIndices.length === 0) {
            finishStage();
            return;
        }

        const randomIndexInRemaining = Math.floor(Math.random() * remainingWordIndices.length);
        const dictIndex = remainingWordIndices[randomIndexInRemaining];
        const correctEntry = dictionaryData[dictIndex];
        const correctDef = correctEntry.meanings?.[0]?.definition || "Definition not found";

        const wrongDefs: string[] = [];
        while (wrongDefs.length < 3) {
            const rIndex = Math.floor(Math.random() * dictionaryData.length);
            const def = dictionaryData[rIndex].meanings?.[0]?.definition;
            if (def && def !== correctDef && !wrongDefs.includes(def)) {
                wrongDefs.push(def);
            }
        }

        const options = [correctDef, ...wrongDefs].sort(() => Math.random() - 0.5);

        setCurrentQuestion({
            word: correctEntry.word,
            definition: correctDef,
            options
        });
        setTimeLeft(15);
        setFeedback(null);
    }, [remainingWordIndices, finishStage]);

    const startStage = (stage: number) => {
        setSelectedStage(stage);
        const stageIndices = getStageWords(stage);
        setRemainingWordIndices(stageIndices);
        setQuestionsAnswered(0);
        setScore(0);
        setScreen('playing');
        setCurrentQuestion(null);
    };

    useEffect(() => {
        if (screen === 'playing' && remainingWordIndices.length > 0 && !currentQuestion) {
            generateQuestion();
        } else if (screen === 'playing' && remainingWordIndices.length === 0 && !currentQuestion) {
             finishStage();
        }
    }, [remainingWordIndices, screen, currentQuestion, generateQuestion, finishStage]);

    const handleAnswer = (answer: string | null) => {
        if (!currentQuestion || feedback) return;

        const isCorrect = answer === currentQuestion.definition;

        if (isCorrect) {
            setScore(s => s + 1);
            setFeedback('correct');
            addXp(10);
        } else {
            setFeedback('wrong');
        }

        // Always remove the word, whether right or wrong (fixed set logic)
        setRemainingWordIndices(prev => 
            prev.filter(idx => dictionaryData[idx].word !== currentQuestion.word)
        );
        setQuestionsAnswered(prev => prev + 1);

        setTimeout(() => {
            setCurrentQuestion(null);
        }, 800);
    };

    useEffect(() => {
        let timer: any;
        if (screen === 'playing' && timeLeft > 0 && !feedback && currentQuestion) {
            timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0 && screen === 'playing' && currentQuestion) {
            // Time out acts as a wrong answer
            handleAnswer(null); 
        }
        return () => clearTimeout(timer);
    }, [timeLeft, screen, feedback, currentQuestion]); // Removed handleAnswer from deps as it's stable enough or causes loop

    useEffect(() => {
        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('vocab_match_highscore', score.toString());
        }
    }, [score, highScore]);

    const renderContent = () => {
        switch (screen) {
            case 'home':
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center min-h-[400px] sm:min-h-[500px] p-6 sm:p-8 text-center bg-gradient-to-b from-indigo-50/50 to-white dark:from-slate-900/50 dark:to-slate-950 rounded-[2rem] sm:rounded-[3rem] relative"
                    >
                        <button 
                          onClick={onBack}
                          className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all font-bold group"
                        >
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <ChevronLeft size={20} />
                          </div>
                          Back
                        </button>

                        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-primary/10 rounded-2xl sm:rounded-[2rem] flex items-center justify-center text-primary mb-6 sm:mb-8 animate-bounce">
                            <Zap size={32} className="sm:w-12 sm:h-12" fill="currentColor" />
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 sm:mb-4 tracking-tighter">Vocab Match</h2>
                        <p className="max-w-md text-slate-500 font-medium mb-12">
                            Level up your vocabulary! Match words in 50+ stages.
                            <span className="block mt-2 text-primary font-bold">Score 70% or higher to unlock the next stage!</span>
                        </p>
                        <button 
                            onClick={() => setScreen('stages')}
                            className="px-12 py-5 bg-primary text-white rounded-full font-black text-lg shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                        >
                            Explore Stages <Zap size={20} fill="currentColor" />
                        </button>
                        <div className="mt-8 flex gap-6">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery Level</span>
                                <span className="text-xl font-black text-slate-800 dark:text-white">Stage {unlockedStages}</span>
                            </div>
                            <div className="w-[1px] h-10 bg-slate-100 dark:bg-slate-800"></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">High Score</span>
                                <span className="text-xl font-black text-slate-800 dark:text-white">{highScore}</span>
                            </div>
                        </div>
                    </motion.div>
                );
            case 'stages':
                return (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-10"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <button 
                                    onClick={() => setScreen('home')}
                                    className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-2"
                                >
                                    <ChevronLeft size={20} /> Back
                                </button>
                                <h2 className="text-4xl font-black text-slate-800 dark:text-white underline decoration-primary/30 underline-offset-8">Select Stage</h2>
                            </div>
                            <div className="bg-primary/5 px-6 py-4 rounded-[1.5rem] border border-primary/10">
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block mb-1">Current Progress</span>
                                <p className="text-2xl font-black text-primary">{unlockedStages} <span className="text-sm opacity-50 font-bold">/ {totalStages}</span></p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 h-[60vh] sm:h-[500px] overflow-y-auto no-scrollbar p-1">
                            {Array.from({ length: totalStages }).map((_, i) => {
                                const stageNum = i + 1;
                                const isLocked = stageNum > unlockedStages;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => !isLocked && startStage(stageNum)}
                                        disabled={isLocked}
                                        className={clsx(
                                            "relative h-32 rounded-[2rem] flex flex-col items-center justify-center transition-all duration-300 border-2",
                                            isLocked 
                                                ? "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 cursor-not-allowed grayscale"
                                                : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-primary hover:-translate-y-1 hover:shadow-xl group active:scale-95"
                                        )}
                                    >
                                        {isLocked ? (
                                            <div className="flex flex-col items-center gap-2 opacity-40">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-widest">{stageNum}</span>
                                            </div>
                                        ) : (
                                            <>
                                                {stageNum < unlockedStages && (
                                                    <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white p-1">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                    </div>
                                                )}
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-primary transition-colors">Stage</span>
                                                <span className="text-3xl font-black text-slate-800 dark:text-white group-hover:scale-110 transition-transform">{stageNum}</span>
                                            </>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                );
            case 'complete':
                return (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center min-h-[400px] sm:min-h-[500px] p-6 sm:p-8 text-center bg-gradient-to-b from-emerald-50/50 to-white dark:from-slate-900/50 dark:to-slate-950 rounded-[2rem] sm:rounded-[3rem]"
                    >
                        <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center text-white mb-8 shadow-2xl shadow-emerald-500/40">
                            <Trophy size={48} />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Stage Passed!</h2>
                        <p className="text-slate-500 font-bold mb-12">Amazing work! You scored high enough to unlock the next stage.</p>
                        <div className="flex gap-8 mb-12 mt-8">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</span>
                                <span className="text-4xl font-black text-emerald-500">{score}/{WORDS_PER_STAGE}</span>
                            </div>
                            <div className="w-[1px] h-10 bg-slate-100 dark:bg-slate-800 self-center"></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accuracy</span>
                                <span className="text-4xl font-black text-primary">{Math.round((score/WORDS_PER_STAGE)*100)}%</span>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={() => {
                                    if (selectedStage < totalStages) startStage(selectedStage + 1);
                                    else setScreen('stages');
                                }}
                                className="px-10 py-5 bg-slate-900 dark:bg-primary dark:text-white text-white rounded-full font-black shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                            >
                                Next Stage <ArrowRightIcon size={20} />
                            </button>
                            <button 
                                onClick={() => setScreen('stages')}
                                className="px-10 py-5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full font-black border border-slate-100 dark:border-slate-700 shadow-md hover:scale-105 transition-all"
                            >
                                Stage Map
                            </button>
                        </div>
                    </motion.div>
                );
            case 'failed':
                return (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center min-h-[400px] sm:min-h-[500px] p-6 sm:p-8 text-center bg-gradient-to-b from-rose-50/50 to-white dark:from-slate-900/50 dark:to-slate-950 rounded-[2rem] sm:rounded-[3rem]"
                    >
                        <div className="w-24 h-24 bg-rose-100 dark:bg-rose-900/30 rounded-[2rem] flex items-center justify-center text-rose-500 mb-8">
                            <XCircle size={48} fill="currentColor" className="text-rose-500" />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Stage Failed</h2>
                        <p className="text-slate-500 font-bold mb-12">You need 70% to pass. Keep practicing!</p>
                        <div className="flex gap-8 mb-12 mt-8">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</span>
                                <span className="text-4xl font-black text-rose-500">{score}/{WORDS_PER_STAGE}</span>
                            </div>
                            <div className="w-[1px] h-10 bg-slate-100 dark:bg-slate-800 self-center"></div>
                             <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accuracy</span>
                                <span className="text-4xl font-black text-slate-400">{Math.round((score/WORDS_PER_STAGE)*100)}%</span>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={() => startStage(selectedStage)}
                                className="px-10 py-4 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-full font-black shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                            >
                                <RefreshCw size={20} /> Retry Stage
                            </button>
                            <button 
                                onClick={() => setScreen('stages')}
                                className="px-10 py-4 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full font-black border border-slate-100 dark:border-slate-700 shadow-md hover:scale-105 transition-all"
                            >
                                Choose Level
                            </button>
                        </div>
                    </motion.div>
                );
            case 'playing':
                return (
                    <div className="max-w-3xl mx-auto space-y-8 relative">
                        <div className="flex items-center justify-between">
                            <button 
                                onClick={() => setShowQuitModal(true)}
                                className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                            >
                                <ChevronLeft size={20} /> Quit
                            </button>
                            <div className="flex items-center gap-2 sm:gap-4">
                                <div className="hidden sm:block px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    Stage {selectedStage}
                                </div>
                                <div className="flex items-center gap-2 sm:gap-6">
                                    <div className="flex items-center gap-1.5 sm:gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-indigo-600 font-black text-[10px] sm:text-base">
                                        <CheckCircle size={14} className="sm:w-5 sm:h-5" /> {score}/{WORDS_PER_STAGE}
                                    </div>
                                    <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-slate-600 dark:text-slate-300 font-black text-[10px] sm:text-base">
                                       {questionsAnswered + 1 > WORDS_PER_STAGE ? WORDS_PER_STAGE : questionsAnswered + 1}/{WORDS_PER_STAGE}
                                    </div>
                                    <div className="flex items-center gap-1.5 sm:gap-2 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-orange-600 font-black text-[10px] sm:text-base">
                                        <Timer size={14} className={clsx("sm:w-5 sm:h-5", timeLeft <= 5 ? "animate-pulse text-rose-500" : "")} /> {timeLeft}s
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(questionsAnswered / WORDS_PER_STAGE) * 100}%` }}
                                className="h-full bg-primary"
                            />
                        </div>

                        <div className="glass-card rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 md:p-16 border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
                            <AnimatePresence>
                                {feedback === 'correct' && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.5 }}
                                        className="absolute inset-0 z-50 flex items-center justify-center bg-emerald-500/10 backdrop-blur-[2px]"
                                    >
                                        <div className="bg-emerald-500 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-lg">
                                            <Trophy size={40} />
                                        </div>
                                    </motion.div>
                                )}
                                {feedback === 'wrong' && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.5 }}
                                        className="absolute inset-0 z-50 flex items-center justify-center bg-rose-500/10 backdrop-blur-[2px]"
                                    >
                                        <div className="bg-rose-500 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-lg">
                                            <CloseIcon size={40} />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="text-center space-y-4 mb-12">
                                <span className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-[0.2em] sm:tracking-[0.3em] font-bold">What is the meaning of</span>
                                <h1 className="text-3xl sm:text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{currentQuestion?.word}</h1>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-4">
                                {currentQuestion?.options.map((option, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswer(option)}
                                        disabled={!!feedback}
                                        className={clsx(
                                            "p-3 sm:p-6 rounded-xl sm:rounded-[2rem] text-left text-[10px] sm:text-sm font-semibold transition-all duration-300 border-2 active:scale-[0.98]",
                                            !feedback && "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-primary hover:bg-white dark:hover:bg-slate-800",
                                            feedback === 'correct' && option === currentQuestion.definition && "bg-emerald-500 text-white border-emerald-500",
                                            feedback === 'wrong' && option === currentQuestion.definition && "bg-emerald-500 text-white border-emerald-500",
                                            feedback === 'wrong' && option !== currentQuestion.definition && "bg-rose-500/10 text-rose-500 border-rose-500/20 opacity-50"
                                        )}
                                    >
                                        <span className="block text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-50 mb-1 sm:mb-2">Option {i + 1}</span>
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="relative">
            {renderContent()}

            {createPortal(
                <AnimatePresence>
                    {showQuitModal && (
                        <motion.div 
                            key="quit-modal-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
                        >
                            <motion.div 
                                key="quit-modal-content"
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 max-w-md w-full text-center shadow-2xl border border-slate-100 dark:border-slate-800"
                            >
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-100 dark:bg-rose-900/30 rounded-2xl sm:rounded-[2rem] flex items-center justify-center text-rose-500 mx-auto mb-4 sm:mb-6">
                                    <AlertTriangleIcon size={32} className="sm:w-10 sm:h-10" />
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mb-2">Abandon Match?</h3>
                                <p className="text-slate-500 font-bold mb-6 sm:mb-8 text-sm sm:text-base">Progress in this stage will be lost. Are you sure you want to quit?</p>
                                <div className="flex flex-col gap-3">
                                    <button 
                                        onClick={() => {
                                            setShowQuitModal(false);
                                            setScreen('stages');
                                        }}
                                        className="px-8 py-3 sm:py-4 bg-rose-500 text-white rounded-full font-black shadow-lg hover:scale-105 transition-all text-sm sm:text-base"
                                    >
                                        Yes, Quit Game
                                    </button>
                                    <button 
                                        onClick={() => setShowQuitModal(false)}
                                        className="px-8 py-3 sm:py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full font-black hover:scale-105 transition-all text-sm sm:text-base"
                                    >
                                        Stay Focused
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

// Internal components/icons to avoid duplicate naming or missing imports
const CloseIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const ArrowRightIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
);

const AlertTriangleIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);
