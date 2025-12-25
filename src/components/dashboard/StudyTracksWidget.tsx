import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Target } from 'lucide-react';
import { SubjectVisual } from '../subjects/SubjectVisual';
import { useSubjectStore } from '../../store/useSubjectStore';
import type { Subject } from '../../types';

interface StudyTracksWidgetProps {
  subjects: Subject[];
  topics: any[]; // Using any[] to match store type if not fully typed, but preferably Topic[]
}

export const StudyTracksWidget: React.FC<StudyTracksWidgetProps> = ({ subjects, topics }) => {
  const { isSubjectNew } = useSubjectStore();

  const imatParent = subjects.find(s => s.name === 'IMAT Prep');
  const mdcatParent = subjects.find(s => s.name === 'MDCAT Prep');

  const calculateProgress = (parentId?: number) => {
    const childSubjects = subjects.filter(s => s.parentId === parentId);
    if (childSubjects.length === 0) return 0;
    const childIds = childSubjects.map(s => s.id).filter(Boolean);
    const chapters = subjects.filter(s => s.parentId && childIds.includes(s.parentId));
    const chapterIds = chapters.map(c => c.id).filter(Boolean);
    const allRelevantIds = [...childIds, ...chapterIds];
    const subjectTopics = topics.filter(t => t.subjectId && allRelevantIds.includes(t.subjectId));
    if (subjectTopics.length === 0) return 0;
    const completed = subjectTopics.filter(t => t.isCompleted).length;
    return Math.round((completed / subjectTopics.length) * 100);
  };

  const imatProgress = calculateProgress(imatParent?.id);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Target size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
          Your Study Tracks
        </h2>
        <div className="h-1 flex-1 mx-4 bg-gradient-to-r from-indigo-200 via-purple-200 to-transparent dark:from-indigo-900 dark:via-purple-900 rounded-full max-w-[100px]" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        <NavLink to="/mdcat" className="group relative overflow-hidden bg-gradient-to-br from-white to-rose-50 dark:from-slate-900 dark:to-rose-950/20 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-3 sm:p-4 md:p-6 lg:p-8 border-2 border-rose-100 dark:border-rose-900/30 shadow-lg shadow-rose-500/10 hover:shadow-2xl hover:shadow-rose-500/20 hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-rose-400/20 to-transparent rounded-full blur-2xl" />
          {mdcatParent && <SubjectVisual subject={mdcatParent} size="sm" showNewBadge={isSubjectNew(mdcatParent)} className="mb-2 sm:mb-3 md:mb-4 lg:mb-6 relative z-10" />}
          <h3 className="text-sm sm:text-base md:text-xl lg:text-2xl font-black mb-1 bg-gradient-to-r from-rose-600 to-rose-500 bg-clip-text text-transparent">MDCAT</h3>
          <p className="text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] md:text-xs lg:text-sm mb-3 sm:mb-4 md:mb-6 lg:mb-8 leading-tight">Medical & Dental</p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-1 sm:gap-2">
            <span className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-bold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-full">1 Subject</span>
            <span className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-black text-rose-600 dark:text-rose-400 uppercase flex items-center gap-0.5 sm:gap-1 group-hover:gap-1.5 transition-all">Start <ArrowRight size={8} className="sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 group-hover:translate-x-0.5 transition-transform" /></span>
          </div>
        </NavLink>

        <NavLink to="/imat" className="group relative overflow-hidden bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-emerald-950/20 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-3 sm:p-4 md:p-6 lg:p-8 border-2 border-emerald-100 dark:border-emerald-900/30 shadow-lg shadow-emerald-500/10 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-2xl" />
          {imatParent && <SubjectVisual subject={imatParent} size="sm" showNewBadge={isSubjectNew(imatParent)} className="mb-2 sm:mb-3 md:mb-4 lg:mb-6 relative z-10" />}
          <h3 className="text-sm sm:text-base md:text-xl lg:text-2xl font-black mb-1 bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">IMAT</h3>
          <p className="text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] md:text-xs lg:text-sm mb-3 sm:mb-4 md:mb-6 lg:mb-8 leading-tight">International Med</p>
          
          <div className="w-full bg-emerald-100 dark:bg-emerald-900/30 rounded-full h-1.5 mb-3 sm:mb-4">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000" 
              style={{ width: `${imatProgress}%` }}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-1 sm:gap-2">
            <span className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-full truncate">4 Subjects</span>
            <span className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-0.5 sm:gap-1 whitespace-nowrap group-hover:gap-1.5 transition-all">Go <ArrowRight size={8} className="sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 group-hover:translate-x-0.5 transition-transform" /></span>
          </div>
        </NavLink>
      </div>
    </div>
  );
};
