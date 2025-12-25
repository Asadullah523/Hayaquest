import React, { useState, useMemo, useEffect } from 'react';
import { X, Calendar, BookOpen, ChevronRight, Check, Clock, ChevronDown } from 'lucide-react';
import { useSubjectStore } from '../../store/useSubjectStore';
import { useLogStore } from '../../store/useLogStore';
import { SubjectVisual } from '../subjects/SubjectVisual';

interface LogSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogSessionModal: React.FC<LogSessionModalProps> = ({ isOpen, onClose }) => {
  const { subjects, topics, isSubjectNew, loadSubjects, loadAllTopics } = useSubjectStore();
  const { addLog } = useLogStore();

  useEffect(() => {
    if (isOpen) {
      loadSubjects();
      loadAllTopics();
    }
  }, [isOpen, loadSubjects, loadAllTopics]);
  const [step, setStep] = useState(1);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [duration, setDuration] = useState(25);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Re-introduced state for Step 2
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);

  const selectedSubjectData = subjects.find(s => s.id === selectedSubject);

  // ... (keep existing displaySubjects and hierarchy logic)
  const displaySubjects = useMemo(() => {
    // Show ONLY root subjects (no parentId), matching SubjectList.tsx
    return subjects
      .filter(s => !s.parentId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [subjects]);

  const hierarchy = useMemo(() => {
      if (!selectedSubjectData || !selectedSubjectData.id) return [];
      
      const rootSubjectId = selectedSubjectData.id;

      // Recursive helper to get all descendant IDs for a subject
      const getAllDescendantIds = (id: number): number[] => {
          const children = subjects.filter(s => s.parentId === id);
          let ids = children.map(s => s.id!).filter(Boolean);
          children.forEach(child => {
              if (child.id) {
                  ids = [...ids, ...getAllDescendantIds(child.id)];
              }
          });
          return ids;
      };

      // Chapters are direct children of the selected root subject
      const immediateChapters = subjects.filter(s => s.parentId === rootSubjectId);
      
      // Topics directly under the root subject (not in any chapter)
      const rootTopics = topics.filter(t => t.subjectId === rootSubjectId);

      const chapterGroups: { id: number, name: string, isChapter: boolean, topics: typeof topics }[] = [];

      // 1. Handle direct topics first
      if (rootTopics.length > 0) {
          chapterGroups.push({
              id: -1,
              name: 'General Topics',
              isChapter: false,
              topics: rootTopics
          });
      }

      // 2. Handle immediate chapters and their nested topics
      immediateChapters.forEach(chapter => {
          // Get topics for this chapter AND all its descendants (for nested hierarchy)
          const chapterDescendants = [chapter.id!, ...getAllDescendantIds(chapter.id!)];
          const chapterTopics = topics.filter(t => chapterDescendants.includes(t.subjectId));
          
          if (chapterTopics.length > 0) {
              chapterGroups.push({
                  id: chapter.id!,
                  name: chapter.name,
                  isChapter: true,
                  topics: chapterTopics
              });
          }
      });

      return chapterGroups;
  }, [selectedSubjectData, subjects, topics]); 

  if (!isOpen) return null;

  const handleNext = () => {
    setErrorMessage(null);
    setStep(step + 1);
  };

  const handleBack = () => {
    setErrorMessage(null);
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    console.log("Confirm Clicked");
    if (!selectedSubject) {
        setErrorMessage("Please select a subject.");
        return;
    }
    // Topic is no longer required
    
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
        const now = Date.now();
        console.log("Adding log...", { selectedSubject, duration });
        
        await addLog({
            subjectId: selectedSubject,
            topicId: selectedTopic || undefined, 
            durationSeconds: duration * 60,
            date: now,
            timestamp: now,
            type: 'focus',
            mode: 'focus'
        } as any);

        console.log("Log added successfully");
        
        setIsSubmitting(false);
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
          setStep(1);
          setIsSuccess(false);
          setErrorMessage(null);
          setSelectedSubject(null);
          setSelectedTopic(null);
          setExpandedChapter(null);
        }, 2000);
    } catch (error) {
        console.error("Failed to log session", error);
        setIsSubmitting(false);
        setErrorMessage("Failed to save session. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-white/20 overflow-hidden animate-premium-fade-in max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white">Log Study Session</h2>
            <p className="text-[10px] md:text-sm text-slate-400 font-bold uppercase tracking-widest">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
            <X size={20} className="md:w-6 md:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 md:p-8 min-h-[350px] md:min-h-[400px]">
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-2 animate-fade-in">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                {errorMessage}
            </div>
          )}

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 py-12 animate-fade-in">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mb-4 scale-up">
                <Check size={40} strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">Session Logged!</h3>
              <p className="text-slate-400 font-medium text-center">Great job, Champion. Your progress has been updated.</p>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex items-center justify-center">
                       <BookOpen size={20} />
                    </div>
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Select Subject</label>
                  </div>
                  <div className="grid grid-cols-1 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {displaySubjects.map(subject => (
                      <button
                        key={subject.id}
                        onClick={() => {
                          setSelectedSubject(subject.id!);
                        }}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all hover:scale-[1.02] active:scale-95 ${
                          selectedSubject === subject.id 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-800' 
                            : 'bg-white border-slate-100 hover:border-indigo-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <SubjectVisual subject={subject} size="sm" showNewBadge={isSubjectNew(subject)} />
                          <span className="font-bold text-sm md:text-base">{subject.name}</span>
                        </div>
                        {selectedSubject === subject.id && <Check size={18} className="animate-premium-fade-in md:w-5 md:h-5" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl flex items-center justify-center">
                       <Clock size={20} />
                    </div>
                    <div>
                        <label className="text-sm font-black text-slate-400 uppercase tracking-widest block leading-none">Focus Topic</label>
                        <p className="text-xs text-slate-400 font-medium mt-1">Select a topic from {selectedSubjectData?.name} (Optional)</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {hierarchy.length > 0 ? (
                       hierarchy.map(group => (
                          <div key={group.id} className="space-y-2">
                              {/* Chapter Header */}
                              {group.isChapter && (
                                  <button 
                                    onClick={() => setExpandedChapter(expandedChapter === group.id ? null : group.id as number)}
                                    className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                  >
                                      <span className="text-xs font-black uppercase tracking-wider text-slate-500">{group.name}</span>
                                      <ChevronDown size={14} className={`text-slate-400 transition-transform ${expandedChapter === group.id ? 'rotate-180' : ''}`} />
                                  </button>
                              )}
                              
                              {/* Topics List - Show if direct or if chapter is expanded */}
                              {(!group.isChapter || expandedChapter === group.id) && (
                                  <div className="grid grid-cols-1 gap-2 pl-2">
                                      {group.topics.map(topic => (
                                          <button
                                            key={topic.id}
                                            onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id!)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                                                selectedTopic === topic.id 
                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800' 
                                                : 'bg-white border-slate-100 hover:border-emerald-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700'
                                            }`}
                                          >
                                              <span className="text-sm font-bold text-left">{topic.name}</span>
                                              {selectedTopic === topic.id && <Check size={16} className="animate-premium-fade-in" />}
                                          </button>
                                      ))}
                                  </div>
                              )}
                          </div>
                       ))
                    ) : (
                        <div className="py-12 text-center text-slate-400 italic">
                            No topics found. You can still log a session for the book!
                        </div>
                    )}
                  </div>
                </div>
              )}


              {step === 3 && (
                <div className="space-y-10 animate-fade-in py-4">
                  <div className="text-center space-y-2">
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Session Duration</p>
                    <div className="text-6xl font-black text-indigo-600 tracking-tighter tabular-nums">
                        {duration}<span className="text-2xl text-slate-300">m</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4 px-2 md:px-4">
                    <input 
                      type="range"
                      min="5"
                      max="120"
                      step="5"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full accent-indigo-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <span>5m</span>
                       <span>60m</span>
                       <span>120m</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                     <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                        <Calendar size={24} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Logging for</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                     </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!isSuccess && (
          <div className="p-5 md:p-8 pt-0 flex gap-3 md:gap-4">
            {step > 1 && (
              <button 
                onClick={handleBack}
                className="flex-1 py-3 md:py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl md:rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95 text-sm md:text-base"
              >
                Back
              </button>
            )}
            <button 
              onClick={step === 3 ? handleSubmit : handleNext}
              disabled={isSubmitting || (step === 1 && !selectedSubject)}
              className={`flex-[2] py-3 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 text-sm md:text-base ${
                isSubmitting || (step === 1 && !selectedSubject)
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-700'
              }`}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : step === 3 ? (
                'Confirm & Log'
              ) : (
                <>Next Step <ChevronRight size={18} className="md:w-5 md:h-5" /></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
