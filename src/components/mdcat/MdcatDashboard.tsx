import React, { useState, useEffect, useMemo } from 'react';
import { useSubjectStore } from '../../store/useSubjectStore';
import { SubjectCard } from '../imat/SubjectCard';
import { TopicManager } from '../imat/TopicManager';
import { GraduationCap, ArrowLeft, TrendingUp, FileText, BookOpen, ChevronRight, Library as LibraryIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { PastPapersModal } from '../imat/PastPapersModal';
import { mdcatPastPapers } from '../../data/pastPapers';
import { type Subject } from '../../types';
import { QuizView } from '../quiz/QuizView';
import { type PastPaper } from '../../data/pastPapers';
import { Library } from '../imat/Library';
import { mdcatResources } from '../../data/mdcatResources';

export const MdcatDashboard: React.FC = () => {
    const { subjects, topics, loadSubjects } = useSubjectStore();
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [showPastPapers, setShowPastPapers] = useState(false);
    const [completedPapers, setCompletedPapers] = useState(0);
    const [selectedPaper, setSelectedPaper] = useState<PastPaper | null>(null);
    const [view, setView] = useState<'dashboard' | 'library'>('dashboard');

    const [resumePaper, setResumePaper] = useState<PastPaper | null>(null);

    const totalPapers = mdcatPastPapers.length;

    useEffect(() => {
        loadSubjects();
    }, [loadSubjects]);

    useEffect(() => {
        // Check localStorage for completed papers and active progress
        const checkProgress = () => {
            let count = 0;
            let foundResume: PastPaper | null = null;
            let foundResumeTimestamp = 0;

            mdcatPastPapers.forEach(paper => {
                if (localStorage.getItem(`quiz_completed_${paper.id}`)) {
                    count++;
                }
                const progress = localStorage.getItem(`quiz_progress_${paper.id}`);
                if (progress) {
                    try {
                        const parsed = JSON.parse(progress);
                        if (!foundResume || (parsed.timestamp && parsed.timestamp > (foundResumeTimestamp || 0))) {
                            foundResume = paper;
                            foundResumeTimestamp = parsed.timestamp || 0;
                        }
                    } catch (e) { }
                }
            });
            setCompletedPapers(count);
            setResumePaper(foundResume);
        };

        checkProgress();
        window.addEventListener('storage', checkProgress);
        return () => window.removeEventListener('storage', checkProgress);
    }, []);

    // Filter Subjects
    const mdcatSubjects = useMemo(() => {
        const parent = subjects.find(s => s.name === 'MDCAT Prep');
        if (parent) {
             return subjects.filter(s => s.parentId === parent.id);
        }
        return [];
    }, [subjects]);

    // Calculate Overall Progress (Topics Completion)
    const overallStats = useMemo(() => {
        const subjectIds = mdcatSubjects.map(s => s.id);
        const relevantTopics = topics.filter(t => t.subjectId && subjectIds.includes(t.subjectId));
        
        const total = relevantTopics.length;
        const completed = relevantTopics.filter(t => t.isCompleted).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { total, completed, percentage };
    }, [mdcatSubjects, topics]);


    if (view === 'library') {
        return (
            <div className="page-transition space-y-6 pb-20">
                <button 
                    onClick={() => setView('dashboard')} 
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary mb-2 transition-colors group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Sections
                </button>
                <Library context="MDCAT" initialResources={mdcatResources} />
            </div>
        );
    }

    return (
        <>
            <div className="page-transition space-y-8 pb-20">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6">
                    <div className="space-y-1">
                        <NavLink 
                            to="/" 
                            className="inline-flex items-center gap-1.5 text-[10px] md:text-sm font-bold text-slate-400 hover:text-primary mb-1 md:mb-2 transition-colors group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform md:w-4 md:h-4" /> Back to Dashboard
                        </NavLink>
                        <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-2 md:gap-3 tracking-tight">
                            <span className="bg-primary/10 p-2 rounded-xl md:rounded-2xl text-primary"><GraduationCap size={24} className="md:w-10 md:h-10" /></span>
                            MDCAT Prep
                        </h1>
                        <p className="text-xs md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl font-medium">
                             Master subjects and track your progress.
                        </p>
                    </div>

                    {/* Overall Progress Widget */}
                    <div className="glass-card px-4 md:px-6 py-3 md:py-4 rounded-2xl md:rounded-[2rem] flex items-center justify-between md:justify-start gap-4 md:gap-5 min-w-0 md:min-w-[280px]">
                        <div className="relative w-12 h-12 md:w-20 md:h-20 flex-shrink-0 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                                <circle 
                                    cx="32" cy="32" r="28" 
                                    stroke="currentColor" strokeWidth="6" 
                                    fill="transparent" 
                                    strokeDasharray={175.93} 
                                    strokeDashoffset={175.93 - (175.93 * overallStats.percentage) / 100} 
                                    className="text-primary transition-all duration-1000 ease-out"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] md:text-base font-black text-slate-900 dark:text-white">{overallStats.percentage}%</span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5 md:mb-1 truncate">Overall Mastery</p>
                            <div className="flex items-center gap-1.5 md:gap-2 text-primary font-bold text-xs md:text-base">
                                <TrendingUp size={14} className="flex-shrink-0 md:w-4 md:h-4" />
                                <span className="truncate">{overallStats.completed} / {overallStats.total} Topics</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resume Paper (Only if active) */}
                {resumePaper && (
                    <div className="animate-slide-in">
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl md:rounded-[2rem] p-4 md:p-6 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden group flex items-center justify-between cursor-pointer"
                             onClick={() => setSelectedPaper(resumePaper)}
                        >
                            <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-white/10 rounded-full blur-2xl md:blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-colors" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-1 md:mb-2">
                                    <span className="inline-flex items-center gap-1.5 px-1.5 md:px-2 py-0.5 bg-white/20 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
                                        <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        In Progress
                                    </span>
                                </div>
                                <h3 className="text-sm md:text-xl font-bold">{resumePaper.title}</h3>
                            </div>
                            <div className="relative z-10 flex items-center gap-1.5 md:gap-2 bg-white text-indigo-600 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl font-bold text-[10px] md:text-sm shadow-lg group-hover:scale-105 transition-transform">
                                Resume <ArrowLeft size={14} className="rotate-180 md:w-4 md:h-4" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Subjects Grid - side-by-side on mobile */}
                <div>
                     <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
                        {mdcatSubjects.map(subject => (
                            <SubjectCard 
                                key={subject.id} 
                                subject={subject} 
                                onClick={() => setSelectedSubject(subject)} 
                            />
                        ))}
                     </div>
                </div>

                {/* Study Resources Section - Dedicated Area at Bottom */}
                <div className="pt-8 border-t border-gray-100 dark:border-white/5">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <LibraryIcon className="text-gray-400" />
                        Study Resources
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* 1. Library Card */}
                        <div 
                            onClick={() => setView('library')}
                            className="group relative glass-card p-6 rounded-3xl cursor-pointer hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col min-h-[220px]"
                        >
                            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-5 blur-2xl transition-all group-hover:opacity-10 group-hover:scale-110 bg-purple-600" />
                            
                            <div className="flex justify-between items-start mb-6 z-10 relative">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                                    <BookOpen size={28} />
                                </div>
                            </div>
                            
                            <div className="z-10 relative">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Study Library</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                                    Textbooks, notes, and curated materials.
                                </p>
                            </div>
                            
                            <div className="mt-auto z-10 relative flex items-center gap-2 text-sm font-bold text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                Browse Collection <ChevronRight size={16} />
                            </div>
                        </div>

                        {/* 2. Past Papers Card */}
                        <div 
                            onClick={() => setShowPastPapers(true)}
                            className="group relative glass-card p-6 rounded-3xl cursor-pointer hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col min-h-[220px]"
                        >
                            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-5 blur-2xl transition-all group-hover:opacity-10 group-hover:scale-110 bg-blue-600" />
                            
                            <div className="flex justify-between items-start mb-6 z-10 relative">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                    <FileText size={28} />
                                </div>
                            </div>
                            
                            <div className="z-10 relative">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Past Papers</h3>
                                <div className="flex items-center gap-2 mb-4">
                                     <div className="h-1.5 flex-1 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full bg-blue-600"
                                            style={{ width: `${totalPapers > 0 ? (completedPapers / totalPapers) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-blue-600">{completedPapers}/{totalPapers}</span>
                                </div>
                            </div>
                            
                            <div className="mt-auto z-10 relative flex items-center gap-2 text-sm font-bold text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                Practice Now <ChevronRight size={16} />
                            </div>
                        </div>
                        
                         {/* 3. Study Tips / Other Material (Optional, can be added later or kept simple) */}
                         <div className="hidden md:block group relative glass-card p-6 rounded-3xl overflow-hidden flex flex-col justify-center items-center text-center opacity-70 hover:opacity-100 transition-opacity">
                            <p className="text-sm font-medium text-gray-400">More resources coming soon...</p>
                         </div>

                    </div>
                </div>

                {/* Modals */}
                {selectedSubject && (
                    <TopicManager 
                        subject={selectedSubject} 
                        onClose={() => setSelectedSubject(null)} 
                    />
                )}

                {showPastPapers && (
                    <PastPapersModal 
                        papers={mdcatPastPapers} 
                        onClose={() => setShowPastPapers(false)}
                        onSelectPaper={(paper) => {
                            setSelectedPaper(paper);
                            setShowPastPapers(false);
                        }}
                        title="MDCAT Past Papers"
                    />
                )}
            </div>

            {/* Quiz View */}
            {selectedPaper && (
                <QuizView 
                    paper={selectedPaper} 
                    onClose={() => setSelectedPaper(null)} 
                />
            )}
        </>
    );
};