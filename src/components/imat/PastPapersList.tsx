import React, { useState } from 'react';
import { Clock, FileText, CheckCircle2, Trophy, ArrowRight } from 'lucide-react';
import { type PastPaper } from '../../data/pastPapers';
import { QuizView } from '../quiz/QuizView';

interface PastPapersListProps {
    papers: PastPaper[];
    onSelectPaper?: (paper: PastPaper) => void;
}

export const PastPapersList: React.FC<PastPapersListProps> = ({ papers, onSelectPaper }) => {
    const [selectedPaper, setSelectedPaper] = useState<PastPaper | null>(null);

    const handlePaperClick = (paper: PastPaper) => {
        if (onSelectPaper) {
            onSelectPaper(paper);
        } else {
            setSelectedPaper(paper);
        }
    };

    return (
        <div className="space-y-4 animate-fade-in pb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {papers.map((paper) => {
                    // Check if completed
                    const isCompleted = localStorage.getItem(`quiz_completed_${paper.id}`);
                    
                    return (
                        <div 
                            key={paper.id}
                            onClick={() => handlePaperClick(paper)}
                            className="group relative glass-card p-6 rounded-3xl cursor-pointer hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-white/50 dark:border-white/10"
                        >
                            {/* Background Decoration */}
                            <div 
                                className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-5 blur-2xl transition-all group-hover:opacity-10 group-hover:scale-110 bg-primary"
                            />

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div 
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-300 bg-primary/10 text-primary"
                                    >
                                        <FileText size={28} />
                                    </div>
                                    
                                    {isCompleted && (
                                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600 dark:text-green-400 animate-fade-in">
                                            <CheckCircle2 size={20} className="fill-current" />
                                        </div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-md mb-2 inline-block">
                                        {paper.year}
                                    </span>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{paper.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{paper.description}</p>
                                </div>
                                
                                {/* Stats */}
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={16} className="text-primary" />
                                        <span>{paper.durationMinutes}m</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 border-l border-gray-100 dark:border-gray-800/50 pl-4">
                                        <FileText size={16} className="text-primary" />
                                        <span>{paper.questions.length} Qs</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 border-l border-gray-100 dark:border-gray-800/50 pl-4">
                                        <Trophy size={16} className="text-primary" />
                                        <span>{paper.totalMarks} Marks</span>
                                    </div>
                                </div>

                                {/* Hover Action */}
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <span className="text-sm font-bold text-gray-400 group-hover:text-primary transition-colors flex items-center gap-2">
                                        Start Session <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </span>
                                    {isCompleted && <span className="text-xs font-bold text-green-500">COMPLETED</span>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Render Quiz View Modal only if not managed externally */}
            {!onSelectPaper && selectedPaper && (
                <QuizView 
                    paper={selectedPaper} 
                    onClose={() => setSelectedPaper(null)} 
                />
            )}
        </div>
    );
};
