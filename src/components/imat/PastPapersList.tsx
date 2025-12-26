import React, { useState, useMemo } from 'react';
import { Clock, FileText, CheckCircle2, Trophy, ArrowRight, Folder, ChevronLeft, LayoutGrid } from 'lucide-react';
import { type PastPaper } from '../../data/pastPapers';
import { QuizView } from '../quiz/QuizView';

interface PastPapersListProps {
    papers: PastPaper[];
    onSelectPaper?: (paper: PastPaper) => void;
    initialViewState?: ViewState;
    onViewStateChange?: (view: ViewState) => void;
}

export type ViewState = {
    type: 'main' | 'official' | 'practice-subjects' | 'subject';
    subject?: string;
};

export const PastPapersList: React.FC<PastPapersListProps> = ({ papers, onSelectPaper, initialViewState, onViewStateChange }) => {
    const [selectedPaper, setSelectedPaper] = useState<PastPaper | null>(null);
    const [view, setViewInternal] = useState<ViewState>(() => {
        if (initialViewState) return initialViewState;
        
        const hasOfficial = papers.some(p => p.category === 'Official');
        const hasPractice = papers.some(p => p.category === 'Practice');
        
        if (hasOfficial && !hasPractice) return { type: 'official' };
        if (!hasOfficial && hasPractice) return { type: 'practice-subjects' };
        return { type: 'main' };
    });

    const setView = (newView: ViewState) => {
        setViewInternal(newView);
        if (onViewStateChange) onViewStateChange(newView);
    };

    const handlePaperClick = (paper: PastPaper) => {
        if (onSelectPaper) {
            onSelectPaper(paper);
        } else {
            setSelectedPaper(paper);
        }
    };

    const categories = useMemo(() => {
        const official = papers.filter(p => p.category === 'Official');
        const practice = papers.filter(p => p.category === 'Practice');
        
        // Group practice by subject
        const practiceBySubject: Record<string, PastPaper[]> = {};
        practice.forEach(p => {
            const s = p.subject || 'General';
            if (!practiceBySubject[s]) practiceBySubject[s] = [];
            practiceBySubject[s].push(p);
        });

        return { official, practice, practiceBySubject };
    }, [papers]);

    const renderFolder = (title: string, count: number, icon: React.ReactNode, onClick: () => void, description?: string) => (
        <div 
            onClick={onClick}
            className="group relative glass-card p-6 rounded-3xl cursor-pointer hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-white/50 dark:border-white/10"
        >
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-5 blur-2xl transition-all group-hover:opacity-10 group-hover:scale-110 bg-primary" />
            <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-300 bg-primary/10 text-primary mb-6">
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description || `${count} Items`}</p>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-sm font-bold text-gray-400 group-hover:text-primary transition-colors flex items-center gap-2">
                        Open Folder <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                </div>
            </div>
        </div>
    );

    const renderPaperCard = (paper: PastPaper) => {
        const isCompleted = localStorage.getItem(`quiz_completed_${paper.id}`);
        return (
            <div 
                key={paper.id}
                onClick={() => handlePaperClick(paper)}
                className="group relative glass-card p-6 rounded-3xl cursor-pointer hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-white/50 dark:border-white/10"
            >
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-5 blur-2xl transition-all group-hover:opacity-10 group-hover:scale-110 bg-primary" />
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-300 bg-primary/10 text-primary">
                            <FileText size={28} />
                        </div>
                        {isCompleted && (
                            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600 dark:text-green-400">
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
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-sm font-bold text-gray-400 group-hover:text-primary transition-colors flex items-center gap-2">
                            Start Session <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                        {isCompleted && <span className="text-xs font-bold text-green-500">COMPLETED</span>}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Breadcrumbs / Back Button */}
            {view.type !== 'main' && papers.some(p => p.category === 'Official') && papers.some(p => p.category === 'Practice') && (
                <button 
                    onClick={() => {
                        if (view.type === 'subject') setView({ type: 'practice-subjects' });
                        else setView({ type: 'main' });
                    }}
                    className="flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80 transition-opacity mb-4"
                >
                    <ChevronLeft size={20} /> Back to {view.type === 'subject' ? 'Practice Categories' : 'Main Menu'}
                </button>
            )}

            {/* Folder Heading */}
            {view.type !== 'main' && (
                <div className="flex items-center gap-3 mb-2 px-1 animate-slide-in">
                    <div className="w-1 h-8 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight capitalize">
                            {view.type === 'official' ? 'Official Past Papers' : 
                             view.type === 'practice-subjects' ? 'Subject-wise Practice' : 
                             view.subject}
                        </h2>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                            {view.type === 'subject' ? 'Practice Sets' : 'Categories'}
                        </p>
                    </div>
                </div>
            )}

            {/* Simpler Back Button if only one major category exists but we are in a sub-view (like a specific subject) */}
            {view.type === 'subject' && !(papers.some(p => p.category === 'Official') && papers.some(p => p.category === 'Practice')) && (
                 <button 
                    onClick={() => setView({ type: 'practice-subjects' })}
                    className="flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80 transition-opacity mb-4"
                >
                    <ChevronLeft size={20} /> Back to Practice Categories
                </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {view.type === 'main' && (
                    <>
                        {renderFolder("Official Past Papers", categories.official.length, <LayoutGrid size={28} />, () => setView({ type: 'official' }), "Official yearly IMAT and MDCAT exams")}
                        {renderFolder("Subject-wise Practice", Object.keys(categories.practiceBySubject).length, <Folder size={28} />, () => setView({ type: 'practice-subjects' }), "Practice sets categorized by subject")}
                    </>
                )}

                {view.type === 'official' && categories.official.map(renderPaperCard)}

                {view.type === 'practice-subjects' && Object.entries(categories.practiceBySubject).map(([sub, p]) => 
                    renderFolder(sub, p.length, <Folder size={28} />, () => setView({ type: 'subject', subject: sub }), `${p.length} Practice sets for ${sub}`)
                )}

                {view.type === 'subject' && categories.practiceBySubject[view.subject!]?.map(renderPaperCard)}
            </div>
            
            {!onSelectPaper && selectedPaper && (
                <QuizView 
                    paper={selectedPaper} 
                    onClose={() => setSelectedPaper(null)} 
                />
            )}
        </div>
    );
};
