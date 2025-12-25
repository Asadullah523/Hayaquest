import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSubjectStore } from '../../store/useSubjectStore';
import { TopicItem } from './TopicItem';
import { RevisionPlanModal } from './RevisionPlanModal';
import { ArrowLeft, Plus, CheckCircle2, Calendar, Trash2, ChevronRight, ChevronDown, BookOpen } from 'lucide-react';
import { db } from '../../db/db';
import type { Subject, Topic } from '../../types';

// Error Boundary for Safety
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("SubjectDetail Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#2d1b10] text-[#fdf5e6] p-8 -m-6">
            <div className="text-6xl mb-6 opacity-50">⚠️</div>
            <h2 className="text-2xl font-bold font-serif mb-4">The Tome is Damaged</h2>
            <p className="font-serif italic mb-2 text-[#b8a594]">A magical disturbance prevents this subject from opening.</p>
            <div className="bg-black/20 p-4 rounded-lg my-6 max-w-lg w-full overflow-auto border border-[#5a4030]">
                <code className="text-xs text-red-300 font-mono">
                    {this.state.error?.message || 'Unknown Error'}
                </code>
            </div>
            <button 
                onClick={() => window.location.href = '/subjects'}
                className="px-8 py-3 bg-[#5a4030] text-[#d4b483] rounded-xl hover:bg-[#6d4c3d] transition-colors border border-[#d4b483]/20 font-bold uppercase tracking-widest text-xs"
            >
                Return to Library
            </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const SubjectDetailContent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { subjects, topics, loadSubjects, loadAllTopics, addTopic, deleteSubject, getSubjectProgress, getTodayTaskStatus, markDayComplete, isLoading } = useSubjectStore();
  
  const [newTopicName, setNewTopicName] = useState('');
  const [isRecurringTask, setIsRecurringTask] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isBurnModalOpen, setIsBurnModalOpen] = useState(false);
  
  const [chapters, setChapters] = useState<Subject[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());
  const [isLoadingChapters, setIsLoadingChapters] = useState(true);

  // Parse ID and find subject directly
  const subjectId = Number(id);
  const isValidId = !isNaN(subjectId) && subjectId > 0;
  // Use a safe find with optional chaining in case subjects is undefined (though store init should prevent this)
  const subject = subjects?.find(s => s.id === subjectId);

  // Initial Data Load
  useEffect(() => {
    const bootstrapData = async () => {
        // Always load fresh data on mount to ensure sync changes are reflected
        await loadSubjects();
        await loadAllTopics();
    };
    
    bootstrapData();
    
    // Set body background to match the subject theme to prevent light color showing on overscroll
    const originalBg = document.body.style.backgroundColor;
    const originalTransition = document.body.style.transition;
    document.body.style.backgroundColor = '#2d1b10';
    document.body.style.transition = 'background-color 0s'; // Instant change for this page
    
    return () => {
        document.body.style.backgroundColor = originalBg;
        document.body.style.transition = originalTransition;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch Chapters
  useEffect(() => {
    let isMounted = true;
    
    const fetchChapters = async () => {
        if (!isValidId) return;
        if (isMounted) setIsLoadingChapters(true);
        try {
            const childSubjects = await db.subjects.where('parentId').equals(subjectId).toArray();
            if (isMounted) {
                setChapters(childSubjects);
                if (childSubjects.length > 0) {
                    setExpandedChapters(new Set([childSubjects[0].id!]));
                }
            }
        } catch (error) {
            console.error("Failed to fetch chapters:", error);
        } finally {
            if (isMounted) setIsLoadingChapters(false);
        }
    };

    fetchChapters();
    
    return () => { isMounted = false; };
  }, [subjectId, isValidId]);

  // Recursive helper to get all descendant IDs
  const getAllDescendantIds = (subjectId: number, allSubjects: Subject[]): number[] => {
    const directChildren = allSubjects.filter(s => s.parentId === subjectId);
    let ids = directChildren.map(s => s.id!).filter(Boolean);
    for (const child of directChildren) {
      if (child.id) {
        ids = [...ids, ...getAllDescendantIds(child.id, allSubjects)];
      }
    }
    return ids;
  };

  // Filter topics for current subject and its entire subtree
  const relevantTopics = useMemo(() => {
     if (!isValidId || !topics || !subjects) return [];
     const descendantIds = getAllDescendantIds(subjectId, subjects);
     const idsToMatch = [subjectId, ...descendantIds];
     return topics.filter(t => t && idsToMatch.includes(t.subjectId));
  }, [topics, subjects, subjectId, isValidId]);

  const toggleChapter = (chapterId: number) => {
    setExpandedChapters((prev: Set<number>) => {
        const next = new Set(prev);
        if (next.has(chapterId)) next.delete(chapterId);
        else next.add(chapterId);
        return next;
    });
  };


  // Loading State
  if (isLoading || ((!subjects || subjects.length === 0) && !subject)) {
     return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#2d1b10] text-[#d4b483]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4b483] mb-4"></div>
            <p className="font-serif text-lg animate-pulse">Summoning Tome...</p>
        </div>
     );
  }

  // Error/Not Found State
  if (!subject) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#2d1b10] text-[#b8a594]">
            <div className="text-6xl mb-4 opacity-50">📜</div>
            <h2 className="text-2xl font-bold font-serif mb-2">Tome Not Found</h2>
            <p className="font-serif italic mb-6">The subject you seek ({id}) cannot be found in the archives.</p>
            <button 
                onClick={() => navigate('/subjects')}
                className="px-6 py-2 bg-[#5a4030] text-[#d4b483] rounded-lg hover:bg-[#6d4c3d] transition-colors"
            >
                Return to Library
            </button>
        </div>
      );
  }

  const handleAddTopic = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTopicName.trim()) return;
      if (!subject?.id) {
          console.error("No subject ID found for topic addition");
          return;
      }
      
      const topicData: Omit<Topic, 'id'> = {
          subjectId: subject.id!,
          name: newTopicName,
          status: 'not-started',
          isCompleted: false,
          learningProgress: 0,
          revisionCount: 0,
          masteryLevel: 0,
          isRecurring: isRecurringTask,
          completionDates: [],
      };

      try {
        await addTopic(topicData);
        // Force reload to ensure UI updates if store update wasn't sufficient
        await loadAllTopics(); 
        setNewTopicName('');
        setIsRecurringTask(false);
      } catch (error) {
        console.error("Failed to add topic:", error);
      }
  };

  const handleMarkDayComplete = async () => {
    if (!subject.planStartDate || !subject.revisionPlanDuration) return;
    
    const now = Date.now();
    const daysSinceStart = Math.floor((now - subject.planStartDate) / (1000 * 60 * 60 * 24));
    const currentDay = daysSinceStart + 1;
    
    try {
      await markDayComplete(subject.id!, currentDay);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    } catch (error) {
      console.error('Failed to mark day complete:', error);
    }
  };

  const handleDeleteSubject = () => {
      setIsBurnModalOpen(true);
  };

  const confirmBurnSubject = async () => {
    if (subject.id) {
        const subjectIdToDelete = subject.id;
        // Navigate away FIRST to prevent white screen
        navigate('/subjects');
        // Then delete asynchronously
        setTimeout(async () => {
            await deleteSubject(subjectIdToDelete);
        }, 100);
    }
  };

  // Progress calculations
  const totalTopics = relevantTopics?.length || 0;
  const completedTopicsCount = relevantTopics?.filter((t: Topic) => t.isCompleted || t.status === 'completed').length || 0;
  const progressPercentage = totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;

  const hasRevisionPlan = subject && subject.revisionPlanDuration && subject.planStartDate;
  
  // Safe calls to store methods
  const planProgress = subject?.id ? getSubjectProgress(subject.id) : { completed: 0, total: 0, percentage: 0 };
  const todayStatus = subject?.id ? getTodayTaskStatus(subject.id) : 'none';



  return (
    <div className="min-h-screen -m-4 md:-m-8 lg:-m-12 p-4 md:p-8 lg:p-12 bg-[#2d1b10] text-[#fdf5e6] font-sans selection:bg-[#d4b483] selection:text-[#1a120b]">
        {/* Background Texture */}
        <div className="fixed inset-0 pointer-events-none z-0" style={{
            backgroundImage: `url('https://www.transparenttextures.com/patterns/wood-pattern.png')`,
            opacity: 0.08
        }} />
        <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border-b border-[#C6A477]/20 pb-4 md:pb-8">
                <div className="flex items-center gap-3 md:gap-4">
                    <button 
                        onClick={() => navigate('/subjects')}
                        className="p-1.5 md:p-3 text-[#d4b483]/70 hover:text-[#d4b483] hover:bg-[#d4b483]/10 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 md:w-7 md:h-7" />
                    </button>
                    
                    <div className="flex items-center gap-3 md:gap-4 flex-1">
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-[#3d2b1f] border border-[#d4b483]/30 rounded-lg md:rounded-xl flex-shrink-0 flex items-center justify-center text-[#d4b483]">
                            <BookOpen className="w-4 h-4 md:w-6 md:h-6" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl md:text-4xl font-serif font-bold text-[#fdf5e6] dark:text-neon-indigo tracking-tight truncate drop-shadow-md">{subject?.name || 'Untitled Subject'}</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[#b8a594] text-[8px] md:text-xs font-mono uppercase tracking-widest truncate">Studium Archivum</span>
                                <span className="w-0.5 h-0.5 rounded-full bg-[#d4b483]/30 flex-shrink-0" />
                                <span className="text-[#d4b483] text-[8px] md:text-xs font-bold uppercase tracking-widest flex-shrink-0">{totalTopics} Topics</span>
                            </div>
                        </div>
                    </div>

                    <div className="md:hidden ml-auto">
                        <button 
                            onClick={handleDeleteSubject}
                            className="p-1.5 rounded-full hover:bg-red-500/10 transition-colors"
                        >
                            <Trash2 size={18} className="text-[#b8a594]/50 hover:text-red-500" />
                        </button>
                    </div>
                </div>

                {/* Main Progress Widget */}
                <div className="flex items-center gap-3 md:gap-6 bg-[#3d2b1f] p-3 md:p-4 rounded-xl md:rounded-2xl border border-[#5a4030] shadow-xl md:ml-auto w-full md:w-auto">
                    <div className="relative w-10 h-10 md:w-16 md:h-16 flex-shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-black/20" />
                            <circle 
                                cx="32" cy="32" r="28" 
                                stroke="#d4b483" strokeWidth="4" 
                                fill="transparent" 
                                strokeDasharray={175.93} 
                                strokeDashoffset={175.93 - (175.93 * (progressPercentage || 0)) / 100} 
                                className="transition-all duration-1000 ease-out dark:neon-progress-indigo"
                                strokeLinecap="round"
                            />
                        </svg>
                    <span className="absolute text-[10px] md:text-sm font-bold text-[#d4b483] dark:text-neon-indigo">{progressPercentage}%</span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-[8px] md:text-[10px] text-[#b8a594] font-black uppercase tracking-[0.2em] mb-0.5">Completion</p>
                        <div className="text-base md:text-xl font-serif text-[#fdf5e6] font-bold truncate">
                            {completedTopicsCount} <span className="text-[#b8a594] text-[10px] md:text-sm font-normal">/ {totalTopics} Verified</span>
                        </div>
                    </div>
                </div>

                <div className="hidden md:block">
                    <button 
                        onClick={handleDeleteSubject}
                        className="group relative p-2 rounded-full hover:bg-red-500/10 transition-all duration-300"
                        title="Burn Book"
                    >
                        <Trash2 size={20} className="text-[#b8a594] group-hover:text-red-500 transition-colors" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Plan */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Revision Plan Widget */}
                    {hasRevisionPlan ? (
                         <div className="relative p-6 rounded-lg bg-[#3d2b1f] border border-[#5a4030] overflow-hidden shadow-inner shadow-black/20">
                             {showCelebration && (
                                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
                                    <div className="text-center">
                                    <div className="text-5xl mb-4 animate-bounce">📜</div>
                                    <p className="text-xl font-serif text-[#d4b483]">Day Complete!</p>
                                    </div>
                                </div>
                              )}
                             
                             <div className="flex items-center justify-between mb-6">
                                 <h3 className="text-[#d4b483] font-serif text-lg">Revision Plan</h3>
                                 <Calendar className="text-[#b8a594]" size={18} />
                             </div>
                             
                             <div className="space-y-4">
                                 <div className="flex justify-between items-center bg-black/20 p-3 rounded border border-[#d4b483]/10">
                                     <span className="text-[#b8a594] text-sm">Progress</span>
                                     <span className="text-[#d4b483] font-mono">{planProgress.completed} / {planProgress.total} days</span>
                                 </div>
                                 
                                  {todayStatus === 'pending' ? (
                                    <button
                                      onClick={handleMarkDayComplete}
                                      className="w-full py-3 rounded bg-[#5a4030] hover:bg-[#6d4c3d] text-[#d4b483] border border-[#d4b483]/30 transition-all flex items-center justify-center gap-2 group"
                                    >
                                      <CheckCircle2 size={18} className="group-hover:text-green-500 transition-colors" />
                                      <span className="text-sm font-bold uppercase tracking-wide">Mark Day Done</span>
                                    </button>
                                  ) : todayStatus === 'completed' ? (
                                    <div className="w-full py-3 rounded bg-[#2d1b10] border border-green-900/50 text-green-600/80 font-bold text-sm flex items-center justify-center gap-2">
                                      <CheckCircle2 size={18} />
                                      <span>COMPLETED</span>
                                    </div>
                                  ) : (
                                    <div className="text-center py-2 text-[#b8a594] text-xs uppercase tracking-widest text-shadow-sm">
                                      Plan Finished
                                    </div>
                                  )}
                             </div>
                         </div>
                    ) : (
                        <div className="p-8 rounded-xl bg-[#3d2b1f]/30 border-2 border-dashed border-[#5a4030] text-center group hover:bg-[#3d2b1f]/50 transition-colors">
                            <div className="w-12 h-12 bg-[#3d2b1f] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#d4b483]/10 text-[#b8a594]">
                                <Calendar size={20} />
                            </div>
                            <p className="text-[#b8a594] text-sm mb-4 font-serif italic">No active revision plan found for this tome.</p>
                            <button
                              onClick={() => setIsRevisionModalOpen(true)}
                              className="px-6 py-2 bg-[#5a4030] text-[#d4b483] text-xs font-bold uppercase tracking-widest rounded border border-[#d4b483]/20 hover:bg-[#6d4c3d] hover:border-[#d4b483]/40 transition-all shadow-lg"
                            >
                              Inscribe Plan
                            </button>
                        </div>
                    )}

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#3d2b1f] p-4 rounded-xl border border-[#5a4030] text-center">
                            <span className="block text-[#b8a594] text-[10px] uppercase tracking-widest mb-1">Topics</span>
                            <span className="text-2xl font-serif text-[#d4b483] font-bold">{totalTopics}</span>
                        </div>
                        <div className="bg-[#3d2b1f] p-4 rounded-xl border border-[#5a4030] text-center">
                            <span className="block text-[#b8a594] text-[10px] uppercase tracking-widest mb-1">Chapters</span>
                            <span className="text-2xl font-serif text-[#d4b483] font-bold">{chapters.length}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Topics & Chapters */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Add Topic Bar */}
                    <div className="bg-[#3d2b1f] p-0.5 md:p-1 rounded-lg md:rounded-xl border border-[#5a4030] shadow-2xl sticky top-4 md:top-6 z-30 ring-1 ring-[#d4b483]/5">
                        <form onSubmit={handleAddTopic} className="relative flex items-center">
                            <input 
                                type="text" 
                                value={newTopicName}
                                onChange={(e) => setNewTopicName(e.target.value)}
                                placeholder="Inscribe topic..."
                                className="w-full bg-transparent text-[#fdf5e6] placeholder-[#b8a594]/50 px-3 md:px-5 py-3 md:py-4 outline-none font-serif text-sm md:text-lg"
                            />
                            <div className="flex items-center pr-2 md:pr-3 gap-2 md:gap-3">
                                <label className="flex items-center gap-1.5 md:gap-2 cursor-pointer group px-2 py-1 md:py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                                    <input 
                                        type="checkbox" 
                                        checked={isRecurringTask}
                                        onChange={(e) => setIsRecurringTask(e.target.checked)}
                                        className="w-3.5 h-3.5 md:w-4 md:h-4 rounded border-[#b8a594]/40 bg-transparent text-[#d4b483] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#d4b483]"
                                    />
                                    <span className="text-[8px] md:text-[10px] text-[#b8a594] group-hover:text-[#d4b483] transition-colors uppercase tracking-[0.2em] font-black">Daily</span>
                                </label>
                                <button 
                                    type="submit"
                                    disabled={!newTopicName.trim()}
                                    className="p-2 md:p-3 bg-[#d4b483] text-[#1a120b] rounded-md md:rounded-lg hover:bg-[#fffbf0] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
                                >
                                    <Plus className="w-4 h-4 md:w-5 md:h-5" strokeWidth={3} />
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="space-y-4">
                        {isLoadingChapters ? (
                            <div className="text-center py-10 opacity-50 font-serif italic">Loading pages...</div>
                        ) : chapters && chapters.length > 0 ? (
                            // Chaptered View
                            chapters.filter(c => c && c.id).map((chapter, index) => {
                                 const chapterId = chapter.id!;
                                 // Aggregate topics for this chapter AND all its descendants
                                 const descendantIds = subjects ? [chapterId, ...getAllDescendantIds(chapterId, subjects)] : [chapterId];
                                 const chapterTopics = relevantTopics.filter(t => descendantIds.includes(t.subjectId));
                                 
                                 const isExpanded = expandedChapters.has(chapterId);
                                 const chapterCompleted = chapterTopics.filter(t => t?.isCompleted || t?.status === 'completed').length;
                                 const chapterTotal = chapterTopics.length;
                                 const chapterPercent = chapterTotal > 0 ? Math.round((chapterCompleted / chapterTotal) * 100) : 0;
                                 
                                 // Check if this "chapter" has its own children (nested hierarchy)
                                 const subChapters = subjects?.filter(s => s.parentId === chapterId) || [];
                                 const hasSubChapters = subChapters.length > 0;
                                 
                                 const chapterNumber = chapter.name ? (chapter.name.match(/\d+/)?.[0] || (index + 1).toString()) : (index + 1).toString();

                                return (
                                    <div key={`chapter-${chapterId}`} className="bg-[#3d2b1f]/60 border border-[#5a4030] rounded-xl overflow-hidden transition-all duration-300">
                                        <button 
                                            onClick={() => toggleChapter(chapterId)}
                                            className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-black/40 rounded-lg flex items-center justify-center text-[#d4b483]/70 group-hover:text-[#d4b483] transition-colors relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-[#d4b483]/10 to-transparent" />
                                                    <span className="relative font-bold font-serif">{chapterNumber}</span>
                                                </div>
                                                <div className="text-left">
                                                    <h4 className="text-lg font-serif font-bold text-[#fdf5e6] tracking-wide">{chapter.name || 'Untitled Chapter'}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="w-24 h-1 bg-black/40 rounded-full overflow-hidden">
                                                            <div className="h-full bg-[#d4b483]/50 dark:bg-indigo-500/50 dark:neon-progress-indigo" style={{ width: `${chapterPercent}%` }} />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-[#b8a594] uppercase tracking-widest">{chapterCompleted}/{chapterTotal} Tasks</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                        </button>
                                        
                                        {isExpanded && (
                                             <div className="p-4 pt-0 space-y-2 bg-black/10 animate-fade-in divide-y divide-[#5a4030]/20">
                                                 {hasSubChapters ? (
                                                     /* Render Nested Sub-Chapters */
                                                     subChapters.map(sub => {
                                                         const subTopics = relevantTopics.filter(t => t.subjectId === sub.id);
                                                         return (
                                                             <div key={`sub-${sub.id}`} className="py-3 first:pt-2">
                                                                 <div className="flex items-center gap-2 mb-2 px-1">
                                                                     <span className="text-[10px] bg-[#d4b483]/10 text-[#d4b483] px-1.5 py-0.5 rounded border border-[#d4b483]/20 font-bold tracking-widest uppercase">Chapter Part</span>
                                                                     <h5 className="text-sm font-serif font-bold text-[#d4b483]/80">{sub.name}</h5>
                                                                 </div>
                                                                 <div className="space-y-2 pl-2 border-l border-[#d4b483]/10">
                                                                     {subTopics.length > 0 ? (
                                                                         subTopics.map(topic => (
                                                                             <TopicItem key={`topic-${topic.id}`} topic={{...topic, status: (topic.isCompleted ? 'completed' : topic.status)}} />
                                                                         ))
                                                                     ) : (
                                                                         <div className="text-[10px] text-[#b8a594]/30 italic pl-2">No items inscribed.</div>
                                                                     )}
                                                                 </div>
                                                             </div>
                                                         );
                                                     })
                                                 ) : (
                                                     /* Render Immediate Topics */
                                                     chapterTopics.length > 0 ? (
                                                         chapterTopics.map((topic: Topic) => (
                                                             topic && topic.id ? (
                                                                 <TopicItem 
                                                                     key={`topic-${topic.id}`} 
                                                                     topic={{...topic, status: (topic.isCompleted ? 'completed' : topic.status)}} 
                                                                 />
                                                             ) : null
                                                         ))
                                                     ) : (
                                                         <div className="p-8 text-center text-[#b8a594]/50 font-serif italic text-sm">No topics inscribed in this chapter.</div>
                                                     )
                                                 )}
                                             </div>
                                         )}
                                    </div>
                                );
                            })
                        ) : (
                            // Flat View (No Chapters)
                            <div className="space-y-3">
                                {relevantTopics && relevantTopics.length > 0 ? (
                                    relevantTopics.map((topic: Topic) => (
                                        topic && topic.id ? (
                                            <TopicItem 
                                                key={`flat-topic-${topic.id}`} 
                                                topic={{...topic, status: (topic.isCompleted ? 'completed' : topic.status)}} 
                                            />
                                        ) : null
                                    ))
                                ) : (
                                    <div className="text-center py-20 border-2 border-dashed border-[#5a4030] rounded-2xl bg-[#3a281e]/30 shadow-inner">
                                        <div className="text-4xl mb-4 opacity-20 filter grayscale">📜</div>
                                        <p className="text-[#b8a594] font-serif italic text-lg">The pages of this volume are empty...</p>
                                        <p className="text-[#b8a594]/60 text-sm mt-2 uppercase tracking-widest">Inscribe a topic above to begin.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <RevisionPlanModal 
          isOpen={isRevisionModalOpen}
          onClose={() => setIsRevisionModalOpen(false)}
          subject={subject}
        />

        {/* Burn Warning Modal */}
        {isBurnModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setIsBurnModalOpen(false)} />
                <div className="relative w-full max-w-md bg-[#1a120b] border-2 border-red-900/50 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.2)] overflow-hidden animate-slide-up">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-20" />
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-red-900/20 to-transparent pointer-events-none" />
                    
                    <div className="relative p-8 text-center space-y-6">
                        <div className="w-16 h-16 bg-red-900/10 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-red-500/30">
                            <Trash2 size={32} className="text-red-500" />
                        </div>
                        
                        <div>
                            <h3 className="text-2xl font-serif font-bold text-red-500 mb-2 tracking-wide">Incinerate this Tome?</h3>
                            <p className="text-[#8d7b68] text-sm leading-relaxed font-serif">
                                You are about to burn <span className="text-[#C6A477] font-bold">"{subject.name}"</span>. 
                                <br/>All knowledge, progress, and history will be reduced to ash.
                            </p>
                            <p className="text-red-500/60 text-[10px] mt-6 font-black uppercase tracking-[0.2em]">
                                Irreversible Action
                            </p>
                        </div>

                        <div className="flex gap-4 pt-2">
                            <button 
                                onClick={() => setIsBurnModalOpen(false)}
                                className="flex-1 py-4 px-4 rounded-xl bg-[#231710] text-[#8d7b68] hover:bg-[#2b1d16] hover:text-[#C6A477] transition-all font-bold text-xs uppercase tracking-widest border border-white/5"
                            >
                                Extinguish
                            </button>
                            <button 
                                onClick={confirmBurnSubject}
                                className="flex-1 py-4 px-4 rounded-xl bg-red-900/20 text-red-500 border border-red-500/30 hover:bg-red-900/40 hover:text-red-400 transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-900/20"
                            >
                                Burn It
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export const SubjectDetail: React.FC = () => {
    return (
        <ErrorBoundary>
            <SubjectDetailContent />
        </ErrorBoundary>
    );
};