import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useSubjectStore } from '../../store/useSubjectStore';
import { SubjectVisual } from '../subjects/SubjectVisual';

interface StudyTracksWidgetProps {
  subjects: any[];
  topics: any[];
}

export const StudyTracksWidget: React.FC<StudyTracksWidgetProps> = ({ subjects, topics }) => {
  const imatParent = subjects.find(s => s.name === 'IMAT Prep');
  const mdcatParent = subjects.find(s => s.name.includes('MDCAT'));

  const calculateProgress = (parentId?: number) => {
    const childSubjects = subjects.filter(s => s.parentId === parentId);
    if (childSubjects.length === 0) return 0;
    
    // Get all relevant subject IDs (including nested children if any)
    const childIds = childSubjects.map(s => s.id).filter(Boolean);
    const chapters = subjects.filter(s => s.parentId && childIds.includes(s.parentId));
    const chapterIds = chapters.map(c => c.id).filter(Boolean);
    const allRelevantIds = [...childIds, ...chapterIds];
    
    // Get topics for these subjects
    const subjectTopics = topics.filter(t => t.subjectId && allRelevantIds.includes(t.subjectId));
    if (subjectTopics.length === 0) return 0;
    
    const completed = subjectTopics.filter(t => t.isCompleted).length;
    return Math.round((completed / subjectTopics.length) * 100);
  };

  const imatProgress = calculateProgress(imatParent?.id);

  const isSubjectNew = useSubjectStore((state) => state.isSubjectNew);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
        {/* MDCAT Card */}
        {/* MDCAT Card */}
        <NavLink to="/mdcat" className="group relative overflow-hidden bg-gradient-to-br from-white to-rose-50 dark:from-slate-900 dark:to-rose-950/20 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] p-5 sm:p-6 md:p-8 border-2 border-rose-100 dark:border-rose-900/30 shadow-lg shadow-rose-500/10 hover:shadow-2xl hover:shadow-rose-500/20 hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-400/20 to-transparent rounded-full blur-2xl" />
          {mdcatParent && <SubjectVisual subject={mdcatParent} size="sm" showNewBadge={isSubjectNew(mdcatParent)} className="mb-3 sm:mb-4 relative z-10 scale-[1.0] sm:scale-[1.1] origin-top-left" />}
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-1 bg-gradient-to-r from-rose-600 to-rose-500 bg-clip-text text-transparent">MDCAT</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm md:text-base mb-4 sm:mb-6 leading-tight">Medical & Dental</p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
            <span className="text-[10px] sm:text-xs font-bold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 px-2 sm:px-3 py-1 rounded-full">1 Subject</span>
            <span className="text-[10px] sm:text-xs font-black text-rose-600 dark:text-rose-400 uppercase flex items-center gap-1">Start <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" /></span>
          </div>
        </NavLink>

        {/* IMAT Card */}
        {/* IMAT Card */}
        <NavLink to="/imat" className="group relative overflow-hidden bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-emerald-950/20 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] p-5 sm:p-6 md:p-8 border-2 border-emerald-100 dark:border-emerald-900/30 shadow-lg shadow-emerald-500/10 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-2xl" />
          {imatParent && <SubjectVisual subject={imatParent} size="sm" showNewBadge={isSubjectNew(imatParent)} className="mb-3 sm:mb-4 relative z-10 scale-[1.0] sm:scale-[1.1] origin-top-left" />}
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-1 bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">IMAT</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm md:text-base mb-4 sm:mb-6 leading-tight">International Med</p>
          
          <div className="w-full bg-emerald-100 dark:bg-emerald-900/30 rounded-full h-1.5 mb-4 sm:mb-6">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000" 
              style={{ width: `${imatProgress}%` }}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
            <span className="text-[10px] sm:text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 sm:px-3 py-1 rounded-full truncate">4 Subjects</span>
            <span className="text-[10px] sm:text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1 whitespace-nowrap">Go <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" /></span>
          </div>
        </NavLink>
      </div>
    </div>
  );
};
