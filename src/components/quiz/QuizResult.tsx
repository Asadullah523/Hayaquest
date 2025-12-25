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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between shrink-0">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quiz Results</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {/* Score Summary */}
                    <div className="flex flex-col items-center mb-12">
                        <div className="w-40 h-40 relative flex items-center justify-center mb-6">
                             <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100 dark:text-slate-700" />
                                <circle 
                                    cx="80" cy="80" r="70" 
                                    stroke={percentage >= 50 ? '#10B981' : '#EF4444'} 
                                    strokeWidth="12" 
                                    fill="transparent" 
                                    strokeDasharray={439.8} 
                                    strokeDashoffset={439.8 - (439.8 * percentage) / 100} 
                                    className="transition-all duration-1000 ease-out"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{percentage}%</span>
                                <span className="text-sm font-medium text-gray-500">Score</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-3xl">
                            <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 text-center text-green-700 dark:text-green-300">
                                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-80" />
                                <div className="text-2xl font-bold">{correctCount}</div>
                                <div className="text-sm opacity-80">Correct</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-center text-red-700 dark:text-red-300">
                                <XCircle className="w-8 h-8 mx-auto mb-2 opacity-80" />
                                <div className="text-2xl font-bold">{Object.keys(answers).length - correctCount}</div>
                                <div className="text-sm opacity-80">Incorrect</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-center text-blue-700 dark:text-blue-300">
                                <Target className="w-8 h-8 mx-auto mb-2 opacity-80" />
                                <div className="text-2xl font-bold">{totalQuestions}</div>
                                <div className="text-sm opacity-80">Total Qs</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-center text-purple-700 dark:text-purple-300">
                                <Target className="w-8 h-8 mx-auto mb-2 opacity-80" />
                                <div className="text-2xl font-bold">
                                    {Object.keys(answers).length > 0 
                                        ? Math.round((correctCount / Object.keys(answers).length) * 100) 
                                        : 0}%
                                </div>
                                <div className="text-sm opacity-80">Accuracy</div>
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
                                <div key={q.id} className={`p-6 rounded-2xl border ${isCorrect ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'} `}>
                                    <div className="flex gap-4">
                                        <div className={`mt-1 shrink-0`}>
                                            {isCorrect ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 dark:text-white mb-3">
                                                {originalIndex + 1}. {q.text}
                                            </p>
                                            <div className="space-y-2 mb-4">
                                                {q.options.map((opt, idx) => (
                                                    <div 
                                                        key={idx}
                                                        className={`
                                                            p-3 rounded-xl text-sm flex items-center justify-between
                                                            ${idx === q.correctAnswer ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 font-medium' : ''}
                                                            ${idx === userAnswer && idx !== q.correctAnswer ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' : ''}
                                                            ${idx !== q.correctAnswer && idx !== userAnswer ? 'bg-white dark:bg-slate-800 text-gray-500' : ''}
                                                        `}
                                                    >
                                                        <span>{opt}</span>
                                                        {idx === q.correctAnswer && <CheckCircle size={14} />}
                                                        {idx === userAnswer && idx !== q.correctAnswer && <XCircle size={14} />}
                                                    </div>
                                                ))}
                                            </div>
                                            {q.explanation && (
                                                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm text-blue-700 dark:text-blue-200 border border-blue-100 dark:border-blue-900/30">
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

                <div className="p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={onRetry}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center gap-2"
                    >
                        <RotateCcw size={20} /> Retry Paper
                    </button>
                </div>
            </div>
        </div>
    );
};
