import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSubjectStore } from '../../store/useSubjectStore';
import type { Subject, Topic } from '../../types';
import { X, Plus, Trash2, CheckCircle2, Circle, ChevronDown, BookOpen } from 'lucide-react';

interface TopicManagerProps {
    subject: Subject;
    onClose: () => void;
}

const ChapterItem = ({ chapter, topics, onToggleTopic, onDeleteTopic }: { 
    chapter: Subject, 
    topics: Topic[], 
    onToggleTopic: (topicId: number) => void,
    onDeleteTopic: (topicId: number) => void
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Calculate progress
    const completed = topics.filter(t => t.isCompleted).length;
    const total = topics.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-800/50 transition-all duration-300 hover:shadow-md">
            {/* Chapter Header */}
                <div 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <BookOpen className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-0.5 sm:mb-1 truncate">{chapter.name}</h3>
                        <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-medium text-gray-500">
                            <div className="flex-1 h-1 sm:h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full min-w-[60px] max-w-[100px] overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="shrink-0">{completed}/{total} Done</span>
                        </div>
                    </div>

                    <div className={`text-gray-400 transition-transform duration-300 shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                    </div>
                </div>

            {/* Topics Body */}
            {isExpanded && (
                <div className="border-t border-gray-100 dark:border-slate-700 p-2 bg-gray-50/50 dark:bg-slate-800/30">
                    {topics.length === 0 ? (
                        <div className="text-center py-4 text-xs text-gray-400 italic">No topics in this chapter.</div>
                    ) : (
                        topics.map(topic => (
                            <div 
                                key={topic.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if(topic.id) onToggleTopic(topic.id);
                                }}
                                className={`
                                    flex items-center gap-3 p-3 rounded-xl transition-all border border-transparent cursor-pointer
                                    ${topic.isCompleted 
                                        ? 'bg-green-50/50 dark:bg-green-900/10 text-green-700' 
                                        : 'hover:bg-white dark:hover:bg-slate-700 hover:border-gray-200 dark:hover:border-slate-600'
                                    }
                                `}
                            >
                                <div className={topic.isCompleted ? 'text-green-500' : 'text-gray-300'}>
                                    {topic.isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                </div>
                                <span className={`text-sm flex-1 ${topic.isCompleted ? 'line-through opacity-70' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {topic.name}
                                </span>
                                {(topic.masteryLevel === 0 && !topic.isCompleted) && ( // Allow delete if user added manually (heuristic)
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); if(topic.id) onDeleteTopic(topic.id); }}
                                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                                   >
                                       <Trash2 size={14} />
                                   </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export const TopicManager: React.FC<TopicManagerProps> = ({ subject, onClose }) => {
    const { subjects, topics, addTopic, toggleTopicStatus, deleteTopic, loadTopics } = useSubjectStore();
    const [newTopic, setNewTopic] = useState('');
    const [animatingTopic, setAnimatingTopic] = useState<number | null>(null);
    const [childSubjects, setChildSubjects] = useState<Subject[]>([]);
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true);
            if (subject.id) {
                await loadTopics(subject.id);
                
                // Load children (Chapters)
                const children = subjects.filter(s => s.parentId === subject.id);
                // Sort by ID or creation to maintain order
                const sortedChildren = children.sort((a,b) => (a.id || 0) - (b.id || 0));
                
                // Wait for ALL child topics to load
                await Promise.all(
                    sortedChildren.map(child => child.id ? loadTopics(child.id) : Promise.resolve())
                );
                
                setChildSubjects(sortedChildren);
            }
            setLoading(false);
        };
        
        setMounted(true);
        loadAllData();
    }, [subject.id, subjects, loadTopics]); // Add subjects to dependency to re-filter if loaded

    // If we have child subjects (Chapters), we are in "Syllabus Mode"
    const isSyllabusMode = childSubjects.length > 0;

    const currentSubjectTopics = topics.filter(t => t.subjectId === subject.id);
    
    // Overall Stats Logic calculation
    // If syllabus mode, we need to aggregate checks from children
    const calculateOverallStats = () => {
        let allTopics: Topic[] = [];
        if (isSyllabusMode) {
            childSubjects.forEach(child => {
                 allTopics = [...allTopics, ...topics.filter(t => t.subjectId === child.id)];
            });
        } else {
            allTopics = currentSubjectTopics;
        }
        
        const completed = allTopics.filter(t => t.isCompleted).length;
        const total = allTopics.length;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
        return { completed, total, percentage };
    };

    const { completed, total, percentage } = calculateOverallStats();

    const handleAddTopic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newTopic.trim() && subject.id) {
            await addTopic({
                subjectId: subject.id,
                name: newTopic,
                isCompleted: false,
                status: 'not-started',
                learningProgress: 0,
                revisionCount: 0,
                masteryLevel: 0
            });
            setNewTopic('');
        }
    };

    const handleToggleTopic = async (topicId: number, subjectIdOverride?: number) => {
        const targetSubjectId = subjectIdOverride || subject.id;
        if (!targetSubjectId) return;
        
        // Find topic to animate
        // ... (animation logic reused locally)
        setAnimatingTopic(topicId);
        setTimeout(() => setAnimatingTopic(null), 600);
        
        await toggleTopicStatus(targetSubjectId, topicId);
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white dark:bg-slate-800 w-full max-w-3xl max-h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-scale-in border border-white/10"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div 
                    className="p-4 sm:p-6 shrink-0"
                    style={{ backgroundColor: `${subject.color}10` }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            <div 
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-xl sm:text-2xl shadow-sm"
                                style={{ backgroundColor: subject.color, color: 'white' }}
                            >
                                {subject.icon}
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 truncate">
                                    {subject.name}
                                    {isSyllabusMode && <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] sm:text-xs font-bold uppercase shrink-0">Syllabus</span>}
                                </h2>
                                <p className="text-[10px] sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                    {completed} / {total} Topics Completed ({percentage}%)
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-1 sm:p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors shrink-0"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-700">
                    <div 
                        className="h-full transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%`, backgroundColor: subject.color }}
                    />
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-white dark:bg-slate-800">
                    
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                                <p className="mt-4 text-gray-500 dark:text-gray-400">Loading topics...</p>
                            </div>
                        </div>
                    ) : isSyllabusMode ? (
                        <div className="space-y-4">
                            {/* Render Chapters w/ Accordions */}
                            {childSubjects.map(chapter => (
                                <ChapterItem 
                                    key={chapter.id}
                                    chapter={chapter}
                                    topics={topics.filter(t => t.subjectId === chapter.id)}
                                    onToggleTopic={(tid) => handleToggleTopic(tid, chapter.id)}
                                    onDeleteTopic={deleteTopic}
                                />
                            ))}
                            
                            {childSubjects.length === 0 && (
                                <div className="text-center py-10 opacity-50">Empty Syllabus</div>
                            )}

                            {/* Render any standalone topics for the main subject if any exist */}
                            {currentSubjectTopics.length > 0 && (
                                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-700">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">General Topics</h4>
                                    {currentSubjectTopics.map(topic => (
                                        <div 
                                            key={topic.id} 
                                            className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"
                                            onClick={() => topic.id && handleToggleTopic(topic.id)}
                                        >
                                            {topic.isCompleted ? <CheckCircle2 size={16} className="text-green-500"/> : <Circle size={16} className="text-gray-400"/>}
                                            <span className={topic.isCompleted ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-200'}>{topic.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Standard Flat View */
                        <div className="space-y-2">
                             {currentSubjectTopics.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    <p>No topics yet. Add one to get started!</p>
                                </div>
                            ) : (
                                currentSubjectTopics.map((topic: Topic) => (
                                    <div 
                                        key={topic.id}
                                        onClick={() => topic.id && handleToggleTopic(topic.id)}
                                        className={`
                                            group relative flex items-center gap-3 p-3 rounded-xl transition-all border cursor-pointer select-none
                                            ${topic.isCompleted 
                                                ? 'bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20' 
                                                : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600 hover:bg-gray-50/50 dark:hover:bg-slate-700/50'
                                            }
                                            ${animatingTopic === topic.id ? 'scale-105' : ''}
                                        `}
                                    >
                                        {/* Checkmark Animation */}
                                        {animatingTopic === topic.id && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-green-500/10 backdrop-blur-sm z-10 rounded-xl animate-fade-in">
                                                <CheckCircle2 size={48} className="text-green-500 animate-bounce" />
                                            </div>
                                        )}

                                        <div
                                            className={`
                                                shrink-0 transition-colors relative z-0
                                                ${topic.isCompleted ? 'text-green-500' : 'text-gray-300 group-hover:text-gray-400'}
                                            `}
                                        >
                                            {topic.isCompleted ? <CheckCircle2 size={22} className="fill-green-100" /> : <Circle size={22} />}
                                        </div>
                                        
                                        <span className={`flex-1 font-medium ${topic.isCompleted ? 'text-gray-500 line-through decoration-2 decoration-green-500/30' : 'text-gray-700 dark:text-gray-200'}`}>
                                            {topic.name}
                                        </span>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (topic.id) deleteTopic(topic.id);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                            title="Delete topic"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Add Topic Input - Only show in Flat Mode or General */}
                {!isSyllabusMode && (
                    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-700 shrink-0">
                        <form onSubmit={handleAddTopic} className="flex gap-2 sm:gap-3">
                            <input
                                type="text"
                                value={newTopic}
                                onChange={(e) => setNewTopic(e.target.value)}
                                placeholder="Add a new topic..."
                                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm sm:text-base text-gray-900 dark:text-white min-w-0"
                            />
                            <button
                                type="submit"
                                disabled={!newTopic.trim()}
                                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center gap-1.5 sm:gap-2 shrink-0"
                            >
                                <Plus className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                                <span className="text-sm sm:text-base">Add</span>
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};