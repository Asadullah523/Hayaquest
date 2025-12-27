import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, CheckCircle, ArrowRight } from 'lucide-react';
import type { PastPaper } from '../../data/pastPapers';
import { QuizResult } from './QuizResult';

interface QuizViewProps {
    paper: PastPaper;
    onClose: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ paper, onClose }) => {
    // Lazy initialization to prevent overwriting saved progress
    const getSavedProgress = () => {
        try {
            const saved = localStorage.getItem(`quiz_progress_${paper.id}`);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    };

    const savedState = getSavedProgress();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(savedState?.index || 0);
    const [answers, setAnswers] = useState<Record<number, number>>(savedState?.savedAnswers || {}); 
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [timeLeft, setTimeLeft] = useState(savedState?.savedTime || paper.durationMinutes * 60);

    const questions = paper.questions;
    const currentQuestion = questions[currentQuestionIndex];

    // Save progress on change
    useEffect(() => {
        if (!isSubmitted) {
            localStorage.setItem(`quiz_progress_${paper.id}`, JSON.stringify({
                index: currentQuestionIndex,
                savedAnswers: answers,
                savedTime: timeLeft,
                timestamp: Date.now()
            }));
            // Notify dashboard to update "Resume" button
            window.dispatchEvent(new Event('storage'));
        }
    }, [currentQuestionIndex, answers, timeLeft, isSubmitted, paper.id]);

    useEffect(() => {
        if (!isSubmitted && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev: number) => {
                    if (prev <= 1) {
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isSubmitted, timeLeft]);

    const handleAnswer = (optionIndex: number) => {
        if (isSubmitted) return;
        setAnswers((prev: Record<number, number>) => ({
            ...prev,
            [currentQuestion.id]: optionIndex
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev: number) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev: number) => prev - 1);
        }
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
        setShowResult(true);
        // Clear progress on submit
        localStorage.removeItem(`quiz_progress_${paper.id}`);
        
        // Only mark as completed if ALL questions have been answered
        const totalQuestions = questions.length;
        const answeredQuestions = Object.keys(answers).length;
        
        if (answeredQuestions === totalQuestions) {
            localStorage.setItem(`quiz_completed_${paper.id}`, 'true');
        }
        
        // Dispatch storage event to update dashboard immediately if possible
        window.dispatchEvent(new Event('storage'));
    };
    
    // Explicit Pause Handler
    const handlePause = () => {
        // Force save just in case
        localStorage.setItem(`quiz_progress_${paper.id}`, JSON.stringify({
            index: currentQuestionIndex,
            savedAnswers: answers,
            savedTime: timeLeft,
            timestamp: Date.now()
        }));
        window.dispatchEvent(new Event('storage'));
        onClose();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };



    useEffect(() => {
        document.body.classList.add('quiz-active');
        return () => {
            document.body.classList.remove('quiz-active');
        };
    }, []);

    const quizContent = showResult ? (
        <QuizResult 
            paper={paper} 
            answers={answers} 
            onClose={onClose} 
            onRetry={() => {
                setIsSubmitted(false);
                setShowResult(false);
                setAnswers({});
                setCurrentQuestionIndex(0);
                setTimeLeft(paper.durationMinutes * 60);
                localStorage.removeItem(`quiz_progress_${paper.id}`);
            }} 
        />
    ) : (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 w-full max-w-4xl h-[100dvh] sm:h-[90vh] rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-3 sm:p-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between shrink-0">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-sm sm:text-xl font-bold text-gray-900 dark:text-white truncate">{paper.title}</h2>
                        <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">
                            Q{currentQuestionIndex + 1}/{questions.length}
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-4 ml-1">
                        <div className="text-base sm:text-xl font-mono font-bold text-primary bg-primary/10 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-lg">
                            {formatTime(timeLeft)}
                        </div>
                        <button
                            onClick={handleSubmit}
                            className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm"
                        >
                            <CheckCircle size={12} className="sm:w-4 sm:h-4" /> Finish
                        </button>
                        <div className="w-px h-6 sm:h-8 bg-gray-200 dark:bg-slate-700 mx-1" />
                        <button 
                            onClick={handlePause}
                            className="p-1.5 sm:px-4 sm:py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 text-sm"
                            title="Pause & Exit"
                        >
                            <span className="hidden sm:inline">Pause & Exit</span>
                            <X size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-gray-100 dark:bg-slate-700">
                    <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                </div>

                {/* Question Area */}
                <motion.div 
                    className="flex-1 overflow-y-auto p-3.5 sm:p-8"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_: any, info: any) => {
                        const swipeThreshold = 50;
                        if (info.offset.x > swipeThreshold) {
                            handlePrevious();
                        } else if (info.offset.x < -swipeThreshold) {
                            handleNext();
                        }
                    }}
                >
                    <div className="max-w-3xl mx-auto">
                        <h3 className="text-base sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-8 leading-relaxed">
                            {currentQuestion.text}
                        </h3>

                        <div className="space-y-4">
                            {currentQuestion.options.map((option, index) => {
                                const isSelected = answers[currentQuestion.id] === index;
                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswer(index)}
                                        className={`
                                            w-full p-3 sm:p-6 text-left rounded-xl sm:rounded-2xl border-2 transition-all flex items-center gap-3 sm:gap-4 group
                                            ${isSelected 
                                                ? 'border-primary bg-primary/5' 
                                                : 'border-gray-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50'
                                            }
                                        `}
                                    >
                                        <div className={`
                                            w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center font-bold text-[10px] sm:text-sm shrink-0 transition-colors
                                            ${isSelected 
                                                ? 'bg-primary border-primary text-white' 
                                                : 'border-gray-300 dark:border-slate-600 text-gray-500 group-hover:border-primary/50'
                                            }
                                        `}>
                                            {String.fromCharCode(65 + index)}
                                        </div>
                                        <span className={`text-[13px] sm:text-lg ${isSelected ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-200'}`}>
                                            {option}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* Footer Navigation */}
                <div className="p-3 sm:p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center shrink-0 mb-[env(safe-area-inset-bottom)]">
                    <button
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0}
                        className="px-3.5 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Previous
                    </button>

                    <div className="flex gap-2">
                        {currentQuestionIndex === questions.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                className="px-5 sm:px-8 py-2 sm:py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all flex items-center gap-2 text-xs sm:text-sm"
                            >
                                Submit <span className="hidden sm:inline">Paper</span> <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="px-5 sm:px-8 py-2 sm:py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2 text-xs sm:text-sm"
                            >
                                Next <span className="hidden sm:inline">Question</span> <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(quizContent, document.body);
};
