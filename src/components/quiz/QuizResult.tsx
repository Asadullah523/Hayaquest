import React from 'react';
import { CheckCircle, XCircle, RotateCcw, X, Target } from 'lucide-react';
import type { PastPaper } from '../../data/pastPapers';

interface QuizResultProps {
    paper: PastPaper;
    answers: Record<number, number>;
    onClose: () => void;
    onRetry: () => void;
}

export const QuizResult: React.FC<QuizResultProps> = ({ paper, answers, onClose, onRetry }) => {
    let correctCount = 0;
    
    paper.questions.forEach(q => {
        if (answers[q.id] === q.correctAnswer) {
            correctCount++;
        }
    });

    const totalQuestions = paper.questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 w-full max-w-4xl h-full sm:h-[90vh] rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between shrink-0">
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">Quiz Results</h2>
                    <button 
                        onClick={onClose}
                        className="p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500 sm:w-6 sm:h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                    {/* Score Summary */}
                    <div className="flex flex-col items-center mb-8 sm:mb-12">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 relative flex items-center justify-center mb-4 sm:mb-6">
                             <svg className="w-full h-full transform -rotate-90">
                                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-100 dark:text-slate-700 sm:cx-80 sm:cy-80 sm:r-70 sm:stroke-12" />
                                <circle 
                                    cx="64" cy="64" r="56" 
                                    stroke={percentage >= 50 ? '#10B981' : '#EF4444'} 
                                    strokeWidth="10" 
                                    fill="transparent" 
                                    strokeDasharray={351.8} 
                                    strokeDashoffset={351.8 - (351.8 * percentage) / 100} 
                                    className="transition-all duration-1000 ease-out sm:cx-80 sm:cy-80 sm:r-70 sm:stroke-12"
                                    strokeLinecap="round"
                                />
                                {/* Desktop Version overrides */}
                                <style dangerouslySetInnerHTML={{ __html: `
                                    @media (min-width: 640px) {
                                        circle { cx: 80 !important; cy: 80 !important; r: 70 !important; stroke-width: 12 !important; }
                                    }
                                `}} />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">{percentage}%</span>
                                <span className="text-xs sm:text-sm font-medium text-gray-500">Score</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 w-full max-w-3xl">
                            <div className="p-3 sm:p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 text-center text-green-700 dark:text-green-300">
                                <CheckCircle className="w-5 h-5 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 opacity-80" />
                                <div className="text-xl sm:text-2xl font-bold">{correctCount}</div>
                                <div className="text-xs sm:text-sm opacity-80 font-bold uppercase tracking-tight">Correct</div>
                            </div>
                            <div className="p-3 sm:p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-center text-red-700 dark:text-red-300">
                                <XCircle className="w-5 h-5 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 opacity-80" />
                                <div className="text-xl sm:text-2xl font-bold">{Object.keys(answers).length - correctCount}</div>
                                <div className="text-xs sm:text-sm opacity-80 font-bold uppercase tracking-tight">Incorrect</div>
                            </div>
                            <div className="p-3 sm:p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-center text-blue-700 dark:text-blue-300">
                                <Target className="w-5 h-5 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 opacity-80" />
                                <div className="text-xl sm:text-2xl font-bold">{totalQuestions}</div>
                                <div className="text-xs sm:text-sm opacity-80 font-bold uppercase tracking-tight">Total Qs</div>
                            </div>
                            <div className="p-3 sm:p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-center text-purple-700 dark:text-purple-300">
                                <Target className="w-5 h-5 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 opacity-80" />
                                <div className="text-xl sm:text-2xl font-bold">
                                    {Object.keys(answers).length > 0 
                                        ? Math.round((correctCount / Object.keys(answers).length) * 100) 
                                        : 0}%
                                </div>
                                <div className="text-xs sm:text-sm opacity-80 font-bold uppercase tracking-tight">Accuracy</div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Analysis */}
                    <div className="space-y-6 max-w-3xl mx-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Detailed Analysis</h3>
                            {/* Option to toggle view */}
                        </div>
                        
                        {paper.questions
                            // Filter: Show ONLY attempted questions to avoid clutter
                            .filter(q => answers[q.id] !== undefined)
                            .map((q) => {
                            const userAnswer = answers[q.id];
                            const isCorrect = userAnswer === q.correctAnswer;
                            
                            // Find the original index since we filtered
                            const originalIndex = paper.questions.findIndex(pq => pq.id === q.id);

                            return (
                                <div key={q.id} className={`p-4 sm:p-6 rounded-2xl border ${isCorrect ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'} `}>
                                    <div className="flex gap-3 sm:gap-4">
                                        <div className={`mt-1 shrink-0`}>
                                            {isCorrect ? <CheckCircle className="text-green-500 w-5 h-5 sm:w-6 sm:h-6" /> : <XCircle className="text-red-500 w-5 h-5 sm:w-6 sm:h-6" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-3">
                                                {originalIndex + 1}. {q.text}
                                            </p>
                                            <div className="space-y-2 mb-4">
                                                {q.options.map((opt, idx) => (
                                                    <div 
                                                        key={idx}
                                                        className={`
                                                            p-2 sm:p-3 rounded-xl text-xs sm:text-sm flex items-center justify-between gap-3
                                                            ${idx === q.correctAnswer ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 font-bold' : ''}
                                                            ${idx === userAnswer && idx !== q.correctAnswer ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 font-bold' : ''}
                                                            ${idx !== q.correctAnswer && idx !== userAnswer ? 'bg-white dark:bg-slate-800 text-gray-500 border border-gray-100 dark:border-slate-700' : ''}
                                                        `}
                                                    >
                                                        <span className="truncate flex-1">{opt}</span>
                                                        {idx === q.correctAnswer && <CheckCircle size={14} className="shrink-0" />}
                                                        {idx === userAnswer && idx !== q.correctAnswer && <XCircle size={14} className="shrink-0" />}
                                                    </div>
                                                ))}
                                            </div>
                                            {q.explanation && (
                                                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs sm:text-sm text-blue-700 dark:text-blue-200 border border-blue-100 dark:border-blue-900/30">
                                                    <span className="font-bold">Explanation:</span> {q.explanation}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {Object.keys(answers).length === 0 && (
                            <div className="text-center p-10 text-gray-500">
                                No questions attempted.
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex justify-end gap-2 sm:gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={onRetry}
                        className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <RotateCcw size={18} /> Retry <span className="hidden sm:inline">Paper</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
